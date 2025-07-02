# Docker Setup for WYSIWYG Editor

This document explains how to run the WYSIWYG editor using Docker.

## Quick Start

### Development Mode

```bash
# Build and run with docker-compose
docker-compose -f docker-compose.dev.yml up --build

# Or run in background
docker-compose -f docker-compose.dev.yml up -d
```

Access the editor at: http://localhost:3011

### Production Mode

```bash
# Build and run
docker-compose up --build

# Or run in background
docker-compose up -d
```

## Docker Commands

### Build Images

```bash
# Build production image
docker build -t wysiwyg-editor:latest .

# Build development image
docker build -f Dockerfile.dev -t wysiwyg-editor:dev .
```

### Run Containers

```bash
# Run production container
docker run -d \
  --name wysiwyg-editor \
  -p 3011:3000 \
  --env-file .env \
  wysiwyg-editor:latest

# Run development container with volume mounts
docker run -d \
  --name wysiwyg-editor-dev \
  -p 3011:5173 \
  -v $(pwd)/src:/app/src:ro \
  -v $(pwd)/static:/app/static:ro \
  --env-file .env \
  wysiwyg-editor:dev
```

### Container Management

```bash
# View logs
docker logs wysiwyg-editor
docker-compose logs -f

# Stop containers
docker-compose down
docker stop wysiwyg-editor

# Remove containers and volumes
docker-compose down -v
docker rm wysiwyg-editor

# Enter container shell
docker exec -it wysiwyg-editor sh
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
# S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket
S3_ENDPOINT=https://your-endpoint.com
S3_FORCE_PATH_STYLE=true

# Application
PUBLIC_BASE_URL=http://localhost:3011
```

## Production Deployment

### With Nginx Reverse Proxy

1. Update `nginx.conf` with your domain
2. Add SSL certificates to `./ssl` directory
3. Run with production profile:

```bash
docker-compose --profile production up -d
```

### Health Checks

The container includes health checks:
- Endpoint: `http://localhost:3000`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

### Resource Limits

Default limits in docker-compose.yml:
- CPU: 1 core (max), 0.5 core (reserved)
- Memory: 512MB (max), 256MB (reserved)

Adjust these based on your needs.

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3011
lsof -i :3011

# Or change port in docker-compose.yml
ports:
  - "3012:3000"
```

### Permission Issues

```bash
# Fix ownership
docker exec wysiwyg-editor chown -R nodejs:nodejs /app
```

### Build Cache Issues

```bash
# Rebuild without cache
docker-compose build --no-cache
```

## Security Considerations

1. The production image runs as non-root user `nodejs`
2. Uses `dumb-init` for proper signal handling
3. Only production dependencies are installed
4. Sensitive files are excluded via `.dockerignore`

## Kubernetes Deployment

Example deployment manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: wysiwyg-editor
spec:
  replicas: 2
  selector:
    matchLabels:
      app: wysiwyg-editor
  template:
    metadata:
      labels:
        app: wysiwyg-editor
    spec:
      containers:
      - name: wysiwyg-editor
        image: wysiwyg-editor:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        envFrom:
        - secretRef:
            name: wysiwyg-secrets
        resources:
          limits:
            memory: "512Mi"
            cpu: "1000m"
          requests:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 10
```