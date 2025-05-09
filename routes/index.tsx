import { client } from "../utils/sanity.ts";
import Layout from "../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import ArticleCard from "../components/cards/ArticleCard.tsx";
import ArticleSidebar from "../components/sidebars/ArticleSidebar.tsx";
import SimpleSidebar from "../components/sidebars/SimpleSidebar.tsx";
import UpcomingGames from "../components/cards/UpcomingGames.tsx";
import Divider from "../components/misc/Divider.tsx";
import { Content, DebatEntry, MestVentedeSpil } from "../types/content.ts";
import { getContentRoute, getExcerptText } from "../utils/content.ts";
import {
  getEditorsPicksContent,
  getLatestContent,
  getMestVentedeSpil,
  getRecentDebatEntries,
  getRecentNewsItems,
} from "../utils/sanity-queries.ts";

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
      const latestContent = await getLatestContent(client);

      // Get featured content (the first 3)
      const featuredContent = latestContent.slice(0, 3);

      // Get editor's picks (content marked as redaktionensUdvalgte)
      const editorsPicksContent = await getEditorsPicksContent(client);

      // Get the 5 most recent debat entries
      const recentDebatEntries = await getRecentDebatEntries(client);

      // Get the most recent news items
      const newsItems = await getRecentNewsItems(client);

      // Get mest ventede spil
      const mestVentedeSpil = await getMestVentedeSpil(client);

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
              <div>
                <ArticleCard
                  content={featuredContent[0]}
                  size="large"
                  className="shadow-none border-0 bg-transparent"
                />
                <Divider spacing="md" />
              </div>
            )}

            {/* To-kolonners grid under fremhævet indhold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Sekundære fremhævede historier */}
              {featuredContent.slice(1, 3).map((content) => (
                <ArticleCard
                  key={content.slug.current}
                  content={content}
                  size="medium"
                  className="shadow-none border-0 bg-transparent"
                />
              ))}
            </div>
            {/* Seneste Artikler sektion */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4">
                Flere Artikler
              </h3>
              <Divider spacing="md" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
                {latestArticles.map((content) => (
                  <ArticleCard
                    key={content.slug.current}
                    content={content}
                    size="small"
                    showExcerpt={true}
                    showDate={true}
                    showAuthor={false}
                    horizontal={true}
                    className="shadow-none border-0 bg-transparent h-full"
                  />
                ))}
              </div>
            </div>

            {/* Mest Ventede Spil sektion - dynamisk fra Sanity */}
            <UpcomingGames games={mestVentedeSpil} />
          </div>

          {/* Højre sidebar - 4 kolonner på skrivebord */}
          <div className="lg:col-span-4">
            {/* Nyheder sektion */}
            <ArticleSidebar
              title="Seneste Nyheder"
              viewAllLink={{ url: "/nyhed", text: "Se alle nyheder" }}
              items={newsItems}
              limit={3}
              showImage={false}
              className="mb-8"
            />

            {/* Debat sektion */}
            <ArticleSidebar
              title="Debat & Analyse"
              viewAllLink={{ url: "/debat", text: "Se alle debatindlæg" }}
              items={recentDebatEntries}
              limit={5}
              className="mb-8"
              contentType="debat"
            />

            {/* Redaktionens Udvalgte */}
            <SimpleSidebar
              title="Redaktionens Udvalgte"
              items={editorsPicksContent}
              className="mb-8"
            />

            {/* Nyhedsbrev tilmelding */}
            <div className="p-4 bg-background-light/30 backdrop-blur-sm mb-8 rounded-lg">
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
