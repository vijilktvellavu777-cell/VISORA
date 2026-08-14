export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border bg-surface px-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-border bg-surface shadow-sm ${className}`}>{children}</div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "ok" | "warn" | "accent";
}) {
  const colors = {
    neutral: "bg-background text-muted",
    ok: "bg-success/10 text-success",
    warn: "bg-warning/10 text-warning",
    accent: "bg-primary/10 text-primary",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${colors[tone]}`}>
      {children}
    </span>
  );
}

export function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost";
}) {
  const cls =
    variant === "primary"
      ? "inline-flex items-center rounded-lg bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-primary-dark"
      : "inline-flex items-center rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-foreground hover:bg-background";
  if (href) {
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block text-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-primary";

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <p className="mt-1 text-sm text-muted">{body}</p>
    </div>
  );
}
