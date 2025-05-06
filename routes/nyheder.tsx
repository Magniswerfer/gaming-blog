import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../components/Layout.tsx";
import GameNewsItem from "../components/GameNewsItem.tsx";
import { getLatestGamingNews, NewsItem } from "../utils/newsApi.ts";

interface NewsPageData {
  items: NewsItem[];
  error?: string;
}

export const handler: Handlers<NewsPageData> = {
  async GET(_, ctx) {
    try {
      const items = await getLatestGamingNews(20);
      return ctx.render({ items });
    } catch (error) {
      console.error("Error fetching news:", error);
      return ctx.render({
        items: [],
        error: "Failed to load news. Please try again later.",
      });
    }
  },
};

export default function NewsPage({ data }: PageProps<NewsPageData>) {
  const { items, error } = data;

  return (
    <Layout title="Gaming News | The Questline">
      <div class="max-w-5xl mx-auto px-6">
        <header class="py-12 text-center">
          <h1 class="font-serif text-5xl text-white mb-4">Gaming News</h1>
          <p class="text-white/80 max-w-3xl mx-auto">
            Stay updated with the latest gaming industry news, releases, and
            announcements from around the web.
          </p>
        </header>

        {error
          ? (
            <div class="bg-red-900/20 text-red-100 p-4 rounded-lg mb-8">
              <p>{error}</p>
            </div>
          )
          : items.length === 0
          ? (
            <div class="bg-background-light/20 p-8 rounded-xl text-center mb-8">
              <p class="text-white/90">
                No gaming news available at the moment. Please check back later.
              </p>
            </div>
          )
          : (
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {items.map((item, index) => (
                <GameNewsItem
                  key={`${item.link}-${index}`}
                  item={item}
                  showSource={true}
                  showDate={true}
                  showImage={true}
                  layout="horizontal"
                  className="bg-background-light/20 p-6 rounded-lg hover:bg-background-light/30 transition-colors"
                />
              ))}
            </div>
          )}
      </div>
    </Layout>
  );
}
