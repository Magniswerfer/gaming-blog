import { serve } from "https://deno.land/std@0.215.0/http/server.ts";

// API endpoints
const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/token";
const IGDB_API_URL = "https://api.igdb.com/v4";

// Cache for authentication token
interface TokenCache {
  accessToken: string;
  expiresAt: number; // Timestamp when the token expires
}

let tokenCache: TokenCache | null = null;

// Explicitly allow requests from Sanity Studio
const ALLOWED_ORIGINS = [
  "http://localhost:3333",
  "http://127.0.0.1:3333",
  "https://questline.sanity.studio",
];

// Get CORS headers based on the origin of the request
function getCorsHeaders(origin: string | null): HeadersInit {
  // Allow the specific origin that made the request (if it's in our allowed list)
  // This is more secure than using a wildcard "*"
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin || "")
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    "Access-Control-Allow-Origin": allowedOrigin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
    "Access-Control-Max-Age": "86400", // 24 hours
    "Vary": "Origin", // Important when you vary response based on origin
  };
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
    throw new Error("Missing Twitch API credentials in environment variables");
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
      throw new Error(`Authentication failed: ${response.status}`);
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
    throw new Error("Failed to authenticate with Twitch API");
  }
}

/**
 * Handle incoming requests
 */
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  console.log(`${req.method} ${url.pathname} Origin: ${origin || "none"}`);

  // Handle preflight CORS requests (OPTIONS)
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Handle IGDB Games endpoint
  if (req.method === "POST" && url.pathname === "/igdb/games") {
    try {
      // Get the auth token
      const token = await getAuthToken();

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

      // Forward the request to IGDB
      const clientId = Deno.env.get("TWITCH_CLIENT_ID");
      console.log(
        `Forwarding request to IGDB: ${requestData.query.substring(0, 50)}...`,
      );

      const igdbResponse = await fetch(`${IGDB_API_URL}/games`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Client-ID": clientId!,
          "Content-Type": "application/json",
        },
        body: requestData.query,
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
      console.log(
        `IGDB response received with ${igdbData.length || 0} results`,
      );

      return new Response(
        JSON.stringify(igdbData),
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
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          message: errorMessage,
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

  // Handle unsupported routes
  return new Response(
    JSON.stringify({ error: "Not found", path: url.pathname }),
    {
      status: 404,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    },
  );
}

// Start the server
console.log("IGDB Proxy server starting on http://localhost:8000");
console.log(`Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
await serve(handler, { port: 8000 });
