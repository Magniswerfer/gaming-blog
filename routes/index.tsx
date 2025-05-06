import { client } from "../utils/sanity.ts";
import Layout from "../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import FeaturedGameNews from "../islands/FeaturedGameNews.tsx";
import UpcomingGames from "../components/UpcomingGames.tsx";

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
  isBreaking?: boolean;
  redaktionensUdvalgte?: boolean;
}

export const handler: Handlers<
  {
    latestContent: Content[];
    featuredContent: Content[];
    editorsPicksContent: Content[];
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
            isBreaking,
            redaktionensUdvalgte
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
            isBreaking,
            redaktionensUdvalgte
          }`,
      );

      return ctx.render({
        latestContent,
        featuredContent,
        editorsPicksContent,
      });
    } catch (error) {
      console.error("Error fetching content:", error);
      return ctx.render({
        latestContent: [],
        featuredContent: [],
        editorsPicksContent: [],
      });
    }
  },
};

// Helper function to get the excerpt text based on content type
function getExcerptText(content: Content): string {
  if (content.excerpt) return content.excerpt;
  if (content.ingress) return content.ingress;
  if (content.summary) return content.summary;
  if (content.subtitle) return content.subtitle;
  return "Ingen resumé tilgængelig";
}

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

export default function Home(
  { data }: PageProps<
    {
      latestContent: Content[];
      featuredContent: Content[];
      editorsPicksContent: Content[];
    }
  >,
) {
  const { latestContent, featuredContent, editorsPicksContent } = data;

  // Top stories - using the first 3 items
  const topStories = latestContent.slice(0, 3);

  // Latest news - using the next 4 items
  const latestNews = latestContent.slice(3, 7);

  // Opinion pieces - using the next 3 items
  const opinionPieces = latestContent.slice(7, 10);

  const upcomingGames = [
    {
      title: "Elden Ring: Shadow of the Erdtree",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
      description:
        "Et episk action RPG fra FromSoftware med et nyt land at udforske. Denne udvidelse til det populære Elden Ring tilføjer nye områder, våben og fjender, der vil udfordre selv de mest erfarne spillere.",
    },
    {
      title: "Final Fantasy XVI",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
      description:
        "Et nyt kapitel i den ikoniske RPG-serie med dramatisk historiefortælling. Final Fantasy XVI tager serien i en mørkere, mere actionorienteret retning med en moden fortælling og et helt nyt kampsystem.",
    },
    {
      title: "Starfield",
      image:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
      description:
        "Bethesdas nye rumrejse med åbne verdener at udforske. Med over 1000 planeter at besøge repræsenterer Starfield Bethesdas mest ambitiøse projekt til dato og vil give spillerne frihed til at forme deres egen historie.",
    },
  ];

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
                <article>
                  {featuredContent[0].isBreaking && (
                    <div className="bg-red-600 text-white px-2 py-1 text-xs font-bold inline-block mb-2">
                      BREAKING
                    </div>
                  )}
                  {featuredContent[0].mainImage?.asset?.url
                    ? (
                      <div className="mb-4">
                        <img
                          src={featuredContent[0].mainImage.asset.url}
                          alt={featuredContent[0].title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )
                    : null}
                  <h1 className="font-sans font-black text-3xl md:text-4xl mb-3 leading-tight">
                    <a
                      href={getContentRoute(featuredContent[0])}
                      className="text-black  transition-colors"
                    >
                      {featuredContent[0].title}
                    </a>
                  </h1>
                  <p className="font-serif text-base text-black/80 mb-3 leading-relaxed">
                    {getExcerptText(featuredContent[0])}
                  </p>
                  {featuredContent[0].publishedAt && (
                    <div className="text-xs text-gray-500">
                      {new Date(featuredContent[0].publishedAt)
                        .toLocaleDateString("da-DK", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                    </div>
                  )}
                </article>
              </div>
            )}

            {/* To-kolonners grid under fremhævet indhold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-secondary/20 pb-6">
              {/* Sekundære fremhævede historier */}
              {featuredContent.slice(1, 3).map((content) => (
                <article key={content.slug.current} className="mb-6">
                  {content.isBreaking && (
                    <div className="bg-red-600 text-white px-2 py-1 text-xs font-bold inline-block mb-2">
                      BREAKING
                    </div>
                  )}
                  {content.mainImage?.asset?.url
                    ? (
                      <div className="mb-3">
                        <img
                          src={content.mainImage.asset.url}
                          alt={content.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )
                    : null}
                  <h2 className="font-sans font-black text-xl mb-2 leading-tight">
                    <a
                      href={getContentRoute(content)}
                      className="text-black  transition-colors"
                    >
                      {content.title}
                    </a>
                  </h2>
                  <p className="font-serif text-sm text-black/80 mb-2">
                    {getExcerptText(content)}
                  </p>
                  {content.publishedAt && (
                    <div className="text-xs text-gray-500">
                      {new Date(content.publishedAt).toLocaleDateString(
                        "da-DK",
                        {
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>

            {/* Seneste Nyheder sektion */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-secondary/20 pb-2">
                Seneste Nyheder
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {latestNews.map((content) => (
                  <article key={content.slug.current} className="mb-4 flex">
                    {content.isBreaking && (
                      <div className="bg-red-600 text-white px-2 py-1 text-xs font-bold absolute top-0 left-0 m-1">
                        BREAKING
                      </div>
                    )}
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
                        </div>
                      )
                      : null}
                    <div>
                      <h3 className="font-bold text-base mb-1 leading-tight">
                        <a
                          href={getContentRoute(content)}
                          className="text-black  transition-colors"
                        >
                          {content.title}
                        </a>
                      </h3>
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
                  </article>
                ))}
              </div>
            </div>

            {/* Kommende Spil sektion - NYT-stil */}
            <div className="mb-8 border-b border-secondary/20 pb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-secondary/20 pb-2">
                Mest Ventede Spil
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {upcomingGames.map((game, index) => (
                  <article key={index} className="mb-4">
                    <div className="mb-2">
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-32 object-cover"
                      />
                    </div>
                    <h3 className="font-bold text-base mb-1 leading-tight">
                      {game.title}
                    </h3>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {game.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Højre sidebar - 4 kolonner på skrivebord */}
          <div className="lg:col-span-4">
            {/* Debat sektion */}
            <div className="mb-8 border-b border-secondary/20 pb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-secondary/20 pb-2">
                Debat & Analyse
              </h3>
              {opinionPieces.map((content) => (
                <article
                  key={content.slug.current}
                  className="mb-4 pb-4 border-b border-secondary/20 last:border-b-0"
                >
                  <h3 className="font-bold text-base mb-1 leading-tight">
                    <a
                      href={getContentRoute(content)}
                      className="text-black  transition-colors"
                    >
                      {content.title}
                    </a>
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {getExcerptText(content).substring(0, 100) +
                      (getExcerptText(content).length > 100 ? "..." : "")}
                  </p>
                  {content.publishedAt && (
                    <div className="text-xs text-gray-500">
                      {new Date(content.publishedAt).toLocaleDateString(
                        "da-DK",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </div>
                  )}
                </article>
              ))}
            </div>

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
