import { redirect } from "next/navigation";
import { getDefaultSectionPath } from "@/lib/settings-area-sections";

export default function Page() {
  redirect(getDefaultSectionPath("tracking-data"));
}
