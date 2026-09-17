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
    items: [{ href: "/settings/general", label: "General" }],
  },
  {
    id: "workspace",
    title: "Workspace",
    icon: Building2,
    items: [{ href: "/settings/workspace", label: "Workspace" }],
  },
  {
    id: "team-access",
    title: "Team & Access",
    icon: Users,
    items: [{ href: "/settings/team-access", label: "Team & Access" }],
  },
  {
    id: "channels",
    title: "Channels",
    icon: Radio,
    items: [
      { href: "/settings/channels/email", label: "Email" },
      { href: "/settings/channels/push", label: "Push Notifications" },
      { href: "/settings/channels/whatsapp", label: "WhatsApp" },
      { href: "/settings/channels/in-app", label: "In-App Messages" },
      { href: "/settings/channels/content-cards", label: "Content Cards" },
    ],
  },
  {
    id: "domains-sending",
    title: "Domains & Sending",
    icon: Globe,
    items: [{ href: "/settings/domains-sending", label: "Domains & Sending" }],
  },
  {
    id: "audience-consent",
    title: "Audience & Consent",
    icon: UserCheck,
    items: [{ href: "/settings/audience-consent", label: "Audience & Consent" }],
  },
  {
    id: "tracking-data",
    title: "Tracking & Data",
    icon: Workflow,
    items: [{ href: "/settings/tracking-data", label: "Tracking & Data" }],
  },
  {
    id: "templates",
    title: "Templates",
    icon: LayoutTemplate,
    items: [{ href: "/settings/templates", label: "Templates" }],
  },
  {
    id: "integrations",
    title: "Integrations",
    icon: Plug,
    items: [{ href: "/settings/integrations", label: "Integrations" }],
  },
  {
    id: "webhooks",
    title: "Webhooks",
    icon: Webhook,
    items: [{ href: "/settings/webhooks", label: "Webhooks" }],
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    items: [{ href: "/settings/notifications", label: "Notifications" }],
  },
  {
    id: "security",
    title: "Security",
    icon: Shield,
    items: [{ href: "/settings/security", label: "Security" }],
  },
  {
    id: "billing-usage",
    title: "Billing & Usage",
    icon: CreditCard,
    items: [{ href: "/settings/billing-usage", label: "Billing & Usage" }],
  },
  {
    id: "developer-api",
    title: "Developer",
    icon: Code2,
    items: [{ href: "/settings/developer-api", label: "Developer" }],
  },
];

export const DEFAULT_SETTINGS_PATH = "/settings/general";
