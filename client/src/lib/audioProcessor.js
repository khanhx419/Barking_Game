export const AUDIO_CONSTANTS = {
  VOLUME_THRESHOLD: 15,        // 15% of max (0-100 scale) needed to build sustain
  MULTIPLIER_INCREMENT: 0.05,  // Per tick increase
  MAX_MULTIPLIER: 3.0,         // Cap at 3x
  MIN_MULTIPLIER: 1.0,         // Resets to 1x
  MAX_VOLUME_SCALE: 100,
};

export function calculatePower(currentVolume, currentSustain) {
  let newSustain = currentSustain;
  
  if (currentVolume >= AUDIO_CONSTANTS.VOLUME_THRESHOLD) {
    newSustain = Math.min(newSustain + AUDIO_CONSTANTS.MULTIPLIER_INCREMENT, AUDIO_CONSTANTS.MAX_MULTIPLIER);
  } else {
    newSustain = AUDIO_CONSTANTS.MIN_MULTIPLIER; // Hard reset
  }
  
  const totalPower = currentVolume * newSustain;
  
  return {
    sustain: newSustain,
    totalPower
  };
}
