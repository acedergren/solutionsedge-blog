#!/usr/bin/env node

const tar = require('tar');
const fs = require('fs');
const path = require('path');

async function createBundle() {
  const distDir = path.join(__dirname, '..', 'dist');
  const bundlePath = path.join(distDir, 'bundle.tar.gz');

  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Files to include in the bundle
  const files = [
    'main.js',
    'bundle.json'
  ];

  // Copy bundle.json to dist
  fs.copyFileSync(
    path.join(__dirname, '..', 'bundle.json'),
    path.join(distDir, 'bundle.json')
  );

  // Create tar.gz bundle
  await tar.create(
    {
      gzip: true,
      file: bundlePath,
      cwd: distDir
    },
    files
  );

  console.log(`✅ Bundle created: ${bundlePath}`);
  console.log(`📦 Files included: ${files.join(', ')}`);
  
  // Show bundle size
  const stats = fs.statSync(bundlePath);
  console.log(`📊 Bundle size: ${(stats.size / 1024).toFixed(2)} KB`);
}

createBundle().catch(console.error);