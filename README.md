# Snake Game AI - Deep Q-Learning

A full-stack web application where users can play Snake manually, train AI using Deep Q-Learning, and watch the trained AI play automatically with real-time analytics.

---

## Project Overview

**Backend**: Python FastAPI with game engine and DQN AI training  
**Frontend**: React Vite dashboard with 5 interactive pages  
**AI Algorithm**: Deep Q-Learning (DQN) using PyTorch  
**Database**: JSON-based model and training data storage

---

## Project Structure

```
Snake Game Agent/
├── backend/                    ← Python FastAPI server
│   ├── agent/                 ← DQN neural network
│   ├── game/                  ← Game engine
│   ├── training/              ← Training loop
│   ├── visualization/         ← Charts generation
│   └── api/                   ← REST API endpoints
│
├── frontend/                   ← React Vite frontend
│   ├── src/
│   │   ├── pages/            ← Dashboard, Play, Training, Analytics, Models
│   │   ├── components/       ← Game canvas, UI components
│   │   └── services/         ← API client
│
├── saved_models/              ← Trained AI models (.pt files)
├── training_logs/             ← Training data and charts
├── requirements.txt           ← Python dependencies
└── start_backend.bat          ← Quick start script (Windows)
```

---

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- 4GB RAM minimum

### Installation

**Step 1: Install Python Dependencies**
```bash
pip install -r requirements.txt
```

**Step 2: Install Frontend Dependencies**
```bash
cd frontend
npm install
cd ..
```

---

## Running the Application

### Windows

**Terminal 1 - Start Backend:**
```bash
start_backend.bat
```
Backend runs at: `http://localhost:8000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

### macOS/Linux

**Terminal 1 - Backend:**
```bash
python backend/main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Access Application

Open your browser and go to:
```
http://localhost:5173
```

---

## Features

### 5 Main Pages

1. **Dashboard** - Project overview and quick start guide
2. **Play Game** - Manual or AI gameplay modes
3. **AI Training** - Configure and train the DQN model (100-500 episodes)
4. **Analytics** - Real-time training charts and statistics
5. **Model Management** - Save, load, and delete trained models

### Key Capabilities

- ✓ Play Snake manually with arrow keys
- ✓ Train AI using Deep Q-Learning algorithm
- ✓ Watch trained AI play automatically
- ✓ Monitor training progress with live charts
- ✓ Save and load trained models
- ✓ View detailed training analytics

---

## File Descriptions

| File | Purpose |
|------|---------|
| `requirements.txt` | Python packages needed |
| `start_backend.bat` | Quick start script for Windows |
| `backend/main.py` | Backend entry point |
| `backend/api/server.py` | REST API routes |
| `backend/game/snake_game.py` | Game logic and rules |
| `backend/agent/dqn_agent.py` | DQN neural network |
| `backend/training/trainer.py` | Training loop |
| `frontend/src/pages/*.jsx` | React page components |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/training/start` | POST | Start AI training |
| `/api/training/status` | GET | Get training progress |
| `/api/training/history` | GET | Get training data |
| `/api/model/list` | GET | List saved models |
| `/api/model/save` | POST | Save model |
| `/api/model/load` | POST | Load model |
| `/api/model/delete` | POST | Delete model |
| `/api/charts/{type}` | GET | Get training charts |

Full API documentation: `http://localhost:8000/docs`

---

## Workflow

### To Play Manually

1. Open http://localhost:5173
2. Go to "Play Game" page
3. Select "Human Player"
4. Click "START GAME"
5. Use arrow keys to control snake
6. Click "END GAME" button or press **K key** to stop playing anytime

### To Train AI

1. Go to "AI Training" page
2. Set episodes (e.g., 100)
3. Click "START TRAINING"
4. Wait for completion (auto-saves model)
5. Click "STOP TRAINING" to cancel anytime

### To Watch AI Play

1. Go to "Play Game" page
2. Select "AI Player"
3. Click "START GAME"
4. Watch the trained AI play
5. Click "END GAME" button or press **K key** to stop anytime

### To View Analytics

1. Go to "Analytics" page
2. View training progress charts
3. Check scores, rewards, and loss metrics

---

## Keyboard Controls

| Key | Action | Where |
|-----|--------|-------|
| ⬆️ UP Arrow | Move snake up | Play Game (Manual mode) |
| ⬇️ DOWN Arrow | Move snake down | Play Game (Manual mode) |
| ⬅️ LEFT Arrow | Move snake left | Play Game (Manual mode) |
| ➡️ RIGHT Arrow | Move snake right | Play Game (Manual mode) |
| **K** | End/Stop game | Play Game (Manual & AI mode) |

---

## Technology Stack

**Backend**:
- FastAPI (REST API framework)
- PyTorch (neural networks)
- Pygame (game engine)
- Matplotlib (chart generation)

**Frontend**:
- React 18
- Vite (build tool)
- Axios (HTTP client)
- CSS3 (styling)

**AI/ML**:
- Deep Q-Learning (DQN)
- Neural Networks (3 hidden layers, 128 neurons each)
- Experience Replay
- Target Network

---

## System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 4 GB | 8+ GB |
| Disk Space | 500 MB | 2+ GB |
| Python | 3.8 | 3.9+ |
| Node.js | 16 | 18+ |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Cannot connect to backend | Check if backend is running on port 8000 |
| npm install fails | Update Node.js to version 16 or higher |
| Port 8000 already in use | Close other applications using port 8000 |
| Charts not displaying | Train at least 1 episode first |

---

## Documentation

- **Algorithm Details**: See `REINFORCEMENT_LEARNING_GUIDE.md`
- **Page Guide**: See `PAGES_GUIDE.md`

---

**Built with Python, React, PyTorch, and FastAPI** 🐍
