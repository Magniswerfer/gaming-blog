import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../components/Layout.tsx";
import { Head } from "$fresh/runtime.ts";
import { client } from "../utils/sanity.ts";
import ArticleCollection from "../components/sections/ArticleCollection.tsx";

// Interface for search items from Sanity
interface SearchItem {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  description?: string;
  publishedAt?: string;
  mainImage?: {
    asset: {
      url: string;
    };
  };
  resume?: string;
  coverImage?: string;
  category: string;
  author?: {
    name: string;
    image?: {
      asset: {
        url: string;
      };
    };
  };
  rating?: number;
}

interface ContentTypeConfig {
  category: string;
  urlPrefix: string;
  fields: {
    description: string;
    image: string;
  };
}

interface SearchData {
  query: string;
  results: SearchItem[];
  error?: string;
}

// Content type mapping to handle different schema types
const CONTENT_TYPE_CONFIG: Record<string, ContentTypeConfig> = {
  // Game reviews
  gameReview: {
    category: "Anmeldelser",
    urlPrefix: "/anmeldelser/",
    fields: {
      description: "resume",
      image: "coverImage.asset->url",
    },
  },
  anmeldelse: {
    category: "Anmeldelser",
    urlPrefix: "/anmeldelser/",
    fields: {
      description: "resume",
      image: "mainImage.asset->url",
    },
  },
  review: {
    category: "Anmeldelser",
    urlPrefix: "/anmeldelser/",
    fields: {
      description: "resume",
      image: "mainImage.asset->url",
    },
  },

  // News articles
  nyhed: {
    category: "Nyheder",
    urlPrefix: "/nyhed/",
    fields: {
      description: "resume",
      image: "mainImage.asset->url",
    },
  },
  news: {
    category: "Nyheder",
    urlPrefix: "/nyhed/",
    fields: {
      description: "resume",
      image: "mainImage.asset->url",
    },
  },

  // Features
  feature: {
    category: "Features",
    urlPrefix: "/features/",
    fields: {
      description: "resume",
      image: "mainImage.asset->url",
    },
  },
  artikel: {
    category: "Features",
    urlPrefix: "/features/",
    fields: {
      description: "resume",
      image: "mainImage.asset->url",
    },
  },

  // Debates
  debat: {
    category: "Debat",
    urlPrefix: "/debat/",
    fields: {
      description: "resume",
      image: "mainImage.asset->url",
    },
  },
  debate: {
    category: "Debat",
    urlPrefix: "/debat/",
    fields: {
      description: "resume",
      image: "mainImage.asset->url",
    },
  },
};

// Handler to perform search on the server side
export const handler: Handlers<SearchData> = {
  async GET(req, ctx) {
    // Get search query from URL
    const url = new URL(req.url);
    const query = url.searchParams.get("q") || "";

    if (!query) {
      return await ctx.render({ query, results: [] });
    }

    try {
      // First, get all available document types
      const typesQuery = `array::unique(*._type)`;
      const allTypes = await client.fetch(typesQuery) as string[];

      // Filter to only searchable content types that exist in the database
      const searchableTypes = Object.keys(CONTENT_TYPE_CONFIG).filter(
        (type) => allTypes.includes(type),
      );

      if (searchableTypes.length === 0) {
        console.warn("No searchable content types found in database");
        return await ctx.render({
          query,
          results: [],
          error:
            "Ingen søgbare indholdstyper fundet. Kontakt venligst administratoren.",
        });
      }

      // Build sub-queries for each content type
      const typeQueries = searchableTypes.map((type) => {
        const config = CONTENT_TYPE_CONFIG[type];
        const descriptionField = config.fields.description;
        const imageFieldPath = config.fields.image.split("->")[0]; // e.g., mainImage.asset

        return `"${type}": *[_type == "${type}" && (
          title match "*${query}*" || 
          coalesce(${descriptionField}, "") match "*${query}*"
        )][0...10] {
          _id,
          _type,
          title,
          "slug": { "current": slug.current },
          "${descriptionField}": ${descriptionField},
          publishedAt,
          "mainImage": {
            "asset": {
              "url": ${imageFieldPath}->url
            }
          },
          "author": author->{name, image},
          rating
        }`;
      });

      // Combine all queries
      const searchQuery = `{${typeQueries.join(",")}}`;
      const results = await client.fetch(searchQuery);

      // Transform results into a standardized format
      let allItems: SearchItem[] = [];

      for (const type of searchableTypes) {
        if (!results[type]) continue;

        const config = CONTENT_TYPE_CONFIG[type];
        const typeResults = results[type];
        const descriptionField = config.fields.description;

        // Log the first result for debugging
        if (typeResults.length > 0) {
          console.log(
            `Sample result for ${type}:`,
            JSON.stringify(typeResults[0], null, 2),
          );
        }

        const transformedItems = typeResults.map((item: any) => {
          return {
            _id: item._id,
            _type: item._type,
            title: item.title,
            slug: item.slug,
            resume: item[descriptionField],
            publishedAt: item.publishedAt || "",
            mainImage: item.mainImage,
            author: item.author,
            rating: item.rating,
            category: config.category,
          };
        });

        allItems = [...allItems, ...transformedItems];
      }

      // Sort results by date (most recent first)
      allItems.sort((a, b) => {
        const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
        const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
        return dateB - dateA;
      });

      return await ctx.render({ query, results: allItems });
    } catch (error) {
      console.error("Search error:", error);
      return await ctx.render({
        query,
        results: [],
        error: "Der opstod en fejl under søgningen. Prøv igen senere.",
      });
    }
  },
};

