import { Handlers, PageProps } from "$fresh/server.ts";
import { client } from "../../utils/sanity.ts";
import Layout from "../../components/Layout.tsx";

// Define TypeScript interfaces for our data
interface Author {
  name: string;
  image?: any;
}

interface Review {
  _id: string;
  title: string;
  slug: { current: string };
  author: Author;
  mainImage?: any;
  rating: number;
  publishedAt: string;
  gameData?: {
    title: string;
  };
}

export const handler: Handlers = {
  async GET(req, ctx) {
    try {
      // Query for all reviews, sorted by publish date
      const reviews = await client.fetch(`
        *[_type == "anmeldelse"] | order(publishedAt desc) {
          _id,
          title,
          slug,
          "author": author->{name, image},
          mainImage,
          rating,
          publishedAt,
          "gameData": gameData->{title}
        }
      `);
      return ctx.render({ reviews });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return ctx.render({ reviews: [], error: String(error) });
    }
  },
};

export default function Anmeldelser(
  { data }: PageProps<{ reviews: Review[]; error?: string }>,
) {
  const { reviews, error } = data;

  return (
    <Layout title="Anmeldelser | The Questline">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-6 text-black border-b border-secondary/20 pb-2">
          Anmeldelser
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <p>Der opstod en fejl: {error}</p>
          </div>
        )}

        {!error && reviews.length === 0 && (
          <p className="text-black/70">Ingen anmeldelser fundet.</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <a
              href={`/anmeldelser/${review.slug.current}`}
              key={review._id}
              className="group bg-background-light/30 border border-secondary/20 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
            >
              {review.mainImage && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={`https://cdn.sanity.io/images/lebsytll/production/${
                      review.mainImage?.asset?._ref.replace("image-", "")
                        .replace("-jpg", ".jpg")
                    }`}
                    alt={review.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-4">
                <h2 className="text-xl font-serif font-semibold mb-2 text-black group-hover:text-accent-gold transition-colors">
                  {review.title}
                </h2>

                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center text-sm text-black/70">
                    <span>
                      Af {review.author?.name || "Ukendt forfatter"}
                    </span>
                  </div>

                  <div className="flex items-center bg-[#F5D76E] px-2 py-1 rounded">
                    <span className="font-bold">{review.rating}/10</span>
                  </div>
                </div>

                {review.gameData?.title && (
                  <div className="text-sm text-black/70 mt-2">
                    Spil: {review.gameData.title}
                  </div>
                )}

                <div className="text-sm text-black/70 mt-2">
                  {new Date(review.publishedAt).toLocaleDateString("da-DK", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </Layout>
  );
}
