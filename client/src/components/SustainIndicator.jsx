import { motion } from 'framer-motion';

export default function SustainIndicator({ sustain, alignLeft }) {
  const percentage = ((sustain - 1) / 2) * 100;
  
  let barColor = '#B2BEC3';
  if (sustain >= 2.5) barColor = '#D63031';
  else if (sustain >= 1.5) barColor = '#FDCB6E';

  return (
    <div className={`flex flex-col gap-0.5 ${alignLeft ? 'items-start' : 'items-end'}`}>
      <div className="flex items-center gap-2">
        {alignLeft && (
          <div className="text-base font-black font-mono" style={{ color: '#2D3436' }}>
            {sustain.toFixed(1)}x
          </div>
        )}
        
        <div className="w-24 h-1.5 rounded-full overflow-hidden relative"
          style={{ backgroundColor: '#DFE6E9' }}
        >
          <motion.div
            className={`absolute top-0 bottom-0 ${alignLeft ? 'left-0' : 'right-0'} rounded-full`}
            style={{ backgroundColor: barColor }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
          />
        </div>

        {!alignLeft && (
          <div className="text-base font-black font-mono" style={{ color: '#2D3436' }}>
            {sustain.toFixed(1)}x
          </div>
        )}
      </div>
    </div>
  );
}
