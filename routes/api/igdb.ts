import { HandlerContext } from "$fresh/server.ts";

// API endpoints
const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_API_URL = "https://api.igdb.com/v4";

// Allowed origins for CORS - will allow the same origin by default
const ALLOWED_ORIGINS = [
  "http://localhost:3333", // Sanity Studio local development
  "http://127.0.0.1:3333",
  "https://questline.sanity.studio", // Deployed Sanity Studio
];

// Cache for authentication token
interface TokenCache {
  accessToken: string;
  expiresAt: number; // Timestamp when the token expires
}

// Cache for IGDB responses (to reduce API calls)
interface IgdbResponseCache {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

let tokenCache: TokenCache | null = null;
// Simple in-memory cache with 30-minute TTL
const igdbCache: IgdbResponseCache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Get CORS headers based on the request origin
 */
function getCorsHeaders(origin: string | null): Record<string, string> {
  // Add all possible development URLs for Sanity Studio
  const allAllowedOrigins = [
    ...ALLOWED_ORIGINS,
    "http://localhost:3333",
    "http://127.0.0.1:3333",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
  ];

  // Simply allow all origins while in development
  // In production, we should be more strict, but for dev we'll be permissive
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
    "Access-Control-Max-Age": "86400", // 24 hours
  };
}

/**
 * Create a cache key from request parameters
 */
function createCacheKey(query: string, expanded: boolean): string {
  return `${expanded ? "expanded:" : ""}${query}`;
}

/**
 * Check if we have a valid cached response
 */
function getCachedResponse(query: string, expanded: boolean): any | null {
  const key = createCacheKey(query, expanded);
  const now = Date.now();
  const cachedItem = igdbCache[key];

  if (cachedItem && now - cachedItem.timestamp < CACHE_TTL) {
    console.log(`Cache hit for query: ${query.substring(0, 50)}...`);
    return cachedItem.data;
  }

  return null;
}

/**
 * Store response in cache
 */
function cacheResponse(query: string, expanded: boolean, data: any): void {
  const key = createCacheKey(query, expanded);
  igdbCache[key] = {
    data,
    timestamp: Date.now(),
  };
}

/**
 * Clean expired items from cache (call periodically)
 */
function cleanupCache(): void {
  const now = Date.now();
  Object.keys(igdbCache).forEach((key) => {
    if (now - igdbCache[key].timestamp > CACHE_TTL) {
      delete igdbCache[key];
    }
  });
}

/**
 * Fetch authentication token from Twitch API
 */
