/**
 * Test script for the Gaming RSS Feed Collector
 * Tests the core functionality of the collector
 */

import { 
  getAllFeeds, 
  getLatestNews, 
  getNewsByCategory, 
  searchNews 
} from "./mod.ts";

// Path to the feeds configuration file
const FEEDS_CONFIG = "./feeds/gaming_feeds.json";

/**
 * Main test function
 */
async function runTests() {
  console.log("=== Testing Gaming RSS Feed Collector ===\n");
  
  try {
    // Test 1: Get all feeds
    console.log("Test 1: Getting all feeds...");
    const allFeeds = await getAllFeeds(FEEDS_CONFIG);
    console.log(`Successfully fetched ${allFeeds.length} items from all feeds`);
    
    if (allFeeds.length > 0) {
      const sample = allFeeds[0];
      console.log("\nSample item:");
      console.log(`Title: ${sample.title}`);
      console.log(`Source: ${sample.source.name}`);
      console.log(`Date: ${sample.pubDate.toISOString()}`);
      console.log(`Link: ${sample.link}`);
    }
    
    // Test 2: Get latest news
    console.log("\nTest 2: Getting latest news (5 items)...");
    const latestNews = await getLatestNews(FEEDS_CONFIG, 5);
    console.log(`Successfully fetched ${latestNews.length} latest news items`);
    
    console.log("\nLatest news titles:");
    latestNews.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title} (${item.source.name})`);
    });
    
    // Test 3: Search news
    console.log("\nTest 3: Searching for 'PlayStation'...");
    const searchResults = await searchNews(FEEDS_CONFIG, "PlayStation");
    console.log(`Found ${searchResults.length} items matching 'PlayStation'`);
    
    if (searchResults.length > 0) {
      console.log("\nSearch results (first 3):");
      searchResults.slice(0, 3).forEach((item, index) => {
        console.log(`${index + 1}. ${item.title} (${item.source.name})`);
      });
    }
    
    // Test 4: Filter by source
    console.log("\nTest 4: Filtering by source (IGN)...");
    const ignNews = await getLatestNews(FEEDS_CONFIG, 5, {
      includeSources: ["IGN All"]
    });
    console.log(`Found ${ignNews.length} items from IGN`);
    
    if (ignNews.length > 0) {
      console.log("\nIGN news titles:");
      ignNews.forEach((item, index) => {
        console.log(`${index + 1}. ${item.title}`);
      });
    }
    
    console.log("\n=== All tests completed successfully ===");
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

// Run the tests
runTests();
