import type { Workspace } from "@prisma/client";

export type WorkspaceEnvironmentId = "development" | "staging" | "production";

export type WorkspaceSettings = {
  workspaceName: string;
  workspaceId: string;
  workspaceType: string;
  environments: {
    development: { enabled: boolean; active: boolean };
    staging: { enabled: boolean; active: boolean };
    production: { enabled: boolean; active: boolean };
  };
  dataRegion: string;
};

export const WORKSPACE_TYPE_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "enterprise", label: "Enterprise" },
  { value: "sandbox", label: "Sandbox" },
  { value: "partner", label: "Partner" },
] as const;

export const DATA_REGION_OPTIONS = [
  { value: "US", label: "US" },
  { value: "EU", label: "EU" },
  { value: "India", label: "India" },
] as const;

export const ENVIRONMENT_META: Record<
  WorkspaceEnvironmentId,
  { label: string; description: string }
> = {
  development: {
    label: "Development",
    description: "For local and integration testing without live sends.",
  },
  staging: {
    label: "Staging",
    description: "Pre-production validation with production-like configuration.",
  },
  production: {
    label: "Production",
    description: "Live campaigns and messaging to your audience.",
  },
};

export function workspaceToWorkspaceSettings(workspace: Workspace): WorkspaceSettings {
  const active = (workspace.activeEnvironment ?? "production") as WorkspaceEnvironmentId;

  return {
    workspaceName: workspace.name,
    workspaceId: workspace.id,
    workspaceType: workspace.workspaceType ?? "standard",
    environments: {
      development: {
        enabled: workspace.envDevelopmentEnabled,
        active: active === "development",
      },
      staging: {
        enabled: workspace.envStagingEnabled,
        active: active === "staging",
      },
      production: {
        enabled: workspace.envProductionEnabled,
        active: active === "production",
      },
    },
    dataRegion: workspace.dataRegion ?? "US",
  };
}

export function workspaceSettingsToWorkspaceData(settings: WorkspaceSettings) {
  let activeEnvironment: WorkspaceEnvironmentId = "production";
  if (settings.environments.development.active) activeEnvironment = "development";
  else if (settings.environments.staging.active) activeEnvironment = "staging";
  else if (settings.environments.production.active) activeEnvironment = "production";

  return {
    name: settings.workspaceName.trim(),
    workspaceType: settings.workspaceType.trim() || null,
    activeEnvironment,
    envDevelopmentEnabled: settings.environments.development.enabled,
    envStagingEnabled: settings.environments.staging.enabled,
    envProductionEnabled: settings.environments.production.enabled,
    dataRegion: settings.dataRegion.trim() || null,
  };
}
