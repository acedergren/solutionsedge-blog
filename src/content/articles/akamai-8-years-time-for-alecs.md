---
id: 1
title: "Akamai, it's been 8 amazing years… but now it's time we talk about ALECS"
author: "Alexander Cedergren"
date: "2025-06-15"
tags: ["Cloud Infrastructure", "Automation", "AI", "MCP", "Open Source", "DevOps"]
description: "Introducing ALECS—A Launchgrid for Edge & Cloud Services—an open-source experiment leveraging Anthropic's Model Context Protocol to make cloud infrastructure management conversational and intuitive."
excerpt: "Cloud infrastructure management today often feels like navigating a labyrinth of dashboards, scripts, and obscure APIs. What if, instead, your infrastructure was conversational?"
featured: true
---

Cloud infrastructure management today often feels like navigating a labyrinth of dashboards, scripts, and obscure APIs. Infrastructure-as-Code promised simplicity, but in practice, it often just moved complexity into scripts filled with cryptic IDs and brittle state management.

What if, instead, your infrastructure was conversational?

After 8 incredible years at Akamai, I've witnessed countless teams struggle with the fundamental disconnect between what they want to achieve and how they have to express it in code. Terraform and other "modern" IaC tools are essentially lipstick on a pig—they've dressed up the same old imperative configuration management in declarative syntax, but haven't solved the core problem: **infrastructure management shouldn't require you to be a domain expert in every API**.

Introducing **ALECS—A Launchgrid for Edge & Cloud Services**—an open-source experiment leveraging Anthropic's Model Context Protocol (MCP). Instead of writing configuration files, you simply describe what you want. ALECS understands context, handles the complexity, and executes the right API calls to make it happen.

# From Configuration Hell to Conversational Heaven: Why Infrastructure Management is Finally Growing Up

The infrastructure world is stuck in 1995. We're still writing configuration files, managing cryptic identifiers, and debugging YAML indentation errors like it's some kind of badge of honor. Meanwhile, every other domain has embraced natural language interfaces—except the one that needs it most.

**ALECS changes that.** It's not just another tool; it's a fundamental shift from configuration-driven infrastructure to conversation-driven infrastructure. Instead of learning yet another DSL, you simply describe what you want in plain English.

Who doesn't want to shout things at a computer and infrastructure appears like a wild Pokémon? Not that I'm into Pokémon, but hey, they are magical too. And I not a Trekkie either :)

## The Infrastructure-as-Code Problem: Why Terraform is Lipstick on a Pig

Let's be honest about what traditional IaC tools actually accomplished. They took this:

```bash
# The bad old days
aws ec2 create-instance --image-id ami-12345 --instance-type t3.micro --security-group-ids sg-67890
```

And turned it into this:

```hcl
# "Modern" Terraform - still managing cryptic IDs
resource "aws_instance" "web" {
  ami           = "ami-0c02fb55956c7d316"
  instance_type = "t3.micro"
  vpc_security_group_ids = ["sg-903004f8"]
  
  tags = {
    Name = "HelloWorld"
  }
}
```

**The fundamental problem remains**: you're still managing cryptic identifiers, learning domain-specific languages, and debugging state drift. We've just moved the complexity around.

## Enter ALECS: Infrastructure That Speaks Human

With ALECS, you express intent naturally, and the system figures out the implementation:

```
"Create a secure website for example.com with automatic SSL"
```

Behind the scenes, ALECS:
- Creates an Akamai property with Ion acceleration
- Enrolls a Domain Validated certificate
- Configures secure headers and caching rules
- Sets up Edge DNS with proper records
- Handles all the cryptic IDs and API relationships

## Real ALECS Commands in Action

Here are actual prompts you can use with ALECS today:

### Basic Property Management
```
"List all my Akamai properties"
"Create property blog.example.com with Ion product"
"Show me the configuration for property example.com"
"Activate property prp_12345 to staging network"
```

### DNS Migration from Cloudflare and others
```
"Import DNS zone example.com from Cloudflare"
"Migrate all records from Route53 to Akamai EdgeDNS"
"Create A record for www.example.com pointing to 192.0.2.1"
"Enable DNSSEC for zone example.com"
```

### Certificate Management
```
"Enroll DV certificate for *.example.com"
"Check certificate validation status for example.com"
"Link certificate to property blog.example.com"
```

### Multi-Platform Operations
```
"Purge cache for /api/* on all platforms"
"Clone staging property configuration to production"
"Bulk activate all pending properties to production"
```

## ALECS + MCP Ecosystem: The Future is Conversational Orchestration

The real power of ALECS emerges when combined with other MCP tools. Imagine a conversational workflow that spans your entire infrastructure:

### Web Performance & Security Pipeline
```
"Run a Lighthouse audit on example.com, then configure Akamai WAF rules based on the security recommendations"
```

