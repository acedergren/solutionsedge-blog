# EdgeWorkers Development Guide

## Development Stages

### Stage 1: Foundation Setup ✅
- [x] Project structure created
- [x] TypeScript configuration
- [x] GitHub OAuth EdgeWorker skeleton
- [ ] GitHub OAuth App setup
- [ ] EdgeKV namespace provisioning

### Stage 2: Authentication Implementation
- [ ] Complete EdgeWorker implementation
- [ ] Local testing with Akamai CLI
- [ ] EdgeKV integration testing
- [ ] OAuth flow validation

### Stage 3: Editor Frontend
- [ ] WYSIWYG editor implementation
- [ ] Editor CSS with Material Design 3
- [ ] API integration
- [ ] Content management UI

### Stage 4: Integration & Testing
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Security review
- [ ] Staging deployment

### Stage 5: Production Deployment
- [ ] Production EdgeWorker deployment
- [ ] DNS/Property Manager configuration
- [ ] Monitoring setup
- [ ] Documentation

## Quick Setup Commands

### Prerequisites
```bash
# Install Akamai CLI
npm install -g @akamai/cli

# Install EdgeWorkers CLI
akamai install edgeworkers

# Verify installation
akamai edgeworkers --version
```

### Development Workflow
```bash
# Navigate to auth gateway
cd edgeworkers/auth-gateway

# Install dependencies
npm install

# Build TypeScript
npm run build

# Create bundle
npm run bundle

# Deploy to staging
npm run deploy:staging
```

### EdgeKV Setup
```bash
# Create namespace
akamai edgekv create namespace solutionsedge

# Create group
akamai edgekv create group auth --namespace solutionsedge

# Test EdgeKV
akamai edgekv write test "hello world" --namespace solutionsedge --group auth
akamai edgekv read test --namespace solutionsedge --group auth
```

## Environment Variables

Set these in Akamai Property Manager:

| Variable | Description | Example |
|----------|-------------|---------|
| `PMUSER_GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | `abc123...` |
| `PMUSER_GITHUB_CLIENT_SECRET` | GitHub OAuth App Secret | `def456...` |

## GitHub OAuth App Configuration

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: "Solutions Edge Editor"
   - **Homepage URL**: `https://www.solutionsedge.io`
   - **Authorization callback URL**: `https://www.solutionsedge.io/auth/github/callback`
4. Save and note the Client ID and Client Secret

## Testing

### Local Testing
```bash
# Lint code
npm run lint

# Run tests
npm run test

# Type check
npx tsc --noEmit
```

### EdgeWorker Testing
```bash
# Upload bundle
akamai edgeworkers upload-bundle --bundle ./dist/bundle.tar.gz --edgeworker-id 12345

# Activate on staging
akamai edgeworkers activate --edgeworker-id 12345 --network staging

# Check logs
akamai edgeworkers logs --edgeworker-id 12345
```

## Security Considerations

1. **Secrets Management**: Never commit secrets to git
2. **HTTPS Only**: All authentication flows use HTTPS
3. **CSRF Protection**: State parameter validates OAuth requests
4. **Session Security**: HttpOnly, Secure, SameSite cookies
5. **Token Scope**: Minimal GitHub permissions (user:email, repo)
6. **Access Control**: Validate email domain and repo permissions

## Troubleshooting

### Common Issues

1. **EdgeKV Permission Denied**
   - Ensure namespace and group exist
   - Check EdgeKV entitlements

2. **GitHub OAuth Errors**
   - Verify callback URL matches exactly
   - Check client ID/secret configuration

3. **Bundle Upload Fails**
   - Verify bundle.json format
   - Check file size limits (max 1MB)

4. **TypeScript Errors**
   - Install `@types/akamai-edgeworkers`
   - Check EdgeWorkers API compatibility

### Debug Commands
```bash
# Check bundle contents
tar -tzf dist/bundle.tar.gz

# Validate bundle.json
cat bundle.json | jq .

# Test EdgeKV connectivity
akamai edgekv read test --namespace solutionsedge --group auth
```