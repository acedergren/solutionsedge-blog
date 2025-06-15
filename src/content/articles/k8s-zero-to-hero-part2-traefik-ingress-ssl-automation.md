---
id: 8
title: "Kubernetes Zero to Hero Part 2: Traefik Ingress with Automatic SSL and Advanced Observability"
author: "Alexander Cedergren"
date: "2024-04-05"
tags: ["Kubernetes", "Traefik", "SSL", "Let's Encrypt", "Ingress", "DevOps", "Automation", "Security"]
description: "Master Traefik ingress controller with automatic SSL certificates, advanced routing, and seamless monitoring integration. Build production-ready ingress that scales."
excerpt: "Transform your Kubernetes cluster with enterprise-grade ingress. Traefik + Let's Encrypt + monitoring integration = zero-touch SSL management that just works."
featured: true
---

# Kubernetes Zero to Hero Part 2: Traefik Ingress with Automatic SSL and Advanced Observability

*This is Part 2 of our Kubernetes Zero to Hero series. In [Part 1](/article/7.html), we built a rock-solid observability foundation with Prometheus and Grafana. Now we're adding intelligent ingress with automatic SSL.*

Traffic management in Kubernetes can make or break your production experience. Today, we're deploying Traefik—the cloud-native edge router that makes ingress simple, secure, and observable. By the end of this guide, you'll have automatic SSL certificates, intelligent routing, and full observability integration.

## What We're Building

Building on our monitoring foundation, we'll add:
- **Traefik** as our ingress controller with automatic service discovery
- **Let's Encrypt** integration for automatic SSL certificates
- **Advanced routing** with middleware, sticky sessions, and load balancing
- **Complete observability** with metrics, tracing, and dashboard integration
- **Production-ready security** with rate limiting and authentication

This isn't just ingress—it's intelligent traffic management.

## Prerequisites

- Completed [Part 1](/article/7.html) with Prometheus and Grafana running
- A domain name pointing to your cluster's external IP
- kubectl access to your cluster

## Step 1: Installing Traefik with Helm

Let's deploy Traefik with production-ready configuration:

```bash
# Add Traefik Helm repository
helm repo add traefik https://traefik.github.io/charts
helm repo update

# Create Traefik configuration
cat <<EOF > traefik-values.yaml
# Traefik configuration for production
deployment:
  replicas: 2

# Enable dashboard
ingressRoute:
  dashboard:
    enabled: true

# Service configuration
service:
  type: LoadBalancer
  annotations:
    service.beta.kubernetes.io/linode-loadbalancer-hostname: "traefik.yourdomain.com"

# Enable Prometheus metrics
metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
    addRoutersLabels: true

# Enable access logs
logs:
  access:
    enabled: true
    format: json

# Enable API and dashboard
api:
  dashboard: true
  insecure: false

# Entry points configuration
ports:
  web:
    port: 80
    redirectTo: websecure
  websecure:
    port: 443
    tls:
      enabled: true

# Certificate resolvers for Let's Encrypt
certificatesResolvers:
  letsencrypt:
    acme:
      email: your-email@example.com
      storage: /data/acme.json
      httpChallenge:
        entryPoint: web
      # Use staging for testing
      # caServer: https://acme-staging-v02.api.letsencrypt.org/directory

# Persistence for ACME certificates
persistence:
  enabled: true
  size: 128Mi
  storageClass: "linode-block-storage-retain"

# Resource limits
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi

# Additional arguments
additionalArguments:
  - "--serversTransport.insecureSkipVerify=true"
  - "--providers.kubernetescrd.allowCrossNamespace=true"
  - "--providers.kubernetesingress.allowEmptyServices=true"

# Enable Kubernetes CRD provider
providers:
  kubernetescrd:
    enabled: true
    allowCrossNamespace: true
  kubernetesingress:
    enabled: true
EOF

# Install Traefik
helm install traefik traefik/traefik \
  --namespace traefik \
  --create-namespace \
  --values traefik-values.yaml
```

## Step 2: Setting Up Traefik Dashboard with SSL

Create a secure dashboard with automatic SSL:

