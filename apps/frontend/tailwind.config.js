/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 나무 질감 색상
        wood: {
          light: '#d4a574',
          DEFAULT: '#8b5a2b',
          dark: '#5c3a21',
          darker: '#3d2516',
        },
        // 붉은 천 (카지노 펠트) 색상
        felt: {
          light: '#c94a4a',
          DEFAULT: '#8b2323',
          dark: '#5c1515',
          darker: '#3d0e0e',
        },
        // 골드 액센트
        gold: {
          light: '#ffd700',
          DEFAULT: '#daa520',
          dark: '#b8860b',
        },
        // 주사위 색상
        dice: {
          bg: '#f5f5dc',
          dot: '#1a1a1a',
          kept: '#ffd700',
        },
      },
      fontFamily: {
        game: ['Georgia', 'serif'],
      },
      boxShadow: {
        wood: 'inset 0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.4)',
        felt: 'inset 0 0 20px rgba(0,0,0,0.5)',
        dice: '2px 2px 4px rgba(0,0,0,0.3)',
        'dice-kept': '0 0 10px #ffd700, 0 0 20px #ffd700',
      },
      backgroundImage: {
        'wood-texture':
          'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        'felt-texture':
          'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
      },
      animation: {
        'dice-shake': 'dice-shake 0.1s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 3s infinite',
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'fade-out-down': 'fade-out-down 0.3s ease-in forwards',
        'score-flash': 'score-flash 1.5s ease-out forwards',
      },
      keyframes: {
        'dice-shake': {
          '0%, 100%': { transform: 'translate(0, 0) rotate(0deg)' },
          '25%': { transform: 'translate(-2px, 1px) rotate(-3deg)' },
          '50%': { transform: 'translate(2px, -1px) rotate(3deg)' },
          '75%': { transform: 'translate(-1px, 2px) rotate(-2deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(10deg)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-out-down': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(10px)' },
        },
        'score-flash': {
          '0%': { backgroundColor: 'rgba(218, 165, 32, 0.5)', transform: 'scale(1.05)' },
          '25%': { backgroundColor: 'rgba(218, 165, 32, 0.3)', transform: 'scale(1)' },
          '50%': { backgroundColor: 'rgba(218, 165, 32, 0.4)', transform: 'scale(1.02)' },
          '75%': { backgroundColor: 'rgba(218, 165, 32, 0.2)', transform: 'scale(1)' },
          '100%': { backgroundColor: 'transparent', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
