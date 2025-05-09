// Helper function to get game cover image from gameJson
export function getGameCoverImage(
  gameJson: string,
  width?: number,
  height?: number,
): string {
  try {
    const gameData = JSON.parse(gameJson);
    if (gameData && gameData.cover && gameData.cover.url) {
      // IGDB images typically need to be resized - using t_cover_big format
      let url = gameData.cover.url.replace("t_thumb", "t_cover_big");

      // Apply dimensions if provided (IGDB uses a special URL format for resizing)
      if (width || height) {
        // First ensure URL is absolute
        if (url.startsWith("//")) {
          url = `https:${url}`;
        }

        // Add resizing parameters to the URL
        const resizeParams = [];
        if (width) resizeParams.push(`w=${width}`);
        if (height) resizeParams.push(`h=${height}`);

        // Add query parameters if they don't already exist
        if (url.includes("?")) {
          url += `&${resizeParams.join("&")}`;
        } else {
          url += `?${resizeParams.join("&")}`;
        }

        // Add quality parameter
        url += width && width < 300 ? "&q=90" : "&q=80";
      }

      return url;
    }
  } catch (e) {
    console.error("Failed to parse game JSON:", e);
  }

  // Fallback image if parsing fails or no cover available
  const fallbackUrl =
    "https://images.unsplash.com/photo-1542751371-adc38448a05e";

  // Add width, height, and quality parameters to the fallback URL
  let resizedFallback = `${fallbackUrl}?`;
  if (width) resizedFallback += `w=${width}&`;
  if (height) resizedFallback += `h=${height}&`;
  // Add higher quality for smaller images
  resizedFallback += width && width < 300 ? "q=90" : "q=80";

  return resizedFallback;
}
