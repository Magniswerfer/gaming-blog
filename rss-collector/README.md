# Gaming RSS Feed Collector - README

A comprehensive RSS feed collector for gaming news that integrates with Deno and Fresh projects.

## Overview

This project provides a complete solution for collecting, parsing, and displaying RSS feeds from major gaming news sites. It's designed to be easily integrated into Deno/Fresh projects, making it perfect for gaming blogs and websites.

## Features

- Collects RSS feeds from 14+ major gaming news sites
- Supports both RSS 2.0 and Atom feed formats
- Provides filtering, sorting, and search capabilities
- Includes ready-to-use Fresh components for easy integration
- Implements caching to improve performance
- Fully typed with TypeScript for better developer experience

## Directory Structure

```
gaming_rss_project/
├── feeds/
│   └── gaming_feeds.json     # Configuration file with RSS feed sources
├── core/
│   ├── fetcher.ts            # Handles fetching RSS feeds
│   ├── parser.ts             # Parses RSS XML into structured data
│   └── normalizer.ts         # Normalizes data from different feed formats
├── utils/
│   ├── cache.ts              # Caching mechanism to avoid excessive requests
│   ├── filters.ts            # Filtering utilities for news items
│   └── sorters.ts            # Sorting utilities for news items
├── fresh/
│   └── components/           # Fresh-specific components for integration
│       ├── GameNewsFeed.tsx  # Main component to display news feed
│       └── GameNewsItem.tsx  # Component for individual news items
├── mod.ts                    # Main entry point, exports all public APIs
├── types.ts                  # TypeScript type definitions
├── test.ts                   # Test script for the collector
├── design.md                 # Design documentation
├── integration_guide.md      # Guide for integrating with Fresh projects
└── README.md                 # This file
```

## Getting Started

1. Clone or download this repository
2. Copy the `gaming_rss_project` directory into your Deno/Fresh project
3. Follow the instructions in the `integration_guide.md` file

## Quick Example

```typescript
// Import the module
import { getLatestNews } from "./gaming_rss_project/mod.ts";

// Get the latest gaming news
const news = await getLatestNews("./gaming_rss_project/feeds/gaming_feeds.json", 10);

// Display the news
console.log("Latest Gaming News:");
news.forEach((item, index) => {
  console.log(`${index + 1}. ${item.title} (${item.source.name})`);
});
```

## Fresh Integration

```tsx
// routes/index.tsx
import { Head } from "$fresh/runtime.ts";
import GameNewsFeed from "../components/GameNewsFeed.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>My Gaming Blog</title>
      </Head>
      <main>
        <h1>Latest Gaming News</h1>
        <GameNewsFeed count={5} showImages={true} />
      </main>
    </>
  );
}
```

## Documentation

- `design.md` - Detailed design documentation
- `integration_guide.md` - Comprehensive guide for integrating with Fresh projects
- Type definitions in `types.ts` - API documentation

## Requirements

- Deno 1.20.0 or later
- For Fresh integration: Fresh 1.1.0 or later

## Known Issues

- The XML parser has some limitations with certain feed formats
- Some feeds may require a proxy server to bypass CORS restrictions

## License

MIT

## Acknowledgements

- Thanks to all the gaming news sites that provide RSS feeds
- Built with Deno and Fresh
