import { h, JSX } from "preact";

export interface BlockContent {
  _type: string;
  _key: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: {
    _type: string;
    text: string;
    marks?: string[];
    _key: string;
  }[];
  markDefs?: {
    _key: string;
    _type: string;
    href: string;
    targetBlank?: boolean;
  }[];
  asset?: {
    _ref: string;
    _type: string;
  };
  alt?: string;
  caption?: string;
}

const renderTextContent = (
  child: { text: string; marks?: string[]; _key: string },
  idx: number,
  markDefs?: {
    _key: string;
    _type: string;
    href: string;
    targetBlank?: boolean;
  }[],
): JSX.Element => {
  if (!child.text) {
    return <span key={idx}></span>;
  }

  let content = child.text;

  if (child.marks?.length) {
    // Handle links
    if (markDefs?.length) {
      const linkMark = markDefs.find((def) => child.marks?.includes(def._key));
      if (linkMark) {
        return (
          <a
            href={linkMark.href}
            key={idx}
            {...(linkMark.targetBlank
              ? {
                target: "_blank",
                rel: "noopener noreferrer",
              }
              : {})}
            class="text-accent-gold hover:text-accent-earth transition-colors"
          >
            {content}
          </a>
        );
      }
    }

    // Handle strong text
    if (child.marks.includes("strong")) {
      return <strong key={idx} class="font-semibold">{content}</strong>;
    }
  }

  return <span key={idx}>{content}</span>;
};

export function parseContent(content: BlockContent[]): JSX.Element[] {
  if (!content) return [];

  let currentList: JSX.Element[] = [];
  let isInList = false;
  const result: JSX.Element[] = [];

  content.forEach((block, index) => {
    if (block._type === "block") {
      if (block.listItem) {
        // Handle list items
        if (!isInList) {
          isInList = true;
          currentList = [];
        }

        currentList.push(
          <li key={block._key || index} class="ml-6 mb-2 text-black">
            {block.children?.map((child, idx) =>
              renderTextContent(child, idx, block.markDefs)
            )}
          </li>,
        );
      } else {
        // Not a list item - flush any existing list
        if (isInList && currentList.length > 0) {
          result.push(
            <ul key={`list-${index}`} class="list-disc ml-6 mb-6">
              {currentList}
            </ul>,
          );
          currentList = [];
          isInList = false;
        }

        // Handle regular blocks
        switch (block.style) {
          case "h2":
            result.push(
              <h2
                key={block._key || index}
                class="font-serif text-3xl text-black mb-6"
              >
                {block.children?.map((child, idx) =>
                  renderTextContent(child, idx, block.markDefs)
                )}
              </h2>,
            );
            break;

          case "h3":
            result.push(
              <h3
                key={block._key || index}
                class="font-serif text-2xl text-black mb-4"
              >
                {block.children?.map((child, idx) =>
                  renderTextContent(child, idx, block.markDefs)
                )}
              </h3>,
            );
            break;

          default:
            result.push(
              <p
                key={block._key || index}
                class="text-black mb-6 leading-relaxed"
              >
                {block.children?.map((child, idx) =>
                  renderTextContent(child, idx, block.markDefs)
                )}
              </p>,
            );
        }
      }
    }
  });

  // Flush any remaining list items
  if (isInList && currentList.length > 0) {
    result.push(
      <ul key="final-list" class="list-disc ml-6 mb-6">
        {currentList}
      </ul>,
    );
  }

  return result;
}

// GROQ query for fetching game reviews
export const gameReviewQuery = (slug: string) =>
  `*[_type == "gameReview" && slug.current == "${slug}"][0] {
    title,
    slug,
    publishedAt,
    excerpt,
    content[] {
      ...,
      markDefs[] {
        ...,
        _type == "link" => {
          "href": href,
          "targetBlank": targetBlank
        }
      }
    },
    "coverImage": coverImage.asset->url,
    "coverImageAlt": coverImage.alt,
    gameInfo {
      title,
      developer,
      publisher,
      releaseDate,
      platforms,
      genres
    },
    reviewScores {
      narrative,
      gameplay,
      aesthetics,
      overall
    }
  }`;

// GROQ query for fetching all game reviews
export const allGameReviewsQuery = `
  *[_type == "gameReview"] | order(publishedAt desc) {
    title,
    slug,
    publishedAt,
    excerpt,
    "coverImage": coverImage.asset->url,
    "coverImageAlt": coverImage.alt,
    gameInfo {
      title,
      developer,
      releaseDate
    }
  }
`;