```yaml
# traefik-dashboard.yaml
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: traefik-dashboard
  namespace: traefik
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`traefik.yourdomain.com`)
      kind: Rule
      services:
        - name: api@internal
          kind: TraefikService
      middlewares:
        - name: auth
  tls:
    certResolver: letsencrypt
---
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: auth
  namespace: traefik
spec:
  basicAuth:
    secret: traefik-dashboard-auth
---
apiVersion: v1
kind: Secret
metadata:
  name: traefik-dashboard-auth
  namespace: traefik
type: Opaque
data:
  # Generate with: htpasswd -nb admin yourpassword | base64 -w 0
  users: YWRtaW46JGFwcjEkSDY1dnBkTU8kWmY2eTM0LldiQ28wUDVGMjBBNmYuMAo=
```

```bash
# Generate password hash
htpasswd -nb admin yourpassword | base64 -w 0

# Apply the configuration
kubectl apply -f traefik-dashboard.yaml
```

## Step 3: Integrating with Prometheus Monitoring

Add Traefik metrics to our monitoring stack:

```yaml
# traefik-servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: traefik
  namespace: monitoring
  labels:
    app: traefik
spec:
  namespaceSelector:
    matchNames:
    - traefik
  selector:
    matchLabels:
      app.kubernetes.io/name: traefik
  endpoints:
  - port: traefik
    interval: 30s
    path: /metrics
---
# PrometheusRule for Traefik alerts
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: traefik-rules
  namespace: monitoring
  labels:
    prometheus: kube-prometheus
    role: alert-rules
spec:
  groups:
  - name: traefik.rules
    rules:
    - alert: TraefikHighErrorRate
      expr: rate(traefik_service_request_duration_seconds_count{code=~"5.."}[5m]) > 0.1
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Traefik high error rate"
        description: "Traefik error rate is above 10% for service {{ $labels.service }}"
    
    - alert: TraefikHighLatency
      expr: histogram_quantile(0.95, rate(traefik_service_request_duration_seconds_bucket[5m])) > 1
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Traefik high latency"
        description: "Traefik 95th percentile latency is above 1s for service {{ $labels.service }}"
    
    - alert: TraefikCertificateExpiringSoon
      expr: traefik_tls_certs_not_after - time() < 7 * 24 * 3600
      for: 1h
      labels:
        severity: warning
      annotations:
        summary: "SSL certificate expiring soon"
        description: "Certificate for {{ $labels.cn }} expires in less than 7 days"
```

```bash
kubectl apply -f traefik-servicemonitor.yaml
```

## Step 4: Deploying Applications with Automatic SSL

Let's create a production-ready application with all the bells and whistles:

```yaml
# production-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: production-web-app
  namespace: default
  labels:
    app: production-web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: production-web-app
  template:
    metadata:
      labels:
        app: production-web-app
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9113"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: web-app
        image: nginx:1.21-alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: 64Mi
            cpu: 50m
          limits:
            memory: 128Mi
            cpu: 100m
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/conf.d
        livenessProbe:
          httpGet:
            path: /health
            port: 80
          initialDelaySeconds: 10
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
      - name: nginx-exporter
        image: nginx/nginx-prometheus-exporter:0.10.0
        args:
        - -nginx.scrape-uri=http://localhost/nginx_status
        ports:
        - containerPort: 9113
          name: metrics
        resources:
          requests:
            memory: 32Mi
            cpu: 25m
          limits:
            memory: 64Mi
            cpu: 50m
      volumes:
      - name: nginx-config
        configMap:
          name: nginx-config
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
  namespace: default
data:
  default.conf: |
    server {
        listen 80;
        server_name _;
        
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        location /ready {
            access_log off;
            return 200 "ready\n";
            add_header Content-Type text/plain;
        }
        
        location /nginx_status {
            stub_status on;
            access_log off;
            allow 127.0.0.1;
            deny all;
        }
        
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ =404;
        }
    }
---
apiVersion: v1
kind: Service
metadata:
  name: production-web-app
  namespace: default
  labels:
    app: production-web-app
spec:
  ports:
  - port: 80
    targetPort: 80
    name: http
  - port: 9113
    targetPort: 9113
    name: metrics
  selector:
    app: production-web-app
```

