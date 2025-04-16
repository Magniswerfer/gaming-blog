/**
 * Main component for displaying gaming news feed in Fresh
 */

import { useEffect, useState } from "preact/hooks";
import { FeedItem } from "../../types.ts";
import GameNewsItem from "./GameNewsItem.tsx";

interface GameNewsFeedProps {
  /** Number of items to display */
  count?: number;
  /** Sources to include (empty means all sources) */
  includeSources?: string[];
  /** Sources to exclude */
  excludeSources?: string[];
  /** Sort order for items */
  sortBy?: "date" | "source";
  /** Sort direction */
  sortOrder?: "asc" | "desc";
  /** Whether to show source information */
  showSource?: boolean;
  /** Whether to show publication date */
  showDate?: boolean;
  /** Whether to show images */
  showImages?: boolean;
  /** Custom CSS class */
  className?: string;
}

export default function GameNewsFeed({
  count = 10,
  includeSources = [],
  excludeSources = [],
  sortBy = "date",
  sortOrder = "desc",
  showSource = true,
  showDate = true,
  showImages = true,
  className = "",
}: GameNewsFeedProps) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // Construct the API URL with query parameters
        const params = new URLSearchParams();
        params.append("count", count.toString());
        
        if (includeSources.length > 0) {
          params.append("includeSources", includeSources.join(","));
        }
        
        if (excludeSources.length > 0) {
          params.append("excludeSources", excludeSources.join(","));
        }
        
        params.append("sortBy", sortBy);
        params.append("sortOrder", sortOrder);
        
        // Fetch the news from the API endpoint
        const response = await fetch(`/api/gaming-news?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching gaming news:", err);
        setError("Failed to load gaming news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, [count, includeSources.join(","), excludeSources.join(","), sortBy, sortOrder]);

  if (loading) {
    return (
      <div className={`game-news-feed-loading ${className}`}>
        <p>Loading gaming news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`game-news-feed-error ${className}`}>
        <p>{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`game-news-feed-empty ${className}`}>
        <p>No gaming news found.</p>
      </div>
    );
  }

  return (
    <div className={`game-news-feed ${className}`}>
      <div className="game-news-feed-items">
        {items.map((item, index) => (
          <GameNewsItem
            key={`${item.source.name}-${index}`}
            item={item}
            showSource={showSource}
            showDate={showDate}
            showImage={showImages}
          />
        ))}
      </div>
    </div>
  );
}
