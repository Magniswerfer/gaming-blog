import { Handlers, PageProps } from "$fresh/server.ts";
import { client } from "../../utils/sanity.ts";
import ContentPage from "../../components/ContentPage.tsx";

// Define TypeScript interfaces for our data
interface Author {
  name: string;
  image?: any;
}

interface Review {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  author?: {
    name: string;
    image?: any;
  };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  rating: number;
  publishedAt: string;
  gameData?: {
    title: string;
  };
  resume?: string;
  underrubrik?: string;
}

export const handler: Handlers<{ reviews: Review[]; error?: string }> = {
  async GET(req, ctx) {
    try {
      // Query for all reviews, sorted by publish date
      const reviews = await client.fetch(`
        *[_type == "anmeldelse"] | order(publishedAt desc) {
          _id,
          "_type": _type,
          title,
          slug,
          "author": author->{name, image},
          "mainImage": {
            "asset": {
              "url": mainImage.asset->url
            }
          },
          rating,
          publishedAt,
          "gameData": gameData->{title},
          resume,
          underrubrik
        }
      `);
      return ctx.render({ reviews, error: undefined });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      return ctx.render({
        reviews: [],
        error:
          "Der opstod en fejl ved indlæsning af anmeldelser. Prøv igen senere.",
      });
    }
  },
};

export default function Anmeldelser(
  { data }: PageProps<{ reviews: Review[]; error?: string }>,
) {
  const { reviews, error } = data;

  return (
    <ContentPage
      title="Anmeldelser"
      description="Grundige vurderinger af de nyeste og mest interessante spil på markedet."
      items={reviews}
      error={error}
      layout="grid"
      emptyMessage="Ingen anmeldelser fundet."
    />
  );
}
