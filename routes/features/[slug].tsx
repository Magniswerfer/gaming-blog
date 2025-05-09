import { client } from "../../utils/sanity.ts";
import Layout from "../../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import ArticleDetail from "../../components/sections/ArticleDetail.tsx";
import { fetchRelatedArticles } from "../../components/sidebars/RelatedArticlesSidebar.tsx";

interface Feature {
  _id: string;
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

// Define the type for related articles
interface RelatedArticle {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
}

interface FeatureData {
  feature: Feature | null;
  relatedArticles: RelatedArticle[];
}

export const handler: Handlers<FeatureData> = {
  async GET(_, ctx) {
    const { slug } = ctx.params;
    try {
      const feature = await client.fetch<Feature>(
        `*[_type == "feature" && slug.current == $slug][0]{
          _id,
          title,
          slug,
          "author": author->{
            name, 
            "image": defined(image) && defined(image.asset) ? {
              asset->{url}
            } : null
          },
          "mainImage": defined(mainImage) && defined(mainImage.asset) ? {
            asset->{url}
          } : null,
          subtitle,
          "categories": categories[]->{title},
          publishedAt,
          body
        }`,
        { slug },
      );

      let relatedArticles: RelatedArticle[] = [];
      if (feature) {
        // Fetch related feature articles
        relatedArticles = await fetchRelatedArticles("feature", feature._id, 3);
      }

      return ctx.render({ feature, relatedArticles });
    } catch (error) {
      console.error("Error fetching feature:", error);
      return ctx.render({ feature: null, relatedArticles: [] });
    }
  },
};

export default function FeaturePost(
  { data }: PageProps<FeatureData>,
) {
  const { feature, relatedArticles = [] } = data;

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
        articleId={feature._id}
        articleType="feature"
        relatedArticles={relatedArticles}
      />
    </Layout>
  );
}