```bash
kubectl apply -f production-app.yaml
```

## Step 5: Advanced Traefik Configuration

Create sophisticated routing with middleware:

```yaml
# advanced-routing.yaml
# Rate limiting middleware
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: rate-limit
  namespace: default
spec:
  rateLimit:
    burst: 100
    average: 50
---
# Retry middleware
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: retry
  namespace: default
spec:
  retry:
    attempts: 3
---
# Circuit breaker middleware
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: circuit-breaker
  namespace: default
spec:
  circuitBreaker:
    expression: NetworkErrorRatio() > 0.3
---
# Compress responses
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: compress
  namespace: default
spec:
  compress: {}
---
# Add security headers
apiVersion: traefik.containo.us/v1alpha1
kind: Middleware
metadata:
  name: security-headers
  namespace: default
spec:
  headers:
    customRequestHeaders:
      X-Forwarded-Proto: "https"
    customResponseHeaders:
      X-Frame-Options: "DENY"
      X-Content-Type-Options: "nosniff"
      X-XSS-Protection: "1; mode=block"
      Strict-Transport-Security: "max-age=31536000; includeSubDomains; preload"
---
# Production ingress route with all middleware
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: production-app
  namespace: default
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`app.yourdomain.com`)
      kind: Rule
      services:
        - name: production-web-app
          port: 80
      middlewares:
        - name: rate-limit
        - name: retry
        - name: circuit-breaker
        - name: compress
        - name: security-headers
  tls:
    certResolver: letsencrypt
```

```bash
kubectl apply -f advanced-routing.yaml
```

## Step 6: Blue-Green Deployments with Traefik

Implement zero-downtime deployments:

```yaml
# blue-green-deployment.yaml
apiVersion: traefik.containo.us/v1alpha1
kind: TraefikService
metadata:
  name: blue-green-service
  namespace: default
spec:
  weighted:
    services:
    - name: production-web-app
      weight: 100
      port: 80
    - name: production-web-app-green
      weight: 0
      port: 80
---
apiVersion: traefik.containo.us/v1alpha1
kind: IngressRoute
metadata:
  name: blue-green-route
  namespace: default
spec:
  entryPoints:
    - websecure
  routes:
    - match: Host(`bg.yourdomain.com`)
      kind: Rule
      services:
        - name: blue-green-service
          kind: TraefikService
  tls:
    certResolver: letsencrypt
```

```bash
kubectl apply -f blue-green-deployment.yaml
```

## Step 7: Setting Up Grafana Dashboards for Traefik

Import the official Traefik dashboard in Grafana:

1. **Traefik Official Dashboard** (Dashboard ID: 4475)
2. **Traefik 2.0 Dashboard** (Dashboard ID: 11462)

Or create a custom dashboard with key metrics:

```json
{
  "dashboard": {
    "id": null,
    "title": "Traefik Production Metrics",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(traefik_service_requests_total[5m])",
            "legendFormat": "{{service}} - {{method}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(traefik_service_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(traefik_service_requests_total{code=~\"5..\"}[5m]) / rate(traefik_service_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

## Step 8: SSL Certificate Monitoring

Monitor certificate health:

```yaml
# cert-monitor.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: cert-monitor
  namespace: traefik
