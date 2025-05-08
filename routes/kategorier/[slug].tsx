import { Handlers, PageProps } from "$fresh/server.ts";
import { client } from "../../utils/sanity.ts";
import CollectionPage from "../../components/CollectionPage.tsx";

interface Kategori {
  _id: string;
  title: string;
  description: string;
}

interface ContentItem {
  _id: string;
  _type: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage?: {
    asset: {
      url: string;
    };
  };
  resume?: string;
  summary?: string;
  underrubrik?: string;
  author?: {
    name: string;
    image?: {
      asset: {
        url: string;
      };
    };
  };
  isBreaking?: boolean;
  rating?: number;
}

interface KategoriData {
  kategori: Kategori | null;
  contentItems: ContentItem[];
  error?: string;
}

export const handler: Handlers<KategoriData> = {
  async GET(req, ctx) {
    const { slug } = ctx.params;

    try {
      // Danner et normaliseret slug til sammenligning
      const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-");

      // Hent alle kategorier og filtrer på klientsiden
      const kategorier = await client.fetch(
        `*[_type == "kategori"] { 
          _id, 
          title, 
          description 
        }`,
      );

      // Find kategori hvor title matcher det normaliserede slug
      const kategori = kategorier.find((k: Kategori) => {
        const titleSlug = k.title.toLowerCase().replace(/\s+/g, "-");
        return titleSlug === normalizedSlug;
      });

      if (!kategori) {
        return ctx.render({
          kategori: null,
          contentItems: [],
          error: `Kategorien '${slug}' blev ikke fundet.`,
        });
      }

      // Hent alt indhold fra alle typer, der refererer til denne kategori
      const contentItems = await client.fetch(
        `*[
          _type in ["nyhed", "debat", "anmeldelse", "feature"] && 
          $kategoriId in kategorier[]._ref
        ] | order(publishedAt desc) {
          _id,
          _type,
          title,
          slug,
          publishedAt,
          mainImage {
            asset-> {
              url
            }
          },
          resume,
          summary,
          underrubrik,
          author-> {
            name,
            image {
              asset-> {
                url
              }
            }
          },
          isBreaking,
          rating
        }`,
        { kategoriId: kategori._id },
      );

      return ctx.render({ kategori, contentItems });
    } catch (err) {
      console.error("Fejl ved hentning af kategori:", err);
      return ctx.render({
        kategori: null,
        contentItems: [],
        error: "Der opstod en fejl under hentning af kategorien.",
      });
    }
  },
};

export default function KategoriPage({ data }: PageProps<KategoriData>) {
  const { kategori, contentItems, error } = data;

  if (!kategori && !error) {
    return (
      <CollectionPage
        title="Kategori ikke fundet"
        description="Den ønskede kategori kunne ikke findes."
        items={[]}
        layout="grid"
      />
    );
  }

  return (
    <CollectionPage
      title={kategori?.title || "Kategori"}
      description={kategori?.description || ""}
      items={contentItems}
      error={error}
      layout="grid"
      emptyMessage="Der er ingen artikler i denne kategori endnu."
    />
  );
}
