"""
Training Visualization Module
Generates charts and graphs for training progress
"""

import matplotlib.pyplot as plt
import matplotlib
import numpy as np
import os
from typing import List, Dict, Optional

# Use non-interactive backend for server environment
matplotlib.use('Agg')


class TrainingVisualizer:
    """
    Visualizer for training progress
    Generates charts and saves them as images
    """

    def __init__(self, output_dir: str = './training_logs'):
        """
        Initialize the visualizer
        
        Args:
            output_dir: Directory to save charts
        """
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def plot_scores(self, scores: List[int], title: str = "Score per Episode") -> str:
        """
        Plot score progression
        
        Args:
            scores: List of scores per episode
            title: Chart title
            
        Returns:
            Path to saved image
        """
        plt.figure(figsize=(12, 6))
        plt.plot(scores, label='Score', color='#00ff00', linewidth=2)
        
        # Add moving average
        if len(scores) > 10:
            moving_avg = np.convolve(scores, np.ones(10)/10, mode='valid')
            plt.plot(range(9, len(scores)), moving_avg, label='10-Episode Average', 
                    color='#ff00ff', linewidth=2, linestyle='--')
        
        plt.xlabel('Episode', fontsize=12)
        plt.ylabel('Score', fontsize=12)
        plt.title(title, fontsize=14, fontweight='bold')
        plt.legend(fontsize=10)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, 'scores.png')
        plt.savefig(filepath, dpi=100, facecolor='#1a1a1a')
        plt.close()
        
        return filepath

    def plot_rewards(self, rewards: List[float], title: str = "Reward per Episode") -> str:
        """
        Plot reward progression
        
        Args:
            rewards: List of rewards per episode
            title: Chart title
            
        Returns:
            Path to saved image
        """
        plt.figure(figsize=(12, 6))
        plt.plot(rewards, label='Reward', color='#00aaff', linewidth=2, alpha=0.7)
        
        # Add moving average
        if len(rewards) > 10:
            moving_avg = np.convolve(rewards, np.ones(10)/10, mode='valid')
            plt.plot(range(9, len(rewards)), moving_avg, label='10-Episode Average', 
                    color='#ffaa00', linewidth=2, linestyle='--')
        
        plt.xlabel('Episode', fontsize=12)
        plt.ylabel('Total Reward', fontsize=12)
        plt.title(title, fontsize=14, fontweight='bold')
        plt.legend(fontsize=10)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, 'rewards.png')
        plt.savefig(filepath, dpi=100, facecolor='#1a1a1a')
        plt.close()
        
        return filepath

    def plot_loss(self, losses: List[float], title: str = "Training Loss") -> str:
        """
        Plot training loss
        
        Args:
            losses: List of losses per episode
            title: Chart title
            
        Returns:
            Path to saved image
        """
        plt.figure(figsize=(12, 6))
        plt.plot(losses, label='Loss', color='#ff4444', linewidth=1, alpha=0.7)
        
        # Add moving average
        if len(losses) > 20:
            moving_avg = np.convolve(losses, np.ones(20)/20, mode='valid')
            plt.plot(range(19, len(losses)), moving_avg, label='20-Episode Average', 
                    color='#ffaa00', linewidth=2, linestyle='--')
        
        plt.xlabel('Episode', fontsize=12)
        plt.ylabel('Loss', fontsize=12)
        plt.title(title, fontsize=14, fontweight='bold')
        plt.legend(fontsize=10)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, 'loss.png')
        plt.savefig(filepath, dpi=100, facecolor='#1a1a1a')
        plt.close()
        
        return filepath

    def plot_epsilon_decay(self, epsilons: List[float], title: str = "Exploration Rate (Epsilon) Decay") -> str:
        """
        Plot epsilon decay over training
        
        Args:
            epsilons: List of epsilon values per episode
            title: Chart title
            
        Returns:
            Path to saved image
        """
        plt.figure(figsize=(12, 6))
        plt.plot(epsilons, label='Epsilon', color='#00ff88', linewidth=2)
        
        plt.xlabel('Episode', fontsize=12)
        plt.ylabel('Epsilon (Exploration Rate)', fontsize=12)
        plt.title(title, fontsize=14, fontweight='bold')
        plt.legend(fontsize=10)
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        
        filepath = os.path.join(self.output_dir, 'epsilon.png')
        plt.savefig(filepath, dpi=100, facecolor='#1a1a1a')
        plt.close()
        
        return filepath

    def plot_combined_metrics(self, history: Dict) -> str:
        """
        Plot multiple metrics in one figure
        
        Args:
            history: Training history dictionary
            
        Returns:
            Path to saved image
        """
        scores = history.get('episode_scores', [])
        rewards = history.get('episode_rewards', [])
        losses = history.get('loss_history', [])
        
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.patch.set_facecolor('#1a1a1a')
        
        # Scores
        axes[0, 0].plot(scores, color='#00ff00', linewidth=2)
        axes[0, 0].set_title('Scores per Episode', fontweight='bold', color='white')
        axes[0, 0].set_xlabel('Episode')
        axes[0, 0].set_ylabel('Score')
        axes[0, 0].grid(True, alpha=0.3)
        axes[0, 0].set_facecolor('#2a2a2a')
        
        # Rewards
        axes[0, 1].plot(rewards, color='#00aaff', linewidth=1.5, alpha=0.7)
        axes[0, 1].set_title('Rewards per Episode', fontweight='bold', color='white')
        axes[0, 1].set_xlabel('Episode')
        axes[0, 1].set_ylabel('Total Reward')
        axes[0, 1].grid(True, alpha=0.3)
        axes[0, 1].set_facecolor('#2a2a2a')
        
        # Loss
        axes[1, 0].plot(losses, color='#ff4444', linewidth=1, alpha=0.7)
        axes[1, 0].set_title('Training Loss', fontweight='bold', color='white')
        axes[1, 0].set_xlabel('Episode')
        axes[1, 0].set_ylabel('Loss')
        axes[1, 0].grid(True, alpha=0.3)
        axes[1, 0].set_facecolor('#2a2a2a')
        
        # Statistics
        axes[1, 1].axis('off')
        stats_text = f"""
        Training Statistics
        
        Total Episodes: {len(scores)}
        Best Score: {max(scores) if scores else 0}
        Average Score: {np.mean(scores):.2f}
        Current Score: {scores[-1] if scores else 0}
        
        Total Reward: {sum(rewards):.2f}
        Average Reward: {np.mean(rewards):.2f}
        """
        axes[1, 1].text(0.1, 0.5, stats_text, fontsize=11, family='monospace',
                       verticalalignment='center', color='white')
        axes[1, 1].set_facecolor('#2a2a2a')
        
        plt.tight_layout()
        filepath = os.path.join(self.output_dir, 'combined_metrics.png')
        plt.savefig(filepath, dpi=100, facecolor='#1a1a1a')
        plt.close()
        
        return filepath

    def generate_all_charts(self, history: Dict) -> Dict[str, str]:
        """
        Generate all training charts
        
        Args:
            history: Training history
            
        Returns:
            Dictionary of chart file paths
        """
        charts = {}
        
        if 'episode_scores' in history and history['episode_scores']:
            # Calculate epsilon values from episode count
            epsilons = []
            epsilon = 1.0
            epsilon_decay = 0.9995
            epsilon_min = 0.01
            for i in range(len(history['episode_scores'])):
                epsilons.append(epsilon)
                if epsilon > epsilon_min:
                    epsilon *= epsilon_decay
            
            charts['scores'] = self.plot_scores(history['episode_scores'])
            charts['rewards'] = self.plot_rewards(history['episode_rewards'])
            charts['loss'] = self.plot_loss(history['loss_history'])
            charts['epsilon'] = self.plot_epsilon_decay(epsilons)
            charts['combined'] = self.plot_combined_metrics(history)
        
        return charts
