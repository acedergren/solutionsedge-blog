---
title: "CDN Fundamentals in 2023: Why Caching Still Matters and How to Optimize Dynamic Applications"
description: "Master CDN basics, caching headers, dynamic content optimization, and Akamai-specific best practices including why Vary headers are problematic and day-one operational essentials."
author: "Alexander Cedergren"
date: "2023-11-20"
readingTime: 18
tags: ["CDN", "Caching", "Akamai", "Performance", "Best Practices", "APIs"]
topic: "Web Performance"
imageUrl: "https://picsum.photos/1200/600?random=18"
---

"Do we still need a CDN in 2023?" I hear this question surprisingly often, usually from teams who think modern hosting and cloud infrastructure have made CDNs obsolete. The answer is emphatically yes—but not for the reasons you might think from 20 years ago. Today's CDNs do far more than cache static assets; they're critical infrastructure for optimizing dynamic applications, APIs, and personalizing content at the edge.

Let me share what I've learned from years of helping organizations leverage CDNs effectively, with specific insights from Akamai's platform that apply broadly to CDN strategy.

## Why CDNs Matter More Than Ever in 2023

### The Shifting Performance Landscape

```javascript
// Modern web application complexity
const modernAppCharacteristics = {
  staticAssets: {
    percentage: '15-25%',  // Down from 80% in 2000s
    types: ['JS bundles', 'CSS', 'images', 'fonts'],
    avgSize: '2-5MB per page'
  },
  
  dynamicContent: {
    percentage: '75-85%',  // Up significantly
    types: ['API responses', 'personalized HTML', 'real-time data'],
    challenges: ['uncacheable by default', 'user-specific', 'constantly changing']
  },
  
  userExpectations: {
    pageLoad: '<2 seconds',
    apiResponse: '<200ms',
    globally: 'same performance everywhere'
  }
};

// Why CDNs are essential
const cdnBenefits2023 = {
  staticOptimization: 'Still important but table stakes',
  dynamicAcceleration: 'Critical differentiator',
  securityLayer: 'DDoS, WAF, bot protection built-in',
  edgeCompute: 'Logic closer to users',
  reliabilityInsurance: 'Origin shield and failover'
};
```

### The Physics Problem Hasn't Changed

Distance still matters. Light travels at 299,792 km/s in a vacuum, but through fiber optic cables, it's about 200,000 km/s. Add routing overhead, and you're looking at:

- **New York to London**: ~70ms round trip (best case)
- **San Francisco to Tokyo**: ~100ms round trip (best case)
- **London to Sydney**: ~250ms round trip (best case)

Your origin server can't defeat physics. CDNs solve this by putting content closer to users.

## Understanding Caching: The Foundation

### Cache-Control Headers: Your Primary Tool

```http
# Basic static asset caching (1 year)
Cache-Control: public, max-age=31536000, immutable

# Dynamic content with revalidation
Cache-Control: public, max-age=300, must-revalidate

# User-specific content
Cache-Control: private, max-age=0, must-revalidate

# API responses with short TTL
Cache-Control: public, max-age=60, s-maxage=300

# Never cache
Cache-Control: no-store
```

### The Akamai-Specific Challenge: Why Vary Header is Problematic

Here's something crucial that many developers don't realize: **Akamai doesn't cache content with Vary headers** (with very limited exceptions). This is a significant architectural decision that impacts how you design your caching strategy.

```http
# This will NOT cache on Akamai
HTTP/1.1 200 OK
Content-Type: application/json
Vary: Accept-Encoding, Accept-Language, User-Agent
Cache-Control: public, max-age=300

# Why Vary is problematic at scale:
# - Creates cache fragmentation
# - Exponentially increases cache storage needs
# - Reduces cache hit rates
# - Complicates cache invalidation
```

### Working Around Vary Header Limitations

