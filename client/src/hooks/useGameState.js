import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';

export function useGameState() {
  const { isConnected, emit, on, off, socketId } = useSocket();
  
  const [gameState, setGameState] = useState({
    phase: 'lobby', // lobby, waiting, countdown, playing, finished
    roomId: null,
    playerName: '',
    opponentName: '',
    playerIndex: 0, // 0 for P1, 1 for P2
    
    // Server state
    p1Power: 0,
    p2Power: 0,
    battleLinePos: 50,
    p1Scale: 1.0,
    p2Scale: 1.0,
    timeLeft: 30,
    
    // Result
    winner: null,
    reason: '',
    
    // Errors
    error: null,
  });

  // Event Handlers
  useEffect(() => {
    if (!isConnected) return;

    on('room:created', ({ roomId }) => {
      setGameState(prev => ({ ...prev, roomId, phase: 'waiting', playerIndex: 0 }));
    });

    on('room:updated', ({ players }) => {
      // Find opponent
      const opponent = players.find(p => p.id !== socketId);
      if (opponent) {
        setGameState(prev => ({ ...prev, opponentName: opponent.name }));
      }
    });

    on('room:ready', (config) => {
      const isP1 = config.p1.id === socketId;
      setGameState(prev => ({ 
        ...prev, 
        phase: 'countdown',
        playerIndex: isP1 ? 0 : 1,
        opponentName: isP1 ? config.p2.name : config.p1.name
      }));
    });

    on('game:countdown', ({ count }) => {
      setGameState(prev => ({ ...prev, countdown: count }));
    });

    on('game:start', ({ duration }) => {
      setGameState(prev => ({ ...prev, phase: 'playing', timeLeft: duration / 1000 }));
    });

    on('game:state', (state) => {
      setGameState(prev => ({ ...prev, ...state }));
    });

    on('game:end', ({ winner, reason }) => {
      setGameState(prev => ({ ...prev, phase: 'finished', winner, reason }));
    });

    on('player:disconnect', ({ message }) => {
      setGameState(prev => ({ 
        ...prev, 
        phase: 'finished', 
        error: message, 
        winner: prev.playerName // Win by forfeit
      }));
    });

    on('error', ({ message }) => {
      setGameState(prev => ({ ...prev, error: message }));
    });

    return () => {
      off('room:created');
      off('room:updated');
      off('room:ready');
      off('game:countdown');
      off('game:start');
      off('game:state');
      off('game:end');
      off('player:disconnect');
      off('error');
    };
  }, [isConnected, socketId, on, off]);

  // Actions
  const createRoom = useCallback((playerName) => {
    setGameState(prev => ({ ...prev, playerName, error: null }));
    emit('room:create', { playerName });
  }, [emit]);

  const joinRoom = useCallback((roomId, playerName) => {
    setGameState(prev => ({ ...prev, playerName, roomId, playerIndex: 1, error: null }));
    emit('room:join', { roomId, playerName });
  }, [emit]);

  const sendPower = useCallback((powerData) => {
    if (gameState.phase === 'playing') {
      emit('audio:power', powerData);
    }
  }, [emit, gameState.phase]);
  
  const resetToLobby = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: 'lobby',
      roomId: null,
      opponentName: '',
      error: null,
      winner: null,
      p1Power: 0,
      p2Power: 0,
      battleLinePos: 50,
      p1Scale: 1.0,
      p2Scale: 1.0,
    }));
  }, []);

  return {
    gameState,
    isConnected,
    createRoom,
    joinRoom,
    sendPower,
    resetToLobby
  };
}
