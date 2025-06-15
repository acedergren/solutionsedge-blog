---
id: 7
title: "Kubernetes Zero to Hero Part 1: Building Production-Ready Observability with Prometheus and Grafana"
author: "Alexander Cedergren"
date: "2024-03-10"
tags: ["Kubernetes", "Observability", "Prometheus", "Grafana", "DevOps", "Monitoring", "Production"]
description: "Start your journey from Kubernetes novice to expert by implementing enterprise-grade observability. Learn to deploy and configure Prometheus and Grafana for comprehensive monitoring of your web applications."
excerpt: "Observability isn't optional in production Kubernetes—it's survival. This comprehensive guide takes you from zero to monitoring hero, implementing Prometheus and Grafana the way the pros do it."
featured: true
---

# Kubernetes Zero to Hero Part 1: Building Production-Ready Observability with Prometheus and Grafana

*This is Part 1 of our Kubernetes Zero to Hero series. By the end of this series, you'll have built a production-ready platform with enterprise-grade observability, automated SSL, and Akamai-powered security.*

Observability isn't optional in production Kubernetes—it's survival. Without proper monitoring, you're flying blind in a complex distributed system where anything can fail at any time. Today, we're building the foundation: a rock-solid observability stack with Prometheus and Grafana that would make any SRE proud.

## What We're Building

By the end of this article, you'll have:
- **Prometheus** collecting metrics from every corner of your cluster
- **Grafana** providing beautiful, actionable dashboards
- **AlertManager** sending intelligent notifications
- **Node Exporter** monitoring your infrastructure
- **Application metrics** from your web apps
- **Service discovery** automatically finding new services

This isn't a toy setup—this is production-grade observability that scales.

## Prerequisites

- A Kubernetes cluster (1.20+) with kubectl access
- Basic understanding of Kubernetes concepts
- 30 minutes of focused time

