// Type definitions for GitHub OAuth EdgeWorker

export interface GitHubUser {
  login: string;
  email: string;
  id: number;
  name: string;
  avatar_url: string;
}

export interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string;
}

export interface Session {
  userId: string;
  email: string;
  token: string;
  expiresAt: number;
  createdAt: number;
  userInfo: GitHubUser;
}

export interface OAuthTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
}

export interface AuthConfig {
  clientId: string;
  clientSecret: string;
  allowedEmail: string;
  repoOwner: string;
  repoName: string;
  sessionTTL: number;
  stateTTL: number;
}

export interface ValidationResult {
  valid: boolean;
  session?: Session;
  error?: string;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ContentDraft {
  title: string;
  slug?: string;
  excerpt?: string;
  body: string;
  tags: string[];
  author: string;
  createdAt: string;
  status: 'draft' | 'published';
  id?: string;
}

export interface GitHubFileContent {
  message: string;
  content: string; // Base64 encoded
  branch: string;
  sha?: string; // Required for updates
}