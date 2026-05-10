import { useState, useEffect, useRef, useCallback } from 'react';
import Lobby from './components/Lobby';
import Countdown from './components/Countdown';
import GameArena from './components/GameArena';
import GameOver from './components/GameOver';
import { useGameState } from './hooks/useGameState';
import { useAudioAnalyser } from './hooks/useAudioAnalyser';
import { DOG_BREEDS } from './lib/dogBreeds';

function App() {
  const { gameState, publicRooms, createRoom, joinRoom, sendPower, leaveRoom, refreshRooms, resetToLobby } = useGameState();
  
  // Local audio state for UI rendering
  const [localAudio, setLocalAudio] = useState({ volume: 0, sustain: 1.0, totalPower: 0 });
  
  // *** FIX: Use a ref so the sandbox interval always reads the LATEST value ***
  const localAudioRef = useRef({ volume: 0, sustain: 1.0, totalPower: 0 });
  
  // Dog selections
  const [myDog, setMyDog] = useState('shiba');
  const [opponentDog, setOpponentDog] = useState('bulldog');
  
  // Sandbox state
  const [sandboxMode, setSandboxMode] = useState(false);
  const [sandboxState, setSandboxState] = useState(null);
  const sandboxLoopRef = useRef(null);
  const sandboxStartRef = useRef(0);
  const sandboxLineRef = useRef(50);
  const countdownRef = useRef(null);

  // Audio callback — updates both state (for UI) and ref (for game loop)
  // shouldEmit is throttled by useAudioAnalyser to max 20 times/sec
  const handlePowerUpdate = useCallback((data, shouldEmit) => {
    localAudioRef.current = data;
    setLocalAudio(data);
    if (!sandboxMode && shouldEmit) {
      sendPower(data);
    }
  }, [sandboxMode, sendPower]);

  const { startMic, stopMic } = useAudioAnalyser(
    (sandboxMode && sandboxState?.phase === 'playing') || gameState.phase === 'playing',
    handlePowerUpdate
  );

  // -------- SANDBOX MODE --------
  const startSandbox = useCallback((playerName, dogId) => {
    setMyDog(dogId);
    const otherDogs = DOG_BREEDS.filter(d => d.id !== dogId);
    const botDog = otherDogs[Math.floor(Math.random() * otherDogs.length)];
    setOpponentDog(botDog.id);
    setSandboxMode(true);
    
    // Reset audio ref
    localAudioRef.current = { volume: 0, sustain: 1.0, totalPower: 0 };
    sandboxLineRef.current = 50;

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

    let count = 3;
    countdownRef.current = setInterval(() => {
      count--;
      if (count > 0) {
        setSandboxState(prev => prev ? { ...prev, countdown: count } : null);
      } else if (count === 0) {
        setSandboxState(prev => prev ? { ...prev, countdown: 'BARK!' } : null);
      } else {
        clearInterval(countdownRef.current);
        setSandboxState(prev => prev ? { ...prev, phase: 'playing', timeLeft: 30 } : null);
        sandboxStartRef.current = Date.now();
        sandboxLineRef.current = 50;
      }
    }, 1000);
  }, []);

  // Sandbox game loop — uses refs to avoid stale closures
  useEffect(() => {
    if (!sandboxMode || sandboxState?.phase !== 'playing') return;
    
    let botSustain = 1.0;

    sandboxLoopRef.current = setInterval(() => {
      const elapsed = Date.now() - sandboxStartRef.current;
      const timeLeft = Math.max(0, Math.floor((30000 - elapsed) / 1000));
      
      // Bot AI: fluctuating bark
      const shouldBark = Math.random() > 0.35;
      const botVolume = shouldBark ? (15 + Math.random() * 35) : 0; // 15-50 when barking
      
      if (botVolume > 10) {
        botSustain = Math.min(botSustain + 0.03, 2.5); // Bot caps lower than player max
      } else {
        botSustain = 1.0;
      }
      const botPower = botVolume * botSustain;
      
      // *** FIX: Read from ref, not from stale state ***
      const myPower = localAudioRef.current.totalPower;
      
      // Tug-of-war physics:
      // Positive diff => player stronger => line moves RIGHT (toward 100 = player wins)
      const diff = myPower - botPower;
      const maxDiff = 200; // Sensitivity — lower = more responsive
      const pushForce = (diff / maxDiff) * 6;
      
      // Apply force directly then lerp for smoothness
      const targetPos = Math.max(0, Math.min(100, sandboxLineRef.current + pushForce));
      sandboxLineRef.current += (targetPos - sandboxLineRef.current) * 0.15;
      
      const pos = sandboxLineRef.current;
      const scaleFactor = (pos - 50) / 50; // -1 to +1
      const p1Scale = Math.max(0.5, Math.min(1.5, 1.0 + scaleFactor * 0.5));
      const p2Scale = Math.max(0.5, Math.min(1.5, 1.0 - scaleFactor * 0.5));

      // Win conditions
      let winner = null;
      let reason = '';
      if (pos >= 98) { winner = 'You'; reason = 'Knockout!'; }
      else if (pos <= 2) { winner = 'Bot'; reason = 'Knockout!'; }
      else if (timeLeft <= 0) {
        if (pos > 52) winner = 'You';
        else if (pos < 48) winner = 'Bot';
        else winner = 'Tie';
        reason = 'Time Up!';
      }

      if (winner) {
        clearInterval(sandboxLoopRef.current);
        setSandboxState(prev => prev ? {
          ...prev,
          phase: 'finished', winner, reason,
          p1Power: myPower, p2Power: botPower,
          battleLinePos: pos, p1Scale, p2Scale,
          timeLeft: 0,
        } : null);
      } else {
        setSandboxState(prev => prev ? {
          ...prev,
          p1Power: myPower, p2Power: botPower,
          battleLinePos: pos, p1Scale, p2Scale,
          timeLeft,
        } : null);
      }
    }, 33);

    return () => clearInterval(sandboxLoopRef.current);
  }, [sandboxMode, sandboxState?.phase]);

  const exitSandbox = useCallback(() => {
    clearInterval(sandboxLoopRef.current);
    clearInterval(countdownRef.current);
    setSandboxMode(false);
    setSandboxState(null);
    localAudioRef.current = { volume: 0, sustain: 1.0, totalPower: 0 };
    setLocalAudio({ volume: 0, sustain: 1.0, totalPower: 0 });
  }, []);

  // -------- QUIT HANDLER --------
  const handleQuit = useCallback(() => {
    if (sandboxMode) {
      exitSandbox();
    } else {
      leaveRoom();
      resetToLobby();
    }
    stopMic();
  }, [sandboxMode, exitSandbox, leaveRoom, resetToLobby, stopMic]);

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
    }
    // Only stop on unmount or return to lobby — don't stop between phases
    return () => {
      // cleanup on full unmount
    };
  }, [sandboxMode, sandboxState?.phase, gameState.phase, startMic]);

  // Stop mic when returning to lobby
  useEffect(() => {
    const phase = sandboxMode ? sandboxState?.phase : gameState.phase;
    if (phase === 'lobby' || phase === undefined) {
      stopMic();
      localAudioRef.current = { volume: 0, sustain: 1.0, totalPower: 0 };
      setLocalAudio({ volume: 0, sustain: 1.0, totalPower: 0 });
    }
  }, [sandboxMode, sandboxState?.phase, gameState.phase, stopMic]);

  // Determine current state source
  const currentState = sandboxMode ? sandboxState : gameState;
  const currentPhase = currentState?.phase || 'lobby';
  const isSandbox = sandboxMode;

  return (
    <div className="w-full h-screen overflow-hidden" style={{ backgroundColor: '#F8F9FA', color: '#2D3436' }}>
      {/* Lobby */}
      {!sandboxMode && currentPhase === 'lobby' && (
        <Lobby 
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          onSandbox={startSandbox}
          publicRooms={publicRooms}
          onRefreshRooms={refreshRooms}
          error={gameState.error} 
        />
      )}

      {/* Waiting */}
      {!sandboxMode && currentPhase === 'waiting' && (
        <div className="min-h-screen flex flex-col items-center justify-center relative" style={{ backgroundColor: '#F8F9FA' }}>
          <div className="text-2xl font-bold tracking-widest mb-6 uppercase" style={{ color: '#2D3436' }}>Room Created</div>
          <div className="text-6xl md:text-7xl font-mono font-black tracking-widest mb-8 select-all" style={{ color: '#0984E3' }}>
            {gameState.roomId}
          </div>
          <p className="text-sm mb-6" style={{ color: '#B2BEC3' }}>Share this code with your opponent</p>
          <div className="flex items-center gap-3" style={{ color: '#B2BEC3' }}>
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#DFE6E9', borderTopColor: 'transparent' }}></div>
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
          onQuit={handleQuit}
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
            p1Dog={myDog} p2Dog={opponentDog}
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
