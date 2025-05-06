import { useState } from "preact/hooks";

export default function SearchInput() {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    if (query.trim() !== "") {
      // Redirect to search page with query parameter
      window.location.href = `/search?q=${encodeURIComponent(query)}`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <input
        type="text"
        value={query}
        onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
        placeholder="Søg..."
        className="w-full text-xs px-3 py-1 border border-secondary/20 rounded-full focus:outline-none focus:ring-1 focus:ring-primary/50"
        aria-label="Søgefelt"
      />
      <button
        type="submit"
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full text-black/60 hover:text-primary"
        aria-label="Søg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="w-3 h-3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
      </button>
    </form>
  );
}
