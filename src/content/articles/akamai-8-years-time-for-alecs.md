---
id: 1
title: "Akamai, it's been 8 amazing years… but now it's time we talk about ALECS"
author: "Alexander Cedergren"
date: "2024-05-15"
tags: ["Cloud Infrastructure", "Automation", "AI", "MCP", "Open Source", "DevOps"]
description: "Introducing ALECS—A Launchgrid for Edge & Cloud Services—an open-source experiment leveraging Anthropic's Model Context Protocol to make cloud infrastructure management conversational and intuitive."
excerpt: "Cloud infrastructure management today often feels like navigating a labyrinth of dashboards, scripts, and obscure APIs. What if, instead, your infrastructure was conversational?"
featured: true
---

Cloud infrastructure management today often feels like navigating a labyrinth of dashboards, scripts, and obscure APIs. Infrastructure-as-Code promised simplicity, but in practice, it often just moved complexity into scripts filled with cryptic IDs.

What if, instead, your infrastructure was conversational?

Introducing **ALECS—A Launchgrid for Edge & Cloud Services**—an open-source experiment leveraging Anthropic's Model Context Protocol (MCP). MCP lets AI assistants directly execute API calls through natural language, making complex infrastructure management intuitive and seamless.

## Why ALECS is Powerful

With ALECS, managing your infrastructure becomes as easy as chatting with your favorite AI assistant:

- "Deploy staging to production and update DNS entries."
- "Provision an SSL certificate for our main domain."
- "Purge CDN cache across Akamai and AWS CloudFront simultaneously."

ALECS transparently handles translations from human-friendly names to underlying technical identifiers—no more manually managing IDs in scripts or dashboards.

## Cross-Platform Integration for Seamless Automation

ALECS is built on MCP, meaning it can easily integrate with other MCP-compatible services, creating a unified conversational pipeline:

- **Combine GitHub and Akamai**: "Deploy the latest GitHub release to our Akamai delivery config."
- **Integrate AWS**: "Create a new S3 bucket and configure Akamai CDN for accelerated delivery."

You gain unified, cross-platform control through a single conversational interface, vastly simplifying operational workflows.

## The Origin Story (and Why ALECS Matters)

ALECS started as a practical response to real-world complexity. After witnessing countless teams struggle with translating business needs into complex API and Terraform setups, I realized infrastructure management needed genuine simplification—not just shifting complexity around.

Anthropic's MCP offered a practical way forward: instead of complicated scripts or dashboards, just tell the system your intentions directly.

## My AI-Assisted Development Journey

To rapidly prototype ALECS, I partnered with Claude Code (Anthropic's AI developer):

- Claude instantly analyzed complex API schemas.
- It handled authentication, error recovery, and API integration.
- ALECS was built in days instead of months.

This approach demonstrates the revolutionary speed and accuracy possible when humans collaborate effectively with AI.

## See ALECS in Action

### GitHub Repository

<!-- Placeholder for GitHub screenshots -->
<div class="github-screenshots">
  <img src="/images/alecs-screenshots/repo-overview.png" alt="ALECS GitHub Repository Overview" class="w-full rounded-lg shadow-lg mb-4" />
  <img src="/images/alecs-screenshots/mcp-integration.png" alt="MCP Integration Example" class="w-full rounded-lg shadow-lg mb-4" />
</div>

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

## Roadmap and Community Engagement

ALECS is just beginning. Upcoming modules will enhance analytics, security configuration, and deeper multi-platform integrations. But its true potential depends on community collaboration.

Join in, test it, and help shape the future of conversational infrastructure management.

### Get Started

- 🔗 **GitHub Repository**: https://github.com/acedergren/alecs-mcp-server-akamai
- 📚 **Documentation**: Full setup and usage guides available in the repo
- 💬 **Community**: Join the discussion and contribute your ideas