"""
DQN Agent Training Module
Handles training loop, statistics collection, and model checkpointing
"""

import numpy as np
from typing import Dict, List, Optional, Callable
import json
import os
from datetime import datetime
from backend.agent.environment import SnakeEnvironment
from backend.agent.dqn_agent import DQNAgent


class Trainer:
    """
    Trainer for DQN Agent
    Manages the training process, collects statistics, and saves models
    """

    def __init__(self, agent: DQNAgent, env: SnakeEnvironment, 
                 save_dir: str = './saved_models',
                 log_dir: str = './training_logs'):
        """
        Initialize the trainer
        
        Args:
            agent: DQN agent to train
            env: Game environment
            save_dir: Directory to save models
            log_dir: Directory to save training logs
        """
        self.agent = agent
        self.env = env
        self.save_dir = save_dir
        self.log_dir = log_dir
        
        os.makedirs(save_dir, exist_ok=True)
        os.makedirs(log_dir, exist_ok=True)
        
        # Training statistics
        self.episode_rewards: List[float] = []
        self.episode_scores: List[int] = []
        self.episode_lengths: List[int] = []
        self.best_score = 0
        self.best_episode = 0
        self.loss_history: List[float] = []
        
        # Training state
        self.is_training = False
        self.is_paused = False
        self.current_episode = 0
        self.total_episodes = 0

    def train_episode(self, max_steps: int = 500) -> Dict:
        """
        Train for one episode
        
        Args:
            max_steps: Maximum steps per episode
            
        Returns:
            Episode statistics
        """
        state = self.env.reset()
        episode_reward = 0
        episode_loss = 0
        loss_count = 0
        step = 0

        while step < max_steps:
            # Select and take action
            action = self.agent.select_action(state, training=True)
            next_state, reward, done, info = self.env.step(action)

            # Remember experience
            self.agent.remember(state, action, reward, next_state, done)

            # Train on batch - do it once per step when buffer has enough data
            loss = self.agent.replay(batch_size=32)
            if loss > 0:
                episode_loss += loss
                loss_count += 1

            episode_reward += reward
            state = next_state
            step += 1

            if done:
                break

        # Update target network more frequently to stabilize learning
        if (self.agent.episodes_trained + 1) % 3 == 0:
            self.agent.update_target_network()

        # Decay epsilon more slowly to maintain exploration longer
        self.agent.decay_epsilon()
        self.agent.episodes_trained += 1

        # Record statistics
        score = self.env.get_score()
        avg_loss = episode_loss / max(loss_count, 1)
        
        self.episode_rewards.append(episode_reward)
        self.episode_scores.append(score)
        self.episode_lengths.append(step)
        self.loss_history.append(avg_loss)

        if score > self.best_score:
            self.best_score = score
            self.best_episode = self.agent.episodes_trained

        return {
            'episode': self.agent.episodes_trained,
            'reward': episode_reward,
            'score': score,
            'length': step,
            'loss': avg_loss,
            'epsilon': self.agent.epsilon,
            'best_score': self.best_score,
        }

    def train(self, episodes: int, callback: Optional[Callable] = None) -> Dict:
        """
        Train the agent for multiple episodes
        
        Args:
            episodes: Number of episodes to train
            callback: Optional callback function to report progress
            
        Returns:
            Training results
        """
        self.is_training = True
        self.total_episodes = episodes
        self.current_episode = 0
        
        # Reset training if starting fresh
        if self.agent.episodes_trained == 0:
            self.episode_rewards = []
            self.episode_scores = []
            self.episode_lengths = []
            self.loss_history = []
            self.best_score = 0
            self.best_episode = 0

        for episode in range(episodes):
            # CRITICAL: Check if training should stop
            if not self.is_training:
                break

            # Skip if paused
            while self.is_paused and self.is_training:
                import time
                time.sleep(0.1)
                continue

            self.current_episode = episode + 1
            stats = self.train_episode()
            
            # CRITICAL: Set exact episode count - use loop counter, not agent counter
            stats['current_episode'] = self.current_episode
            stats['total_episodes'] = episodes

            if callback:
                callback(stats)
            
            # SAFETY: Stop immediately at exact episode limit
            if self.current_episode >= episodes:
                break

        self.is_training = False
        
        # Save training history (for analytics to read), but NOT the model
        # Model should only be saved when user clicks "SAVE MODEL" button
        self.save_training_history('history')

        return self.get_training_summary()

    def get_training_summary(self) -> Dict:
        """Get summary of training results"""
        if not self.episode_scores:
            return {
                'total_episodes': 0,
                'best_score': 0,
                'average_score': 0,
                'total_food_eaten': 0,
                'total_reward': 0,
                'epsilon': self.agent.epsilon,
            }

        total_food = sum(self.episode_scores)  # Food eaten is the score
        total_reward = sum(self.episode_rewards)  # FIXED: Calculate actual total
        
        return {
            'total_episodes': len(self.episode_scores),
            'best_score': self.best_score,
            'best_episode': self.best_episode,
            'average_score': np.mean(self.episode_scores),
            'average_score_last_10': np.mean(self.episode_scores[-10:]) if len(self.episode_scores) >= 10 else np.mean(self.episode_scores),
            'total_food_eaten': total_food,
            'total_reward': total_reward,  # FIXED: Now shows actual sum
            'average_reward': np.mean(self.episode_rewards),
            'epsilon': self.agent.epsilon,
        }

    def save_model(self, name: str = 'model') -> str:
        """
        Save the trained model
        
        Args:
            name: Model name
            
        Returns:
            Path to saved model
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filepath = os.path.join(self.save_dir, f'{name}_{timestamp}.pt')
        self.agent.save(filepath)
        return filepath

    def load_model(self, filepath: str):
        """
        Load a trained model
        
        Args:
            filepath: Path to model checkpoint
        """
        self.agent.load(filepath)

    def save_training_history(self, name: str = 'history') -> str:
        """
        Save training history to JSON
        
        Args:
            name: History file name
            
        Returns:
            Path to saved history
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filepath = os.path.join(self.log_dir, f'{name}_{timestamp}.json')
        
        history = {
            'episodes': len(self.episode_scores),
            'episode_scores': self.episode_scores,
            'episode_rewards': self.episode_rewards,
            'episode_lengths': self.episode_lengths,
            'loss_history': self.loss_history,
            'best_score': self.best_score,
            'best_episode': self.best_episode,
            'final_epsilon': self.agent.epsilon,
            'summary': self.get_training_summary(),
        }
        
        with open(filepath, 'w') as f:
            json.dump(history, f, indent=2)
        
        return filepath

    def get_stats(self) -> Dict:
        """Get current training statistics"""
        if not self.episode_scores:
            return {
                'episodes_trained': 0,
                'current_score': 0,
                'best_score': 0,
                'average_score': 0,
                'epsilon': self.agent.epsilon,
                'memory_size': len(self.agent.memory),
                'is_training': self.is_training,
                'is_paused': self.is_paused,
            }

        return {
            'episodes_trained': len(self.episode_scores),
            'current_score': self.episode_scores[-1] if self.episode_scores else 0,
            'best_score': self.best_score,
            'average_score': np.mean(self.episode_scores[-10:]) if len(self.episode_scores) >= 10 else np.mean(self.episode_scores),
            'epsilon': self.agent.epsilon,
            'memory_size': len(self.agent.memory),
            'is_training': self.is_training,
            'is_paused': self.is_paused,
            'current_episode': self.current_episode,
            'total_episodes': self.total_episodes,
        }

    def pause(self):
        """Pause training"""
        self.is_paused = True

    def resume(self):
        """Resume training"""
        self.is_paused = False

    def stop(self):
        """Stop training"""
        self.is_training = False

    def get_history(self) -> Dict:
        """Get complete training history"""
        return {
            'episode_scores': self.episode_scores,
            'episode_rewards': self.episode_rewards,
            'episode_lengths': self.episode_lengths,
            'loss_history': self.loss_history,
            'best_score': self.best_score,
            'best_episode': self.best_episode,
        }
