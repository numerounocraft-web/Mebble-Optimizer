"use client";

export default function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        padding: "32px",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        style={{ animation: "spin 0.8s linear infinite" }}
      >
        <circle cx="12" cy="12" r="10" stroke="#F1F1F1" strokeWidth="3" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="#FF7512"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          fontSize: "13px",
          color: "#767678",
          fontWeight: 500,
          letterSpacing: "-0.02em",
        }}
      >
        {label}
      </span>
    </div>
  );
}
