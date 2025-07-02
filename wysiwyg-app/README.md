# WYSIWYG Blog Editor

This is the WYSIWYG blog editor component of the Solutions Edge blog system.

## Features

- Rich text editing with Quill.js
- Markdown conversion and preview
- S3 integration for Linode Object Storage
- Publish workflow with validation
- Scheduled publishing
- Content management dashboard
- RSS feed generation
- Docker support

## Quick Start

```bash
cd wysiwyg-app
npm install
npm run dev
```

The editor will be available at http://localhost:3011

## Configuration

1. Copy `.env.example` to `.env`
2. Add your S3 credentials
3. Run the development server

## Docker

```bash
# Development
docker-compose -f docker-compose.dev.yml up

# Production
docker-compose up -d
```

See DOCKER.md for more details.

## Integration with Main Blog

This editor is designed to work with the main Solutions Edge blog. To integrate:

1. The editor publishes markdown files to S3
2. The main blog reads from the same S3 bucket
3. Both share the same content structure

