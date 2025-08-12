/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fresh morning vibe colors - light grey and cyan theme
        'morning': {
          50: '#f8fafc',   // Very light grey
          100: '#f1f5f9',  // Light grey
          200: '#e2e8f0',  // Medium light grey
          300: '#cbd5e1',  // Medium grey
          400: '#94a3b8',  // Darker grey
          500: '#64748b',  // Dark grey
          600: '#475569',  // Very dark grey
          700: '#334155',  // Darkest grey
          800: '#1e293b',  // Near black
          900: '#0f172a',  // Black
        },
        'cyan': {
          50: '#ecfeff',   // Very light cyan
          100: '#cffafe',  // Light cyan
          200: '#a5f3fc',  // Medium light cyan
          300: '#67e8f9',  // Medium cyan
          400: '#22d3ee',  // Bright cyan
          500: '#06b6d4',  // Primary cyan
          600: '#0891b2',  // Dark cyan
          700: '#0e7490',  // Darker cyan
          800: '#155e75',  // Very dark cyan
          900: '#164e63',  // Darkest cyan
        },
        'success': {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
        },
        'warning': {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
        },
        'error': {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'display': ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(6, 182, 212, 0.3)',
      },
    },
  },
  plugins: [],
} 