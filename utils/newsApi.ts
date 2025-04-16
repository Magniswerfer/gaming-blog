/**
 * News API fetcher for The Questline
 * Fetches gaming news from predefined RSS feeds using the rss-collector module
 */

import {
  FeedItem,
  FeedSource,
  FetchOptions,
  getLatestNews,
  NewsOptions,
  searchNews,
  SearchOptions,
} from "../rss-collector/mod.ts";

export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: Date;
  source: {
    name: string;
    url: string;
  };
  image?: string;
}

// Gaming news sources with RSS feeds
const GAMING_NEWS_SOURCES: FeedSource[] = [
  {
    name: "IGN",
    url: "https://feeds.ign.com/ign/games-all",
    website: "https://ign.com",
    description: "Video game news and reviews from IGN",
  },
  {
    name: "GameSpot",
    url: "https://www.gamespot.com/feeds/game-news/",
    website: "https://gamespot.com",
    description: "Video game news, reviews, and updates from GameSpot",
  },
  {
    name: "Polygon",
    url: "https://www.polygon.com/rss/index.xml",
    website: "https://polygon.com",
    description: "Gaming news, reviews and culture from Polygon",
  },
  {
    name: "PC Gamer",
    url: "https://www.pcgamer.com/rss/",
    website: "https://pcgamer.com",
    description: "PC gaming news and reviews from PC Gamer",
  },
  {
    name: "Eurogamer",
    url: "https://www.eurogamer.net/feed",
    website: "https://eurogamer.net",
    description: "European perspective on video games from Eurogamer",
  },
];

// How many items to fetch at once (to support pagination)
const MAX_ITEMS = 50;

// Cache of all fetched news items
let cachedNewsItems: NewsItem[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Converts a FeedItem from the RSS collector to our NewsItem format
 */
function convertFeedItemToNewsItem(item: FeedItem): NewsItem {
  return {
    title: item.title,
    description: item.description || item.content || "",
    link: item.link,
    pubDate: new Date(item.pubDate),
    source: {
      name: item.source?.name || "Unknown",
      url: item.source?.url || "",
    },
    image: item.image,
  };
}

/**
 * Refreshes the news cache if needed
 */
async function refreshNewsCache(): Promise<void> {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_TTL && cachedNewsItems.length > 0) {
    return; // Cache is still valid
  }

  try {
    const options: NewsOptions = {
      sortBy: "date",
      sortOrder: "desc",
    };

    const feedItems = await getLatestNews(
      GAMING_NEWS_SOURCES,
      MAX_ITEMS,
      options,
    );
    cachedNewsItems = feedItems.map(convertFeedItemToNewsItem);
    lastFetchTime = now;
    console.log(`Refreshed news cache with ${cachedNewsItems.length} items`);
  } catch (error) {
    console.error("Error refreshing news cache:", error);
    // If cache is empty, ensure we try again next time
    if (cachedNewsItems.length === 0) {
      lastFetchTime = 0;
    }
  }
}

/**
 * Gets the latest gaming news
 * @param count Number of news items to return
 * @returns Array of news items
 */
export async function getLatestGamingNews(count = 10): Promise<NewsItem[]> {
  await refreshNewsCache();
  return cachedNewsItems.slice(0, count);
}

/**
 * Searches gaming news
 * @param query Search query
 * @param count Maximum number of results to return
 * @returns Array of matching news items
 */
export async function searchGamingNews(
  query: string,
  count = 10,
): Promise<NewsItem[]> {
  try {
    // For search, we don't use the cache as we want fresh results filtered by the query
    const options: SearchOptions = {
      inContent: true,
      sortBy: "date",
    };

    // Search for news items
    const searchResults = await searchNews(GAMING_NEWS_SOURCES, query, options);

    // Limit results to the requested count
    const newsItems = searchResults
      .slice(0, count)
      .map(convertFeedItemToNewsItem);

    return newsItems;
  } catch (error) {
    console.error("Error searching gaming news:", error);
    return [];
  }
}
