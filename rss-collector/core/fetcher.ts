/**
 * Core fetcher module for the Gaming RSS Feed Collector
 * Responsible for fetching RSS feeds from configured sources
 */

import { FeedSource, FeedItem, FetchOptions } from "../types.ts";

/**
 * Fetches a single RSS feed from the given URL
 * 
 * @param url The URL of the RSS feed to fetch
 * @param options Fetch options
 * @returns The raw XML content of the feed
 */
export async function fetchFeed(url: string, options: FetchOptions = {}): Promise<string> {
  const timeout = options.timeout || 10000; // Default timeout: 10 seconds
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        "User-Agent": "Gaming RSS Feed Collector/1.0"
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }
    
    return await response.text();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Fetch timeout after ${timeout}ms: ${url}`);
    }
    throw new Error(`Error fetching feed ${url}: ${error.message}`);
  }
}

/**
 * Fetches multiple RSS feeds concurrently
 * 
 * @param sources Array of feed sources to fetch
 * @param options Fetch options
 * @returns Object mapping source names to their raw XML content
 */
export async function fetchFeeds(
  sources: FeedSource[], 
  options: FetchOptions = {}
): Promise<Record<string, string>> {
  const concurrent = options.concurrent !== false; // Default to concurrent fetching
  const results: Record<string, string> = {};
  
  if (concurrent) {
    // Fetch all feeds concurrently
    const fetchPromises = sources.map(async (source) => {
      try {
        const content = await fetchFeed(source.url, options);
        return { name: source.name, content };
      } catch (error) {
        console.error(`Error fetching ${source.name}: ${error.message}`);
        return { name: source.name, content: null };
      }
    });
    
    const fetchResults = await Promise.all(fetchPromises);
    
    // Populate results object
    for (const result of fetchResults) {
      if (result.content !== null) {
        results[result.name] = result.content;
      }
    }
  } else {
    // Fetch feeds sequentially
    for (const source of sources) {
      try {
        results[source.name] = await fetchFeed(source.url, options);
      } catch (error) {
        console.error(`Error fetching ${source.name}: ${error.message}`);
      }
    }
  }
  
  return results;
}

/**
 * Fetches all configured feeds
 * 
 * @param feedsConfig Array of feed sources or path to feeds.json
 * @param options Fetch options
 * @returns Object mapping source names to their raw XML content
 */
export async function fetchAllFeeds(
  feedsConfig: FeedSource[] | string,
  options: FetchOptions = {}
): Promise<Record<string, string>> {
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
  
  return fetchFeeds(sources, options);
}
