import { useEffect, useState } from "preact/hooks";

// Interface for search items from Sanity
interface SearchItem {
  _id: string;
  _type: string;
  title: string;
  description?: string;
  publishedAt?: string;
  coverImage?: string;
  category: string;
  url: string;
}

interface SearchPageProps {
  initialQuery: string;
}

export default function SearchPage({ initialQuery }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial search if there's a query parameter
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, []);

  // Handle search
  const performSearch = async (value: string) => {
    if (!value || value.trim() === "") {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set("q", value);
      window.history.replaceState({}, "", url.toString());

      // Simple fetch with error handling
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(value)}`,
      );

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.items || []);
    } catch (err) {
      console.error("Search error:", err);
      setError("Der opstod en fejl under søgningen. Prøv igen senere.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
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
  };

  // Get category badge color
  const getCategoryColor = (category: string) => {
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
  };

  return (
    <div className="mb-10">
      <h1 className="text-3xl font-bold mb-6">Søg</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onInput={(e) =>
                setSearchQuery((e.target as HTMLInputElement).value)}
              placeholder="Søg efter anmeldelser, nyheder, features og debatter..."
              className="w-full px-4 py-3 border border-secondary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Søgefelt"
              disabled={isLoading}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setResults([]);
                }}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-black/50 hover:text-black"
                disabled={isLoading}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-primary hover:bg-primary/10"
              disabled={isLoading}
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
            className="md:w-auto px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Søger..." : "Søg"}
          </button>
        </div>
      </form>

      {/* Status and results */}
      <div>
        {/* Loading */}
        {isLoading && <p className="text-center py-4">Søger...</p>}

        {/* Error */}
        {error && !isLoading && <p className="text-red-600 mb-4">{error}</p>}

        {/* Results count */}
        {searchQuery && !isLoading && !error && (
          <p className="text-sm mb-4 text-black/70">
            {results.length === 0
              ? "Ingen resultater fundet"
              : `Fandt ${results.length} resultat${
                results.length === 1 ? "" : "er"
              }`}
          </p>
        )}

        {/* Results */}
        {!isLoading && results.length > 0 && (
          <div className="space-y-6">
            {results.map((item) => (
              <article
                key={item._id}
                className="border-b border-secondary/10 pb-6"
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {item.coverImage && (
                    <div className="w-full md:w-1/4 shrink-0">
                      <a href={item.url} className="hover:opacity-90 block">
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

                  <div className={item.coverImage ? "md:w-3/4" : "w-full"}>
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

                    <h2 className="text-xl font-bold mb-1">
                      <a
                        href={item.url}
                        className="hover:text-primary hover:no-underline"
                      >
                        {item.title}
                      </a>
                    </h2>

                    {item.description && (
                      <p className="text-black/70 mb-3">{item.description}</p>
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
        )}
      </div>
    </div>
  );
}
