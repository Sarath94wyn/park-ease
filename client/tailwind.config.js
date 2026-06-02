/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#F8F9FA',      // Hover State
          100: '#F1F3F4',     // Selected State
          200: '#E8EAED',     // Card / Divider border
          300: '#DADCE0',     // Input border
          400: '#5F6368',     // Secondary text
          500: '#202124',     // Primary text
          600: '#000000',     // Primary action button (solid black)
          700: '#1F1F1F',     // Primary action button hover
          800: '#111111',
          900: '#000000',
        },
        accent: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 1px 3px 0 rgba(60, 64, 67, 0.15), 0 4px 8px 3px rgba(60, 64, 67, 0.08)',
        'glass-sm': '0 1px 2px 0 rgba(60, 64, 67, 0.15), 0 1px 3px 1px rgba(60, 64, 67, 0.08)',
        'neon': '0 4px 12px rgba(60, 64, 67, 0.05)',
        'neon-cyan': '0 4px 12px rgba(60, 64, 67, 0.05)',
      },
    },
  },
  plugins: [],
}
