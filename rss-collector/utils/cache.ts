/**
 * Cache utility for the Gaming RSS Feed Collector
 * Provides caching mechanism to avoid excessive requests
 */

import { CacheConfig } from "../types.ts";

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

/**
 * Simple in-memory cache implementation
 */
export class Cache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private config: CacheConfig;
  
  /**
   * Creates a new cache instance
   * 
   * @param config Cache configuration
   */
  constructor(config: CacheConfig) {
    this.cache = new Map<string, CacheEntry<T>>();
    this.config = {
      enabled: config.enabled !== false,
      ttl: config.ttl || 5 * 60 * 1000, // Default: 5 minutes
      maxSize: config.maxSize || 100
    };
  }
  
  /**
   * Gets a value from the cache
   * 
   * @param key Cache key
   * @returns Cached value or undefined if not found or expired
   */
  get(key: string): T | undefined {
    if (!this.config.enabled) {
      return undefined;
    }
    
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    const now = Date.now();
    
    // Check if entry has expired
    if (now - entry.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }
  
  /**
   * Sets a value in the cache
   * 
   * @param key Cache key
   * @param value Value to cache
   */
  set(key: string, value: T): void {
    if (!this.config.enabled) {
      return;
    }
    
    // Enforce max size limit
    if (this.cache.size >= this.config.maxSize!) {
      this.evictOldest();
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  /**
   * Removes a value from the cache
   * 
   * @param key Cache key
   * @returns Whether the key was found and removed
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Gets the number of entries in the cache
   */
  get size(): number {
    return this.cache.size;
  }
  
  /**
   * Evicts the oldest entry from the cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}
