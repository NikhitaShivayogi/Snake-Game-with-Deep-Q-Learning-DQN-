import React, { useState, useEffect } from 'react';
import { trainingAPI, modelAPI } from '../services/api';

export const Dashboard = () => {
  const [trainingStats, setTrainingStats] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, modelRes] = await Promise.all([
          trainingAPI.getTrainingStatus(),
          modelAPI.getAgentInfo(),
        ]);
        setTrainingStats(statsRes.data);
        setModelInfo(modelRes.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Dashboard</h1>
        <p style={{ color: '#b0b8d4', marginTop: '0.5rem' }}>
          AI Training Status and Performance Overview
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          Error: {error}
        </div>
      )}

      {loading && !trainingStats ? (
        <div className="spinner"><div className="loading"></div></div>
      ) : (
        <>
          <div className="grid grid-3">
            <div className="stat-card">
              <div className="stat-label">Episodes Trained</div>
              <div className="stat-value">
                {trainingStats?.episodes_trained || 0}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Best Score</div>
              <div className="stat-value">
                {trainingStats?.best_score || 0}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">
                {trainingStats?.average_score?.toFixed(2) || '0.00'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Current Score</div>
              <div className="stat-value">
                {trainingStats?.current_score || 0}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Exploration Rate</div>
              <div className="stat-value">
                {trainingStats?.epsilon?.toFixed(4) || '0.0000'}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Memory Buffer</div>
              <div className="stat-value">
                {trainingStats?.memory_size || 0}
              </div>
            </div>
          </div>

          <div className="grid grid-2" style={{ marginTop: '2rem' }}>
            <div className="card">
              <div className="card-title">Training Status</div>
              <div className="card-content">
                <div style={{ marginBottom: '1rem' }}>
                  <span className="status-indicator" style={{
                    backgroundColor: trainingStats?.is_training ? '#00ff88' : '#666666',
                    animation: trainingStats?.is_training ? 'pulse 2s ease-in-out infinite' : 'none'
                  }}></span>
                  <span>
                    {trainingStats?.is_training ? 'Training Active' : 'Not Training'}
                  </span>
                </div>
                <div>
                  {trainingStats?.is_paused && (
                    <div style={{ color: '#ffaa00' }}>
                      ⏸ Paused
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">Agent Information</div>
              <div className="card-content">
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Learning Rate:</strong> {modelInfo?.learning_rate?.toFixed(4) || 'N/A'}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Gamma (γ):</strong> {modelInfo?.gamma?.toFixed(2) || 'N/A'}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Total Steps:</strong> {modelInfo?.total_steps || 0}
                </div>
                <div>
                  <strong>Episodes Trained:</strong> {modelInfo?.episodes_trained || 0}
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="card-title">Quick Info</div>
            <div className="card-content">
              <p>
                The AI agent is trained using Deep Q-Learning (DQN). It learns to play Snake
                by exploring actions and exploiting learned behaviors. The epsilon value controls
                the exploration-exploitation trade-off, starting high for exploration and decaying
                over time to focus on learned strategies.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
