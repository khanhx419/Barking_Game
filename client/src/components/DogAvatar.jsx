import { motion } from 'framer-motion';
import { getDogById } from '../lib/dogBreeds';

export default function DogAvatar({ scale, isLeft, colorTheme, isBarking, dogBreed }) {
  const dog = getDogById(dogBreed);
  
  return (
    <div className={`relative z-10 flex ${isLeft ? 'justify-start' : 'justify-end'} items-end h-[400px]`}>
      <motion.div
        animate={{
          scale: scale,
          y: isBarking ? [0, -10, 0] : 0,
        }}
        transition={{
          scale: { type: "spring", stiffness: 100, damping: 20 },
          y: { duration: 0.1, repeat: isBarking ? Infinity : 0, repeatType: "reverse" }
        }}
        className={`origin-bottom relative ${isLeft ? 'origin-bottom-left' : 'origin-bottom-right'}`}
        style={{ transformOrigin: isLeft ? 'bottom left' : 'bottom right' }}
      >
        {/* Glow behind dog */}
        <div className={`absolute -inset-10 ${colorTheme === 'blue' ? 'bg-p1-500/20' : 'bg-p2-500/20'} rounded-full blur-3xl -z-10 mix-blend-screen opacity-50`}></div>
        
        <img 
          src={dog.svg} 
          alt={`${dog.name} Avatar`}
          className="w-56 h-56 md:w-64 md:h-64 object-contain drop-shadow-2xl"
          style={{ 
            transform: isLeft ? 'scaleX(1)' : 'scaleX(-1)',
            filter: colorTheme === 'blue' 
              ? 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))' 
              : 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))'
          }}
        />
        
        {/* Barking text effect */}
        {isBarking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0.8, 1, 0.8], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.3 }}
            className={`absolute top-5 ${isLeft ? '-right-8' : '-left-8'} ${colorTheme === 'blue' ? 'text-p1-400' : 'text-p2-400'} font-black text-2xl md:text-3xl z-20 select-none`}
          >
            {isLeft ? 'WOOF!' : 'BARK!'}
          </motion.div>
        )}

        {/* Name plate */}
        <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full border ${
          colorTheme === 'blue' ? 'bg-p1-600/30 border-p1-500/30 text-p1-400' : 'bg-p2-600/30 border-p2-500/30 text-p2-400'
        }`}>
          {dog.name}
        </div>
      </motion.div>
    </div>
  );
}
