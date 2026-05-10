import { motion } from 'framer-motion';

export default function SustainIndicator({ sustain, alignLeft }) {
  // sustain ranges from 1.0 to 3.0
  const percentage = ((sustain - 1) / 2) * 100;
  
  let colorClass = 'bg-white';
  if (sustain >= 2.5) colorClass = 'bg-red-500 shadow-glow-red animate-pulse';
  else if (sustain >= 1.5) colorClass = 'bg-yellow-400 shadow-glow-gold';

  return (
    <div className={`flex flex-col gap-1 ${alignLeft ? 'items-start' : 'items-end'}`}>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
        Sustain Multiplier
      </div>
      <div className="flex items-center gap-3">
        {alignLeft && <div className="text-xl font-black font-mono text-white">{sustain.toFixed(1)}x</div>}
        
        <div className="w-32 h-2 bg-black/40 rounded-full border border-white/10 overflow-hidden relative">
          <motion.div
            className={`absolute top-0 bottom-0 ${alignLeft ? 'left-0' : 'right-0'} ${colorClass}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
          />
        </div>

        {!alignLeft && <div className="text-xl font-black font-mono text-white">{sustain.toFixed(1)}x</div>}
      </div>
    </div>
  );
}
