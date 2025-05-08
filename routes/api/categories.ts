import { createClient } from "https://esm.sh/@sanity/client@6.12.3";
import { client as defaultClient } from "../../utils/sanity.ts";

// Create a separate client instance just for categories that bypasses the CDN
const uncachedClient = createClient({
  projectId: Deno.env.get("SANITY_PROJECT_ID") || "lebsytll",
  dataset: Deno.env.get("SANITY_DATASET") || "production",
  apiVersion: "2024-02-21",
  useCdn: false,
});

interface Category {
  _id: string;
  title: string;
  articleCount: number;
}

export async function handler(req: Request): Promise<Response> {
  try {
    const categories = await uncachedClient.fetch<Category[]>(`
      *[_type == "kategori"] {
        _id,
        title,
        "articleCount": count(*[
          _type in ["nyhed", "debat", "anmeldelse", "feature"] &&
          references(^._id)
        ])
      }
    `);

    const activeCategories = categories.filter((cat) => cat.articleCount > 0);

    return new Response(JSON.stringify(activeCategories), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch categories" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
