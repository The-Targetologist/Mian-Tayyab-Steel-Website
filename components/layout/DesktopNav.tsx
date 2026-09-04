import Link from "next/link";
import { primaryNav } from "./navigation";

export function DesktopNav() {
  return (
    <nav aria-label="Primary" className="hidden lg:flex lg:items-center lg:gap-8">
      {primaryNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-neutral-700 transition-colors duration-fast hover:text-brand-600"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
