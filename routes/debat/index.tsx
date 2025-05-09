import { client } from "../../utils/sanity.ts";
import CollectionPage from "../../components/pages/CollectionPage.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Debat {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author?: {
    name: string;
  };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  categories?: Array<{
    title: string;
  }>;
  summary?: string;
  underrubrik?: string;
}

// Interface for passing data to CollectionPage - excludes underrubrik
interface DebatDisplayItem {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  author?: {
    name: string;
  };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  categories?: Array<{
    title: string;
  }>;
  summary?: string;
}

export const handler: Handlers<{ debats: Debat[]; error?: string }> = {
  async GET(_, ctx) {
    try {
      const results = await client.fetch(
        `*[_type == "debat"] | order(publishedAt desc) {
          _id,
          "_type": _type,
          title,
          slug,
          publishedAt,
          "author": author->{name},
          mainImage,
          "categories": categories[]->{title},
          summary,
          underrubrik
        }`,
      );

      // Process the data to handle missing images
      const debats = results.map((item: any) => {
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

      return ctx.render({ debats, error: undefined });
    } catch (error) {
      console.error("Error fetching debats:", error);
      return ctx.render({
        debats: [],
        error:
          "Der opstod en fejl ved indlæsning af debatindlæg. Prøv igen senere.",
      });
    }
  },
};

export default function DebatIndex(
  { data }: PageProps<{ debats: Debat[]; error?: string }>,
) {
  const { debats, error } = data;

  // Transform debats to exclude underrubrik field before passing to CollectionPage
  const displayItems: DebatDisplayItem[] = debats.map((
    { underrubrik, ...rest },
  ) => rest);

  return (
    <CollectionPage
      title="Debat"
      description="Meninger, diskussioner og kritiske perspektiver på spil og spilkultur."
      items={displayItems}
      error={error}
      layout="list"
      imageWidth="1/4"
      emptyMessage="Der er i øjeblikket ingen debatindlæg. Kom tilbage snart for tankevækkende diskussioner om spil og spilkultur."
    />
  );
}
