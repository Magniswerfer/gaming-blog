import { Handlers, PageProps } from "$fresh/server.ts";
import { client } from "../../utils/sanity.ts";
import Layout from "../../components/Layout.tsx";
import ArticleDetail from "../../components/ArticleDetail.tsx";
import { Fragment } from "preact";

// Define TypeScript interfaces for our data
interface Author {
  name: string;
  image?: any;
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
  mainImage?: any;
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

      return ctx.render({ review });
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
function ReviewSidebar({ review }: { review: Review }) {
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

      {/* Additional Review links */}
      <div className="mt-8">
        <h2 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-secondary/20 pb-2">
          Relaterede anmeldelser
        </h2>
        <ul className="space-y-3">
          <li className="border-b border-secondary/20 pb-3">
            <a
              href="#"
              className="text-sm font-medium text-black hover:text-accent-gold transition-colors"
            >
              De 10 bedste spil i samme genre
            </a>
          </li>
          <li className="border-b border-secondary/20 pb-3">
            <a
              href="#"
              className="text-sm font-medium text-black hover:text-accent-gold transition-colors"
            >
              Interview med udviklerne bag spillet
            </a>
          </li>
          <li className="border-b border-secondary/20 pb-3">
            <a
              href="#"
              className="text-sm font-medium text-black hover:text-accent-gold transition-colors"
            >
              Analyse: Spillets påvirkning på industrien
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}

export default function AnmeldelseView(
  { data }: PageProps<{ review?: Review; error?: string }>,
) {
  const { review, error } = data;

  if (error) {
    return (
      <Layout title="Fejl | The Questline">
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
      <Layout title="Anmeldelse ikke fundet | The Questline">
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

  // Get mainImage URL
  const mainImageUrl = review.mainImage
    ? `https://cdn.sanity.io/images/lebsytll/production/${
      review.mainImage?.asset?._ref
        .replace("image-", "")
        .replace("-jpg", ".jpg")
    }`
    : undefined;

  return (
    <Layout title={`${review.title} | The Questline`}>
      <ArticleDetail
        title={review.title}
        publishedAt={review.publishedAt}
        author={review.author}
        mainImage={mainImageUrl ? { asset: { url: mainImageUrl } } : undefined}
        body={review.body}
        backLink={{ url: "/anmeldelser", label: "Tilbage til anmeldelser" }}
        customSidebar={<ReviewSidebar review={review} />}
        rating={review.rating}
        ratingText={review.ratingText}
      />
    </Layout>
  );
}
