import { Users } from "lucide-react";
import type { HubPanelNavSection } from "@/components/hub-panel-subnav";

export const AUDIENCE_NAV_SECTIONS: HubPanelNavSection[] = [
  {
    id: "audience",
    title: "Audience",
    icon: Users,
    items: [
      { href: "/audience/segments", label: "Segments" },
      { href: "/audience/list-extensions", label: "List Extensions" },
      { href: "/audience/suppression", label: "Suppression lists" },
      { href: "/audience/find", label: "Find Users" },
      { href: "/audience/import-export", label: "Import and export users" },
    ],
  },
];
