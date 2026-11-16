# AI Training Guide

Complete guide on how to train the AI and important components during training.

---

## How to Train the AI

### Step 1: Navigate to AI Training Page

1. Open http://localhost:5173
2. Click on **"AI Training"** in the navigation menu
3. You'll see the training control panel

### Step 2: Configure Training Parameters

| Parameter | Default | Range | What It Does |
|-----------|---------|-------|---|
| **Episodes** | 100 | 1-500 | Number of games AI plays to learn |
| **Learning Rate** | 0.0001 | 0.00001-0.001 | How fast the network learns (smaller = slower but stable) |
| **Discount Factor** | 0.99 | 0.9-0.99 | How much future rewards matter |
| **Epsilon** | 1.0 | 0-1 | Initial exploration rate (1 = 100% random) |

### Step 3: Start Training

1. Click **"START TRAINING"** button
2. Watch the progress:
   - Episode counter shows current progress
   - Current Score = score in this episode
   - Best Score = highest score so far
   - Average Score = average across all episodes
   - Epsilon = exploration rate (decreases over time)

### Step 4: Monitor Progress

During training, you'll see:
- **Green progress bar** - Training in progress
- **Real-time statistics** - Updates every episode
- **Status message** - Shows training state

### Step 5: Training Completes

When training finishes:
- Message appears: "Training Complete! 🎉"
- Model automatically saves to `saved_models/`
- You can now use the trained AI

### Step 6: Stop Training (Optional)

Click **"STOP TRAINING"** button anytime to cancel training early.

---

## Important Training Components

### 1. Episodes

**What it is:**
- One episode = one complete game from start to finish
- AI plays until collision or timeout

**Why it matters:**
- More episodes = more learning
- 100 episodes = reasonable training time
- 500 episodes = very well trained AI

**Recommended:**
```
Quick test:      50 episodes
Good training:   100 episodes
Expert level:    200-500 episodes
```

### 2. Neural Network

**What it does:**
- Learns Q-values during training
- Predicts best actions during gameplay
- Gets updated with each training batch

**Key metrics:**
- **Loss value** - Should decrease over time
- **Network accuracy** - Improves as loss decreases

### 3. Experience Replay Buffer

**What it stores:**
- 10,000 past game experiences
- Each experience: (state, action, reward, next_state, done)

**Why it's important:**
- Provides stable, diverse training data
- Breaks correlation between consecutive moves
- Enables efficient reuse of data

**During training:**
- Buffer fills up quickly
- Network learns from random samples
- Old experiences get replaced with new ones

### 4. Epsilon (Exploration Rate)

**What it represents:**
```
Epsilon = 1.0  →  100% random moves (pure exploration)
Epsilon = 0.5  →  50% random, 50% learned
Epsilon = 0.01 →  1% random, 99% learned (exploitation)
```

**During training:**
- Starts at 1.0 (full exploration)
- Decreases by factor of 0.95 each episode
- Ends at 0.01 (minimum)

**Episode 1:**   ε = 0.99 (99% explore)
**Episode 50:**  ε = 0.60 (60% explore)
**Episode 100:** ε = 0.01 (1% explore)

**Why it matters:**
- Early: Explore diverse strategies
- Late: Use learned knowledge
- Balance prevents local optima

### 5. Reward System

**Training rewards:**
| Event | Reward | Impact |
|-------|--------|--------|
| Eat food | +100 | Primary learning signal |
| Hit wall | -100 | Learn collision penalty |
| Hit body | -100 | Learn self-collision penalty |
| Timeout | -100 | Learn to keep moving |
| Each step | -0.001 | Learn efficiency |

**Network learns:**
- High rewards = good actions
- Negative rewards = bad actions
- Small step penalties = prefer quick solutions

### 6. Target Network

**What it does:**
- Provides stable learning targets
- Syncs with main network every 3 episodes
- Prevents training instability

**During training:**
- Main network updates every step
- Target network updates every 3 episodes
- Creates smooth, stable convergence

### 7. Training Loss

**What it measures:**
- Difference between target Q-values and predicted Q-values
- Lower loss = better approximation

**Expected behavior:**
```
Episodes 1-20:   High loss (random predictions)
Episodes 30-60:  Decreasing loss (learning patterns)
Episodes 70-100: Low loss (accurate predictions)
```

**Watch for:**
- ✓ Loss should decrease over time
- ✗ If loss increases: learning rate too high
- ✗ If loss flat: network not learning

---

## Training Stages

### Stage 1: Random Exploration (Episodes 1-15)

**What happens:**
- AI takes random moves
- Immediately dies
- Loss very high
- Average score: 0-1 food

**Why:**
- Network hasn't learned anything yet
- Exploring random strategies
- Establishing baseline

### Stage 2: Pattern Learning (Episodes 20-50)

