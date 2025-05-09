import { JSX } from "preact";

interface Game {
  _id: string;
  title: string;
  gameJson: string;
}

export default function GameDataSidebar({
  gameData,
  className = "",
}: {
  gameData: Game;
  className?: string;
}): JSX.Element {
  if (!gameData || !gameData.gameJson) {
    return (
      <div
        className={`p-4 bg-background-light border border-secondary/20 ${className}`}
      >
        <p className="text-black/70 text-sm">
          Ingen spilinformation tilgængelig
        </p>
      </div>
    );
  }

  try {
    const gameInfo = JSON.parse(gameData.gameJson);

    // Format image URL
    const getImageUrl = (url: string) => {
      if (!url) return "";
      // Make sure URL is absolute
      const fullUrl = url.startsWith("//") ? `https:${url}` : url;
      // Replace thumb with cover_big
      return fullUrl.replace("t_thumb", "t_cover_big");
    };

    return (
      <div
        className={`bg-background-light border border-secondary/20 overflow-hidden ${className}`}
      >
        {/* Game cover */}
        {gameInfo.cover?.url && (
          <div className="mb-2">
            <img
              src={getImageUrl(gameInfo.cover.url)}
              alt={gameInfo.name}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Game title */}
        <div className="p-4">
          <h3 className="text-xl font-serif font-semibold mb-2 text-black">
            {gameInfo.name}
          </h3>

          {/* Release year */}
          {gameInfo.first_release_date && (
            <div className="mb-3 text-black/70">
              <span>
                Udgivet:{" "}
                {new Date(gameInfo.first_release_date * 1000).getFullYear()}
              </span>
            </div>
          )}

          {/* Developer */}
          {gameInfo.involved_companies?.some((company: any) =>
            company.developer
          ) && (
            <div className="mb-3">
              <h4 className="font-semibold text-black text-sm mb-1">
                Udvikler
              </h4>
              <p className="text-black/70 text-sm">
                {gameInfo.involved_companies
                  .filter((company: any) => company.developer)
                  .map((company: any) => company.company.name)
                  .join(", ")}
              </p>
            </div>
          )}

          {/* Publisher */}
          {gameInfo.involved_companies?.some((company: any) =>
            company.publisher
          ) && (
            <div className="mb-3">
              <h4 className="font-semibold text-black text-sm mb-1">Udgiver</h4>
              <p className="text-black/70 text-sm">
                {gameInfo.involved_companies
                  .filter((company: any) => company.publisher)
                  .map((company: any) => company.company.name)
                  .join(", ")}
              </p>
            </div>
          )}

          {/* Platforms */}
          {gameInfo.platforms && gameInfo.platforms.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold text-black text-sm mb-1">
                Platforme
              </h4>
              <p className="text-black/70 text-sm">
                {gameInfo.platforms.map((platform: any) => platform.name).join(
                  ", ",
                )}
              </p>
            </div>
          )}

          {/* Genres */}
          {gameInfo.genres && gameInfo.genres.length > 0 && (
            <div className="mb-3">
              <h4 className="font-semibold text-black text-sm mb-1">Genrer</h4>
              <p className="text-black/70 text-sm">
                {gameInfo.genres.map((genre: any) => genre.name).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  } catch (e) {
    console.error("Error parsing game JSON:", e);
    return (
      <div
        className={`p-4 bg-background-light border border-secondary/20 ${className}`}
      >
        <p className="text-black/70 text-sm">Kunne ikke vise spilinformation</p>
      </div>
    );
  }
}
