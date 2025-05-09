import { JSX } from "preact";
import { getOptimizedImageUrl } from "../../utils/sanity.ts";
import Divider from "../misc/Divider.tsx";

interface ContentItem {
  _type?: string;
  title: string;
  slug: { current: string };
  summary?: string;
  resume?: string;
  publishedAt?: string;
  author?: {
    name: string;
  };
  mainImage?: {
    asset: any;
  };
  isBreaking?: boolean;
}

interface ArticleSidebarProps {
  title: string;
  viewAllLink?: {
    url: string;
    text: string;
  };
  items: ContentItem[];
  limit?: number;
  sortBy?: "newest" | "oldest";
  showImage?: boolean;
  className?: string;
  contentType?: string;
}

export default function ArticleSidebar({
  title,
  viewAllLink,
  items,
  limit = 5,
  sortBy = "newest",
  showImage = false,
  className = "",
  contentType = "",
}: ArticleSidebarProps): JSX.Element {
  // Sort the items based on the sortBy prop
  const sortedItems = [...items].sort((a, b) => {
    if (!a.publishedAt || !b.publishedAt) return 0;

    const dateA = new Date(a.publishedAt).getTime();
    const dateB = new Date(b.publishedAt).getTime();

    return sortBy === "newest" ? dateB - dateA : dateA - dateB;
  }).slice(0, limit);

  // Helper to get the proper URL for an item
  const getItemUrl = (item: ContentItem): string => {
    if (contentType) {
      return `/${contentType}/${item.slug.current}`;
    }

    if (item._type) {
      switch (item._type) {
        case "feature":
          return `/features/${item.slug.current}`;
        case "anmeldelse":
          return `/anmeldelser/${item.slug.current}`;
        case "debat":
          return `/debat/${item.slug.current}`;
        case "nyhed":
          return `/nyhed/${item.slug.current}`;
      }
    }

    return `/${item.slug.current}`;
  };

  // Helper to get the excerpt/summary text
  const getExcerptText = (item: ContentItem): string | null => {
    if (item.resume) return item.resume;
    if (item.summary) return item.summary;
    return null;
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-wider">
          {title}
        </h3>
        {viewAllLink && (
          <a
            href={viewAllLink.url}
            className="text-xs font-medium text-secondary transition-colors"
          >
            {viewAllLink.text} →
          </a>
        )}
      </div>
      <Divider spacing="sm" />

      <div className="pb-2">
        {sortedItems.map((item, index) => (
          <a
            href={getItemUrl(item)}
            className={`block hover:no-underline group ${
              showImage ? "flex items-start" : ""
            } mb-3 ${index < sortedItems.length - 1 ? "pb-3" : ""}`}
            key={item.slug.current}
          >
            {showImage && (
              item.mainImage?.asset
                ? (
                  <div
                    className="mr-3 flex-shrink-0 relative"
                    style={{ width: "70px" }}
                  >
                    <img
                      src={getOptimizedImageUrl(item.mainImage, 280, 200)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      width={280}
                      height={200}
                      loading="lazy"
                    />
                    {item.isBreaking && (
                      <div className="bg-red-600 text-white px-1 py-0.5 text-xs font-bold absolute top-0 left-0">
                        BREAKING
                      </div>
                    )}
                  </div>
                )
                : (
                  <div
                    className="mr-3 flex-shrink-0 relative bg-secondary/10 flex items-center justify-center"
                    style={{ width: "70px", height: "50px" }}
                  >
                    <span className="text-secondary/50 text-xs uppercase font-medium">
                      {item._type || contentType}
                    </span>
                    {item.isBreaking && (
                      <div className="bg-red-600 text-white px-1 py-0.5 text-xs font-bold absolute top-0 left-0">
                        BREAKING
                      </div>
                    )}
                  </div>
                )
            )}

            <div className="flex-grow">
              <h3 className="font-bold text-base mb-1 leading-tight">
                <span className="text-black group-hover:underline">
                  {item.title}
                </span>
                {!showImage && item.isBreaking && (
                  <span className="ml-2 bg-red-600 text-white px-1 py-0.5 text-xs font-bold inline-block">
                    BREAKING
                  </span>
                )}
              </h3>

              {getExcerptText(item) && (
                <p className="text-sm text-black/70 mb-2 line-clamp-2">
                  {getExcerptText(item)}
                </p>
              )}

              <div className="flex items-center text-xs text-black/60">
                {item.author && <span>{item.author.name}</span>}
                {item.publishedAt && item.author && (
                  <span className="px-2">•</span>
                )}
                {item.publishedAt && (
                  <span>
                    {new Date(item.publishedAt).toLocaleDateString("da-DK", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
