import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../components/Layout.tsx";
import { Head } from "$fresh/runtime.ts";
import { client } from "../utils/sanity.ts";

// Interface for search items from Sanity
interface SearchItem {
  _id: string;
  _type: string;
  title: string;
  description?: string;
  publishedAt?: string;
  coverImage?: string;
  mainImage?: string;
  category: string;
  url: string;
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
      description: "excerpt",
      image: "coverImage.asset->url",
    },
  },
  anmeldelse: {
    category: "Anmeldelser",
    urlPrefix: "/anmeldelser/",
    fields: {
      description: "excerpt",
      image: "coverImage.asset->url",
    },
  },
  review: {
    category: "Anmeldelser",
    urlPrefix: "/anmeldelser/",
    fields: {
      description: "excerpt",
      image: "coverImage.asset->url",
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
      description: "excerpt",
      image: "coverImage.asset->url",
    },
  },
  artikel: {
    category: "Features",
    urlPrefix: "/features/",
    fields: {
      description: "excerpt",
      image: "coverImage.asset->url",
    },
  },

  // Debates
  debat: {
    category: "Debat",
    urlPrefix: "/debat/",
    fields: {
      description: "excerpt",
      image: "coverImage.asset->url",
    },
  },
  debate: {
    category: "Debat",
    urlPrefix: "/debat/",
    fields: {
      description: "excerpt",
      image: "coverImage.asset->url",
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

        return `"${type}": *[_type == "${type}" && (
          title match "*${query}*" || 
          coalesce(${descriptionField}, "") match "*${query}*"
        )][0...10] {
          _id,
          _type,
          title,
          "slug": slug.current,
          "${descriptionField}": ${descriptionField},
          publishedAt,
          "${config.fields.image.split("->")[0]}": ${config.fields.image}
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

        const transformedItems = typeResults.map((item: any) => {
          // Determine which field has the description
          const descriptionField = config.fields.description;
          const description = item[descriptionField];

          // Determine which field has the image
          const imageField = config.fields.image.split("->")[0];
          const coverImage = item[imageField];

          return {
            _id: item._id,
            _type: item._type,
            title: item.title,
            description,
            publishedAt: item.publishedAt,
            coverImage,
            category: config.category,
            url: `${config.urlPrefix}${item.slug}`,
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

  // Group results by category
  const resultsByCategory: Record<string, SearchItem[]> = {};

  results.forEach((item) => {
    if (!resultsByCategory[item.category]) {
      resultsByCategory[item.category] = [];
    }
    resultsByCategory[item.category].push(item);
  });

  // Get category display names and order
  const categoryOrder = ["Anmeldelser", "Nyheder", "Features", "Debat"];
  const categories = Object.keys(resultsByCategory).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b),
  );

  return (
    <Layout title="Søg | CRITICO">
      <Head>
        <title>Søg | CRITICO</title>
        <meta
          name="description"
          content="Søg i alle artikler, anmeldelser og features på CRITICO"
        />
      </Head>

      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-6">Søg</h1>

          <form method="GET" action="/search" className="mb-8">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Søg efter anmeldelser, nyheder, features og debatter..."
                  className="w-full px-4 py-3 border border-secondary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label="Søgefelt"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-primary hover:bg-primary/10"
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
                className="md:w-auto px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Søg
              </button>
            </div>
          </form>

          {/* Error */}
          {error && <p className="text-red-600 mb-4">{error}</p>}

          {/* Results count */}
          {query && !error && (
            <p className="text-sm mb-4 text-black/70">
              {results.length === 0
                ? "Ingen resultater fundet"
                : `Fandt ${results.length} resultat${
                  results.length === 1 ? "" : "er"
                }`}
            </p>
          )}

          {/* Results by category */}
          {results.length > 0 && (
            <div>
              {categories.map((category) => (
                <div key={category} className="mb-8">
                  <h2 className="text-xl font-bold mb-4 pb-2 border-b border-secondary/20">
                    {category} ({resultsByCategory[category].length})
                  </h2>

                  <div className="space-y-6">
                    {resultsByCategory[category].map((item) => (
                      <article
                        key={item._id}
                        className="border-b border-secondary/10 pb-6"
                      >
                        <div className="flex flex-col md:flex-row gap-4">
                          {item.coverImage && (
                            <div className="w-full md:w-1/4 shrink-0">
                              <a
                                href={item.url}
                                className="hover:opacity-90 block"
                              >
                                <div className="aspect-video bg-black/5 rounded-md overflow-hidden">
                                  <img
                                    src={item.coverImage}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </a>
                            </div>
                          )}

                          <div
                            className={item.coverImage ? "md:w-3/4" : "w-full"}
                          >
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  getCategoryColor(item.category)
                                }`}
                              >
                                {item.category}
                              </span>
                              {item.publishedAt && (
                                <span className="text-xs text-black/60">
                                  {formatDate(item.publishedAt)}
                                </span>
                              )}
                            </div>

                            <h3 className="text-xl font-bold mb-1">
                              <a
                                href={item.url}
                                className="hover:text-primary hover:no-underline"
                              >
                                {item.title}
                              </a>
                            </h3>

                            {item.description && (
                              <p className="text-black/70 mb-3">
                                {item.description}
                              </p>
                            )}

                            <a
                              href={item.url}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              Læs mere
                            </a>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
