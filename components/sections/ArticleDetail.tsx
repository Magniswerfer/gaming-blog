import { Fragment, JSX } from "preact";
import { parseContent } from "../../utils/sanityParser.tsx";
import RatingCard from "../cards/RatingCard.tsx";
import RelatedArticlesSidebar, {
  fetchRelatedArticles,
} from "../sidebars/RelatedArticlesSidebar.tsx";

interface Author {
  name: string;
  image?: {
    asset: {
      url: string;
    };
  };
}

interface Category {
  title: string;
}

interface ArticleDetailProps {
  title: string;
  publishedAt?: string;
  author?: Author;
  mainImage?: {
    asset: {
      url: string;
    };
  };
  categories?: Category[];
  subtitle?: string;
  body?: any[];
  children?: JSX.Element | JSX.Element[] | null;
  backLink: {
    url: string;
    label: string;
  };
  customSidebar?: JSX.Element;
  rating?: number;
  ratingText?: string;
  articleId?: string;
  articleType?: "anmeldelse" | "nyhed" | "debat" | "feature";
  relatedArticles?: any[]; // Pre-fetched related articles
}

// Format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("da-DK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ArticleDetail({
  title,
  publishedAt,
  author,
  mainImage,
  categories,
  subtitle,
  body,
  children,
  backLink,
  customSidebar,
  rating,
  ratingText,
  articleId,
  articleType,
  relatedArticles,
}: ArticleDetailProps) {
  // Sidebar component
  const sidebarContent = customSidebar ? customSidebar : (
    articleId && articleType
      ? (
        <RelatedArticlesSidebar
          articleType={articleType}
          currentId={articleId}
          limit={3}
          relatedArticles={relatedArticles}
        />
      )
      : (
        // Fallback for backward compatibility
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-secondary/20 pb-2">
            Relaterede artikler
          </h2>
          <div className="p-4 bg-background-light/30 border border-secondary/20">
            <p className="text-black/70 text-sm">
              Ingen relaterede artikler tilgængelige
            </p>
          </div>
        </div>
      )
  );

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Breadcrumb - now outside the grid to span full width */}
      <div className="mb-6 border-b border-secondary/20 pb-2">
        <a
          href={backLink.url}
          className="text-black/70 hover:text-accent-gold transition-colors text-sm font-medium"
        >
          ← {backLink.label}
        </a>
      </div>

      {/* Content with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content column */}
        <div className="lg:col-span-9">
          {/* Header with feature image */}
          {mainImage
            ? (
              <div className="w-full h-96 relative mb-8 overflow-hidden">
                <img
                  src={mainImage.asset.url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                </div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                    {title}
                  </h1>
                  <div className="flex flex-wrap items-center text-white gap-4">
                    {subtitle
                      ? <div className="text-gray-300">{subtitle}</div>
                      : null}
                    {author
                      ? (
                        <div className="text-gray-300">
                          Af {author.name || "Ukendt forfatter"}
                        </div>
                      )
                      : null}
                    {publishedAt
                      ? (
                        <div className="text-gray-300">
                          {formatDate(publishedAt)}
                        </div>
                      )
                      : null}
                    {categories && categories.length > 0
                      ? (
                        <div className="flex gap-2 flex-wrap">
                          {categories.map((category) => (
                            <span
                              key={category.title}
                              className="bg-background-light/50 px-2 py-1 text-xs text-white/90"
                            >
                              {category.title}
                            </span>
                          ))}
                        </div>
                      )
                      : null}
                  </div>
                </div>
              </div>
            )
            : (
              <div className="mb-8 border-b border-secondary/20 pb-6">
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-black mb-4">
                  {title}
                </h1>
                {subtitle
                  ? (
                    <p className="font-serif text-xl text-black/80 mb-4 leading-relaxed">
                      {subtitle}
                    </p>
                  )
                  : null}
                <div className="flex flex-wrap items-center gap-4 text-black/70 mb-4">
                  {author
                    ? (
                      <div className="flex items-center gap-2">
                        {author.image?.asset?.url
                          ? (
                            <img
                              src={author.image.asset.url}
                              alt={author.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          )
                          : null}
                        <span>Af {author.name}</span>
                      </div>
                    )
                    : null}
                  {publishedAt ? <div>{formatDate(publishedAt)}</div> : null}
                  {categories && categories.length > 0
                    ? (
                      <div className="flex gap-2 flex-wrap">
                        {categories.map((category) => (
                          <span
                            key={category.title}
                            className="bg-background-light/50 px-2 py-1 text-xs text-black/70"
                          >
                            {category.title}
                          </span>
                        ))}
                      </div>
                    )
                    : null}
                </div>
              </div>
            )}

          {/* Article content - with Polygon-like narrow text column */}
          <div className="prose max-w-none font-serif">
            <div className="max-w-[65ch] mx-auto">
              {body ? parseContent(body) : <p>Ingen indhold tilgængeligt.</p>}
              {children}
              {rating && <RatingCard rating={rating} ratingText={ratingText} />}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3">
          <div className="sticky top-8 mt-0">
            {/* Use our sidebar content */}
            {sidebarContent}
          </div>
        </div>
      </div>
    </div>
  );
}
