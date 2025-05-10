import { useState } from "preact/hooks";
import SearchInput from "./SearchInput.tsx";

interface MobileMenuProps {
  links: Array<{
    href: string;
    text: string;
  }>;
}

export default function MobileMenu({ links }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    // Prevent body scrolling when menu is open
    document.body.style.overflow = isOpen ? "auto" : "hidden";
  };

  // Clean up effect when unmounting
  const handleClose = () => {
    setIsOpen(false);
    document.body.style.overflow = "auto";
  };

  return (
    <div>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center p-1 focus:outline-none text-black"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>

      {/* Overlay - darkens the background */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-50"
          onClick={handleClose}
        />
      )}

      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[60] shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex justify-between items-center p-4 border-b border-secondary/20">
            <a
              href="/"
              className="hover:no-underline"
              onClick={handleClose}
            >
              <div className="font-sans font-black text-2xl uppercase tracking-title text-black">
                CRITICO
              </div>
            </a>
            <button
              onClick={toggleMenu}
              className="text-black focus:outline-none p-1"
              aria-label="Close menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Navigation content */}
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4">
              <ul className="space-y-1">
                {links.map((link) => (
                  <li
                    key={link.href}
                    className="border-b border-secondary/10 py-3"
                  >
                    <a
                      href={link.href}
                      className="text-lg font-medium text-black hover:text-accent-gold transition-colors block"
                      onClick={handleClose}
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Search input */}
            <div className="p-4 pt-2">
              <div className="w-full">
                <SearchInput isMobile={true} />
              </div>
            </div>

            {/* Social links */}
            <div className="p-4 mt-4 border-t border-secondary/20">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 text-black">
                Følg Os
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="#"
                  className="text-sm text-black/70 hover:text-accent-gold transition-colors"
                  onClick={handleClose}
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-sm text-black/70 hover:text-accent-gold transition-colors"
                  onClick={handleClose}
                >
                  YouTube
                </a>
                <a
                  href="#"
                  className="text-sm text-black/70 hover:text-accent-gold transition-colors"
                  onClick={handleClose}
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-sm text-black/70 hover:text-accent-gold transition-colors"
                  onClick={handleClose}
                >
                  Discord
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 text-xs text-black/50 border-t border-secondary/20">
            © {new Date().getFullYear()} CRITICO
          </div>
        </div>
      </div>
    </div>
  );
}
