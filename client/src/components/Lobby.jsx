import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Users, Zap } from 'lucide-react';
import { DOG_BREEDS } from '../lib/dogBreeds';

export default function Lobby({ onCreateRoom, onJoinRoom, onSandbox, error }) {
  const [playerName, setPlayerName] = useState('');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [selectedDog, setSelectedDog] = useState('shiba');
  const [mode, setMode] = useState('select'); // select, join

  return (
    <div className="min-h-screen bg-arena-900 flex flex-col items-center justify-center p-4 overflow-y-auto">
      {/* Ambient glow backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-p1-600/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-p2-600/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Title */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8 z-10"
      >
        <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-p1-400 via-white to-p2-400">
          BARKING BATTLE
        </h1>
        <p className="text-lg text-gray-400 mt-2 font-medium tracking-widest uppercase flex items-center justify-center gap-2">
          <Volume2 className="w-5 h-5 text-battle-glow" /> 
          Loudest Dog Wins
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-arena-800/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl w-full max-w-lg z-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-p1-500 to-p2-500"></div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center text-sm font-semibold">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">Your Name</label>
            <input 
              type="text" 
              maxLength="12"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Max"
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-battle-glow transition-all"
            />
          </div>

          {/* Dog Selection */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-2 uppercase tracking-wider">Choose Your Dog</label>
            <div className="grid grid-cols-5 gap-2">
              {DOG_BREEDS.map((dog) => (
                <motion.button
                  key={dog.id}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDog(dog.id)}
                  className={`relative p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    selectedDog === dog.id
                      ? 'border-battle-glow bg-battle-glow/10 shadow-glow-gold'
                      : 'border-white/10 bg-white/5 hover:border-white/30'
                  }`}
                >
                  <img src={dog.svg} alt={dog.name} className="w-12 h-12 object-contain" />
                  <span className="text-[10px] font-bold text-gray-300 truncate w-full text-center">{dog.name}</span>
                  {selectedDog === dog.id && (
                    <motion.div
                      layoutId="dogSelected"
                      className="absolute -top-1 -right-1 w-4 h-4 bg-battle-glow rounded-full flex items-center justify-center"
                    >
                      <span className="text-black text-[8px] font-black">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Mode: Select */}
          <AnimatePresence mode="wait">
            {mode === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 pt-1"
              >
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    disabled={!playerName.trim()}
                    onClick={() => onCreateRoom(playerName, selectedDog)}
                    className="group relative px-4 py-3.5 bg-gradient-to-br from-p1-600 to-blue-800 rounded-xl font-bold text-white shadow-lg overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-glow-blue transition-all"
                  >
                    <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -skew-x-12 -translate-x-full transition-transform duration-500"></div>
                    <span className="relative text-sm">Create Game</span>
                  </button>
                  <button 
                    disabled={!playerName.trim()}
                    onClick={() => setMode('join')}
                    className="px-4 py-3.5 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white border border-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Join Game
                  </button>
                </div>

                {/* Sandbox button */}
                <button
                  disabled={!playerName.trim()}
                  onClick={() => onSandbox(playerName, selectedDog)}
                  className="w-full group relative flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-amber-600/80 to-orange-600/80 rounded-xl font-bold text-white border border-amber-500/30 hover:shadow-glow-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Sandbox Mode</span>
                  <span className="text-xs text-amber-200/70 font-medium ml-1">(Solo Test)</span>
                </button>
              </motion.div>
            )}

            {/* Mode: Join */}
            {mode === 'join' && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3 pt-1"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">Room Code</label>
                  <input 
                    type="text" 
                    maxLength="6"
                    value={roomIdToJoin}
                    onChange={(e) => setRoomIdToJoin(e.target.value.toUpperCase())}
                    placeholder="6-CHAR CODE"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 font-mono tracking-widest text-center uppercase focus:outline-none focus:ring-2 focus:ring-battle-glow transition-all"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setMode('select')}
                    className="px-4 py-3 bg-white/5 rounded-xl font-bold text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    Back
                  </button>
                  <button 
                    disabled={!roomIdToJoin.trim() || roomIdToJoin.length < 5}
                    onClick={() => onJoinRoom(roomIdToJoin, playerName, selectedDog)}
                    className="flex-1 py-3 bg-gradient-to-br from-p2-500 to-red-700 rounded-xl font-bold text-white shadow-glow-red disabled:opacity-50 disabled:shadow-none transition-all text-sm"
                  >
                    Join Room
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="mt-6 text-gray-500 text-xs font-medium flex items-center gap-2 z-10">
        <Users className="w-3.5 h-3.5" /> Ensure microphone permissions are enabled
      </div>
    </div>
  );
}
