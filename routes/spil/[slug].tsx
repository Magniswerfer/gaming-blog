import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../../components/Layout.tsx";
import { client } from "../../utils/sanity.ts";
import ArticleCollection from "../../components/sections/ArticleCollection.tsx";
import Divider from "../../components/misc/Divider.tsx";

// Interface for game data
interface GameData {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  gameJson?: string;
  parsedGameData?: {
    name: string;
    cover?: { url: string };
    summary?: string;
    genres?: Array<{ name: string }>;
    platforms?: Array<{ name: string }>;
    release_dates?: Array<{ human: string }>;
    rating?: number;
    rating_count?: number;
    screenshots?: Array<{ url: string }>;
  };
}

// Interface for content items that mention this game
interface ContentItem {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage?: {
    asset: {
      url: string;
    };
  };
  resume?: string;
  summary?: string;
  underrubrik?: string;
  author?: {
    name: string;
    image?: {
      asset: {
        url: string;
      };
    };
  };
  rating?: number;
}

interface GamePageData {
  game: GameData;
  relatedContent: ContentItem[];
  error?: string;
}

export const handler: Handlers<GamePageData> = {
  async GET(req, ctx) {
    try {
      const { slug } = ctx.params;

      // Fetch game data by slug
      const gameQuery = `*[_type == "gameData" && slug.current == $slug][0]{
        _id,
        _type,
        title,
        slug,
        gameJson
      }`;

      const game = await client.fetch(gameQuery, { slug }) as GameData;

      if (!game) {
        return ctx.render({
          game: {} as GameData,
          relatedContent: [],
          error: "Spillet blev ikke fundet",
        });
      }

      // Parse game JSON data
      if (game.gameJson) {
        try {
          game.parsedGameData = JSON.parse(game.gameJson);
        } catch (e) {
          console.error("Failed to parse game JSON:", e);
        }
      }

      // Fetch content that mentions this game
      // This query should be adjusted based on how games are referenced in your content
      const relatedContentQuery =
        `*[_type in ["debat", "anmeldelse", "feature", "nyhed"] && (references($gameId) || title match $gameTitle)][0...20]{
        _id,
        _type,
        title,
        slug,
        publishedAt,
        mainImage {
          asset->{
            url
          }
        },
        resume,
        author->{
          name,
          image{
            asset->{
              url
            }
          }
        },
        rating
      }`;

      const relatedContent = await client.fetch(relatedContentQuery, {
        gameId: game._id,
        gameTitle: `*${game.title}*`,
      }) as ContentItem[];

      // Add category as underrubrik for display
      const enhancedRelatedContent = relatedContent.map((item) => {
        let category = "Artikel";

        switch (item._type) {
          case "anmeldelse":
          case "gameReview":
          case "review":
            category = "Anmeldelse";
            break;
          case "nyhed":
          case "news":
            category = "Nyhed";
            break;
          case "feature":
          case "artikel":
            category = "Feature";
            break;
          case "debat":
          case "debate":
            category = "Debat";
            break;
        }

        return {
          ...item,
          underrubrik: category,
        };
      });

      return ctx.render({
        game,
        relatedContent: enhancedRelatedContent,
      });
    } catch (error) {
      console.error("Error fetching game data:", error);
      return ctx.render({
        game: {} as GameData,
        relatedContent: [],
        error:
          "Der opstod en fejl ved indlæsning af spillet. Prøv igen senere.",
      });
    }
  },
};

export default function GamePage({ data }: PageProps<GamePageData>) {
  const { game, relatedContent, error } = data;
  const gameData = game.parsedGameData || {};

  // Format genres for display
  const genreText =
    game.parsedGameData?.genres?.map((g) => g.name).join(", ") || "N/A";

  // Get release date
  const releaseDate = game.parsedGameData?.release_dates?.[0]?.human || "N/A";

  // Get cover image URL
  const coverUrl = game.parsedGameData?.cover?.url
    ? game.parsedGameData.cover.url.replace("t_thumb", "t_cover_big")
    : "/img/no-cover.jpg";

  return (
    <Layout title={`${game.title || "Spil"} | CRITICO`}>
      {error && (
        <div class="max-w-7xl mx-auto px-4 py-8">
          <div class="bg-red-900/20 text-red-900 p-4 mb-8">
            <p>{error}</p>
          </div>
        </div>
      )}

      {game.title && (
        <>
          <div class="pt-8">
            <div class="max-w-7xl mx-auto px-4">
              <div class="flex flex-col md:flex-row gap-8">
                {/* Game cover image */}
                <div class="md:w-1/3 lg:w-1/4">
                  <div class="overflow-hidden">
                    <img
                      src={coverUrl}
                      alt={game.title}
                      class="w-full h-auto object-cover"
                    />
                  </div>
                </div>

                {/* Game info */}
                <div class="md:w-2/3 lg:w-3/4">
                  <h1 class="font-sans font-black text-4xl md:text-5xl text-black mb-3">
                    {game.title}
                  </h1>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <h2 class="text-sm uppercase font-medium text-black/60 mb-1">
                        Genre
                      </h2>
                      <p class="font-medium text-black">{genreText}</p>
                    </div>

                    <div>
                      <h2 class="text-sm uppercase font-medium text-black/60 mb-1">
                        Udgivelsesdato
                      </h2>
                      <p class="font-medium text-black">{releaseDate}</p>
                    </div>

                    {game.parsedGameData?.platforms && (
                      <div class="md:col-span-2">
                        <h2 class="text-sm uppercase font-medium text-black/60 mb-1">
                          Platforme
                        </h2>
                        <p class="font-medium text-black">
                          {game.parsedGameData?.platforms?.map((p) => p.name)
                            .join(", ")}
                        </p>
                      </div>
                    )}
                  </div>

                  {game.parsedGameData?.summary && (
                    <div class="mt-6">
                      <h2 class="text-sm uppercase font-medium text-black/60 mb-2">
                        Beskrivelse
                      </h2>
                      <p class="text-black/90">
                        {game.parsedGameData?.summary}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <Divider spacing="lg" />
            </div>
          </div>

          <div class="max-w-7xl mx-auto px-4 pb-8">
            <h2 class="font-sans font-bold text-2xl text-black mb-4">
              Artikler om {game.title}
            </h2>

            {relatedContent.length > 0
              ? (
                <ArticleCollection
                  items={relatedContent}
                  layout="grid"
                  showExcerpt={true}
                  emptyMessage="Ingen artikler fundet om dette spil."
                />
              )
              : (
                <p class="text-black/60 mb-8">
                  Der er endnu ikke skrevet artikler om dette spil.
                </p>
              )}
          </div>
        </>
      )}
    </Layout>
  );
}
