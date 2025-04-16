/**
 * Sorter utilities for the Gaming RSS Feed Collector
 * Provides functions to sort news items
 */

import { FeedItem, NewsOptions } from "../types.ts";

/**
 * Sorts feed items based on provided options
 * 
 * @param items Array of feed items to sort
 * @param options Sort options
 * @returns Sorted array of feed items
 */
export function sortItems(items: FeedItem[], options: NewsOptions = {}): FeedItem[] {
  const sortBy = options.sortBy || "date";
  const sortOrder = options.sortOrder || "desc";
  
  const sorted = [...items]; // Create a copy to avoid modifying the original
  
  if (sortBy === "date") {
    sorted.sort((a, b) => {
      const dateA = a.pubDate.getTime();
      const dateB = b.pubDate.getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  } else if (sortBy === "source") {
    sorted.sort((a, b) => {
      const sourceA = a.source.name.toLowerCase();
      const sourceB = b.source.name.toLowerCase();
      const comparison = sourceA.localeCompare(sourceB);
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }
  
  return sorted;
}

/**
 * Sorts feed items by publication date
 * 
 * @param items Array of feed items to sort
 * @param ascending Whether to sort in ascending order (default: false)
 * @returns Sorted array of feed items
 */
export function sortByDate(items: FeedItem[], ascending = false): FeedItem[] {
  return sortItems(items, {
    sortBy: "date",
    sortOrder: ascending ? "asc" : "desc"
  });
}

/**
 * Sorts feed items by source name
 * 
 * @param items Array of feed items to sort
 * @param ascending Whether to sort in ascending order (default: true)
 * @returns Sorted array of feed items
 */
export function sortBySource(items: FeedItem[], ascending = true): FeedItem[] {
  return sortItems(items, {
    sortBy: "source",
    sortOrder: ascending ? "asc" : "desc"
  });
}

/**
 * Sorts feed items by relevance to a search query
 * This is a simple implementation that counts keyword occurrences
 * 
 * @param items Array of feed items to sort
 * @param keywords Keywords to calculate relevance for
 * @returns Sorted array of feed items
 */
export function sortByRelevance(items: FeedItem[], keywords: string[]): FeedItem[] {
  if (!keywords || keywords.length === 0) {
    return items;
  }
  
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  
  // Calculate relevance score for each item
  const itemsWithScore = items.map(item => {
    let score = 0;
    
    // Check title (highest weight)
    const title = item.title.toLowerCase();
    lowerKeywords.forEach(keyword => {
      const titleMatches = (title.match(new RegExp(keyword, "g")) || []).length;
      score += titleMatches * 3;
    });
    
    // Check description (medium weight)
    const description = item.description.toLowerCase();
    lowerKeywords.forEach(keyword => {
      const descMatches = (description.match(new RegExp(keyword, "g")) || []).length;
      score += descMatches * 2;
    });
    
    // Check content if available (lowest weight)
    if (item.content) {
      const content = item.content.toLowerCase();
      lowerKeywords.forEach(keyword => {
        const contentMatches = (content.match(new RegExp(keyword, "g")) || []).length;
        score += contentMatches;
      });
    }
    
    return { item, score };
  });
  
  // Sort by score (descending)
  itemsWithScore.sort((a, b) => b.score - a.score);
  
  // Return just the items
  return itemsWithScore.map(({ item }) => item);
}
