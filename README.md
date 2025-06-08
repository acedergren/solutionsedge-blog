# The Solutions Edge Blog

A modern blog built with SvelteKit, Material Design 3, and Tailwind CSS. Optimized for static site generation and deployment to Linode Object Storage.

## Features

- 🎨 Material Design 3 theming
- 🚀 Static Site Generation (SSG) with SvelteKit
- 💨 Tailwind CSS for utility-first styling
- 📱 Fully responsive design
- 🌙 Dark theme by default
- ⚡ Optimized for performance
- 🔍 SEO-friendly
- 📦 Ready for Linode Object Storage deployment

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the site.

### Building for Production

```bash
npm run build
```

The static site will be generated in the `build` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment to Linode Object Storage

1. Build the static site:
   ```bash
   npm run build
   ```

2. Install Linode CLI:
   ```bash
   pip install linode-cli
   ```

3. Configure Linode CLI with your Object Storage credentials

4. Create a bucket:
   ```bash
   linode-cli obj mb s3://your-bucket-name
   ```

5. Upload the build directory:
   ```bash
   linode-cli obj sync ./build s3://your-bucket-name --recursive --acl public-read
   ```

6. Configure the bucket for static website hosting

## Project Structure

```
solutionsedge-blog/
├── src/
│   ├── routes/          # SvelteKit routes
│   ├── lib/             # Shared components and utilities
│   │   ├── components/  # Reusable components
│   │   └── styles/      # Style utilities
│   ├── app.html         # HTML template
│   ├── app.css          # Global styles
│   └── app.d.ts         # TypeScript declarations
├── static/              # Static assets
├── build/               # Production build (generated)
└── svelte.config.js     # SvelteKit configuration
```

## Material Design 3 Components

The project includes custom Material Design 3 components:

- **Buttons**: Filled, Tonal, Outlined, Text, and Elevated variants
- **Cards**: Standard, Elevated, and Outlined variants
- **Chips**: For tags and categories
- **Navigation**: Top app bar with mobile drawer
- **Typography**: Complete MD3 type scale
- **Surface Containers**: Multiple elevation levels

## Customization

### Colors

Edit the color palette in `tailwind.config.js` to match your brand:

```js
colors: {
  'md': {
    'primary': '#00838f',
    'secondary': '#546e7a',
    // ... other colors
  }
}
```

### Typography

The project uses Roboto font family by default. Update in `app.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=YourFont:wght@300;400;500;700&display=swap');
```

## License

MIT