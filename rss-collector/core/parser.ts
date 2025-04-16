/**
 * Core parser module for the Gaming RSS Feed Collector
 * Responsible for parsing RSS XML into structured data
 */

import { FeedItem, FeedSource } from "../types.ts";

// Use our custom XML parser instead of DOMParser
import {
  getElementsByTagName,
  getTagContent,
  parseXML,
} from "../utils/xmlParser.ts";

/**
 * Parses RSS XML content into structured data
 * Supports both RSS 2.0 and Atom formats
 *
 * @param xml The raw XML content of the feed
 * @param source The source information for the feed
 * @returns Array of parsed feed items
 */
export function parseRSS(xml: string, source: FeedSource): FeedItem[] {
  try {
    // Parse XML using our custom parser
    const parsedXml = parseXML(xml);

    if (!parsedXml || parsedXml.length === 0) {
      throw new Error("Invalid XML document");
    }

    // Check if this is an Atom feed
    const rootTag = parsedXml[0]?.tag.toLowerCase();
    const isAtom = rootTag === "feed";

    return isAtom
      ? parseAtomFeed(parsedXml, source)
      : parseRSS2Feed(parsedXml, source);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error parsing feed from ${source.name}: ${errorMessage}`);
    return [];
  }
}

/**
 * Parses an RSS 2.0 feed
 *
 * @param parsedXml The parsed XML document
 * @param source The source information for the feed
 * @returns Array of parsed feed items
 */
function parseRSS2Feed(parsedXml: any[], source: FeedSource): FeedItem[] {
  const items: FeedItem[] = [];

  // Find channel and then items
  const channels = getElementsByTagName(parsedXml, "channel");
  if (channels.length === 0) {
    return items;
  }

  const itemElements = getElementsByTagName(channels, "item");

  for (const itemElement of itemElements) {
    // Extract required fields
    const title = getTagContent([itemElement], "title");
    const link = getTagContent([itemElement], "link");
    const description = getTagContent([itemElement], "description");

    if (!title || !link) {
      continue; // Skip items without required fields
    }

    // Extract optional fields
    const contentEncoded = getTagContent([itemElement], "content:encoded") ||
      getTagContent([itemElement], "encoded");
    const content = contentEncoded || getTagContent([itemElement], "content") ||
      description;

    // Parse publication date
    let pubDate: Date | null = null;
    const pubDateStr = getTagContent([itemElement], "pubDate") ||
      getTagContent([itemElement], "date");

    if (pubDateStr) {
      try {
        pubDate = new Date(pubDateStr);
      } catch (e) {
        console.warn(`Invalid date format in ${source.name}: ${pubDateStr}`);
        pubDate = new Date(); // Fallback to current date
      }
    } else {
      pubDate = new Date(); // Fallback to current date
    }

    // Extract categories
    const categories: string[] = [];
    const categoryElements = getElementsByTagName([itemElement], "category");
    for (const categoryElem of categoryElements) {
      const category = categoryElem.content.trim();
      if (category) {
        categories.push(category);
      }
    }

    // Extract image
    let image: string | undefined = undefined;

    // Try to find enclosure with image type
    const enclosures = getElementsByTagName([itemElement], "enclosure");
    for (const enclosure of enclosures) {
      const type = enclosure.attributes["type"];
      if (type && type.startsWith("image/")) {
        image = enclosure.attributes["url"] || undefined;
        break;
      }
    }

    // If no enclosure found, try to extract from media:content
    if (!image) {
      const mediaContents = getElementsByTagName(
        [itemElement],
        "media:content",
      );
      for (const mediaContent of mediaContents) {
        const type = mediaContent.attributes["type"];
        if (type && type.startsWith("image/")) {
          image = mediaContent.attributes["url"] || undefined;
          break;
        }
      }
    }

    // If still no image, try to extract from media:thumbnail
    if (!image) {
      const mediaThumbnails = getElementsByTagName(
        [itemElement],
        "media:thumbnail",
      );
      if (mediaThumbnails.length > 0) {
        image = mediaThumbnails[0].attributes["url"] || undefined;
      }
    }

    // If still no image, try to extract from description/content
    if (!image && (description || content)) {
      // First try the most common image patterns with src attribute
      let imgMatch = (description || content || "").match(
        /<img[^>]+src=["']([^"']+)["'][^>]*>/i,
      );
      if (imgMatch && imgMatch[1]) {
        image = imgMatch[1];
      } else {
        // Try data-src which some feeds use for lazy loading
        imgMatch = (description || content || "").match(
          /<img[^>]+data-src=["']([^"']+)["'][^>]*>/i,
        );
        if (imgMatch && imgMatch[1]) {
          image = imgMatch[1];
        } else {
          // Try to find figure tags with img inside
          const figureMatch = (description || content || "").match(
            /<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/figure>/i,
          );
          if (figureMatch && figureMatch[1]) {
            image = figureMatch[1];
          }
        }
      }
    }

    // Create feed item
    const feedItem: FeedItem = {
      title,
      description,
      content,
      link,
      pubDate: pubDate || new Date(),
      source: {
        name: source.name,
        url: source.website,
      },
      image,
      categories: categories.length > 0 ? categories : undefined,
    };

    items.push(feedItem);
  }

  return items;
}

/**
 * Parses an Atom feed
 *
 * @param parsedXml The parsed XML document
 * @param source The source information for the feed
 * @returns Array of parsed feed items
 */
function parseAtomFeed(parsedXml: any[], source: FeedSource): FeedItem[] {
  const items: FeedItem[] = [];

  const entryElements = getElementsByTagName(parsedXml, "entry");

  for (const entryElement of entryElements) {
    // Extract required fields
    const title = getTagContent([entryElement], "title");

    // Get link (Atom has a different link format)
    let link = "";
    const linkElements = getElementsByTagName([entryElement], "link");
    for (const linkElem of linkElements) {
      const rel = linkElem.attributes["rel"];
      if (!rel || rel === "alternate") {
        link = linkElem.attributes["href"] || "";
        break;
      }
    }

    if (!title || !link) {
      continue; // Skip items without required fields
    }

    // Extract content or summary
    const content = getTagContent([entryElement], "content");
    const summary = getTagContent([entryElement], "summary");
    const description = summary || content || "";

    // Parse publication date
    let pubDate: Date | null = null;
    const published = getTagContent([entryElement], "published") ||
      getTagContent([entryElement], "updated");

    if (published) {
      try {
        pubDate = new Date(published);
      } catch (e) {
        console.warn(`Invalid date format in ${source.name}: ${published}`);
        pubDate = new Date(); // Fallback to current date
      }
    } else {
      pubDate = new Date(); // Fallback to current date
    }

    // Extract categories
    const categories: string[] = [];
    const categoryElements = getElementsByTagName([entryElement], "category");
    for (const categoryElem of categoryElements) {
      const term = categoryElem.attributes["term"];
      if (term) {
        categories.push(term);
      }
    }

    // Extract image
    let image: string | undefined = undefined;

    // Try to find media:content with image type
    const mediaContents = getElementsByTagName([entryElement], "media:content");
    for (const mediaContent of mediaContents) {
      const type = mediaContent.attributes["type"];
      if (type && type.startsWith("image/")) {
        image = mediaContent.attributes["url"] || undefined;
        break;
      }
    }

    // If no media:content found, try to extract from content
    if (!image && content) {
      // First try the most common image patterns with src attribute
      let imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (imgMatch && imgMatch[1]) {
        image = imgMatch[1];
      } else {
        // Try data-src which some feeds use for lazy loading
        imgMatch = content.match(/<img[^>]+data-src=["']([^"']+)["'][^>]*>/i);
        if (imgMatch && imgMatch[1]) {
          image = imgMatch[1];
        } else {
          // Try to find figure tags with img inside
          const figureMatch = content.match(
            /<figure[^>]*>[\s\S]*?<img[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/figure>/i,
          );
          if (figureMatch && figureMatch[1]) {
            image = figureMatch[1];
          }
        }
      }
    }

    // Create feed item
    const feedItem: FeedItem = {
      title,
      description,
      content: content || undefined,
      link,
      pubDate: pubDate || new Date(),
      source: {
        name: source.name,
        url: source.website,
      },
      image,
      categories: categories.length > 0 ? categories : undefined,
    };

    items.push(feedItem);
  }

  return items;
}

/**
 * Helper function to extract trimmed text content from a specific tag
 * For compatibility with the previous version
 */
function getElementTextContent(node: any, tagName: string): string {
  return getTagContent([node], tagName);
}
