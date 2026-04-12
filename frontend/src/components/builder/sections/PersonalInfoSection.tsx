"use client";

import type { PersonalInfo } from "@/lib/schemas/resume";

const FONT = "var(--font-geist-sans), system-ui, sans-serif";

const labelStyle: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "90%",
  letterSpacing: "-0.02em",
  color: "#727272",
  fontWeight: 500,
  fontFamily: FONT,
  display: "block",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
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
  lineHeight: "90%",
  outline: "none",
  boxSizing: "border-box",
};

interface Props {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

function Field({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span style={labelStyle}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
        onBlur={(e) => (e.target.style.borderColor = "#F0F0F0")}
      />
    </div>
  );
}

export default function PersonalInfoSection({ data, onChange }: Props) {
  function set(field: keyof PersonalInfo, value: string) {
    onChange({ ...data, [field]: value });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Field
        label="Full Name"
        placeholder="Jane Smith"
        value={data.name}
        onChange={(v) => set("name", v)}
      />
      <Field
        label="Email"
        placeholder="jane@example.com"
        type="email"
        value={data.email}
        onChange={(v) => set("email", v)}
      />
      <Field
        label="Phone"
        placeholder="+1 (555) 000-0000"
        value={data.phone}
        onChange={(v) => set("phone", v)}
      />
      <Field
        label="Location"
        placeholder="New York, NY"
        value={data.location}
        onChange={(v) => set("location", v)}
      />
      <Field
        label="LinkedIn"
        placeholder="linkedin.com/in/janedoe"
        value={data.linkedin ?? ""}
        onChange={(v) => set("linkedin", v)}
      />
      <Field
        label="Portfolio / Website"
        placeholder="janedoe.dev"
        value={data.website ?? ""}
        onChange={(v) => set("website", v)}
      />
    </div>
  );
}
