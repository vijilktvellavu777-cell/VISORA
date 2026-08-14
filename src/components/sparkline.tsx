export function Sparkline({ values, className = "" }: { values: number[]; className?: string }) {
  const width = 88;
  const height = 36;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const pts = values.length
    ? values.map((value, index) => {
        const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
        const y = height - ((value - min) / span) * (height - 4) - 2;
        return `${x},${y}`;
      })
    : [`0,${height - 2}`, `${width},${height - 2}`];
  const line = pts.join(" ");
  const area = `0,${height} ${line} ${width},${height}`;
  const fillId = `spark-${values.length}-${values[0] ?? 0}-${values.at(-1) ?? 0}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} width={width} height={height}>
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${fillId})`} points={area} opacity="0.25" />
      <polyline fill="none" stroke="#7C3AED" strokeWidth="1.75" points={line} />
    </svg>
  );
}
