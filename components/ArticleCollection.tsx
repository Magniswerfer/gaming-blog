import { JSX } from "preact";
import ArticleCard from "./ArticleCard.tsx";

interface ContentItem {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage?: {
    asset: {
      url: string;
    };
  };
  resume?: string;
  summary?: string;
  underrubrik?: string;
  author?: {
    name: string;
    image?: {
      asset: {
        url: string;
      };
    };
  };
  isBreaking?: boolean;
  rating?: number;
}

interface ArticleCollectionProps {
  items: ContentItem[];
  layout?: "grid" | "list" | "featured";
  emptyMessage?: string;
  showExcerpt?: boolean;
  imageWidth?: "1/4" | "1/3" | "1/2";
}

export default function ArticleCollection({
  items,
  layout = "grid",
  emptyMessage = "Ingen indhold tilgængeligt i øjeblikket. Kom tilbage senere.",
  showExcerpt = true,
  imageWidth = "1/3",
}: ArticleCollectionProps): JSX.Element {
  // For featured layout, we need to split into featured item and the rest
  const featuredItem = layout === "featured" && items.length > 0
    ? items[0]
    : null;
  const remainingItems = layout === "featured" && items.length > 1
    ? items.slice(1)
    : items;

  if (items.length === 0) {
    return (
      <div class="bg-background-light/20 p-8 text-center mb-12">
        <p class="text-black/90">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Featured layout with a highlighted first item */}
      {layout === "featured" && featuredItem && (
        <div class="mb-12 border-b border-secondary/20 pb-6">
          <a
            href={`/${featuredItem._type}/${featuredItem.slug.current}`}
            class="block hover:no-underline group"
          >
            <article class="grid grid-cols-1 md:grid-cols-12 gap-6">
              {featuredItem.mainImage?.asset?.url
                ? (
                  <div class="md:col-span-7 overflow-hidden">
                    <div class="overflow-hidden aspect-[16/10]">
                      <img
                        src={featuredItem.mainImage.asset.url}
                        alt={featuredItem.title}
                        class="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )
                : null}
              <div class="md:col-span-5 flex flex-col">
                <div>
                  <h2 class="font-sans font-bold text-4xl md:text-5xl mb-3 leading-tight">
                    <span class="text-black group-hover:underline">
                      {featuredItem.title}
                    </span>
                  </h2>
                  {featuredItem.underrubrik && (
                    <p class="font-serif text-xl text-black/90 font-medium mb-3">
                      {featuredItem.underrubrik}
                    </p>
                  )}
                  {showExcerpt && featuredItem.resume && (
                    <p class="font-serif text-base text-black/80 mb-4">
                      {featuredItem.resume}
                    </p>
                  )}
                  {showExcerpt && !featuredItem.resume &&
                    featuredItem.summary && (
                    <p class="font-serif text-base text-black/80 mb-4">
                      {featuredItem.summary}
                    </p>
                  )}
                </div>
                <div class="flex flex-wrap items-center text-xs text-black/60 gap-2 mt-2">
                  {featuredItem.author && (
                    <span>{featuredItem.author.name}</span>
                  )}
                  {featuredItem.publishedAt && (
                    <>
                      <span>•</span>
                      <span>
                        {new Date(featuredItem.publishedAt)
                          .toLocaleDateString("da-DK", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </article>
          </a>
        </div>
      )}

      {/* Display items in grid view */}
      {layout === "grid" && (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {items.map((item) => (
            <ArticleCard
              key={item._id}
              content={{
                _type: item._type,
                title: item.title,
                slug: item.slug,
                publishedAt: item.publishedAt,
                mainImage: item.mainImage,
                resume: item.resume,
                summary: item.summary,
                author: item.author,
                isBreaking: item.isBreaking,
                rating: item.rating,
              }}
              showExcerpt={showExcerpt}
              className="h-full flex flex-col transition-colors hover:bg-background-light/5"
            />
          ))}
        </div>
      )}

      {/* Display items in list view */}
      {layout === "list" && (
        <div class="grid grid-cols-1 gap-8 mb-12">
          {items.map((item) => (
            <a
              href={`/${item._type}/${item.slug.current}`}
              class="block hover:no-underline group"
              key={item._id}
            >
              <article class="flex flex-col md:flex-row gap-6 pb-8 transition-colors hover:bg-background-light/5">
                {item.mainImage?.asset?.url
                  ? (
                    <div class={`md:w-${imageWidth} overflow-hidden`}>
                      <div class="overflow-hidden">
                        <img
                          src={item.mainImage.asset.url}
                          alt={item.title}
                          class="w-full h-auto object-cover"
                        />
                      </div>
                    </div>
                  )
                  : null}
                <div
                  class={`md:w-${
                    imageWidth === "1/2"
                      ? "1/2"
                      : (imageWidth === "1/4" ? "3/4" : "2/3")
                  } flex flex-col`}
                >
                  <div>
                    <h2 class="font-sans font-bold text-2xl md:text-3xl mb-2 leading-tight">
                      <span class="text-black group-hover:underline">
                        {item.title}
                      </span>
                    </h2>

                    {item.underrubrik && (
                      <p class="font-serif text-lg font-medium text-black/90 mb-2 leading-snug">
                        {item.underrubrik}
                      </p>
                    )}

                    {showExcerpt && item.resume && (
                      <p class="font-serif text-base text-black/80 mb-3 leading-relaxed">
                        {item.resume}
                      </p>
                    )}
                    {showExcerpt && !item.resume && item.summary && (
                      <p class="font-serif text-base text-black/80 mb-3 leading-relaxed">
                        {item.summary}
                      </p>
                    )}

                    {/* Byline now appears right after the content, not pushed to bottom */}
                    <div class="flex flex-wrap items-center text-xs text-black/60 gap-2 mt-2">
                      {item.author && <span>{item.author.name}</span>}
                      {item.publishedAt && (
                        <>
                          <span>•</span>
                          <span>
                            {new Date(item.publishedAt)
                              .toLocaleDateString(
                                "da-DK",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                },
                              )}
                          </span>
                        </>
                      )}
                      {item.rating !== undefined && (
                        <>
                          <span>•</span>
                          <div class="inline-block bg-[#F5D76E] px-2 py-1">
                            <span class="font-bold">
                              {item.rating}/10
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </a>
          ))}
        </div>
      )}

      {/* Featured layout remainder displayed in grid */}
      {layout === "featured" && remainingItems.length > 0 && (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {remainingItems.map((item) => (
            <ArticleCard
              key={item._id}
              content={{
                _type: item._type,
                title: item.title,
                slug: item.slug,
                publishedAt: item.publishedAt,
                mainImage: item.mainImage,
                resume: item.resume,
                summary: item.summary,
                author: item.author,
                isBreaking: item.isBreaking,
                rating: item.rating,
              }}
              showExcerpt={showExcerpt}
              className="h-full flex flex-col transition-colors hover:bg-background-light/5"
            />
          ))}
        </div>
      )}
    </>
  );
}
