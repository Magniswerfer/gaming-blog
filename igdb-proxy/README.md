# IGDB API Proxy Server

A simple Deno server that acts as a proxy between your frontend application and
the IGDB API.

## Features

- Authenticates with Twitch OAuth2
- Caches the auth token until it expires
- Handles CORS headers
- Forwards requests to IGDB API
- Compatible with Deno Deploy

## Setup

1. Create a `.env` file in the same directory as the `main.ts` file with the
   following content:

```
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

Replace the placeholders with your actual Twitch API credentials.

## Running Locally

Run the server with:

```
deno run --allow-env --allow-net main.ts
```

The server will start on http://localhost:8000

## Deploying to Deno Deploy

1. Create a new project on [Deno Deploy](https://deno.com/deploy)
2. Link to your GitHub repository or upload the `main.ts` file directly
3. Add environment variables for `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`
4. The server will be deployed to a URL like
   `https://your-project-name.deno.dev`

## Usage

Send POST requests to `/igdb/games` with a JSON body containing a `query`
property:

```javascript
fetch("http://localhost:8000/igdb/games", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    query:
      'fields name,cover.url,first_release_date; search "Zelda"; limit 10;',
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

Update the URL to your Deno Deploy URL when deploying to production.