*Pro tip: If you need a cluster, [Linode Kubernetes Engine](https://www.linode.com/products/kubernetes/) is perfect for this tutorial—simple, reliable, and cost-effective.*

## Step 1: Setting Up the Monitoring Namespace

First, let's create a dedicated namespace for our monitoring stack:

```bash
kubectl create namespace monitoring
kubectl label namespace monitoring name=monitoring
```

This isolation ensures our monitoring components are organized and easier to manage.

## Step 2: Deploying Prometheus with Helm

We'll use the official Prometheus Helm chart for a production-ready deployment:

```bash
# Add the Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create values file for Prometheus configuration
cat <<EOF > prometheus-values.yaml
prometheus:
  prometheusSpec:
    storageSpec:
      volumeClaimTemplate:
        spec:
          storageClassName: "linode-block-storage-retain"
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 50Gi
    retention: 30d
    resources:
      requests:
        memory: 2Gi
        cpu: 1000m
      limits:
        memory: 4Gi
        cpu: 2000m
    
    # Enable service discovery
    serviceMonitorSelectorNilUsesHelmValues: false
    podMonitorSelectorNilUsesHelmValues: false
    ruleSelectorNilUsesHelmValues: false

grafana:
  enabled: true
  adminPassword: "admin123"  # Change this in production!
  persistence:
    enabled: true
    storageClassName: "linode-block-storage-retain"
    size: 10Gi
  
  resources:
    requests:
      memory: 256Mi
      cpu: 100m
    limits:
      memory: 512Mi
      cpu: 200m

alertmanager:
  enabled: true
  alertmanagerSpec:
    storage:
      volumeClaimTemplate:
        spec:
          storageClassName: "linode-block-storage-retain"
          accessModes: ["ReadWriteOnce"]
          resources:
            requests:
              storage: 10Gi

nodeExporter:
  enabled: true

kubeStateMetrics:
  enabled: true

# Enable default rules for Kubernetes monitoring
defaultRules:
  create: true
  rules:
    alertmanager: true
    etcd: true
    general: true
    k8s: true
    kubeApiserver: true
    kubePrometheusNodeRecording: true
    kubernetesApps: true
    kubernetesResources: true
    kubernetesStorage: true
    kubernetesSystem: true
    node: true
    prometheus: true
EOF

# Install the Prometheus stack
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --values prometheus-values.yaml
```

## Step 3: Exposing Grafana and Prometheus

Let's create services to access our monitoring tools:

```yaml
# prometheus-services.yaml
apiVersion: v1
kind: Service
metadata:
  name: prometheus-external
  namespace: monitoring
spec:
  type: LoadBalancer
  ports:
  - port: 9090
    targetPort: 9090
  selector:
    app.kubernetes.io/name: prometheus
---
apiVersion: v1
kind: Service
metadata:
  name: grafana-external
  namespace: monitoring
spec:
  type: LoadBalancer
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app.kubernetes.io/name: grafana
```

```bash
kubectl apply -f prometheus-services.yaml
```

## Step 4: Setting Up Application Monitoring

Now let's create a sample web application with proper metrics exposition:

```yaml
# sample-app.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sample-web-app
  namespace: default
  labels:
    app: sample-web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sample-web-app
  template:
    metadata:
      labels:
        app: sample-web-app
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: web-app
        image: nginx:1.21
        ports:
        - containerPort: 80
        - containerPort: 8080
          name: metrics
        resources:
          requests:
            memory: 64Mi
            cpu: 50m
          limits:
            memory: 128Mi
            cpu: 100m
        # Add nginx-prometheus-exporter sidecar
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
---
apiVersion: v1
kind: Service
metadata:
  name: sample-web-app
  namespace: default
  labels:
    app: sample-web-app
spec:
  ports:
  - port: 80
    targetPort: 80
    name: http
  - port: 9113
    targetPort: 9113
    name: metrics
  selector:
    app: sample-web-app
---
# ServiceMonitor for Prometheus to discover this service
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: sample-web-app
  namespace: default
  labels:
    app: sample-web-app
spec:
  selector:
    matchLabels:
      app: sample-web-app
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
```

```bash
kubectl apply -f sample-app.yaml
```

## Step 5: Configuring AlertManager

Let's set up intelligent alerting:

```yaml
# alertmanager-config.yaml
apiVersion: v1
kind: Secret
metadata:
  name: alertmanager-prometheus-kube-prometheus-alertmanager
  namespace: monitoring
type: Opaque
stringData:
  alertmanager.yml: |
    global:
      smtp_smarthost: 'localhost:587'
      smtp_from: 'alerts@yourdomain.com'
    
    route:
      group_by: ['alertname', 'cluster', 'service']
      group_wait: 10s
      group_interval: 10s
      repeat_interval: 1h
      receiver: 'web.hook'
      routes:
      - match:
          alertname: DeadMansSwitch
        receiver: 'null'
      - match:
          severity: critical
        receiver: 'critical-alerts'
      - match:
          severity: warning
        receiver: 'warning-alerts'
    
    receivers:
    - name: 'null'
    - name: 'web.hook'
      webhook_configs:
      - url: 'http://127.0.0.1:5001/'
    - name: 'critical-alerts'
      slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts-critical'
        title: 'Critical Alert: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
    - name: 'warning-alerts'
      slack_configs:
      - api_url: 'YOUR_SLACK_WEBHOOK_URL'
        channel: '#alerts-warning'
        title: 'Warning: {{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

```bash
kubectl apply -f alertmanager-config.yaml
```

## Step 6: Custom Prometheus Rules

Create custom alerting rules for your applications:

```yaml
# custom-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: custom-application-rules
  namespace: monitoring
  labels:
    prometheus: kube-prometheus
    role: alert-rules
spec:
  groups:
  - name: application.rules
    rules:
    - alert: HighErrorRate
      expr: rate(nginx_http_requests_total{status=~"5.."}[5m]) > 0.1
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High error rate detected"
        description: "Error rate is above 10% for 5 minutes"
    
    - alert: HighLatency
      expr: histogram_quantile(0.95, rate(nginx_http_request_duration_seconds_bucket[5m])) > 0.5
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High latency detected"
        description: "95th percentile latency is above 500ms"
    
    - alert: PodCrashLooping
      expr: rate(kube_pod_container_status_restarts_total[15m]) > 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod is crash looping"
        description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is crash looping"
```

```bash
kubectl apply -f custom-rules.yaml
```

## Step 7: Setting Up Grafana Dashboards

Let's access Grafana and set up essential dashboards:

```bash
# Get Grafana external IP
kubectl get service grafana-external -n monitoring

# Default credentials: admin / admin123 (change this!)
```

Once in Grafana, import these essential dashboards:

1. **Kubernetes Cluster Monitoring** (Dashboard ID: 7249)
2. **Node Exporter Full** (Dashboard ID: 1860)
3. **Nginx Ingress Controller** (Dashboard ID: 9614)
4. **Kubernetes Pod Monitoring** (Dashboard ID: 6417)

## Step 8: Verifying Your Setup

Check that everything is working:

```bash
# Check Prometheus targets
kubectl port-forward -n monitoring svc/prometheus-external 9090:9090

# Visit http://localhost:9090/targets - all should be UP

# Check Grafana
kubectl port-forward -n monitoring svc/grafana-external 3000:3000

# Visit http://localhost:3000
```

## Pro Tips for Production

### 1. Resource Management
Always set resource requests and limits:

```yaml
resources:
  requests:
    memory: "256Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "200m"
```

### 2. Data Retention Strategy
Configure appropriate retention based on your needs:

```yaml
prometheus:
  prometheusSpec:
    retention: 30d  # Adjust based on compliance requirements
    retentionSize: 45GB
```

### 3. High Availability
For production, enable HA mode:

```yaml
prometheus:
  prometheusSpec:
    replicas: 2
alertmanager:
  alertmanagerSpec:
    replicas: 3
```

### 4. Security Hardening
- Use network policies to restrict access
- Enable RBAC with minimal permissions
- Secure Grafana with OAuth integration
- Use secrets for sensitive configuration

## Performance Optimization

### Query Optimization
Write efficient PromQL queries:

```promql
# Good: Rate over longer time windows
rate(http_requests_total[5m])

# Better: Use recording rules for complex queries
custom:http_request_rate5m

# Best: Aggregate at ingestion time when possible
sum(rate(http_requests_total[5m])) by (job, method)
```

### Storage Optimization
- Use remote storage for long-term retention
- Configure appropriate scrape intervals
- Use recording rules for expensive queries

## What's Next?

In **Part 2**, we'll add Traefik as our ingress controller with automatic SSL certificates, integrating it seamlessly with our monitoring stack. You'll learn how to:

- Deploy Traefik with Let's Encrypt integration
- Configure advanced routing and middleware
- Monitor ingress performance and SSL certificate health
- Implement blue-green deployments with observability

## Common Troubleshooting

### Prometheus Not Scraping Targets
```bash
# Check service monitor labels
kubectl get servicemonitor -A

# Verify prometheus service discovery
kubectl logs -n monitoring prometheus-prometheus-kube-prometheus-prometheus-0
```

### Grafana Not Starting
```bash
# Check persistent volume claims
kubectl get pvc -n monitoring

# Check pod logs
kubectl logs -n monitoring deployment/prometheus-grafana
```

### High Memory Usage
```bash
# Check current resource usage
kubectl top pods -n monitoring

# Adjust retention or add more memory
```

## Conclusion

You now have a production-ready observability foundation that will scale with your applications. This monitoring stack provides:

- **Complete visibility** into your Kubernetes cluster
- **Proactive alerting** for issues before they impact users
- **Performance insights** to optimize your applications
- **Capacity planning** data for informed scaling decisions

The monitoring infrastructure we've built today will be crucial as we add more complexity in the coming articles. With proper observability in place, you can confidently deploy and operate applications knowing you'll see problems before your users do.

Remember: monitoring is not a "set it and forget it" task. Regularly review your dashboards, tune your alerts, and evolve your metrics as your applications grow.

*Next up in Part 2: We'll add Traefik ingress with automatic SSL certificates and integrate it with our monitoring stack for complete visibility into your application traffic.*

---

**Alexander Cedergren** is a Solutions Engineer specializing in Kubernetes, observability, and edge computing. Follow the series to level up your Kubernetes expertise.