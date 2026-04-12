"use client";

const FONT = "var(--font-geist-sans), system-ui, sans-serif";

interface Props {
  value: string;
  onChange: (value: string) => void;
  darkMode?: boolean;
}

export default function SummarySection({ value, onChange, darkMode }: Props) {
  const dm = darkMode ?? false;
  const borderColor = dm ? "#2C2C2C" : "#F0F0F0";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <span style={{ fontSize: "13px", lineHeight: "90%", letterSpacing: "-0.02em", color: dm ? "#888888" : "#727272", fontWeight: 500, fontFamily: FONT }}>
        Professional Summary
      </span>
      <textarea
        value={value}
        placeholder="Results-driven professional with 5+ years of experience…"
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        style={{
          width: "100%", padding: "8px", borderRadius: "8px",
          border: `1px solid ${borderColor}`, backgroundColor: "transparent",
          fontSize: "13px", fontWeight: 500, color: dm ? "#EFEFEF" : "#1F1F1F",
          fontFamily: FONT, letterSpacing: "-0.02em", lineHeight: "160%",
          outline: "none", resize: "vertical", boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
        onBlur={(e) => (e.target.style.borderColor = borderColor)}
      />
      <span style={{ fontSize: "11px", color: dm ? "#555558" : "#C3C3C3", letterSpacing: "-0.02em", fontFamily: FONT }}>
        {value.length} characters
      </span>
    </div>
  );
}