This single command could:
1. **MCP Lighthouse Tool**: Execute performance audit
2. **ALECS**: Parse recommendations and configure Akamai App & API Protection
3. **MCP OWASP Tool**: Validate against Top 10 security practices
4. **MCP GitHub Tool**: Create security issue if vulnerabilities found

### Multi-Cloud Migration Workflows
```
"Analyze my Cloudflare configuration and create equivalent Akamai setup with improved performance"
```

The orchestration:
1. **MCP Cloudflare Tool**: Export current configuration 
2. **ALECS**: Create equivalent Akamai properties with optimizations
3. **MCP Linode Tool**: Provision origin infrastructure if needed
4. **MCP DNS Tool**: Plan migration strategy with zero downtime

### DevSecOps Integration
```
"Deploy the latest release to staging, run OWASP ZAP security scan, and promote to production if clean"
```

Combining:
- **MCP GitHub Tool**: Get latest release
- **ALECS**: Deploy to Akamai staging environment
- **MCP Security Scanner**: Execute OWASP Top 10 validation
- **MCP Monitoring Tool**: Set up synthetic monitoring
- **ALECS**: Promote to production if all checks pass

## Why This Approach Demolishes Traditional IaC

### The Terraform Tax
Traditional IaC tools impose a massive cognitive tax, and as many know, I’m almost religious about cognitive load theory:

```hcl
# Terraform: 50+ lines to create a simple website
resource "akamai_property" "example" {
  name        = "example.com"
  contract_id = var.contract_id
  group_id    = var.group_id
  product_id  = "prd_fresca"
  
  rules {
    rule {
      name      = "default"
      criteria {
        match_type = "always"
      }
      behaviors {
        origin {
          origin_type = "CUSTOMER"
          hostname    = "origin.example.com"
          # ... 30 more parameters
        }
        caching {
          behavior = "MAX_AGE"
          # ... 15 more parameters  
        }
        # ... 10 more behavior blocks
      }
    }
  }
}

resource "akamai_edge_hostname" "example" {
  property_id = akamai_property.example.id
  contract_id = var.contract_id
  group_id    = var.group_id
  # ... more configuration
}

# Plus certificate, DNS, activation resources...
```

### The ALECS Advantage
```
"Create a fast, secure website for example.com with automatic SSL and smart caching"
```

**One sentence. That's it.**

ALECS understands that when you say "fast," you want:
- Ion product with advanced caching
- Image optimization with Image Manager enabled
- HTTP/2 and HTTP/3 support
- Adaptive Acceleration activated

When you say "secure," you get:
- DV certificate enrollment
- HSTS headers
- CSP policies
- Baseline AAP policy enabled

## In a rush to escape "Friends" at Cloudflare?:

Here's how ALECS simplifies moving from Cloudflare to Akamai:

### Traditional Approach (Weeks of Work)
1. Export DNS manually from Cloudflare
2. Analyze WAF rules and convert syntax
3. Map Cloudflare features to Akamai equivalents
4. Write Terraform configurations
5. Debug state management issues
6. Test each component individually
7. Coordinate cut-over timing

### ALECS Approach (Hours)
```
"Import my Cloudflare zone example.com and recreate it on Akamai with better performance"
```

ALECS handles:
- **AXFR zone transfer** from Cloudflare
- **Intelligent rule mapping** (Page Rules → Property Rules)
- **Performance optimization** recommendations
- **Zero-downtime migration** planning
- **Validation and testing** guidance

## The Origin Story (and Why ALECS Matters)

ALECS started as a practical response to real-world complexity. After witnessing countless teams struggle with translating business needs into complex API and Terraform setups, I realized infrastructure management needed genuine simplification—not just shifting complexity around.

Anthropic's MCP offered a practical way forward: instead of complicated scripts or dashboards, just tell the system your intentions directly.

## My AI-Assisted Development Journey

To rapidly prototype ALECS, I used Claude Code integrated into VS Code, what a game changer! Long live the robots!

- Claude instantly analyzed complex API schemas.
- It handled authentication, error recovery, and API integration.
- ALECS was built in days instead of months.

This approach demonstrates the revolutionary speed and accuracy possible when humans collaborate effectively with AI.

## Under the Hood: How ALECS Actually Works

ALECS is architected as a sophisticated MCP server with modular tools for different Akamai services. Here's what makes it special:

### Rich, Contextual Responses
Unlike traditional APIs that return raw JSON, ALECS provides formatted, actionable responses:

```
✅ **Property Created Successfully!**

## Property Details
- **Name:** example.com
- **Property ID:** `prp_123456`
- **Product:** Ion (prd_fresca)
- **Status:** 🔵 NEW (Not yet activated)

## Required Next Steps

### 1. Create Edge Hostname
`"Create edge hostname for property prp_123456"`

### 2. Configure Origin Server  
`"Update property prp_123456 to use origin server origin.example.com"`

### 3. Activate to Staging
`"Activate property prp_123456 to staging"`
```

