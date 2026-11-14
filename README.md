# Snake Game AI

A complete Snake game with AI training using Deep Q-Network (DQN) reinforcement learning.

---

## What is This?

Play classic Snake manually OR train an AI agent to play it automatically using machine learning. Monitor training progress with real-time charts and analytics.

**Three Game Modes:**
- **Play Manually** - Control the snake with arrow keys
- **Train AI** - Teach an AI agent to play using DQN algorithm
- **Test AI** - Watch the trained AI play and see how good it got

---

## Technology Stack

| Component | Technology |
|-----------|-----------|
| **Backend** | Python, FastAPI, PyTorch, Pygame |
| **Frontend** | React, Vite, Axios |
| **AI** | Deep Q-Network (DQN) Reinforcement Learning |
| **Game Engine** | Custom Snake game engine |

---

## Project Structure

```
Snake Game Agent/
├── README.md                 ← You are here
├── USAGE.md                  ← Detailed how-to guide
├── requirements.txt          ← Python dependencies
├── start_backend.bat         ← Start backend server
│
├── backend/                  ← Python backend (FastAPI)
│   ├── main.py              ← Entry point
│   ├── api/server.py        ← REST API endpoints
│   ├── game/                ← Game engine
│   │   └── snake_game.py   ← Core game logic
│   ├── agent/               ← DQN AI agent
│   │   ├── dqn_agent.py    ← Neural network agent
│   │   └── environment.py   ← Game environment
│   ├── training/            ← Training system
│   │   └── trainer.py      ← Training loop
│   └── visualization/       ← Analytics charts
│       └── charts.py       ← Chart generation
│
├── frontend/                ← React frontend (Vite)
│   ├── package.json
│   ├── vite.config.js      ← Dev server config
│   └── src/
│       ├── pages/          ← Main pages
│       ├── components/     ← UI components
│       ├── services/       ← API client
│       └── styles/         ← CSS styling
│
├── saved_models/           ← Trained AI models (auto-created)
└── training_logs/          ← Training charts and history (auto-created)
```

---

## Installation

### Requirements
- Python 3.8+
- Node.js 16+
- 4GB RAM minimum

### Step 1: Install Python Dependencies

```bash
pip install -r requirements.txt
```

**What gets installed:**
- FastAPI (web framework)
- PyTorch (neural network library)
- Pygame (game rendering)
- NumPy, Pandas (data processing)

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## Running the Project

### Option 1: Quick Start (Windows)

**Terminal 1 - Start Backend:**
```bash
start_backend.bat
```
Backend runs at: http://localhost:8000

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs at: http://localhost:5173

**Then open browser:**
Navigate to http://localhost:5173

---

### Option 2: Manual Start (Any OS)

**Terminal 1 - Start Backend:**
```bash
python backend/main.py
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

---

## How to Play

### Manual Game (Human Player)

1. Go to **Play Game** page
2. Click **Start Game**
3. Use **arrow keys** to control snake:
   - ↑ Up | ↓ Down | ← Left | → Right
4. Eat food (🟥) to grow and score points
5. Avoid hitting walls or yourself
6. Game ends on collision

**Score = number of food pieces eaten**

---

## How to Train AI

### What is DQN?

Deep Q-Network teaches an AI to play by trial and error:
- AI plays many games automatically
- After each game, it learns from experience
- Over time, its strategy improves
- Eventually, it plays as well as (or better than) humans

### Training Steps

1. Go to **AI Training** page
2. Set parameters:
   - **Episodes**: How many games to play (e.g., 100, 500, 1000)
   - **Learning Rate**: How fast it learns (default: 0.001)
   - **Discount Factor**: Value of future rewards (default: 0.99)
   - **Epsilon**: Exploration vs exploitation (default: 1.0)
3. Click **Start Training**
4. Wait for training to complete
5. Model is auto-saved to `saved_models/`

**Training takes time** - 100 episodes ≈ 2-5 minutes depending on CPU

---

## Monitor Training

### Analytics Page

See real-time progress:
- **Score Chart** - How well the AI plays over time (should go up)
- **Loss Chart** - How fast it's learning (should go down)
- **Statistics** - Best score, average score, total episodes

**Interpretation:**
- Rising scores = AI improving ✓
- Dropping loss = Good learning ✓
- Plateauing = AI reached its limit (normal)

---

## Test & Save AI

### Testing a Model

1. Go to **Test AI** page
2. Click **Start Testing**
3. Watch the AI play automatically
4. See performance stats

### Managing Models

1. Go to **Model Management**
2. View all trained models
3. Load a model to use it
4. Delete old models to save space

**Models are saved automatically after training**

---

## File Locations

| What | Where |
|------|-------|
| Trained AI models | `saved_models/` |
| Training progress charts | `training_logs/` |
| Backend code | `backend/` |
| Frontend code | `frontend/src/` |
| Game engine | `backend/game/` |
| AI agent | `backend/agent/` |

---

## Troubleshooting

### Error: "Request failed with status code 404"

**Problem:** Frontend can't reach backend API

**Fix:**
1. Check if backend is running: `python backend/main.py`
2. Verify port 8000 is not blocked
3. Refresh browser (Ctrl+R)
4. Check browser console for errors

### Snake not moving

**Fix:**
1. Click **Start Game** (snake won't move until you start)
2. Refresh browser
3. Restart backend

### Training hangs or crashes

**Fix:**
1. Try smaller episode count (e.g., 50)
2. Check system resources (RAM)
3. Restart backend and try again

### Charts not showing

**Fix:**
1. Train at least one episode first
2. Check `training_logs/` folder exists
3. Refresh Analytics page

---

## Example: Full Workflow

**Goal:** Train an AI and watch it play

1. **Train:**
   - AI Training page → Set 200 episodes → Start Training
   - Wait ~5-10 minutes

2. **Monitor:**
   - Analytics page → Watch score go up
   - When "Training complete" appears, it's done

3. **Test:**
   - Test AI page → Start Testing
   - Watch your trained AI play!

4. **Save:**
   - Model automatically saved as `model_<timestamp>.pth`
   - Find it in Model Management page

---

## System Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| RAM | 4 GB | 8 GB |
| CPU | Dual-core | Quad-core |
| Disk | 500 MB | 2 GB |
| GPU | Not required | NVIDIA GPU (faster) |

---

## Keyboard Controls

| Key | Action |
|-----|--------|
| Arrow Keys | Move snake (Play Game) |
| Ctrl+R | Refresh browser |
| F12 | Open developer console |

---

## For More Details

- **How to Use:** Read `USAGE.md` for detailed feature guide
- **Game Rules:** Classic Snake game rules apply
- **API Docs:** Backend Swagger docs at `http://localhost:8000/docs`

---

## Quick Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Ran `pip install -r requirements.txt`
- [ ] Ran `npm install` in frontend folder
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Browser opens http://localhost:5173

**Not working?** Check Troubleshooting section above.

---

## What's Under the Hood?

- **Game Engine** (Pygame) - Handles snake movement, collision, food spawning
- **DQN Agent** (PyTorch) - Neural network that learns to play
- **Training Loop** - Runs 1000s of games, AI learns from each one
- **FastAPI Server** - Connects frontend to backend
- **React Dashboard** - Beautiful UI for humans to interact with

---

**Ready to play or train?** Open http://localhost:5173 in your browser!
