import { Handlers, PageProps } from "$fresh/server.ts";
import CollectionPage from "../../components/pages/CollectionPage.tsx";
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
        mainImage,
        resume,
        "author": author->{name},
        isBreaking
      }`;

      const results = await client.fetch(query);

      // Process the data to handle missing images
      const nyheder = results.map((item: any) => {
        // Transform mainImage to the expected format or set to undefined if missing
        let mainImage = undefined;
        if (item.mainImage && item.mainImage.asset) {
          mainImage = {
            asset: {
              url: `https://cdn.sanity.io/images/lebsytll/production/${
                item.mainImage.asset._ref
                  .replace("image-", "")
                  .replace("-jpg", ".jpg")
                  .replace("-png", ".png")
                  .replace("-webp", ".webp")
              }`,
            },
          };
        }

        return {
          ...item,
          mainImage,
        };
      });

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
    <CollectionPage
      title="Nyheder"
      description="De seneste nyheder fra spilindustrien, udgivelser og andre begivenheder."
      items={nyheder}
      error={error}
      layout="grid"
      emptyMessage="Ingen nyheder tilgængelige i øjeblikket. Kom tilbage senere."
    />
  );
}
