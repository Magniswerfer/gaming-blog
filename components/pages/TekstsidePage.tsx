import { JSX } from "preact";
import { parseContent } from "../../utils/sanityParser.tsx"; // Assuming this path is correct
import Divider from "../misc/Divider.tsx"; // Import the Divider component

interface TekstsideProps {
  title: string;
  subtitle?: string;
  coverImage?: {
    asset: {
      url: string;
    };
  };
  body?: any[]; // Same as ArticleDetail, for parseContent
}

export default function TekstsidePage({
  title,
  subtitle,
  coverImage,
  body,
}: TekstsideProps): JSX.Element {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-neutral-dark-shade-1E1E1E text-white">
      {/* Content with sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main content column */}
        <div className="lg:col-span-9">
          {/* Header section */}
          {coverImage
            ? (
              <div className="w-full h-96 relative mb-8 overflow-hidden shadow-xl">
                <img
                  src={coverImage.asset.url}
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent">
                </div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-2">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-gray-300 text-lg">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            )
            : (
              <header>
                <div className="font-serif max-w-[65ch] mx-auto">
                  <h1 className="font-sans font-black text-4xl md:text-5xl text-black mb-3">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="font-sans text-black/80 text-lg">
                      {subtitle}
                    </p>
                  )}
                  <Divider spacing="md" />
                </div>
              </header>
            )}

          {/* Content Body */}
          <div className="prose prose-invert max-w-none font-serif text-gray-200">
            <div className="max-w-[65ch] mx-auto">
              {body
                ? (
                  parseContent(body)
                )
                : (
                  <p className="text-center text-lg text-gray-400">
                    Indholdet forberedes og vil snart være tilgængeligt.
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Empty sidebar column to maintain layout */}
        <div className="lg:col-span-3">
        </div>
      </div>
    </div>
  );
}
