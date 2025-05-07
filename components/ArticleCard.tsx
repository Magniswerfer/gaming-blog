import { JSX } from "preact";
import { Content } from "../types/content.ts";

interface ArticleCardProps {
  content: Content;
  size?: "small" | "medium" | "large";
  showExcerpt?: boolean;
  showDate?: boolean;
  showAuthor?: boolean;
  className?: string;
  horizontal?: boolean;
}

export default function ArticleCard({
  content,
  size = "medium",
  showExcerpt = true,
  showDate = true,
  showAuthor = true,
  className = "",
  horizontal = false,
}: ArticleCardProps): JSX.Element {
  // Helper function to get the excerpt text based on content type
  function getExcerptText(): string {
    if (content.resume) return content.resume;
    if (content.summary) return content.summary;
    if (content.ingress) return content.ingress;
    if (content.subtitle) return content.subtitle;
    return "Ingen resumé tilgængelig";
  }

  // Helper function to get the correct route for different content types
  function getContentRoute(): string {
    switch (content._type) {
      case "feature":
        return `/features/${content.slug.current}`;
      case "anmeldelse":
        return `/anmeldelser/${content.slug.current}`;
      case "debat":
        return `/debat/${content.slug.current}`;
      case "nyhed":
        return `/nyhed/${content.slug.current}`;
      default:
        return `/${content.slug.current}`;
    }
  }

  // Image size classes based on the size prop
  const imageSizes = {
    small: "h-20",
    medium: "h-48",
    large: "h-64",
  };

  // Title size classes based on the size prop
  const titleSizes = {
    small: "text-base",
    medium: "text-xl",
    large: "text-2xl md:text-3xl",
  };

  // Excerpt size classes based on the size prop
  const excerptSizes = {
    small: "text-xs line-clamp-2",
    medium: "text-sm line-clamp-3",
    large: "text-base line-clamp-4",
  };

  return (
    <a href={getContentRoute()} className="block hover:no-underline group">
      <article
        className={`${
          horizontal && size === "small" ? "flex flex-row" : "flex flex-col"
        } h-full ${className}`}
      >
        {/* Content image with overlay elements */}
        <div
          className={`relative ${
            horizontal && size === "small" ? "mr-3 flex-shrink-0" : ""
          }`}
          style={horizontal && size === "small" ? { width: "100px" } : {}}
        >
          {/* Breaking news label */}
          {content.isBreaking && (
            <div className="bg-red-600 text-white px-2 py-1 text-xs font-bold absolute top-2 left-2 z-10">
              BREAKING
            </div>
          )}

          {/* Rating badge for reviews - now positioned on the image */}
          {content._type === "anmeldelse" && content.rating !== undefined && (
            <div className="bg-[#F5D76E] px-2 py-1 text-sm font-bold absolute top-2 right-2 z-10">
              {content.rating}/10
            </div>
          )}

          {/* Content image */}
          {content.mainImage?.asset?.url
            ? (
              <div
                className={`overflow-hidden ${
                  horizontal && size === "small" ? "h-full" : imageSizes[size]
                }`}
              >
                <img
                  src={content.mainImage.asset.url}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )
            : (
              <div
                className={`overflow-hidden bg-secondary/10 flex items-center justify-center ${
                  horizontal && size === "small" ? "h-full" : imageSizes[size]
                }`}
              >
                <span className="text-secondary/50 text-lg uppercase font-medium">
                  {content._type}
                </span>
              </div>
            )}
        </div>

        {/* Content body - using flex-col and flex-grow to push byline to bottom */}
        <div
          className={`${
            horizontal && size === "small" ? "py-0" : "py-4"
          } flex flex-col flex-grow h-full`}
        >
          <div className="flex-grow flex flex-col">
            {/* Content title */}
            <h3
              className={`font-sans font-bold ${titleSizes[size]} ${
                horizontal && size === "small" ? "mb-1" : "mb-2"
              } leading-tight text-left flex-shrink-0`}
            >
              <span className="text-black group-hover:underline">
                {content.title}
              </span>
            </h3>

            {/* Content excerpt */}
            {showExcerpt && (
              <p
                className={`font-serif text-black/80 ${
                  horizontal && size === "small"
                    ? "mb-1 sm:line-clamp-4 md:line-clamp-5 line-clamp-4 overflow-hidden text-xs"
                    : `mb-3 ${excerptSizes[size]}`
                } text-left`}
              >
                {getExcerptText()}
              </p>
            )}
          </div>

          {/* Meta information: author and date - pushed to bottom with mt-auto */}
          <div className="flex items-center justify-between text-xs text-black/60 mt-auto flex-shrink-0">
            <div className="flex items-center gap-2 text-left">
              {showAuthor && content.author && (
                <span>{content.author.name}</span>
              )}

              {showDate && content.publishedAt && (
                <>
                  {showAuthor && content.author && (
                    <span className="mx-1">•</span>
                  )}
                  <span>
                    {new Date(content.publishedAt).toLocaleDateString("da-DK", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      ...(size === "large" && { year: "numeric" }),
                    })}
                  </span>
                </>
              )}
            </div>

            {/* Content type badge */}
            <span className="px-2 py-0.5 bg-secondary text-white text-xs">
              {content._type === "anmeldelse"
                ? "Anmeldelse"
                : content._type === "feature"
                ? "Feature"
                : content._type === "debat"
                ? "Debat"
                : "Nyhed"}
            </span>
          </div>
        </div>
      </article>
    </a>
  );
}
