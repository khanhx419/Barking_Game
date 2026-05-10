import { useState, useEffect, useRef, useCallback } from 'react';
import { calculatePower } from '../lib/audioProcessor';

const DEFAULT_GAIN = 4.0; // Amplification factor — adjustable for mic sensitivity

export function useAudioAnalyser(isActive, onPowerUpdate) {
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);
  
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const gainNodeRef = useRef(null);
  const sourceRef = useRef(null);
  const requestRef = useRef(null);
  const streamRef = useRef(null);
  
  const sustainRef = useRef(1.0);
  const onPowerUpdateRef = useRef(onPowerUpdate);
  
  // Keep callback ref fresh without re-creating the loop
  useEffect(() => {
    onPowerUpdateRef.current = onPowerUpdate;
  }, [onPowerUpdate]);

  const startMic = useCallback(async () => {
    // Don't re-open if already open
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      
      // Create analyser
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.3;
      analyserRef.current = analyser;
      
      // Create gain node for mic amplification
      const gain = ctx.createGain();
      gain.gain.value = DEFAULT_GAIN;
      gainNodeRef.current = gain;
      
      // Wire: Mic -> GainNode -> AnalyserNode
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(gain);
      gain.connect(analyser);
      
      setHasPermission(true);
      setError(null);
      console.log('Microphone started — gain:', DEFAULT_GAIN);
    } catch (err) {
      console.error('Error accessing mic:', err);
      setError('Microphone access denied or unavailable.');
      setHasPermission(false);
    }
  }, []);

  const stopMic = useCallback(() => {
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    gainNodeRef.current = null;
    sourceRef.current = null;
    sustainRef.current = 1.0;
    setHasPermission(false);
  }, []);

  // The rAF analysis loop — only depends on refs, never re-created
  const tick = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (dataArray[i] / 128.0) - 1.0;
      sumSquares += normalized * normalized;
    }
    
    const rms = Math.sqrt(sumSquares / bufferLength);
    
    // Map raw RMS -> 0-100 scale.
    // After the gain node amplification, rms values are larger,
    // so we use a moderate multiplier here.
    const rawVolume = Math.min(100, rms * 250);
    const volume = Math.round(rawVolume * 10) / 10; // one decimal

    const { sustain, totalPower } = calculatePower(volume, sustainRef.current);
    sustainRef.current = sustain;

    if (onPowerUpdateRef.current) {
      onPowerUpdateRef.current({ volume, sustain, totalPower });
    }

    requestRef.current = requestAnimationFrame(tick);
  }, []);

  // Start / stop the rAF loop when isActive + hasPermission changes
  useEffect(() => {
    if (isActive && hasPermission && analyserRef.current) {
      // Kick off the loop
      requestRef.current = requestAnimationFrame(tick);
    } else {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
        requestRef.current = null;
      }
    };
  }, [isActive, hasPermission, tick]);

  return { startMic, stopMic, hasPermission, error };
}
