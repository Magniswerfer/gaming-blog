import { client } from "../../utils/sanity.ts";
import Layout from "../../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import ArticleDetail from "../../components/ArticleDetail.tsx";
import { fetchRelatedArticles } from "../../components/RelatedArticlesSidebar.tsx";

// Define interface to match the ArticleDetail component
interface Author {
  name: string;
  image?: {
    asset: {
      url: string;
    };
  };
}

interface Category {
  title: string;
}

// Interface for raw data from Sanity
interface RawDebat {
  _id: string;
  title: string;
  slug: { current: string };
  author?: {
    name: string;
    image?: {
      asset: {
        _ref: string;
      };
    };
  };
  mainImage?: {
    asset: {
      _ref: string;
    };
  };
  categories?: Category[];
  publishedAt?: string;
  body?: any[];
}

// Interface for processed data
interface Debat {
  _id: string;
  title: string;
  slug: { current: string };
  author?: Author;
  mainImage?: {
    asset: {
      url: string;
    };
  };
  categories?: Category[];
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

interface DebatData {
  debat: Debat | null;
  relatedArticles: RelatedArticle[];
}

export const handler: Handlers<DebatData> = {
  async GET(_, ctx) {
    const { slug } = ctx.params;
    try {
      const rawDebat = await client.fetch<RawDebat>(
        `*[_type == "debat" && slug.current == $slug][0] {
          _id,
          title,
          slug,
          author->{name, image},
          mainImage,
          categories[]->{title},
          publishedAt,
          body
        }`,
        { slug },
      );

      // Convert raw data to Debat interface
      const debat: Debat | null = rawDebat
        ? {
          ...rawDebat,
          mainImage: undefined,
          author: rawDebat.author
            ? {
              name: rawDebat.author.name,
              image: undefined,
            }
            : undefined,
        }
        : null;

      // Process the mainImage to match expected format
      if (
        debat && rawDebat.mainImage && rawDebat.mainImage.asset &&
        rawDebat.mainImage.asset._ref
      ) {
        debat.mainImage = {
          asset: {
            url: `https://cdn.sanity.io/images/lebsytll/production/${
              rawDebat.mainImage.asset._ref
                .replace("image-", "")
                .replace("-jpg", ".jpg")
                .replace("-png", ".png")
                .replace("-webp", ".webp")
            }`,
          },
        };
      }

      // Process author image if it exists
      if (
        debat && debat.author && rawDebat.author && rawDebat.author.image &&
        rawDebat.author.image.asset
      ) {
        debat.author.image = {
          asset: {
            url: `https://cdn.sanity.io/images/lebsytll/production/${
              rawDebat.author.image.asset._ref
                .replace("image-", "")
                .replace("-jpg", ".jpg")
                .replace("-png", ".png")
                .replace("-webp", ".webp")
            }`,
          },
        };
      }

      let relatedArticles: RelatedArticle[] = [];
      if (debat) {
        // Fetch related debate articles
        relatedArticles = await fetchRelatedArticles("debat", debat._id, 3);
      }

      return ctx.render({ debat, relatedArticles });
    } catch (error) {
      console.error("Error fetching debat:", error);
      return ctx.render({ debat: null, relatedArticles: [] });
    }
  },
};

export default function DebatPost({ data }: PageProps<DebatData>) {
  const { debat, relatedArticles = [] } = data;

  if (!debat) {
    return (
      <Layout title="Indlæg Ikke Fundet - CRITICO">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <h1 className="font-sans font-black text-3xl mb-6 text-center">
            Indlæg Ikke Fundet
          </h1>
          <p className="text-black/80 text-center mb-8">
            Beklager, vi kunne ikke finde det debatindlæg, du leder efter.
          </p>
          <div className="text-center">
            <a
              href="/debat"
              className="inline-block px-6 py-3 bg-background-light hover:bg-accent-gold text-black rounded-lg transition-colors"
            >
              Tilbage til Debat
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${debat.title} - CRITICO`}>
      <ArticleDetail
        title={debat.title}
        publishedAt={debat.publishedAt}
        author={debat.author}
        mainImage={debat.mainImage}
        categories={debat.categories}
        body={debat.body}
        backLink={{ url: "/debat", label: "Tilbage til Debat" }}
        articleId={debat._id}
        articleType="debat"
        relatedArticles={relatedArticles}
      />
    </Layout>
  );
}
