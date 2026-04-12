"use client";

const FONT = "var(--font-geist-sans), system-ui, sans-serif";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SummarySection({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <span
        style={{
          fontSize: "13px",
          lineHeight: "90%",
          letterSpacing: "-0.02em",
          color: "#727272",
          fontWeight: 500,
          fontFamily: FONT,
        }}
      >
        Professional Summary
      </span>
      <textarea
        value={value}
        placeholder="Results-driven professional with 5+ years of experience…"
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "8px",
          border: "1px solid #F0F0F0",
          backgroundColor: "transparent",
          fontSize: "13px",
          fontWeight: 500,
          color: "#1F1F1F",
          fontFamily: FONT,
          letterSpacing: "-0.02em",
          lineHeight: "160%",
          outline: "none",
          resize: "vertical",
          boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
        onBlur={(e) => (e.target.style.borderColor = "#F0F0F0")}
      />
      <span
        style={{
          fontSize: "11px",
          color: "#C3C3C3",
          letterSpacing: "-0.02em",
          fontFamily: FONT,
        }}
      >
        {value.length} characters
      </span>
    </div>
  );
}
