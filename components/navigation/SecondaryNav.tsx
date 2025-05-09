import { ComponentChildren } from "preact";

interface NavItem {
  href: string;
  text: string;
}

interface SecondaryNavProps {
  items: NavItem[];
}

export default function SecondaryNav({ items }: SecondaryNavProps) {
  return (
    <div className="border-b border-secondary/20 hidden md:block bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <nav className="flex justify-center py-2 text-xs overflow-x-auto">
          <div className="flex space-x-5">
            {items.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-black/70 hover:text-accent-gold transition-colors whitespace-nowrap"
              >
                {item.text}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
