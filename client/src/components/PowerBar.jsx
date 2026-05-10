import { motion } from 'framer-motion';

const COLORS = {
  p1: { bar: '#0984E3', glow: 'rgba(9, 132, 227, 0.25)' },   // Vibrant Sky Blue
  p2: { bar: '#D63031', glow: 'rgba(214, 48, 49, 0.25)' },     // Soft Pastel Red
};

export default function PowerBar({ power, maxPower, colorClass, isLeft }) {
  const percentage = Math.min(100, (power / maxPower) * 100);
  const colors = COLORS[colorClass] || COLORS.p1;
  
  return (
    <div className="flex-1 h-7 rounded-full overflow-hidden relative"
      style={{ 
        backgroundColor: '#DFE6E9',  /* Light Silver */
      }}
    >
      <motion.div
        className={`absolute top-0 bottom-0 ${isLeft ? 'left-0' : 'right-0'} rounded-full`}
        style={{ backgroundColor: colors.bar, boxShadow: `0 0 8px ${colors.glow}` }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
      >
        <div className="absolute inset-0 bg-white/20 rounded-full" />
      </motion.div>
    </div>
  );
}
