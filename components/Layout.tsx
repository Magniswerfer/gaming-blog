import { Head } from "$fresh/runtime.ts";
import { ComponentChildren } from "preact";
import MobileMenu from "../islands/MobileMenu.tsx";

interface LayoutProps {
  children: ComponentChildren;
  title?: string;
}

export default function Layout(
  { children, title = "CRITICO" }: LayoutProps,
) {
  // Navigation sections with Danish labels
  const mainSections = [
    { href: "/nyheder", text: "Nyheder" },
    { href: "/anmeldelser", text: "Anmeldelser" },
    { href: "/features", text: "Features" },
    { href: "/debat", text: "Debat" },
    { href: "/om", text: "Om" },
  ];

  const gameCategories = [
    { href: "/category/rpg", text: "RPG" },
    { href: "/category/action", text: "Action" },
    { href: "/category/adventure", text: "Adventure" },
    { href: "/category/strategy", text: "Strategy" },
    { href: "/category/simulation", text: "Simulation" },
    { href: "/category/sports", text: "Sports" },
    { href: "/category/indie", text: "Indie" },
  ];

  const recommendationSections = [
    { href: "/best-games", text: "Best Games" },
    { href: "/upcoming", text: "Upcoming Games" },
    { href: "/staff-picks", text: "Staff Picks" },
    { href: "/hidden-gems", text: "Hidden Gems" },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Merriweather:wght@400;700&display=swap"
        />
      </Head>
      <div className="min-h-screen font-sans bg-background-dark">
        {/* Top utility bar */}
        <div className="bg-background-dark text-black border-b border-secondary/20">
          <div className="max-w-7xl mx-auto px-4 py-1 flex justify-between items-center text-xs">
            <div className="flex items-center space-x-4">
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <a href="/newsletter">
                Nyhedsbrev
              </a>
              <a href="/search">
                Søg
              </a>
            </div>
          </div>
        </div>

        {/* Main masthead */}
        <header className="bg-background-light backdrop-blur-sm border-b border-secondary/20 pt-4 pb-2">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative flex justify-between items-center mb-4">
              {/* Left side - Mobile menu */}
              <div className="md:hidden z-10">
                <MobileMenu links={mainSections} />
              </div>

              {/* Center - CRITICO title as a link */}
              <div className="flex-1 text-center">
                <a href="/" className="inline-block hover:no-underline">
                  <h1 className="font-sans font-black text-4xl tracking-title uppercase text-black">
                    CRITICO
                  </h1>
                </a>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex justify-center border-t border-secondary/20 py-3 text-sm overflow-x-auto">
              <div className="flex space-x-6">
                {mainSections.map((section) => (
                  <a
                    key={section.href}
                    href={section.href}
                    className="text-black/90 transition-colors whitespace-nowrap font-medium"
                  >
                    {section.text}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </header>

        {/* Secondary navigation - game categories */}
        <div className="border-b border-secondary/20 hidden md:block bg-background-light/30">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex justify-center py-2 text-xs overflow-x-auto">
              <div className="flex space-x-5">
                {gameCategories.map((category) => (
                  <a
                    key={category.href}
                    href={category.href}
                    className="text-black/70 hover:text-accent-gold transition-colors whitespace-nowrap"
                  >
                    {category.text}
                  </a>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Mobile Navigation is now moved into the masthead */}

        <main className="py-4">
          {children}
        </main>

        <footer className="mt-12 py-8 bg-background-light/30 backdrop-blur-sm border-t border-secondary/20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-black text-lg mb-4 font-sans uppercase tracking-title text-black">
                  CRITICO
                </h3>
                <p className="text-sm text-black/70 mb-4">
                  Grundige og nuancerede kritikker af videospil med fokus på
                  fortællestrukturer, spiloplevelser og spilmekanikker.
                </p>
                <p className="text-sm text-black/90">
                  © {new Date().getFullYear()}{" "}
                  CRITICO. Alle rettigheder forbeholdes.
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-3 text-sm text-black">
                  Navigation
                </h4>
                <ul className="space-y-2">
                  {mainSections.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="text-sm text-black/70 hover:text-accent-gold transition-colors"
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-3 text-sm text-black">Følg Os</h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="#"
                      className="text-sm text-black/70 hover:text-accent-gold transition-colors"
                    >
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-black/70 hover:text-accent-gold transition-colors"
                    >
                      YouTube
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-black/70 hover:text-accent-gold transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-sm text-black/70 hover:text-accent-gold transition-colors"
                    >
                      Discord
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
