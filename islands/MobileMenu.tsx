import { useState } from "preact/hooks";

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
  };

  return (
    <div>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center focus:outline-none"
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

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-background-light transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6 border-b border-secondary/20 pb-4">
            <a
              href="/"
              className="hover:no-underline"
              onClick={() => setIsOpen(false)}
            >
              <div className="font-sans font-black text-2xl uppercase tracking-title text-black">
                CRITICO
              </div>
            </a>
            <button
              onClick={toggleMenu}
              className="text-black focus:outline-none"
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

          <nav>
            <ul className="space-y-4">
              {links.map((link) => (
                <li
                  key={link.href}
                  className="border-b border-secondary/20 pb-3"
                >
                  <a
                    href={link.href}
                    className="text-xl text-black hover:text-accent-gold transition-colors font-serif block"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 pt-4 border-t border-secondary/20">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-black">
                Følg Os
              </h3>
              <a
                href="#"
                className="block text-black/70 hover:text-accent-gold transition-colors text-sm"
              >
                Twitter
              </a>
              <a
                href="#"
                className="block text-black/70 hover:text-accent-gold transition-colors text-sm"
              >
                YouTube
              </a>
              <a
                href="#"
                className="block text-black/70 hover:text-accent-gold transition-colors text-sm"
              >
                Instagram
              </a>
              <a
                href="#"
                className="block text-black/70 hover:text-accent-gold transition-colors text-sm"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
