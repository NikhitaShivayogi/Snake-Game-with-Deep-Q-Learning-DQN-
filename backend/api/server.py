"""
FastAPI Backend Server
Provides REST API and WebSocket endpoints for the Snake Game AI
"""

import os
# Set headless mode for pygame before any pygame imports
os.environ['SDL_VIDEODRIVER'] = 'dummy'

from fastapi import FastAPI, WebSocket, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import asyncio
import json
import torch
from pathlib import Path
from typing import Optional, Dict
from threading import Thread

from backend.game.snake_game import SnakeGame, Direction
from backend.agent.dqn_agent import DQNAgent
from backend.agent.environment import SnakeEnvironment
from backend.training.trainer import Trainer
from backend.visualization.charts import TrainingVisualizer

# Create FastAPI app
app = FastAPI(
    title="Snake Game AI API",
    description="API for Snake Game with DQN Reinforcement Learning",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global game instances
human_game: Optional[SnakeGame] = None
ai_game: Optional[SnakeEnvironment] = None
agent: Optional[DQNAgent] = None
trainer: Optional[Trainer] = None
visualizer: Optional[TrainingVisualizer] = None

# Training state
training_thread: Optional[Thread] = None
active_websockets: set = set()

# Model paths
MODELS_DIR = "./saved_models"
LOGS_DIR = "./training_logs"


def load_latest_model():
    """Load the latest saved model if available"""
    global agent, trainer
    
    if agent is None or trainer is None:
        return
    
    try:
        # Find the latest model file
        if not os.path.exists(MODELS_DIR):
            return
        
        model_files = [f for f in os.listdir(MODELS_DIR) if f.endswith('.pt')]
        if not model_files:
            return
        
        # Sort by modification time and get the latest
        model_files.sort(key=lambda f: os.path.getmtime(os.path.join(MODELS_DIR, f)), reverse=True)
        latest_model = model_files[0]
        model_path = os.path.join(MODELS_DIR, latest_model)
        
        print(f"Loading saved model: {latest_model}")
        trainer.load_model(model_path)
        
        # CRITICAL: Set epsilon to minimum for inference (no exploration)
        # This ensures the agent uses Q-network predictions, not random actions
        print(f"Before inference setup: epsilon = {agent.epsilon}")
        agent.epsilon = agent.epsilon_min
        print(f"After inference setup: epsilon = {agent.epsilon} (should be {agent.epsilon_min})")
        print(f"Model loaded successfully. Agent ready for AI play.")
        print(f"Agent will now use Q-network for decisions (epsilon = {agent.epsilon})")
    except Exception as e:
        print(f"Could not load model: {e}")
        import traceback
        traceback.print_exc()


def initialize():
    """Initialize the application"""
    global human_game, ai_game, agent, trainer, visualizer
    
    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(LOGS_DIR, exist_ok=True)
    
    # Initialize game and agent
    human_game = SnakeGame()
    ai_game = SnakeEnvironment()
    
    # Initialize DQN agent
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    agent = DQNAgent(
        state_size=11,
        action_size=4,
        learning_rate=0.0001,
        gamma=0.99,
        epsilon=1.0,
        epsilon_decay=0.95,
        epsilon_min=0.01,
        device=device
    )
    
    # Initialize trainer
    trainer = Trainer(agent, ai_game, save_dir=MODELS_DIR, log_dir=LOGS_DIR)
    visualizer = TrainingVisualizer(output_dir=LOGS_DIR)
    
    # Try to load the latest saved model
    load_latest_model()


@app.on_event("startup")
async def startup():
    """Initialize on startup"""
    initialize()


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "cuda_available": torch.cuda.is_available(),
        "device": 'cuda' if torch.cuda.is_available() else 'cpu'
    }


@app.get("/api/game/human/state")
async def get_human_game_state():
    """Get current human game state"""
    if human_game is None:
        raise HTTPException(status_code=500, detail="Game not initialized")
    return human_game.get_state()


@app.post("/api/game/human/reset")
async def reset_human_game():
    """Reset human game"""
    if human_game is None:
        raise HTTPException(status_code=500, detail="Game not initialized")
    human_game.reset()
    return human_game.get_state()


@app.post("/api/game/human/move")
async def move_human_snake(direction: str):
    """Move human snake - sets direction and executes one step"""
    if human_game is None:
        raise HTTPException(status_code=500, detail="Game not initialized")
    
    try:
        dir_enum = Direction[direction.upper()]
        human_game.set_direction(dir_enum)
        # Execute the step immediately
        reward, done, info = human_game.step()
        return {
            **human_game.get_state(),
            "reward": reward,
            "done": done,
            "info": info
        }
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid direction")


