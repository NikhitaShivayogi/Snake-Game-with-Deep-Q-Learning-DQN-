"""
Game Environment for DQN Agent
Defines state representation, actions, and rewards
"""

import numpy as np
from typing import Tuple
from backend.game.snake_game import SnakeGame, Direction


class SnakeEnvironment:
    """
    Environment wrapper for Snake game
    Provides state representation, actions, and rewards for the DQN agent
    """

    def __init__(self, width: int = 20, height: int = 20):
        """
        Initialize the environment
        
        Args:
            width: Game board width
            height: Game board height
        """
        self.game = SnakeGame(width=width, height=height)
        self.width = width
        self.height = height

    def reset(self) -> np.ndarray:
        """
        Reset the environment
        
        Returns:
            Initial state
        """
        self.game.reset()
        return self._get_state()

    def _get_state(self) -> np.ndarray:
        """
        Get the current state representation
        
        State consists of 11 features:
        1. Danger straight (1 if collision ahead, 0 otherwise)
        2. Danger left (1 if collision to the left, 0 otherwise)
        3. Danger right (1 if collision to the right, 0 otherwise)
        4. Current direction UP (1 if moving up, 0 otherwise)
        5. Current direction DOWN
        6. Current direction LEFT
        7. Current direction RIGHT
        8. Food is left of snake (1 if yes, 0 otherwise)
        9. Food is right of snake
        10. Food is above snake
        11. Food is below snake
        
        Returns:
            State as numpy array of shape (11,)
        """
        head = self.game.snake[0]
        food = self.game.food
        direction = self.game.direction

        # Check dangers in three directions: straight, left, right
        # Based on current direction
        straight_pos = (head[0] + direction.value[0], head[1] + direction.value[1])
        
        # Calculate left and right directions relative to current direction
        if direction == Direction.UP:
            left_pos = (head[0] - 1, head[1])
            right_pos = (head[0] + 1, head[1])
        elif direction == Direction.DOWN:
            left_pos = (head[0] + 1, head[1])
            right_pos = (head[0] - 1, head[1])
        elif direction == Direction.LEFT:
            left_pos = (head[0], head[1] + 1)
            right_pos = (head[0], head[1] - 1)
        else:  # RIGHT
            left_pos = (head[0], head[1] - 1)
            right_pos = (head[0], head[1] + 1)

        # Check if positions are valid and not occupied by snake
        def is_danger(pos):
            x, y = pos
            if not (0 <= x < self.width and 0 <= y < self.height):
                return 1  # Wall collision
            if pos in self.game.snake:
                return 1  # Self collision
            return 0

        danger_straight = is_danger(straight_pos)
        danger_left = is_danger(left_pos)
        danger_right = is_danger(right_pos)

        # Direction encoding
        dir_up = 1 if direction == Direction.UP else 0
        dir_down = 1 if direction == Direction.DOWN else 0
        dir_left = 1 if direction == Direction.LEFT else 0
        dir_right = 1 if direction == Direction.RIGHT else 0

        # Food position relative to snake head
        food_left = 1 if food[0] < head[0] else 0
        food_right = 1 if food[0] > head[0] else 0
        food_up = 1 if food[1] < head[1] else 0
        food_down = 1 if food[1] > head[1] else 0

        # Combine all features
        state = np.array([
            float(danger_straight),
            float(danger_left),
            float(danger_right),
            float(dir_up),
            float(dir_down),
            float(dir_left),
            float(dir_right),
            float(food_left),
            float(food_right),
            float(food_up),
            float(food_down),
        ], dtype=np.float32)

        return state

    def step(self, action: int) -> Tuple[np.ndarray, float, bool, dict]:
        """
        Take a step in the environment
        
        Args:
            action: Action index (0=UP, 1=DOWN, 2=LEFT, 3=RIGHT)
            
        Returns:
            Tuple of (next_state, reward, done, info)
        """
        # Convert action to direction
        action_to_direction = {
            0: Direction.UP,
            1: Direction.DOWN,
            2: Direction.LEFT,
            3: Direction.RIGHT,
        }
        
        # Calculate distance before move
        head_before = self.game.snake[0]
        food_pos = self.game.food
        dist_before = abs(head_before[0] - food_pos[0]) + abs(head_before[1] - food_pos[1])
        
        direction = action_to_direction[action]
        self.game.set_direction(direction)

        # Step the game
        reward, done, info = self.game.step()

        # Get next state
        next_state = self._get_state()
        
        # REWARD SHAPING: Guide the agent to move toward food
        # This intermediate reward helps the agent learn the policy faster
        if not done and 'food_eaten' not in info:
            head_after = self.game.snake[0]
            dist_after = abs(head_after[0] - food_pos[0]) + abs(head_after[1] - food_pos[1])
            
            # Small reward for moving closer, penalty for moving farther
            # The magnitude is small so it doesn't overwhelm food reward
            if dist_after < dist_before:
                reward += 0.1  # Moving closer is good
            elif dist_after > dist_before:
                reward -= 0.05  # Moving away is bad

        return next_state, reward, done, info

    def render(self, display_surface, **kwargs):
        """Render the game"""
        self.game.render(display_surface, **kwargs)

    def get_state(self) -> dict:
        """Get full game state"""
        return self.game.get_state()

    def get_score(self) -> int:
        """Get current score"""
        return self.game.score