```javascript
// Instead of using Vary, normalize at the edge
export function onClientRequest(request) {
  // Normalize Accept-Encoding
  const acceptEncoding = request.getHeader('Accept-Encoding');
  if (acceptEncoding && acceptEncoding.includes('br')) {
    request.setHeader('Accept-Encoding', 'br');
  } else if (acceptEncoding && acceptEncoding.includes('gzip')) {
    request.setHeader('Accept-Encoding', 'gzip');
  } else {
    request.removeHeader('Accept-Encoding');
  }
  
  // Handle language via URL pattern instead of Accept-Language
  // /api/v1/products → /api/v1/en-US/products
  const acceptLanguage = request.getHeader('Accept-Language');
  const primaryLanguage = parseAcceptLanguage(acceptLanguage);
  
  if (!request.path.match(/\/(en-US|es-ES|fr-FR|de-DE)\//)) {
    request.path = request.path.replace('/api/v1/', `/api/v1/${primaryLanguage}/`);
  }
}

// Alternative: Use different URLs for different variants
const variantStrategies = {
  contentType: {
    bad: 'Vary: Accept',
    good: 'Use .json, .xml, .html extensions'
  },
  
  language: {
    bad: 'Vary: Accept-Language', 
    good: 'Use /en/, /es/, /fr/ URL paths'
  },
  
  encoding: {
    bad: 'Vary: Accept-Encoding',
    good: 'Let Akamai handle compression automatically'
  },
  
  mobile: {
    bad: 'Vary: User-Agent',
    good: 'Use m.example.com or /mobile/ paths'
  }
};
```

## Caching Dynamic Content: Advanced Strategies

### 1. Micro-Caching for APIs

Even 1-second caching can dramatically reduce origin load:

```javascript
// Akamai Property Manager behavior
{
  "name": "API Micro-caching",
  "criteria": [
    {
      "name": "path",
      "options": {
        "matchOperator": "MATCHES_ONE_OF",
        "values": ["/api/v1/products/*", "/api/v1/categories/*"],
        "matchCaseSensitive": false
      }
    }
  ],
  "behaviors": [
    {
      "name": "caching",
      "options": {
        "behavior": "MAX_AGE",
        "maxAge": "1s",
        "honorPrivateEnabled": true,
        "honorNoStoreEnabled": true
      }
    },
    {
      "name": "tieredDistribution",
      "options": {
        "enabled": true
      }
    }
  ]
}

// Origin load reduction calculation
const microCachingImpact = {
  requestsPerSecond: 1000,
  cacheHitRatio: 0.95,  // With 1-second TTL
  originRequestsWithoutCache: 1000,
  originRequestsWithCache: 50,  // 95% reduction
  monthlyOriginSavings: 1000 * 0.95 * 60 * 60 * 24 * 30  // ~2.5 billion requests
};
```

### 2. Cache Key Optimization

```javascript
// Akamai cache key customization
export function onClientRequest(request) {
  // Remove unnecessary query parameters from cache key
  const importantParams = ['category', 'page', 'sort', 'filter'];
  const url = new URL(request.url);
  const searchParams = new URLSearchParams();
  
  // Only include important params in cache key
  importantParams.forEach(param => {
    if (url.searchParams.has(param)) {
      searchParams.set(param, url.searchParams.get(param));
    }
  });
  
  // Ignore marketing/tracking parameters
  // utm_*, fbclid, gclid, etc. won't create cache misses
  request.setVariable('PMUSER_CACHE_KEY_QUERY', searchParams.toString());
}

// Example impact:
// Original URL: /products?category=shoes&utm_source=google&fbclid=xyz&session=abc
// Cache Key: /products?category=shoes
// Result: Much higher cache hit ratio
```

### 3. Partial Object Caching (POC)

For large files, cache chunks even if the full download doesn't complete:

```javascript
// Akamai POC configuration
{
  "name": "Partial Object Caching",
  "behaviors": [
    {
      "name": "partialObjectCaching",
      "options": {
        "enabled": true,
        "minimumObjectSize": "1MB"
      }
    },
    {
      "name": "rangeRequests",
      "options": {
        "enabled": true
      }
    }
  ]
}

// Benefits for video/large file delivery
const pocBenefits = {
  videoStreaming: 'Cache video segments separately',
  largeSoftware: 'Resume interrupted downloads from cache',
  rangeRequests: 'Serve byte-range requests from cache',
  originOffload: 'Reduce origin bandwidth significantly'
};
```

