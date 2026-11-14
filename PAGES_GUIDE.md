# Snake Game AI - 5 Pages Guide

Simple explanation of what each page does and how to use it.

---

## 1. Dashboard

### What It Does:
Shows you a quick overview of the entire project - a summary page with all the key information.

### What You See:
- **Project Title**: Snake Game AI
- **Status**: If system is running or not
- **Quick Stats**: Total models, total training episodes, system info
- **Navigation Links**: Quick access to all 5 pages
- **Getting Started**: Brief instructions

### How to Use It:
1. When you open the app, this is the first page you see
2. Use it to check if everything is working
3. Click on any page link to go to that page
4. Check the status to see if system is ready

### Example:
```
Dashboard shows:
✓ System Status: Connected
📊 Total Models Saved: 3
🎓 Total Training Episodes: 300
🎮 Games Played: 15
```

---

## 2. Play Game

### What It Does:
Let you **play Snake manually** OR **watch AI play automatically**.

### What You See:
- **Game Board**: 20x20 grid with snake and food
- **Snake Design**: Cyan head with eyes, colored body, magenta tail, red food (apple)
- **Mode Selector**: Choose between "Human Player" or "AI Player"
- **Game Controls**: START and STOP buttons
- **Stats Display**: Current score, snake length, game status

### How to Use It:

#### Option 1: Play Manually (Human Player)
```
1. Select "Human Player" from dropdown
2. Click "START GAME"
3. Use ARROW KEYS or WASD to move snake:
   - UP Arrow or W = Move up
   - DOWN Arrow or S = Move down
   - LEFT Arrow or A = Move left
   - RIGHT Arrow or D = Move right
4. Eat food (red apple) to increase score
5. Avoid walls (grid edges) and your own body
6. Click "STOP GAME" to end
7. On Game Over, click "PLAY AGAIN" or "BACK TO MENU"
```

#### Option 2: Watch AI Play (AI Player)
```
1. First, you MUST TRAIN the AI (go to "AI Training" page first)
2. Select "AI Player" from dropdown
3. Click "START GAME"
4. Watch the snake play automatically!
5. The snake will move on its own (200ms between moves)
6. When game ends, you'll see:
   - Sad game over face
   - Final score
   - "AI Game Over! Final Score: X, Food Eaten: X"
7. Click "PLAY AGAIN" to see another game
```

### Important Notes:
- ⚠️ **AI Player requires trained model** - Must train first!
- 💤 When snake hits wall/self, it pauses for 1.5 seconds so you can see the collision clearly
- 😢 Then shows sad game over face
- 🎮 Human mode moves every 200ms (5 moves per second)

### Example Gameplay:
```
Human Play:
Score: 5
Snake Length: 8
Status: ▶️ Playing
(You eat food, score increases)

AI Play:
Score: 12
Snake Length: 15
Status: ▶️ Playing
(AI automatically finds and eats food)
```

---

## 3. AI Training

### What It Does:
**Train the AI agent** to play Snake better. The AI learns by playing many games and improving.

### What You See:
- **Training Configuration**: Settings for training
- **Training Progress**: Live updates while training
- **Statistics**: Real-time training data
- **Start/Pause/Stop Buttons**: Control training

### How to Use It:

#### Step 1: Set Training Parameters
```
Number of Episodes: 100
(How many games to play for training)

Learning Rate (α): 0.001
(How fast the AI learns - lower = safer, slower)

Discount Factor (γ): 0.99
(How much AI cares about future rewards)

Initial Epsilon (ε): 1.0
(How much the AI explores - 1.0 = random at start)
```

#### Step 2: Start Training
```
1. Adjust parameters (or keep defaults)
2. Click "START TRAINING"
3. Watch the training progress:
   - Episode: 1 / 100 (current / total)
   - Current Score: How many foods in this episode
   - Best Score: Highest food eaten so far
   - Average Score: Average across all episodes
   - Epsilon: Exploration rate (decreases over time)
   - Memory Size: Experiences stored
```