spec:
  schedule: "0 */6 * * *"  # Every 6 hours
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: cert-checker
            image: alpine:latest
            command:
            - /bin/sh
            - -c
            - |
              apk add --no-cache openssl curl
              
              # Check certificate expiration
              DOMAINS="app.yourdomain.com traefik.yourdomain.com"
              
              for domain in $DOMAINS; do
                EXPIRY=$(echo | openssl s_client -servername $domain -connect $domain:443 2>/dev/null | \
                         openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
                EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
                CURRENT_EPOCH=$(date +%s)
                DAYS_TO_EXPIRY=$(( ($EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))
                
                echo "Certificate for $domain expires in $DAYS_TO_EXPIRY days"
                
                if [ $DAYS_TO_EXPIRY -lt 30 ]; then
                  echo "WARNING: Certificate for $domain expires soon!"
                  # Send alert to monitoring system
                  curl -X POST http://prometheus-alertmanager.monitoring:9093/api/v1/alerts \
                    -H "Content-Type: application/json" \
                    -d "[{\"labels\":{\"alertname\":\"CertificateExpiringSoon\",\"domain\":\"$domain\",\"severity\":\"warning\"}}]"
                fi
              done
          restartPolicy: OnFailure
```

```bash
kubectl apply -f cert-monitor.yaml
```

## Step 9: Load Testing and Performance Validation

Validate your setup with load testing:

```bash
# Install k6 for load testing
kubectl create configmap k6-script --from-literal=script.js='
import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  stages: [
    { duration: "2m", target: 20 },
    { duration: "5m", target: 20 },
    { duration: "2m", target: 40 },
    { duration: "5m", target: 40 },
    { duration: "2m", target: 0 },
  ],
};

export default function() {
  let response = http.get("https://app.yourdomain.com");
  check(response, {
    "status is 200": (r) => r.status === 200,
    "response time < 500ms": (r) => r.timings.duration < 500,
  });
  sleep(1);
}
'

# Run load test
kubectl run k6 --image=loadimpact/k6:latest --rm -i --restart=Never -- run --vus 50 --duration 10m /scripts/script.js --mount configMap:k6-script:/scripts
```

## Production Best Practices

### 1. Resource Management
Always set appropriate limits:

```yaml
resources:
  requests:
    cpu: 100m
    memory: 128Mi
  limits:
    cpu: 500m
    memory: 256Mi
```

### 2. High Availability
Run multiple Traefik replicas:

```yaml
deployment:
  replicas: 3
  
# Use pod anti-affinity
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/name
            operator: In
            values:
            - traefik
        topologyKey: kubernetes.io/hostname
```

### 3. Security Hardening
- Use network policies to restrict access
- Enable pod security policies
- Regularly rotate certificates
- Monitor for suspicious traffic patterns

### 4. Backup and Recovery
- Backup ACME certificate data
- Document disaster recovery procedures
- Test certificate renewal processes

## Troubleshooting Common Issues

### SSL Certificate Issues
```bash
# Check certificate status
kubectl logs -n traefik deployment/traefik | grep -i acme

# Verify ACME challenge
kubectl get certificates -A
kubectl describe certificate your-cert -n your-namespace
```

### High Latency
```bash
# Check Traefik metrics
kubectl port-forward -n traefik svc/traefik 8080:8080
# Visit http://localhost:8080/metrics

# Monitor backend health
kubectl get endpoints
```

### Rate Limiting Issues
```bash
# Check middleware configuration
kubectl get middleware -A
kubectl describe middleware rate-limit -n default
```

## What's Next?

In **Part 3**, we'll complete our journey by adding enterprise-grade security with Akamai App and API Protection, plus EdgeDNS integration for global performance. You'll learn:

- Akamai App & API Protection configuration
- EdgeDNS integration with cert-manager
- Global load balancing and failover
- DDoS protection and Web Application Firewall
- Performance optimization with edge caching

## Conclusion

You now have a production-ready ingress controller that automatically manages SSL certificates, provides intelligent routing, and integrates seamlessly with your monitoring stack. This setup gives you:

- **Zero-touch SSL management** with automatic renewal
- **Advanced traffic management** with middleware and routing
- **Complete observability** with metrics and alerting
- **Production-ready security** with rate limiting and headers
- **Blue-green deployment** capabilities for zero-downtime updates

The combination of Traefik's automatic service discovery, Let's Encrypt integration, and Prometheus monitoring creates a robust foundation that scales with your applications while maintaining security and observability.

*Next up in Part 3: We'll add the final layer—enterprise security with Akamai App & API Protection and global DNS management for a truly production-ready Kubernetes platform.*

---

**Alexander Cedergren** is a Solutions Engineer specializing in Kubernetes, edge computing, and cloud security. Follow the series to master production Kubernetes deployments.