/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#dc2626',
          hover: '#b91c1c',
          light: '#ef4444',
        },
        secondary: {
          DEFAULT: '#ef4444',
        },
        success: {
          DEFAULT: '#16a34a',
          light: '#22c55e',
          bg: '#dcfce7',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#ffc107',
          bg: '#fef3c7',
        },
        danger: {
          DEFAULT: '#dc2626',
          light: '#ef4444',
          bg: '#fee2e2',
        },
        text: {
          primary: '#1f2937',
          secondary: '#4b5563',
          muted: '#6b7280',
          onPrimary: '#ffffff',
        },
        border: {
          light: '#e5e7eb',
          DEFAULT: '#d1d5db',
        },
        bg: {
          DEFAULT: '#f9fafb',
          card: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        'lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
        'xl': '0 12px 32px rgba(0, 0, 0, 0.15)',
        '2xl': '0 20px 48px rgba(0, 0, 0, 0.2)',
        'colored': '0 8px 24px rgba(220, 38, 38, 0.25)',
        'colored-hover': '0 12px 32px rgba(220, 38, 38, 0.3)',
      },
      borderRadius: {
        'sm': '0.25rem',
        'DEFAULT': '0.375rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        'full': '9999px',
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
      },
      transitionDuration: {
        'base': '200ms',
        'smooth': '300ms',
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease',
        'fadeInUp': 'fadeInUp 0.3s ease',
        'slideUp': 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slideDown': 'slideDown 0.3s ease',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
