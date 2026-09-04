import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type ContainerSize = "sm" | "md" | "lg" | "xl";

const sizeClasses: Record<ContainerSize, string> = {
  sm: "max-w-(--container-sm)",
  md: "max-w-(--container-md)",
  lg: "max-w-(--container-lg)",
  xl: "max-w-(--container-xl)",
};

interface ContainerProps {
  as?: ElementType;
  size?: ContainerSize;
  className?: string;
  children: ReactNode;
}

export function Container({ as: Tag = "div", size = "xl", className, children }: ContainerProps) {
  return (
    <Tag className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}>
      {children}
    </Tag>
  );
}
