const { MAX_VOLUME, MAX_SUSTAIN } = require('./constants');

class PowerCalculator {
  static validate(data) {
    if (!data || typeof data !== 'object') return { volume: 0, sustain: 1.0, totalPower: 0 };
    
    // Clamp values to prevent client-side cheating
    const volume = Math.max(0, Math.min(Number(data.volume) || 0, MAX_VOLUME));
    const sustain = Math.max(1.0, Math.min(Number(data.sustain) || 1.0, MAX_SUSTAIN));
    
    // Recalculate total to ensure integrity
    const totalPower = volume * sustain;
    
    return { volume, sustain, totalPower };
  }
}

module.exports = PowerCalculator;
