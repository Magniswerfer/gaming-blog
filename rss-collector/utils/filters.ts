/**
 * Filter utilities for the Gaming RSS Feed Collector
 * Provides functions to filter news items
 */

import { FeedItem, NewsOptions } from "../types.ts";

/**
 * Filters feed items based on provided options
 * 
 * @param items Array of feed items to filter
 * @param options Filter options
 * @returns Filtered array of feed items
 */
export function filterItems(items: FeedItem[], options: NewsOptions = {}): FeedItem[] {
  let filtered = [...items];
  
  // Filter by included sources
  if (options.includeSources && options.includeSources.length > 0) {
    filtered = filtered.filter(item => 
      options.includeSources!.includes(item.source.name)
    );
  }
  
  // Filter by excluded sources
  if (options.excludeSources && options.excludeSources.length > 0) {
    filtered = filtered.filter(item => 
      !options.excludeSources!.includes(item.source.name)
    );
  }
  
  return filtered;
}

/**
 * Filters feed items by date range
 * 
 * @param items Array of feed items to filter
 * @param startDate Start date of the range (inclusive)
 * @param endDate End date of the range (inclusive)
 * @returns Filtered array of feed items
 */
export function filterByDateRange(
  items: FeedItem[], 
  startDate: Date, 
  endDate: Date = new Date()
): FeedItem[] {
  return items.filter(item => {
    const pubDate = item.pubDate;
    return pubDate >= startDate && pubDate <= endDate;
  });
}

/**
 * Filters feed items by keywords in title or content
 * 
 * @param items Array of feed items to filter
 * @param keywords Keywords to search for
 * @param searchInContent Whether to search in content as well (default: true)
 * @returns Filtered array of feed items
 */
export function filterByKeywords(
  items: FeedItem[], 
  keywords: string[], 
  searchInContent = true
): FeedItem[] {
  if (!keywords || keywords.length === 0) {
    return items;
  }
  
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  
  return items.filter(item => {
    // Check title
    const title = item.title.toLowerCase();
    if (lowerKeywords.some(keyword => title.includes(keyword))) {
      return true;
    }
    
    // Check description
    const description = item.description.toLowerCase();
    if (lowerKeywords.some(keyword => description.includes(keyword))) {
      return true;
    }
    
    // Check content if available and enabled
    if (searchInContent && item.content) {
      const content = item.content.toLowerCase();
      if (lowerKeywords.some(keyword => content.includes(keyword))) {
        return true;
      }
    }
    
    return false;
  });
}

/**
 * Removes duplicate feed items
 * 
 * @param items Array of feed items
 * @returns Array with duplicates removed
 */
export function removeDuplicates(items: FeedItem[]): FeedItem[] {
  const seen = new Set<string>();
  
  return items.filter(item => {
    // Use title and link as a unique identifier
    const key = `${item.title}|${item.link}`;
    
    if (seen.has(key)) {
      return false;
    }
    
    seen.add(key);
    return true;
  });
}
