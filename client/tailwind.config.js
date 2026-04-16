/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Premium Indigo Design System ──────────────────
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',   // Secondary
          600: '#4F46E5',   // Primary
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        surface: {
          50:  '#F8FAFC',   // Page background
          100: '#F1F5F9',   // Subtle bg
          200: '#E2E8F0',   // Borders
          300: '#CBD5E1',
        },
        txt: {
          primary:   '#0F172A',  // Headings
          secondary: '#64748B',  // Body text
          tertiary:  '#94A3B8',  // Muted
        },
        success: {
          50:  '#ECFDF5',
          100: '#D1FAE5',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          50:  '#FFFBEB',
          100: '#FEF3C7',
          500: '#F59E0B',
          600: '#D97706',
        },
        danger: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          500: '#EF4444',
          600: '#DC2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'soft':       '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card':       '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 4px 12px -2px rgb(0 0 0 / 0.04)',
        'card-hover': '0 8px 25px -5px rgb(0 0 0 / 0.08), 0 4px 10px -4px rgb(0 0 0 / 0.03)',
        'elevated':   '0 12px 40px -8px rgb(0 0 0 / 0.1), 0 4px 12px -4px rgb(0 0 0 / 0.04)',
        'glow':       '0 0 0 1px rgb(79 70 229 / 0.1), 0 4px 20px -2px rgb(79 70 229 / 0.15)',
        'glow-lg':    '0 0 0 1px rgb(79 70 229 / 0.12), 0 8px 40px -4px rgb(79 70 229 / 0.2)',
        'nav':        '0 1px 4px 0 rgb(0 0 0 / 0.06), 0 0 0 1px rgb(0 0 0 / 0.02)',
        'inner-glow': 'inset 0 1px 0 0 rgb(255 255 255 / 0.1)',
      },
      backgroundImage: {
        'subtle-grid': 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)',
        'hero-gradient': 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 40%, #F5F3FF 70%, #F8FAFC 100%)',
        'mesh-gradient': 'radial-gradient(at 40% 20%, hsla(240, 100%, 96%, 1) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(254, 100%, 94%, 1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(240, 100%, 97%, 1) 0px, transparent 50%)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
      },
      backgroundSize: {
        'grid-16': '16px 16px',
      },
      animation: {
        'fade-in':      'fadeIn 0.5s ease-out',
        'fade-in-up':   'fadeInUp 0.6s ease-out',
        'slide-up':     'slideUp 0.5s ease-out',
        'slide-down':   'slideDown 0.3s ease-out',
        'slide-left':   'slideLeft 0.5s ease-out',
        'scale-in':     'scaleIn 0.3s ease-out',
        'scale-bounce': 'scaleBounce 0.5s ease-out',
        'pulse-slow':   'pulse 3s ease-in-out infinite',
        'shimmer':      'shimmer 2s ease-in-out infinite',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'float':        'float 6s ease-in-out infinite',
        'float-slow':   'float 8s ease-in-out infinite',
        'float-delay':  'float 7s ease-in-out infinite 2s',
        'orbit':        'orbit 20s linear infinite',
        'gradient':     'gradientShift 8s ease infinite',
        'counter':      'countUp 1s ease-out',
        'morph':        'morph 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%':   { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleBounce: {
          '0%':   { opacity: '0', transform: 'scale(0.8)' },
          '60%':  { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79, 70, 229, 0.1)' },
          '50%':      { boxShadow: '0 0 40px rgba(79, 70, 229, 0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-12px)' },
        },
        orbit: {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        morph: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%':      { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
