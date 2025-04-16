import { Head } from "$fresh/runtime.ts";
import { ComponentChildren } from "preact";
import MobileMenu from "../islands/MobileMenu.tsx";

interface LayoutProps {
  children: ComponentChildren;
  title?: string;
}

export default function Layout(
  { children, title = "The Questline" }: LayoutProps,
) {
  const navigationLinks = [
    { href: "/", text: "Home" },
    { href: "/blog", text: "Blog" },
    { href: "/news", text: "News" },
    { href: "/about", text: "About" },
  ];

  return (
    <>
      <Head>
        <title>{title}</title>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Lato:wght@400;500;600&display=swap"
        />
      </Head>
      <div class="min-h-screen bg-background-dark text-white font-sans">
        <header class="fixed top-0 w-full bg-background-light/50 backdrop-blur-sm border-b border-primary-dark/20 z-40">
          <nav class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" class="flex items-center space-x-3 group">
              <img
                src="/logo.svg"
                alt="The Questline Logo"
                class="h-10 w-10 transition-transform group-hover:scale-105"
              />
              <span class="font-serif text-2xl font-medium text-white group-hover:text-accent-gold transition-colors">
                The Questline
              </span>
            </a>

            {/* Desktop Navigation */}
            <div class="hidden md:flex space-x-8">
              {navigationLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  class="text-white/90 hover:text-accent-gold transition-colors font-medium"
                >
                  {link.text}
                </a>
              ))}
            </div>

            {/* Mobile Navigation */}
            <MobileMenu links={navigationLinks} />
          </nav>
        </header>

        <main class="pt-24">
          {children}
        </main>

        <footer class="mt-24 py-12 bg-background-light/30 backdrop-blur-sm">
          <div class="max-w-7xl mx-auto px-6">
            <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div class="flex items-center space-x-3">
                <img src="/logo.svg" alt="The Questline Logo" class="h-8 w-8" />
                <span class="font-serif text-xl text-white/90">
                  The Questline
                </span>
              </div>
              <div class="flex space-x-6">
                {navigationLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    class="text-white/70 hover:text-accent-gold transition-colors text-sm"
                  >
                    {link.text}
                  </a>
                ))}
              </div>
              <p class="text-white/70 text-sm">
                © {new Date().getFullYear()} The Questline. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
