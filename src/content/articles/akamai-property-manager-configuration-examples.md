---
title: "Akamai Property Manager Configuration Examples: Complete JSON and HCL Reference"
description: "Comprehensive collection of production-ready Akamai Property Manager configurations in JSON and Terraform HCL format for common use cases."
author: "Alexander Cedergren"
date: "2024-08-15"
readingTime: 20
tags: ["Akamai", "CDN", "Configuration", "Property Manager", "Terraform", "Best Practices"]
topic: "CDN"
imageUrl: "https://picsum.photos/1200/600?random=19"
---

After years of implementing Akamai configurations, I've noticed a gap in practical, production-ready examples. This comprehensive guide provides real-world Property Manager configurations you can use as templates for your own implementations.

## Understanding Property Manager Structure

Before diving into examples, let's understand the basic structure:

```json
{
  "rules": {
    "name": "default",
    "children": [
      {
        "name": "Rule Name",
        "criteria": [
          // Conditions that must match
        ],
        "behaviors": [
          // Actions to take when criteria match
        ]
      }
    ],
    "behaviors": [
      // Default behaviors that apply to all requests
    ]
  }
}
```

## Essential Configuration Examples

### 1. Comprehensive Caching Strategy

```json
{
  "name": "Comprehensive Caching Strategy",
  "children": [
    {
      "name": "Static Assets - Immutable",
      "criteria": [
        {
          "name": "fileExtension",
          "options": {
            "matchOperator": "IS_ONE_OF",
            "values": ["js", "css", "woff", "woff2", "ttf", "eot", "otf"],
            "matchCaseSensitive": false
          }
        },
        {
          "name": "path",
          "options": {
            "matchOperator": "MATCHES_ONE_OF",
            "values": ["/dist/*", "/static/*", "/assets/*"],
            "matchCaseSensitive": false
          }
        }
      ],
      "behaviors": [
        {
          "name": "caching",
          "options": {
            "behavior": "MAX_AGE",
            "mustRevalidate": false,
            "ttl": "365d"
          }
        },
        {
          "name": "modifyOutgoingResponseHeader",
          "options": {
            "action": "ADD",
            "standardAddHeaderName": "OTHER",
            "customHeaderName": "Cache-Control",
            "headerValue": "public, max-age=31536000, immutable"
          }
        },
        {
          "name": "cacheKeyQueryParams",
          "options": {
            "behavior": "INCLUDE",
            "parameters": ["v", "version", "build"]
          }
        }
      ]
    },
    {
      "name": "Images - Optimized Delivery",
      "criteria": [
        {
          "name": "fileExtension",
          "options": {
            "matchOperator": "IS_ONE_OF",
            "values": ["jpg", "jpeg", "png", "gif", "webp", "svg", "ico", "avif"],
            "matchCaseSensitive": false
          }
        }
      ],
      "behaviors": [
        {
          "name": "caching",
          "options": {
            "behavior": "MAX_AGE",
            "mustRevalidate": false,
            "ttl": "30d"
          }
        },
        {
          "name": "imageManager",
          "options": {
            "enabled": true,
            "resize": true,
            "applyBestFileType": true,
            "preferModernFormats": true,
            "superCacheRegion": "US",
            "cpCodeOriginal": {
              "id": 12345
            },
            "cpCodeTransformed": {
              "id": 12346
            },
            "advanced": true,
            "policyTokenDefault": "default_policy"
          }
        },
        {
          "name": "imageManagerVideo",
          "options": {
            "enabled": true,
            "resize": true,
            "superCacheRegion": "US",
            "cpCodeOriginal": {
              "id": 12347
            },
            "cpCodeTransformed": {
              "id": 12348
            },
            "policyTokenDefault": "video_policy"
          }
        }
      ]
    },
    {
      "name": "Dynamic Content - Short TTL",
      "criteria": [
        {
          "name": "contentType",
          "options": {
            "matchOperator": "IS_ONE_OF",
            "values": ["text/html*", "application/xhtml+xml*"],
            "matchWildcard": true
          }
        }
      ],
      "behaviors": [
        {
          "name": "caching",
          "options": {
            "behavior": "MAX_AGE",
            "mustRevalidate": true,
            "ttl": "10m"
          }
        },
        {
          "name": "tieredDistribution",
          "options": {
            "enabled": true,
            "tieredDistributionMap": "CH2"
          }
        },
        {
          "name": "prefreshCache",
          "options": {
            "enabled": true,
            "prefreshval": 90
          }
        },
        {
          "name": "cacheKeyQueryParams",
          "options": {
            "behavior": "IGNORE",
            "exactMatch": false,
            "parameters": ["utm_*", "fbclid", "gclid", "_ga", "mc_*"]
          }
        }
      ]
    },
    {
      "name": "API Endpoints - Micro Caching",
      "criteria": [
        {
          "name": "path",
          "options": {
            "matchOperator": "MATCHES_ONE_OF",
            "values": ["/api/*", "/v1/*", "/v2/*", "/graphql"],
            "matchCaseSensitive": false
          }
        }
      ],
      "behaviors": [
        {
          "name": "caching",
          "options": {
            "behavior": "MAX_AGE",
            "mustRevalidate": true,
            "ttl": "10s",
            "honorNoStore": false,
            "honorPrivate": false
          }
        },
        {
          "name": "cacheId",
          "options": {
            "rule": "INCLUDE_ALL_QUERY_PARAMS"
          }
        },
        {
          "name": "cachePost",
          "options": {
            "enabled": true,
            "useBody": true
          }
        }
      ]
    }
  ]
}
```

