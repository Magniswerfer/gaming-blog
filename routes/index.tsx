import { client } from "../utils/sanity.ts";
import Layout from "../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import ContentCard from "../components/ContentCard.tsx";
import ContentSection from "../components/ContentSection.tsx";

interface Content {
  _type: string;
  title: string;
  slug: { current: string };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  publishedAt?: string;
  excerpt?: string;
  summary?: string;
  subtitle?: string;
  ingress?: string;
  resume?: string;
  underrubrik?: string;
  isBreaking?: boolean;
  redaktionensUdvalgte?: boolean;
  author?: {
    name: string;
  };
}

interface DebatEntry {
  title: string;
  slug: { current: string };
  summary?: string;
  underrubrik?: string;
  publishedAt?: string;
  author?: {
    name: string;
  };
}

interface MestVentedeSpil {
  title: string;
  teaserText: string;
  publishedAt: string;
  game: {
    title: string;
    gameJson: string;
  };
}

export const handler: Handlers<
  {
    latestContent: Content[];
    featuredContent: Content[];
    editorsPicksContent: Content[];
    recentDebatEntries: DebatEntry[];
    newsItems: Content[];
    mestVentedeSpil: MestVentedeSpil[];
  }
> = {
  async GET(_, ctx) {
    try {
      // Fetch all content types ordered by publish date
      const latestContent = await client.fetch<Content[]>(
        `*[_type in ["nyhed", "feature", "anmeldelse", "debat"]] | order(publishedAt desc)[0...12] {
            _type,
            title,
            slug,
            "mainImage": mainImage{asset->{url}},
            publishedAt,
            excerpt,
            summary,
            subtitle,
            ingress,
            resume,
            underrubrik,
            isBreaking,
            redaktionensUdvalgte,
            "author": author->{name}
          }`,
      );

      // Get featured content (the first 3)
      const featuredContent = latestContent.slice(0, 3);

      // Get editor's picks (content marked as redaktionensUdvalgte)
      const editorsPicksContent = await client.fetch<Content[]>(
        `*[_type in ["nyhed", "feature", "anmeldelse", "debat"] && redaktionensUdvalgte == true] | order(publishedAt desc)[0...5] {
            _type,
            title,
            slug,
            "mainImage": mainImage{asset->{url}},
            publishedAt,
            excerpt,
            summary,
            subtitle,
            ingress,
            resume,
            underrubrik,
            isBreaking,
            redaktionensUdvalgte,
            "author": author->{name}
          }`,
      );

      // Get the 5 most recent debat entries
      const recentDebatEntries = await client.fetch<DebatEntry[]>(
        `*[_type == "debat"] | order(publishedAt desc)[0...5] {
            title,
            slug,
            summary,
            underrubrik,
            publishedAt,
            "author": author->{name}
          }`,
      );

      // Get the most recent news items
      const newsItems = await client.fetch<Content[]>(
        `*[_type == "nyhed"] | order(publishedAt desc)[0...8] {
            _type,
            title,
            slug,
            "mainImage": mainImage{asset->{url}},
            publishedAt,
            resume,
            summary,
            isBreaking,
            "author": author->{name}
          }`,
      );

      // Get mest ventede spil
      const mestVentedeSpil = await client.fetch<MestVentedeSpil[]>(
        `*[_type == "mestVentedeSpil"] | order(publishedAt desc)[0...3] {
            title,
            teaserText,
            publishedAt,
            "game": game->{
              title,
              gameJson
            }
          }`,
      );

      return ctx.render({
        latestContent,
        featuredContent,
        editorsPicksContent,
        recentDebatEntries,
        newsItems,
        mestVentedeSpil,
      });
    } catch (error) {
      console.error("Error fetching content:", error);
      return ctx.render({
        latestContent: [],
        featuredContent: [],
        editorsPicksContent: [],
        recentDebatEntries: [],
        newsItems: [],
        mestVentedeSpil: [],
      });
    }
  },
};

// Helper function to get the correct route for different content types
function getContentRoute(content: Content): string {
  switch (content._type) {
    case "feature":
      return `/features/${content.slug.current}`;
    case "anmeldelse":
      return `/anmeldelser/${content.slug.current}`;
    case "debat":
      return `/debat/${content.slug.current}`;
    case "nyhed":
      return `/nyhed/${content.slug.current}`;
    default:
      return `/${content.slug.current}`;
  }
}

// Helper function to get excerpt text
function getExcerptText(content: Content): string {
  if (content.resume) return content.resume;
  if (content.summary) return content.summary;
  if (content.ingress) return content.ingress;
  if (content.excerpt) return content.excerpt;
  if (content.subtitle) return content.subtitle;
  return "Ingen resumé tilgængelig";
}

