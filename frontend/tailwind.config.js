/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'sans-serif'],
        hand: ['"Caveat"', 'cursive'],
      },
      colors: {
        parchment: {
          50: '#fdf8f0',
          100: '#faf2e4',
          200: '#f5e6cc',
          300: '#edd5ab',
          400: '#e2bc7f',
          500: '#d4a05a',
          600: '#c9853a',
          700: '#a96a2a',
          800: '#8a5422',
          900: '#6b3f1a',
        },
        ink: {
          50: '#f8f5f0',
          100: '#ede6da',
          200: '#d8cbb5',
          300: '#bfa98a',
          400: '#9c8060',
          500: '#7d6245',
          600: '#5c4a2a',
          700: '#3d3018',
          800: '#261e0e',
          900: '#1a1208',
        }
      },
      backgroundImage: {
        'paper-lines': 'repeating-linear-gradient(transparent, transparent calc(2.2em - 1px), #e8d8c0 calc(2.2em - 1px), #e8d8c0 2.2em)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        bounceIn: { from: { opacity: '0', transform: 'scale(0.8)' }, to: { opacity: '1', transform: 'scale(1)' } },
      }
    }
  },
  plugins: []
}