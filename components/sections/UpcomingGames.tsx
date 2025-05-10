import { getGameCoverImage } from "../../utils/gameUtils.ts";
import Divider from "../misc/Divider.tsx";

interface Game {
  title: string;
  teaserText: string;
  game?: {
    title: string;
    gameJson: string;
    slug?: {
      current: string;
    };
  };
}

interface UpcomingGamesProps {
  games: Game[];
  title?: string;
}

export default function UpcomingGames({
  games,
  title = "Mest Ventede Spil",
}: UpcomingGamesProps) {
  // Helper function to get game slug route
  function getGameRoute(game: Game): string {
    // If the game has a slug, use it
    if (game.game?.slug?.current) {
      return `/spil/${game.game.slug.current}`;
    }

    // Otherwise, generate a slug from the title
    const gameTitle = game.game?.title || game.title;
    if (gameTitle) {
      // Create a slug from title (lowercase, remove special chars, replace spaces with hyphens)
      const generatedSlug = gameTitle
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      return `/spil/${generatedSlug}`;
    }

    return "#"; // Fallback if no title is available
  }

  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-wider">
        {title}
      </h3>
      <Divider spacing="sm" />
      <div className="flex flex-nowrap overflow-x-auto gap-4 -mx-4 px-4 md:grid md:grid-cols-3 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {games.map((game, index) => {
          const coverImage = game.game?.gameJson
            ? getGameCoverImage(game.game.gameJson, 192, 256)
            : getGameCoverImage("", 192, 256);

          const gameLink = getGameRoute(game);

          return (
            <a
              key={index}
              href={gameLink}
              className="no-underline hover:no-underline group"
            >
              <article className="flex flex-col w-[220px] bg-background-light border border-secondary/20 p-4 h-full">
                <div className="flex mb-2">
                  <div className="mr-3 w-24 aspect-[3/4] relative overflow-hidden flex-shrink-0">
                    <img
                      src={coverImage}
                      alt={game.title || game.game?.title || ""}
                      className="w-full h-full object-cover absolute inset-0"
                      width={192}
                      height={256}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-grow flex items-center">
                    <h3 className="font-bold text-base leading-tight group-hover:underline">
                      {game.title || game.game?.title || ""}
                    </h3>
                  </div>
                </div>
                <p className="text-xs text-gray-600">
                  {game.teaserText}
                </p>
              </article>
            </a>
          );
        })}
      </div>
    </div>
  );
}