// Helper function to get game cover image from gameJson
function getGameCoverImage(gameJson: string): string {
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

export default function Home(
  { data }: PageProps<
    {
      latestContent: Content[];
      featuredContent: Content[];
      editorsPicksContent: Content[];
      recentDebatEntries: DebatEntry[];
      newsItems: Content[];
      mestVentedeSpil: MestVentedeSpil[];
    }
  >,
) {
  const {
    latestContent,
    featuredContent,
    editorsPicksContent,
    recentDebatEntries,
    newsItems,
    mestVentedeSpil,
  } = data;

  // Latest news - using items 3-6 (after the featured content)
  const latestArticles = latestContent.slice(3, 7);

  return (
    <Layout>
      {/* NYT-lignende hovedindholdsområde */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Hoved grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hovedindhold - 8 kolonner på skrivebord */}
          <div className="lg:col-span-8">
            {/* Fremhævet indhold - hovedoverskrift */}
            {featuredContent.length > 0 && (
              <div className="mb-8 border-b border-secondary/20 pb-6">
                <ContentCard
                  content={featuredContent[0]}
                  size="large"
                  className="shadow-none border-0 bg-transparent"
                />
              </div>
            )}

            {/* To-kolonners grid under fremhævet indhold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-secondary/20 pb-6">
              {/* Sekundære fremhævede historier */}
              {featuredContent.slice(1, 3).map((content) => (
                <ContentCard
                  key={content.slug.current}
                  content={content}
                  size="medium"
                  className="shadow-none border-0 bg-transparent"
                />
              ))}
            </div>

            {/* Seneste Artikler sektion */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-secondary/20 pb-2">
                Seneste Artikler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestArticles.map((content) => (
                  <div key={content.slug.current} className="flex mb-4">
                    {content.mainImage?.asset?.url
                      ? (
                        <div
                          className="mr-3 flex-shrink-0 relative"
                          style={{ width: "100px" }}
                        >
                          <img
                            src={content.mainImage.asset.url}
                            alt={content.title}
                            className="w-full h-full object-cover"
                          />
                          {content.isBreaking && (
                            <div className="bg-red-600 text-white px-1 py-0.5 text-xs font-bold absolute top-0 left-0">
                              BREAKING
                            </div>
                          )}
                        </div>
                      )
                      : (
                        <div
                          className="mr-3 flex-shrink-0 relative bg-secondary/10 flex items-center justify-center"
                          style={{ width: "100px", height: "70px" }}
                        >
                          <span className="text-secondary/50 text-xs uppercase font-medium">
                            {content._type}
                          </span>
                          {content.isBreaking && (
                            <div className="bg-red-600 text-white px-1 py-0.5 text-xs font-bold absolute top-0 left-0">
                              BREAKING
                            </div>
                          )}
                        </div>
                      )}
                    <div>
                      <h3 className="font-bold text-base mb-1 leading-tight">
                        <a
                          href={getContentRoute(content)}
                          className="text-black transition-colors"
                        >
                          {content.title}
                        </a>
                      </h3>
                      {getExcerptText(content) && (
                        <p className="text-xs text-black/80 mb-1 line-clamp-2">
                          {getExcerptText(content)}
                        </p>
                      )}
                      {content.publishedAt && (
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(content.publishedAt).toLocaleDateString(
                            "da-DK",
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mest Ventede Spil sektion - dynamisk fra Sanity */}
            <div className="mb-8 border-b border-secondary/20 pb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-secondary/20 pb-2">
                Mest Ventede Spil
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mestVentedeSpil.map((game, index) => {
                  // Extract image from gameJson if available
                  const coverImage = game.game?.gameJson
                    ? getGameCoverImage(game.game.gameJson)
                    : "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60";

                  return (
                    <article
                      key={index}
                      className="mb-4 flex flex-col max-w-[220px]"
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
          </div>

          {/* Højre sidebar - 4 kolonner på skrivebord */}
          <div className="lg:col-span-4">
            {/* Nyheder sektion */}
            <ContentSection
              title="Seneste Nyheder"
              viewAllLink={{ url: "/nyhed", text: "Se alle nyheder" }}
              items={newsItems}
              limit={3}
              showImage={false}
              className="mb-8"
            />

            {/* Debat sektion */}
            <ContentSection
              title="Debat & Analyse"
              viewAllLink={{ url: "/debat", text: "Se alle debatindlæg" }}
              items={recentDebatEntries}
              limit={5}
              className="mb-8"
              contentType="debat"
            />

            {/* Redaktionens Udvalgte */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-secondary/20 pb-2">
                Redaktionens Udvalgte
              </h3>
              <ul className="space-y-3">
                {editorsPicksContent.map((content) => (
                  <li
                    key={content.slug.current}
                    className="border-b border-secondary/20 pb-3"
                  >
                    <a
                      href={getContentRoute(content)}
                      className="text-sm font-medium text-black  transition-colors"
                    >
                      {content.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Nyhedsbrev tilmelding */}
            <div className="p-4 bg-background-light/30 backdrop-blur-sm mb-8 border border-secondary/20 rounded-lg">
              <h3 className="font-sans font-black text-lg mb-2">
                Spil Ugen
              </h3>
              <p className="text-sm text-black/80 mb-3">
                Få vores kuraterede ugentlige oversigt over det bedste inden for
                videospil, leveret direkte til din indbakke.
              </p>
              <form className="space-y-2">
                <input
                  type="email"
                  placeholder="Din e-mailadresse"
                  className="w-full px-3 py-2 border border-secondary/20 text-sm"
                />
                <button className="w-full bg-secondary hover:bg-accent-gold text-white py-2 text-sm font-medium transition-colors">
                  Tilmeld
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
