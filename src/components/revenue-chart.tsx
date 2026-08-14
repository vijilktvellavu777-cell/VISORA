"use client";

import { useMemo, useState } from "react";
import type { HomePoint } from "@/lib/home";

export function RevenueChart({ points }: { points: HomePoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 720;
  const height = 280;
  const pad = { l: 52, r: 16, t: 16, b: 36 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const max = Math.max(...points.map((p) => p.value), 1);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  const coords = useMemo(() => {
    if (!points.length) return [];
    return points.map((point, index) => {
      const x = pad.l + (points.length === 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);
      const y = pad.t + innerH - (point.value / max) * innerH;
      return { ...point, x, y };
    });
  }, [points, innerH, innerW, max, pad.l, pad.t]);

  const line = coords.map((p) => `${p.x},${p.y}`).join(" ");
  const area = coords.length
    ? `${pad.l},${pad.t + innerH} ${line} ${coords[coords.length - 1].x},${pad.t + innerH}`
    : "";

  function money(value: number) {
                if (value >= 1000) return `$${Math.round(value / 1000)}K`;
    return `$${value.toLocaleString()}`;
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[280px] w-full"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => {
          const y = pad.t + innerH - (tick / max) * innerH;
          return (
            <g key={tick}>
              <line x1={pad.l} x2={width - pad.r} y1={y} y2={y} stroke="#E2E8F0" />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" className="fill-muted" fontSize="11">
                {money(tick)}
              </text>
            </g>
          );
        })}
        {coords.map((point, index) =>
          index % Math.max(1, Math.ceil(coords.length / 7)) === 0 ? (
            <text key={point.date} x={point.x} y={height - 10} textAnchor="middle" className="fill-muted" fontSize="11">
              {point.label}
            </text>
          ) : null,
        )}
        {area ? <polygon points={area} fill="url(#revFill)" /> : null}
        {coords.length ? <polyline fill="none" stroke="#7C3AED" strokeWidth="2.5" points={line} /> : null}
        {coords.map((point, index) => (
          <rect
            key={point.date}
            x={point.x - innerW / Math.max(points.length, 1) / 2}
            y={pad.t}
            width={Math.max(innerW / Math.max(points.length, 1), 8)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(index)}
          />
        ))}
        {hover !== null && coords[hover] ? (
          <g>
            <line
              x1={coords[hover].x}
              x2={coords[hover].x}
              y1={pad.t}
              y2={pad.t + innerH}
              stroke="#7C3AED"
              strokeDasharray="4 4"
            />
            <circle cx={coords[hover].x} cy={coords[hover].y} r="5" fill="#7C3AED" />
          </g>
        ) : null}
      </svg>
      {hover !== null && coords[hover] ? (
        <div
          className="pointer-events-none absolute rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-md"
          style={{
            left: `min(${(coords[hover].x / width) * 100}%, 78%)`,
            top: 24,
          }}
        >
          <div className="text-muted">{coords[hover].label}</div>
          <div className="font-semibold">${coords[hover].value.toLocaleString()}</div>
        </div>
      ) : null}
    </div>
  );
}
