import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, SlidersHorizontal, Wrench } from "lucide-react";

export type SettingsNavItem = {
  href: string;
  label: string;
  badge?: string;
};

export type SettingsNavSection = {
  id: string;
  title: string;
  icon: LucideIcon;
  items: SettingsNavItem[];
};

export const SETTINGS_NAV_SECTIONS: SettingsNavSection[] = [
  {
    id: "general",
    title: "General",
    icon: SlidersHorizontal,
    items: [
      { href: "/settings/general/profile", label: "Profile" },
      { href: "/settings/general/email", label: "Email settings" },
      { href: "/settings/general/push", label: "Push settings" },
      { href: "/settings/general/in-app", label: "In-app settings" },
      { href: "/settings/general/whatsapp", label: "WhatsApp settings" },
    ],
  },
  {
    id: "setup",
    title: "Setup and testing",
    icon: Wrench,
    items: [
      { href: "/settings/setup/app", label: "App settings" },
      { href: "/settings/setup/website-testing", label: "Website testing" },
    ],
  },
  {
    id: "account",
    title: "Account Management",
    icon: BriefcaseBusiness,
    items: [
      { href: "/settings/account/billing", label: "Account and billing" },
      { href: "/settings/account/users", label: "Users and teams" },
      { href: "/settings/account/privacy", label: "Privacy and concerns" },
      { href: "/settings/account/domains", label: "Domains and URLs" },
    ],
  },
];

export const DEFAULT_SETTINGS_PATH = "/settings/general/profile";