### 2. Advanced Performance Optimization

```json
{
  "name": "Performance Optimization Suite",
  "children": [
    {
      "name": "HTTP/2 and HTTP/3 Configuration",
      "behaviors": [
        {
          "name": "http2",
          "options": {
            "enabled": true
          }
        },
        {
          "name": "http3",
          "options": {
            "enable": true
          }
        },
        {
          "name": "allowTransferEncoding",
          "options": {
            "enabled": true
          }
        }
      ]
    },
    {
      "name": "SureRoute Optimization",
      "criteria": [
        {
          "name": "requestMethod",
          "options": {
            "matchOperator": "IS",
            "value": "GET"
          }
        },
        {
          "name": "contentType",
          "options": {
            "matchOperator": "IS_NOT_ONE_OF",
            "values": ["video/*", "audio/*", "application/octet-stream"],
            "matchWildcard": true
          }
        }
      ],
      "behaviors": [
        {
          "name": "sureRoute",
          "options": {
            "enabled": true,
            "forceSslForward": true,
            "raceStatTtl": "30m",
            "toHostStatus": "INCOMING_HH",
            "type": "PERFORMANCE",
            "testObjectUrl": "/akamai/sureroute-test-object.html",
            "customStatKey": "[hostname]"
          }
        }
      ]
    },
    {
      "name": "Adaptive Acceleration (Ion)",
      "behaviors": [
        {
          "name": "adaptiveAcceleration",
          "options": {
            "enablePush": true,
            "enablePreconnect": true,
            "preloadEnable": true,
            "enableRo": true,
            "enableBrotliCompression": true,
            "titleHttp2ServerPush": "",
            "titlePreconnect": "",
            "titlePreload": "",
            "titleRo": "",
            "titleBrotli": ""
          }
        },
        {
          "name": "resourceOptimizer",
          "options": {
            "enabled": true
          }
        },
        {
          "name": "adaptiveImageCompression",
          "options": {
            "tier1MobileCompressionMethod": "BYPASS",
            "tier1MobileCompressionValue": 85,
            "tier2MobileCompressionMethod": "COMPRESS",
            "tier2MobileCompressionValue": 70,
            "tier3MobileCompressionMethod": "COMPRESS",
            "tier3MobileCompressionValue": 60,
            "titleMobile": "",
            "compressMobile": true
          }
        }
      ]
    },
    {
      "name": "Prefetching Critical Resources",
      "behaviors": [
        {
          "name": "prefetch",
          "options": {
            "enabled": true,
            "prefetchlist": [
              "/css/critical.css",
              "/js/app.js",
              "/api/user/profile",
              "/api/config"
            ]
          }
        },
        {
          "name": "dnsPrefetch",
          "options": {
            "enabled": true,
            "dnslist": [
              "fonts.googleapis.com",
              "cdnjs.cloudflare.com",
              "www.google-analytics.com"
            ]
          }
        }
      ]
    }
  ]
}
```

