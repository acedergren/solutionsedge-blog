# Solutions Edge - EdgeWorkers Development

This directory contains EdgeWorkers functions for extending The Solutions Edge platform with edge computing capabilities.

## Structure

```
edgeworkers/
├── auth-gateway/          # GitHub OAuth authentication
│   ├── main.ts           # Main EdgeWorker logic
│   ├── bundle.json       # EdgeWorker manifest
│   ├── package.json      # TypeScript dependencies
│   └── tsconfig.json     # TypeScript configuration
├── search-service/       # Future: Search & autocomplete
├── content-api/          # Future: Content management API
└── analytics/           # Future: Edge analytics
```

## Development Workflow

1. **Local Development**: Use TypeScript for development with type checking
2. **Build**: Compile TypeScript to JavaScript bundle
3. **Deploy**: Upload to Akamai EdgeWorkers platform
4. **Test**: Validate functionality in staging environment

## Prerequisites

- Akamai EdgeWorkers entitlement
- GitHub OAuth application configured
- EdgeKV namespace provisioned
- Akamai CLI installed: `npm install -g @akamai/cli`
- EdgeWorkers CLI: `akamai install edgeworkers`

## Getting Started

```bash
cd edgeworkers/auth-gateway
npm install
npm run build
akamai edgeworkers upload-bundle --bundle ./dist/bundle.tar.gz
```