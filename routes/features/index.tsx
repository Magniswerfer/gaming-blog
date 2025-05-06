import { client } from "../../utils/sanity.ts";
import Layout from "../../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Feature {
  title: string;
  slug: { current: string };
  author?: {
    name: string;
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
}

export const handler: Handlers<Feature[]> = {
  async GET(_, ctx) {
    try {
      const features = await client.fetch<Feature[]>(
        `*[_type == "feature"] | order(publishedAt desc) {
          title,
          slug,
          "author": author->{name},
          "mainImage": mainImage{asset->{url}},
          subtitle,
          "categories": categories[]->{title},
          publishedAt
        }`,
      );
      return ctx.render(features);
    } catch (error) {
      console.error("Error fetching features:", error);
      return ctx.render([]);
    }
  },
};

export default function FeaturesIndex(
  { data: features }: PageProps<Feature[]>,
) {
  // Split features into featured (first) and the rest
  const featuredFeature = features.length > 0 ? features[0] : null;
  const remainingFeatures = features.length > 1 ? features.slice(1) : [];

  return (
    <Layout title="Features - CRITICO">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-sans font-black text-3xl md:text-4xl mb-8 leading-tight border-b border-secondary/20 pb-4">
          Features
        </h1>

        {features.length === 0
          ? (
            <div className="bg-background-light/30 backdrop-blur-sm p-6 rounded-lg border border-secondary/20">
              <h2 className="font-sans font-black text-2xl mb-4">
                Ingen features endnu
              </h2>
              <p className="text-black/80 mb-4">
                Der er i øjeblikket ingen featureartikler. Kom tilbage snart for
                dybdegående artikler om spil og spilkultur.
              </p>
            </div>
          )
          : (
            <>
              {/* Featured article - larger display */}
              {featuredFeature && (
                <div className="mb-12">
                  <article className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {featuredFeature.mainImage?.asset?.url
                      ? (
                        <div className="md:col-span-7">
                          <img
                            src={featuredFeature.mainImage.asset.url}
                            alt={featuredFeature.title}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )
                      : null}
                    <div className="md:col-span-5">
                      <h2 className="font-sans font-black text-3xl md:text-4xl mb-3 leading-tight">
                        <a
                          href={`/features/${featuredFeature.slug.current}`}
                          className="text-black hover:text-accent-gold transition-colors"
                        >
                          {featuredFeature.title}
                        </a>
                      </h2>
                      {featuredFeature.subtitle && (
                        <p className="font-serif text-xl text-black/80 mb-4">
                          {featuredFeature.subtitle}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center text-xs text-black/60 gap-2">
                        {featuredFeature.author && (
                          <span>{featuredFeature.author.name}</span>
                        )}
                        {featuredFeature.publishedAt && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(featuredFeature.publishedAt)
                                .toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                            </span>
                          </>
                        )}
                        {featuredFeature.categories &&
                          featuredFeature.categories.length > 0 && (
                          <>
                            <span>•</span>
                            <div className="flex gap-1">
                              {featuredFeature.categories.map((category) => (
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
                  </article>
                </div>
              )}

              {/* Remaining articles in a grid */}
              {remainingFeatures.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {remainingFeatures.map((feature) => (
                    <article
                      key={feature.slug.current}
                      className="flex flex-col h-full"
                    >
                      {feature.mainImage?.asset?.url
                        ? (
                          <div className="mb-4">
                            <img
                              src={feature.mainImage.asset.url}
                              alt={feature.title}
                              className="w-full h-56 object-cover"
                            />
                          </div>
                        )
                        : (
                          <div className="mb-4 bg-background-light/50 h-56 flex items-center justify-center">
                            <span className="text-black/30">No image</span>
                          </div>
                        )}
                      <h2 className="font-sans font-bold text-xl mb-2 leading-tight flex-grow">
                        <a
                          href={`/features/${feature.slug.current}`}
                          className="text-black hover:text-accent-gold transition-colors"
                        >
                          {feature.title}
                        </a>
                      </h2>
                      {feature.subtitle && (
                        <p className="font-serif text-sm text-black/80 mb-3">
                          {feature.subtitle}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center text-xs text-black/60 gap-2 mt-auto">
                        {feature.author && <span>{feature.author.name}</span>}
                        {feature.publishedAt && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(feature.publishedAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
      </div>
    </Layout>
  );
}
