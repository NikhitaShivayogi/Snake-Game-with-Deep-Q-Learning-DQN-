# Reinforcement Learning Guide - Snake Game AI

## What is Reinforcement Learning?

Reinforcement Learning (RL) is a type of machine learning where an **agent learns by interacting with an environment**.

### The Basic Idea:
- **Agent**: The AI (our snake)
- **Environment**: The game world (20x20 grid)
- **Action**: What the snake can do (move UP, DOWN, LEFT, RIGHT)
- **Reward**: Feedback for actions (+100 for eating food, -50 for hitting wall, -0.01 per step)
- **Goal**: Learn to maximize total rewards (eat as much food as possible without dying)

### How It Works:
```
Agent sees current state
        ↓
Agent decides action (based on learning)
        ↓
Environment responds with new state + reward
        ↓
Agent learns from this experience
        ↓
Repeat until agent becomes expert
```

---

## The Algorithm: Deep Q-Learning (DQN)

We use **Deep Q-Learning**, which is a powerful RL algorithm that combines:
1. **Q-Learning** (learns action values)
2. **Deep Neural Networks** (learns complex patterns)

### What is Q-Learning?

Q-Learning teaches the agent to learn the value of each action in each state.

**Q-Value** = Expected total reward from taking action A in state S and playing optimally afterward

**The Learning Formula (Bellman Equation):**
```
Q(state, action) = reward + γ × max(Q(next_state, all_actions))

Where:
- reward = immediate reward received
- γ (gamma) = 0.99 (how much we care about future rewards)
- max(Q(next_state, ...)) = best future reward we can get
```

**Example:**
```
Current state: Snake at (10, 10), food at (12, 10)
Action: Move RIGHT
Reward: +100 (ate food!)
Next state: Snake at (11, 10), new food location
γ = 0.99

Q value = 100 + 0.99 × (best future reward from new state)
```

### Why Use Neural Networks?

With a 20x20 grid, there are **billions of possible states**. We can't store a Q-value for every one!

**Solution**: Use a Deep Neural Network to **approximate Q-values**.

**Our Network:**
```
Input: State representation (11 numbers)
  ↓
Hidden Layer 1 (128 neurons) with ReLU activation
  ↓
Hidden Layer 2 (128 neurons) with ReLU activation
  ↓
Hidden Layer 3 (128 neurons) with ReLU activation
  ↓
Output: 4 Q-values (one for each action: UP, DOWN, LEFT, RIGHT)
```

### State Representation

The snake doesn't see pixels. Instead, it receives **11 numbers** describing the game:

```
1. Danger in front (wall/body = 1, safe = 0)
2. Danger left side
3. Danger right side
4. Snake moving UP (1 if yes, 0 if no)
5. Snake moving DOWN
6. Snake moving LEFT
7. Snake moving RIGHT
8. Food is LEFT of snake (1 if yes, 0 if no)
9. Food is RIGHT of snake
10. Food is UP from snake
11. Food is DOWN from snake
```

**Why?** Simple representation allows faster learning!

---

## Key Components of DQN

### 1. **Experience Replay Memory**
- Stores past experiences: (state, action, reward, next_state, done)
- During training, we randomly sample batches of past experiences
- **Why?** Breaks correlation between consecutive experiences, stabilizes learning

```python
# Store experience
memory.push(state, action, reward, next_state, done)

# Later, train on random batch
batch = memory.sample(batch_size=32)
```

### 2. **Target Network**
- We have **two neural networks**:
  - **Q-Network**: Main network being trained
  - **Target Network**: Copy of Q-network, updated every few episodes
- **Why?** Provides stable targets for training

```
Loss = (Target - Predicted)²
Target = reward + γ × max(Q_target(next_state))  ← Uses Target Network
Predicted = Q_main(state)                         ← Uses Main Network
```

### 3. **Epsilon-Greedy Exploration**
- Sometimes agent takes **random actions** (exploration)
- Sometimes agent takes **best learned action** (exploitation)
- Epsilon (ε) controls balance:

```
if random() < epsilon:
    action = random_action()      ← Explore (find new strategies)
else:
    action = best_learned_action()  ← Exploit (use what we know)

epsilon *= 0.99  ← Gradually decrease exploration as learning improves
```

**Example Training:**
```
Episode 1: ε = 1.0   (99% random, 1% learned)  → Bad play
Episode 50: ε = 0.6  (60% random, 40% learned) → Improving
Episode 100: ε = 0.01 (1% random, 99% learned) → Expert play
```

### 4. **Loss Function (Huber Loss)**
- We use Smooth L1 Loss instead of MSE
- **Why?** More stable, handles outliers better

