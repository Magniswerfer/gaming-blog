import { useEffect, useState } from "preact/hooks";
import GameNewsItem from "../components/GameNewsItem.tsx";
import { NewsItem } from "../utils/newsApi.ts";

interface FeaturedGameNewsProps {
  className?: string;
}

export default function FeaturedGameNews(
  { className = "" }: FeaturedGameNewsProps,
) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedNews = async () => {
      try {
        setLoading(true);
        setError(null);

        // Build query string - always 3 items
        const params = new URLSearchParams();
        params.set("pageSize", "3");
        params.set("page", "1");

        // Fetch news from our API
        const response = await fetch(`/api/gaming-news?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        // Convert pubDate strings back to Date objects
        const newsItems = data.items.map((item: any) => ({
          ...item,
          pubDate: new Date(item.pubDate),
        }));

        setItems(newsItems);
      } catch (err) {
        console.error("Error fetching featured news:", err);
        setError("Failed to load gaming news. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedNews();
  }, []);

  if (loading) {
    return (
      <div className={`featured-game-news-loading ${className}`}>
        <div className="text-center py-12">
          <div
            className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-gold border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"
            role="status"
          >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
              Loading...
            </span>
          </div>
          <p className="mt-2 text-white/70">Loading latest gaming news...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`featured-game-news-error ${className}`}>
        <div className="bg-red-900/20 text-red-100 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={`featured-game-news-empty ${className}`}>
        <p className="text-white/70 text-center py-8">
          No gaming news available at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className={`featured-game-news ${className}`}>
      <div className="featured-game-news-items grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <GameNewsItem
            key={`${item.link}-${index}`}
            item={item}
            showSource={true}
            showDate={true}
            showImage={true}
            layout="vertical"
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <a
          href="/news"
          className="inline-block px-8 py-3 bg-primary-dark hover:bg-accent-gold transition-colors text-white font-medium rounded-lg"
        >
          See All News
        </a>
      </div>
    </div>
  );
}
