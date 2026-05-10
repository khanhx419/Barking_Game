import { motion } from 'framer-motion';

export default function Countdown({ count, p1, p2 }) {
  const isBark = count === 'BARK!';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="absolute top-20 flex justify-between w-full max-w-4xl px-12">
        <div className="text-center">
          <div className="text-p1-400 font-black text-4xl uppercase tracking-wider">{p1}</div>
          <div className="text-gray-400 mt-2 font-bold tracking-widest uppercase">Player 1</div>
        </div>
        <div className="text-center">
          <div className="text-p2-400 font-black text-4xl uppercase tracking-wider">{p2}</div>
          <div className="text-gray-400 mt-2 font-bold tracking-widest uppercase">Player 2</div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-white/60 text-xl font-bold tracking-[0.2em] mb-8 uppercase">Get Ready to make noise</div>
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          className={`font-black tracking-tighter ${isBark ? 'text-9xl text-battle-glow drop-shadow-glow-gold' : 'text-8xl text-white'}`}
        >
          {count}
        </motion.div>
        {isBark && (
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-white mix-blend-overlay pointer-events-none"
          />
        )}
      </div>
    </div>
  );
}
