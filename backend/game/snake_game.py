"""
Snake Game Engine
Implements the core game mechanics for both human and AI players
"""

import pygame
import numpy as np
from enum import Enum
from collections import deque
from typing import Tuple, List, Optional


class Direction(Enum):
    """Direction enum for snake movement"""
    UP = (0, -1)
    DOWN = (0, 1)
    LEFT = (-1, 0)
    RIGHT = (1, 0)


class GameState(Enum):
    """Game state enum"""
    RUNNING = 1
    GAME_OVER = 2
    PAUSED = 3


class SnakeGame:
    """
    Core Snake Game Engine
    Handles game mechanics, collisions, and state management
    """

    def __init__(self, width: int = 20, height: int = 20, grid_size: int = 20):
        """
        Initialize the Snake game
        
        Args:
            width: Grid width in cells
            height: Grid height in cells
            grid_size: Pixel size per cell (for rendering)
        """
        self.width = width
        self.height = height
        self.grid_size = grid_size
        
        # Game state
        self.snake: deque = deque()
        self.food: Optional[Tuple[int, int]] = None
        self.direction = Direction.RIGHT
        self.next_direction = Direction.RIGHT
        self.score = 0
        self.game_over = False
        self.step_count = 0
        self.max_steps_without_food = width * height * 2  # Prevent infinite loops
        
        # Initialize game
        self._reset_game()

    def _reset_game(self):
        """Reset the game to initial state"""
        self.snake = deque()
        # Start snake in the middle
        start_x = self.width // 2
        start_y = self.height // 2
        self.snake.append((start_x, start_y))
        self.snake.append((start_x - 1, start_y))
        self.snake.append((start_x - 2, start_y))
        
        self.direction = Direction.RIGHT
        self.next_direction = Direction.RIGHT
        self.score = 0
        self.game_over = False
        self.step_count = 0
        self._spawn_food()

    def _spawn_food(self):
        """Spawn food at a random location not occupied by snake"""
        while True:
            x = np.random.randint(0, self.width)
            y = np.random.randint(0, self.height)
            if (x, y) not in self.snake:
                self.food = (x, y)
                break

    def reset(self):
        """Reset the game"""
        self._reset_game()
        return self.get_state()

    def set_direction(self, direction: Direction) -> bool:
        """
        Set the next direction for the snake
        Prevents the snake from moving directly into itself
        
        Args:
            direction: New direction
            
        Returns:
            Whether the direction was valid
        """
        # Prevent 180-degree turns
        if (self.direction.value[0] * -1, self.direction.value[1] * -1) == direction.value:
            return False
        self.next_direction = direction
        return True

    def step(self) -> Tuple[int, bool, dict]:
        """
        Advance the game by one step (snake moves automatically)
        
        Returns:
            Tuple of (reward, game_over, info)
        """
        if self.game_over:
            return 0, True, {}

        # Apply next direction if it's valid (user changed direction)
        if self.next_direction != self.direction:
            # Check if it's a valid direction change (not 180 degrees)
            if (self.direction.value[0] * -1, self.direction.value[1] * -1) != self.next_direction.value:
                self.direction = self.next_direction
        
        self.step_count += 1

        # Calculate new head position (snake moves in current direction automatically)
        head_x, head_y = self.snake[0]
        dx, dy = self.direction.value
        new_head = (head_x + dx, head_y + dy)

        reward = 0
        info = {}

        # Check wall collision
        if not (0 <= new_head[0] < self.width and 0 <= new_head[1] < self.height):
            self.game_over = True
            reward = -100  # Large penalty for hitting wall
            info["reason"] = "wall_collision"
            return reward, True, info

        # Check self collision
        if new_head in self.snake:
            self.game_over = True
            reward = -100  # Large penalty for self collision
            info["reason"] = "self_collision"
            return reward, True, info

        # Add new head
        self.snake.appendleft(new_head)

        # Check food collision
        if new_head == self.food:
            self.score += 1
            reward = 100  # Much higher reward for eating food (PRIMARY GOAL)
            self._spawn_food()
            self.step_count = 0  # Reset step counter on food
            info["food_eaten"] = True
        else:
            # Very minimal penalty for moving (encourage exploration)
            reward = -0.001  # Reduced from -0.01 to allow more steps
            self.snake.pop()

        # Check if stuck (moving without eating for too long)
        if self.step_count > self.max_steps_without_food:
            self.game_over = True
            reward -= 100  # Large penalty for not eating in time
            info["reason"] = "timeout"
            return reward, True, info

        return reward, False, info

    def get_state(self) -> dict:
        """Get current game state"""
        return {
            "snake": list(self.snake),
            "food": self.food,
            "score": self.score,
            "game_over": self.game_over,
            "direction": self.direction.name,
            "width": self.width,
            "height": self.height,
            "step_count": self.step_count
        }

    def render(self, display_surface, bg_color=(0, 0, 0), snake_color=(0, 255, 0), 
               food_color=(255, 0, 0), grid_color=(30, 30, 30)):
        """
        Render the game on a pygame surface
        
        Args:
            display_surface: Pygame surface to render on
            bg_color: Background color (RGB)
            snake_color: Snake color (RGB)
            food_color: Food color (RGB)
            grid_color: Grid color (RGB)
        """
        # Draw background
        display_surface.fill(bg_color)

        # Draw grid
        for x in range(0, self.width * self.grid_size, self.grid_size):
            pygame.draw.line(display_surface, grid_color, (x, 0), (x, self.height * self.grid_size))
        for y in range(0, self.height * self.grid_size, self.grid_size):
            pygame.draw.line(display_surface, grid_color, (0, y), (self.width * self.grid_size, y))

        # Draw snake
        for i, (x, y) in enumerate(self.snake):
            rect = pygame.Rect(x * self.grid_size, y * self.grid_size, self.grid_size, self.grid_size)
            # Head is brighter
            color = tuple(min(255, c + 100) for c in snake_color) if i == 0 else snake_color
            pygame.draw.rect(display_surface, color, rect)
            pygame.draw.rect(display_surface, (255, 255, 255), rect, 1)

        # Draw food
        if self.food:
            x, y = self.food
            rect = pygame.Rect(x * self.grid_size, y * self.grid_size, self.grid_size, self.grid_size)
            pygame.draw.rect(display_surface, food_color, rect)
            pygame.draw.circle(display_surface, (255, 255, 0), 
                             (x * self.grid_size + self.grid_size // 2, 
                              y * self.grid_size + self.grid_size // 2), 
                             self.grid_size // 3)

    @staticmethod
    def directions_to_actions() -> dict:
        """Get mapping of directions to action indices"""
        return {
            Direction.UP: 0,
            Direction.DOWN: 1,
            Direction.LEFT: 2,
            Direction.RIGHT: 3
        }

    @staticmethod
    def actions_to_directions() -> dict:
        """Get mapping of action indices to directions"""
        return {
            0: Direction.UP,
            1: Direction.DOWN,
            2: Direction.LEFT,
            3: Direction.RIGHT
        }
