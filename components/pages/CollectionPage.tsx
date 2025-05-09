import { JSX } from "preact";
import Layout from "../Layout.tsx";
import ArticleCollection from "../sections/ArticleCollection.tsx";

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

interface CollectionPageProps {
  title: string;
  description: string;
  items: ContentItem[];
  error?: string;
  layout?: "grid" | "list" | "featured";
  emptyMessage?: string;
  showExcerpt?: boolean;
  imageWidth?: "1/4" | "1/3" | "1/2";
}

export default function CollectionPage({
  title,
  description,
  items,
  error,
  layout = "grid",
  emptyMessage = "Ingen indhold tilgængeligt i øjeblikket. Kom tilbage senere.",
  showExcerpt = true,
  imageWidth = "1/3",
}: CollectionPageProps): JSX.Element {
  return (
    <Layout title={`${title} | CRITICO`}>
      <div class="max-w-7xl mx-auto px-4">
        <header class="py-8 mb-6 border-b border-secondary/20">
          <h1 class="font-sans font-black text-4xl md:text-5xl text-black mb-3">
            {title}
          </h1>
          <p class="text-black/80 max-w-3xl">
            {description}
          </p>
        </header>

        {error && (
          <div class="bg-red-900/20 text-red-100 p-4 mb-8">
            <p>{error}</p>
          </div>
        )}

        <ArticleCollection
          items={items}
          layout={layout}
          emptyMessage={emptyMessage}
          showExcerpt={showExcerpt}
          imageWidth={imageWidth}
        />
      </div>
    </Layout>
  );
}
