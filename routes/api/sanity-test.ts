import { Handlers } from "$fresh/server.ts";
import { client } from "../../utils/sanity.ts";

// Simple test handler to check Sanity connection and content types
export const handler: Handlers = {
  async GET(_req) {
    try {
      // First, get all document types in the database
      const typesQuery = `array::unique(*._type)`;
      const types = await client.fetch(typesQuery) as string[];

      // Create a query to get basic information about each content type
      const queriesObj: Record<string, string> = {};

      // Add a query for each type found in the database
      for (const type of types) {
        queriesObj[`${type}Count`] = `count(*[_type == "${type}"])`;
        queriesObj[`${type}Sample`] = `*[_type == "${type}"][0...2] {
          _id, _type, title, "slug": slug.current
        }`;
        queriesObj[`${type}Schema`] = `*[_type == "${type}"][0] {
          _id, _type, 
          "fields": defined(*) || {}
        }`;
      }

      // Build the complete GROQ query string
      const groqQuery = `{${
        Object.entries(queriesObj).map(([key, query]) => `"${key}": ${query}`)
          .join(",")
      },"allTypes": ${typesQuery}}`;

      // Execute the query
      const results = await client.fetch(groqQuery) as Record<string, any>;

      // Process results into a more readable format
      const contentStats: Record<string, number> = {};
      const contentSamples: Record<string, any[]> = {};
      const schemaInfo: Record<string, string[]> = {};

      for (const key of Object.keys(results)) {
        if (key.endsWith("Count")) {
          const typeName = key.replace("Count", "");
          contentStats[typeName] = results[key] || 0;
        } else if (key.endsWith("Sample")) {
          const typeName = key.replace("Sample", "");
          contentSamples[typeName] = results[key] || [];
        } else if (key.endsWith("Schema")) {
          const typeName = key.replace("Schema", "");
          if (results[key]?.length > 0) {
            const fields = results[key][0]?.fields;
            schemaInfo[typeName] = Object.keys(fields || {});
          }
        }
      }

      const searchableTypes = [
        "gameReview",
        "nyhed",
        "feature",
        "debat",
        "anmeldelse",
        "artikel",
        "news",
        "review",
        "feature",
        "debate",
      ];

      const foundSearchableTypes = searchableTypes.filter((type) =>
        types.includes(type) && contentStats[type] > 0
      );

      return new Response(
        JSON.stringify(
          {
            success: true,
            message: "Sanity connection is working",
            allDocumentTypes: types,
            contentStats,
            searchableContentTypes: foundSearchableTypes,
            contentSamples,
            schemaInfo,
          },
          null,
          2,
        ),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("Sanity test error:", error);

      return new Response(
        JSON.stringify({
          success: false,
          message: "Sanity connection failed",
          error: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
};
