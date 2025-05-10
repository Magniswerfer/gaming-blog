import { defineRoute, Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";
import TekstsidePage from "../components/pages/TekstsidePage.tsx";
import { client } from "../utils/sanity.ts";
import Layout from "../components/Layout.tsx";

interface OmTekstsideData {
  title: string;
  subtitle?: string;
  coverImage?: {
    asset: {
      url: string;
    };
  };
  body?: any[];
}

export const handler: Handlers<OmTekstsideData | null> = {
  async GET(_, ctx) {
    const query = `*[_type == "tekstside" && slug.current == "om"][0]{
      title,
      subtitle,
      coverImage{
        asset->{
          url
        }
      },
      body[] {
        ...,
        _type == "image" => {
          ...,
          asset->{
            url
          }
        }
      }
    }`;
    const data = await client.fetch<OmTekstsideData | null>(query);

    if (!data) {
      return ctx.renderNotFound();
    }
    return ctx.render(data);
  },
};

export default function OmPage({ data }: PageProps<OmTekstsideData | null>) {
  if (!data) {
    return (
      <Layout title="Side ikke fundet - CRITICO">
        <Head>
          {/* Layout handles the main title. Add specific meta tags for 404 if any. */}
          <meta name="robots" content="noindex" />{" "}
          {/* Example: tell robots not to index 404 */}
        </Head>
        <div class="min-h-screen bg-neutral-dark-shade-2E2E2E flex flex-col justify-center items-center text-center px-6 py-20">
          <h1 class="font-serif text-5xl text-white mb-6">
            404 - Side ikke fundet
          </h1>
          <p class="text-white/80 text-lg mb-10">
            Siden du ledte efter, kunne desværre ikke findes.
          </p>
          <a
            href="/"
            class="mt-8 inline-block px-8 py-4 bg-accent-amber text-neutral-dark-shade-1E1E1E font-bold rounded-md hover:bg-gold-darker transition-colors text-lg shadow-lg"
          >
            Tilbage til forsiden
          </a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${data.title} - CRITICO`}>
      <Head>
        {/* Layout handles the main <title>. Specific meta tags like description can go here. */}
        {data.subtitle && <meta name="description" content={data.subtitle} />}
        {!data.subtitle && <></>}{" "}
        {/* Ensure Head always has a child if subtitle is not present */}
      </Head>
      <TekstsidePage
        title={data.title}
        subtitle={data.subtitle}
        coverImage={data.coverImage}
        body={data.body}
      />
    </Layout>
  );
}