### Modular Tool Architecture

ALECS implements 30+ specialized tools across key domains:

```
/src/tools/
├── property-management-tools.ts    # Core CDN functionality
├── dns-migration-tools.ts          # Zone transfers & DNS management  
├── certificate-enrollment-tools.ts # SSL/TLS automation
├── fastpurge-tools.ts             # Content invalidation
├── bulk-operations-manager.ts      # Multi-property operations
├── security/                      # WAF & protection tools
└── analysis/                      # Performance & optimization
```

## See ALECS in Action

### Repository Architecture

![ALECS GitHub Repository Overview](/images/alecs-screenshots/repo-overview.png)

The repository showcases enterprise-grade architecture:
- **TypeScript throughout** for reliability and maintainability
- **Comprehensive testing** with Jest and CI/CD
- **Modular design** allowing easy extension
- **Rich documentation** with setup guides and examples

### Code Quality Highlights

![Source Code Structure](/images/alecs-screenshots/source-structure.png)

Key architectural decisions that differentiate ALECS:
- **Account-aware operations** for agency/consultant use cases
- **Progressive disclosure** of complexity
- **Intelligent error handling** with actionable guidance
- **Context preservation** across multi-step operations

### Live Demo Video

Watch ALECS in action as we demonstrate conversational infrastructure management with Claude:

<!-- Video placeholder -->
<div class="video-container aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center mb-8">
  <video id="alecs-demo" class="w-full h-full rounded-lg" controls preload="metadata">
    <source src="/videos/alecs-demo.webm" type="video/webm">
    <source src="/videos/alecs-demo.mp4" type="video/mp4">
    <p>Your browser doesn't support HTML5 video. <a href="/videos/alecs-demo.mp4">Download the video</a>.</p>
  </video>
</div>

## Getting Started: From Zero to Conversational Infrastructure

Setting up ALECS is intentionally simple—no complex state management or configuration languages to learn.

### Prerequisites
- Node.js 18+ and npm
- Akamai EdgeGrid credentials in `.edgerc` file
- Claude Desktop (for the best conversational experience)

### Installation
```bash
# Install ALECS globally
npm install -g alecs-mcp-server-akamai

# Or run directly with npx
npx alecs-mcp-server-akamai
```

### Claude Desktop Integration
Add to your Claude Desktop configuration:
```json
{
  "mcpServers": {
    "alecs": {
      "command": "npx",
      "args": ["alecs-mcp-server-akamai"],
      "env": {}
    }
  }
}
```

### Your First Conversation
Once connected, start with:
```
"List my Akamai properties"
```

ALECS will guide you through authentication setup if needed and show you what's possible with your specific account configuration.

## Roadmap: Where ALECS is Heading

### Phase 1: Core Foundation ✅
- ✅ Property management (CRUD, activation, cloning)
- ✅ DNS migration tools (AXFR, zone parsing)
- ✅ Certificate enrollment (DV automation)
- ✅ Multi-account support for agencies
- ✅ FastPurge integration

### Phase 2: Security & Performance (In Progress)
- 🔄 App & API Protection (WAF) management
- 🔄 Bot Manager configuration
- 🔄 Network Lists for IP/geo blocking
- 🔄 Image & Video Manager policies
- 🔄 Advanced performance analytics

### Phase 3: Enterprise Integration (Q2 2025)
- 📅 Identity & Access Management
- 📅 Advanced EdgeWorkers deployment
- 📅 Terraform export capabilities
- 📅 Monitoring & alerting integration
- 📅 Cost optimization recommendations

### Phase 4: Ecosystem Expansion (Q3 2025)
- 📅 AWS integration (CloudFront, S3, Route53)
- 📅 Azure CDN management
- 📅 Google Cloud CDN support
- 📅 Advanced Cloudflare migration tools
- 📅 Synthetic monitoring integration

## Why This Matters: The Bigger Picture

ALECS isn't just about Akamai—it's about proving that **infrastructure management can be intuitive**. We're demonstrating that the future of ops isn't more YAML files or complex state management, but natural language interfaces that understand intent.

The traditional approach forces you to become an expert in every tool. The conversational approach lets tools become experts in serving your intent.

### Community & Contribution

ALECS succeeds when it solves real problems for real teams. The project needs:

- **User feedback** on conversational patterns that feel natural
- **Feature requests** for specific workflows you want automated  
- **Integration ideas** for other MCP tools and platforms
- **Documentation improvements** to help teams adopt faster

### Get Started Today

- 🔗 **GitHub Repository**: https://github.com/acedergren/alecs-mcp-server-akamai
- 📚 **Documentation**: Complete setup guides and examples
- 💬 **Discussions**: Share your use cases and feature requests
- 🐛 **Issues**: Report bugs or request enhancements
- 🌟 **Star the repo** if ALECS solves problems for your team

Join us in building the future of conversational infrastructure. Let's prove that managing complex systems doesn't have to be complex.