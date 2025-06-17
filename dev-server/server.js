#!/usr/bin/env node

/**
 * Local Development Server for EdgeWorkers
 * 
 * This server simulates the Akamai EdgeWorkers environment locally,
 * allowing you to develop and test EdgeWorker logic before deployment.
 */

import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { loadEdgeWorker, executeEdgeWorker } from './edgeworker-runtime.js';
import { mockEdgeKV } from './mock-edgekv.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const envPath = join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || 'localhost';
const STATIC_SITE_URL = process.env.STATIC_SITE_URL || 'http://localhost:5173';

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.text());
app.use(express.raw());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Load EdgeWorker
let edgeworkerModule = null;

async function loadAuthGateway() {
  try {
    const edgeworkerPath = join(__dirname, '../edgeworkers/auth-gateway/src/main.ts');
    
    // Check if TypeScript file exists, compile it first
    if (!fs.existsSync(edgeworkerPath.replace('.ts', '.js'))) {
      console.log('[DevServer] Compiling EdgeWorker TypeScript...');
      const { execSync } = await import('child_process');
      execSync('npm run build', { 
        cwd: join(__dirname, '../edgeworkers/auth-gateway'),
        stdio: 'inherit'
      });
    }

    edgeworkerModule = await loadEdgeWorker(edgeworkerPath.replace('.ts', '.js'));
    console.log('[DevServer] ✅ EdgeWorker loaded successfully');
  } catch (error) {
    console.error('[DevServer] ❌ Failed to load EdgeWorker:', error.message);
    console.log('[DevServer] Running without EdgeWorker...');
  }
}

// Development endpoints
app.get('/dev/status', (req, res) => {
  res.json({
    status: 'running',
    edgeworker: edgeworkerModule ? 'loaded' : 'not loaded',
    environment: {
      port: PORT,
      host: HOST,
      staticSiteUrl: STATIC_SITE_URL,
      githubConfigured: !!(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET)
    },
    edgekv: mockEdgeKV.getStats()
  });
});

app.get('/dev/edgekv', (req, res) => {
  res.json(mockEdgeKV.getStats());
});

app.post('/dev/edgekv/clear', (req, res) => {
  mockEdgeKV.clear();
  res.json({ message: 'EdgeKV cleared' });
});

app.get('/dev/reload', async (req, res) => {
  console.log('[DevServer] Reloading EdgeWorker...');
  await loadAuthGateway();
  res.json({ message: 'EdgeWorker reloaded' });
});

// Main EdgeWorker middleware
app.use(async (req, res, next) => {
  if (!edgeworkerModule) {
    // Pass through to static site if EdgeWorker not loaded
    return next();
  }

  try {
    const edgeworkerResponse = await executeEdgeWorker(edgeworkerModule, req);
    
    if (edgeworkerResponse) {
      // EdgeWorker handled the request
      edgeworkerResponse.toExpressResponse(res);
    } else {
      // Let request pass through to static site
      next();
    }
  } catch (error) {
    console.error('[DevServer] EdgeWorker execution error:', error);
    res.status(500).json({ 
      error: 'EdgeWorker execution failed',
      message: error.message 
    });
  }
});

// Proxy to static site (SvelteKit dev server)
app.use('/', createProxyMiddleware({
  target: STATIC_SITE_URL,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[DevServer] Proxy error:', err.message);
      res.status(503).json({ 
        error: 'Static site unavailable',
        message: 'Make sure your SvelteKit dev server is running on ' + STATIC_SITE_URL 
      });
    }
  }
}));

// Error handler
app.use((error, req, res, next) => {
  console.error('[DevServer] Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Start server
async function startServer() {
  console.log('🚀 Starting Solutions Edge Development Server...\n');
  
  // Check environment
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    console.warn('⚠️  GitHub OAuth not configured. Copy .env.example to .env and set your credentials.\n');
  }

  // Load EdgeWorker
  await loadAuthGateway();

  // Start listening
  app.listen(PORT, HOST, () => {
    console.log(`\n🎉 Development server running!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📱 Local:            http://${HOST}:${PORT}`);
    console.log(`🌍 Network:          http://localhost:${PORT}`);
    console.log(`🔧 Static Site:      ${STATIC_SITE_URL}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🛠️  Development endpoints:`);
    console.log(`   Status:           http://${HOST}:${PORT}/dev/status`);
    console.log(`   EdgeKV Debug:     http://${HOST}:${PORT}/dev/edgekv`);
    console.log(`   Reload EdgeWorker: http://${HOST}:${PORT}/dev/reload`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 To test authentication:`);
    console.log(`   1. Make sure SvelteKit is running: npm run dev`);
    console.log(`   2. Visit: http://${HOST}:${PORT}/editor`);
    console.log(`   3. Should redirect to GitHub OAuth`);
    console.log(`\n💡 Press Ctrl+C to stop\n`);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down development server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down development server...');
  process.exit(0);
});

// Start the server
startServer().catch(console.error);