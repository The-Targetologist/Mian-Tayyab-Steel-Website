import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationForm } from "@/components/admin/LocationForm";
import { updateLocation } from "@/lib/actions/admin/locations";
import { getAdminLocationById } from "@/lib/queries/admin/locations";

export const metadata: Metadata = {
  title: "Edit Location | MTS Admin",
  robots: { index: false },
};

interface EditLocationPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
  const { id } = await params;

  const location = await getAdminLocationById(id);
  if (!location) {
    notFound();
  }

  const boundUpdateLocation = updateLocation.bind(null, id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">Edit location</h1>
      <div className="max-w-(--container-md)">
        <LocationForm action={boundUpdateLocation} location={location} />
      </div>
    </div>
  );
}
