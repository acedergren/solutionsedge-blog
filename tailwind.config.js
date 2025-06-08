/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Material Design 3 Color System
        'md': {
          // Primary - Teal from logo
          'primary': '#00838f',
          'on-primary': '#ffffff',
          'primary-container': '#00bcd4',
          'on-primary-container': '#002f33',
          
          // Secondary
          'secondary': '#546e7a',
          'on-secondary': '#ffffff',
          'secondary-container': '#cfd8dc',
          'on-secondary-container': '#1a282e',
          
          // Tertiary
          'tertiary': '#5e35b1',
          'on-tertiary': '#ffffff',
          'tertiary-container': '#ede7f6',
          'on-tertiary-container': '#1a0033',
          
          // Error
          'error': '#ba1a1a',
          'on-error': '#ffffff',
          'error-container': '#ffdad6',
          'on-error-container': '#410002',
          
          // Surface - Dark theme
          'surface': '#121212',
          'surface-dim': '#0d0d0d',
          'surface-bright': '#3a3a3a',
          'surface-variant': '#424242',
          'on-surface': '#e1e1e1',
          'on-surface-variant': '#c4c4c4',
          'surface-container-lowest': '#0a0a0a',
          'surface-container-low': '#1a1a1a',
          'surface-container': '#1e1e1e',
          'surface-container-high': '#282828',
          'surface-container-highest': '#333333',
          
          // Outline
          'outline': '#8e8e8e',
          'outline-variant': '#444444',
          
          // Other
          'shadow': '#000000',
          'scrim': '#000000',
          'inverse-surface': '#e3e3e3',
          'inverse-on-surface': '#303030',
          'inverse-primary': '#006874',
        }
      },
      fontFamily: {
        'sans': ['Roboto', 'system-ui', 'sans-serif'],
        'display': ['Roboto', 'system-ui', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace'],
      },
      borderRadius: {
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '28px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
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
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}