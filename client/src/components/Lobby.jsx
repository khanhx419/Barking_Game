import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Users, Zap } from 'lucide-react';
import { DOG_BREEDS, getDogThumb } from '../lib/dogBreeds';

export default function Lobby({ onCreateRoom, onJoinRoom, onSandbox, error }) {
  const [playerName, setPlayerName] = useState('');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [selectedDog, setSelectedDog] = useState('shiba');
  const [mode, setMode] = useState('select');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: '#F8F9FA' }}>

      {/* Title */}
      <motion.div 
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8 z-10"
      >
        <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter"
          style={{ color: '#2D3436' }}>
          BARKING <span style={{ color: '#0984E3' }}>BAT</span><span style={{ color: '#D63031' }}>TLE</span>
        </h1>
        <p className="text-base mt-2 font-medium tracking-widest uppercase flex items-center justify-center gap-2"
          style={{ color: '#B2BEC3' }}>
          <Volume2 className="w-4 h-4" style={{ color: '#FDCB6E' }} /> 
          Loudest Dog Wins
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-6 md:p-8 rounded-3xl w-full max-w-lg z-10 relative overflow-hidden"
        style={{ 
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #0984E3, #D63031)' }} />

        {error && (
          <div className="mb-4 p-3 rounded-lg text-center text-sm font-semibold"
            style={{ 
              backgroundColor: 'rgba(214, 48, 49, 0.08)', 
              color: '#D63031',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}>
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#B2BEC3' }}>Your Name</label>
            <input 
              type="text" 
              maxLength="12"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Max"
              className="w-full rounded-xl px-4 py-3 focus:outline-none focus:ring-2 transition-all"
              style={{ 
                backgroundColor: '#F8F9FA',
                border: '1px solid #DFE6E9',
                color: '#2D3436',
              }}
            />
          </div>

          {/* Dog Selection */}
          <div>
            <label className="block text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#B2BEC3' }}>Choose Your Dog</label>
            <div className="grid grid-cols-5 gap-2">
              {DOG_BREEDS.map((dog) => (
                <motion.button
                  key={dog.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedDog(dog.id)}
                  className="relative p-2 rounded-xl transition-all flex flex-col items-center gap-1"
                  style={{
                    backgroundColor: selectedDog === dog.id ? 'rgba(253, 203, 110, 0.15)' : '#F8F9FA',
                    border: selectedDog === dog.id ? '2px solid #FDCB6E' : '2px solid #DFE6E9',
                    boxShadow: selectedDog === dog.id 
                      ? '0 4px 6px -1px rgba(253, 203, 110, 0.3)' 
                      : '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                  }}
                >
                  <img src={getDogThumb(dog.id)} alt={dog.name} className="w-12 h-12 object-contain" />
                  <span className="text-[10px] font-bold truncate w-full text-center" style={{ color: '#636E72' }}>{dog.name}</span>
                  {selectedDog === dog.id && (
                    <motion.div
                      layoutId="dogSelected"
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#FDCB6E' }}
                    >
                      <span className="text-white text-[8px] font-black">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <AnimatePresence mode="wait">
            {mode === 'select' && (
              <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    disabled={!playerName.trim()}
                    onClick={() => onCreateRoom(playerName, selectedDog)}
                    className="px-4 py-3.5 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                    style={{ 
                      backgroundColor: '#0984E3',
                      boxShadow: '0 4px 6px -1px rgba(9, 132, 227, 0.3)',
                    }}
                  >
                    Create Game
                  </button>
                  <button 
                    disabled={!playerName.trim()}
                    onClick={() => setMode('join')}
                    className="px-4 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    style={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #DFE6E9', 
                      color: '#2D3436',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  >
                    Join Game
                  </button>
                </div>

                <button
                  disabled={!playerName.trim()}
                  onClick={() => onSandbox(playerName, selectedDog)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#FDCB6E',
                    color: '#2D3436',
                    boxShadow: '0 4px 6px -1px rgba(253, 203, 110, 0.4)',
                  }}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Sandbox Mode</span>
                  <span className="text-xs opacity-60 font-medium ml-1">(Solo Test)</span>
                </button>
              </motion.div>
            )}

            {mode === 'join' && (
              <motion.div key="join" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-3 pt-1">
                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: '#B2BEC3' }}>Room Code</label>
                  <input 
                    type="text" maxLength="6"
                    value={roomIdToJoin}
                    onChange={(e) => setRoomIdToJoin(e.target.value.toUpperCase())}
                    placeholder="6-CHAR CODE"
                    className="w-full rounded-xl px-4 py-3 font-mono tracking-widest text-center uppercase focus:outline-none focus:ring-2 transition-all"
                    style={{ backgroundColor: '#F8F9FA', border: '1px solid #DFE6E9', color: '#2D3436' }}
                  />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setMode('select')}
                    className="px-4 py-3 rounded-xl font-bold transition-colors text-sm"
                    style={{ color: '#B2BEC3' }}>
                    Back
                  </button>
                  <button 
                    disabled={!roomIdToJoin.trim() || roomIdToJoin.length < 5}
                    onClick={() => onJoinRoom(roomIdToJoin, playerName, selectedDog)}
                    className="flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 transition-all text-sm"
                    style={{ 
                      backgroundColor: '#D63031',
                      boxShadow: '0 4px 6px -1px rgba(214, 48, 49, 0.3)',
                    }}
                  >
                    Join Room
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="mt-6 text-xs font-medium flex items-center gap-2 z-10" style={{ color: '#B2BEC3' }}>
        <Users className="w-3.5 h-3.5" /> Ensure microphone permissions are enabled
      </div>
    </div>
  );
}
