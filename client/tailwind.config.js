/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['Space Grotesk', 'sans-serif']
      },
      colors: {
        base: '#0b141a',
        surface: '#111b21',
        accent: '#25d366',
        accentDark: '#00a884'
      },
      boxShadow: {
        glow: '0 0 32px rgba(37,211,102,0.32)',
        violet: '0 0 32px rgba(0,168,132,0.3)'
      },
      backgroundImage: {
        mesh: 'radial-gradient(at 14% 20%, rgba(37,211,102,.22), transparent 38%), radial-gradient(at 82% 10%, rgba(0,168,132,.2), transparent 36%), radial-gradient(at 34% 82%, rgba(37,211,102,.1), transparent 35%)'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.7 },
          '50%': { opacity: 1 }
        }
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
