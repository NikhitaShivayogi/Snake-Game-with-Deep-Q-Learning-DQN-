# Deep Q-Learning (DQN) Algorithm Guide

## Part 1: What is Reinforcement Learning?

Reinforcement Learning (RL) is a machine learning approach where an agent learns by **interacting with an environment, taking actions, and receiving rewards**.

The agent's goal: **Maximize cumulative rewards over time.**

---

## Part 2: RL Components

| Component | Definition | In This Project |
|-----------|-----------|-----------------|
| **Agent** | The decision-maker | Snake AI |
| **Environment** | The world | 20×20 game grid |
| **State** | Current situation | Snake position, food, obstacles |
| **Action** | Decision made | Move UP, DOWN, LEFT, RIGHT |
| **Reward** | Feedback signal | +100 (food), -100 (collision), -0.001 (step) |
| **Policy** | Strategy learned | Behavior the AI develops |

### The Learning Loop

```
Agent observes STATE
    ↓
Agent takes ACTION
    ↓
Environment gives REWARD + NEW STATE
    ↓
Agent learns from this feedback
    ↓
Agent improves its policy
    ↓
Repeat → AI becomes expert
```

---

## Part 3: Introduction to DQN

This project uses **Deep Q-Learning (DQN)** to train the AI. DQN combines two main techniques to solve RL problems efficiently.

---

## The Two Main Algorithms of DQN

Deep Q-Learning is built on **two core algorithms**:

| Algorithm | Purpose | Why Needed |
|-----------|---------|-----------|
| **1. Q-Learning Algorithm** | Learn which actions are valuable | Defines WHAT to learn |
| **2. Neural Network** | Store and predict those values | Handles billions of game states |

**Together**: They enable the AI to learn complex strategies efficiently.

---

## Algorithm 1: Q-Learning

### What is Q-Learning?

Q-Learning is an algorithm that learns the **value (quality) of actions**.

```
Q(state, action) = How good is this action in this situation?
```

### How It Works

Q-Learning uses a simple mathematical formula:

```
Q(s, a) = reward + discount_factor × max(Q(next_state, all_actions))

Where:
  s = current state
  a = action taken
  reward = immediate reward received
  discount_factor = 0.99 (how much future matters)
  max(Q(next_state)) = best possible next value
```

### Example

```
Snake sees food to the RIGHT

Q-Learning calculates:
  Immediate reward: +100 (eating food)
  Future potential: +50 (good position afterward)
  Total value: 100 + 0.99 × 50 = 149.5

Conclusion: "Moving RIGHT = 149.5 value"
```

### The Problem with Q-Learning

Q-Learning works by storing Q-values in a table:

```
State 1 → {UP: 5, DOWN: 2, LEFT: 3, RIGHT: 8}
State 2 → {UP: 10, DOWN: 12, LEFT: 4, RIGHT: 6}
State 3 → {UP: 0, DOWN: 100, LEFT: 5, RIGHT: 2}
...
```

**Problem**: 
- Snake has **billions of possible states**
- Cannot store table entries for every state
- **Q-Learning alone doesn't work for complex games** ❌

**Solution**: Use a Neural Network to approximate Q-values

---

## Algorithm 2: Neural Network

### What is a Neural Network?

A neural network is a computational model that **learns patterns** from data.

Instead of storing Q-values in a table, use a network to **predict Q-values** for any state.

### How It Works

```
Input: Game state (11 simple features)
    ↓
Process through layers (learns patterns)
    ↓
Output: Q-values for 4 actions
```

### The 11 State Features

The network receives simple information instead of pixels:

```
Danger signals (3):
  - Wall/body ahead? [YES/NO]
  - Danger left? [YES/NO]
  - Danger right? [YES/NO]

Direction signals (4):
  - Moving UP? [YES/NO]
  - Moving DOWN? [YES/NO]
  - Moving LEFT? [YES/NO]
  - Moving RIGHT? [YES/NO]

Food signals (4):
  - Food left? [YES/NO]
  - Food right? [YES/NO]
  - Food up? [YES/NO]
  - Food down? [YES/NO]
```

