"use client";

type HeaderIconTooltipProps = {
  label: string;
  children: React.ReactNode;
  className?: string;
};

export function HeaderIconTooltip({ label, children, className = "" }: HeaderIconTooltipProps) {
  return (
    <div className={`group relative ${className}`.trim()}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] z-40 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#1e293b] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {label}
      </span>
    </div>
  );
}
