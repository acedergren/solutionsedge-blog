/**
 * EdgeWorker Runtime Simulation
 * Simulates the EdgeWorker environment for local development
 */

import crypto from 'crypto';
import { EdgeKV } from './mock-edgekv.js';

// Mock EdgeWorker globals
global.crypto = {
  getRandomValues: (array) => {
    const buffer = crypto.randomBytes(array.length);
    for (let i = 0; i < array.length; i++) {
      array[i] = buffer[i];
    }
    return array;
  }
};

global.btoa = (str) => Buffer.from(str, 'binary').toString('base64');
global.atob = (str) => Buffer.from(str, 'base64').toString('binary');

// Mock console for EdgeWorker-style logging
global.console = {
  log: (...args) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [EdgeWorker]`, ...args);
  },
  error: (...args) => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [EdgeWorker] ERROR:`, ...args);
  },
  warn: (...args) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [EdgeWorker] WARN:`, ...args);
  }
};

// Mock fetch for EdgeWorker environment
global.fetch = async (url, options = {}) => {
  console.log(`[EdgeWorker] FETCH ${options.method || 'GET'} ${url}`);
  
  // Use node-fetch for actual HTTP requests
  const { default: fetch } = await import('node-fetch');
  return fetch(url, options);
};

/**
 * Mock EdgeWorker Request object
 */
export class MockIngressClientRequest {
  constructor(expressReq) {
    this.url = `${expressReq.protocol}://${expressReq.get('host')}${expressReq.originalUrl}`;
    this.method = expressReq.method;
    this.headers = {};
    
    // Convert Express headers to EdgeWorker format
    for (const [key, value] of Object.entries(expressReq.headers)) {
      this.headers[key.toLowerCase()] = Array.isArray(value) ? value : [value];
    }
    
    this.body = expressReq.body;
    this._expressReq = expressReq;
  }

  getHeader(name) {
    return this.headers[name.toLowerCase()] || null;
  }

  async text() {
    if (typeof this.body === 'string') {
      return this.body;
    }
    if (typeof this.body === 'object') {
      return JSON.stringify(this.body);
    }
    return '';
  }

  async json() {
    const text = await this.text();
    return JSON.parse(text);
  }
}

/**
 * EdgeWorker Response object
 */
export class MockIngressRequestResponse {
  constructor(response) {
    this.status = response.status || 200;
    this.headers = response.headers || {};
    this.body = response.body || '';
  }

  toExpressResponse(res) {
    // Set status
    res.status(this.status);

    // Set headers
    for (const [key, values] of Object.entries(this.headers)) {
      if (Array.isArray(values)) {
        values.forEach(value => res.append(key, value));
      } else {
        res.set(key, values);
      }
    }

    // Send body
    if (this.body) {
      res.send(this.body);
    } else {
      res.end();
    }
  }
}

/**
 * Load and execute EdgeWorker code
 */
export async function loadEdgeWorker(edgeworkerPath) {
  try {
    // Set up environment variables for EdgeWorker
    global.PMUSER_GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
    global.PMUSER_GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

    // Mock EdgeWorker API
    global.EW = {
      IngressClientRequest: MockIngressClientRequest,
      IngressRequestResponse: MockIngressRequestResponse
    };

    // Create EdgeKV mock
    global.EdgeKV = EdgeKV;

    // Import the EdgeWorker module
    const edgeworkerModule = await import(edgeworkerPath);
    return edgeworkerModule;

  } catch (error) {
    console.error('Failed to load EdgeWorker:', error);
    throw error;
  }
}

/**
 * Execute EdgeWorker function with Express request
 */
export async function executeEdgeWorker(edgeworkerModule, expressReq) {
  try {
    const mockRequest = new MockIngressClientRequest(expressReq);
    
    console.log(`[EdgeWorker] Processing ${mockRequest.method} ${mockRequest.url}`);
    
    // Call the EdgeWorker function
    const result = await edgeworkerModule.onClientRequest(mockRequest);
    
    if (result) {
      return new MockIngressRequestResponse(result);
    }
    
    return null; // Let request pass through to static site

  } catch (error) {
    console.error('[EdgeWorker] Execution error:', error);
    throw error;
  }
}