### Network Architecture

```
Input Layer (11 features)
    ↓
Hidden Layer 1 (128 neurons - learns basic patterns)
    ↓
Hidden Layer 2 (128 neurons - learns complex patterns)
    ↓
Hidden Layer 3 (128 neurons - refines decisions)
    ↓
Output Layer (4 neurons - Q-value for each action)
```

### How Neural Network Decides

```
Input: [danger_left=1, moving_down=1, food_right=1]
    ↓
Network processes through 3 hidden layers
    ↓
Output: [UP=5.2, DOWN=3.1, LEFT=7.8, RIGHT=12.5]
    ↓
Decision: Choose RIGHT (highest Q-value = 12.5)
```

### Advantage of Neural Network

The network can **generalize to unseen situations** by recognizing patterns.

Example:
```
Network learned:
  State A (food right, moving down) → move RIGHT
  State B (food right, moving left) → move RIGHT
  State C (food right, moving up) → move RIGHT

New situation D (food right, moving up-left):
  Network recognizes pattern: "Food right → move right"
  Decision: Move RIGHT (even though exact state never seen before)
```

---

## Combined: Deep Q-Learning (DQN)

### How They Work Together

```
Q-LEARNING (defines target)  +  NEURAL NETWORK (learns and predicts)
          ↓                                    ↓
    ┌──────────────────────────────────────────────┐
    │  Deep Q-Learning (DQN)                       │
    │                                              │
    │  Step 1: Q-Learning calculates target value  │
    │          target = reward + 0.99 × future     │
    │                                              │
    │  Step 2: Neural Network predicts current     │
    │          prediction = Q(state, action)       │
    │                                              │
    │  Step 3: Network learns by reducing error    │
    │          error = target - prediction         │
    │          Update weights to match target      │
    └──────────────────────────────────────────────┘
```

### Training Process

```
FOR EACH EPISODE (100 times):

  1. Observe current state (11 features)
  
  2. Neural Network predicts Q-values
  
  3. Choose action (balance exploration and exploitation)
  
  4. Execute action, get reward + new state
  
  5. Q-Learning calculates target:
     target = reward + 0.99 × max(network(new_state))
  
  6. Neural Network learns:
     loss = (target - prediction)²
     Update network weights via backpropagation
  
  7. Repeat steps 1-6 until episode ends
```

---

## Key Features of DQN

### 1. Experience Replay

- Store 10,000 past experiences
- Train on random batches (not just recent ones)
- **Benefit**: Stable, consistent learning

### 2. Target Network

- Two networks: Main (makes decisions) + Target (provides learning goals)
- Target syncs every 3 episodes
- **Benefit**: Prevents training instability

### 3. Exploration vs Exploitation

```
Episode 1:    99% random (explore new strategies)
Episode 50:   50% random (balance)
Episode 100:  1% random (use learned knowledge)
```

### 4. Reward System

| Event | Reward |
|-------|--------|
| Eat food | +100 |
| Hit wall | -100 |
| Hit body | -100 |
| Each step | -0.001 |

---

## Results

### Learning Progress

```
Episodes 1-10:    Score 0-1 food (random play)
Episodes 40-60:   Score 3-5 food (learning)
Episodes 90-100:  Score 8-15+ food (expert play)
```

### Outputs

- **Trained Model**: `saved_models/model_<timestamp>.pt`
- **Training Data**: `training_logs/history_<timestamp>.json`
- **Visualizations**: `scores.png`, `loss.png`, `epsilon.png`

---

## Summary

**DQN combines two algorithms**:

1. **Q-Learning** calculates what actions are valuable
2. **Neural Network** predicts and stores those values

**Result**: AI learns to play Snake expertly in 100 episodes without any programmed rules.
