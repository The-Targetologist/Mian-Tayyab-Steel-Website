import { Logo } from "./Logo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { SiteSearch } from "./SiteSearch";
import { Container } from "./Container";
import { Button } from "@/components/ui/Button";
import { quoteCta } from "./navigation";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-100 bg-white">
      <Container size="xl">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          <Logo />
          <DesktopNav />
          <div className="flex items-center gap-2">
            <SiteSearch />
            <Button href={quoteCta.href} variant="primary" className="hidden lg:inline-flex">
              {quoteCta.label}
            </Button>
            <MobileNav />
          </div>
        </div>
      </Container>
    </header>
  );
}
