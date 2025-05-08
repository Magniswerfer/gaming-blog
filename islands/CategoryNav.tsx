import { useEffect, useState } from "preact/hooks";

interface Category {
  _id: string;
  title: string;
}

interface NavItem {
  href: string;
  text: string;
}

const STORAGE_KEY = "critico_categories";
const CACHE_EXPIRY = 1000 * 60 * 10; // 10 minutes

// Pre-defined placeholders for consistent dimension during loading
const PLACEHOLDERS = [
  { width: "70px" },
  { width: "85px" },
  { width: "65px" },
  { width: "90px" },
];

export default function CategoryNav() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsHydrated(true);

    async function fetchCategories() {
      try {
        // Check localStorage first
        const cachedData = localStorage.getItem(STORAGE_KEY);

        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const isExpired = Date.now() - timestamp > CACHE_EXPIRY;

          if (!isExpired) {
            processCategories(data);
            return;
          }
        }

        // If cache is expired or doesn't exist, fetch from API
        const response = await fetch("/api/categories");
        const data = await response.json();

        // Save to localStorage with timestamp
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ data, timestamp: Date.now() }),
        );

        processCategories(data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setIsVisible(true);
      }
    }

    function processCategories(categories: Category[]) {
      if (categories.length > 0) {
        const items = categories.map((category) => ({
          href: `/kategorier/${category.title.toLowerCase()}`,
          text: category.title,
        }));
        setNavItems(items);
        setIsVisible(true);
      } else {
        setIsVisible(true);
      }
    }

    // Only fetch if we're in the browser
    if (typeof window !== "undefined") {
      fetchCategories();
    }
  }, []);

  // Create a CSS class based on the current state
  const contentClass = `
    flex space-x-5 
    ${isHydrated && isVisible ? "opacity-100" : "opacity-0"}
  `;

  return (
    <div className="border-b border-secondary/20 hidden md:block bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex justify-center py-2 text-xs overflow-x-auto">
          <div className={contentClass}>
            {navItems.length > 0
              ? (
                // Real nav items
                navItems.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="text-black/70 hover:text-accent-gold transition-colors whitespace-nowrap"
                  >
                    {item.text}
                  </a>
                ))
              )
              : (
                // Placeholder items with the same dimensions
                PLACEHOLDERS.map((placeholder, index) => (
                  <span
                    key={index}
                    className="h-5 inline-block bg-gray-100 rounded-md"
                    style={{ width: placeholder.width }}
                  >
                    &nbsp;
                  </span>
                ))
              )}
          </div>
        </nav>
      </div>
    </div>
  );
}
