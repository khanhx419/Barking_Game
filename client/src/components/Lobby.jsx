import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Users, Zap, RefreshCw } from 'lucide-react';
import { DOG_BREEDS, getDogThumb } from '../lib/dogBreeds';

export default function Lobby({ onCreateRoom, onJoinRoom, onSandbox, publicRooms, onRefreshRooms, error }) {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('barkPlayerName') || '');
  const [selectedDog, setSelectedDog] = useState('shiba');
  const [roomIdToJoin, setRoomIdToJoin] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  useEffect(() => {
    localStorage.setItem('barkPlayerName', playerName);
  }, [playerName]);

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
        className="p-6 md:p-8 rounded-3xl w-full max-w-lg z-20 relative"
        style={{ 
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ background: 'linear-gradient(90deg, #0984E3, #D63031)' }} />

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

          {/* Action Buttons */}
          <div className="space-y-3 pt-1" style={{ position: 'relative', zIndex: 10 }}>
            <button 
              disabled={!playerName.trim()}
              onClick={() => onCreateRoom(playerName, selectedDog)}
              onTouchEnd={(e) => { if (playerName.trim()) { e.preventDefault(); onCreateRoom(playerName, selectedDog); } }}
              className="w-full px-4 py-3.5 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm active:scale-95"
              style={{ 
                backgroundColor: '#0984E3',
                boxShadow: '0 4px 6px -1px rgba(9, 132, 227, 0.3)',
                WebkitAppearance: 'none',
              }}
            >
              Create Game
            </button>

            {!showCodeInput ? (
              <button
                disabled={!playerName.trim()}
                onClick={() => setShowCodeInput(true)}
                onTouchEnd={(e) => { if (playerName.trim()) { e.preventDefault(); setShowCodeInput(true); } }}
                className="w-full px-4 py-3.5 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm active:scale-95"
                style={{ 
                  backgroundColor: '#00b894',
                  boxShadow: '0 4px 6px -1px rgba(0, 184, 148, 0.3)',
                  WebkitAppearance: 'none',
                }}
              >
                Join with Code
              </button>
            ) : (
              <div className="flex gap-2 w-full">
                <input
                  type="text" maxLength="6"
                  value={roomIdToJoin}
                  onChange={(e) => setRoomIdToJoin(e.target.value.toUpperCase())}
                  placeholder="ROOM CODE"
                  className="flex-1 rounded-xl px-3 py-3 font-mono tracking-widest text-center uppercase text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ backgroundColor: '#F8F9FA', border: '1px solid #DFE6E9', color: '#2D3436' }}
                />
                <button
                  disabled={!playerName.trim() || !roomIdToJoin.trim() || roomIdToJoin.length < 5}
                  onClick={() => onJoinRoom(roomIdToJoin, playerName, selectedDog)}
                  onTouchEnd={(e) => { if (playerName.trim() && roomIdToJoin.trim() && roomIdToJoin.length >= 5) { e.preventDefault(); onJoinRoom(roomIdToJoin, playerName, selectedDog); } }}
                  className="px-4 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 transition-all active:scale-95"
                  style={{ backgroundColor: '#00b894', boxShadow: '0 4px 6px -1px rgba(0, 184, 148, 0.4)', WebkitAppearance: 'none' }}
                >
                  Join
                </button>
              </div>
            )}

            <button
              disabled={!playerName.trim()}
              onClick={() => onSandbox(playerName, selectedDog)}
              onTouchEnd={(e) => { if (playerName.trim()) { e.preventDefault(); onSandbox(playerName, selectedDog); } }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              style={{ 
                backgroundColor: '#FDCB6E',
                color: '#2D3436',
                boxShadow: '0 4px 6px -1px rgba(253, 203, 110, 0.4)',
                WebkitAppearance: 'none',
              }}
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm">Sandbox Mode</span>
              <span className="text-xs opacity-60 font-medium ml-1">(Solo Test)</span>
            </button>
          </div>

          {/* Public Room List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: '#B2BEC3' }}>
                <Users className="w-3.5 h-3.5 inline mr-1.5" style={{ verticalAlign: '-2px' }} />
                Open Rooms
              </label>
              <button
                onClick={onRefreshRooms}
                onTouchEnd={(e) => { e.preventDefault(); onRefreshRooms(); }}
                className="p-1.5 rounded-lg transition-all active:scale-90"
                style={{ color: '#B2BEC3' }}
                title="Refresh rooms"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #DFE6E9', maxHeight: '160px', overflowY: 'auto' }}>
              {(!publicRooms || publicRooms.length === 0) ? (
                <div className="py-6 text-center text-xs font-medium" style={{ color: '#B2BEC3', backgroundColor: '#F8F9FA' }}>
                  No open rooms — create one!
                </div>
              ) : (
                publicRooms.map((room) => (
                  <div key={room.roomId}
                    className="flex items-center justify-between px-4 py-3 transition-colors"
                    style={{ borderBottom: '1px solid #F1F2F6', backgroundColor: '#FFFFFF' }}
                  >
                    <div>
                      <span className="font-bold text-sm" style={{ color: '#2D3436' }}>{room.hostName}</span>
                      <span className="text-xs ml-2 font-medium" style={{ color: '#B2BEC3' }}>{room.playerCount}/2</span>
                    </div>
                    <button
                      disabled={!playerName.trim()}
                      onClick={() => onJoinRoom(room.roomId, playerName, selectedDog)}
                      onTouchEnd={(e) => { if (playerName.trim()) { e.preventDefault(); onJoinRoom(room.roomId, playerName, selectedDog); } }}
                      className="px-4 py-1.5 rounded-lg font-bold text-xs text-white disabled:opacity-50 transition-all active:scale-95"
                      style={{ 
                        backgroundColor: '#D63031',
                        boxShadow: '0 2px 4px rgba(214, 48, 49, 0.25)',
                        WebkitAppearance: 'none',
                      }}
                    >
                      Join
                    </button>
                  </div>
                ))
              )}
            </div>


          </div>
        </div>
      </motion.div>

      <div className="mt-6 text-xs font-medium flex items-center gap-2 z-10" style={{ color: '#B2BEC3' }}>
        <Users className="w-3.5 h-3.5" /> Ensure microphone permissions are enabled
      </div>
    </div>
  );
}
