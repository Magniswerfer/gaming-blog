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
    <div class="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        class="flex flex-col justify-center items-center w-10 h-10 space-y-1.5 text-white focus:outline-none"
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        <span
          class={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
            isOpen ? "transform rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          class={`block w-6 h-0.5 bg-white transition-opacity duration-300 ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        />
        <span
          class={`block w-6 h-0.5 bg-white transition-transform duration-300 ${
            isOpen ? "transform -rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* Mobile Menu Overlay */}
      <div
        class={`fixed top-[76px] left-0 right-0 bottom-0 bg-black/50 z-[100] transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div class="flex flex-col h-full">
          <nav class="flex-1 bg-background-dark">
            <ul class="flex flex-col items-center w-full pt-8 pb-24">
              {links.map((link) => (
                <li key={link.href} class="w-full text-center">
                  <a
                    href={link.href}
                    class="font-serif text-2xl text-white hover:text-accent-gold transition-colors block py-6"
                    onClick={() =>
                      setIsOpen(false)}
                  >
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
