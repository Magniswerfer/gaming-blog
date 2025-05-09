import { JSX } from "preact";
import Divider from "./misc/Divider.tsx";

interface ContentItem {
  _type?: string;
  title: string;
  slug: { current: string };
  publishedAt?: string;
  author?: {
    name: string;
  };
}

interface SimpleSidebarProps {
  title: string;
  viewAllLink?: {
    url: string;
    text: string;
  };
  items: ContentItem[];
  limit?: number;
  className?: string;
  contentType?: string;
}

export default function SimpleSidebar({
  title,
  viewAllLink,
  items,
  limit = 5,
  className = "",
  contentType = "",
}: SimpleSidebarProps): JSX.Element {
  const limitedItems = items.slice(0, limit);

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

      <ul className="space-y-1">
        {limitedItems.map((item) => (
          <li key={item.slug.current}>
            <a
              href={getItemUrl(item)}
              className="text-sm font-medium text-black transition-colors hover:underline"
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
