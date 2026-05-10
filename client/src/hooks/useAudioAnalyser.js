import { useState, useEffect, useRef, useCallback } from 'react';
import { calculatePower } from '../lib/audioProcessor';

export function useAudioAnalyser(isActive, onPowerUpdate) {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const requestRef = useRef(null);
  const streamRef = useRef(null);
  
  const sustainRef = useRef(1.0);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      setHasPermission(true);
      setError(null);
    } catch (err) {
      console.error('Error accessing mic:', err);
      setError('Microphone access denied or unavailable.');
      setHasPermission(false);
    }
  };

  const stopMic = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const updateLoop = useCallback(() => {
    if (!isActive || !analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.fftSize);
    analyserRef.current.getByteTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const normalized = (dataArray[i] / 128.0) - 1.0;
      sumSquares += normalized * normalized;
    }
    
    const rms = Math.sqrt(sumSquares / dataArray.length);
    
    // Map RMS (0-1 typically, but realistically 0-0.5 for voice) to 0-100 scale
    // Tweaking multiplier for better responsiveness
    const rawVolume = Math.min(100, rms * 400); 
    
    // Smooth out jitter slightly
    const volume = Math.floor(rawVolume);

    const { sustain, totalPower } = calculatePower(volume, sustainRef.current);
    sustainRef.current = sustain;

    if (onPowerUpdate) {
      onPowerUpdate({ volume, sustain, totalPower });
    }

    requestRef.current = requestAnimationFrame(updateLoop);
  }, [isActive, onPowerUpdate]);

  useEffect(() => {
    if (isActive && hasPermission) {
      requestRef.current = requestAnimationFrame(updateLoop);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, hasPermission, updateLoop]);

  return { startMic, stopMic, hasPermission, error };
}