## Dynamic Content Optimization Beyond Caching

### 1. SureRoute: TCP Optimization for Dynamic Content

```javascript
// Akamai SureRoute configuration
{
  "name": "SureRoute Optimization",
  "criteria": [
    {
      "name": "path",
      "options": {
        "matchOperator": "MATCHES_ONE_OF",
        "values": ["/api/*", "/checkout/*", "/account/*"]
      }
    }
  ],
  "behaviors": [
    {
      "name": "sureRoute",
      "options": {
        "enabled": true,
        "type": "PERFORMANCE",
        "testObjectPath": "/sureroute-test.html",
        "raceStatTtl": "30m",
        "forceSslForward": true
      }
    }
  ]
}

// How SureRoute works:
// 1. Constantly tests routes from edge to origin
// 2. Finds optimal path through Akamai network
// 3. Avoids congested internet routes
// 4. Can improve dynamic content by 30-50%
```

### 2. Prefetching and Predictive Push

```javascript
// HTML-based prefetching hints
export function onClientResponse(request, response) {
  if (response.getHeader('Content-Type').includes('text/html')) {
    let html = response.body;
    
    // Add predictive prefetch headers
    const prefetchUrls = [
      '/api/v1/user/profile',
      '/api/v1/recommendations',
      '/static/js/dashboard.js'
    ];
    
    // Add Link headers for HTTP/2 push
    prefetchUrls.forEach(url => {
      response.addHeader('Link', `<${url}>; rel=prefetch`);
    });
    
    // Inject resource hints into HTML
    const resourceHints = prefetchUrls.map(url => 
      `<link rel="prefetch" href="${url}">`
    ).join('\n');
    
    html = html.replace('</head>', `${resourceHints}\n</head>`);
    response.body = html;
  }
}
```

### 3. API Acceleration with GraphQL

```javascript
// GraphQL-specific optimizations
export function onClientRequest(request) {
  if (request.path === '/graphql' && request.method === 'POST') {
    const body = JSON.parse(request.body);
    
    // Cache GET-like queries
    if (isQueryOperation(body) && !hasSensitiveFields(body)) {
      // Convert to GET for caching
      const cacheKey = generateQueryHash(body.query, body.variables);
      request.method = 'GET';
      request.path = `/graphql/cached/${cacheKey}`;
      
      // Short TTL for dynamic data
      request.setVariable('PMUSER_CACHE_TTL', '60s');
    }
  }
}

function isQueryOperation(body) {
  return body.query && !body.query.trim().startsWith('mutation');
}

function hasSensitiveFields(body) {
  const sensitiveFields = ['password', 'token', 'session', 'personal'];
  return sensitiveFields.some(field => 
    body.query.toLowerCase().includes(field)
  );
}
```

## Essential Day-One Best Practices

### 1. Cache Header Hygiene

```javascript
// Origin server best practices
class CacheHeaderMiddleware {
  constructor() {
    this.rules = [
      {
        pattern: /\.(js|css|jpg|png|gif|svg|woff2?)$/,
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff'
        }
      },
      {
        pattern: /\.(html)$/,
        headers: {
          'Cache-Control': 'public, max-age=300, must-revalidate',
          'X-Frame-Options': 'SAMEORIGIN'
        }
      },
      {
        pattern: /\/api\/v1\/(products|categories)/,
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300',
          'X-API-Version': 'v1'
        }
      },
      {
        pattern: /\/api\/v1\/(user|cart|checkout)/,
        headers: {
          'Cache-Control': 'private, no-cache, must-revalidate',
          'X-Content-Type-Options': 'nosniff'
        }
      }
    ];
  }
  
  apply(request, response) {
    const url = request.url;
    
    // Remove problematic headers
    response.removeHeader('Vary');
    response.removeHeader('Set-Cookie'); // On cacheable responses
    
    // Apply rules
    for (const rule of this.rules) {
      if (rule.pattern.test(url)) {
        Object.entries(rule.headers).forEach(([key, value]) => {
          response.setHeader(key, value);
        });
        break;
      }
    }
    
    // Always set security headers
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
}
```

