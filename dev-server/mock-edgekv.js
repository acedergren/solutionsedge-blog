/**
 * Mock EdgeKV implementation for local development
 * Simulates EdgeKV behavior using in-memory storage with TTL
 */

class MockEdgeKV {
  constructor() {
    this.storage = new Map();
    this.ttls = new Map();
    
    // Clean up expired keys every 30 seconds
    setInterval(() => this.cleanup(), 30000);
  }

  /**
   * Store a key-value pair with optional TTL
   */
  async put(key, value, options = {}) {
    try {
      this.storage.set(key, value);
      
      if (options.ttl) {
        const expiresAt = Date.now() + (options.ttl * 1000);
        this.ttls.set(key, expiresAt);
      }
      
      console.log(`[MockEdgeKV] PUT ${key} (TTL: ${options.ttl || 'none'})`);
      return true;
    } catch (error) {
      console.error(`[MockEdgeKV] PUT error for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve a value by key
   */
  async get(key) {
    try {
      // Check if key has expired
      if (this.ttls.has(key)) {
        const expiresAt = this.ttls.get(key);
        if (Date.now() > expiresAt) {
          this.storage.delete(key);
          this.ttls.delete(key);
          console.log(`[MockEdgeKV] GET ${key} - EXPIRED`);
          return null;
        }
      }

      const value = this.storage.get(key);
      console.log(`[MockEdgeKV] GET ${key} - ${value ? 'FOUND' : 'NOT_FOUND'}`);
      return value || null;
    } catch (error) {
      console.error(`[MockEdgeKV] GET error for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete a key
   */
  async delete(key) {
    try {
      const existed = this.storage.has(key);
      this.storage.delete(key);
      this.ttls.delete(key);
      
      console.log(`[MockEdgeKV] DELETE ${key} - ${existed ? 'DELETED' : 'NOT_FOUND'}`);
      return existed;
    } catch (error) {
      console.error(`[MockEdgeKV] DELETE error for ${key}:`, error);
      throw error;
    }
  }

  /**
   * List all keys (for debugging)
   */
  listKeys() {
    return Array.from(this.storage.keys());
  }

  /**
   * Get storage stats (for debugging)
   */
  getStats() {
    return {
      totalKeys: this.storage.size,
      keysWithTTL: this.ttls.size,
      keys: this.listKeys()
    };
  }

  /**
   * Clean up expired keys
   */
  cleanup() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, expiresAt] of this.ttls.entries()) {
      if (now > expiresAt) {
        this.storage.delete(key);
        this.ttls.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[MockEdgeKV] Cleaned up ${cleanedCount} expired keys`);
    }
  }

  /**
   * Clear all data (for testing)
   */
  clear() {
    this.storage.clear();
    this.ttls.clear();
    console.log('[MockEdgeKV] All data cleared');
  }
}

// Create global EdgeKV instance
const mockEdgeKV = new MockEdgeKV();

/**
 * EdgeKV class that mimics the real EdgeKV API
 */
export class EdgeKV {
  constructor(options = {}) {
    this.namespace = options.namespace || 'default';
    this.group = options.group || 'default';
  }

  async put(key, value, options = {}) {
    const fullKey = `${this.namespace}:${this.group}:${key}`;
    return await mockEdgeKV.put(fullKey, value, options);
  }

  async get(key) {
    const fullKey = `${this.namespace}:${this.group}:${key}`;
    return await mockEdgeKV.get(fullKey);
  }

  async delete(key) {
    const fullKey = `${this.namespace}:${this.group}:${key}`;
    return await mockEdgeKV.delete(fullKey);
  }
}

// Export the mock instance for debugging
export { mockEdgeKV };