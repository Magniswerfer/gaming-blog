# Setting Up IGDB Integration for Questline

This guide explains how to set up the IGDB (Internet Game Database) integration
for Questline to enable game search and data retrieval in Sanity Studio.

## Prerequisites

1. A Twitch Developer Account
2. Access to your Fresh server environment (development and/or production)

## Step 1: Create a Twitch Developer Application

1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Log in with your Twitch account (create one if needed)
3. Click on "Register Your Application"
4. Fill in the required fields:
   - **Name**: Questline IGDB Integration (or any name you prefer)
   - **OAuth Redirect URLs**: http://localhost:8000 (for development)
   - **Category**: Select "Website Integration"
5. Click "Create"
6. You'll be provided with a **Client ID**
7. Generate a **Client Secret** by clicking "New Secret"
8. **Important**: Save both the Client ID and Client Secret securely - you'll
   need them for the next steps

## Step 2: Configure Environment Variables

### For Development

1. Create a `.env` file in the root of your project:

```
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

2. Replace the placeholders with your actual Client ID and Client Secret

### For Production

Configure the environment variables in your hosting provider's dashboard:

- For Deno Deploy:
  1. Go to your project on [Deno Deploy](https://dash.deno.com)
  2. Navigate to Settings → Environment Variables
  3. Add `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` with their respective
     values

## Step 3: Verify the Integration

1. Start your development server: `deno task dev`
2. Open your Sanity Studio: `cd studio && npm run dev`
3. Create a new Game document
4. Try searching for a game in the Game Title field
5. If the search works, your integration is set up correctly

## Troubleshooting

If you encounter issues with the IGDB integration, check the following:

1. **Error Messages**: Look for specific error messages in the Sanity Studio
   interface
2. **Environment Variables**: Ensure your environment variables are correctly
   set
3. **Console Errors**: Check your browser console and server logs for error
   details
4. **CORS Issues**: If you see CORS-related errors, verify that your Sanity
   Studio domain is included in the allowed origins list in the IGDB proxy
   endpoint

## API Limits

The IGDB API has rate limits that you should be aware of:

- 4 requests per second
- 500 requests per minute (for authenticated requests)

The integration implements caching to reduce API calls, but if you exceed these
limits, you may encounter errors.

## Additional Resources

- [IGDB API Documentation](https://api-docs.igdb.com/)
- [Twitch Developer Portal](https://dev.twitch.tv/)