### 3. Security Configuration

```json
{
  "name": "Security Configuration",
  "children": [
    {
      "name": "WAF and Bot Protection",
      "behaviors": [
        {
          "name": "applicationLoadBalancer",
          "options": {
            "enabled": true,
            "failoverToOriginOnStatusCodes": [502, 503, 504],
            "originCookieName": "AKAMAI_ALB"
          }
        },
        {
          "name": "webApplicationFirewall",
          "options": {
            "firewallConfiguration": {
              "configId": 12345,
              "productionStatus": "PRODUCTION",
              "productionVersion": "LATEST",
              "stagingStatus": "STAGING",
              "stagingVersion": "LATEST"
            }
          }
        },
        {
          "name": "botManager",
          "options": {
            "botoEnabled": true,
            "javascriptInjectionRules": {
              "injectionEnabled": true,
              "rules": "SERVE_ALL"
            },
            "akamaiBotCategoryAction": {
              "categoryId": "AAAA1111",
              "action": "monitor"
            },
            "botCategoryActions": [
              {
                "categoryId": "BBBB2222",
                "action": "deny"
              }
            ],
            "customBotCategoryActions": [
              {
                "categoryId": "CCCC3333",
                "action": "tarpit"
              }
            ]
          }
        }
      ]
    },
    {
      "name": "DDoS Protection",
      "behaviors": [
        {
          "name": "edgeRedirector",
          "options": {
            "enabled": true,
            "cloudletSharedPolicy": 12345
          }
        },
        {
          "name": "siteShield",
          "options": {
            "ssMapName": "ss.akamai.net"
          }
        }
      ]
    },
    {
      "name": "Security Headers",
      "behaviors": [
        {
          "name": "modifyOutgoingResponseHeader",
          "options": {
            "action": "ADD",
            "standardAddHeaderName": "OTHER",
            "customHeaderName": "Strict-Transport-Security",
            "headerValue": "max-age=31536000; includeSubDomains; preload"
          }
        },
        {
          "name": "modifyOutgoingResponseHeader",
          "options": {
            "action": "ADD",
            "standardAddHeaderName": "OTHER",
            "customHeaderName": "X-Content-Type-Options",
            "headerValue": "nosniff"
          }
        },
        {
          "name": "modifyOutgoingResponseHeader",
          "options": {
            "action": "ADD",
            "standardAddHeaderName": "OTHER",
            "customHeaderName": "X-Frame-Options",
            "headerValue": "SAMEORIGIN"
          }
        },
        {
          "name": "modifyOutgoingResponseHeader",
          "options": {
            "action": "ADD",
            "standardAddHeaderName": "OTHER",
            "customHeaderName": "Content-Security-Policy",
            "headerValue": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googleapis.com; style-src 'self' 'unsafe-inline' *.googleapis.com; img-src 'self' data: https:; font-src 'self' data: *.gstatic.com;"
          }
        }
      ]
    }
  ]
}
```

### 4. ESI (Edge Side Includes) Configuration

```json
{
  "name": "ESI Configuration",
  "children": [
    {
      "name": "Enable ESI Processing",
      "criteria": [
        {
          "name": "contentType",
          "options": {
            "matchOperator": "IS_ONE_OF",
            "values": ["text/html*"],
            "matchWildcard": true
          }
        }
      ],
      "behaviors": [
        {
          "name": "edgeSideIncludes",
          "options": {
            "enabled": true,
            "enableViaHttp": true,
            "passSetCookie": false,
            "passClientIp": true,
            "i18nStatus": false,
            "i18nCharset": ["LATIN1", "UTF_8", "EUC_JP", "SJIS", "GB2312", "BIG5", "ISO2022_KR"],
            "detectInjection": false
          }
        },
        {
          "name": "esiMainBehavior",
          "options": {
            "errorHandling": "IGNORE"
          }
        }
      ]
    },
    {
      "name": "ESI Fragment Caching",
      "criteria": [
        {
          "name": "path",
          "options": {
            "matchOperator": "MATCHES_ONE_OF",
            "values": ["/esi/*", "/fragments/*"],
            "matchCaseSensitive": false
          }
        }
      ],
      "behaviors": [
        {
          "name": "caching",
          "options": {
            "behavior": "MAX_AGE",
            "mustRevalidate": false,
            "ttl": "1h"
          }
        }
      ]
    }
  ]
}
```

