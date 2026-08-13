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
    <div className="flex items-start justify-between gap-4 border-b border-[#262c3a] px-8 py-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-[#8b95a8]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#262c3a] bg-[#12151c] ${className}`}>{children}</div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "ok" | "warn" | "accent" }) {
  const colors = {
    neutral: "bg-[#181c26] text-[#c5cbd8]",
    ok: "bg-[#143322] text-[#3dd68c]",
    warn: "bg-[#332a12] text-[#f5c14a]",
    accent: "bg-[#2a2450] text-[#b7afff]",
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
      ? "inline-flex items-center rounded-lg bg-[#6d5efc] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#7d70ff]"
      : "inline-flex items-center rounded-lg border border-[#262c3a] px-3.5 py-2 text-sm text-[#c5cbd8] hover:bg-[#181c26]";
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
      <span className="mb-1.5 block text-[#8b95a8]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-lg border border-[#262c3a] bg-[#0b0d12] px-3 py-2 text-sm text-[#e8ecf4] outline-none focus:border-[#6d5efc]";
