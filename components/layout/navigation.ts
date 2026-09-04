export interface NavItem {
  label: string;
  href: string;
}

// Desktop/mobile primary navigation — docs/04-information-architecture.md.
export const primaryNav: NavItem[] = [
  { label: "About", href: "/about" },
  { label: "Products", href: "/products" },
  { label: "Collections", href: "/collections" },
  { label: "Services", href: "/services" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const quoteCta: NavItem = { label: "Request a Quote", href: "/contact" };
