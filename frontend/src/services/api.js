import axios from 'axios';

// Determine API base URL dynamically
// In development (with vite proxy): use relative /api
// In production: use full URL to backend
const getApiBaseUrl = () => {
  // Check if we're in development
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // In production, build the full backend URL
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // Try to connect to backend on same host, port 8000
  // or fall back to same origin with /api prefix
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//localhost:8000/api`;
  }
  
  // Default: assume backend is at /api on same server
  return '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor to provide better error messages
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 404) {
      console.error('API 404 Error:', error.config.url);
      console.error('Full URL attempted:', error.config.baseURL + error.config.url);
    }
    return Promise.reject(error);
  }
);

// Game endpoints
export const gameAPI = {
  // Human game
  getHumanGameState: () => api.get('/game/human/state'),
  resetHumanGame: () => api.post('/game/human/reset'),
  moveHumanSnake: (direction) => api.post('/game/human/move', null, { params: { direction } }),
  stepHumanGame: () => api.post('/game/human/step'),
  
  // AI game
  getAIGameState: () => api.get('/game/ai/state'),
  resetAIGame: () => api.post('/game/ai/reset'),
  stepAIGame: (action) => api.post('/game/ai/step', null, { params: { action } }),
  autoPlayAI: (maxSteps) => api.post('/game/ai/auto-play', null, { params: { max_steps: maxSteps } }),
};

// Training endpoints
export const trainingAPI = {
  startTraining: (episodes, learningRate, gamma, epsilon) => 
    api.post('/training/start', null, { 
      params: { 
        episodes,
        learning_rate: learningRate,
        gamma,
        epsilon
      } 
    }),
  pauseTraining: () => api.post('/training/pause'),
  resumeTraining: () => api.post('/training/resume'),
  stopTraining: () => api.post('/training/stop'),
  getTrainingStatus: () => api.get('/training/status'),
  getTrainingHistory: () => api.get('/training/history'),
};

// Model endpoints
export const modelAPI = {
  saveModel: (name) => api.post('/model/save', null, { params: { name } }),
  loadModel: (filepath) => api.post('/model/load', null, { params: { filepath } }),
  deleteModel: (filepath) => api.post('/model/delete', null, { params: { filepath } }),
  listModels: () => api.get('/model/list'),
  getAgentInfo: () => api.get('/agent/info'),
};

// Chart endpoints
export const chartAPI = {
  getCharts: () => api.get('/charts'),
  getChartImage: (chartType) => `/api/charts/${chartType}`,
};

// WebSocket
export const createTrainingWebSocket = (onMessage, onError) => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${window.location.host}/ws/training`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('Failed to parse WebSocket message', e);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (onError) onError(error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  return ws;
};

export default api;
