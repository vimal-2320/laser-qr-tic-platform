/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        industrial: {
          950: '#090b0e',
          900: '#0f1318',
          850: '#151b22',
          800: '#1c232d',
          700: '#283340',
          600: '#384656',
          500: '#4e5f73',
          400: '#6d8199',
          300: '#94a5b8',
          200: '#cbd5e1',
          100: '#f1f5f9'
        },
        cyanAccent: {
          DEFAULT: '#00f2fe',
          glow: '#4facfe',
          dim: '#0369a1',
        },
        amberAccent: {
          DEFAULT: '#f59e0b',
          glow: '#fbbf24',
          laser: '#ff3b30',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 25px -5px rgba(0, 242, 254, 0.3)',
        'amber-glow': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'laser-glow': '0 0 30px 2px rgba(255, 59, 48, 0.45)',
      }
    },
  },
  plugins: [],
}
