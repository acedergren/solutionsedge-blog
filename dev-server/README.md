# Local EdgeWorkers Development Server

This development server simulates the Akamai EdgeWorkers environment locally, allowing you to develop and test EdgeWorker authentication logic before deployment.

## Quick Start

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your GitHub OAuth credentials
   ```

2. **Start development servers:**
   ```bash
   # From project root - runs both SvelteKit and EdgeWorker dev server
   npm run dev:edge
   
   # Or manually:
   npm run dev              # SvelteKit on :5173
   npm run dev:server       # EdgeWorker dev server on :3001
   ```

3. **Test authentication:**
   - Visit: http://localhost:3001/editor
   - Should redirect to GitHub OAuth
   - After auth, serves the editor interface

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   SvelteKit     │    │   Dev Server     │    │   GitHub API    │
│  localhost:5173 │    │  localhost:3001  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ Static content        │ Authentication        │ OAuth flow
         │◀──────────────────────│ & API requests        │◀──────────▶
         │                       │                       │
         │                       │ Proxies static        │
         │                       │ content to SvelteKit  │
         │                       │◀─────────────────────▶│
```

## Features

### 🔐 **Complete OAuth Simulation**
- GitHub OAuth 2.0 flow
- Session management with EdgeKV mock
- Repository permission validation
- Secure cookie handling

### 🛠️ **Development Tools**
- Hot reload on EdgeWorker changes
- Real-time debugging and logging
- EdgeKV data inspection
- Request/response monitoring

### 🧪 **Testing Framework**
- Automated test suite
- OAuth flow validation
- Session management tests
- API endpoint verification

## Development Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /dev/status` | Server status and configuration |
| `GET /dev/edgekv` | EdgeKV storage inspection |
| `POST /dev/edgekv/clear` | Clear all EdgeKV data |
| `GET /dev/reload` | Reload EdgeWorker code |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | ✅ |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret | ✅ |
| `PORT` | Dev server port | ❌ (default: 3001) |
| `STATIC_SITE_URL` | SvelteKit dev server URL | ❌ (default: localhost:5173) |
| `ALLOWED_EMAIL` | Authorized email address | ❌ (default: alex@solutionsedge.io) |

## Testing

```bash
# Run automated tests
npm run test:edge

# Test specific functionality
cd dev-server
node test-auth-flow.js
```

## Debugging

### Enable Debug Mode
```bash
# In .env
DEV_MODE=true
```

### View EdgeKV Data
```bash
curl http://localhost:3001/dev/edgekv
```

### Monitor Requests
All requests are logged with timestamps and details.

### Test OAuth Flow
1. Clear EdgeKV: `curl -X POST http://localhost:3001/dev/edgekv/clear`
2. Visit editor: http://localhost:3001/editor
3. Check status: http://localhost:3001/dev/status

## GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App:
   - **Application name**: "Solutions Edge Editor (Dev)"
   - **Homepage URL**: `http://localhost:3001`
   - **Authorization callback URL**: `http://localhost:3001/auth/github/callback`
3. Copy Client ID and Secret to `.env`

## Common Issues

### 🚨 **"GitHub OAuth not configured"**
- Copy `.env.example` to `.env`
- Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

### 🚨 **"Static site unavailable"**
- Make sure SvelteKit dev server is running: `npm run dev`
- Check `STATIC_SITE_URL` in `.env`

### 🚨 **"EdgeWorker execution failed"**
- Rebuild EdgeWorker: `npm run build:edge`
- Check TypeScript compilation errors

### 🚨 **OAuth callback errors**
- Verify callback URL matches GitHub OAuth app exactly
- Check for HTTPS vs HTTP mismatch

## Next Steps

1. **Setup GitHub OAuth** (5 minutes)
2. **Test locally** with `npm run dev:edge`
3. **Build production EdgeWorker** with `npm run build:edge`
4. **Deploy to Akamai** using Akamai CLI

## Production Deployment

When ready for production:

```bash
# Build EdgeWorker
npm run build:edge

# Deploy to Akamai (requires Akamai CLI)
cd edgeworkers/auth-gateway
npm run deploy:staging  # or deploy:prod
```