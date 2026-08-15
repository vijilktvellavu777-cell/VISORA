"use client";

import Link from "next/link";
import { GitBranch, ShoppingCart, UserPlus } from "lucide-react";
import { Card, EmptyState, PageHeader } from "@/components/ui";

const STARTER_TEMPLATES = [
  {
    id: "onboarding",
    name: "Onboarding journey",
    description: "Welcome new users with a multi-step onboarding flow.",
    icon: UserPlus,
    href: "/canvas/templates",
  },
  {
    id: "abandoned-cart",
    name: "Abandoned cart",
    description: "Re-engage shoppers who left items in their cart.",
    icon: ShoppingCart,
    href: "/canvas/templates",
  },
  {
    id: "re-engagement",
    name: "Re-engagement",
    description: "Win back inactive users with a gentle nudge sequence.",
    icon: GitBranch,
    href: "/canvas/templates",
  },
] as const;

type CanvasTemplateRow = {
  id: string;
  name: string;
  description: string | null;
  status: string;
  _count: { steps: number };
};

export function ContentCanvasTemplatesView({ canvases }: { canvases: CanvasTemplateRow[] }) {
  return (
    <div>
      <PageHeader
        title="Canvas"
        subtitle="Reusable canvas journey templates for multi-step engagement flows."
        action={
          <Link
            href="/canvas/templates"
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark"
          >
            Browse templates
          </Link>
        }
      />
      <div className="space-y-6 p-8">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Starter templates</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {STARTER_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{template.name}</h3>
                  <p className="mt-1 text-sm text-muted">{template.description}</p>
                  <Link href={template.href} className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
                    Use template
                  </Link>
                </Card>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">Saved canvas templates</h2>
          {canvases.length === 0 ? (
            <Card className="mt-3">
              <EmptyState
                title="No canvas templates yet"
                body="Create a canvas from a starter template or build a new journey in Canvas."
              />
            </Card>
          ) : (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {canvases.map((canvas) => (
                <Card key={canvas.id} className="p-5">
                  <div className="font-medium text-foreground">{canvas.name}</div>
                  {canvas.description ? <p className="mt-1 text-sm text-muted">{canvas.description}</p> : null}
                  <p className="mt-2 text-xs text-muted">
                    {canvas._count.steps} steps · {canvas.status}
                  </p>
                  <Link href={`/canvas/${canvas.id}`} className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
                    Open canvas
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
