import { Head } from "$fresh/runtime.ts";
import { ComponentChildren } from "preact";
import MobileMenu from "../islands/MobileMenu.tsx";
import SearchInput from "../islands/SearchInput.tsx";
import CategoryNav from "../islands/CategoryNav.tsx";
import MainNav from "./navigation/MainNav.tsx";
import Divider from "./misc/Divider.tsx";

interface LayoutProps {
  children: ComponentChildren;
  title?: string;
}

export default function Layout(
  { children, title = "CRITICO" }: LayoutProps,
) {
  // Navigation sections with Danish labels
  const mainSections = [
    { href: "/", text: "Forside" },
    { href: "/nyhed", text: "Nyheder" },
    { href: "/anmeldelser", text: "Anmeldelser" },
    { href: "/features", text: "Features" },
    { href: "/debat", text: "Debat" },
    { href: "/om", text: "Om" },
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
                {new Date().toLocaleDateString("da-DK", {
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
              <div className="w-32">
                <SearchInput />
              </div>
            </div>
          </div>
        </div>

        {/* Main masthead */}
        <header className="bg-white pt-4">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              {/* Left side - Empty spacer */}
              <div className="w-10"></div>

              {/* Center - CRITICO title as a link */}
              <div className="flex-grow text-center">
                <a href="/" className="inline-block hover:no-underline">
                  <h1 className="font-sans font-black text-2xl md:text-4xl lg:text-6xl tracking-title uppercase text-black">
                    CRITICO
                  </h1>
                </a>
              </div>

              {/* Right side - Mobile menu */}
              <div className="md:hidden z-10 w-10 flex items-center justify-end">
                <MobileMenu links={mainSections} />
              </div>

              {/* Empty div for desktop */}
              <div className="hidden md:block w-10"></div>
            </div>

            {/* Navigation */}
            <MainNav links={mainSections} />
          </div>
        </header>
        <Divider spacing="no-space" />
        <CategoryNav />

        <main className="py-4">
          {children}
        </main>
        <Divider spacing="no-space" className="mt-12 " />
        <footer className="py-8 bg-white border-secondary/20">
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
