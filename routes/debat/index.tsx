import { client } from "../../utils/sanity.ts";
import ContentPage from "../../components/ContentPage.tsx";
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

export const handler: Handlers<{ debats: Debat[]; error?: string }> = {
  async GET(_, ctx) {
    try {
      const debats = await client.fetch<Debat[]>(
        `*[_type == "debat"] | order(publishedAt desc) {
          _id,
          "_type": _type,
          title,
          slug,
          publishedAt,
          "author": author->{name},
          "mainImage": mainImage{asset->{url}},
          "categories": categories[]->{title},
          summary,
          underrubrik
        }`,
      );
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

  return (
    <ContentPage
      title="Debat"
      description="Meninger, diskussioner og kritiske perspektiver på spil og spilkultur."
      items={debats}
      error={error}
      layout="list"
      emptyMessage="Der er i øjeblikket ingen debatindlæg. Kom tilbage snart for tankevækkende diskussioner om spil og spilkultur."
    />
  );
}
