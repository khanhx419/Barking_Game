import { motion } from 'framer-motion';

export default function Countdown({ count, p1, p2 }) {
  const isBark = count === 'BARK!';

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ backgroundColor: 'rgba(248, 249, 250, 0.95)', backdropFilter: 'blur(12px)' }}>
      
      <div className="absolute top-20 flex justify-between w-full max-w-4xl px-12">
        <div className="text-center">
          <div className="font-black text-4xl uppercase tracking-wider" style={{ color: '#0984E3' }}>{p1}</div>
          <div className="mt-2 font-bold tracking-widest uppercase" style={{ color: '#B2BEC3' }}>Player 1</div>
        </div>
        <div className="text-center">
          <div className="font-black text-4xl uppercase tracking-wider" style={{ color: '#D63031' }}>{p2}</div>
          <div className="mt-2 font-bold tracking-widest uppercase" style={{ color: '#B2BEC3' }}>Player 2</div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-xl font-bold tracking-[0.2em] mb-8 uppercase" style={{ color: '#B2BEC3' }}>Get Ready to make noise</div>
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          className="font-black tracking-tighter"
          style={{ 
            fontSize: isBark ? '8rem' : '7rem',
            color: isBark ? '#FDCB6E' : '#2D3436',
          }}
        >
          {count}
        </motion.div>
      </div>
    </div>
  );
}
