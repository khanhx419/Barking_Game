import { motion } from 'framer-motion';
import { Trophy, RefreshCw } from 'lucide-react';

export default function GameOver({ winner, reason, onPlayAgain }) {
  const isTie = winner === 'Tie';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="bg-arena-800 border border-white/10 rounded-3xl p-10 max-w-lg w-full text-center relative overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-battle-glow/10 to-transparent pointer-events-none"></div>
        
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 mx-auto bg-battle-glow/20 rounded-full flex items-center justify-center mb-6 shadow-glow-gold relative z-10"
        >
          <Trophy className="w-10 h-10 text-battle-glow" />
        </motion.div>

        <h2 className="text-2xl font-bold text-gray-400 tracking-widest uppercase mb-2 relative z-10">
          {reason}
        </h2>
        
        <div className="mb-10 relative z-10">
          {isTie ? (
            <h1 className="text-5xl font-black text-white">It's a Tie!</h1>
          ) : (
            <>
              <div className="text-gray-300 mb-1">Winner</div>
              <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-battle-glow to-yellow-200 drop-shadow-md">
                {winner}
              </h1>
            </>
          )}
        </div>

        <button 
          onClick={onPlayAgain}
          className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-arena-900 font-bold rounded-xl overflow-hidden hover:scale-105 transition-transform w-full z-10"
        >
          <div className="absolute inset-0 bg-gray-200 group-hover:translate-x-full transition-transform duration-300 ease-out"></div>
          <RefreshCw className="w-5 h-5 relative z-10 group-hover:rotate-180 transition-transform duration-500" />
          <span className="relative z-10">Back to Lobby</span>
        </button>
      </motion.div>
    </div>
  );
}
