import { FolderOpen, LayoutGrid } from "lucide-react";
import type { HubPanelNavSection } from "@/components/hub-panel-subnav";

export const CONTENT_NAV_SECTIONS: HubPanelNavSection[] = [
  {
    id: "templates",
    title: "Templates",
    icon: LayoutGrid,
    items: [
      { href: "/content/templates/canvas", label: "Canvas" },
      { href: "/content/templates/content-blocks", label: "Content blocks" },
      { href: "/content/templates/in-app-messages", label: "In-app messages" },
      { href: "/content/templates/email", label: "Email" },
      { href: "/content/templates/push", label: "Push" },
    ],
  },
  {
    id: "files",
    title: "Files",
    icon: FolderOpen,
    items: [
      { href: "/content/files/media-library", label: "Media Library" },
      { href: "/content/files/link-table", label: "Link Table" },
    ],
  },
];
