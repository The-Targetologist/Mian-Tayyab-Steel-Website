import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { Container, type ContainerSize } from "./Container";

// Section background states — docs/07-design-system.md §16.
// Choose deliberately per section content; do not alternate mechanically.
export type SectionBackground = "white" | "off-white" | "pale-blue" | "navy" | "charcoal";

const backgroundClasses: Record<SectionBackground, string> = {
  white: "bg-white text-neutral-900",
  "off-white": "bg-neutral-50 text-neutral-900",
  "pale-blue": "bg-brand-50 text-neutral-900",
  navy: "bg-brand-950 text-white",
  charcoal: "bg-neutral-950 text-white",
};

interface SectionProps {
  as?: ElementType;
  background?: SectionBackground;
  containerSize?: ContainerSize;
  className?: string;
  children: ReactNode;
}

export function Section({
  as: Tag = "section",
  background = "white",
  containerSize = "xl",
  className,
  children,
}: SectionProps) {
  return (
    <Tag className={cn("py-16 lg:py-24", backgroundClasses[background], className)}>
      <Container size={containerSize}>{children}</Container>
    </Tag>
  );
}
