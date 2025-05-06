import { client } from "../../utils/sanity.ts";
import { parseContent } from "../../utils/sanityParser.tsx";
import Layout from "../../components/Layout.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";

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
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-10">
          {debat.mainImage?.asset?.url && (
            <img
              src={debat.mainImage.asset.url}
              alt={debat.title}
              className="w-full h-auto object-cover mb-8"
            />
          )}
          <h1 className="font-sans font-black text-4xl mb-4 leading-tight">
            {debat.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-black/60 border-b border-secondary/20 pb-4">
            {debat.author && (
              <div className="flex items-center gap-2">
                {debat.author.image?.asset?.url && (
                  <img
                    src={debat.author.image.asset.url}
                    alt={debat.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <p>Af {debat.author.name}</p>
              </div>
            )}
            {debat.publishedAt && (
              <>
                <span>•</span>
                <p>
                  {new Date(debat.publishedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </>
            )}
            {debat.categories && debat.categories.length > 0 && (
              <>
                <span>•</span>
                <div className="flex gap-2">
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

        {/* Post Content */}
        <div className="prose prose-lg max-w-none">
          {debat.body
            ? parseContent(debat.body)
            : <p className="text-black/80">Ingen indhold tilgængeligt.</p>}
        </div>

        {/* Back to Debat */}
        <div className="mt-12 text-center">
          <a
            href="/debat"
            className="inline-block px-6 py-3 bg-background-light hover:bg-accent-gold text-black rounded-lg transition-colors"
          >
            Tilbage til Debat
          </a>
        </div>
      </article>
    </Layout>
  );
}
