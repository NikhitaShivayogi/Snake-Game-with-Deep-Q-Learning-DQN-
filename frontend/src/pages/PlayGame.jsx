import React, { useState, useEffect, useRef } from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { gameAPI } from '../services/api';

export const PlayGame = () => {
  const [mode, setMode] = useState('human'); // human or ai
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameActive, setGameActive] = useState(false);
  const [foodEaten, setFoodEaten] = useState(0);
  const [aiGameEndMessage, setAiGameEndMessage] = useState(null);
  const [showGameOverFace, setShowGameOverFace] = useState(false);
  const gameLoopRef = useRef(null);
  const gameStateRef = useRef(null);

  useEffect(() => {
    // Clean up any running game when mode changes
    if (gameLoopRef.current) {
      if (gameLoopRef.current.isRunning !== undefined) {
        gameLoopRef.current.isRunning = false;
      }
      if (gameLoopRef.current.timeoutId) {
        clearTimeout(gameLoopRef.current.timeoutId);
      }
    }
    initializeGame();
  }, [mode]);

  const initializeGame = async () => {
    try {
      setLoading(true);
      if (mode === 'human') {
        const res = await gameAPI.resetHumanGame();
        setGameState(res.data);
      } else {
        const res = await gameAPI.resetAIGame();
        setGameState(res.data);
      }
      setGameActive(false);
      setShowGameOverFace(false);
      setFoodEaten(0);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = () => {
    setGameActive(true);
    setFoodEaten(0);
    
    // Store running state in ref so we can control it from handleStopGame
    const gameState = { isRunning: true };
    gameLoopRef.current = gameState;

    if (mode === 'human') {
      // Human mode: continuous game loop (snake moves automatically after start)
      const gameLoop = async () => {
        try {
          // Check if game was stopped
          if (!gameState.isRunning) {
            return;
          }
          
          // Call step endpoint to move snake automatically
          const res = await gameAPI.stepHumanGame();
          
          if (res.data.game_over || !gameState.isRunning) {
            // Show the collision state first for 1.5 seconds
            setGameState(res.data);
            setGameActive(false);
            
            // After delay, show game over face
            setTimeout(() => {
              setShowGameOverFace(true);
            }, 1500);
            
            return;
          }

          // Track food eaten
          if (res.data.score > foodEaten) {
            setFoodEaten(res.data.score);
          }

          // Update display
          setGameState(res.data);
          
          // Continue loop - snake moves every 200ms (5 times per second)
          if (gameState.isRunning) {
            gameState.timeoutId = setTimeout(gameLoop, 200);
          }
        } catch (err) {
          setError(err.message);
          setGameActive(false);
        }
      };
      gameLoop();
    } else {
      // AI mode: AI plays automatically
      const gameLoop = async () => {
        try {
          // Check if game was stopped
          if (!gameState.isRunning) {
            return;
          }
          
          const autoRes = await gameAPI.autoPlayAI(1);
          setGameState(autoRes.data);
          
          if (autoRes.data.score > foodEaten) {
            setFoodEaten(autoRes.data.score);
          }

          if (!autoRes.data.game_over && gameState.isRunning) {
            gameState.timeoutId = setTimeout(gameLoop, 200);
          } else {
            setGameActive(false);
            // Show the collision state first for 1.5 seconds
            setGameState(autoRes.data);
            
            // After delay, show game over face and message
            setTimeout(() => {
              setShowGameOverFace(true);
              setAiGameEndMessage(`🤖 AI Game Over! Final Score: ${autoRes.data.score}, Food Eaten: ${autoRes.data.score}, Snake Length: ${autoRes.data.snake?.length || 0}`);
              setTimeout(() => setAiGameEndMessage(null), 5000);
            }, 1500);
          }
        } catch (err) {
          setError(err.message);
          setGameActive(false);
        }
      };
      gameLoop();
    }
  };

  const handlePlayAgain = async () => {
    setGameActive(false);
    setShowGameOverFace(false);
    // Clean up any existing timeout
    if (gameLoopRef.current && gameLoopRef.current.timeoutId) {
      clearTimeout(gameLoopRef.current.timeoutId);
    }
    gameLoopRef.current = null;
    
    // Just reset the game - don't start playing
    await initializeGame();
  };

  const handleResetGame = async () => {
    // STOP THE GAME LOOP COMPLETELY
    setGameActive(false);
    setShowGameOverFace(false);
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    // Reset the game state
    await initializeGame();
  };
  
  const handleStopGame = async () => {
    // COMPLETELY STOP THE GAME - don't restart
    setGameActive(false);
    if (gameLoopRef.current) {
      if (gameLoopRef.current.isRunning !== undefined) {
        gameLoopRef.current.isRunning = false;
      }
      if (gameLoopRef.current.timeoutId) {
        clearTimeout(gameLoopRef.current.timeoutId);
      }
      gameLoopRef.current = null;
    }
    // Don't call initializeGame() - just stop
  };

  useEffect(() => {
    if (!gameActive || mode !== 'human') return;

    const handleKeyPress = async (e) => {
      const keyMap = {
        'ArrowUp': 'UP',
        'ArrowDown': 'DOWN',
        'ArrowLeft': 'LEFT',
        'ArrowRight': 'RIGHT',
        'w': 'UP',
        'W': 'UP',
        's': 'DOWN',
        'S': 'DOWN',
        'a': 'LEFT',
        'A': 'LEFT',
        'd': 'RIGHT',
        'D': 'RIGHT',
      };

      const direction = keyMap[e.key];
      if (!direction) return;

      e.preventDefault();
      
      // Send direction change to server (fire and forget)
      // Server will apply direction on next step
      try {
        await gameAPI.moveHumanSnake(direction);
      } catch (err) {
        console.error('Direction change error:', err);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameActive, mode]);

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        if (gameLoopRef.current.isRunning !== undefined) {
          gameLoopRef.current.isRunning = false;
        }
        if (gameLoopRef.current.timeoutId) {
          clearTimeout(gameLoopRef.current.timeoutId);
        }
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1>Play Snake</h1>
        </div>
        <div className="spinner"><div className="loading"></div></div>
      </div>
    );
  }

  // Game Over Screen
  if (gameState?.game_over && !gameActive) {
    return (
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h1>Play Snake</h1>
        </div>

        {error && (
          <div className="alert alert-error">
            Error: {error}
          </div>
        )}

        <div className="game-board" style={{ position: 'relative', zIndex: 1, marginBottom: '2rem' }}>
          <GameCanvas gameState={gameState} gridSize={25} showGameOverFace={showGameOverFace} />
        </div>

        {showGameOverFace && (
          <div className="card" style={{ marginBottom: '2rem', textAlign: 'center', padding: '3rem' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff6b6b' }}>Game Over</h2>
            
            <div className="grid grid-3" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
              <div className="stat-card" style={{ backgroundColor: '#2a3a4a', borderRadius: '8px', padding: '1.5rem' }}>
                <div className="stat-label">Score</div>
                <div className="stat-value" style={{ fontSize: '2.5rem', color: '#FFD700' }}>
                  {gameState?.score || 0}
                </div>
              </div>
              <div className="stat-card" style={{ backgroundColor: '#2a3a4a', borderRadius: '8px', padding: '1.5rem' }}>
                <div className="stat-label">Food Eaten</div>
                <div className="stat-value" style={{ fontSize: '2.5rem', color: '#FF6B6B' }}>
                  {gameState?.score || 0}
                </div>
              </div>
              <div className="stat-card" style={{ backgroundColor: '#2a3a4a', borderRadius: '8px', padding: '1.5rem' }}>
                <div className="stat-label">Snake Length</div>
                <div className="stat-value" style={{ fontSize: '2.5rem', color: '#00ff88' }}>
                  {gameState?.snake?.length || 0}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button className="btn-primary" onClick={handlePlayAgain} style={{ cursor: 'pointer', padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                Play Again
              </button>
              <button className="btn-secondary" onClick={handleResetGame} style={{ cursor: 'pointer', padding: '0.75rem 2rem', fontSize: '1.1rem' }}>
                Back to Menu
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Game Screen
  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Play Snake</h1>
        <p style={{ color: '#b0b8d4', marginTop: '0.5rem' }}>
          {mode === 'human' ? 'Play manually using arrow keys' : 'Watch AI agent play autonomously'}
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          Error: {error}
        </div>
      )}

      {aiGameEndMessage && (
        <div className="alert alert-success" style={{ fontSize: '1.1rem', textAlign: 'center', padding: '1.5rem' }}>
          {aiGameEndMessage}
        </div>
      )}

      <div className="card" style={{ marginBottom: '2rem', position: 'relative', zIndex: 100 }}>
        <div className="control-group" style={{ position: 'relative', zIndex: 100 }}>
          <label style={{ minWidth: '100px' }}>Game Mode</label>
          <select 
            value={mode} 
            onChange={(e) => setMode(e.target.value)} 
            disabled={gameActive}
            style={{ 
              minWidth: '200px',
              padding: '0.75rem 1rem',
              backgroundColor: '#252d45',
              border: '1px solid #404b63',
              color: '#ffffff',
              borderRadius: '6px',
              cursor: gameActive ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              position: 'relative',
              zIndex: 101
            }}
          >
            <option value="human" style={{ backgroundColor: '#252d45', color: '#ffffff' }}>Human Player</option>
            <option value="ai" style={{ backgroundColor: '#252d45', color: '#ffffff' }}>AI Player</option>
          </select>
        </div>
      </div>

      <div className="game-board" style={{ position: 'relative', zIndex: 1 }}>
        <GameCanvas gameState={gameState} gridSize={25} showGameOverFace={showGameOverFace} />
        <div style={{ textAlign: 'center', marginTop: '1rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {!gameActive ? (
              <button className="btn-primary" onClick={handleStartGame} style={{ position: 'relative', zIndex: 10, cursor: 'pointer', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                Start Game
              </button>
            ) : (
              <button className="btn-danger" onClick={handleStopGame} style={{ position: 'relative', zIndex: 10, cursor: 'pointer', padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
                Stop Game
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-3" style={{ marginTop: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">Score</div>
          <div className="stat-value">{gameState?.score || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Snake Length</div>
          <div className="stat-value">{gameState?.snake?.length || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>
            {gameActive ? '▶️ Playing' : '⏸️ Ready'}
          </div>
        </div>
      </div>

      {mode === 'human' && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <div className="card-title">Controls</div>
          <div className="card-content">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div><strong>Arrow Keys</strong> or <strong>WASD</strong> to move</div>
              <div>Eat food to increase score</div>
              <div>Avoid walls and yourself</div>
              <div>Click "Stop Game" to end</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
