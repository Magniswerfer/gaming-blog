import { Handlers } from "$fresh/server.ts";
import { client } from "../../utils/sanity.ts";

// Interface for search response items
interface SearchItem {
  _id: string;
  _type: string;
  title: string;
  slug: string;
  description?: string;
  excerpt?: string;
  resume?: string;
  publishedAt?: string;
  coverImage?: string;
  mainImage?: string;
  category: string;
}

// Search API handler
export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const query = url.searchParams.get("q") || "";

      if (!query || query.trim().length === 0) {
        return new Response(JSON.stringify({ items: [] }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Simple GROQ query to search basic content
      const searchQuery = `{
        "gameReviews": *[_type == "gameReview" && title match "*${query}*"] | order(publishedAt desc) {
          _id,
          _type,
          title,
          "slug": slug.current,
          "description": excerpt,
          publishedAt,
          "coverImage": coverImage.asset->url,
          "category": "Anmeldelser"
        },
        "news": *[_type == "nyhed" && title match "*${query}*"] | order(publishedAt desc) {
          _id,
          _type,
          title,
          "slug": slug.current,
          "description": resume,
          publishedAt,
          "mainImage": mainImage.asset->url,
          "category": "Nyheder"
        }
      }`;

      const results = await client.fetch(searchQuery);

      // Ensure we have arrays for each category
      const gameReviews = results.gameReviews || [];
      const news = results.news || [];

      // Merge and transform the results
      const allItems = [
        ...gameReviews.map((item: SearchItem) => ({
          ...item,
          url: `/anmeldelser/${item.slug}`,
        })),
        ...news.map((item: SearchItem) => ({
          ...item,
          url: `/nyhed/${item.slug}`,
          coverImage: item.mainImage,
        })),
      ];

      return new Response(JSON.stringify({ items: allItems }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Search error:", error);
      return new Response(
        JSON.stringify({
          error: "Der opstod en fejl under søgningen",
          details: error instanceof Error ? error.message : String(error),
          items: [],
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
