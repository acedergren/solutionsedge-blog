/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Blue-centric color palette with Material Design 3 structure
        'md': {
          // Primary - Beautiful blue from Read Article button
          'primary': '#3b82f6', // blue-500
          'on-primary': '#ffffff',
          'primary-container': '#dbeafe', // blue-100
          'on-primary-container': '#1e3a8a', // blue-800
          
          // Secondary - Cyan complement
          'secondary': '#06b6d4', // cyan-500
          'on-secondary': '#ffffff',
          'secondary-container': '#cffafe', // cyan-100
          'on-secondary-container': '#164e63', // cyan-800
          
          // Tertiary - Deeper blue accent
          'tertiary': '#1d4ed8', // blue-700
          'on-tertiary': '#ffffff',
          'tertiary-container': '#dbeafe', // blue-100
          'on-tertiary-container': '#1e3a8a', // blue-800
          
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
          'dark-surface-container-lowest': '#0a0a0a',
          'dark-surface-container-low': '#1a1a1a',
          'dark-surface-container': '#242424',
          'dark-surface-container-high': '#2e2e2e',
          'dark-surface-container-highest': '#383838',
          
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
        'sans': ['Inter var', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'serif': ['Source Serif 4', 'Georgia', 'Times New Roman', 'serif'],
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        'display': ['Inter var', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
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
  plugins: [
    function({ addComponents, theme }) {
      addComponents({
        // MD3 Typography Classes
        '.md-display-large': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-display-large-size)',
          'line-height': 'var(--md-display-large-line)',
          'letter-spacing': 'var(--md-display-large-tracking)',
          'font-weight': 'var(--md-display-large-weight)',
        },
        '.md-display-medium': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-display-medium-size)',
          'line-height': 'var(--md-display-medium-line)',
          'letter-spacing': 'var(--md-display-medium-tracking)',
          'font-weight': 'var(--md-display-medium-weight)',
        },
        '.md-display-small': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-display-small-size)',
          'line-height': 'var(--md-display-small-line)',
          'letter-spacing': 'var(--md-display-small-tracking)',
          'font-weight': 'var(--md-display-small-weight)',
        },
        '.md-headline-large': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-headline-large-size)',
          'line-height': 'var(--md-headline-large-line)',
          'letter-spacing': 'var(--md-headline-large-tracking)',
          'font-weight': 'var(--md-headline-large-weight)',
        },
        '.md-headline-medium': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-headline-medium-size)',
          'line-height': 'var(--md-headline-medium-line)',
          'letter-spacing': 'var(--md-headline-medium-tracking)',
          'font-weight': 'var(--md-headline-medium-weight)',
        },
        '.md-headline-small': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-headline-small-size)',
          'line-height': 'var(--md-headline-small-line)',
          'letter-spacing': 'var(--md-headline-small-tracking)',
          'font-weight': 'var(--md-headline-small-weight)',
        },
        '.md-title-large': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-title-large-size)',
          'line-height': 'var(--md-title-large-line)',
          'letter-spacing': 'var(--md-title-large-tracking)',
          'font-weight': 'var(--md-title-large-weight)',
        },
        '.md-title-medium': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-title-medium-size)',
          'line-height': 'var(--md-title-medium-line)',
          'letter-spacing': 'var(--md-title-medium-tracking)',
          'font-weight': 'var(--md-title-medium-weight)',
        },
        '.md-title-small': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-title-small-size)',
          'line-height': 'var(--md-title-small-line)',
          'letter-spacing': 'var(--md-title-small-tracking)',
          'font-weight': 'var(--md-title-small-weight)',
        },
        '.md-body-large': {
          'font-family': 'var(--md-font-serif)',
          'font-size': 'var(--md-body-large-size)',
          'line-height': 'var(--md-body-large-line)',
          'letter-spacing': 'var(--md-body-large-tracking)',
          'font-weight': 'var(--md-body-large-weight)',
        },
        '.md-body-medium': {
          'font-family': 'var(--md-font-serif)',
          'font-size': 'var(--md-body-medium-size)',
          'line-height': 'var(--md-body-medium-line)',
          'letter-spacing': 'var(--md-body-medium-tracking)',
          'font-weight': 'var(--md-body-medium-weight)',
        },
        '.md-body-small': {
          'font-family': 'var(--md-font-serif)',
          'font-size': 'var(--md-body-small-size)',
          'line-height': 'var(--md-body-small-line)',
          'letter-spacing': 'var(--md-body-small-tracking)',
          'font-weight': 'var(--md-body-small-weight)',
        },
        '.md-label-large': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-label-large-size)',
          'line-height': 'var(--md-label-large-line)',
          'letter-spacing': 'var(--md-label-large-tracking)',
          'font-weight': 'var(--md-label-large-weight)',
        },
        '.md-label-medium': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-label-medium-size)',
          'line-height': 'var(--md-label-medium-line)',
          'letter-spacing': 'var(--md-label-medium-tracking)',
          'font-weight': 'var(--md-label-medium-weight)',
        },
        '.md-label-small': {
          'font-family': 'var(--md-font-sans)',
          'font-size': 'var(--md-label-small-size)',
          'line-height': 'var(--md-label-small-line)',
          'letter-spacing': 'var(--md-label-small-tracking)',
          'font-weight': 'var(--md-label-small-weight)',
        },
      })
    }
  ],
}