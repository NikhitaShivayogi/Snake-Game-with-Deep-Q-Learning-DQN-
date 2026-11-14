import { useState, useEffect, useCallback } from 'react';
import { gameAPI } from '../services/api';

export const useGameState = (gameType = 'human') => {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchGameState = useCallback(async () => {
    try {
      setLoading(true);
      const api = gameType === 'human' ? gameAPI.getHumanGameState : gameAPI.getAIGameState;
      const response = await api();
      setGameState(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [gameType]);

  useEffect(() => {
    fetchGameState();
  }, [fetchGameState]);

  const resetGame = useCallback(async () => {
    try {
      const api = gameType === 'human' ? gameAPI.resetHumanGame : gameAPI.resetAIGame;
      const response = await api();
      setGameState(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
    }
  }, [gameType]);

  return {
    gameState,
    loading,
    error,
    fetchGameState,
    resetGame,
  };
};

export const useTrainingState = () => {
  const [trainingState, setTrainingState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrainingState = useCallback(async () => {
    try {
      setLoading(true);
      const response = await trainingAPI.getTrainingStatus();
      setTrainingState(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrainingState();
    const interval = setInterval(fetchTrainingState, 1000);
    return () => clearInterval(interval);
  }, [fetchTrainingState]);

  return {
    trainingState,
    loading,
    error,
    fetchTrainingState,
  };
};

import { trainingAPI } from '../services/api';
