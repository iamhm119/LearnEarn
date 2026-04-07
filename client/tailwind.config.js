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
          50:  '#F9FAFB',   // Page background
          100: '#F3F4F6',   // Subtle bg
          200: '#E5E7EB',   // Borders
          300: '#D1D5DB',
        },
        txt: {
          primary:   '#111827',  // Headings
          secondary: '#6B7280',  // Body text
          tertiary:  '#9CA3AF',  // Muted
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
        'soft':     '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card':     '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 2px 8px -2px rgb(0 0 0 / 0.04)',
        'card-hover': '0 4px 16px -2px rgb(0 0 0 / 0.08), 0 2px 6px -2px rgb(0 0 0 / 0.04)',
        'elevated': '0 8px 30px -4px rgb(0 0 0 / 0.08), 0 4px 10px -4px rgb(0 0 0 / 0.04)',
        'glow':     '0 0 0 1px rgb(79 70 229 / 0.08), 0 4px 16px -2px rgb(79 70 229 / 0.12)',
        'nav':      '0 1px 3px 0 rgb(0 0 0 / 0.05)',
      },
      backgroundImage: {
        'subtle-grid': 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
        'hero-gradient': 'linear-gradient(135deg, #F9FAFB 0%, #EEF2FF 50%, #F9FAFB 100%)',
      },
      backgroundSize: {
        'grid-16': '16px 16px',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in':   'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%':   { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
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
