import { Handlers, PageProps } from "$fresh/server.ts";
import ContentPage from "../../components/ContentPage.tsx";
import { client } from "../../utils/sanity.ts";

interface Nyhed {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage?: { asset: { url: string } };
  resume?: string;
  author?: { name: string };
  isBreaking?: boolean;
}

interface NyhederData {
  nyheder: Nyhed[];
  error?: string;
}

export const handler: Handlers<NyhederData> = {
  async GET(_, ctx) {
    try {
      // GROQ query to fetch all news articles sorted by publication date
      const query = `*[_type == "nyhed"] | order(publishedAt desc) {
        _id,
        "_type": _type,
        title,
        slug,
        publishedAt,
        "mainImage": {
          "asset": {
            "url": mainImage.asset->url
          }
        },
        resume,
        "author": author->{name},
        isBreaking
      }`;

      const nyheder = await client.fetch(query);
      return ctx.render({ nyheder });
    } catch (error) {
      console.error("Error fetching news:", error);
      return ctx.render({
        nyheder: [],
        error:
          "Der opstod en fejl ved indlæsning af nyheder. Prøv igen senere.",
      });
    }
  },
};

export default function NyhederPage({ data }: PageProps<NyhederData>) {
  const { nyheder, error } = data;

  return (
    <ContentPage
      title="Nyheder"
      description="De seneste nyheder fra spilindustrien, udgivelser og andre begivenheder."
      items={nyheder}
      error={error}
      layout="grid"
      emptyMessage="Ingen nyheder tilgængelige i øjeblikket. Kom tilbage senere."
    />
  );
}