@app.post("/api/game/human/step")
async def human_game_step():
    """Execute one step of human game (snake moves automatically in current direction)"""
    if human_game is None:
        raise HTTPException(status_code=500, detail="Game not initialized")
    
    # Snake moves automatically in current direction
    reward, done, info = human_game.step()
    return {
        **human_game.get_state(),
        "reward": reward,
        "done": done,
        "info": info
    }


@app.get("/api/game/ai/state")
async def get_ai_game_state():
    """Get current AI game state"""
    if ai_game is None:
        raise HTTPException(status_code=500, detail="Game not initialized")
    return ai_game.get_state()


@app.post("/api/game/ai/reset")
async def reset_ai_game():
    """Reset AI game"""
    if ai_game is None:
        raise HTTPException(status_code=500, detail="Game not initialized")
    ai_game.reset()
    return ai_game.get_state()


@app.post("/api/game/ai/step")
async def step_ai_game(action: int):
    """Step AI game with given action"""
    if ai_game is None:
        raise HTTPException(status_code=500, detail="Game not initialized")
    
    if action < 0 or action >= 4:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    next_state, reward, done, info = ai_game.step(action)
    return {
        **ai_game.get_state(),
        "reward": reward,
        "done": done,
        "info": info
    }


@app.post("/api/game/ai/auto-play")
async def auto_play_ai(max_steps: int = 500):
    """Auto-play AI game - continues from current state or starts new game if needed"""
    try:
        if ai_game is None or agent is None:
            raise HTTPException(status_code=500, detail="Game not initialized")
        
        # Don't reset - continue from current state
        # Only reset if game is already over
        state = ai_game.get_state()
        if state.get('game_over', True):
            ai_game.reset()
        
        state = ai_game._get_state()
        total_reward = 0
        
        for _ in range(max_steps):
            # Use trained Q-network to select best action (no exploration)
            # select_action with training=False uses epsilon from agent, but we want pure exploitation
            # So we ensure epsilon is at minimum
            with torch.no_grad():
                state_tensor = torch.FloatTensor(state).unsqueeze(0).to(agent.device)
                q_values = agent.q_network(state_tensor)
                action = q_values.argmax(dim=1).item()
            
            next_state, reward, done, _ = ai_game.step(action)
            total_reward += reward
            state = next_state
            
            if done:
                break
        
        return {
            **ai_game.get_state(),
            "total_reward": total_reward,
            "score": ai_game.get_score()
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"{str(e)}\n{traceback.format_exc()}"
        raise HTTPException(status_code=500, detail=error_detail)


async def broadcast_training_update(message: dict):
    """Broadcast training update to all connected WebSocket clients"""
    disconnected = set()
    for ws in active_websockets:
        try:
            await ws.send_json(message)
        except Exception:
            disconnected.add(ws)
    
    # Remove disconnected clients
    for ws in disconnected:
        active_websockets.discard(ws)


def train_agent_thread(episodes: int, learning_rate: float, gamma: float, epsilon: float):
    """Train agent in a separate thread"""
    global agent, trainer
    
    # Update hyperparameters
    if agent:
        agent.learning_rate = learning_rate
        agent.gamma = gamma
        agent.epsilon = epsilon
        agent.optimizer = torch.optim.Adam(agent.q_network.parameters(), lr=learning_rate)
        # Keep the improved epsilon_decay from initialization (0.9985 instead of 0.9995)
        # This provides faster exploration-to-exploitation transition during training
    
    def callback(stats):
        """Callback for training updates"""
        asyncio.run(broadcast_training_update({
            'type': 'training_update',
            'data': stats
        }))
    
    if trainer:
        trainer.train(episodes, callback=callback)
        
        # Get summary after training completes and files are saved
        summary = trainer.get_training_summary()
        
        # Send training completion message to all clients
        asyncio.run(broadcast_training_update({
            'type': 'training_complete',
            'message': 'Training Complete',
            'data': summary
        }))


@app.post("/api/training/start")
async def start_training(
    episodes: int = 100,
    learning_rate: float = 0.001,
    gamma: float = 0.99,
    epsilon: float = 1.0,
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Start training the agent"""
    global training_thread, trainer
    
    if trainer is None:
        raise HTTPException(status_code=500, detail="Trainer not initialized")
    
    if trainer.is_training:
        raise HTTPException(status_code=400, detail="Training already in progress")
    
    # Start training in background
    training_thread = Thread(
        target=train_agent_thread,
        args=(episodes, learning_rate, gamma, epsilon),
        daemon=True
    )
    training_thread.start()
    
    return {"status": "Training started", "episodes": episodes}


@app.post("/api/training/pause")
async def pause_training():
    """Pause training"""
    if trainer is None:
        raise HTTPException(status_code=500, detail="Trainer not initialized")
    
    trainer.pause()
    return {"status": "Training paused"}


@app.post("/api/training/resume")
async def resume_training():
    """Resume training"""
    if trainer is None:
        raise HTTPException(status_code=500, detail="Trainer not initialized")
    
    trainer.resume()
    return {"status": "Training resumed"}


@app.post("/api/training/stop")
async def stop_training():
    """Stop training"""
    if trainer is None:
        raise HTTPException(status_code=500, detail="Trainer not initialized")
    
    trainer.stop()
    return {"status": "Training stopped", "summary": trainer.get_training_summary()}


@app.get("/api/training/status")
async def get_training_status():
    """Get training status"""
    if trainer is None:
        raise HTTPException(status_code=500, detail="Trainer not initialized")
    
    return trainer.get_stats()


@app.get("/api/training/history")
async def get_training_history():
    """Get training history with calculated summary"""
    if trainer is None:
        raise HTTPException(status_code=500, detail="Trainer not initialized")
    
    # Get raw history
    history = trainer.get_history()
    
    # Add calculated summary
    summary = trainer.get_training_summary()
    
    # Merge them
    return {
        **history,
        **summary
    }


@app.post("/api/model/save")
async def save_model(name: str = "model"):
    """Save the current model"""
    if trainer is None:
        raise HTTPException(status_code=500, detail="Trainer not initialized")
    
    filepath = trainer.save_model(name)
    history_path = trainer.save_training_history(name)
    
    return {
        "model_path": filepath,
        "history_path": history_path,
        "status": "Model saved"
    }


@app.get("/api/model/list")
async def list_models():
    """List saved models"""
    if not os.path.exists(MODELS_DIR):
        return {"models": []}
    
    models = [f for f in os.listdir(MODELS_DIR) if f.endswith('.pt')]
    return {"models": models}


@app.post("/api/model/load")
async def load_model(filepath: str):
    """Load a saved model"""
    if agent is None or trainer is None:
        raise HTTPException(status_code=500, detail="Agent not initialized")
    
    full_path = os.path.join(MODELS_DIR, filepath)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        trainer.load_model(full_path)
        # CRITICAL: Set epsilon to minimum for inference (no exploration)
        agent.epsilon = agent.epsilon_min
        print(f"Model loaded: {filepath}")
        print(f"Epsilon set to {agent.epsilon} for pure exploitation mode")
        return {"status": "Model loaded", "path": full_path, "epsilon": agent.epsilon, "epsilon_min": agent.epsilon_min}
    except Exception as e:
        import traceback
        print(f"Error loading model: {e}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/model/delete")
async def delete_model(filepath: str):
    """Delete a saved model"""
    full_path = os.path.join(MODELS_DIR, filepath)
    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="Model not found")
    
    try:
        os.remove(full_path)
        
        # Also try to remove corresponding history file if it exists
        history_path = full_path.replace('.pt', '_history.json')
        if os.path.exists(history_path):
            os.remove(history_path)
        
        return {"status": "Model deleted", "path": filepath}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete model: {str(e)}")


@app.get("/api/agent/info")
async def get_agent_info():
    """Get agent information"""
    if agent is None:
        raise HTTPException(status_code=500, detail="Agent not initialized")
    
    info = agent.get_info()
    info['epsilon_min'] = agent.epsilon_min
    info['device'] = agent.device
    info['state_size'] = agent.state_size
    info['action_size'] = agent.action_size
    return info


@app.get("/api/charts")
async def get_charts():
    """Get generated charts"""
    if trainer is None or visualizer is None:
        raise HTTPException(status_code=500, detail="Trainer not initialized")
    
    history = trainer.get_history()
    charts = visualizer.generate_all_charts(history)
    
    # Convert file paths to URLs
    chart_urls = {}
    for chart_type, filepath in charts.items():
        chart_urls[chart_type] = f"/api/charts/{chart_type}"
    
    return chart_urls


@app.get("/api/charts/{chart_type}")
async def get_chart_image(chart_type: str):
    """Get chart image"""
    chart_file = os.path.join(LOGS_DIR, f"{chart_type}.png")
    
    if not os.path.exists(chart_file):
        raise HTTPException(status_code=404, detail="Chart not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(chart_file, media_type="image/png")


@app.websocket("/ws/training")
async def websocket_training_endpoint(websocket: WebSocket):
    """WebSocket endpoint for training updates"""
    await websocket.accept()
    active_websockets.add(websocket)
    
    try:
        while True:
            # Keep connection alive
            await asyncio.sleep(1)
            if websocket.client_state.name == "DISCONNECTED":
                break
    except Exception:
        pass
    finally:
        active_websockets.discard(websocket)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "title": "Snake Game AI API",
        "version": "1.0.0",
        "endpoints": {
            "game": "/api/game",
            "training": "/api/training",
            "model": "/api/model",
            "charts": "/api/charts"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
