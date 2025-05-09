import { client } from "../utils/sanity.ts";
import Divider from "./Divider.tsx";

// Define TypeScript interfaces for our data
interface ArticleBase {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
}

interface Props {
  articleType: "anmeldelse" | "nyhed" | "debat" | "feature";
  currentId: string;
  limit?: number;
  relatedArticles?: ArticleBase[];
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
        title,
        slug,
        publishedAt
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
  relatedArticles: propRelatedArticles, // Accept pre-fetched articles as prop
}: Props) {
  // Get the route for the current article type
  const route = typeToRoute[articleType] || articleType;

  // For server-side rendering, if relatedArticles are provided via props, use them
  // Otherwise, render a loading state (which will be replaced with actual data on the client)
  const hasContent = propRelatedArticles && propRelatedArticles.length > 0;

  if (!propRelatedArticles) {
    return (
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-4">
          {typeToTitle[articleType] || "Relaterede artikler"}
        </h2>
        <Divider color="secondary/20" spacing="sm" />
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
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider mb-4">
          {typeToTitle[articleType] || "Relaterede artikler"}
        </h2>
        <Divider color="secondary/20" spacing="sm" />
        <div className="p-4 bg-background-light/30 border border-secondary/20">
          <p className="text-black/70 text-sm">
            Ingen relaterede artikler fundet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xs font-bold uppercase tracking-wider mb-4">
        {typeToTitle[articleType] || "Relaterede artikler"}
      </h2>
      <Divider color="secondary/20" spacing="sm" />
      <ul className="space-y-1">
        {propRelatedArticles.map((article) => (
          <li key={article._id} className="pb-1">
            <a
              href={`/${route}/${article.slug.current}`}
              className="text-sm font-medium text-black transition-colors"
            >
              {article.title}
            </a>
          </li>
        ))}
      </ul>
      <Divider color="secondary/20" spacing="sm" />
    </div>
  );
}
