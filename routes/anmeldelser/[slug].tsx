import { Handlers, PageProps } from "$fresh/server.ts";
import { client } from "../../utils/sanity.ts";
import Layout from "../../components/Layout.tsx";
import ArticleDetail from "../../components/ArticleDetail.tsx";
import RelatedArticlesSidebar, {
  fetchRelatedArticles,
} from "../../components/RelatedArticlesSidebar.tsx";
import { Fragment } from "preact";

// Define TypeScript interfaces for our data
interface Author {
  name: string;
  image?: { asset: { url: string } };
}

interface Game {
  _id: string;
  title: string;
  gameJson: string;
}

interface Review {
  _id: string;
  title: string;
  slug: { current: string };
  author: Author;
  mainImage?: { asset: { url: string } };
  rating: number;
  ratingText?: string;
  publishedAt: string;
  body: any[];
  gameData: Game;
}

export const handler: Handlers = {
  async GET(req, ctx) {
    const { slug } = ctx.params;

    try {
      // Query for the review by slug
      const review = await client.fetch(
        `
        *[_type == "anmeldelse" && slug.current == $slug][0] {
          _id,
          title,
          slug,
          "author": author->{name, image},
          mainImage,
          rating,
          ratingText,
          publishedAt,
          body,
          "gameData": gameData->{_id, title, gameJson}
        }
      `,
        { slug },
      );

      if (!review) {
        return new Response("Anmeldelse ikke fundet", { status: 404 });
      }

      // Process the mainImage to match expected format
      if (review.mainImage && review.mainImage.asset) {
        review.mainImage = {
          asset: {
            url: `https://cdn.sanity.io/images/lebsytll/production/${
              review.mainImage.asset._ref
                .replace("image-", "")
                .replace("-jpg", ".jpg")
                .replace("-png", ".png")
                .replace("-webp", ".webp")
            }`,
          },
        };
      }

      // Process author image if it exists
      if (review.author && review.author.image && review.author.image.asset) {
        review.author.image = {
          asset: {
            url: `https://cdn.sanity.io/images/lebsytll/production/${
              review.author.image.asset._ref
                .replace("image-", "")
                .replace("-jpg", ".jpg")
                .replace("-png", ".png")
                .replace("-webp", ".webp")
            }`,
          },
        };
      }

      // Fetch related articles
      const relatedArticles = await fetchRelatedArticles(
        "anmeldelse",
        review._id,
        3,
      );

      return ctx.render({ review, relatedArticles });
    } catch (error) {
      console.error("Error fetching review:", error);
      return ctx.render({ error: String(error) });
    }
  },
};

// Component to render the game data sidebar
function GameDataSidebar({ gameData }: { gameData: Game }) {
  if (!gameData || !gameData.gameJson) {
    return (
      <div className="p-4 bg-background-light/30 border border-secondary/20">
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
      <div className="bg-background-light/30 backdrop-blur-sm border border-secondary/20 overflow-hidden shadow-md">
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
                  .map((company: any) =>
                    company.company.name
                  )
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
      <div className="p-4 bg-background-light/30 border border-secondary/20">
        <p className="text-black/70 text-sm">Kunne ikke vise spilinformation</p>
      </div>
    );
  }
}

// Review sidebar component that combines the game data with related links
function ReviewSidebar(
  { review, relatedArticles }: { review: Review; relatedArticles: any[] },
) {
  return (
    <>
      <h2 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-secondary/20 pb-2">
        Spil information
      </h2>
      {review.gameData
        ? <GameDataSidebar gameData={review.gameData} />
        : (
          <div className="p-4 bg-background-light/30 border border-secondary/20">
            <p className="text-black/70 text-sm">
              Ingen spilinformation tilgængelig
            </p>
          </div>
        )}

      {/* Use the new RelatedArticlesSidebar component */}
      <div className="mt-8">
        <RelatedArticlesSidebar
          articleType="anmeldelse"
          currentId={review._id}
          limit={3}
          relatedArticles={relatedArticles}
        />
      </div>
    </>
  );
}

export default function AnmeldelseView(
  { data }: PageProps<
    { review?: Review; relatedArticles?: any[]; error?: string }
  >,
) {
  const { review, relatedArticles = [], error } = data;

  if (error) {
    return (
      <Layout title="Fejl | CRITICO">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-6">
            <p>Der opstod en fejl: {error}</p>
          </div>
          <a
            href="/anmeldelser"
            className="text-black hover:text-accent-gold transition-colors"
          >
            ← Tilbage til anmeldelser
          </a>
        </div>
      </Layout>
    );
  }

  if (!review) {
    return (
      <Layout title="Anmeldelse ikke fundet | CRITICO">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-6">
            <p>Anmeldelsen blev ikke fundet.</p>
          </div>
          <a
            href="/anmeldelser"
            className="text-black hover:text-accent-gold transition-colors"
          >
            ← Tilbage til anmeldelser
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${review.title} | CRITICO`}>
      <ArticleDetail
        title={review.title}
        publishedAt={review.publishedAt}
        author={review.author}
        mainImage={review.mainImage}
        body={review.body}
        backLink={{ url: "/anmeldelser", label: "Tilbage til anmeldelser" }}
        customSidebar={
          <ReviewSidebar review={review} relatedArticles={relatedArticles} />
        }
        rating={review.rating}
        ratingText={review.ratingText}
        articleId={review._id}
        articleType="anmeldelse"
        relatedArticles={relatedArticles}
      />
    </Layout>
  );
}
