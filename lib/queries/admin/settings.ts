import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SITE_SETTINGS_SELECT, mapSiteSettings, type SiteSettingsRow } from "@/lib/queries/settings";
import type { SiteSettings } from "@/types/content";

// Admin read of the singleton settings row. RLS already allows public read
// (settings have no draft/published distinction), but the privileged client
// is used here anyway for consistency with every other lib/queries/admin/*
// file, keeping the admin read path isolated from the public one.
export async function getAdminSiteSettings(): Promise<SiteSettings> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(SITE_SETTINGS_SELECT)
    .eq("id", 1)
    .single();

  if (error) {
    throw new Error(`getAdminSiteSettings: ${error.message}`);
  }

  return mapSiteSettings(data as unknown as SiteSettingsRow);
}