### 2. Cache Invalidation Strategy

```javascript
// Akamai Fast Purge implementation
class CacheInvalidation {
  constructor(credentials) {
    this.baseURL = 'https://api.ccu.akamai.com';
    this.credentials = credentials;
  }
  
  async purgeByURL(urls) {
    // Purge specific URLs (fastest, most efficient)
    const response = await fetch(`${this.baseURL}/v3/invalidate/url`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        objects: urls,
        hostname: 'www.example.com',
        action: 'remove'  // or 'invalidate' for revalidation
      })
    });
    
    return response.json();
  }
  
  async purgeByCacheTag(tags) {
    // Purge by cache tags (requires setup)
    const response = await fetch(`${this.baseURL}/v3/invalidate/tag`, {
      method: 'POST', 
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        tags: tags,
        hostname: 'www.example.com'
      })
    });
    
    return response.json();
  }
  
  async purgeByCPCode(cpcode) {
    // Nuclear option - purge entire property
    // Use sparingly!
    const response = await fetch(`${this.baseURL}/v3/invalidate/cpcode`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        cpcode: cpcode
      })
    });
    
    return response.json();
  }
}

// Deployment integration
const deploymentPipeline = {
  async onDeployment(version) {
    const cache = new CacheInvalidation(AKAMAI_CREDENTIALS);
    
    // Purge versioned assets
    await cache.purgeByURL([
      '/static/js/app.*.js',
      '/static/css/app.*.css',
      '/service-worker.js'
    ]);
    
    // Purge HTML pages
    await cache.purgeByCacheTag(['html-pages']);
    
    // Wait for purge propagation
    await sleep(5000);
    
    // Warm critical paths
    await this.warmCache([
      '/',
      '/products',
      '/api/v1/featured'
    ]);
  }
};
```

### 3. Origin Offload Monitoring

```javascript
// Track and optimize origin offload
class OffloadAnalytics {
  constructor() {
    this.metrics = {
      totalRequests: 0,
      originRequests: 0,
      cacheHits: 0,
      offloadPercentage: 0
    };
  }
  
  calculateOffload(logs) {
    const analysis = {
      byContentType: {},
      byPath: {},
      opportunities: []
    };
    
    logs.forEach(log => {
      const contentType = log.responseHeaders['content-type'];
      const path = new URL(log.url).pathname;
      const cacheStatus = log.cacheStatus; // TCP_HIT, TCP_MISS, etc.
      
      // Track by content type
      if (!analysis.byContentType[contentType]) {
        analysis.byContentType[contentType] = {
          requests: 0,
          hits: 0,
          misses: 0,
          offload: 0
        };
      }
      
      analysis.byContentType[contentType].requests++;
      if (cacheStatus.includes('HIT')) {
        analysis.byContentType[contentType].hits++;
      } else {
        analysis.byContentType[contentType].misses++;
        
        // Identify caching opportunities
        if (this.isCacheable(log) && !this.isCached(log)) {
          analysis.opportunities.push({
            url: log.url,
            contentType: contentType,
            size: log.responseSize,
            frequency: this.getRequestFrequency(path),
            recommendation: this.getCachingRecommendation(log)
          });
        }
      }
    });
    
    // Calculate offload percentages
    Object.keys(analysis.byContentType).forEach(type => {
      const stats = analysis.byContentType[type];
      stats.offload = (stats.hits / stats.requests) * 100;
    });
    
    return analysis;
  }
  
  isCacheable(log) {
    const method = log.method;
    const status = log.status;
    const cacheControl = log.responseHeaders['cache-control'] || '';
    
    return (
      method === 'GET' &&
      status === 200 &&
      !cacheControl.includes('no-store') &&
      !cacheControl.includes('private') &&
      !log.responseHeaders['set-cookie']
    );
  }
  
  getCachingRecommendation(log) {
    const size = log.responseSize;
    const contentType = log.responseHeaders['content-type'];
    
    if (contentType.includes('image/') || contentType.includes('font/')) {
      return 'Add Cache-Control: public, max-age=31536000, immutable';
    }
    
    if (contentType.includes('javascript') || contentType.includes('css')) {
      return 'Use versioned filenames and cache forever';
    }
    
    if (contentType.includes('json') && log.url.includes('/api/')) {
      return 'Consider micro-caching with 1-60 second TTL';
    }
    
    return 'Evaluate for caching based on update frequency';
  }
}
```

