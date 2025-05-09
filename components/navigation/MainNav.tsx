import { ComponentChildren } from "preact";
import Divider from "../misc/Divider.tsx";

interface NavLink {
  href: string;
  text: string;
}

interface MainNavProps {
  links: NavLink[];
}

export default function MainNav({ links }: MainNavProps) {
  return (
    <div className="hidden md:block">
      <Divider spacing="no-space" />
      <nav className="flex justify-center items-center py-3 text-sm overflow-x-auto">
        <div className="flex items-center space-x-6">
          {links.map((section) => (
            <a
              key={section.href}
              href={section.href}
              className="text-black/90 transition-colors whitespace-nowrap font-medium flex items-center"
            >
              {section.text}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
