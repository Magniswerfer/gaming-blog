/**
 * Core normalizer module for the Gaming RSS Feed Collector
 * Responsible for normalizing data from different feed formats
 */

import { FeedItem } from "../types.ts";

/**
 * Normalizes feed items to ensure consistent format
 * 
 * @param items Array of feed items to normalize
 * @returns Array of normalized feed items
 */
export function normalizeItems(items: FeedItem[]): FeedItem[] {
  return items.map(normalizeItem);
}

/**
 * Normalizes a single feed item
 * 
 * @param item Feed item to normalize
 * @returns Normalized feed item
 */
export function normalizeItem(item: FeedItem): FeedItem {
  // Create a copy of the item to avoid modifying the original
  const normalized: FeedItem = { ...item };
  
  // Ensure title is properly formatted
  normalized.title = cleanText(normalized.title);
  
  // Ensure description is properly formatted
  normalized.description = cleanText(normalized.description);
  
  // Normalize content if available
  if (normalized.content) {
    normalized.content = cleanText(normalized.content);
  }
  
  // Ensure link is an absolute URL
  normalized.link = normalizeUrl(normalized.link);
  
  // Ensure image URL is absolute if available
  if (normalized.image) {
    normalized.image = normalizeUrl(normalized.image);
  }
  
  // Ensure categories are unique if available
  if (normalized.categories && normalized.categories.length > 0) {
    normalized.categories = [...new Set(normalized.categories)];
  }
  
  return normalized;
}

/**
 * Cleans text content by removing excessive whitespace and HTML tags
 * 
 * @param text Text to clean
 * @returns Cleaned text
 */
function cleanText(text: string): string {
  if (!text) return "";
  
  // Remove HTML tags if needed (optional, can be configured)
  // const withoutTags = text.replace(/<[^>]*>/g, ' ');
  
  // Remove excessive whitespace
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Ensures a URL is absolute
 * 
 * @param url URL to normalize
 * @param baseUrl Optional base URL to resolve against
 * @returns Normalized absolute URL
 */
function normalizeUrl(url: string, baseUrl?: string): string {
  if (!url) return "";
  
  try {
    // Check if the URL is already absolute
    new URL(url);
    return url;
  } catch {
    // If URL is relative and we have a base URL, resolve it
    if (baseUrl) {
      try {
        return new URL(url, baseUrl).toString();
      } catch {
        return url; // Return original if resolution fails
      }
    }
    
    return url; // Return original if we can't normalize
  }
}
