import React, { useState, useEffect } from 'react';
import './styles/App.css';
import { Dashboard } from './pages/Dashboard';
import { PlayGame } from './pages/PlayGame';
import { Training } from './pages/Training';
import { Analytics } from './pages/Analytics';
import { ModelManagement } from './pages/ModelManagement';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Check API connection
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          setConnected(true);
        }
      } catch (err) {
        console.error('API not connected:', err);
        setConnected(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  const pages = {
    dashboard: {
      label: 'Dashboard',
      component: <Dashboard />,
    },
    play: {
      label: 'Play Game',
      component: <PlayGame />,
    },
    training: {
      label: 'AI Training',
      component: <Training />,
    },
    analytics: {
      label: 'Analytics',
      component: <Analytics />,
    },
    models: {
      label: 'Model Management',
      component: <ModelManagement />,
    },
  };

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">🐍 Snake AI</div>
          <ul className="nav-links">
            {Object.entries(pages).map(([key, page]) => (
              <li key={key}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(key);
                  }}
                  className={currentPage === key ? 'active' : ''}
                >
                  {page.label}
                </a>
              </li>
            ))}
          </ul>
          <div style={{ fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              className="status-indicator"
              style={{
                backgroundColor: connected ? '#00ff88' : '#ff6b6b',
                animation: connected ? 'pulse 2s ease-in-out infinite' : 'none'
              }}
            ></span>
            <span style={{ color: connected ? '#00ff88' : '#ff6b6b' }}>
              {connected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>
      </nav>

      <main>
        {pages[currentPage].component}
      </main>

      <footer style={{
        backgroundColor: '#1a1f3a',
        borderTop: '1px solid #404b63',
        padding: '2rem',
        marginTop: '4rem',
        textAlign: 'center',
        color: '#b0b8d4'
      }}>
        <div className="container">
          <div>
            <strong>Snake Game with Deep Q-Learning (DQN)</strong>
          </div>
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            An AI agent that learns to play Snake autonomously using Deep Reinforcement Learning
          </p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888' }}>
            © 2024 - Built with PyTorch, FastAPI, and React
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
