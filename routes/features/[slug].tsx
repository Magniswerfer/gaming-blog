import { client } from "../../utils/sanity.ts";
import { parseContent } from "../../utils/sanityParser.tsx";
import Layout from "../../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

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
      <article className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12">
          {feature.mainImage?.asset?.url && (
            <div className="mb-8">
              <img
                src={feature.mainImage.asset.url}
                alt={feature.title}
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <h1 className="font-sans font-black text-4xl md:text-5xl mb-4 leading-tight">
              {feature.title}
            </h1>

            {feature.subtitle && (
              <p className="font-serif text-xl md:text-2xl text-black/80 mb-6 leading-relaxed">
                {feature.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm text-black/60 border-b border-secondary/20 pb-6">
              {feature.author && (
                <div className="flex items-center gap-2">
                  {feature.author.image?.asset?.url && (
                    <img
                      src={feature.author.image.asset.url}
                      alt={feature.author.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <p>Af {feature.author.name}</p>
                </div>
              )}
              {feature.publishedAt && (
                <>
                  <span>•</span>
                  <p>
                    {new Date(feature.publishedAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </>
              )}
              {feature.categories && feature.categories.length > 0 && (
                <>
                  <span>•</span>
                  <div className="flex gap-2">
                    {feature.categories.map((category) => (
                      <span
                        key={category.title}
                        className="px-2 py-1 bg-background-light rounded-full text-xs"
                      >
                        {category.title}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            {feature.body
              ? parseContent(feature.body)
              : <p className="text-black/80">Ingen indhold tilgængeligt.</p>}
          </div>

          {/* Back to Features */}
          <div className="mt-12 text-center">
            <a
              href="/features"
              className="inline-block px-6 py-3 bg-background-light hover:bg-accent-gold text-black rounded-lg transition-colors"
            >
              Tilbage til Features
            </a>
          </div>
        </div>
      </article>
    </Layout>
  );
}
