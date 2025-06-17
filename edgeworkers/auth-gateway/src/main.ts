/**
 * GitHub OAuth Authentication EdgeWorker for Solutions Edge
 * 
 * This EdgeWorker provides GitHub OAuth authentication for the Solutions Edge
 * editor, ensuring only authorized users can access the content management system.
 * 
 * Features:
 * - GitHub OAuth 2.0 flow
 * - Session management via EdgeKV
 * - Repository permission validation
 * - Content API endpoints
 * - Static editor serving
 */

import { EdgeKV } from './edgekv.js';
import { 
  GitHubUser, 
  Session, 
  OAuthTokenResponse, 
  AuthConfig, 
  ValidationResult,
  APIResponse,
  ContentDraft,
  GitHubFileContent
} from './types.js';

class GitHubAuthGateway {
  private edgeKV: EdgeKV;
  private config: AuthConfig;

  constructor() {
    // Initialize EdgeKV for session storage
    this.edgeKV = new EdgeKV({ 
      namespace: 'solutionsedge', 
      group: 'auth' 
    });

    // Configuration from Property Manager variables
    this.config = {
      clientId: PMUSER_GITHUB_CLIENT_ID || '',
      clientSecret: PMUSER_GITHUB_CLIENT_SECRET || '',
      allowedEmail: 'alex@solutionsedge.io',
      repoOwner: 'acedergren',
      repoName: 'solutionsedge-blog',
      sessionTTL: 24 * 60 * 60, // 24 hours in seconds
      stateTTL: 10 * 60 // 10 minutes in seconds
    };
  }

