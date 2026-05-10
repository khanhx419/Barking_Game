import { motion } from 'framer-motion';
import { Trophy, RefreshCw } from 'lucide-react';

export default function GameOver({ winner, reason, onPlayAgain }) {
  const isTie = winner === 'Tie';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(248, 249, 250, 0.88)', backdropFilter: 'blur(12px)' }}>
      
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="rounded-3xl p-10 max-w-lg w-full text-center relative overflow-hidden"
        style={{ 
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 10px 15px -3px rgb(0 0 0 / 0.1)',
        }}
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
          style={{ backgroundColor: 'rgba(253, 203, 110, 0.2)' }}
        >
          <Trophy className="w-10 h-10" style={{ color: '#FDCB6E' }} />
        </motion.div>

        <h2 className="text-2xl font-bold tracking-widest uppercase mb-2" style={{ color: '#B2BEC3' }}>
          {reason}
        </h2>
        
        <div className="mb-10">
          {isTie ? (
            <h1 className="text-5xl font-black" style={{ color: '#2D3436' }}>It's a Tie!</h1>
          ) : (
            <>
              <div className="mb-1" style={{ color: '#B2BEC3' }}>Winner</div>
              <h1 className="text-6xl font-black" style={{ color: '#FDCB6E' }}>
                {winner}
              </h1>
            </>
          )}
        </div>

        <button 
          onClick={onPlayAgain}
          className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold rounded-xl hover:scale-105 transition-transform w-full text-white"
          style={{ 
            backgroundColor: '#2D3436',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <RefreshCw className="w-5 h-5" />
          <span>Back to Lobby</span>
        </button>
      </motion.div>
    </div>
  );
}
