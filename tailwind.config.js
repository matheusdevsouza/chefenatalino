module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'vermelho-vibrante': '#dc2626',
        'vermelho-hover': '#b91c1c',
        'vermelho-escuro': '#991b1b',
        'vermelho-claro': '#fee2e2',
        'vermelho-clarissimo': '#fef2f2',
        'dark-bg': {
          primary: '#1a1a1a',
          secondary: '#2e2e2e',
          tertiary: '#3a3a3a',
        },
        'dark-text': {
          primary: '#f5f5f5',
          secondary: '#d4d4d4',
          tertiary: '#a3a3a3',
        },
        'dark-gray': {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#525252',
          600: '#404040',
          700: '#3a3a3a',
          800: '#2e2e2e',
          900: '#1a1a1a',
        },
        'dark-red': {
          light: '#7f1d1d',
          DEFAULT: '#991b1b',
          dark: '#7f1d1d',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        serif: ['var(--font-serif)', 'serif'],
        body: ['var(--font-sans)', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'soft': '0 10px 40px -10px rgba(0,0,0,0.08)',
        'glow': '0 0 20px rgba(220, 38, 38, 0.3)',
      },
    },
  },
  plugins: [],
}
