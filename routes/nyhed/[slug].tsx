import { Handlers, PageProps } from "$fresh/server.ts";
import Layout from "../../components/Layout.tsx";
import { BlockContent, parseContent } from "../../utils/sanityParser.tsx";
import { client } from "../../utils/sanity.ts";

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

  return (
    <Layout title={`${nyhed.title} | CRITICO`}>
      <article class="max-w-4xl mx-auto px-6">
        {/* Breaking news badge */}
        {nyhed.isBreaking && (
          <div class="bg-red-600 text-white px-3 py-1 text-sm font-bold inline-block mb-4">
            BREAKING
          </div>
        )}

        {/* Article header */}
        <header class="mb-8">
          <h1 class="font-serif text-4xl md:text-5xl text-black mb-3 leading-tight">
            {nyhed.title}
          </h1>

          {nyhed.underrubrik && (
            <p class="font-serif text-xl text-black/80 mb-6 leading-relaxed">
              {nyhed.underrubrik}
            </p>
          )}

          {/* Meta information */}
          <div class="flex flex-wrap items-center gap-4 text-sm mb-8">
            {nyhed.author && (
              <div class="flex items-center gap-2">
                {nyhed.author.image?.asset?.url && (
                  <img
                    src={nyhed.author.image.asset.url}
                    alt={nyhed.author.name}
                    class="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span class="text-black/80">{nyhed.author.name}</span>
              </div>
            )}

            {nyhed.publishedAt && (
              <span class="text-black/60">
                {new Date(nyhed.publishedAt).toLocaleDateString("da-DK", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            )}

            {nyhed.categories && nyhed.categories.length > 0 && (
              <div class="flex gap-2 flex-wrap">
                {nyhed.categories.map((category) => (
                  <span class="bg-background-light/50 px-2 py-1 text-xs text-black/70 rounded-sm">
                    {category.title}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Featured image */}
          {nyhed.mainImage?.asset?.url && (
            <div class="mb-8">
              <img
                src={nyhed.mainImage.asset.url}
                alt={nyhed.title}
                class="w-full h-auto rounded-lg"
              />
            </div>
          )}

          {/* Article summary */}
          {nyhed.resume && (
            <div class="bg-background-light/20 p-6 rounded-lg mb-8 border-l-4 border-accent-gold">
              <p class="font-serif text-black/80 italic leading-relaxed">
                {nyhed.resume}
              </p>
            </div>
          )}
        </header>

        {/* Article content */}
        <div class="prose prose-lg max-w-none mb-12">
          {parseContent(nyhed.body)}
        </div>

        {/* Bottom navigation */}
        <div class="border-t border-secondary/20 py-8 mt-8 mb-16">
          <a
            href="/nyhed"
            class="text-black hover:text-accent-gold transition-colors"
          >
            ← Tilbage til alle nyheder
          </a>
        </div>
      </article>
    </Layout>
  );
}
