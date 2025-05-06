import GameCard from "./GameCard.tsx";

interface Game {
  title: string;
  image: string;
  description: string;
}

interface UpcomingGamesProps {
  games: Game[];
  title?: string;
  subtitle?: string;
}

export default function UpcomingGames({
  games,
  title = "Kommende Spil",
  subtitle = "De spil vi glæder os til",
}: UpcomingGamesProps) {
  return (
    <section className="w-full bg-background-light py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-10">
          <h2 className="font-heading font-black tracking-heading text-4xl text-black mb-2">
            {title}
          </h2>
          <p className="text-black/80 text-xl">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {games.map((game) => (
            <div
              key={game.title}
              className="flex flex-col bg-background-dark rounded-xl border border-secondary/20 hover:border-accent-gold/50 transition-all overflow-hidden"
            >
              <div className="relative aspect-video w-full overflow-hidden">
                <img
                  src={game.image}
                  alt={game.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 w-full bg-primary/80 backdrop-blur-sm p-3">
                  <h3 className="font-heading font-bold text-lg text-white">
                    {game.title}
                  </h3>
                </div>
              </div>

              <div className="p-5">
                <h4 className="text-accent-earth font-medium text-sm uppercase mb-2">
                  Hvorfor vi glæder os
                </h4>
                <p className="text-black">
                  {game.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
