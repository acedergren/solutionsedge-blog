# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is The Solutions Edge blog - a technical blog focused on solutions engineering, cloud technologies, and cybersecurity. The main blog is a weekly chronicle called "Field Notes" that details my life as an SE. The repository contains:
- Main SvelteKit-based blog application (root directory)
- API Security Workshop materials in `/labs/api-workshop/`
- Cloud infrastructure configuration in `/linode/`

## Common Development Commands

### SvelteKit Development
```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Deploy to Linode
npm run deploy
```

### Tailwind CSS Development
The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

## High-Level Architecture

### Content Organization
- Blog content is in `/src/content/` with Markdown files
- Articles are categorized in subdirectories (e.g., `articles/`, `cloud-computing/`)
- Static assets go in `/static/images/`
- Components are in `/src/lib/components/`
- Routes are in `/src/routes/`

### Key Configuration Files
- `svelte.config.js` - SvelteKit configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `vite.config.ts` - Vite bundler configuration
- `tsconfig.json` - TypeScript configuration
- `package.json` - Project dependencies and scripts

### Technology Stack
- **Framework**: SvelteKit
- **Styling**: Tailwind CSS with PostCSS
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: npm

### Deployment Infrastructure
- Hosted on Linode infrastructure
- Uses Linode Object Store for storage
- Distributed via Akamai CDN
- Deployment script in `/scripts/deploy-linode.sh`
- Cloud-init configuration in `/linode/cloud-config.yml`

### Development Environment
- Node.js 18+ recommended
- TypeScript support built-in
- Hot Module Replacement (HMR) for rapid development
- PostCSS for CSS processing