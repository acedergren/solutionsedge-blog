import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts,md,svx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Material Design 3 Dark Theme Colors
        'md-dark': {
          'surface': '#121212',
          'surface-variant': '#1e1e1e',
          'surface-container': '#1a1a1a',
          'surface-container-high': '#2a2a2a',
          'surface-container-highest': '#333333',
          'on-surface': '#e3e3e3',
          'on-surface-variant': '#c7c7c7',
          'primary': '#bb86fc',
          'on-primary': '#000000',
          'primary-container': '#4a0080',
          'on-primary-container': '#eaddff',
          'secondary': '#03dac6',
          'on-secondary': '#000000',
          'secondary-container': '#005047',
          'on-secondary-container': '#70f3dd',
          'tertiary': '#86efac',
          'error': '#cf6679',
          'outline': '#8b8b8b',
          'outline-variant': '#404040',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'display': ['Outfit', 'system-ui', 'sans-serif'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.md-dark.on-surface'),
            '--tw-prose-headings': theme('colors.md-dark.on-surface'),
            '--tw-prose-lead': theme('colors.md-dark.on-surface-variant'),
            '--tw-prose-links': theme('colors.md-dark.primary'),
            '--tw-prose-bold': theme('colors.md-dark.on-surface'),
            '--tw-prose-counters': theme('colors.md-dark.on-surface-variant'),
            '--tw-prose-bullets': theme('colors.md-dark.outline'),
            '--tw-prose-hr': theme('colors.md-dark.outline-variant'),
            '--tw-prose-quotes': theme('colors.md-dark.on-surface'),
            '--tw-prose-quote-borders': theme('colors.md-dark.primary'),
            '--tw-prose-captions': theme('colors.md-dark.on-surface-variant'),
            '--tw-prose-kbd': theme('colors.md-dark.on-surface'),
            '--tw-prose-kbd-shadows': theme('colors.md-dark.primary'),
            '--tw-prose-code': theme('colors.md-dark.on-surface'),
            '--tw-prose-pre-code': theme('colors.md-dark.on-surface'),
            '--tw-prose-pre-bg': theme('colors.md-dark.surface-container'),
            '--tw-prose-th-borders': theme('colors.md-dark.outline-variant'),
            '--tw-prose-td-borders': theme('colors.md-dark.outline-variant'),
          },
        },
      }),
    },
  },
  plugins: [typography],
}