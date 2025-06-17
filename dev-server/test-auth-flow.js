#!/usr/bin/env node

/**
 * Test script for GitHub OAuth authentication flow
 * Tests the EdgeWorker logic without browser interaction
 */

import { loadEdgeWorker, executeEdgeWorker, MockIngressClientRequest } from './edgeworker-runtime.js';
import { mockEdgeKV } from './mock-edgekv.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  baseUrl: 'http://localhost:3001',
  testUser: {
    email: 'alex@solutionsedge.io',
    login: 'acedergren'
  }
};

/**
 * Create a mock Express request
 */
function createMockRequest(method, path, headers = {}, body = null) {
  return {
    method,
    protocol: 'http',
    originalUrl: path,
    headers: {
      'host': 'localhost:3001',
      'user-agent': 'test-client',
      ...headers
    },
    body,
    get: (header) => headers[header.toLowerCase()] || 'localhost:3001'
  };
}

/**
 * Test the OAuth initiation flow
 */
async function testOAuthInitiation(edgeworkerModule) {
  console.log('\n🧪 Testing OAuth Initiation...');
  
  const req = createMockRequest('GET', '/editor');
  const response = await executeEdgeWorker(edgeworkerModule, req);
  
  if (response && response.status === 302) {
    const location = response.headers['Location']?.[0];
    if (location && location.includes('github.com/login/oauth/authorize')) {
      console.log('✅ OAuth initiation successful');
      console.log(`   Redirect URL: ${location.substring(0, 80)}...`);
      
      // Extract state parameter
      const url = new URL(location);
      const state = url.searchParams.get('state');
      return state;
    }
  }
  
  console.log('❌ OAuth initiation failed');
  console.log('   Response:', response);
  return null;
}

/**
 * Test protected route without authentication
 */
async function testProtectedRoute(edgeworkerModule) {
  console.log('\n🧪 Testing Protected Route (no auth)...');
  
  const req = createMockRequest('GET', '/api/user');
  const response = await executeEdgeWorker(edgeworkerModule, req);
  
  if (response && response.status === 302) {
    console.log('✅ Protected route correctly redirects to OAuth');
  } else {
    console.log('❌ Protected route should redirect to OAuth');
    console.log('   Response:', response);
  }
}

/**
 * Test API endpoints
 */
async function testAPIEndpoints(edgeworkerModule) {
  console.log('\n🧪 Testing API Endpoints...');
  
  // Test health endpoint (should work without auth)
  const healthReq = createMockRequest('GET', '/api/health');
  const healthResponse = await executeEdgeWorker(edgeworkerModule, healthReq);
  
  if (healthResponse && healthResponse.status === 200) {
    console.log('✅ Health API endpoint working');
    console.log('   Response:', JSON.parse(healthResponse.body).data);
  } else {
    console.log('❌ Health API endpoint failed');
  }
}

/**
 * Test session validation
 */
async function testSessionValidation(edgeworkerModule) {
  console.log('\n🧪 Testing Session Validation...');
  
  // Create a test session
  const sessionId = 'test_session_' + Date.now();
  const session = {
    userId: TEST_CONFIG.testUser.login,
    email: TEST_CONFIG.testUser.email,
    token: 'test_token',
    expiresAt: Date.now() + 3600000, // 1 hour
    createdAt: Date.now(),
    userInfo: {
      login: TEST_CONFIG.testUser.login,
      email: TEST_CONFIG.testUser.email,
      id: 12345,
      name: 'Test User',
      avatar_url: 'https://github.com/test.png'
    }
  };
  
  // Store session in mock EdgeKV
  await mockEdgeKV.put(`solutionsedge:auth:session:${sessionId}`, JSON.stringify(session));
  
  // Test authenticated request
  const req = createMockRequest('GET', '/api/user', {
    'cookie': `session_id=${sessionId}`
  });
  
  const response = await executeEdgeWorker(edgeworkerModule, req);
  
  if (response && response.status === 200) {
    console.log('✅ Session validation successful');
    const body = JSON.parse(response.body);
    console.log('   User:', body.data.user.login);
  } else {
    console.log('❌ Session validation failed');
    console.log('   Response:', response);
  }
}

/**
 * Test EdgeKV functionality
 */
async function testEdgeKV() {
  console.log('\n🧪 Testing EdgeKV Mock...');
  
  // Test basic operations
  await mockEdgeKV.put('test:group:key1', 'value1');
  const value1 = await mockEdgeKV.get('test:group:key1');
  
  if (value1 === 'value1') {
    console.log('✅ EdgeKV basic operations working');
  } else {
    console.log('❌ EdgeKV basic operations failed');
  }
  
  // Test TTL
  await mockEdgeKV.put('test:group:key2', 'value2', { ttl: 1 });
  setTimeout(async () => {
    const value2 = await mockEdgeKV.get('test:group:key2');
    if (value2 === null) {
      console.log('✅ EdgeKV TTL working');
    } else {
      console.log('❌ EdgeKV TTL failed');
    }
  }, 1100);
}

/**
 * Test static content pass-through
 */
async function testStaticPassthrough(edgeworkerModule) {
  console.log('\n🧪 Testing Static Content Pass-through...');
  
  const req = createMockRequest('GET', '/');
  const response = await executeEdgeWorker(edgeworkerModule, req);
  
  if (response === null) {
    console.log('✅ Static content correctly passes through');
  } else {
    console.log('❌ Static content should pass through');
    console.log('   Response:', response);
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log('🧪 Starting EdgeWorker Authentication Tests');
  console.log('═══════════════════════════════════════════════');
  
  try {
    // Load EdgeWorker
    const edgeworkerPath = join(__dirname, '../edgeworkers/auth-gateway/src/main.js');
    const edgeworkerModule = await loadEdgeWorker(edgeworkerPath);
    console.log('✅ EdgeWorker loaded successfully');
    
    // Set test environment
    process.env.GITHUB_CLIENT_ID = 'test_client_id';
    process.env.GITHUB_CLIENT_SECRET = 'test_client_secret';
    
    // Run tests
    await testEdgeKV();
    await testStaticPassthrough(edgeworkerModule);
    await testProtectedRoute(edgeworkerModule);
    const state = await testOAuthInitiation(edgeworkerModule);
    await testAPIEndpoints(edgeworkerModule);
    await testSessionValidation(edgeworkerModule);
    
    console.log('\n🎉 All tests completed!');
    console.log('═══════════════════════════════════════════════');
    
    // Show EdgeKV stats
    console.log('\n📊 EdgeKV Stats:');
    console.log(mockEdgeKV.getStats());
    
  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}