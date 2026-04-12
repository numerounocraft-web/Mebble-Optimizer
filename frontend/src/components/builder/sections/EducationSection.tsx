"use client";

import { Plus, Trash2 } from "lucide-react";
import type { EducationEntry } from "@/lib/schemas/resume";

const FONT = "var(--font-geist-sans), system-ui, sans-serif";

interface Props {
  entries: EducationEntry[];
  onChange: (entries: EducationEntry[]) => void;
  hideAddButton?: boolean;
  darkMode?: boolean;
}

export default function EducationSection({ entries, onChange, hideAddButton, darkMode }: Props) {
  const dm = darkMode ?? false;
  const borderColor = dm ? "#2C2C2C" : "#F0F0F0";
  const labelColor  = dm ? "#888888" : "#727272";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "8px", borderRadius: "8px",
    border: `1px solid ${borderColor}`, backgroundColor: "transparent",
    fontSize: "13px", fontWeight: 500, color: dm ? "#EFEFEF" : "#1F1F1F",
    fontFamily: FONT, letterSpacing: "-0.02em", lineHeight: "90%",
    outline: "none", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: "13px", lineHeight: "90%", letterSpacing: "-0.02em",
    color: labelColor, fontWeight: 500, fontFamily: FONT,
    display: "block", marginBottom: "6px",
  };

  function Field({ label, value, placeholder, onChange: onCh }: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
    return (
      <div>
        <span style={labelStyle}>{label}</span>
        <input value={value} placeholder={placeholder} onChange={(e) => onCh(e.target.value)}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
          onBlur={(e) => (e.target.style.borderColor = borderColor)}
        />
      </div>
    );
  }

  function removeEntry(id: string) { onChange(entries.filter((e) => e.id !== id)); }
  function updateEntry(id: string, patch: Partial<EducationEntry>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  if (entries.length === 0) {
    return <p style={{ fontSize: "12px", color: dm ? "#555558" : "#C3C3C3", fontFamily: FONT, letterSpacing: "-0.02em", margin: 0 }}>No education entries yet. Use &ldquo;Add Education&rdquo; above.</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {entries.map((entry, idx) => (
        <div key={entry.id} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: dm ? "#666668" : "#ABABAB", letterSpacing: "-0.02em", fontFamily: FONT }}>
              Education {idx + 1}
            </span>
            <button onClick={() => removeEntry(entry.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex" }}>
              <Trash2 size={13} color={dm ? "#555558" : "#D0D0D0"} />
            </button>
          </div>
          <Field label="Institution" placeholder="MIT" value={entry.institution} onChange={(v) => updateEntry(entry.id, { institution: v })} />
          <Field label="Degree" placeholder="Bachelor of Science" value={entry.degree} onChange={(v) => updateEntry(entry.id, { degree: v })} />
          <Field label="Field of Study" placeholder="Computer Science" value={entry.field} onChange={(v) => updateEntry(entry.id, { field: v })} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <Field label="Start" placeholder="2018" value={entry.startDate} onChange={(v) => updateEntry(entry.id, { startDate: v })} />
            <Field label="End" placeholder="2022" value={entry.endDate ?? ""} onChange={(v) => updateEntry(entry.id, { endDate: v })} />
          </div>
          <Field label="GPA (optional)" placeholder="3.9 / 4.0" value={entry.gpa ?? ""} onChange={(v) => updateEntry(entry.id, { gpa: v })} />
        </div>
      ))}
      {!hideAddButton && (
        <button onClick={() => onChange([...entries, { id: crypto.randomUUID(), institution: "", degree: "", field: "", startDate: "", endDate: "", gpa: "" }])}
          style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "9999px", border: `1px solid ${borderColor}`, backgroundColor: dm ? "#1A1A1E" : "#fff", cursor: "pointer", fontSize: "11px", fontWeight: 600, color: dm ? "#EFEFEF" : "#020202", letterSpacing: "-0.02em", fontFamily: FONT, alignSelf: "flex-start" }}>
          <Plus size={12} strokeWidth={2.5} /> Add Education
        </button>
      )}
    </div>
  );
}