### 5. Origin Failure Recovery

```json
{
  "name": "Origin Resilience",
  "children": [
    {
      "name": "Failover Configuration",
      "behaviors": [
        {
          "name": "failAction",
          "options": {
            "enabled": false
          }
        },
        {
          "name": "healthDetection",
          "options": {
            "retryCount": 3,
            "retryInterval": 10,
            "maximumReconnects": 5,
            "originHealthCheckProtocol": "HTTPS",
            "originHealthCheckPath": "/health",
            "originHealthCheckHosts": ["origin1.example.com", "origin2.example.com"],
            "interval": 60
          }
        },
        {
          "name": "originFailureRecoveryPolicy",
          "options": {
            "enabled": true,
            "monitorOriginResponses": true,
            "monitorStatusCodes": [500, 502, 503, 504],
            "monitorEdgeStatusCodes": [],
            "statusCodesThreshold": 25,
            "netStorageHostname": "",
            "cpCodeId": null,
            "recoveryConfigName": "backup-origin",
            "ipVersion": "IPV4",
            "originHostHeader": "${origin.hostname}",
            "modifiedSinceRecovery": false,
            "enableBinaryCompare": true
          }
        },
        {
          "name": "cacheError",
          "options": {
            "enabled": true,
            "ttl": "10m",
            "preserveStale": true
          }
        }
      ]
    },
    {
      "name": "Circuit Breaker Pattern",
      "behaviors": [
        {
          "name": "adaptiveAcceleration",
          "options": {
            "enablePush": false,
            "enablePreconnect": false,
            "preloadEnable": false,
            "enableRo": false,
            "enableBrotliCompression": false,
            "titleHttp2ServerPush": "",
            "titlePreconnect": "",
            "titlePreload": "",
            "titleRo": "",
            "titleBrotli": ""
          }
        }
      ]
    }
  ]
}
```

### 6. Real User Monitoring (mPulse) Integration

```json
{
  "name": "mPulse RUM Configuration",
  "behaviors": [
    {
      "name": "mPulse",
      "options": {
        "enabled": true,
        "requirePci": false,
        "apiKey": "YOUR-MPULSE-API-KEY",
        "bufferSize": 1000,
        "configOverride": "",
        "loaderVersion": "V12"
      }
    },
    {
      "name": "realUserMonitoring",
      "options": {
        "enabled": true
      }
    }
  ]
}
```

## Terraform HCL Configuration Examples

For infrastructure as code, here are the same configurations in Terraform:

