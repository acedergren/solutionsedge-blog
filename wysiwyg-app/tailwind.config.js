/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
  ],
  theme: {
    extend: {
      // Material Design 3 color system
      colors: {
        // CSS Variable based colors for dark mode support
        primary: 'var(--color-primary)',
        'primary-container': 'var(--color-primary-container)',
        'on-primary': 'var(--color-on-primary)',
        'on-primary-container': 'var(--color-on-primary-container)',
        
        secondary: 'var(--color-secondary)',
        'secondary-container': 'var(--color-secondary-container)',
        'on-secondary': 'var(--color-on-secondary)',
        'on-secondary-container': 'var(--color-on-secondary-container)',
        
        tertiary: 'var(--color-tertiary)',
        'tertiary-container': 'var(--color-tertiary-container)',
        'on-tertiary': 'var(--color-on-tertiary)',
        'on-tertiary-container': 'var(--color-on-tertiary-container)',
        
        surface: 'var(--color-surface)',
        'surface-variant': 'var(--color-surface-variant)',
        'on-surface': 'var(--color-on-surface)',
        'on-surface-variant': 'var(--color-on-surface-variant)',
        
        background: 'var(--color-background)',
        'on-background': 'var(--color-on-background)',
        
        outline: 'var(--color-outline)',
        'outline-variant': 'var(--color-outline-variant)',
        
        error: 'var(--color-error)',
        'on-error': 'var(--color-on-error)',
        'error-container': 'var(--color-error-container)',
        'on-error-container': 'var(--color-on-error-container)',
        
        // Legacy Primary colors for backward compatibility
        primary: {
          DEFAULT: '#00838f',
          50: '#e0f7fa',
          100: '#b2ebf2',
          200: '#80deea',
          300: '#4dd0e1',
          400: '#26c6da',
          500: '#00bcd4',
          600: '#00acc1',
          700: '#0097a7',
          800: '#00838f',
          900: '#006064',
        },
        // Legacy Secondary colors
        secondary: {
          DEFAULT: '#546e7a',
          50: '#eceff1',
          100: '#cfd8dc',
          200: '#b0bec5',
          300: '#90a4ae',
          400: '#78909c',
          500: '#607d8b',
          600: '#546e7a',
          700: '#455a64',
          800: '#37474f',
          900: '#263238',
        },
        // Legacy Surface colors for components still using them
        'surface-dim': 'var(--color-surface-variant)',
        'surface-bright': 'var(--color-surface)',
        'surface-container-lowest': 'var(--color-surface)',
        'surface-container-low': 'var(--color-surface-variant)',
        'surface-container': 'var(--color-surface-variant)',
        'surface-container-high': 'var(--color-surface-variant)',
        'surface-container-highest': 'var(--color-surface-variant)',
        
        // Success colors
        success: {
          DEFAULT: '#4caf50',
          50: '#e8f5e9',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50',
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
        },
      },
      // Typography scale
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'Courier New', 'monospace'],
      },
      fontSize: {
        // Display
        'display-large': ['57px', { lineHeight: '64px', letterSpacing: '-0.25px' }],
        'display-medium': ['45px', { lineHeight: '52px', letterSpacing: '0' }],
        'display-small': ['36px', { lineHeight: '44px', letterSpacing: '0' }],
        // Headline
        'headline-large': ['32px', { lineHeight: '40px', letterSpacing: '0' }],
        'headline-medium': ['28px', { lineHeight: '36px', letterSpacing: '0' }],
        'headline-small': ['24px', { lineHeight: '32px', letterSpacing: '0' }],
        // Body
        'body-large': ['16px', { lineHeight: '24px', letterSpacing: '0.5px' }],
        'body-medium': ['14px', { lineHeight: '20px', letterSpacing: '0.25px' }],
        'body-small': ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
        // Label
        'label-large': ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
        'label-medium': ['12px', { lineHeight: '16px', letterSpacing: '0.5px' }],
        'label-small': ['11px', { lineHeight: '16px', letterSpacing: '0.5px' }],
      },
      // Spring animations
      animation: {
        'spring-bounce': 'spring-bounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring-scale': 'spring-scale 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spring-rotate': 'spring-rotate 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-up': 'slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-down': 'slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-out': 'fade-out 0.2s ease-in',
        'morph': 'morph 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'spring-bounce': {
          '0%': { transform: 'scale(1)' },
          '30%': { transform: 'scale(1.05)' },
          '60%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'spring-scale': {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'spring-rotate': {
          '0%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
          '100%': { transform: 'rotate(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'morph': {
          '0%': { borderRadius: '8px' },
          '50%': { borderRadius: '24px' },
          '100%': { borderRadius: '8px' },
        },
      },
      // Spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Border radius
      borderRadius: {
        'none': '0',
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '28px',
        '3xl': '32px',
      },
      // Box shadows (elevation)
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1': '0px 1px 2px rgba(0, 0, 0, 0.05)',
        'elevation-2': '0px 2px 4px rgba(0, 0, 0, 0.08)',
        'elevation-3': '0px 4px 8px rgba(0, 0, 0, 0.10)',
        'elevation-4': '0px 6px 12px rgba(0, 0, 0, 0.12)',
        'elevation-5': '0px 8px 16px rgba(0, 0, 0, 0.14)',
      },
      // Transitions
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'material-standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'material-decelerated': 'cubic-bezier(0, 0, 0.2, 1)',
        'material-accelerated': 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}