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
import { getSettingsAreaHubPath } from "@/lib/settings-area-sections";

export const SETTINGS_HUB_PATH = "/settings";

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
    items: [{ href: getSettingsAreaHubPath("general"), label: "General" }],
  },
  {
    id: "workspace",
    title: "Workspace",
    icon: Building2,
    items: [{ href: getSettingsAreaHubPath("workspace"), label: "Workspace" }],
  },
  {
    id: "team-access",
    title: "Team & Access",
    icon: Users,
    items: [{ href: getSettingsAreaHubPath("team-access"), label: "Team & Access" }],
  },
  {
    id: "channels",
    title: "Channels",
    icon: Radio,
    items: [
      { href: getSettingsAreaHubPath("channels-email"), label: "Email" },
      { href: getSettingsAreaHubPath("channels-push"), label: "Push Notifications" },
      { href: getSettingsAreaHubPath("channels-whatsapp"), label: "WhatsApp" },
      { href: getSettingsAreaHubPath("channels-in-app"), label: "In-App Messages" },
      { href: getSettingsAreaHubPath("channels-content-cards"), label: "Content Cards" },
    ],
  },
  {
    id: "domains-sending",
    title: "Domains & Sending",
    icon: Globe,
    items: [{ href: getSettingsAreaHubPath("domains-sending"), label: "Domains & Sending" }],
  },
  {
    id: "audience-consent",
    title: "Audience & Consent",
    icon: UserCheck,
    items: [{ href: getSettingsAreaHubPath("audience-consent"), label: "Audience & Consent" }],
  },
  {
    id: "tracking-data",
    title: "Tracking & Data",
    icon: Workflow,
    items: [{ href: getSettingsAreaHubPath("tracking-data"), label: "Tracking & Data" }],
  },
  {
    id: "templates",
    title: "Templates",
    icon: LayoutTemplate,
    items: [{ href: getSettingsAreaHubPath("templates"), label: "Templates" }],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Plug,
    items: [{ href: getSettingsAreaHubPath("integrations"), label: "Integrations" }],
  },
  {
    id: "webhooks",
    title: "Webhooks",
    icon: Webhook,
    items: [{ href: getSettingsAreaHubPath("webhooks"), label: "Webhooks" }],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    items: [{ href: getSettingsAreaHubPath("notifications"), label: "Notifications" }],
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    items: [{ href: getSettingsAreaHubPath("security"), label: "Security" }],
  },
  {
    id: "billing-usage",
    title: "Billing & Usage",
    icon: CreditCard,
    items: [{ href: getSettingsAreaHubPath("billing-usage"), label: "Billing & Usage" }],
  },
  {
    id: "developer-api",
    title: "Developer",
    icon: Code2,
    items: [{ href: getSettingsAreaHubPath("developer-api"), label: "Developer" }],
  },
];

export const DEFAULT_SETTINGS_PATH = "/settings/general/organization";
