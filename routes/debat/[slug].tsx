import { client } from "../../utils/sanity.ts";
import Layout from "../../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import ArticleDetail from "../../components/ArticleDetail.tsx";

interface Debat {
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
  categories?: Array<{
    title: string;
  }>;
  publishedAt?: string;
  body?: any[];
}

export const handler: Handlers<Debat | null> = {
  async GET(_, ctx) {
    const { slug } = ctx.params;
    try {
      const debat = await client.fetch<Debat>(
        `*[_type == "debat" && slug.current == $slug][0]{
          title,
          slug,
          "author": author->{name, "image": image{asset->{url}}},
          "mainImage": mainImage{asset->{url}},
          "categories": categories[]->{title},
          publishedAt,
          body
        }`,
        { slug },
      );
      return ctx.render(debat);
    } catch (error) {
      console.error("Error fetching debat:", error);
      return ctx.render(null);
    }
  },
};

export default function DebatPost({ data: debat }: PageProps<Debat | null>) {
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
      />
    </Layout>
  );
}
