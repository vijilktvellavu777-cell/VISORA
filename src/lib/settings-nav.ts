import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Building2,
  Code2,
  CreditCard,
  Globe,
  LayoutTemplate,
  Plug,
  Radio,
  Shield,
  SlidersHorizontal,
  UserCheck,
  Users,
  Webhook,
  Workflow,
} from "lucide-react";
import { getDefaultSectionPath } from "@/lib/settings-area-sections";

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
    items: [{ href: getDefaultSectionPath("general"), label: "General" }],
  },
  {
    id: "workspace",
    title: "Workspace",
    icon: Building2,
    items: [{ href: getDefaultSectionPath("workspace"), label: "Workspace" }],
  },
  {
    id: "team-access",
    title: "Team & Access",
    icon: Users,
    items: [{ href: getDefaultSectionPath("team-access"), label: "Team & Access" }],
  },
  {
    id: "channels",
    title: "Channels",
    icon: Radio,
    items: [
      { href: getDefaultSectionPath("channels-email"), label: "Email" },
      { href: getDefaultSectionPath("channels-push"), label: "Push Notifications" },
      { href: getDefaultSectionPath("channels-whatsapp"), label: "WhatsApp" },
      { href: getDefaultSectionPath("channels-in-app"), label: "In-App Messages" },
      { href: getDefaultSectionPath("channels-content-cards"), label: "Content Cards" },
    ],
  },
  {
    id: "domains-sending",
    title: "Domains & Sending",
    icon: Globe,
    items: [{ href: getDefaultSectionPath("domains-sending"), label: "Domains & Sending" }],
  },
  {
    id: "audience-consent",
    title: "Audience & Consent",
    icon: UserCheck,
    items: [{ href: getDefaultSectionPath("audience-consent"), label: "Audience & Consent" }],
  },
  {
    id: "tracking-data",
    title: "Tracking & Data",
    icon: Workflow,
    items: [{ href: getDefaultSectionPath("tracking-data"), label: "Tracking & Data" }],
  },
  {
    id: "templates",
    title: "Templates",
    icon: LayoutTemplate,
    items: [{ href: getDefaultSectionPath("templates"), label: "Templates" }],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Plug,
    items: [{ href: getDefaultSectionPath("integrations"), label: "Integrations" }],
  },
  {
    id: "webhooks",
    title: "Webhooks",
    icon: Webhook,
    items: [{ href: getDefaultSectionPath("webhooks"), label: "Webhooks" }],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    items: [{ href: getDefaultSectionPath("notifications"), label: "Notifications" }],
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    items: [{ href: getDefaultSectionPath("security"), label: "Security" }],
  },
  {
    id: "billing-usage",
    title: "Billing & Usage",
    icon: CreditCard,
    items: [{ href: getDefaultSectionPath("billing-usage"), label: "Billing & Usage" }],
  },
  {
    id: "developer-api",
    title: "Developer",
    icon: Code2,
    items: [{ href: getDefaultSectionPath("developer-api"), label: "Developer" }],
  },
];

export const DEFAULT_SETTINGS_PATH = getDefaultSectionPath("general");
