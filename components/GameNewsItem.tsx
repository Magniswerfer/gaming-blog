import { ComponentChildren } from "preact";
import { NewsItem } from "../utils/newsApi.ts";

interface GameNewsItemProps {
  item: NewsItem;
  showSource?: boolean;
  showDate?: boolean;
  showImage?: boolean;
  className?: string;
  children?: ComponentChildren;
  layout?: "horizontal" | "vertical";
}

export default function GameNewsItem({
  item,
  showSource = true,
  showDate = true,
  showImage = true,
  className = "",
  layout = "horizontal",
}: GameNewsItemProps) {
  const formattedDate = new Date(item.pubDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Clean the description to show only a short excerpt
  const cleanDescription = item.description
    ? item.description.replace(/<\/?[^>]+(>|$)/g, "").substring(0, 150) + "..."
    : "";

  // Vertical layout (image on top)
  if (layout === "vertical") {
    return (
      <div
        className={`game-news-item bg-background-light/30 backdrop-blur-sm border border-secondary/20 rounded-xl overflow-hidden ${className}`}
      >
        {showImage && item.image && (
          <div className="game-news-item-image">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-52 object-cover"
            />
          </div>
        )}
        <div className="game-news-item-content p-6">
          <h3 className="font-serif text-xl text-black mb-2">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-gold transition-colors"
            >
              {item.title}
            </a>
          </h3>

          <div className="game-news-item-meta flex flex-wrap gap-2 text-black/70 text-sm mb-3">
            {showSource && (
              <span className="bg-secondary/50 px-3 py-1 rounded-full">
                {item.source.name}
              </span>
            )}
            {showDate && <span>{formattedDate}</span>}
          </div>

          <p className="game-news-item-description text-black/90 mb-4">
            {cleanDescription}
          </p>

          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="game-news-item-read-more inline-block px-4 py-2 bg-secondary hover:bg-accent-gold transition-colors text-white text-sm rounded-lg"
          >
            Read More at {item.source.name}
          </a>
        </div>
      </div>
    );
  }

  // Horizontal layout (original)
  return (
    <div
      className={`game-news-item bg-background-light/30 backdrop-blur-sm border border-secondary/20 rounded-xl overflow-hidden ${className}`}
    >
      <div className="flex flex-col md:flex-row">
        {showImage && item.image && (
          <div className="game-news-item-image md:w-1/3">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-48 md:h-full object-cover"
            />
          </div>
        )}
        <div
          className={`game-news-item-content p-6 ${
            showImage && item.image ? "md:w-2/3" : "w-full"
          }`}
        >
          <h3 className="font-serif text-xl text-black mb-2">
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-gold transition-colors"
            >
              {item.title}
            </a>
          </h3>

          <div className="game-news-item-meta flex flex-wrap gap-2 text-black/70 text-sm mb-3">
            {showSource && (
              <span className="bg-secondary/50 px-3 py-1 rounded-full">
                {item.source.name}
              </span>
            )}
            {showDate && <span>{formattedDate}</span>}
          </div>

          <p className="game-news-item-description text-black/90 mb-4">
            {cleanDescription}
          </p>

          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="game-news-item-read-more inline-block px-4 py-2 bg-secondary hover:bg-accent-gold transition-colors text-white text-sm rounded-lg"
          >
            Read More at {item.source.name}
          </a>
        </div>
      </div>
    </div>
  );
}
