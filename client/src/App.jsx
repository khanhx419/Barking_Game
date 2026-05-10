import { useState, useEffect, useRef, useCallback } from 'react';
import Lobby from './components/Lobby';
import Countdown from './components/Countdown';
import GameArena from './components/GameArena';
import GameOver from './components/GameOver';
import { useGameState } from './hooks/useGameState';
import { useAudioAnalyser } from './hooks/useAudioAnalyser';
import { DOG_BREEDS } from './lib/dogBreeds';

function App() {
  const { gameState, createRoom, joinRoom, sendPower, resetToLobby } = useGameState();
  
  // Local audio state
  const [localAudio, setLocalAudio] = useState({ volume: 0, sustain: 1.0, totalPower: 0 });
  
  // Dog selections
  const [myDog, setMyDog] = useState('shiba');
  const [opponentDog, setOpponentDog] = useState('bulldog');
  
  // Sandbox state
  const [sandboxMode, setSandboxMode] = useState(false);
  const [sandboxState, setSandboxState] = useState(null);
  const sandboxLoopRef = useRef(null);
  const sandboxStartRef = useRef(0);
  const sandboxLineRef = useRef(50);

  const { startMic, stopMic, hasPermission } = useAudioAnalyser(
    (sandboxMode && sandboxState?.phase === 'playing') || gameState.phase === 'playing', 
    (data) => {
      setLocalAudio(data);
      if (!sandboxMode) {
        sendPower(data);
      }
    }
  );

  // -------- SANDBOX MODE --------
  const startSandbox = useCallback((playerName, dogId) => {
    setMyDog(dogId);
    // Pick a random different dog for the bot
    const otherDogs = DOG_BREEDS.filter(d => d.id !== dogId);
    const botDog = otherDogs[Math.floor(Math.random() * otherDogs.length)];
    setOpponentDog(botDog.id);
    setSandboxMode(true);
    setSandboxState({
      phase: 'countdown',
      playerName,
      opponentName: 'Bot',
      playerIndex: 0,
      countdown: 3,
      p1Power: 0, p2Power: 0,
      battleLinePos: 50,
      p1Scale: 1.0, p2Scale: 1.0,
      timeLeft: 30,
      winner: null, reason: '',
    });

    // Countdown
    let count = 3;
    const countdownInterval = setInterval(() => {
      count--;
      if (count > 0) {
        setSandboxState(prev => prev ? { ...prev, countdown: count } : null);
      } else if (count === 0) {
        setSandboxState(prev => prev ? { ...prev, countdown: 'BARK!' } : null);
      } else {
        clearInterval(countdownInterval);
        setSandboxState(prev => prev ? { ...prev, phase: 'playing', timeLeft: 30 } : null);
        sandboxStartRef.current = Date.now();
        sandboxLineRef.current = 50;
      }
    }, 1000);
  }, []);

  // Sandbox game loop
  useEffect(() => {
    if (!sandboxMode || sandboxState?.phase !== 'playing') return;
    
    const botSustainRef = { current: 1.0 };

    sandboxLoopRef.current = setInterval(() => {
      const elapsed = Date.now() - sandboxStartRef.current;
      const timeLeft = Math.max(0, Math.floor((30000 - elapsed) / 1000));
      
      // Bot generates random power that fluctuates
      const botBaseVolume = 20 + Math.random() * 40; // 20-60
      const shouldBark = Math.random() > 0.3; // 70% chance barking
      const botVolume = shouldBark ? botBaseVolume : 0;
      
      if (botVolume > 15) {
        botSustainRef.current = Math.min(botSustainRef.current + 0.04, 3.0);
      } else {
        botSustainRef.current = 1.0;
      }
      const botPower = botVolume * botSustainRef.current;
      
      const myPower = localAudio.totalPower;
      const maxDiff = 300;
      const diff = myPower - botPower;
      const movement = (diff / maxDiff) * 8;
      
      const target = Math.max(0, Math.min(100, sandboxLineRef.current + movement));
      sandboxLineRef.current += (target - sandboxLineRef.current) * 0.1;
      
      const pos = sandboxLineRef.current;
      const scaleFactor = (pos - 50) / 50;
      const p1Scale = 1.0 + scaleFactor * 0.5;
      const p2Scale = 1.0 - scaleFactor * 0.5;

      // Check win conditions
      let winner = null;
      let reason = '';
      if (pos >= 99) { winner = 'You'; reason = 'Knockout!'; }
      else if (pos <= 1) { winner = 'Bot'; reason = 'Knockout!'; }
      else if (timeLeft <= 0) {
        if (pos > 50) winner = 'You';
        else if (pos < 50) winner = 'Bot';
        else winner = 'Tie';
        reason = 'Time Up!';
      }

      if (winner) {
        clearInterval(sandboxLoopRef.current);
        setSandboxState(prev => prev ? {
          ...prev,
          phase: 'finished',
          winner,
          reason,
          p1Power: myPower,
          p2Power: botPower,
          battleLinePos: pos,
          p1Scale, p2Scale,
          timeLeft: 0,
        } : null);
      } else {
        setSandboxState(prev => prev ? {
          ...prev,
          p1Power: myPower,
          p2Power: botPower,
          battleLinePos: pos,
          p1Scale, p2Scale,
          timeLeft,
        } : null);
      }
    }, 33); // ~30fps

    return () => clearInterval(sandboxLoopRef.current);
  }, [sandboxMode, sandboxState?.phase, localAudio.totalPower]);

  const exitSandbox = useCallback(() => {
    clearInterval(sandboxLoopRef.current);
    setSandboxMode(false);
    setSandboxState(null);
    setLocalAudio({ volume: 0, sustain: 1.0, totalPower: 0 });
  }, []);

  // -------- MULTIPLAYER HANDLERS --------
  const handleCreateRoom = useCallback((playerName, dogId) => {
    setMyDog(dogId);
    createRoom(playerName);
  }, [createRoom]);

  const handleJoinRoom = useCallback((roomId, playerName, dogId) => {
    setMyDog(dogId);
    joinRoom(roomId, playerName);
  }, [joinRoom]);

  // Mic lifecycle
  useEffect(() => {
    const phase = sandboxMode ? sandboxState?.phase : gameState.phase;
    if (phase === 'countdown' || phase === 'playing') {
      startMic();
    } else {
      stopMic();
      setLocalAudio({ volume: 0, sustain: 1.0, totalPower: 0 });
    }
    return () => stopMic();
  }, [sandboxMode ? sandboxState?.phase : gameState.phase]);

  // Determine current state source
  const currentState = sandboxMode ? sandboxState : gameState;
  const currentPhase = currentState?.phase || 'lobby';
  const isSandbox = sandboxMode;

  return (
    <div className="w-full h-screen bg-arena-900 text-white overflow-hidden">
      {/* Lobby */}
      {!sandboxMode && currentPhase === 'lobby' && (
        <Lobby 
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onSandbox={startSandbox}
          error={gameState.error} 
        />
      )}

      {/* Waiting Room */}
      {!sandboxMode && currentPhase === 'waiting' && (
        <div className="min-h-screen flex flex-col items-center justify-center relative">
          <div className="text-2xl font-bold tracking-widest text-gray-300 mb-6 uppercase">Room Created</div>
          <div className="text-6xl md:text-7xl font-mono font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-p1-400 to-p2-400 mb-8 select-all">
            {gameState.roomId}
          </div>
          <p className="text-gray-500 text-sm mb-6">Share this code with your opponent</p>
          <div className="flex items-center gap-3 text-white/50">
            <div className="w-4 h-4 border-2 border-white/50 border-t-transparent rounded-full animate-spin"></div>
            Waiting for opponent...
          </div>
        </div>
      )}

      {/* Countdown */}
      {currentPhase === 'countdown' && (
        <Countdown 
          count={currentState.countdown || 3}
          p1={currentState.playerIndex === 0 ? currentState.playerName : (currentState.opponentName || 'Bot')}
          p2={currentState.playerIndex === 1 ? currentState.playerName : (currentState.opponentName || 'Bot')}
        />
      )}

      {/* Playing */}
      {currentPhase === 'playing' && (
        <GameArena 
          gameState={currentState}
          myVolume={localAudio.volume}
          mySustain={localAudio.sustain}
          myTotalPower={localAudio.totalPower}
          p1Power={currentState.p1Power}
          p2Power={currentState.p2Power}
          battleLinePos={currentState.battleLinePos}
          p1Scale={currentState.p1Scale}
          p2Scale={currentState.p2Scale}
          timeLeft={currentState.timeLeft}
          p1Dog={myDog}
          p2Dog={opponentDog}
          isSandbox={isSandbox}
        />
      )}

      {/* Finished */}
      {currentPhase === 'finished' && (
        <>
          <GameArena 
            gameState={currentState}
            myVolume={0} mySustain={1.0} myTotalPower={0}
            p1Power={currentState.p1Power} p2Power={currentState.p2Power}
            battleLinePos={currentState.battleLinePos}
            p1Scale={currentState.p1Scale} p2Scale={currentState.p2Scale}
            timeLeft={0}
            p1Dog={myDog}
            p2Dog={opponentDog}
            isSandbox={isSandbox}
          />
          <GameOver 
            winner={currentState.winner} 
            reason={currentState.reason} 
            onPlayAgain={isSandbox ? exitSandbox : resetToLobby} 
          />
        </>
      )}
    </div>
  );
}

export default App;
