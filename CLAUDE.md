# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is The Solutions Edge blog - a modern technical blog built with SvelteKit, Material Design 3, and Tailwind CSS. The blog focuses on cloud computing, edge technologies, and solutions engineering best practices.

## Tech Stack

- **Framework**: SvelteKit with Static Site Generation (SSG)
- **Styling**: Tailwind CSS + Material Design 3 components
- **Language**: TypeScript
- **Deployment**: Linode Object Storage (S3-compatible)
- **Build Tool**: Vite

## Common Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Type checking with watch mode
npm run check:watch
```

## Project Structure

```
solutionsedge-blog/
├── src/
│   ├── routes/          # SvelteKit routes and pages
│   ├── lib/             # Shared code
│   │   ├── components/  # Reusable Svelte components
│   │   └── styles/      # Style utilities
│   ├── app.html         # HTML template
│   ├── app.css          # Global styles and MD3 components
│   └── app.d.ts         # TypeScript declarations
├── static/              # Static assets (favicon, images)
├── build/               # Production build output (gitignored)
├── .svelte-kit/         # SvelteKit generated files (gitignored)
├── svelte.config.js     # SvelteKit configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
├── postcss.config.js    # PostCSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Material Design 3 Components

The app.css file contains custom Material Design 3 components:

- **Buttons**: `.md-button-filled`, `.md-button-tonal`, `.md-button-outlined`, `.md-button-text`, `.md-button-elevated`
- **Cards**: `.md-card`, `.md-card-elevated`, `.md-card-outlined`
- **Chips**: `.md-chip`, `.md-chip-elevated`
- **Typography**: `.md-display-*`, `.md-headline-*`, `.md-title-*`, `.md-body-*`, `.md-label-*`
- **Surface Containers**: Various elevation levels for depth
- **Icon Buttons**: For compact interactive elements

## Color System

The color palette is defined in `tailwind.config.js` following Material Design 3 guidelines:
- Primary: Teal (#00838f)
- Secondary: Blue Grey (#546e7a)
- Tertiary: Deep Purple (#5e35b1)
- Error, Surface, and other MD3 role-based colors

## Deployment to Linode Object Storage

1. Build the static site:
   ```bash
   npm run build
   ```

2. The build output in `/build` can be uploaded to Linode Object Storage using:
   - Linode CLI: `linode-cli obj sync ./build s3://bucket-name --recursive --acl public-read`
   - s3cmd: `s3cmd sync ./build/ s3://bucket-name --acl-public`
   - Cyberduck or other S3-compatible tools

3. Configure the bucket for static website hosting in Linode console

## Development Guidelines

1. **Component Structure**: Create reusable components in `src/lib/components/`
2. **Styling**: Use Tailwind utilities and MD3 component classes
3. **TypeScript**: Maintain type safety throughout the codebase
4. **Performance**: Leverage SvelteKit's SSG for optimal performance
5. **Accessibility**: Follow Material Design accessibility guidelines