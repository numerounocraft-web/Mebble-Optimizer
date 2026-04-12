"use client";

import { Plus, X } from "lucide-react";
import type { PersonalInfo, ResumeLink } from "@/lib/schemas/resume";

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
  const links = data.links ?? [];

  function set(field: keyof PersonalInfo, value: PersonalInfo[typeof field]) {
    onChange({ ...data, [field]: value });
  }

  function updateLink(id: string, patch: Partial<ResumeLink>) {
    set("links", links.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeLink(id: string) {
    set("links", links.filter((l) => l.id !== id));
  }

  function addLink() {
    set("links", [...links, { id: crypto.randomUUID(), label: "", url: "" }]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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

      {/* ── Links group ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {/* Group header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={labelStyle}>Links</span>
          <button
            onClick={addLink}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              fontWeight: 600,
              color: "#028FF4",
              fontFamily: FONT,
              letterSpacing: "-0.02em",
              padding: 0,
            }}
          >
            <Plus size={10} strokeWidth={2.5} />
            Add Link
          </button>
        </div>

        {/* Link rows */}
        {links.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              padding: "10px",
              borderRadius: "10px",
              backgroundColor: "#F4F4F6",
            }}
          >
            {links.map((link) => (
              <div key={link.id} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                {/* Display name */}
                <input
                  type="text"
                  value={link.label}
                  placeholder="Label"
                  onChange={(e) => updateLink(link.id, { label: e.target.value })}
                  style={{ ...inputStyle, width: "36%" }}
                  onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
                  onBlur={(e) => (e.target.style.borderColor = "#F0F0F0")}
                />
                {/* URL */}
                <input
                  type="url"
                  value={link.url}
                  placeholder="https://…"
                  onChange={(e) => updateLink(link.id, { url: e.target.value })}
                  style={{ ...inputStyle, flex: 1 }}
                  onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
                  onBlur={(e) => (e.target.style.borderColor = "#F0F0F0")}
                />
                {/* Remove */}
                <button
                  onClick={() => removeLink(link.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    color: "#C4C4C4",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#F87171")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#C4C4C4")}
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
