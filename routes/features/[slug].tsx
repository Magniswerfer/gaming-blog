import { client } from "../../utils/sanity.ts";
import Layout from "../../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import ArticleDetail from "../../components/ArticleDetail.tsx";

interface Feature {
  title: string;
  slug: { current: string };
  author?: {
    name: string;
    image?: {
      asset: {
        url: string;
      };
    };
  };
  mainImage?: {
    asset: {
      url: string;
    };
  };
  subtitle?: string;
  categories?: Array<{
    title: string;
  }>;
  publishedAt?: string;
  body?: any[];
}

export const handler: Handlers<Feature | null> = {
  async GET(_, ctx) {
    const { slug } = ctx.params;
    try {
      const feature = await client.fetch<Feature>(
        `*[_type == "feature" && slug.current == $slug][0]{
          title,
          slug,
          "author": author->{name, "image": image{asset->{url}}},
          "mainImage": mainImage{asset->{url}},
          subtitle,
          "categories": categories[]->{title},
          publishedAt,
          body
        }`,
        { slug },
      );
      return ctx.render(feature);
    } catch (error) {
      console.error("Error fetching feature:", error);
      return ctx.render(null);
    }
  },
};

export default function FeaturePost(
  { data: feature }: PageProps<Feature | null>,
) {
  if (!feature) {
    return (
      <Layout title="Feature Ikke Fundet - CRITICO">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="font-sans font-black text-3xl mb-6 text-center">
            Feature Ikke Fundet
          </h1>
          <p className="text-black/80 text-center mb-8">
            Beklager, vi kunne ikke finde den feature, du leder efter.
          </p>
          <div className="text-center">
            <a
              href="/features"
              className="inline-block px-6 py-3 bg-background-light hover:bg-accent-gold text-black rounded-lg transition-colors"
            >
              Tilbage til Features
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${feature.title} - CRITICO`}>
      <ArticleDetail
        title={feature.title}
        subtitle={feature.subtitle}
        publishedAt={feature.publishedAt}
        author={feature.author}
        mainImage={feature.mainImage}
        categories={feature.categories}
        body={feature.body}
        backLink={{ url: "/features", label: "Tilbage til Features" }}
      />
    </Layout>
  );
}
