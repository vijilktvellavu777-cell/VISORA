import { redirect } from "next/navigation";
import { getDefaultSectionPath } from "@/lib/settings-area-sections";

export default function SettingsGeneralIndexPage() {
  redirect(getDefaultSectionPath("general"));
}