#### Step 3: During Training
```
🟢 Training Active = Training is running
⏸️ Training Paused = Click "Resume" to continue
⚪ Idle = Training not running

You can:
- PAUSE: Pause and resume later
- STOP: Stop training immediately
- WATCH: Watch progress in real time
```

#### Step 4: After Training Completes
```
Message: "Training Complete! 🎉"
Shows:
- Total Episodes: 100
- Best Score: 8
- Average Score: 3.5
- Total Reward: 250

Next: Go to "Model Management" to SAVE the trained model
```

### Important Notes:
- ⏱️ **100 episodes takes ~5-10 minutes** depending on PC speed
- 📈 **Scores should increase** as training progresses
- 🎯 **Average score of 3-5** is good for first training
- 💾 **MUST save model manually** after training (won't auto-save)
- 🔄 **Episodes shown: 100/100** means exactly 100 episodes trained

### Example Training Session:
```
Starting: Episode 1 / 100, Best Score: 0, Avg: 0
...
Middle: Episode 50 / 100, Best Score: 5, Avg: 2.1
...
End: Episode 100 / 100, Best Score: 8, Avg: 3.5
Training Complete! 🎉
```

---

## 4. Analytics

### What It Does:
Shows **training performance charts and statistics** to see how well the AI learned.

### What You See:
- **Summary Stats**: Episodes, best score, average score, food eaten, epsilon
- **Charts**: Visual graphs showing training progress over time
- **Detailed Analysis**: In-depth statistics and insights

### How to Use It:

#### View Summary Statistics
```
Total Episodes: 100
Best Score: 8
Average Score: 3.5
Total Food Eaten: 350
Best Episode: Episode 87
Final Epsilon: 0.0123

Maximum Score: 8
Average Episode Length: 245 steps
Average Loss: 0.0456
Last 10 Average Score: 4.2
```

#### Read the Charts
```
1. Combined Chart: All metrics together
2. Scores Chart: Shows score trend over episodes
3. Rewards Chart: Shows total rewards per episode
4. Loss Chart: Shows neural network loss decreasing
5. Epsilon Chart: Shows exploration rate decreasing

Charts appear AFTER training completes
(Auto-refresh every 3 seconds during training)
```

#### Understand the Data
```
📈 Scores trending UP = AI learning!
📉 Loss trending DOWN = AI improving!
➡️ Epsilon steadily DOWN = Learning phase to playing phase

If all flat = AI not learning (need different settings)
```

### How to Read Results:
```
✅ Good Training:
- Scores: 0 → 2 → 5 → 8 (increasing)
- Loss: 1.5 → 0.8 → 0.3 (decreasing)
- Avg Score: 0.5 → 2.0 → 3.5 (improving)

❌ Bad Training:
- Scores: 0 → 0 → 1 (not improving)
- Loss: staying high (not learning)
- Avg Score: under 1 (AI struggling)
```

### Important Notes:
- 📊 **Charts take time to load** - be patient
- 🔄 **Auto-refreshes** while training is running
- 💾 **Data comes from latest training run** - not saved files
- ⏸️ **Check after training completes** to see full results

### Example Analytics Display:
```
Total Episodes: 100
Best Score: 8 ✨
Average Score: 3.50
Total Food Eaten: 350
Final Epsilon: 0.0123

[Chart 1: Scores increasing from 0 to 8]
[Chart 2: Loss decreasing from 1.5 to 0.2]
[Chart 3: Epsilon decreasing from 1.0 to 0.01]
```

---

## 5. Model Management

### What It Does:
**Save, load, and delete trained AI models** so you can:
- Save your trained AI
- Load a previously trained AI
- Delete old models

### What You See:
- **Save Current Model**: Input field to name and save
- **Model Information**: Learning rate, gamma, total steps, episodes trained
- **Saved Models**: List of all trained models with LOAD and DELETE buttons
- **Instructions**: How to use models

### How to Use It:

#### Option 1: Save a Model (After Training)
```
1. Go to "AI Training" page
2. Train the AI (100+ episodes)
3. Come to "Model Management"
4. In "Save Current Model" box:
   - Type a name: "First model" or "best_v1"
   - Click "SAVE MODEL"
5. Success message appears!
6. Model saved with timestamp: "first_model_20261114_184113.pt"
```

#### Option 2: Load a Model (To Use Trained AI)
```
1. See "Saved Models" section
2. You'll see list like:
   - "first_model_20261114_184113.pt"
   - "model_20261114_181037.pt"
3. Click "LOAD" button on the model you want
4. Green border appears around loaded model
5. Button shows "Loaded"
6. Now go to "Play Game" → "AI Player" to use it!
```

#### Option 3: Delete a Model (Remove Old Ones)
```
1. See "Saved Models" section
2. Find the model you want to delete
3. Click "DELETE" button
4. Confirmation dialog appears: "Are you sure?"
5. Click "OK" to delete
6. Model removed from list
```

### Important Notes:
- 💾 **Models auto-named** with timestamp: `model_20261114_153033.pt`
- 📍 **Only ONE model can be loaded** at a time
- 🎮 **Must load a model** before using AI Player mode
- ⚠️ **Deleting is permanent** - can't undo
- 📊 **Training Status Shows**: If currently training or idle
- 🤖 **Model Info Shows**: Learning parameters used to train it

### Model Information Display:
```
Learning Rate: 0.0010
Gamma (γ): 0.99
Total Steps: 5,789
Episodes Trained: 100
```

### Example Workflow:
```
Step 1: Train AI (AI Training page)
Step 2: Save Model (Model Management page)
        Name: "trained_v1"
Step 3: Load Model (Model Management page)
        Select "trained_v1" → Click LOAD
Step 4: Play with AI (Play Game page)
        Select "AI Player" → Click START GAME
        Watch AI play using trained model!
```

---

## Quick Reference: What to Do Next

### To Play Manually:
```
Play Game → Select "Human Player" → Click START → Use Arrow Keys
```

### To Train AI:
```
AI Training → Adjust settings (optional) → Click START TRAINING → Wait
```

### To See Training Results:
```
Analytics → View charts and statistics (after training)
```

### To Save Trained AI:
```
Model Management → Type name → Click SAVE MODEL
```

### To Use Trained AI:
```
Model Management → Click LOAD on a model → Play Game → Select "AI Player"
```

### To Delete Old Model:
```
Model Management → Click DELETE on old model → Confirm
```

---

## Typical Usage Flow

```
Day 1:
1. Open Dashboard (check status)
2. Play Game - Human Player (learn controls)
3. AI Training - Train for 100 episodes (10 minutes)

Day 2:
4. Analytics - Check how well AI learned
5. Model Management - Save the trained model with name "my_first_ai"
6. Play Game - AI Player - Watch your trained AI play!

Day 3:
7. AI Training - Train again with different settings
8. Model Management - Save as "my_second_ai"
9. Model Management - Load "my_first_ai"
10. Play Game - AI Player - Compare with first AI

Later:
11. Model Management - Delete old models to clean up
12. Keep your best trained models
```

---

## Summary Table

| Page | Purpose | Main Action |
|------|---------|-------------|
| **Dashboard** | Overview & status | Check system is ready |
| **Play Game** | Manual or watch AI | Play manually OR watch AI |
| **AI Training** | Train the AI | Configure & start training |
| **Analytics** | View results & charts | Analyze training performance |
| **Model Management** | Save/load/delete AI | Manage trained models |

---

## Tips & Tricks

✅ **Start with Dashboard** - See overview first
✅ **Train for 100+ episodes** - Better results
✅ **Save multiple models** - Compare different trainings
✅ **Check Analytics** - See if AI is learning
✅ **Load before playing** - Can't use AI without loading model
✅ **Use meaningful names** - "best_model" not "model123"
✅ **Delete old models** - Keep only good ones

---

Done! Now you know all 5 pages and how to use them. 🎮✨

