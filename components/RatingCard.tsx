interface RatingCardProps {
  rating: number;
  ratingText?: string;
  resume?: string;
}

export default function RatingCard(
  { rating, ratingText, resume }: RatingCardProps,
) {
  // Calculate the circle fill based on the rating
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rating / 10) * circumference;

  return (
    <div className="max-w-[65ch] mx-auto mt-12 p-6 bg-white border border-[#355C7D]/20">
      <div className="flex items-stretch gap-8">
        <div className="text-center relative min-w-[120px] flex justify-center">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke="#E6E6E6"
              strokeWidth="5"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke="#A07A3B"
              strokeWidth="5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-sans text-[#A07A3B]">
              {rating}
              <span className="text-3xl">/10</span>
            </span>
          </div>
        </div>

        <div className="border-l border-[#355C7D]/20 self-stretch px-6 flex-1 flex flex-col justify-center py-2">
          {ratingText && (
            <p className="text-black/80 font-serif mb-4">{ratingText}</p>
          )}
          {resume && (
            <div
              className={`${
                ratingText ? "mt-4 pt-4 border-t border-[#355C7D]/30" : ""
              }`}
            >
              <p className="text-black/80 font-serif">{resume}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
