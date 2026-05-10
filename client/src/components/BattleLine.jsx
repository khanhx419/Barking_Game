import { motion } from 'framer-motion';

export default function BattleLine({ position }) {
  const clampedPos = Math.max(2, Math.min(98, position));
  
  const isP1Winning = clampedPos > 52;
  const isP2Winning = clampedPos < 48;
  const indicatorColor = isP1Winning ? '#0984E3' : isP2Winning ? '#D63031' : '#B2BEC3';

  return (
    <div className="w-full rounded-xl overflow-hidden relative"
      style={{ 
        height: '28px',
        backgroundColor: '#DFE6E9',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      }}
    >
      {/* P1 side fill (blue, from left) */}
      <div 
        className="absolute top-0 bottom-0 left-0 transition-all duration-100 ease-out rounded-l-xl"
        style={{ 
          width: `${clampedPos}%`,
          background: 'linear-gradient(90deg, rgba(9, 132, 227, 0.35), rgba(9, 132, 227, 0.12))',
        }}
      />
      
      {/* P2 side fill (red, from right) */}
      <div 
        className="absolute top-0 bottom-0 right-0 transition-all duration-100 ease-out rounded-r-xl"
        style={{ 
          width: `${100 - clampedPos}%`,
          background: 'linear-gradient(270deg, rgba(214, 48, 49, 0.35), rgba(214, 48, 49, 0.12))',
        }}
      />

      {/* Center marker */}
      <div className="absolute top-0 bottom-0 left-1/2 w-px -translate-x-1/2"
        style={{ backgroundColor: 'rgba(45, 52, 54, 0.15)' }}
      />

      {/* Moving cursor indicator */}
      <motion.div
        className="absolute top-0 bottom-0 flex items-center justify-center"
        style={{ width: '8px' }}
        animate={{ left: `calc(${clampedPos}% - 4px)` }}
        transition={{ type: 'spring', bounce: 0.1, duration: 0.15 }}
      >
        <div 
          className="w-2 h-full rounded-full"
          style={{ 
            backgroundColor: indicatorColor,
            boxShadow: `0 0 10px ${indicatorColor}80`,
          }}
        />
      </motion.div>

      {/* Labels */}
      <div className="absolute inset-0 flex justify-between items-center px-3 pointer-events-none">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#0984E3' }}>P1</span>
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#D63031' }}>P2</span>
      </div>
    </div>
  );
}
