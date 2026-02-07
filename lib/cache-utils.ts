// lib/cache-utils.ts
/**
 * Centralized cache utility for in-memory caching with TTL support
 */

interface CacheEntry<T> {
  value: T;
  expires: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
}

export class CacheManager<T = any> {
  private cache: Map<string, CacheEntry<T>>;
  private stats: CacheStats;
  private defaultTTL: number;

  constructor(defaultTTL: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get a value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if expired
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    this.stats.hits++;
    return entry.value;
  }

  /**
   * Set a value in cache with optional custom TTL
   */
  set(key: string, value: T, ttl?: number): void {
    const expiresIn = ttl ?? this.defaultTTL;
    this.cache.set(key, {
      value,
      expires: Date.now() + expiresIn,
    });
    this.stats.sets++;
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  /**
   * Delete all keys matching a pattern (prefix)
   */
  deletePattern(pattern: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.stats.deletes += count;
    return count;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, sets: 0, deletes: 0 };
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { size: number; hitRate: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate =
      total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) : "0.00";

    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: `${hitRate}%`,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

// Shared cache instances for different data types
export const apiKeyCache = new CacheManager<{ userId: string }>(5 * 60 * 1000); // 5 min
export const snippetCache = new CacheManager<any>(5 * 60 * 1000); // 5 min
export const profileCache = new CacheManager<any>(10 * 60 * 1000); // 10 min
export const groupCache = new CacheManager<any>(5 * 60 * 1000); // 5 min
export const invitationCache = new CacheManager<any>(3 * 60 * 1000); // 3 min
export const authCache = new CacheManager<{ userId: string }>(5 * 60 * 1000); // 5 min

// Periodic cleanup (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      apiKeyCache.cleanup();
      snippetCache.cleanup();
      profileCache.cleanup();
      groupCache.cleanup();
      invitationCache.cleanup();
      authCache.cleanup();
    },
    5 * 60 * 1000,
  );
}
