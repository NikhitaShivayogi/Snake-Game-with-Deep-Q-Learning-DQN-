import React, { useState, useEffect } from 'react';
import { chartAPI, trainingAPI } from '../services/api';

export const Analytics = () => {
  const [charts, setCharts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch training history
        const statsRes = await trainingAPI.getTrainingHistory();
        
        if (statsRes.data && statsRes.data.episode_scores && statsRes.data.episode_scores.length > 0) {
          setStats(statsRes.data);
          setLastUpdate(new Date().toLocaleTimeString());
          
          // Fetch charts - this will generate them from the history
          try {
            const chartsRes = await chartAPI.getCharts();
            setCharts(chartsRes.data || {});
          } catch (err) {
            console.error('Error fetching charts:', err);
            setCharts({});
          }
        } else {
          // No training data yet
          setStats(null);
          setCharts({});
        }

        setError(null);
      } catch (err) {
        setError('Could not load training data');
        setStats(null);
        setCharts({});
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 3 seconds during active training
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const chartTypes = ['combined', 'scores', 'rewards', 'loss', 'epsilon'];

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Performance Analytics</h1>
        <p style={{ color: '#b0b8d4', marginTop: '0.5rem' }}>
          Training progress and learning metrics
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          Error: {error}
        </div>
      )}

      {loading && !Object.keys(charts).length ? (
        <div className="spinner"><div className="loading"></div></div>
      ) : !stats || Object.keys(stats).length === 0 ? (
        <div className="card">
          <div className="card-content">
            <p>
              No training data available yet. Start training the agent to see performance metrics.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ fontSize: '0.85rem', color: '#888', marginBottom: '1rem' }}>
            Last updated: {lastUpdate}
          </div>
          
          <div className="grid grid-3">
            <div className="stat-card">
              <div className="stat-label">Total Episodes</div>
              <div className="stat-value">{stats.episode_scores?.length || stats.episodes || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Best Score</div>
              <div className="stat-value">{stats.best_score || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Average Score</div>
              <div className="stat-value">
                {stats.episode_scores?.length > 0
                  ? (stats.episode_scores.reduce((a, b) => a + b, 0) / stats.episode_scores.length).toFixed(2)
                  : '0.00'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Food Eaten</div>
              <div className="stat-value" style={{ color: '#FFD700' }}>
                {stats.total_food_eaten?.toLocaleString() || '0'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Reward</div>
              <div className="stat-value" style={{ color: '#00ff88' }}>
                {stats.total_reward?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Best Episode</div>
              <div className="stat-value">{stats.best_episode || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Final Epsilon</div>
              <div className="stat-value">{(stats.epsilon || 0).toFixed(4)}</div>
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h2>Training Charts</h2>
            <div className="grid">
              {chartTypes.map((chartType) => (
                <div key={chartType} className="chart-container">
                  {charts[chartType] ? (
                    <img
                      src={chartAPI.getChartImage(chartType)}
                      alt={`${chartType} chart`}
                      className="chart-image"
                      key={Date.now()} // Force refresh
                    />
                  ) : (
                    <p>Chart not generated</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="card-title">Detailed Statistics</div>
            <div className="card-content">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <strong>Maximum Score:</strong>
                  <div style={{ fontSize: '1.5rem', color: '#00ff88', marginTop: '0.5rem' }}>
                    {Math.max(...(stats.episode_scores || [0]))}
                  </div>
                </div>
                <div>
                  <strong>Average Episode Length:</strong>
                  <div style={{ fontSize: '1.5rem', color: '#00aaff', marginTop: '0.5rem' }}>
                    {stats.episode_lengths?.length > 0
                      ? (stats.episode_lengths.reduce((a, b) => a + b, 0) / stats.episode_lengths.length).toFixed(0)
                      : 0}
                  </div>
                </div>
                <div>
                  <strong>Average Loss:</strong>
                  <div style={{ fontSize: '1.5rem', color: '#ff6b6b', marginTop: '0.5rem' }}>
                    {stats.loss_history?.length > 0
                      ? (stats.loss_history.reduce((a, b) => a + b, 0) / stats.loss_history.length).toFixed(4)
                      : 0}
                  </div>
                </div>
                <div>
                  <strong>Last 10 Avg Score:</strong>
                  <div style={{ fontSize: '1.5rem', color: '#ffaa00', marginTop: '0.5rem' }}>
                    {stats.episode_scores?.length > 10
                      ? (stats.episode_scores.slice(-10).reduce((a, b) => a + b, 0) / 10).toFixed(2)
                      : (stats.episode_scores?.length > 0 ? (stats.episode_scores.reduce((a, b) => a + b, 0) / stats.episode_scores.length).toFixed(2) : 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginTop: '2rem' }}>
            <div className="card-title">Learning Analysis</div>
            <div className="card-content">
              <h3 style={{ fontSize: '1.1rem', marginTop: '1rem' }}>Key Insights</h3>
              <ul style={{ marginLeft: '1.5rem', color: '#b0b8d4', lineHeight: '1.8' }}>
                <li>
                  <strong>Exploration Decay:</strong> Epsilon decreases over time, meaning the agent gradually shifts from
                  exploration (random actions) to exploitation (learned behaviors).
                </li>
                <li>
                  <strong>Score Improvement:</strong> If scores are increasing over episodes, the agent is learning to play better.
                  Look for an upward trend in the scores chart.
                </li>
                <li>
                  <strong>Loss Convergence:</strong> Training loss should generally decrease or stabilize, indicating the network
                  is learning a stable policy.
                </li>
                <li>
                  <strong>Reward Pattern:</strong> Rewards should generally increase as the agent learns to eat food more effectively.
                </li>
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
