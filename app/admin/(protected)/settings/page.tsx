import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { updateSiteSettings } from "@/lib/actions/admin/settings";
import { getAdminSiteSettings } from "@/lib/queries/admin/settings";

export const metadata: Metadata = {
  title: "Site Settings | MTS Admin",
  robots: { index: false },
};

export default async function AdminSettingsPage() {
  const settings = await getAdminSiteSettings();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h2 font-bold text-neutral-950">Site settings</h1>
      <div className="max-w-(--container-md)">
        <SettingsForm action={updateSiteSettings} settings={settings} />
      </div>
    </div>
  );
}
