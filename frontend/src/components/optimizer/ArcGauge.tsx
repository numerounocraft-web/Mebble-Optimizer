"use client";

interface Props {
  score: number;
}

export default function ArcGauge({ score }: Props) {
  const cx = 110, cy = 110, r = 80, sw = 14;
  const circumference = Math.PI * r;
  const filled = (score / 100) * circumference;
  const category =
    score >= 90 ? "Excellent" : score >= 75 ? "Great" : score >= 50 ? "Good" : "Poor";
  const categoryColor =
    score >= 75 ? "#01B747" : score >= 50 ? "#F59E0B" : "#F70407";

  const arcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%" }}>
      <svg width="220" height="120" viewBox="0 0 220 120" style={{ overflow: "visible" }}>
        {/* Track */}
        <path d={arcPath} fill="none" stroke="#FFE8D6" strokeWidth={sw} strokeLinecap="round" />
        {/* Filled */}
        <path
          d={arcPath}
          fill="none"
          stroke="#FF7512"
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
        {/* Score */}
        <text
          x={cx} y={cy - 8}
          textAnchor="middle"
          fontSize="32" fontWeight="800"
          fill="#FF7512"
          fontFamily="Geist, system-ui, sans-serif"
          letterSpacing="-1"
        >
          {score}%
        </text>
      </svg>
      <span
        style={{
          fontSize: "13px",
          fontWeight: 600,
          letterSpacing: "-0.02em",
          color: categoryColor,
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          marginTop: "-8px",
        }}
      >
        {category}
      </span>
    </div>
  );
}
