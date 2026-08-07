/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0F0B1E',
          soft: '#170F2E',
          softer: '#1F1640',
        },
        glow: {
          pink: '#FF3EA5',
          cyan: '#4EF2C4',
          gold: '#FFC24B',
          violet: '#8B5CF6',
        },
        mist: {
          DEFAULT: '#F4EEFF',
          muted: '#B7ADD1',
          dim: '#8B7FAE',
        },
      },
fontFamily: {
        brand: ['"Orbitron"', 'sans-serif'],
        cursive: ['"Dancing Script"', 'cursive'],
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grabit-gradient': 'linear-gradient(120deg, #FF3EA5 0%, #8B5CF6 50%, #4EF2C4 100%)',
        'grabit-radial': 'radial-gradient(circle at 30% 20%, rgba(255,62,165,0.25), transparent 45%), radial-gradient(circle at 80% 10%, rgba(78,242,196,0.18), transparent 40%), radial-gradient(circle at 60% 80%, rgba(139,92,246,0.25), transparent 45%)',
      },
      animation: {
        'gradient-x': 'gradient-x 6s ease infinite',
        'blob': 'blob 12s infinite ease-in-out',
        'float': 'float 5s ease-in-out infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -40px) scale(1.1)' },
          '66%': { transform: 'translate(-25px, 25px) scale(0.95)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundSize: {
        '200%': '200% 200%',
      },
    },
  },
  plugins: [],
}