async function getAuthToken(): Promise<string> {
  // Check if we have a valid cached token
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.accessToken;
  }

  const clientId = Deno.env.get("TWITCH_CLIENT_ID");
  const clientSecret = Deno.env.get("TWITCH_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Twitch API credentials in environment variables. " +
        "Please set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET. " +
        "You can get these by creating an application at https://dev.twitch.tv/console/apps",
    );
  }

  try {
    const response = await fetch(
      `${TWITCH_AUTH_URL}?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
      {
        method: "POST",
      },
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Twitch authentication failed:", errorData);
      throw new Error(
        `Authentication failed: ${response.status}. Please check your Twitch API credentials.`,
      );
    }

    const data = await response.json();

    // Cache the token
    tokenCache = {
      accessToken: data.access_token,
      // Set expiry time with a small buffer (5 minutes)
      expiresAt: now + (data.expires_in * 1000) - (5 * 60 * 1000),
    };

    return data.access_token;
  } catch (error) {
    console.error("Error fetching Twitch auth token:", error);
    throw new Error(
      "Failed to authenticate with Twitch API. " +
        (error instanceof Error ? error.message : "Unknown error"),
    );
  }
}

/**
 * Process and fix image URLs from IGDB
 * IGDB returns URLs sometimes without https: prefix
 */
function processImageUrls(data: any): any {
  if (!data) return data;

  // If it's an array, process each item
  if (Array.isArray(data)) {
    return data.map((item) => processImageUrls(item));
  }

  // If it's an object, look for specific image fields
  if (typeof data === "object") {
    const result = { ...data };

    // Process cover.url
    if (result.cover && result.cover.url) {
      if (result.cover.url.startsWith("//")) {
        result.cover.url = `https:${result.cover.url}`;
      }
    }

    // Process screenshots array
    if (result.screenshots && Array.isArray(result.screenshots)) {
      result.screenshots = result.screenshots.map((screenshot: any) => {
        if (screenshot.url && screenshot.url.startsWith("//")) {
          return { ...screenshot, url: `https:${screenshot.url}` };
        }
        return screenshot;
      });
    }

    // Process other fields recursively
    Object.keys(result).forEach((key) => {
      if (typeof result[key] === "object" && result[key] !== null) {
        result[key] = processImageUrls(result[key]);
      }
    });

    return result;
  }

  return data;
}

/**
 * Handler for all requests to the IGDB endpoint
 */
export async function handler(
  req: Request,
  _ctx: HandlerContext,
): Promise<Response> {
  // For debugging, log the request details
  console.log(
    `IGDB API request: ${req.method} from ${
      req.headers.get("Origin") || "unknown"
    }`,
  );

  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log(`CORS preflight request from origin: ${origin || "unknown"}`);
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests for actual API calls
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        error: "Method not allowed",
        message: "Only POST method is supported",
      }),
      {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }

  try {
    // Clean up expired cache entries
    cleanupCache();

    // Get the request body (the IGDB query)
    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      console.error("Error parsing request JSON:", e);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    if (!requestData || !requestData.query) {
      return new Response(
        JSON.stringify({ error: "Missing query in request body" }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    const isExpanded = !!requestData.expanded;
    const query = requestData.query;

    // Check cache first
    const cachedData = getCachedResponse(query, isExpanded);
    if (cachedData) {
      return new Response(
        JSON.stringify(cachedData),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
            "X-Cache-Hit": "true",
          },
        },
      );
    }

    // Get the auth token
    const token = await getAuthToken();

    // Forward the request to IGDB
    const clientId = Deno.env.get("TWITCH_CLIENT_ID");
    console.log(
      `IGDB query from ${origin || "unknown"}: ${query.substring(0, 50)}...`,
    );

    const igdbResponse = await fetch(`${IGDB_API_URL}/games`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Client-ID": clientId!,
        "Content-Type": "application/json",
      },
      body: query,
    });

    if (!igdbResponse.ok) {
      const errorText = await igdbResponse.text();
      console.error("IGDB API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Error from IGDB API", details: errorText }),
        {
          status: igdbResponse.status,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        },
      );
    }

    // Return the IGDB response
    const igdbData = await igdbResponse.json();

    // If the request is specifically for expanded game data, fetch additional details
    if (isExpanded && igdbData.length > 0) {
      try {
        const gameId = igdbData[0].id;
        console.log(`Fetching expanded data for game ID: ${gameId}`);

        // Fetch detailed game data with company and platform info
        const detailsResponse = await fetch(`${IGDB_API_URL}/games`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Client-ID": clientId!,
            "Content-Type": "application/json",
          },
          body: `
            fields name, summary, first_release_date, cover.url, genres.name, 
            involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
            platforms.name, screenshots.url, artworks.url, rating, total_rating, aggregated_rating;
            where id = ${gameId};
          `,
        });

        if (!detailsResponse.ok) {
          console.error("Failed to fetch expanded game details");
          // Return the original data if expanded fetch fails
          const processedData = processImageUrls(igdbData);
          cacheResponse(query, isExpanded, processedData);
          return new Response(
            JSON.stringify(processedData),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            },
          );
        }

        const detailedData = await detailsResponse.json();

        if (detailedData.length > 0) {
          console.log("Successfully fetched expanded game data");
          // Process any image URLs and cache the response
          const processedData = processImageUrls(detailedData);
          cacheResponse(query, isExpanded, processedData);

          // Return the enriched data
          return new Response(
            JSON.stringify(processedData),
            {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                ...corsHeaders,
              },
            },
          );
        }
      } catch (error) {
        console.error("Error fetching expanded game data:", error);
        // If any error occurs, fall back to the original data
      }
    }

    console.log(`IGDB response received with ${igdbData.length || 0} results`);

    // Process and cache the original IGDB response
    const processedData = processImageUrls(igdbData);
    cacheResponse(query, isExpanded, processedData);

    // Return the processed IGDB response
    return new Response(
      JSON.stringify(processedData),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  } catch (error: unknown) {
    console.error("Error handling request:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error";

    // Add a more specific message for common errors
    let userMessage = errorMessage;
    if (errorMessage.includes("Missing Twitch API credentials")) {
      userMessage =
        "The IGDB integration is not properly configured. Please set up your TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET environment variables.";
    }

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: userMessage,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  }
}