### 4. Error Handling and Failover

```javascript
// Akamai error handling configuration
{
  "name": "Origin Failure Recovery",
  "behaviors": [
    {
      "name": "cacheError",
      "options": {
        "enabled": true,
        "ttl": "5m",
        "cacheHttpStatus": [500, 502, 503, 504]
      }
    },
    {
      "name": "siteFailover",
      "options": {
        "enabled": true,
        "failoverDomain": "backup.example.com",
        "failoverCriteria": [
          {
            "statusCode": 500,
            "threshold": 10,
            "period": "1m"
          }
        ]
      }
    },
    {
      "name": "constructResponse",
      "options": {
        "enabled": true,
        "status": 503,
        "body": "<!DOCTYPE html><html><body><h1>Temporarily Unavailable</h1><p>We'll be back shortly.</p></body></html>",
        "contentType": "text/html"
      }
    }
  ]
}

// EdgeWorker for graceful degradation
export function onOriginResponse(request, response) {
  if (response.status >= 500) {
    // Try to serve stale content
    const staleContent = cache.get(request.url + ':stale');
    if (staleContent) {
      return new Response(staleContent, {
        status: 200,
        headers: {
          'X-Served-Stale': 'true',
          'X-Original-Status': response.status
        }
      });
    }
    
    // Serve graceful error page
    return new Response(getErrorPage(response.status), {
      status: response.status,
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      }
    });
  }
}
```

## Common Pitfalls and How to Avoid Them

### 1. The Cookie Trap

```javascript
// Problem: Cookies prevent caching
// Bad:
response.setHeader('Set-Cookie', 'session=abc123; Path=/');
response.setHeader('Cache-Control', 'public, max-age=3600');
// Result: Won't cache due to Set-Cookie

// Good: Separate cookie-setting from cacheable responses
if (request.path === '/api/products') {
  // No cookies on cacheable endpoints
  response.setHeader('Cache-Control', 'public, max-age=300');
} else if (request.path === '/api/auth') {
  // Cookies only on auth endpoints
  response.setHeader('Set-Cookie', 'session=abc123; Path=/; HttpOnly; Secure');
  response.setHeader('Cache-Control', 'private, no-cache');
}
```

### 2. Query String Chaos

```javascript
// Problem: Random query strings destroy cache efficiency
// URLs that should be the same cache entry:
// /products?utm_source=google&utm_campaign=summer&_=1698765432
// /products?_=1698765433&utm_source=facebook
// /products

// Solution: Normalize at the edge
export function onClientRequest(request) {
  const url = new URL(request.url);
  const allowedParams = ['category', 'sort', 'page'];
  
  // Remove all non-allowed parameters
  Array.from(url.searchParams.keys()).forEach(key => {
    if (!allowedParams.includes(key)) {
      url.searchParams.delete(key);
    }
  });
  
  // Sort parameters for consistent cache keys
  url.searchParams.sort();
  
  request.url = url.toString();
}
```

### 3. Mobile Detection Without Vary

```javascript
// Problem: Can't use Vary: User-Agent
// Solution: Device detection at the edge

export function onClientRequest(request) {
  const userAgent = request.getHeader('User-Agent') || '';
  const isMobile = /iPhone|Android|Mobile/i.test(userAgent);
  
  if (isMobile) {
    // Route to mobile-specific URL
    if (!request.path.startsWith('/m/')) {
      request.path = '/m' + request.path;
    }
  }
  
  // Or add device type to cache key
  request.setVariable('PMUSER_DEVICE_TYPE', isMobile ? 'mobile' : 'desktop');
}

// Alternative: Responsive design with same HTML
// Cache once, adapt client-side
```

