import { motion } from 'framer-motion';

export default function PowerBar({ power, maxPower, colorClass, isLeft }) {
  // power max is approx 300 (100 volume * 3.0 sustain)
  const percentage = Math.min(100, (power / maxPower) * 100);
  
  return (
    <div className="flex-1 bg-black/40 h-8 rounded-full border border-white/10 overflow-hidden relative backdrop-blur-sm">
      <motion.div
        className={`absolute top-0 bottom-0 ${isLeft ? 'left-0' : 'right-0'} ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
      >
        <div className="absolute inset-0 bg-white/20 mix-blend-overlay"></div>
      </motion.div>
    </div>
  );
}
