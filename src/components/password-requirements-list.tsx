"use client";

import { passwordRequirementStatus } from "@/lib/password-policy";

export function PasswordRequirementsList({ password }: { password: string }) {
  const items = passwordRequirementStatus(password);

  return (
    <ul className="space-y-1.5 rounded-lg border border-border bg-background px-4 py-3 text-sm">
      {items.map((item) => (
        <li key={item.id} className={item.ok ? "text-success" : "text-muted"}>
          {item.ok ? "✓" : "•"} {item.label}
        </li>
      ))}
    </ul>
  );
}
