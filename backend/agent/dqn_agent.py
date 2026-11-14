"""
Deep Q-Network (DQN) Agent
Implements the DQN algorithm with experience replay and target network
"""

import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque
from typing import Tuple, List
import os


class QNetwork(nn.Module):
    """
    Deep Q-Network neural network
    Predicts Q-values for each action given a state
    """

    def __init__(self, input_size: int, hidden_size: int = 128, output_size: int = 4):
        """
        Initialize the Q-Network
        
        Args:
            input_size: Size of the input state
            hidden_size: Size of hidden layers
            output_size: Number of possible actions (4 for snake)
        """
        super(QNetwork, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, hidden_size),
            nn.ReLU(),
            nn.Linear(hidden_size, output_size)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through the network"""
        return self.network(x)


class ReplayMemory:
    """
    Experience Replay Memory
    Stores and samples experiences for training
    """

    def __init__(self, capacity: int = 10000):
        """
        Initialize replay memory
        
        Args:
            capacity: Maximum number of experiences to store
        """
        self.memory = deque(maxlen=capacity)
        self.capacity = capacity

    def push(self, state: np.ndarray, action: int, reward: float, 
             next_state: np.ndarray, done: bool):
        """
        Add experience to memory
        
        Args:
            state: Current state
            action: Action taken
            reward: Reward received
            next_state: Next state
            done: Whether episode ended
        """
        self.memory.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Sample a batch of experiences
        
        Args:
            batch_size: Number of experiences to sample
            
        Returns:
            Tuple of (states, actions, rewards, next_states, dones)
        """
        indices = np.random.choice(len(self.memory), batch_size, replace=False)
        states, actions, rewards, next_states, dones = zip(*[self.memory[i] for i in indices])
        
        return (
            np.array(states),
            np.array(actions),
            np.array(rewards),
            np.array(next_states),
            np.array(dones)
        )

    def __len__(self) -> int:
        """Get current memory size"""
        return len(self.memory)


