/**
 * Types for the Gaming RSS Feed Collector
 */

/**
 * Represents a feed source configuration
 */
export interface FeedSource {
  name: string;
  url: string;
  website: string;
  description: string;
  category?: string[];
}

/**
 * Represents a parsed feed item
 */
export interface FeedItem {
  title: string;
  description: string;
  content?: string;
  link: string;
  pubDate: Date;
  source: {
    name: string;
    url: string;
  };
  image?: string;
  categories?: string[];
}

/**
 * Options for fetching feeds
 */
export interface FetchOptions {
  timeout?: number;
  cacheTime?: number;
  concurrent?: boolean;
}

/**
 * Options for retrieving news
 */
export interface NewsOptions {
  includeSources?: string[];
  excludeSources?: string[];
  sortBy?: 'date' | 'source';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Options for searching news
 */
export interface SearchOptions extends NewsOptions {
  inTitle?: boolean;
  inContent?: boolean;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  enabled: boolean;
  ttl: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of items to cache
}
