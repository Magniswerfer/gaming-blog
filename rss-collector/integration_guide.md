# Gaming RSS Feed Collector - Fresh Integration Guide

This guide explains how to integrate the Gaming RSS Feed Collector into your Deno/Fresh project to display the latest gaming news on your blog.

## Prerequisites

- [Deno](https://deno.land/) (v1.20.0 or later)
- [Fresh](https://fresh.deno.dev/) (v1.1.0 or later)

## Installation

1. Copy the `gaming_rss_project` directory into your Fresh project or install it as a dependency.

2. If installing as a dependency, you can use the following command:

```bash
# From your Fresh project root
deno add @yourusername/gaming-rss-collector
```

## Basic Integration

### Step 1: Create an API Route

First, create an API route in your Fresh project to serve the gaming news data. Create a file at `routes/api/gaming-news.ts`:

```typescript
// routes/api/gaming-news.ts
import { Handlers } from "$fresh/server.ts";
import { 
  getLatestNews, 
  searchNews 
} from "../../gaming_rss_project/mod.ts";

// Path to your feeds configuration
const FEEDS_CONFIG = "../../gaming_rss_project/feeds/gaming_feeds.json";

export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const params = url.searchParams;
      
      // Get query parameters
      const count = parseInt(params.get("count") || "10");
      const query = params.get("query") || "";
      const includeSources = params.get("includeSources")?.split(",") || [];
      const excludeSources = params.get("excludeSources")?.split(",") || [];
      const sortBy = params.get("sortBy") as "date" | "source" || "date";
      const sortOrder = params.get("sortOrder") as "asc" | "desc" || "desc";
      
      // Options object
      const options = {
        includeSources: includeSources.length > 0 ? includeSources : undefined,
        excludeSources: excludeSources.length > 0 ? excludeSources : undefined,
        sortBy,
        sortOrder
      };
      
      // Get news items
      let items;
      if (query) {
        items = await searchNews(FEEDS_CONFIG, query, options);
      } else {
        items = await getLatestNews(FEEDS_CONFIG, count, options);
      }
      
      // Return JSON response
      return new Response(JSON.stringify(items), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error fetching gaming news:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch gaming news" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
```

### Step 2: Import the Components

Copy the `GameNewsFeed.tsx` and `GameNewsItem.tsx` components from the `gaming_rss_project/fresh/components/` directory to your Fresh project's components directory.

### Step 3: Use the Component in Your Page

Now you can use the `GameNewsFeed` component in any of your Fresh pages:

```typescript
// routes/gaming-news.tsx
import { Head } from "$fresh/runtime.ts";
import GameNewsFeed from "../components/GameNewsFeed.tsx";

export default function GamingNewsPage() {
  return (
    <>
      <Head>
        <title>Latest Gaming News</title>
        <meta name="description" content="Latest news from the gaming world" />
        <style>{`
          .game-news-feed {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .game-news-feed-items {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .game-news-item {
            border: 1px solid #eaeaea;
            border-radius: 8px;
            padding: 15px;
            display: flex;
            gap: 15px;
          }
          .game-news-item-image {
            flex: 0 0 150px;
          }
          .game-news-item-image img {
            width: 100%;
            height: auto;
            border-radius: 4px;
          }
          .game-news-item-content {
            flex: 1;
          }
          .game-news-item-title {
            margin-top: 0;
            margin-bottom: 10px;
          }
          .game-news-item-meta {
            font-size: 0.8rem;
            color: #666;
            margin-bottom: 10px;
          }
          .game-news-item-description {
            margin-bottom: 10px;
          }
          .game-news-item-read-more {
            font-weight: bold;
          }
          @media (max-width: 600px) {
            .game-news-item {
              flex-direction: column;
            }
            .game-news-item-image {
              flex: 0 0 auto;
            }
          }
        `}</style>
      </Head>
      <main>
        <h1 style={{ textAlign: "center", marginTop: "40px" }}>Latest Gaming News</h1>
        <GameNewsFeed 
          count={10} 
          showSource={true}
          showDate={true}
          showImages={true}
        />
      </main>
    </>
  );
}
```

## Advanced Integration

### Customizing the Feed

The `GameNewsFeed` component accepts several props to customize its behavior:

```typescript
<GameNewsFeed 
  count={5} // Number of news items to display
  includeSources={["IGN All", "Polygon"]} // Only show news from these sources
  excludeSources={["Kotaku"]} // Exclude news from these sources
  sortBy="date" // Sort by date or source
  sortOrder="desc" // Sort in descending or ascending order
  showSource={true} // Show the source name
  showDate={true} // Show the publication date
  showImages={true} // Show images
  className="custom-class" // Add custom CSS class
/>
```

### Creating a Filtered Feed

You can create specialized feeds for specific types of gaming news:

```typescript
// routes/nintendo-news.tsx
import { Head } from "$fresh/runtime.ts";
import GameNewsFeed from "../components/GameNewsFeed.tsx";

export default function NintendoNewsPage() {
  return (
    <>
      <Head>
        <title>Latest Nintendo News</title>
      </Head>
      <main>
        <h1>Latest Nintendo News</h1>
        <GameNewsFeed 
          count={10}
          includeSources={["Nintendo Life"]} // Only show Nintendo Life news
        />
      </main>
    </>
  );
}
```

### Creating a Search Page

You can also create a search page for your gaming news:

```typescript
// routes/search.tsx
import { Head } from "$fresh/runtime.ts";
import { useState } from "preact/hooks";
import GameNewsFeed from "../components/GameNewsFeed.tsx";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/gaming-news?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <Head>
        <title>Search Gaming News</title>
      </Head>
      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
        <h1>Search Gaming News</h1>
        
        <form onSubmit={handleSearch} style={{ marginBottom: "20px" }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for gaming news..."
            style={{ padding: "8px", width: "70%" }}
          />
          <button 
            type="submit" 
            style={{ padding: "8px 16px", marginLeft: "10px" }}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>
        
        {searchResults.length > 0 ? (
          <div>
            <h2>Search Results</h2>
            <div className="search-results">
              {searchResults.map((item, index) => (
                <div key={index} className="search-result-item">
                  <h3>
                    <a href={item.link} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </h3>
                  <p>{item.description}</p>
                  <p className="source">Source: {item.source.name}</p>
                </div>
              ))}
            </div>
          </div>
        ) : query && !loading ? (
          <p>No results found for "{query}"</p>
        ) : null}
      </main>
    </>
  );
}
```

## Customizing the Feed Data

### Adding Custom RSS Feeds

You can add your own RSS feeds by editing the `feeds/gaming_feeds.json` file:

```json
{
  "feeds": [
    // ... existing feeds
    {
      "name": "Your Custom Feed",
      "url": "https://example.com/feed.xml",
      "website": "example.com",
      "description": "Your custom gaming news feed"
    }
  ]
}
```

### Creating a Feed Management UI

For more advanced projects, you might want to create a UI for managing feeds:

```typescript
// routes/admin/feeds.tsx
import { Head } from "$fresh/runtime.ts";
import { useState, useEffect } from "preact/hooks";

export default function FeedManagementPage() {
  const [feeds, setFeeds] = useState([]);
  const [newFeed, setNewFeed] = useState({
    name: "",
    url: "",
    website: "",
    description: ""
  });
  
  // Load feeds from JSON file
  useEffect(() => {
    const loadFeeds = async () => {
      try {
        const response = await fetch("/api/feeds");
        const data = await response.json();
        setFeeds(data.feeds);
      } catch (error) {
        console.error("Error loading feeds:", error);
      }
    };
    
    loadFeeds();
  }, []);
  
  // Add a new feed
  const handleAddFeed = async (e) => {
    e.preventDefault();
    // Implementation details...
  };
  
  return (
    <>
      <Head>
        <title>Manage RSS Feeds</title>
      </Head>
      <main>
        <h1>Manage RSS Feeds</h1>
        
        {/* Feed list */}
        <div className="feed-list">
          {feeds.map((feed, index) => (
            <div key={index} className="feed-item">
              <h3>{feed.name}</h3>
              <p>{feed.description}</p>
              <p>URL: {feed.url}</p>
              <p>Website: {feed.website}</p>
            </div>
          ))}
        </div>
        
        {/* Add new feed form */}
        <form onSubmit={handleAddFeed}>
          {/* Form fields */}
        </form>
      </main>
    </>
  );
}
```

## Performance Optimization

### Implementing Server-Side Rendering

For better performance, you can implement server-side rendering for your gaming news feed:

```typescript
// routes/index.tsx
import { Head } from "$fresh/runtime.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { getLatestNews } from "../gaming_rss_project/mod.ts";
import GameNewsItem from "../components/GameNewsItem.tsx";

// Define the data structure
interface NewsData {
  items: any[];
  error?: string;
}

// Server-side handler
export const handler: Handlers<NewsData> = {
  async GET(req, ctx) {
    try {
      const items = await getLatestNews("../gaming_rss_project/feeds/gaming_feeds.json", 5);
      return ctx.render({ items });
    } catch (error) {
      console.error("Error fetching news:", error);
      return ctx.render({ items: [], error: "Failed to load news" });
    }
  }
};

// Page component
export default function Home({ data }: PageProps<NewsData>) {
  const { items, error } = data;
  
  return (
    <>
      <Head>
        <title>My Gaming Blog</title>
      </Head>
      <main>
        <h1>Latest Gaming News</h1>
        
        {error ? (
          <p className="error">{error}</p>
        ) : items.length === 0 ? (
          <p>No news available at the moment.</p>
        ) : (
          <div className="news-container">
            {items.map((item, index) => (
              <GameNewsItem key={index} item={item} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
```

### Implementing Caching

To reduce API calls and improve performance, implement caching in your API route:

```typescript
// routes/api/gaming-news.ts
import { Handlers } from "$fresh/server.ts";
import { getLatestNews, searchNews } from "../../gaming_rss_project/mod.ts";

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const cacheKey = url.search || "default";
      
      // Check cache
      const cachedData = cache.get(cacheKey);
      if (cachedData && (Date.now() - cachedData.timestamp < CACHE_TTL)) {
        return new Response(JSON.stringify(cachedData.data), {
          headers: { "Content-Type": "application/json" }
        });
      }
      
      // Process request and cache results
      // ... (same code as before)
      
      // Cache the results
      cache.set(cacheKey, {
        data: items,
        timestamp: Date.now()
      });
      
      return new Response(JSON.stringify(items), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error fetching gaming news:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch gaming news" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
```

## Troubleshooting

### Common Issues

1. **XML Parsing Errors**: If you encounter XML parsing errors, you may need to use a different XML parser library. The current implementation uses `deno_dom` which has some limitations with XML parsing.

2. **CORS Issues**: If you're fetching RSS feeds from domains that don't allow CORS, you may need to set up a proxy server.

3. **Rate Limiting**: Some RSS feeds may implement rate limiting. Implement proper caching to reduce the number of requests.

### Debugging

To debug issues with the RSS feed collector, you can use the following approaches:

1. **Enable Verbose Logging**:

```typescript
// Add this to your API route
const DEBUG = true;

if (DEBUG) {
  console.log("Request params:", {
    count,
    query,
    includeSources,
    excludeSources,
    sortBy,
    sortOrder
  });
}
```

2. **Test Individual Feeds**:

```typescript
// Create a debug endpoint
// routes/api/debug-feed.ts
import { Handlers } from "$fresh/server.ts";
import { fetchFeed, parseRSS } from "../../gaming_rss_project/mod.ts";

export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const feedUrl = url.searchParams.get("url");
      
      if (!feedUrl) {
        return new Response("Missing feed URL", { status: 400 });
      }
      
      const xml = await fetchFeed(feedUrl);
      const items = parseRSS(xml, {
        name: "Debug Feed",
        url: feedUrl,
        website: new URL(feedUrl).hostname,
        description: "Debug feed"
      });
      
      return new Response(JSON.stringify(items), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }
};
```

## Conclusion

This integration guide should help you incorporate the Gaming RSS Feed Collector into your Deno/Fresh project. The collector provides a flexible and customizable way to display gaming news on your blog.

For more advanced usage, refer to the source code and type definitions in the `gaming_rss_project` directory.
