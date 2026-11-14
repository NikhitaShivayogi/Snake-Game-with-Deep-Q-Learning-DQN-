import React, { useState, useEffect } from 'react';
import { modelAPI, trainingAPI } from '../services/api';

export const ModelManagement = () => {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [trainingStats, setTrainingStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveModelName, setSaveModelName] = useState('model');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [modelsRes, infoRes, statsRes] = await Promise.all([
        modelAPI.listModels(),
        modelAPI.getAgentInfo(),
        trainingAPI.getTrainingStatus(),
      ]);
      setModels(modelsRes.data.models || []);
      setModelInfo(infoRes.data);
      setTrainingStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModel = async () => {
    try {
      setSaving(true);
      setError(null);
      await modelAPI.saveModel(saveModelName);
      setMessage('Model saved successfully!');
      setTimeout(() => setMessage(null), 3000);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLoadModel = async (filename) => {
    try {
      setError(null);
      await modelAPI.loadModel(filename);
      setSelectedModel(filename);
      setMessage('Model loaded successfully!');
      setTimeout(() => setMessage(null), 3000);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteModel = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      return;
    }
    
    try {
      setError(null);
      setDeleting(filename);
      await modelAPI.deleteModel(filename);
      setMessage('Model deleted successfully!');
      if (selectedModel === filename) {
        setSelectedModel(null);
      }
      setTimeout(() => setMessage(null), 3000);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <h1>Model Management</h1>
        <p style={{ color: '#b0b8d4', marginTop: '0.5rem' }}>
          Save, load, and manage trained models
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          Error: {error}
        </div>
      )}

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {loading ? (
        <div className="spinner"><div className="loading"></div></div>
      ) : (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-title">Save Current Model</div>
            <div className="card-content">
              <div className="control-group">
                <label>Model Name</label>
                <input
                  type="text"
                  value={saveModelName}
                  onChange={(e) => setSaveModelName(e.target.value)}
                  placeholder="e.g., trained_v1"
                  disabled={saving}
                />
              </div>

              <button
                className="btn-primary"
                onClick={handleSaveModel}
                disabled={saving}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {saving ? 'Saving...' : 'Save Model'}
              </button>

              <div style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                <strong>Training Status:</strong>
                <div style={{ color: trainingStats?.is_training ? '#00ff88' : '#666' }}>
                  {trainingStats?.is_training ? '🟢 Training' : '⚪ Not training'}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Model Information</div>
            <div className="card-content">
              {modelInfo && (
                <>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <strong>Learning Rate:</strong>
                    <div style={{ color: '#00aaff', marginTop: '0.3rem' }}>
                      {modelInfo.learning_rate?.toFixed(4)}
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <strong>Gamma (γ):</strong>
                    <div style={{ color: '#00aaff', marginTop: '0.3rem' }}>
                      {modelInfo.gamma?.toFixed(2)}
                    </div>
                  </div>
                  <div style={{ marginBottom: '0.8rem' }}>
                    <strong>Total Steps:</strong>
                    <div style={{ color: '#00aaff', marginTop: '0.3rem' }}>
                      {modelInfo.total_steps?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div>
                    <strong>Episodes Trained:</strong>
                    <div style={{ color: '#00aaff', marginTop: '0.3rem' }}>
                      {modelInfo.episodes_trained || 0}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-title">Saved Models</div>
            <div className="card-content">
              {models.length === 0 ? (
                <p>No saved models yet. Train the agent and save a checkpoint.</p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '1rem'
                }}>
                  {models.map((model) => (
                    <div
                      key={model}
                      style={{
                        background: selectedModel === model ? 'rgba(0, 255, 136, 0.1)' : 'rgba(0, 0, 0, 0.3)',
                        border: selectedModel === model ? '2px solid #00ff88' : '1px solid #404b63',
                        borderRadius: '6px',
                        padding: '1rem',
                      }}
                    >
                      <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#b0b8d4' }}>
                        <strong>{model}</strong>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                        <button
                          className={selectedModel === model ? 'btn-success' : 'btn-secondary'}
                          onClick={() => handleLoadModel(model)}
                          style={{ width: '100%' }}
                        >
                          {selectedModel === model ? 'Loaded' : 'Load'}
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDeleteModel(model)}
                          disabled={deleting === model}
                          style={{ width: '100%', opacity: deleting === model ? 0.6 : 1 }}
                        >
                          {deleting === model ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-title">Model Information</div>
            <div className="card-content">
              <p>
                <strong>What happens when you save:</strong> The current neural network weights,
                optimizer state, epsilon value, and training statistics are saved to a checkpoint file.
              </p>
              <p style={{ marginTop: '1rem' }}>
                <strong>What happens when you load:</strong> A previously saved model is loaded into
                memory. You can then use it to play the game or continue training from where it left off.
              </p>
              <p style={{ marginTop: '1rem' }}>
                <strong>Model files location:</strong> All models are saved in the <code>./saved_models</code> directory
                with timestamps for easy tracking.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
