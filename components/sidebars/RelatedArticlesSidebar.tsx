import { JSX } from "preact";
import Divider from "../misc/Divider.tsx";
import { client } from "../../utils/sanity.ts";
import ArticleSidebar from "./ArticleSidebar.tsx";

// Define TypeScript interfaces for our data
interface ArticleBase {
  _id: string;
  _type?: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  mainImage?: {
    asset: any;
  };
  summary?: string;
  resume?: string;
  author?: {
    name: string;
  };
}

interface Props {
  articleType: "anmeldelse" | "nyhed" | "debat" | "feature";
  currentId: string;
  limit?: number;
  relatedArticles?: ArticleBase[];
  showImage?: boolean;
  className?: string;
}

// Map of article types to their routes
const typeToRoute: Record<string, string> = {
  anmeldelse: "anmeldelser",
  nyhed: "nyheder",
  debat: "debat",
  feature: "features",
};

// Map of article types to their Danish names
const typeToTitle: Record<string, string> = {
  anmeldelse: "Relaterede anmeldelser",
  nyhed: "Relaterede nyheder",
  debat: "Relaterede debatindlæg",
  feature: "Relaterede features",
};

// Server-side function to fetch related articles
export async function fetchRelatedArticles(
  articleType: string,
  currentId: string,
  limit: number,
): Promise<ArticleBase[]> {
  try {
    // Query for articles of the same type, excluding the current one
    const articles = await client.fetch(
      `*[_type == $type && _id != $currentId] | order(publishedAt desc)[0...$limit] {
        _id,
        _type,
        title,
        slug,
        publishedAt,
        mainImage,
        summary,
        resume,
        "author": author->
      }`,
      {
        type: articleType,
        currentId,
        limit: limit - 1,
      },
    );

    return articles;
  } catch (err) {
    console.error("Error fetching related articles:", err);
    return [];
  }
}

export default function RelatedArticlesSidebar({
  articleType,
  currentId,
  limit = 3,
  relatedArticles: propRelatedArticles,
  showImage = false,
  className = "",
}: Props): JSX.Element {
  // Get the title for the current article type
  const title = typeToTitle[articleType] || "Relaterede artikler";

  // For server-side rendering, if relatedArticles are provided via props, use them
  if (!propRelatedArticles) {
    return (
      <div className={className}>
        <h3 className="text-xs font-bold uppercase tracking-wider">
          {title}
        </h3>
        <Divider spacing="sm" />
        <div className="p-4 bg-background-light/30 border border-secondary/20">
          <p className="text-black/70 text-sm">
            Ingen relaterede artikler tilgængelige
          </p>
        </div>
      </div>
    );
  }

  if (propRelatedArticles.length === 0) {
    return (
      <div className={className}>
        <h3 className="text-xs font-bold uppercase tracking-wider">
          {title}
        </h3>
        <Divider spacing="sm" />
        <div className="p-4 bg-background-light/30 border border-secondary/20">
          <p className="text-black/70 text-sm">
            Ingen relaterede artikler fundet
          </p>
        </div>
      </div>
    );
  }

  // Use the ArticleSidebar component with our related articles
  return (
    <ArticleSidebar
      title={title}
      items={propRelatedArticles}
      limit={limit}
      showImage={showImage}
      className={className}
      contentType={articleType}
    />
  );
}
