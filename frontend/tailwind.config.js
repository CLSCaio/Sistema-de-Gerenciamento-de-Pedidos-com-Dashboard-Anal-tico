/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#241c16',
        ember: '#e25b1a',
        cream: '#f6f1e8',
        sand: '#eadfce',
        pine: '#1f6b4a',
        clay: '#8d3b32',
        mist: '#6f655c',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      boxShadow: {
        card: '0 16px 40px rgba(36, 28, 22, 0.08)',
      },
    },
  },
  plugins: [],
};
