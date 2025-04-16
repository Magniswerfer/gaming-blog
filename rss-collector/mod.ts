/**
 * Main entry point for the Gaming RSS Feed Collector
 * Exports all public APIs
 */

import {
  FeedItem,
  FeedSource,
  FetchOptions,
  NewsOptions,
  SearchOptions,
} from "./types.ts";
import { fetchAllFeeds, fetchFeed, fetchFeeds } from "./core/fetcher.ts";
import { parseRSS } from "./core/parser.ts";
import { normalizeItems } from "./core/normalizer.ts";
import { Cache } from "./utils/cache.ts";
import {
  filterByDateRange,
  filterByKeywords,
  filterItems,
  removeDuplicates,
} from "./utils/filters.ts";
import {
  sortByDate,
  sortByRelevance,
  sortBySource,
  sortItems,
} from "./utils/sorters.ts";

// Create a cache for feed data
const feedCache = new Cache<FeedItem[]>({
  enabled: true,
  ttl: 10 * 60 * 1000, // 10 minutes
  maxSize: 50,
});

/**
 * Fetches and processes feeds from the specified sources
 *
 * @param sources Array of feed sources to fetch
 * @param options Fetch options
 * @returns Array of processed feed items
 */
export async function getFeeds(
  sources: FeedSource[],
  options: FetchOptions = {},
): Promise<FeedItem[]> {
  // Generate cache key based on sources
  const cacheKey = sources.map((s) => s.name).join(",");

  // Check cache first
  const cachedItems = feedCache.get(cacheKey);
  if (cachedItems) {
    return cachedItems;
  }

  // Fetch feeds
  const feedsContent = await fetchFeeds(sources, options);

  // Parse and normalize feeds
  const allItems: FeedItem[] = [];

  for (const [name, content] of Object.entries(feedsContent)) {
    const source = sources.find((s) => s.name === name);

    if (source && content) {
      const parsedItems = parseRSS(content, source);
      const normalizedItems = normalizeItems(parsedItems);
      allItems.push(...normalizedItems);
    }
  }

  // Remove duplicates
  const uniqueItems = removeDuplicates(allItems);

  // Cache the results
  feedCache.set(cacheKey, uniqueItems);

  return uniqueItems;
}

/**
 * Fetches and processes all configured feeds
 *
 * @param feedsConfig Array of feed sources or path to feeds.json
 * @param options Fetch options
 * @returns Array of processed feed items
 */
export async function getAllFeeds(
  feedsConfig: FeedSource[] | string,
  options: FetchOptions = {},
): Promise<FeedItem[]> {
  let sources: FeedSource[];

  if (typeof feedsConfig === "string") {
    // Load feeds from JSON file
    try {
      const text = await Deno.readTextFile(feedsConfig);
      const json = JSON.parse(text);
      sources = json.feeds || [];
    } catch (error) {
      throw new Error(`Error loading feeds configuration: ${error.message}`);
    }
  } else {
    sources = feedsConfig;
  }

  return getFeeds(sources, options);
}

/**
 * Gets the latest news items
 *
 * @param feedsConfig Array of feed sources or path to feeds.json
 * @param count Number of items to return
 * @param options News options
 * @returns Array of latest news items
 */
export async function getLatestNews(
  feedsConfig: FeedSource[] | string,
  count = 10,
  options: NewsOptions = {},
): Promise<FeedItem[]> {
  // Get all feeds
  const allItems = await getAllFeeds(feedsConfig);

  // Filter items
  const filteredItems = filterItems(allItems, options);

  // Sort items by date (newest first)
  const sortedItems = sortItems(filteredItems, {
    sortBy: options.sortBy || "date",
    sortOrder: options.sortOrder || "desc",
  });

  // Return the specified number of items
  return sortedItems.slice(0, count);
}

/**
 * Gets news items by category/tag
 *
 * @param feedsConfig Array of feed sources or path to feeds.json
 * @param category Category to filter by
 * @param count Number of items to return
 * @param options News options
 * @returns Array of news items in the specified category
 */
export async function getNewsByCategory(
  feedsConfig: FeedSource[] | string,
  category: string,
  count = 10,
  options: NewsOptions = {},
): Promise<FeedItem[]> {
  // Get all feeds
  const allItems = await getAllFeeds(feedsConfig);

  // Filter items by category
  const categoryItems = allItems.filter((item) =>
    item.categories?.some((cat) => cat.toLowerCase() === category.toLowerCase())
  );

  // Apply additional filters
  const filteredItems = filterItems(categoryItems, options);

  // Sort items
  const sortedItems = sortItems(filteredItems, {
    sortBy: options.sortBy || "date",
    sortOrder: options.sortOrder || "desc",
  });

  // Return the specified number of items
  return sortedItems.slice(0, count);
}

/**
 * Searches for news items matching the query
 *
 * @param feedsConfig Array of feed sources or path to feeds.json
 * @param query Search query
 * @param options Search options
 * @returns Array of matching news items
 */
export async function searchNews(
  feedsConfig: FeedSource[] | string,
  query: string,
  options: SearchOptions = {},
): Promise<FeedItem[]> {
  // Get all feeds
  const allItems = await getAllFeeds(feedsConfig);

  // Split query into keywords
  const keywords = query.toLowerCase().split(/\s+/).filter((k) => k.length > 0);

  // Filter items by keywords
  const searchInContent = options.inContent !== false;
  const matchingItems = filterByKeywords(allItems, keywords, searchInContent);

  // Apply additional filters
  const filteredItems = filterItems(matchingItems, options);

  // Sort by relevance by default for search
  const sortedItems = options.sortBy === "date" || options.sortBy === "source"
    ? sortItems(filteredItems, options)
    : sortByRelevance(filteredItems, keywords);

  return sortedItems;
}

// Export all core functions and utilities
export {
  type FeedItem,
  // Types
  type FeedSource,
  fetchAllFeeds,
  // Core modules
  fetchFeed,
  fetchFeeds,
  type FetchOptions,
  filterByDateRange,
  filterByKeywords,
  // Utility functions
  filterItems,
  type NewsOptions,
  normalizeItems,
  parseRSS,
  removeDuplicates,
  type SearchOptions,
  sortByDate,
  sortByRelevance,
  sortBySource,
  sortItems,
};
