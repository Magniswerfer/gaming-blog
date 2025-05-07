// Helper function to get game cover image from gameJson
export function getGameCoverImage(gameJson: string): string {
  try {
    const gameData = JSON.parse(gameJson);
    if (gameData && gameData.cover && gameData.cover.url) {
      // IGDB images typically need to be resized - using t_cover_big format
      return gameData.cover.url.replace("t_thumb", "t_cover_big");
    }
  } catch (e) {
    console.error("Failed to parse game JSON:", e);
  }

  // Fallback image if parsing fails or no cover available
  return "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60";
}