## Measuring CDN Effectiveness

### Key Metrics to Track

```javascript
const cdnKPIs = {
  offloadRate: {
    formula: '(edge_requests - origin_requests) / edge_requests * 100',
    target: '>85% for static, >40% for dynamic',
    impact: 'Direct cost savings and origin stability'
  },
  
  cacheHitRatio: {
    formula: 'cache_hits / (cache_hits + cache_misses) * 100',
    target: '>90% for static, >60% for API responses',
    impact: 'User performance and origin load'
  },
  
  originResponseTime: {
    measurement: 'Time from edge to origin and back',
    target: '<200ms average, <500ms p95',
    optimization: 'Use SureRoute, persistent connections'
  },
  
  edgeResponseTime: {
    measurement: 'Time to serve from edge cache',
    target: '<50ms average globally',
    impact: 'Direct user experience'
  },
  
  errorRate: {
    formula: 'error_responses / total_responses * 100',
    target: '<0.1%',
    monitoring: 'Alert on spikes, investigate patterns'
  }
};

// Monitoring dashboard query examples
const monitoringQueries = {
  offloadByContentType: `
    SELECT content_type,
           SUM(edge_requests) as total_requests,
           SUM(origin_requests) as origin_requests,
           (1 - SUM(origin_requests)/SUM(edge_requests)) * 100 as offload_rate
    FROM cdn_logs
    WHERE timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY content_type
    ORDER BY total_requests DESC
  `,
  
  slowOriginEndpoints: `
    SELECT url_path,
           AVG(origin_response_time) as avg_time,
           PERCENTILE(origin_response_time, 0.95) as p95_time,
           COUNT(*) as requests
    FROM cdn_logs
    WHERE origin_response_time > 0
      AND timestamp > NOW() - INTERVAL '1 hour'
    GROUP BY url_path
    HAVING COUNT(*) > 100
    ORDER BY p95_time DESC
    LIMIT 20
  `
};
```

## Future-Proofing Your CDN Strategy

### Edge Computing Integration

```javascript
// Progressive enhancement with edge compute
class EdgeApplicationPlatform {
  constructor() {
    this.capabilities = {
      basicCaching: 'Available since 1999',
      dynamicOptimization: 'Available since 2010',
      edgeCompute: 'Available now',
      edgeDatabase: 'Rolling out 2023-2024',
      aiInference: 'Coming 2024-2025'
    };
  }
  
  async handleRequest(request) {
    // Start with caching
    let response = await cache.match(request);
    
    if (!response) {
      // Add edge compute logic
      if (this.shouldPersonalize(request)) {
        response = await this.generatePersonalizedResponse(request);
      } else if (this.shouldOptimize(request)) {
        response = await this.optimizeDynamicContent(request);
      } else {
        response = await fetch(request);
      }
      
      // Cache if appropriate
      if (this.isCacheable(response)) {
        cache.put(request, response.clone());
      }
    }
    
    return response;
  }
}
```

## Conclusion: CDN as Performance Foundation

CDNs in 2023 aren't just about caching static files—they're comprehensive performance and security platforms. The fundamentals of caching remain critical, but modern CDNs excel at:

1. **Dynamic content acceleration** through route optimization
2. **API performance** with micro-caching and edge logic  
3. **Security integration** with DDoS, WAF, and bot protection
4. **Global reliability** through intelligent failover
5. **Edge computing** for logic closer to users

For Akamai specifically, remember:
- **Avoid Vary headers** - normalize at the edge instead
- **Embrace micro-caching** - even 1-second TTLs help
- **Monitor offload rates** - track your optimization success
- **Use SureRoute** - accelerate dynamic content
- **Plan cache invalidation** - fast purge is powerful but needs strategy

The best CDN strategy starts with solid caching fundamentals and builds toward edge computing capabilities. Get the basics right—proper cache headers, intelligent cache keys, and monitoring—then layer on advanced optimizations as needed.

Your users expect fast, reliable experiences regardless of their location. In 2023, a properly configured CDN isn't optional—it's the foundation of web performance.