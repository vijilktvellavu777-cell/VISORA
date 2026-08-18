"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GitBranch, ShoppingCart, UserPlus } from "lucide-react";
import { Card, PageHeader } from "@/components/ui";

const TEMPLATES = [
  {
    id: "onboarding",
    name: "Onboarding journey",
    description: "Welcome new users with a multi-step onboarding flow.",
    icon: UserPlus,
    steps: [
      { order: 0, type: "message", name: "Welcome email", config: "{}" },
      { order: 1, type: "delay", name: "Wait 1 day", config: '{"hours":24}' },
      { order: 2, type: "message", name: "Getting started tips", config: "{}" },
    ],
  },
  {
    id: "abandoned-cart",
    name: "Abandoned cart",
    description: "Re-engage shoppers who left items in their cart.",
    icon: ShoppingCart,
    steps: [
      { order: 0, type: "delay", name: "Wait 2 hours", config: '{"hours":2}' },
      { order: 1, type: "message", name: "Cart reminder", config: "{}" },
      { order: 2, type: "delay", name: "Wait 1 day", config: '{"hours":24}' },
      { order: 3, type: "message", name: "Final reminder", config: "{}" },
    ],
  },
  {
    id: "re-engagement",
    name: "Re-engagement",
    description: "Win back inactive users with a gentle nudge sequence.",
    icon: GitBranch,
    steps: [
      { order: 0, type: "message", name: "We miss you", config: "{}" },
      { order: 1, type: "delay", name: "Wait 3 days", config: '{"hours":72}' },
      { order: 2, type: "message", name: "Special offer", config: "{}" },
    ],
  },
] as const;

export default function CanvasTemplatesPage() {
  const router = useRouter();
  const [creating, setCreating] = useState<string | null>(null);

  async function createFromTemplate(template: (typeof TEMPLATES)[number]) {
    setCreating(template.id);
    const response = await fetch("/api/canvas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: template.name,
        description: template.description,
        steps: template.steps,
      }),
    });
    if (!response.ok) {
      setCreating(null);
      return;
    }
    const canvas = await response.json();
    router.push(`/canvas/${canvas.id}`);
    router.refresh();
  }

  return (
    <div>
      <PageHeader
        title="Use a template"
        subtitle="Start from a pre-built canvas journey and customize it for your audience."
      />
      <div className="grid gap-4 p-8 md:grid-cols-2 xl:grid-cols-3">
        {TEMPLATES.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="flex flex-col p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon size={20} />
              </div>
              <h2 className="mt-4 text-base font-semibold text-foreground">{template.name}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{template.description}</p>
              <p className="mt-3 text-xs text-muted">{template.steps.length} steps</p>
              <button
                type="button"
                disabled={creating === template.id}
                onClick={() => createFromTemplate(template)}
                className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-60"
              >
                {creating === template.id ? "Creating…" : "Use template"}
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
