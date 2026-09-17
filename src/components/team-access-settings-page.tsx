"use client";

import { Field, inputClass } from "@/components/ui";
import {
  SettingsDataTable,
  SettingsFormSection,
  settingsSelectClass,
} from "@/components/settings-form-section";
import {
  SettingsPageShell,
  getArray,
  getObject,
  getString,
  setNestedForm,
} from "@/components/settings-page-shell";
import { PERMISSION_LABELS, TEAM_ROLES } from "@/lib/settings-pages/defaults";

export function TeamAccessSettingsPage({ initial }: { initial: Record<string, unknown> }) {
  return (
    <SettingsPageShell
      pageKey="team-access"
      title="Team & Access"
      subtitle="Members, roles, permissions, and audit history."
      initial={initial}
    >
      {(form, setForm) => {
        const members = getArray(form.members);
        const permissions = getObject(form.permissions);
        const auditLogs = getArray(form.auditLogs);

        function updateMember(index: number, patch: Record<string, unknown>) {
          setForm((prev) => {
            const next = [...getArray(prev.members)];
            next[index] = { ...next[index], ...patch };
            return { ...prev, members: next };
          });
        }

        function addMember() {
          setForm((prev) => ({
            ...prev,
            members: [
              ...getArray(prev.members),
              {
                id: `member-${Date.now()}`,
                name: "",
                email: "",
                role: "marketer",
              },
            ],
          }));
        }

        return (
          <>
            <SettingsFormSection title="Team Members" description="People with access to this workspace.">
              <ul className="space-y-3">
                {members.map((member, index) => (
                  <li key={getString(member.id, String(index))} className="rounded-lg border border-border p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <Field label="Name">
                        <input
                          className={inputClass}
                          value={getString(member.name)}
                          onChange={(event) => updateMember(index, { name: event.target.value })}
                        />
                      </Field>
                      <Field label="Email">
                        <input
                          className={inputClass}
                          type="email"
                          value={getString(member.email)}
                          onChange={(event) => updateMember(index, { email: event.target.value })}
                        />
                      </Field>
                      <Field label="Role">
                        <select
                          className={settingsSelectClass}
                          value={getString(member.role, "marketer")}
                          onChange={(event) => updateMember(index, { role: event.target.value })}
                        >
                          {TEAM_ROLES.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={addMember}
                className="rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-background"
              >
                Invite member
              </button>
            </SettingsFormSection>

            <SettingsFormSection title="Roles" description="Built-in workspace roles.">
              <ul className="grid gap-2 sm:grid-cols-2">
                {TEAM_ROLES.map((role) => (
                  <li key={role.id} className="rounded-lg border border-border px-4 py-3 text-sm font-medium text-foreground">
                    {role.label}
                  </li>
                ))}
              </ul>
            </SettingsFormSection>

            <SettingsFormSection title="Permissions" description="Role access by product area.">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-border bg-background text-muted">
                    <tr>
                      <th className="px-3 py-2.5 font-medium">Area</th>
                      {TEAM_ROLES.map((role) => (
                        <th key={role.id} className="px-3 py-2.5 font-medium">
                          {role.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(PERMISSION_LABELS).map(([area, label]) => {
                      const row = getObject(permissions[area]);
                      return (
                        <tr key={area} className="border-b border-border last:border-0">
                          <td className="px-3 py-2.5 font-medium text-foreground">{label}</td>
                          {TEAM_ROLES.map((role) => (
                            <td key={role.id} className="px-3 py-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={Boolean(row[role.id])}
                                disabled={role.id === "owner"}
                                onChange={(event) => {
                                  setForm((prev) => {
                                    const perm = getObject(prev.permissions);
                                    const areaRow = getObject(perm[area]);
                                    return {
                                      ...prev,
                                      permissions: {
                                        ...perm,
                                        [area]: { ...areaRow, [role.id]: event.target.checked },
                                      },
                                    };
                                  });
                                }}
                                className="h-4 w-4 rounded border-border text-primary"
                              />
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SettingsFormSection>

            <SettingsFormSection title="Audit Logs" description="Recent access and configuration events.">
              <SettingsDataTable
                columns={["Time", "Actor", "Action"]}
                rows={auditLogs.map((log) => [
                  new Date(getString(log.at)).toLocaleString(),
                  getString(log.actor),
                  getString(log.action),
                ])}
                emptyMessage="No audit events recorded yet."
              />
            </SettingsFormSection>
          </>
        );
      }}
    </SettingsPageShell>
  );
}
