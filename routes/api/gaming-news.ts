import { Handlers } from "$fresh/server.ts";
import { getLatestGamingNews, searchGamingNews } from "../../utils/newsApi.ts";

/**
 * Gaming news API endpoint
 *
 * Parameters:
 * - pageSize: number of items to return (default: 10)
 * - page: page number (default: 1)
 * - query: optional search term
 */
export const handler: Handlers = {
  async GET(req) {
    try {
      const url = new URL(req.url);
      const params = url.searchParams;

      // Get query parameters
      const pageSize = parseInt(params.get("pageSize") || "10");
      const page = parseInt(params.get("page") || "1");
      const query = params.get("query") || "";

      // Calculate offset based on page and pageSize
      const offset = (page - 1) * pageSize;

      // Get news items (either search or latest)
      let items;
      if (query) {
        items = await searchGamingNews(query, pageSize * page);
        // Get the correct slice for the current page
        items = items.slice(offset, offset + pageSize);
      } else {
        // For latest news, we get more items than needed to support pagination
        const allItems = await getLatestGamingNews(pageSize * page);
        items = allItems.slice(offset, offset + pageSize);
      }

      // Convert Date objects to strings for JSON serialization
      const serializedItems = items.map((item) => ({
        ...item,
        pubDate: item.pubDate.toISOString(),
      }));

      // Return JSON response
      return new Response(
        JSON.stringify({
          items: serializedItems,
          page,
          pageSize,
          total: items.length,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "max-age=600", // Cache for 10 minutes
          },
        },
      );
    } catch (error) {
      console.error("Error in gaming news API:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to fetch gaming news",
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
