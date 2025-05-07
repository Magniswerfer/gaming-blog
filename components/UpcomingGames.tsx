import { getGameCoverImage } from "../utils/gameUtils.ts";

interface Game {
  title: string;
  teaserText: string;
  game?: {
    title: string;
    gameJson: string;
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
  return (
    <div className="mb-8 border-b border-secondary/20 pb-6">
      <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-secondary/20 pb-2">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {games.map((game, index) => {
          const coverImage = game.game?.gameJson
            ? getGameCoverImage(game.game.gameJson)
            : "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60";

          return (
            <article
              key={index}
              className="mb-2 flex flex-col max-w-[220px] bg-white border border-black p-4"
            >
              <div className="flex mb-2">
                <div className="mr-3 w-24 aspect-[3/4] relative overflow-hidden flex-shrink-0">
                  <img
                    src={coverImage}
                    alt={game.title || game.game?.title || ""}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                </div>
                <div className="flex-grow flex items-center">
                  <h3 className="font-bold text-base leading-tight">
                    {game.title || game.game?.title || ""}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-600">
                {game.teaserText}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