```hcl
# Complete Akamai Property Configuration in Terraform

resource "akamai_property_rules_builder" "property_rules" {
  rules_v2023_09_20 {
    name = "default"
    
    # Default behaviors
    behavior {
      origin {
        origin_type                    = "CUSTOMER"
        hostname                       = "origin.example.com"
        forward_host_header            = "REQUEST_HOST_HEADER"
        cache_key_hostname             = "REQUEST_HOST_HEADER"
        compress                       = true
        enable_true_client_ip         = true
        true_client_ip_header         = "True-Client-IP"
        true_client_ip_client_setting = false
        http_port                     = 80
        https_port                    = 443
        origin_certificate            = ""
        verification_mode             = "PLATFORM_SETTINGS"
        origin_sni                    = true
        ports                         = ""
        custom_valid_cn_values        = []
        origin_certs_to_honor         = "STANDARD_CERTIFICATE_AUTHORITIES"
        standard_certificate_authorities = ["akamai-permissive"]
      }
    }
    
    behavior {
      cp_code {
        value {
          id = 12345
        }
      }
    }
    
    # Static Assets Rule
    rule {
      name = "Static Assets - Long TTL"
      
      criteria {
        file_extension {
          match_operator       = "IS_ONE_OF"
          values              = ["css", "js", "woff", "woff2", "ttf", "eot", "otf"]
          match_case_sensitive = false
        }
      }
      
      behavior {
        caching {
          behavior        = "MAX_AGE"
          must_revalidate = false
          ttl             = "365d"
        }
      }
      
      behavior {
        modify_outgoing_response_header {
          action                   = "ADD"
          standard_add_header_name = "OTHER"
          custom_header_name       = "Cache-Control"
          header_value            = "public, max-age=31536000, immutable"
        }
      }
    }
    
    # Dynamic Content Rule
    rule {
      name = "Dynamic Content - Short TTL"
      
      criteria {
        content_type {
          match_operator = "IS_ONE_OF"
          values         = ["text/html*", "application/xhtml+xml*"]
          match_wildcard = true
        }
      }
      
      behavior {
        caching {
          behavior        = "MAX_AGE"
          must_revalidate = true
          ttl             = "10m"
        }
      }
      
      behavior {
        tiered_distribution {
          enabled = true
        }
      }
      
      behavior {
        cache_key_query_params {
          behavior   = "IGNORE"
          exact_match = false
          parameters = ["utm_*", "fbclid", "gclid", "_ga", "mc_*"]
        }
      }
    }
    
    # Performance Optimization Rule
    rule {
      name = "Performance Optimization"
      
      behavior {
        http2 {
          enabled = true
        }
      }
      
      behavior {
        sure_route {
          enabled            = true
          force_ssl_forward  = true
          race_stat_ttl      = "30m"
          to_host_status     = "INCOMING_HH"
          type              = "PERFORMANCE"
          test_object_url    = "/akamai/sureroute-test-object.html"
        }
      }
      
      behavior {
        adaptive_acceleration {
          enable_push              = true
          enable_preconnect        = true
          preload_enable           = true
          enable_ro                = true
          enable_brotli_compression = true
        }
      }
    }
    
    # Security Rule
    rule {
      name = "Security Headers"
      
      behavior {
        modify_outgoing_response_header {
          action                   = "ADD"
          standard_add_header_name = "OTHER"
          custom_header_name       = "Strict-Transport-Security"
          header_value            = "max-age=31536000; includeSubDomains; preload"
        }
      }
      
      behavior {
        modify_outgoing_response_header {
          action                   = "ADD"
          standard_add_header_name = "OTHER"
          custom_header_name       = "X-Content-Type-Options"
          header_value            = "nosniff"
        }
      }
    }
  }
}
```

## Best Practices for Property Manager Configurations

### 1. Rule Ordering Matters

Rules are evaluated top to bottom. Place more specific rules before general ones:

```json
{
  "children": [
    {
      "name": "Specific API Endpoint",
      "criteria": [{"name": "path", "options": {"values": ["/api/v2/users"]}}],
      "behaviors": [{"name": "caching", "options": {"ttl": "0s"}}]
    },
    {
      "name": "General API Rules",
      "criteria": [{"name": "path", "options": {"values": ["/api/*"]}}],
      "behaviors": [{"name": "caching", "options": {"ttl": "60s"}}]
    }
  ]
}
```

### 2. Use Match Criteria Efficiently

Combine criteria for better performance:

```json
{
  "criteria": [
    {
      "name": "requestProtocol",
      "options": {"value": "HTTPS"}
    },
    {
      "name": "requestMethod",
      "options": {"value": "GET"}
    },
    {
      "name": "contentType",
      "options": {
        "matchOperator": "IS_ONE_OF",
        "values": ["application/json*"],
        "matchWildcard": true
      }
    }
  ]
}
```

### 3. Validate Configurations

Always validate before activating:

```bash
# Using Akamai CLI
akamai property-manager validate -p property_name -v latest

# Using API
curl -X POST "https://akab-xxxxx.luna.akamaiapis.net/papi/v1/properties/prp_12345/versions/3/validate" \
  -H "Content-Type: application/json" \
  -H "Authorization: ..."
```

## Conclusion

These Property Manager configurations provide a solid foundation for implementing Akamai CDN features. Remember to:

1. Test configurations in staging first
2. Monitor performance impacts after deployment
3. Keep configurations version-controlled
4. Document custom behaviors and their purposes
5. Review and optimize regularly based on analytics

The key to successful Akamai implementations is understanding how behaviors interact and building configurations that align with your specific performance and security requirements.