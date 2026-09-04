import type { Metadata } from "next";
import { LocationForm } from "@/components/admin/LocationForm";
import { createLocation } from "@/lib/actions/admin/locations";

export const metadata: Metadata = {
  title: "New Location | MTS Admin",
  robots: { index: false },
};

export default function NewLocationPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">New location</h1>
      <div className="max-w-(--container-md)">
        <LocationForm action={createLocation} />
      </div>
    </div>
  );
}
