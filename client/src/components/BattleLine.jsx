import { motion } from 'framer-motion';

export default function BattleLine({ position }) {
  // position is 0 to 100
  return (
    <div className="absolute top-0 bottom-0 left-0 right-0 pointer-events-none z-20 overflow-hidden">
      <motion.div
        className="absolute top-0 bottom-0 w-2 bg-white shadow-glow-gold z-30"
        initial={{ left: '50%', x: '-50%' }}
        animate={{ left: `${position}%`, x: '-50%' }}
        transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
      >
        {/* Glowing pulse effect */}
        <div className="absolute inset-0 bg-battle-glow animate-pulse-glow blur-[2px]"></div>
        
        {/* Core line */}
        <div className="absolute inset-0 bg-white"></div>
      </motion.div>
      
      {/* Visual center marker */}
      <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/20 -translate-x-1/2 border-x border-black/50 border-dashed"></div>
    </div>
  );
}