```
Loss = smooth_l1_loss(predicted_Q, target_Q)
```

---

## Our Reward Structure

| Event | Reward | Purpose |
|-------|--------|---------|
| Eating food | +100 | Main goal - incentivize finding food |
| Hitting wall | -50 | Avoid collisions |
| Hitting self | -50 | Avoid self-collision |
| Timeout (stuck) | -50 | Avoid endless loops |
| Each step | -0.01 | Encourages efficient, quick moves |

**Why these values?**
- +100 for food is much larger than penalties
- This makes eating food the **primary focus**
- Small -0.01 per step prevents infinite loops
- Large -50 penalties teach agent to avoid collisions quickly

---

## Training Process

### Step-by-Step Training:

```
For each episode (100 times):
    1. Reset game (snake at center, random food)
    2. For each step (max 500 steps):
        a. Get current state (11 numbers)
        b. Select action using epsilon-greedy:
           - 99% chance: random action (explore)
           - 1% chance: best learned action
        c. Take action → get reward + next_state
        d. Store experience in memory
        e. Sample 32 random experiences from memory
        f. Train neural network on this batch:
           - Calculate target Q-value
           - Calculate predicted Q-value
           - Minimize loss using backpropagation
        g. Check if episode ended (collision or timeout)
    3. Decay epsilon (encourage exploitation more)
    4. Every 3 episodes: Update target network with Q-network weights
    5. Record statistics (score, loss, epsilon)
```

---

## What the Agent Learns

**Early Training (Episodes 1-20):**
- Random movements, mostly dying
- Average score: 0-1 food per episode

**Mid Training (Episodes 40-60):**
- Starting to chase food sometimes
- Avoiding walls occasionally
- Average score: 2-4 food per episode

**Late Training (Episodes 80-100):**
- Consistently chasing food
- Better obstacle avoidance
- Average score: 5-10+ food per episode

**After Training (Playing Mode):**
- Epsilon = 0.01 (almost pure exploitation)
- Uses learned Q-values to make optimal decisions
- Can achieve 15-30+ food eaten per game

---

## Key Hyperparameters

| Parameter | Value | What It Does |
|-----------|-------|-------------|
| Learning Rate (α) | 0.0001 | How much to adjust weights (lower = safer, slower) |
| Gamma (γ) | 0.99 | How much future rewards matter (higher = look further ahead) |
| Epsilon Initial | 1.0 | Start with 100% exploration |
| Epsilon Decay | 0.99 | Reduce exploration speed (99% of previous each episode) |
| Epsilon Min | 0.01 | Keep at least 1% exploration even late in training |
| Replay Memory Size | 10,000 | Store last 10,000 experiences |
| Batch Size | 32 | Train on 32 random experiences per training step |
| Target Update | Every 3 episodes | Sync target network with main network |

---

## Why This Works for Snake

1. **Q-Learning** ✓
   - Learns value of each action
   - Works well for discrete actions (UP/DOWN/LEFT/RIGHT)

2. **Neural Network Approximation** ✓
   - Handles complex state space
   - Can learn intricate patterns

3. **Experience Replay** ✓
   - Stabilizes training
   - Reuses experiences efficiently

4. **Target Network** ✓
   - Prevents training instability
   - Allows agent to learn from its own predictions

5. **Exploration-Exploitation Balance** ✓
   - Epsilon-greedy ensures exploration
   - Prevents getting stuck in local optima

---

## Quick Comparison: RL Algorithms

| Algorithm | How It Works | Good For | Drawback |
|-----------|-------------|----------|----------|
| **Q-Learning** | Learn value of state-action pairs | Small state spaces | Can't handle large states |
| **Deep Q-Learning (Our Choice)** | Neural network learns Q-values | Large state spaces, complex games | Requires more data, slower |
| **Policy Gradient** | Learn policy directly | Continuous actions | Less stable for discrete actions |
| **Actor-Critic** | Combination of both | Fast learning | More complex to implement |

**We chose Deep Q-Learning because:**
- ✓ Works great for discrete actions (snake directions)
- ✓ Proven for game AI (Atari, etc.)
- ✓ Good balance between complexity and performance
- ✓ Stable training with replay buffer

---

## Summary

**Reinforcement Learning** teaches the agent to learn by trial and error.

**Deep Q-Learning (DQN)** does this by:
1. Using a neural network to estimate Q-values
2. Storing past experiences in a replay buffer
3. Using two networks (main + target) for stability
4. Balancing exploration vs exploitation with epsilon-greedy

**Result**: A snake AI that learns to play Snake better with each training episode! 🐍🎮

