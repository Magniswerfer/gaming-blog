import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../../components/Layout.tsx";
import { BlockContent } from "../../utils/sanityParser.tsx";
import { client } from "../../utils/sanity.ts";
import ArticleDetail from "../../components/ArticleDetail.tsx";

interface Author {
  name: string;
  image?: { asset: { url: string } };
}

interface NyhedDetail {
  title: string;
  publishedAt: string;
  mainImage?: { asset: { url: string } };
  underrubrik?: string;
  resume?: string;
  author?: Author;
  isBreaking?: boolean;
  categories?: { title: string }[];
  body: BlockContent[];
}

interface NyhedDetailData {
  nyhed?: NyhedDetail;
  error?: string;
}

export const handler: Handlers<NyhedDetailData> = {
  async GET(req, ctx) {
    const { slug } = ctx.params;

    try {
      // GROQ query to fetch a specific news article by slug
      const query = `*[_type == "nyhed" && slug.current == "${slug}"][0] {
        title,
        publishedAt,
        underrubrik,
        resume,
        isBreaking,
        "mainImage": {
          "asset": {
            "url": mainImage.asset->url
          }
        },
        "author": author->{
          name,
          "image": {
            "asset": {
              "url": image.asset->url
            }
          }
        },
        "categories": categories[]->{title},
        body
      }`;

      const nyhed = await client.fetch(query);

      if (!nyhed) {
        return ctx.render({ error: "Nyhed ikke fundet" });
      }

      return ctx.render({ nyhed });
    } catch (error) {
      console.error("Error fetching news article:", error);
      return ctx.render({
        error:
          "Der opstod en fejl ved indlæsning af nyheden. Prøv igen senere.",
      });
    }
  },
};

export default function NyhedDetail({ data }: PageProps<NyhedDetailData>) {
  const { nyhed, error } = data;

  if (error) {
    return (
      <Layout title="Fejl | CRITICO">
        <div class="max-w-4xl mx-auto px-6 py-16">
          <div class="bg-red-900/20 text-red-100 p-4 rounded-lg mb-8">
            <p>{error}</p>
          </div>
          <div class="text-center mt-8">
            <a
              href="/nyhed"
              class="inline-block bg-accent-gold hover:bg-accent-earth text-white px-4 py-2 rounded transition-colors"
            >
              Tilbage til nyheder
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  if (!nyhed) {
    return (
      <Layout title="Indlæser... | CRITICO">
        <div class="max-w-4xl mx-auto px-6 py-16 text-center">
          <p class="text-black/60">Indlæser artikel...</p>
        </div>
      </Layout>
    );
  }

  // Create JSX elements for additional content
  const additionalContent = (
    <>
      {nyhed.isBreaking
        ? (
          <div className="bg-red-600 text-white px-3 py-1 text-sm font-bold inline-block mb-4">
            BREAKING
          </div>
        )
        : null}

      {nyhed.resume
        ? (
          <div className="bg-background-light/20 p-6 rounded-lg mb-8 border-l-4 border-accent-gold">
            <p className="font-serif text-black/80 italic leading-relaxed">
              {nyhed.resume}
            </p>
          </div>
        )
        : null}
    </>
  );

  return (
    <Layout title={`${nyhed.title} | CRITICO`}>
      <ArticleDetail
        title={nyhed.title}
        subtitle={nyhed.underrubrik}
        publishedAt={nyhed.publishedAt}
        author={nyhed.author}
        mainImage={nyhed.mainImage}
        categories={nyhed.categories}
        body={nyhed.body}
        backLink={{ url: "/nyhed", label: "Tilbage til alle nyheder" }}
      >
        {additionalContent}
      </ArticleDetail>
    </Layout>
  );
}
