import { client } from "../../utils/sanity.ts";
import CollectionPage from "../../components/CollectionPage.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Feature {
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
  subtitle?: string;
  resume?: string;
  summary?: string;
  underrubrik?: string;
  categories?: Array<{
    title: string;
  }>;
}

export const handler: Handlers<{ features: Feature[]; error?: string }> = {
  async GET(_, ctx) {
    try {
      const features = await client.fetch<Feature[]>(
        `*[_type == "feature"] | order(publishedAt desc) {
          _id,
          "_type": _type,
          title,
          slug,
          publishedAt,
          "author": author->{name},
          "mainImage": mainImage{asset->{url}},
          subtitle,
          resume,
          summary,
          underrubrik,
          "categories": categories[]->{title}
        }`,
      );
      return ctx.render({ features, error: undefined });
    } catch (error) {
      console.error("Error fetching features:", error);
      return ctx.render({
        features: [],
        error:
          "Der opstod en fejl ved indlæsning af features. Prøv igen senere.",
      });
    }
  },
};

export default function FeaturesIndex(
  { data }: PageProps<{ features: Feature[]; error?: string }>,
) {
  const { features, error } = data;

  return (
    <CollectionPage
      title="Features"
      description="Dybdegående artikler om spil, spilkultur og spilbranchens tendenser."
      items={features}
      error={error}
      layout="featured"
      emptyMessage="Der er i øjeblikket ingen featureartikler. Kom tilbage snart for dybdegående artikler om spil og spilkultur."
    />
  );
}
