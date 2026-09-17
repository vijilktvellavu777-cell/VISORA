import type { SettingsPageKey } from "@/lib/settings-pages/types";

const PERMISSION_AREAS = [
  "campaigns",
  "journeys",
  "audience",
  "templates",
  "analytics",
  "settings",
  "billing",
] as const;

function defaultPermissions() {
  return {
    campaigns: { owner: true, admin: true, marketer: true, analyst: true, developer: false },
    journeys: { owner: true, admin: true, marketer: true, analyst: false, developer: true },
    audience: { owner: true, admin: true, marketer: true, analyst: true, developer: true },
    templates: { owner: true, admin: true, marketer: true, analyst: false, developer: true },
    analytics: { owner: true, admin: true, marketer: false, analyst: true, developer: false },
    settings: { owner: true, admin: true, marketer: false, analyst: false, developer: true },
    billing: { owner: true, admin: true, marketer: false, analyst: false, developer: false },
  };
}

export function getDefaultSettingsPageData(key: SettingsPageKey): unknown {
  switch (key) {
    case "team-access":
      return {
        members: [
          {
            id: "member-1",
            name: "VISORA User",
            email: "user@visora.app",
            role: "owner",
          },
        ],
        permissions: defaultPermissions(),
        auditLogs: [
          {
            id: "log-1",
            at: new Date().toISOString(),
            actor: "VISORA User",
            action: "Signed in to workspace",
          },
        ],
      };
    case "domains-sending":
      return {
        sendingDomains: [{ id: "sd-1", domain: "mail.visora.app", verified: true }],
        trackingDomains: [{ id: "td-1", domain: "track.visora.app", verified: false }],
        dns: {
          spf: "v=spf1 include:send.visora.app ~all",
          dkim: "visora._domainkey.visora.app",
          dmarc: "v=DMARC1; p=none; rua=mailto:dmarc@visora.app",
        },
        linkTracking: { enabled: true, domain: "track.visora.app" },
        senderIdentities: [
          { id: "si-1", name: "VISORA Team", email: "hello@visora.app", verified: true },
        ],
      };
    case "audience-consent":
      return {
        consentManagement: { enabled: true, requireOptIn: true },
        channelPreferences: {
          email: true,
          push: true,
          whatsapp: false,
          inApp: true,
          contentCards: true,
        },
        subscriptionTypes: ["Marketing", "Product updates", "Transactional"],
        suppression: { syncSuppressionLists: true },
        unsubscribe: { oneClickEnabled: true, customFooter: false },
        preferenceCenter: { enabled: false, url: "" },
        consentLogs: [
          {
            id: "cl-1",
            at: new Date().toISOString(),
            user: "user_001",
            channel: "email",
            action: "opt_in",
          },
        ],
      };
    case "tracking-data":
      return {
        sdk: { enabled: true, appIdentifier: "visora-web" },
        trackEvents: true,
        trackAttributes: true,
        trackSessions: true,
        trackPageViews: true,
        visitorIdStrategy: "anonymous_cookie",
        userIdStrategy: "external_id",
        dataRetentionDays: 365,
      };
    case "webhooks":
      return {
        endpoint: "",
        secret: "",
        events: {
          campaignCompleted: true,
          campaignFailed: true,
          userUpdated: false,
          segmentUpdated: false,
        },
        retryPolicy: "exponential",
        maxRetries: 5,
        deliveryHistory: [] as { id: string; at: string; event: string; status: string }[],
        responseLogs: [] as { id: string; at: string; statusCode: number; bodyPreview: string }[],
      };
    case "notifications":
      return {
        campaignCompleted: true,
        campaignFailed: true,
        deliveryIssues: true,
        integrationErrors: true,
        billingAlerts: true,
        securityAlerts: true,
        systemUpdates: false,
      };
    case "security":
      return {
        twoFactorEnabled: false,
        ipRestrictionsEnabled: false,
        allowedIps: "",
        sessions: [
          {
            id: "sess-1",
            device: "Chrome on macOS",
            location: "United States",
            lastActive: new Date().toISOString(),
            current: true,
          },
        ],
        accessLogs: [
          {
            id: "acc-1",
            at: new Date().toISOString(),
            actor: "VISORA User",
            action: "settings.view",
          },
        ],
        auditLogs: [
          {
            id: "aud-1",
            at: new Date().toISOString(),
            actor: "VISORA User",
            action: "login.success",
          },
        ],
      };
    case "billing-usage":
      return {
        currentPlan: "growth",
        usage: {
          emails: 12400,
          push: 8200,
          whatsapp: 0,
          inApp: 4100,
          contentCards: 900,
        },
        limits: {
          emails: 50000,
          push: 25000,
          whatsapp: 5000,
          inApp: 25000,
          contentCards: 10000,
        },
        paymentMethodLast4: "4242",
        paymentMethodBrand: "Visa",
      };
    case "developer-api":
      return {
        sdks: {
          web: { installed: true },
          android: { installed: false },
          ios: { installed: false },
          flutter: { installed: false },
        },
        docsBaseUrl: "https://docs.visora.app",
      };
    default:
      return {};
  }
}

export const TEAM_ROLES = [
  { id: "owner", label: "Owner" },
  { id: "admin", label: "Admin" },
  { id: "marketer", label: "Marketer" },
  { id: "analyst", label: "Analyst" },
  { id: "developer", label: "Developer" },
] as const;

export const PERMISSION_LABELS: Record<(typeof PERMISSION_AREAS)[number], string> = {
  campaigns: "Campaigns",
  journeys: "Journeys",
  audience: "Audience",
  templates: "Templates",
  analytics: "Analytics",
  settings: "Settings",
  billing: "Billing",
};
