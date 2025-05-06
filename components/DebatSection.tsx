import { JSX } from "preact";

interface DebatEntry {
  title: string;
  slug: { current: string };
  summary?: string;
  publishedAt?: string;
  author?: {
    name: string;
  };
}

interface DebatSectionProps {
  entries: DebatEntry[];
  className?: string;
}

export default function DebatSection({
  entries,
  className = "",
}: DebatSectionProps): JSX.Element {
  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-3 border-b border-secondary/20 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider">
          Debat & Analyse
        </h3>
        <a
          href="/debat"
          className="text-xs font-medium text-secondary  transition-colors"
        >
          Se alle debatindlæg →
        </a>
      </div>

      <div className="border-b border-secondary/20 pb-3">
        {entries.map((debat, index) => (
          <div
            key={debat.slug.current}
            className={`mb-3 ${
              index < entries.length - 1
                ? "pb-3 border-b border-secondary/10"
                : ""
            }`}
          >
            <h3 className="font-bold text-base mb-1 leading-tight">
              <a
                href={`/debat/${debat.slug.current}`}
                className="text-black  transition-colors"
              >
                {debat.title}
              </a>
            </h3>

            {debat.summary && (
              <p className="text-sm text-black/70 mb-2 line-clamp-2">
                {debat.summary}
              </p>
            )}

            <div className="flex items-center text-xs text-black/60">
              {debat.author && <span>{debat.author.name}</span>}
              {debat.publishedAt && debat.author && (
                <span className="px-2">•</span>
              )}
              {debat.publishedAt && (
                <span>
                  {new Date(debat.publishedAt).toLocaleDateString("da-DK", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