  /**
   * Main EdgeWorker entry point
   */
  async onClientRequest(request: EW.IngressClientRequest): Promise<EW.IngressRequestResponse | void> {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Handle OAuth callback
      if (path === '/auth/github/callback') {
        return await this.handleOAuthCallback(request);
      }

      // Handle logout
      if (path === '/auth/logout') {
        return await this.handleLogout(request);
      }

      // Check if route requires authentication
      if (this.isProtectedRoute(path)) {
        const validation = await this.validateSession(request);
        
        if (!validation.valid) {
          return this.initiateOAuth(url);
        }

        // Serve protected content
        if (path === '/editor' || path === '/editor/') {
          return this.serveEditor();
        }

        // Handle API endpoints
        if (path.startsWith('/api/')) {
          return await this.handleAPI(request, validation.session!);
        }
      }

      // Let static content pass through to origin
      return;

    } catch (error) {
      console.error('EdgeWorker error:', error);
      return this.errorResponse('Internal server error', 500);
    }
  }

  /**
   * Check if a route requires authentication
   */
  private isProtectedRoute(path: string): boolean {
    const protectedPaths = [
      '/editor',
      '/api/'
    ];
    
    return protectedPaths.some(protectedPath => 
      path.startsWith(protectedPath)
    );
  }

  /**
   * Validate user session from cookie
   */
  private async validateSession(request: EW.IngressClientRequest): Promise<ValidationResult> {
    try {
      const sessionId = this.getSessionCookie(request);
      if (!sessionId) {
        return { valid: false, error: 'No session cookie' };
      }

      const sessionData = await this.edgeKV.get(`session:${sessionId}`);
      if (!sessionData) {
        return { valid: false, error: 'Session not found' };
      }

      const session: Session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (session.expiresAt < Date.now()) {
        await this.edgeKV.delete(`session:${sessionId}`);
        return { valid: false, error: 'Session expired' };
      }

      return { valid: true, session };

    } catch (error) {
      console.error('Session validation error:', error);
      return { valid: false, error: 'Session validation failed' };
    }
  }

  /**
   * Initiate GitHub OAuth flow
   */
  private initiateOAuth(currentUrl: URL): EW.IngressRequestResponse {
    const state = this.generateSecureToken();
    const redirectUri = `${currentUrl.origin}/auth/github/callback`;
    
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', this.config.clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', 'user:email repo');
    authUrl.searchParams.set('state', state);

    // Store state for validation (short TTL)
    this.edgeKV.put(`state:${state}`, 'valid', { ttl: this.config.stateTTL });

    return {
      status: 302,
      headers: {
        'Location': [authUrl.toString()],
        'Set-Cookie': [
          `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Max-Age=${this.config.stateTTL}`
        ]
      }
    };
  }

  /**
   * Handle OAuth callback from GitHub
   */
  private async handleOAuthCallback(request: EW.IngressClientRequest): Promise<EW.IngressRequestResponse> {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const storedState = this.getStateCookie(request);

      // Validate state parameter (CSRF protection)
      if (!state || !storedState || state !== storedState) {
        return this.errorResponse('Invalid state parameter - possible CSRF attack');
      }

      // Verify state exists in EdgeKV
      const stateExists = await this.edgeKV.get(`state:${state}`);
      if (!stateExists) {
        return this.errorResponse('State expired or invalid');
      }

      if (!code) {
        return this.errorResponse('No authorization code received');
      }

      // Exchange code for access token
      const tokenResponse = await this.exchangeCodeForToken(code, request.url);
      if (!tokenResponse.access_token) {
        console.error('Token exchange failed:', tokenResponse);
        return this.errorResponse('Failed to exchange code for token');
      }

      // Get user information
      const userInfo = await this.getGitHubUserInfo(tokenResponse.access_token);
      if (!userInfo) {
        return this.errorResponse('Failed to get user information');
      }

      // Validate user access
      const hasAccess = await this.validateUserAccess(userInfo, tokenResponse.access_token);
      if (!hasAccess) {
        return this.errorResponse('Access denied: insufficient permissions');
      }

      // Create session
      const sessionId = this.generateSessionId();
      const session: Session = {
        userId: userInfo.login,
        email: userInfo.email,
        token: tokenResponse.access_token,
        expiresAt: Date.now() + (this.config.sessionTTL * 1000),
        createdAt: Date.now(),
        userInfo
      };

      await this.edgeKV.put(
        `session:${sessionId}`, 
        JSON.stringify(session), 
        { ttl: this.config.sessionTTL }
      );

      // Clean up state
      await this.edgeKV.delete(`state:${state}`);

      return {
        status: 302,
        headers: {
          'Location': ['/editor'],
          'Set-Cookie': [
            `session_id=${sessionId}; HttpOnly; Secure; SameSite=Lax; Max-Age=${this.config.sessionTTL}`,
            `oauth_state=; HttpOnly; Secure; SameSite=Lax; Max-Age=0` // Clear state cookie
          ]
        }
      };

    } catch (error) {
      console.error('OAuth callback error:', error);
      return this.errorResponse('Authentication failed');
    }
  }

  /**
   * Exchange OAuth code for access token
   */
  private async exchangeCodeForToken(code: string, redirectUri: string): Promise<OAuthTokenResponse> {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code: code,
        redirect_uri: new URL('/auth/github/callback', redirectUri).toString()
      })
    });

    return await response.json() as OAuthTokenResponse;
  }

  /**
   * Get GitHub user information
   */
  private async getGitHubUserInfo(token: string): Promise<GitHubUser | null> {
    try {
      const [userResponse, emailResponse] = await Promise.all([
        fetch('https://api.github.com/user', {
          headers: { 'Authorization': `token ${token}` }
        }),
        fetch('https://api.github.com/user/emails', {
          headers: { 'Authorization': `token ${token}` }
        })
      ]);

      if (!userResponse.ok || !emailResponse.ok) {
        return null;
      }

      const user = await userResponse.json();
      const emails = await emailResponse.json();

      // Get primary email
      const primaryEmail = emails.find((email: any) => email.primary)?.email || user.email;

      return {
        login: user.login,
        email: primaryEmail,
        id: user.id,
        name: user.name,
        avatar_url: user.avatar_url
      };

    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  /**
   * Validate user has required access
   */
  private async validateUserAccess(user: GitHubUser, token: string): Promise<boolean> {
    try {
      // Check email domain
      if (user.email !== this.config.allowedEmail) {
        console.log(`Access denied for email: ${user.email}`);
        return false;
      }

      // Check repository access
      const repoResponse = await fetch(
        `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/collaborators/${user.login}`,
        {
          headers: { 'Authorization': `token ${token}` }
        }
      );

      // 204 = user is a collaborator, 404 = not found/no access
      if (repoResponse.status !== 204) {
        console.log(`No repository access for user: ${user.login}`);
        return false;
      }

      return true;

    } catch (error) {
      console.error('Access validation error:', error);
      return false;
    }
  }

  /**
   * Handle logout
   */
  private async handleLogout(request: EW.IngressClientRequest): Promise<EW.IngressRequestResponse> {
    const sessionId = this.getSessionCookie(request);
    
    if (sessionId) {
      await this.edgeKV.delete(`session:${sessionId}`);
    }

    return {
      status: 302,
      headers: {
        'Location': ['/'],
        'Set-Cookie': [
          `session_id=; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
        ]
      }
    };
  }

  /**
   * Serve the editor HTML
   */
  private serveEditor(): EW.IngressRequestResponse {
    const editorHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Content Editor - The Solutions Edge</title>
    <link rel="stylesheet" href="/assets/editor.css">
    <link rel="icon" href="/favicon.svg">
</head>
<body class="editor-page">
    <div id="editor-root">
        <div class="loading-state">
            <div class="se-logo">
                <div class="logo-icon">SE</div>
                <span class="logo-text">Solutions Edge Editor</span>
            </div>
            <div class="loading-spinner"></div>
            <p>Loading editor...</p>
        </div>
    </div>
    
    <script type="module" src="/assets/editor.js"></script>
</body>
</html>`;

    return {
      status: 200,
      headers: {
        'Content-Type': ['text/html; charset=utf-8'],
        'Cache-Control': ['no-cache, no-store, must-revalidate'],
        'X-Frame-Options': ['DENY'],
        'X-Content-Type-Options': ['nosniff']
      },
      body: editorHTML
    };
  }

  /**
   * Handle API endpoints
   */
  private async handleAPI(request: EW.IngressClientRequest, session: Session): Promise<EW.IngressRequestResponse> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      switch (path) {
        case '/api/user':
          return this.handleUserAPI(session);
        case '/api/content':
          return await this.handleContentAPI(request, session);
        case '/api/health':
          return this.handleHealthAPI();
        default:
          return this.jsonResponse({ success: false, error: 'API endpoint not found' }, 404);
      }
    } catch (error) {
      console.error('API error:', error);
      return this.jsonResponse({ success: false, error: 'Internal API error' }, 500);
    }
  }

  /**
   * Handle user info API
   */
  private handleUserAPI(session: Session): EW.IngressRequestResponse {
    return this.jsonResponse({
      success: true,
      data: {
        user: session.userInfo,
        session: {
          expiresAt: session.expiresAt,
          createdAt: session.createdAt
        }
      }
    });
  }

  /**
   * Handle content management API
   */
  private async handleContentAPI(request: EW.IngressClientRequest, session: Session): Promise<EW.IngressRequestResponse> {
    if (request.method === 'POST') {
      const body = await request.text();
      const content: ContentDraft = JSON.parse(body);
      
      const result = await this.createContent(content, session);
      return this.jsonResponse(result, result.success ? 201 : 400);
    }
    
    return this.jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  /**
   * Handle health check API
   */
  private handleHealthAPI(): EW.IngressRequestResponse {
    return this.jsonResponse({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  }

  /**
   * Create new content
   */
  private async createContent(content: ContentDraft, session: Session): Promise<APIResponse> {
    try {
      // Generate draft ID
      const draftId = this.generateId();
      const now = new Date().toISOString();
      
      const draft: ContentDraft = {
        ...content,
        id: draftId,
        author: session.email,
        createdAt: now,
        status: 'draft'
      };

      // Store draft in EdgeKV
      await this.edgeKV.put(
        `draft:${draftId}`, 
        JSON.stringify(draft), 
        { ttl: 7 * 24 * 60 * 60 } // 7 days
      );

      // Create file in GitHub repository
      await this.createGitHubFile(draft, session.token);

      return { 
        success: true, 
        data: { draftId },
        message: 'Content created successfully' 
      };

    } catch (error) {
      console.error('Content creation error:', error);
      return { 
        success: false, 
        error: 'Failed to create content' 
      };
    }
  }

  /**
   * Create file in GitHub repository
   */
  private async createGitHubFile(content: ContentDraft, token: string): Promise<void> {
    const filename = `src/content/articles/${content.slug || content.id}.md`;
    const markdownContent = this.convertToMarkdown(content);

    const fileData: GitHubFileContent = {
      message: `Add new article: ${content.title}`,
      content: btoa(markdownContent), // Base64 encode
      branch: 'main'
    };

    const response = await fetch(
      `https://api.github.com/repos/${this.config.repoOwner}/${this.config.repoName}/contents/${filename}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fileData)
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`GitHub API error: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Convert content to markdown format
   */
  private convertToMarkdown(content: ContentDraft): string {
    return `---
title: "${content.title}"
date: ${content.createdAt}
tags: [${content.tags.map(tag => `"${tag}"`).join(', ')}]
excerpt: "${content.excerpt || ''}"
author: "${content.author}"
---

${content.body || ''}`;
  }

  // Utility methods
  private getSessionCookie(request: EW.IngressClientRequest): string | null {
    const cookie = request.getHeader('Cookie')?.[0];
    return this.parseCookie(cookie, 'session_id');
  }

  private getStateCookie(request: EW.IngressClientRequest): string | null {
    const cookie = request.getHeader('Cookie')?.[0];
    return this.parseCookie(cookie, 'oauth_state');
  }

  private parseCookie(cookieHeader: string | undefined, name: string): string | null {
    if (!cookieHeader) return null;
    const match = cookieHeader.match(new RegExp(`${name}=([^;]+)`));
    return match ? match[1] : null;
  }

  private generateSecureToken(): string {
    return crypto.getRandomValues(new Uint8Array(32))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  }

  private generateSessionId(): string {
    return 'sess_' + this.generateSecureToken();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private jsonResponse(data: any, status: number = 200): EW.IngressRequestResponse {
    return {
      status,
      headers: {
        'Content-Type': ['application/json'],
        'Cache-Control': ['no-cache']
      },
      body: JSON.stringify(data)
    };
  }

  private errorResponse(message: string, status: number = 400): EW.IngressRequestResponse {
    const errorHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authentication Error - Solutions Edge</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 2rem; }
        .error-container { max-width: 500px; margin: 0 auto; text-align: center; }
        .logo { font-size: 2rem; font-weight: bold; color: #3b82f6; margin-bottom: 1rem; }
        .error-message { color: #dc2626; margin: 1rem 0; }
        .home-link { display: inline-block; margin-top: 1rem; color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="logo">SE</div>
        <h1>Authentication Error</h1>
        <p class="error-message">${message}</p>
        <a href="/" class="home-link">← Return to Solutions Edge</a>
    </div>
</body>
</html>`;

    return {
      status,
      headers: { 'Content-Type': ['text/html; charset=utf-8'] },
      body: errorHTML
    };
  }
}

// EdgeWorker entry points
export function onClientRequest(request: EW.IngressClientRequest): Promise<EW.IngressRequestResponse | void> {
  const gateway = new GitHubAuthGateway();
  return gateway.onClientRequest(request);
}