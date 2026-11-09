// Decorative Googie / atompunk flourishes. Purely visual (aria-hidden), shared
// across the landing and auth screens so the retro look stays consistent.

/** A classic Googie starburst / sputnik spark. */
export function Starburst({
  className = "",
  color = "var(--mustard)",
  size = 64,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <g fill={color} stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round">
        <path d="M50 2 L58 38 L82 14 L62 46 L98 50 L62 54 L82 86 L58 62 L50 98 L42 62 L18 86 L38 54 L2 50 L38 46 L18 14 L42 38 Z" />
      </g>
    </svg>
  );
}

/** A little orbiting atom — the nucleus sits still, an electron circles it. */
export function AtomBadge({
  className = "",
  size = 120,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* orbit ring */}
      <div
        className="rf-spin-slow absolute inset-0 rounded-full border-[3px] border-ink"
        style={{ borderStyle: "dashed" }}
      />
      {/* nucleus */}
      <div
        className="absolute left-1/2 top-1/2 h-1/3 w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-ink"
        style={{ backgroundColor: "var(--tangerine)" }}
      />
      {/* electron */}
      <div
        className="absolute left-1/2 top-1/2 h-3 w-3 rounded-full border-2 border-ink"
        style={{
          backgroundColor: "var(--teal)",
          "--rf-orbit-r": `${size / 2 - 6}px`,
          animation: "rf-orbit 6s linear infinite",
        } as React.CSSProperties}
      />
    </div>
  );
}
