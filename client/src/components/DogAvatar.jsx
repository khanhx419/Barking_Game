import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { getDogImage, getDogById } from '../lib/dogBreeds';

export default function DogAvatar({ scale, isLeft, colorTheme, isBarking, dogBreed, volume }) {
  const dog = getDogById(dogBreed);
  const side = isLeft ? 'left' : 'right';
  const imageSrc = getDogImage(dogBreed, side);
  
  // Bark-shake intensity — scales with volume
  const clampedVolume = Math.min(100, Math.max(0, volume || 0));
  const shakeIntensity = clampedVolume > 10 ? Math.min(8, (clampedVolume / 100) * 8) : 0;
  
  const shakeAnimation = useMemo(() => {
    if (shakeIntensity <= 0) return {};
    const amp = shakeIntensity;
    return {
      x: [0, -amp, amp, -amp * 0.6, amp * 0.6, 0],
      y: [0, -amp * 0.5, 0, -amp * 0.3, 0, 0],
    };
  }, [shakeIntensity]);

  // Theme colors using the exact palette
  const accentColor = colorTheme === 'blue' ? '#0984E3' : '#D63031';
  const accentLight = colorTheme === 'blue' ? 'rgba(9, 132, 227, 0.15)' : 'rgba(214, 48, 49, 0.15)';
  const accentBorder = colorTheme === 'blue' ? 'rgba(9, 132, 227, 0.3)' : 'rgba(214, 48, 49, 0.3)';

  return (
    <div className={`relative z-10 flex ${isLeft ? 'justify-start' : 'justify-end'} items-end`}
      style={{ height: '100%', maxHeight: '450px' }}
    >
      <motion.div
        animate={{
          scale: scale,
          ...shakeAnimation,
        }}
        transition={{
          scale: { type: "tween", duration: 0.2, ease: "easeOut" },
          x: { duration: 0.08, repeat: shakeIntensity > 0 ? Infinity : 0, repeatType: "mirror" },
          y: { duration: 0.1, repeat: shakeIntensity > 0 ? Infinity : 0, repeatType: "mirror" },
        }}
        style={{ transformOrigin: isLeft ? 'bottom left' : 'bottom right' }}
        className="relative"
      >
        {/* Soft glow behind dog */}
        <div 
          className="absolute -inset-8 rounded-full blur-3xl -z-10"
          style={{ 
            backgroundColor: accentLight,
            opacity: 0.3 + (clampedVolume / 100) * 0.5
          }}
        />
        
        {/* Dog PNG image */}
        <img 
          src={imageSrc}
          alt={`${dog.name} Avatar`}
          className="object-contain"
          style={{ 
            width: '280px',
            height: '280px',
            filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.15))`,
          }}
          draggable={false}
        />
        
        {/* Barking text effect */}
        {isBarking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: [0.7, 1, 0.7], scale: [0.9, 1.1, 0.9], y: [-5, -15, -5] }}
            transition={{ repeat: Infinity, duration: 0.25 }}
            className={`absolute top-2 ${isLeft ? '-right-6' : '-left-6'} font-black text-2xl md:text-3xl z-20 select-none`}
            style={{ color: accentColor }}
          >
            {isLeft ? 'WOOF!' : 'BARK!'}
          </motion.div>
        )}

        {/* Name plate */}
        <div 
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full"
          style={{
            backgroundColor: accentLight,
            border: `1px solid ${accentBorder}`,
            color: accentColor,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          {dog.name}
        </div>
      </motion.div>
    </div>
  );
}