class DQNAgent:
    """
    Deep Q-Network Agent
    Implements the complete DQN algorithm
    """

    def __init__(self, state_size: int = 11, action_size: int = 4, 
                 learning_rate: float = 0.0001, gamma: float = 0.99,
                 epsilon: float = 1.0, epsilon_decay: float = 0.95,
                 epsilon_min: float = 0.01, device: str = None):
        """
        Initialize the DQN Agent
        
        Args:
            state_size: Size of the state representation
            action_size: Number of possible actions
            learning_rate: Learning rate for optimizer
            gamma: Discount factor (how much future rewards matter)
            epsilon: Initial exploration rate
            epsilon_decay: How fast epsilon decays
            epsilon_min: Minimum epsilon value
            device: Device to run on (cuda or cpu)
        """
        self.state_size = state_size
        self.action_size = action_size
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.epsilon = epsilon
        self.epsilon_decay = epsilon_decay
        self.epsilon_min = epsilon_min
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Networks
        self.q_network = QNetwork(state_size, hidden_size=128, output_size=action_size).to(self.device)
        self.target_network = QNetwork(state_size, hidden_size=128, output_size=action_size).to(self.device)
        self.target_network.load_state_dict(self.q_network.state_dict())
        self.target_network.eval()  # Target network is not trained directly
        
        # Optimizer and loss
        self.optimizer = optim.Adam(self.q_network.parameters(), lr=learning_rate)
        self.loss_fn = nn.MSELoss()
        
        # Experience replay memory
        self.memory = ReplayMemory(capacity=10000)
        
        # Training stats
        self.total_steps = 0
        self.episodes_trained = 0

    def select_action(self, state: np.ndarray, training: bool = True) -> int:
        """
        Select an action using epsilon-greedy strategy
        
        Args:
            state: Current state
            training: Whether in training mode (affects exploration)
            
        Returns:
            Action index
        """
        # Epsilon-greedy exploration
        if training and np.random.random() < self.epsilon:
            return np.random.randint(self.action_size)
        
        # Exploit: choose best action
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0).to(self.device)
            q_values = self.q_network(state_tensor)
            return q_values.argmax(dim=1).item()

    def remember(self, state: np.ndarray, action: int, reward: float, 
                 next_state: np.ndarray, done: bool):
        """Store experience in memory"""
        self.memory.push(state, action, reward, next_state, done)

    def replay(self, batch_size: int = 32) -> float:
        """
        Train the network using experience replay
        Implements the Bellman equation: Q(s,a) = r + γ * max(Q(s',a'))
        
        Args:
            batch_size: Size of the training batch
            
        Returns:
            Loss value
        """
        if len(self.memory) < batch_size * 2:  # Need enough data to train
            return 0.0

        # Sample batch from memory
        states, actions, rewards, next_states, dones = self.memory.sample(batch_size)

        # Convert to tensors
        states = torch.FloatTensor(states).to(self.device)
        actions = torch.LongTensor(actions).to(self.device)
        rewards = torch.FloatTensor(rewards).to(self.device)
        next_states = torch.FloatTensor(next_states).to(self.device)
        dones = torch.FloatTensor(dones).to(self.device)

        # Current Q-values: Q(s, a)
        current_q_values = self.q_network(states).gather(1, actions.unsqueeze(1)).squeeze(1)

        # Target Q-values: r + γ * max(Q(s', a'))
        with torch.no_grad():
            max_next_q_values = self.target_network(next_states).max(1)[0]
            target_q_values = rewards + self.gamma * max_next_q_values * (1 - dones)

        # Calculate loss with Huber loss which is more stable
        loss = torch.nn.functional.smooth_l1_loss(current_q_values, target_q_values)

        # Backpropagation
        self.optimizer.zero_grad()
        loss.backward()
        # Clip gradients to prevent exploding gradients
        torch.nn.utils.clip_grad_norm_(self.q_network.parameters(), max_norm=1.0)
        self.optimizer.step()

        self.total_steps += 1
        return loss.item()

    def update_target_network(self):
        """Update the target network with current Q-network weights"""
        self.target_network.load_state_dict(self.q_network.state_dict())

    def decay_epsilon(self):
        """Decay the exploration rate"""
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

    def save(self, filepath: str):
        """
        Save the model checkpoint
        
        Args:
            filepath: Path to save the model
        """
        checkpoint = {
            'q_network': self.q_network.state_dict(),
            'target_network': self.target_network.state_dict(),
            'optimizer': self.optimizer.state_dict(),
            'epsilon': self.epsilon,
            'total_steps': self.total_steps,
            'episodes_trained': self.episodes_trained,
            'hyperparameters': {
                'state_size': self.state_size,
                'action_size': self.action_size,
                'learning_rate': self.learning_rate,
                'gamma': self.gamma,
                'epsilon_decay': self.epsilon_decay,
                'epsilon_min': self.epsilon_min,
            }
        }
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        torch.save(checkpoint, filepath)

    def load(self, filepath: str):
        """
        Load a model checkpoint
        
        Args:
            filepath: Path to the checkpoint
        """
        checkpoint = torch.load(filepath, map_location=self.device)
        self.q_network.load_state_dict(checkpoint['q_network'])
        self.target_network.load_state_dict(checkpoint['target_network'])
        self.optimizer.load_state_dict(checkpoint['optimizer'])
        self.epsilon = checkpoint['epsilon']
        self.total_steps = checkpoint['total_steps']
        self.episodes_trained = checkpoint['episodes_trained']

    def get_info(self) -> dict:
        """Get agent information"""
        return {
            'epsilon': self.epsilon,
            'total_steps': self.total_steps,
            'episodes_trained': self.episodes_trained,
            'memory_size': len(self.memory),
            'learning_rate': self.learning_rate,
            'gamma': self.gamma,
        }
