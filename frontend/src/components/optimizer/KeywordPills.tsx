"use client";

interface Props {
  matched: string[];
  missing: string[];
}

function Pill({ word, variant }: { word: string; variant: "matched" | "missing" }) {
  const color = variant === "matched" ? "#01B747" : "#F70407";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: "9999px",
        fontSize: "12px",
        fontWeight: 500,
        letterSpacing: "-0.02em",
        lineHeight: 1,
        backgroundColor: "#F9F9FB",
        color,
        border: "1px solid #F1F1F1",
      }}
    >
      {word}
    </span>
  );
}

export default function KeywordPills({ matched, missing }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Matched */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "8px",
          }}
        >
          <div style={{ width: "7px", height: "7px", borderRadius: "9999px", backgroundColor: "#01B747" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#727272", letterSpacing: "-0.02em" }}>
            Matched Keywords
          </span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#C3C3C3" }}>{matched.length}</span>
        </div>
        {matched.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {matched.map((kw) => <Pill key={kw} word={kw} variant="matched" />)}
          </div>
        ) : (
          <p style={{ fontSize: "12px", color: "#C3C3C3" }}>No matching keywords found.</p>
        )}
      </div>

      {/* Missing */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "8px",
          }}
        >
          <div style={{ width: "7px", height: "7px", borderRadius: "9999px", backgroundColor: "#F70407" }} />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#727272", letterSpacing: "-0.02em" }}>
            Missing Keywords
          </span>
          <span style={{ marginLeft: "auto", fontSize: "11px", color: "#C3C3C3" }}>{missing.length}</span>
        </div>
        {missing.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {missing.map((kw) => <Pill key={kw} word={kw} variant="missing" />)}
          </div>
        ) : (
          <p style={{ fontSize: "12px", color: "#01B747", fontWeight: 500 }}>No missing keywords — great match!</p>
        )}
      </div>
    </div>
  );
}
