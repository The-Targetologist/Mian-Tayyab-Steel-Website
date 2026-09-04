import type { Service } from "@/types/content";
import { ServiceCard } from "./ServiceCard";

interface ServiceGridProps {
  services: Service[];
  emptyMessage?: string;
}

export function ServiceGrid({
  services,
  emptyMessage = "No services are published yet.",
}: ServiceGridProps) {
  if (services.length === 0) {
    return <p className="text-body text-neutral-500">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}
