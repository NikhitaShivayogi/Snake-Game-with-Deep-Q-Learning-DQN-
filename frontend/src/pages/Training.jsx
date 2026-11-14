import React, { useState, useEffect } from 'react';
import { trainingAPI, modelAPI, createTrainingWebSocket } from '../services/api';

export const Training = () => {
  const [isTraining, setIsTraining] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trainingStats, setTrainingStats] = useState(null);
  const [error, setError] = useState(null);
  const [completionMessage, setCompletionMessage] = useState(null);

  // Training configuration
  const [episodes, setEpisodes] = useState(100);
  const [learningRate, setLearningRate] = useState(0.001);
  const [gamma, setGamma] = useState(0.99);
  const [epsilon, setEpsilon] = useState(1.0);

  // Current training data
  const [currentEpisode, setCurrentEpisode] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  useEffect(() => {
    // Fetch initial status
    const fetchStatus = async () => {
      try {
        const res = await trainingAPI.getTrainingStatus();
        setTrainingStats(res.data);
        setIsTraining(res.data.is_training);
        setIsPaused(res.data.is_paused);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isTraining) return;

    // Set up WebSocket for real-time updates
    const ws = createTrainingWebSocket(
      (message) => {
        if (message.type === 'training_update' && message.data) {
          setCurrentEpisode(message.data.episode || 0);
          setCurrentScore(message.data.score || 0);
          setBestScore(message.data.best_score || 0);
          setCompletionMessage(null);
        } else if (message.type === 'training_complete') {
          setIsTraining(false);
          setIsPaused(false);
          setCompletionMessage({
            title: 'Training Complete! 🎉',
            message: message.message || 'Training finished successfully',
            data: message.data
          });
        }
      },
      (err) => {
        console.error('WebSocket error:', err);
      }
    );

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [isTraining]);

  const handleStartTraining = async () => {
    try {
      setError(null);
      await trainingAPI.startTraining(episodes, learningRate, gamma, epsilon);
      setIsTraining(true);
      setIsPaused(false);
      setCurrentEpisode(0);
      setCurrentScore(0);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePauseTraining = async () => {
    try {
      await trainingAPI.pauseTraining();
      setIsPaused(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleResumeTraining = async () => {
    try {
      await trainingAPI.resumeTraining();
      setIsPaused(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStopTraining = async () => {
    try {
      await trainingAPI.stopTraining();
      setIsTraining(false);
      setIsPaused(false);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>AI Training</h1>
        <p style={{ color: '#b0b8d4', marginTop: '0.5rem' }}>
          Configure and monitor DQN agent training
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          Error: {error}
        </div>
      )}

      {completionMessage && (
        <div className="alert alert-success" style={{ marginBottom: '2rem', padding: '1.5rem', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {completionMessage.title}
          </div>
          <div style={{ marginBottom: '1rem' }}>{completionMessage.message}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <strong>Total Episodes:</strong> {completionMessage.data?.total_episodes || 0}
            </div>
            <div>
              <strong>Best Score:</strong> {completionMessage.data?.best_score || 0}
            </div>
            <div>
              <strong>Average Score:</strong> {completionMessage.data?.average_score?.toFixed(2) || '0.00'}
            </div>
            <div>
              <strong>Total Reward:</strong> {completionMessage.data?.total_reward?.toFixed(2) || '0.00'}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Training Configuration</div>
          <div className="card-content">
            <div className="control-group">
              <label>Number of Episodes</label>
              <input
                type="number"
                min="10"
                max="10000"
                value={episodes}
                onChange={(e) => setEpisodes(parseInt(e.target.value) || 100)}
                disabled={isTraining}
              />
            </div>

            <div className="control-group">
              <label>Learning Rate (α)</label>
              <input
                type="number"
                min="0.0001"
                max="0.1"
                step="0.0001"
                value={learningRate}
                onChange={(e) => setLearningRate(parseFloat(e.target.value) || 0.001)}
                disabled={isTraining}
              />
              <small style={{ color: '#888', fontSize: '0.85rem' }}>
                Controls how much the weights are updated: higher = faster learning but less stable
              </small>
            </div>

            <div className="control-group">
              <label>Discount Factor (γ)</label>
              <input
                type="number"
                min="0"
                max="0.999"
                step="0.01"
                value={gamma}
                onChange={(e) => setGamma(parseFloat(e.target.value) || 0.99)}
                disabled={isTraining}
              />
              <small style={{ color: '#888', fontSize: '0.85rem' }}>
                How much future rewards matter: higher = considers long-term rewards
              </small>
            </div>

            <div className="control-group">
              <label>Initial Epsilon (ε)</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={epsilon}
                onChange={(e) => setEpsilon(parseFloat(e.target.value) || 1.0)}
                disabled={isTraining}
              />
              <small style={{ color: '#888', fontSize: '0.85rem' }}>
                Exploration rate: higher = more random actions during training
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
              {!isTraining ? (
                <button className="btn-primary" onClick={handleStartTraining}>
                  Start Training
                </button>
              ) : (
                <>
                  {!isPaused ? (
                    <button className="btn-warning" onClick={handlePauseTraining}>
                      Pause Training
                    </button>
                  ) : (
                    <button className="btn-success" onClick={handleResumeTraining}>
                      Resume Training
                    </button>
                  )}
                  <button className="btn-danger" onClick={handleStopTraining}>
                    Stop Training
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Training Progress</div>
          <div className="card-content">
            <div style={{ marginBottom: '1rem' }}>
              <span className="status-indicator" style={{
                backgroundColor: isTraining ? '#00ff88' : '#666666',
                animation: isTraining && !isPaused ? 'pulse 2s ease-in-out infinite' : 'none'
              }}></span>
              <span>
                {isTraining ? (isPaused ? 'Training Paused' : 'Training Active') : 'Idle'}
              </span>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '1rem',
              borderRadius: '6px',
              marginTop: '1rem'
            }}>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <strong>Episode:</strong> {currentEpisode} / {episodes}
              </div>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                <strong>Current Score:</strong> {currentScore}
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <strong>Best Score:</strong> {bestScore}
              </div>
            </div>

            {trainingStats && (
              <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                <div style={{ marginBottom: '0.3rem' }}>
                  <strong>Average Score:</strong> {trainingStats.average_score?.toFixed(2) || 'N/A'}
                </div>
                <div style={{ marginBottom: '0.3rem' }}>
                  <strong>Epsilon:</strong> {trainingStats.epsilon?.toFixed(4) || 'N/A'}
                </div>
                <div>
                  <strong>Memory Size:</strong> {trainingStats.memory_size || 0}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-title">Training Information</div>
        <div className="card-content">
          <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>Deep Q-Learning Process</h3>
          <p>
            The agent learns through Deep Q-Learning by:
          </p>
          <ul style={{ marginLeft: '1.5rem', color: '#b0b8d4' }}>
            <li><strong>Exploration:</strong> Takes random actions initially (controlled by ε)</li>
            <li><strong>Experience Replay:</strong> Learns from past experiences stored in memory</li>
            <li><strong>Q-Value Updates:</strong> Updates Q-values using the Bellman equation</li>
            <li><strong>Target Network:</strong> Uses a stable target network for stability</li>
            <li><strong>Decay:</strong> Gradually reduces exploration as training progresses</li>
          </ul>

          <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>Reward Structure</h3>
          <ul style={{ marginLeft: '1.5rem', color: '#b0b8d4' }}>
            <li><strong>+10:</strong> Eating food</li>
            <li><strong>-10:</strong> Collision (wall or self)</li>
            <li><strong>-0.01:</strong> Each step without eating (encourages efficiency)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
