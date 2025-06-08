/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        // Medium-inspired color palette with Material Design 3 structure
        'md': {
          // Primary - Medium green accent
          'primary': '#1a8917',
          'on-primary': '#ffffff',
          'primary-container': '#e8f5e8',
          'on-primary-container': '#0d470c',
          
          // Secondary - Neutral grays
          'secondary': '#757575',
          'on-secondary': '#ffffff',
          'secondary-container': '#f5f5f5',
          'on-secondary-container': '#292929',
          
          // Tertiary - Blue accent
          'tertiary': '#1976d2',
          'on-tertiary': '#ffffff',
          'tertiary-container': '#e3f2fd',
          'on-tertiary-container': '#0d47a1',
          
          // Error
          'error': '#d32f2f',
          'on-error': '#ffffff',
          'error-container': '#ffebee',
          'on-error-container': '#b71c1c',
          
          // Surface - Clean whites and grays
          'surface': '#ffffff',
          'surface-dim': '#fafafa',
          'surface-bright': '#ffffff',
          'surface-variant': '#f5f5f5',
          'on-surface': '#191919',
          'on-surface-variant': '#757575',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#fafafa',
          'surface-container': '#f5f5f5',
          'surface-container-high': '#eeeeee',
          'surface-container-highest': '#e0e0e0',
          
          // Dark mode surfaces
          'dark-surface': '#191919',
          'dark-surface-dim': '#000000',
          'dark-surface-bright': '#2c2c2c',
          'dark-surface-variant': '#242424',
          'dark-on-surface': '#ffffff',
          'dark-on-surface-variant': '#b3b3b3',
          
          // Outline
          'outline': '#e0e0e0',
          'outline-variant': '#f0f0f0',
          'dark-outline': '#3a3a3a',
          'dark-outline-variant': '#2a2a2a',
          
          // Other
          'shadow': '#000000',
          'scrim': '#000000',
          'inverse-surface': '#191919',
          'inverse-on-surface': '#ffffff',
          'inverse-primary': '#4caf50',
        }
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
        'serif': ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        'mono': ['Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
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