**What happens:**
- AI starts recognizing patterns
- Occasionally eats food
- Loss decreasing
- Average score: 1-3 food
- Epsilon: 0.70 to 0.55

**Why:**
- Network learning food/danger patterns
- Balancing exploration and exploitation
- Improving strategy

### Stage 3: Strategy Refinement (Episodes 60-85)

**What happens:**
- AI chases food reliably
- Avoids some obstacles
- Loss continues decreasing
- Average score: 4-8 food
- Epsilon: 0.40 to 0.05

**Why:**
- Network optimizing learned strategies
- Exploitation increases
- Strategy becomes more sophisticated

### Stage 4: Optimization (Episodes 90-100)

**What happens:**
- Expert level play
- Consistent high scores
- Loss stabilized (low)
- Average score: 8-15+ food
- Epsilon: 0.01

**Why:**
- Network fully trained
- Maximum exploitation
- Optimal learned policy

---

## Monitoring Training

### Real-time Metrics

**Current Score**
- Score in current episode
- Watch for improvements over time

**Best Score**
- Highest score achieved so far
- Should generally increase

**Average Score**
- Mean of all episodes
- Best indicator of learning

**Epsilon Value**
- Current exploration rate
- Should decrease each episode

### Post-Training Analysis

After training completes, go to **Analytics** page to see:

**Score Chart:**
- Should show upward trend
- X-axis: Episodes
- Y-axis: Food eaten

**Loss Chart:**
- Should show downward trend
- Indicates network learning

**Reward Chart:**
- Total reward per episode
- Should increase over time

**Epsilon Chart:**
- Should show exponential decay
- From 0.99 to 0.01

---

## Training Tips

### Good Training

✓ **Episodes gradually improve** - Scores increase over time
✓ **Loss decreases** - Network learning correctly
✓ **Epsilon decays** - Exploration reduces
✓ **Consistent performance** - Average score stable in late episodes

### Poor Training (What to Fix)

❌ **Scores stuck at 0-1** - AI not learning
- Solution: Increase episodes to 200+
- Check reward values
- Verify backend connection

❌ **Loss increasing** - Training instability
- Solution: Reduce learning rate (try 0.00001)
- Increase episodes
- Check network not diverging

❌ **Random high scores** - Lucky plays, not learning
- Solution: Look at average score, not best
- Run longer training
- Check epsilon decay

---

## Hyperparameter Recommendations

### For Beginners

```
Episodes: 100
Learning Rate: 0.0001
Discount Factor: 0.99
Epsilon: 1.0
```

Best for: Quick testing, first training runs

### For Good Results

```
Episodes: 200
Learning Rate: 0.0001
Discount Factor: 0.99
Epsilon: 1.0
```

Best for: Good AI performance, reasonable time

### For Expert Level

```
Episodes: 500
Learning Rate: 0.0001
Discount Factor: 0.99
Epsilon: 1.0
```

Best for: Maximum learning, very high scores

---

## Saving and Loading Models

### Auto-Save

- Model automatically saves after training completes
- Saved to: `saved_models/model_<timestamp>.pt`
- Contains all learned weights

### Manual Save

1. Go to **Model Management** page
2. Click **"SAVE"** button
3. Model saved with timestamp

### Load Model

1. Go to **Model Management** page
2. Select model from list
3. Click **"LOAD"** button
4. Go to **Play Game** → Select "AI Player"
5. AI uses loaded model

### Delete Model

1. Go to **Model Management** page
2. Click **"DELETE"** on model
3. Confirm deletion

---

## Troubleshooting Training

| Issue | Cause | Solution |
|-------|-------|----------|
| Training stuck | Backend not responding | Restart backend |
| Very low scores | Network not learning | Increase episodes |
| Training too slow | Server overloaded | Close other apps |
| Model not saving | Folder permission | Check `saved_models/` exists |
| Epsilon not changing | Bug | Restart training |

---

## Summary

**Training Process:**
1. Go to AI Training page
2. Set episodes (default 100)
3. Click START TRAINING
4. Monitor progress
5. Wait for completion
6. Model auto-saves
7. Use in Play Game mode

**Key Components:**
- **Episodes:** How many games AI plays
- **Neural Network:** Learns and predicts Q-values
- **Experience Replay:** Provides stable training data
- **Epsilon:** Controls exploration vs exploitation
- **Reward System:** Guides learning toward goal
- **Target Network:** Ensures stable convergence
- **Loss:** Measures learning progress

**Expected Results:**
- After 100 episodes: Score 8-15+ food
- After 200 episodes: Score 15-25+ food
- After 500 episodes: Score 25-40+ food

**Next Steps:**
- Train the AI
- Check Analytics for learning curves
- Play with trained AI in Play Game mode
- Experiment with different episode counts
