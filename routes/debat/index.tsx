import { client } from "../../utils/sanity.ts";
import Layout from "../../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Debat {
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
  categories?: Array<{
    title: string;
  }>;
  publishedAt?: string;
  summary?: string;
}

export const handler: Handlers<Debat[]> = {
  async GET(_, ctx) {
    try {
      const debats = await client.fetch<Debat[]>(
        `*[_type == "debat"] | order(publishedAt desc) {
          title,
          slug,
          "author": author->{name},
          "mainImage": mainImage{asset->{url}},
          "categories": categories[]->{title},
          publishedAt,
          summary
        }`,
      );
      return ctx.render(debats);
    } catch (error) {
      console.error("Error fetching debats:", error);
      return ctx.render([]);
    }
  },
};

export default function DebatIndex({ data: debats }: PageProps<Debat[]>) {
  return (
    <Layout title="Debat - CRITICO">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-sans font-black text-3xl md:text-4xl mb-8 leading-tight border-b border-secondary/20 pb-4">
          Debat
        </h1>

        {debats.length === 0
          ? (
            <div className="bg-background-light/30 backdrop-blur-sm p-6 rounded-lg border border-secondary/20">
              <h2 className="font-sans font-black text-2xl mb-4">
                Ingen debatindlæg endnu
              </h2>
              <p className="text-black/80 mb-4">
                Der er i øjeblikket ingen debatindlæg. Kom tilbage snart for
                tankevækkende diskussioner om spil og spilkultur.
              </p>
            </div>
          )
          : (
            <div className="grid grid-cols-1 gap-8">
              {debats.map((debat) => (
                <article
                  key={debat.slug.current}
                  className="flex flex-col md:flex-row gap-6 border-b border-secondary/20 pb-8"
                >
                  {debat.mainImage?.asset?.url
                    ? (
                      <div className="md:w-1/3">
                        <img
                          src={debat.mainImage.asset.url}
                          alt={debat.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )
                    : null}
                  <div className="md:w-2/3">
                    <h2 className="font-sans font-black text-2xl md:text-3xl mb-2 leading-tight">
                      <a
                        href={`/debat/${debat.slug.current}`}
                        className="text-black hover:text-accent-gold transition-colors"
                      >
                        {debat.title}
                      </a>
                    </h2>
                    {debat.summary && (
                      <p className="font-serif text-base text-black/80 mb-3 leading-relaxed">
                        {debat.summary}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center text-xs text-black/60 gap-2">
                      {debat.author && <span>{debat.author.name}</span>}
                      {debat.publishedAt && (
                        <>
                          <span>•</span>
                          <span>
                            {new Date(debat.publishedAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </>
                      )}
                      {debat.categories && debat.categories.length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex gap-1">
                            {debat.categories.map((category) => (
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
              ))}
            </div>
          )}
      </div>
    </Layout>
  );
}
