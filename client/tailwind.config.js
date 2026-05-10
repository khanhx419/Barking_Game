/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: { 900: '#0a0a1a', 800: '#111133' },
        p1: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb' },
        p2: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
        battle: { glow: '#fbbf24' },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'bark-shake': 'barkShake 0.1s ease-in-out infinite',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'glow-gold': '0 0 30px rgba(251, 191, 36, 0.6)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.8))' },
          '50%': { opacity: 0.8, filter: 'drop-shadow(0 0 25px rgba(251, 191, 36, 1))' },
        },
        barkShake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-2px)' },
          '75%': { transform: 'translateX(2px)' },
        }
      }
    },
  },
  plugins: [],
}