// Get category badge color
function getCategoryColor(category: string) {
  switch (category?.toLowerCase() || "") {
    case "anmeldelser":
      return "bg-primary/10 text-primary";
    case "nyheder":
      return "bg-secondary/10 text-secondary";
    case "features":
      return "bg-secondary/10 text-secondary";
    case "debat":
      return "bg-accent-earth/10 text-accent-earth";
    default:
      return "bg-black/10 text-black";
  }
}

// Format date for display
function formatDate(dateString?: string) {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("da-DK", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch (err) {
    return "";
  }
}

export default function Search({ data }: PageProps<SearchData>) {
  const { query, results, error } = data;

  // Add category as underrubrik for display and ensure all required fields are present
  const enhancedResults = results.map((item) => ({
    ...item,
    publishedAt: item.publishedAt || "", // Ensure publishedAt is always a string
    underrubrik: item.category,
  }));

  return (
    <Layout title="Søg | CRITICO">
      <div className="max-w-7xl mx-auto px-4 min-h-[calc(100vh-400px)]">
        <header className="py-8 mb-6 border-b border-secondary/20">
          <h1 className="font-sans font-black text-4xl md:text-5xl text-black mb-3">
            Søg
          </h1>
          <p className="text-black/80 max-w-3xl">
            Find artikler, anmeldelser, nyheder og features fra CRITICO
          </p>
        </header>

        <div className="py-6">
          <form method="GET" action="/search" className="mb-8">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Søg efter anmeldelser, nyheder, features og debatter..."
                  className="w-full px-4 py-3 border border-secondary/20 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Søgefelt"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-primary hover:bg-primary/10"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </button>
              </div>
              <button
                type="submit"
                className="md:w-auto px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Søg
              </button>
            </div>
          </form>

          {error && <p className="text-red-600 mb-4">{error}</p>}

          {query && !error && (
            <p className="text-sm mb-4 text-black/70">
              {results.length === 0
                ? "Ingen resultater fundet"
                : `Fandt ${results.length} resultat${
                  results.length === 1 ? "" : "er"
                }`}
            </p>
          )}

          {results.length > 0 && !error && (
            <ArticleCollection
              items={enhancedResults as any} // Type assertion to avoid type issues
              layout="grid"
              showExcerpt={true}
              emptyMessage="Ingen søgeresultater fundet"
            />
          )}

          {query && results.length === 0 && !error && (
            <div className="py-16 text-center">
              <p className="text-lg text-black/60 mb-4">
                Ingen resultater fundet for "{query}"
              </p>
              <p className="text-sm text-black/50">
                Prøv at søge efter andre nøgleord eller browse vores sektioner i
                menulinjen.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
