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
    },
  },
  plugins: [],
};
