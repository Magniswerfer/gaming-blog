/**
 * Component for displaying individual gaming news item in Fresh
 */

import { FeedItem } from "../../types.ts";

interface GameNewsItemProps {
  /** The news item to display */
  item: FeedItem;
  /** Whether to show source information */
  showSource?: boolean;
  /** Whether to show publication date */
  showDate?: boolean;
  /** Whether to show image */
  showImage?: boolean;
  /** Custom CSS class */
  className?: string;
}

export default function GameNewsItem({
  item,
  showSource = true,
  showDate = true,
  showImage = true,
  className = "",
}: GameNewsItemProps) {
  // Format the publication date
  const formattedDate = showDate
    ? new Date(item.pubDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <article className={`game-news-item ${className}`}>
      {showImage && item.image && (
        <div className="game-news-item-image">
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            <img src={item.image} alt={item.title} loading="lazy" />
          </a>
        </div>
      )}
      
      <div className="game-news-item-content">
        <h3 className="game-news-item-title">
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            {item.title}
          </a>
        </h3>
        
        {(showSource || showDate) && (
          <div className="game-news-item-meta">
            {showSource && (
              <span className="game-news-item-source">
                <a href={item.source.url} target="_blank" rel="noopener noreferrer">
                  {item.source.name}
                </a>
              </span>
            )}
            
            {showSource && showDate && <span className="game-news-item-meta-separator">•</span>}
            
            {showDate && (
              <time className="game-news-item-date" dateTime={item.pubDate.toISOString()}>
                {formattedDate}
              </time>
            )}
          </div>
        )}
        
        <div className="game-news-item-description">
          {item.description}
        </div>
        
        <div className="game-news-item-read-more">
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            Read more
          </a>
        </div>
      </div>
    </article>
  );
}
