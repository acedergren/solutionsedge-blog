# WYSIWYG Editor Integration

The WYSIWYG editor is located in the `wysiwyg-app/` directory.

## Architecture

```
solutionsedge-blog/
├── src/                    # Main blog application
├── wysiwyg-app/           # WYSIWYG editor application
│   ├── src/               # Editor source code
│   ├── Dockerfile         # Docker configuration
│   └── ...
└── ...
```

## Running Both Applications

### Development

```bash
# Terminal 1 - Main blog
npm run dev

# Terminal 2 - WYSIWYG editor
cd wysiwyg-app
npm run dev
```

### Production with Docker

```bash
# Build and run both
docker-compose -f docker-compose.full-stack.yml up -d
```

## Shared Resources

Both applications share:
- S3 bucket for content storage
- Markdown format with frontmatter
- Content structure and metadata

## Deployment Options

1. **Separate deployments**: Deploy editor and blog as separate services
2. **Monorepo deployment**: Deploy both from the same repository
3. **Integrated deployment**: Merge editor routes into main blog

