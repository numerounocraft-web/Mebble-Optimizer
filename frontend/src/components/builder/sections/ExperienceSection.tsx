"use client";

import { useState } from "react";
import { Plus, Trash2, ChevronDown, ArrowDownUp } from "lucide-react";
import type { ExperienceEntry } from "@/lib/schemas/resume";

const FONT = "var(--font-geist-sans), system-ui, sans-serif";
const BORDER = "#F0F0F0";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "8px", borderRadius: "8px",
  border: `1px solid ${BORDER}`, backgroundColor: "transparent",
  fontSize: "13px", fontWeight: 500, color: "#1F1F1F",
  fontFamily: FONT, letterSpacing: "-0.02em", lineHeight: "90%",
  outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "13px", lineHeight: "90%", letterSpacing: "-0.02em",
  color: "#727272", fontWeight: 500, fontFamily: FONT,
  display: "block", marginBottom: "6px",
};

function Field({ label, value, placeholder, onChange }: { label: string; value: string; placeholder: string; onChange: (v: string) => void }) {
  return (
    <div>
      <span style={labelStyle}>{label}</span>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
        onBlur={(e) => (e.target.style.borderColor = BORDER)}
      />
    </div>
  );
}

function parseJobDate(s: string): number {
  if (!s) return NaN;
  if (/^present$/i.test(s.trim())) return Date.now();
  const direct = new Date(s).getTime();
  if (!isNaN(direct)) return direct;
  const m1 = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m1) { const t = new Date(`${m1[1]} 1, ${m1[2]}`).getTime(); if (!isNaN(t)) return t; }
  const m2 = s.match(/^(\d{1,2})[\/\-](\d{4})$/);
  if (m2) return new Date(`${m2[2]}-${m2[1].padStart(2, "0")}-01`).getTime();
  const m3 = s.match(/^(\d{4})$/);
  if (m3) return new Date(`${m3[1]}-01-01`).getTime();
  return NaN;
}

function sortByDate(ents: ExperienceEntry[], dir: "asc" | "desc"): ExperienceEntry[] {
  return [...ents].sort((a, b) => {
    const da = parseJobDate(a.startDate), db = parseJobDate(b.startDate);
    if (isNaN(da) && isNaN(db)) return 0;
    if (isNaN(da)) return 1; if (isNaN(db)) return -1;
    return dir === "desc" ? db - da : da - db;
  });
}

interface Props {
  entries: ExperienceEntry[];
  onChange: (entries: ExperienceEntry[]) => void;
  hideAddButton?: boolean;
  darkMode?: boolean;
}

export default function ExperienceSection({ entries, onChange, hideAddButton }: Omit<Props, "darkMode">) {
  const entryCardBg = "#FAFAFA";
  const entryLabel  = "#8A8A8A";

  const [desiredOpenId, setDesiredOpenId] = useState<string | null>(entries[0]?.id ?? null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const openId = entries.find((e) => e.id === desiredOpenId) ? desiredOpenId : (entries[0]?.id ?? null);
  function setOpenId(val: string | null | ((prev: string | null) => string | null)) {
    setDesiredOpenId(typeof val === "function" ? val(openId) : val);
  }

  function applySort(dir: "asc" | "desc") { onChange(sortByDate(entries, dir)); }
  function removeEntry(id: string) { onChange(entries.filter((e) => e.id !== id)); }
  function updateEntry(id: string, patch: Partial<ExperienceEntry>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }
  function updateBullet(entry: ExperienceEntry, idx: number, value: string) {
    const bullets = [...entry.bullets]; bullets[idx] = value;
    updateEntry(entry.id, { bullets });
  }
  function addBullet(entry: ExperienceEntry) { updateEntry(entry.id, { bullets: [...entry.bullets, ""] }); }
  function removeBullet(entry: ExperienceEntry, idx: number) {
    const bullets = entry.bullets.filter((_, i) => i !== idx);
    updateEntry(entry.id, { bullets: bullets.length ? bullets : [""] });
  }

  if (entries.length === 0) {
    return <p style={{ fontSize: "12px", color: "#C3C3C3", fontFamily: FONT, letterSpacing: "-0.02em", margin: 0 }}>No experience entries yet. Use &ldquo;Add Experience&rdquo; above.</p>;
  }

  function renderEntry(entry: ExperienceEntry, idx: number) {
    const isOpen = openId === entry.id;
    const label = entry.title ? (entry.company ? `${entry.title} — ${entry.company}` : entry.title) : `Experience ${idx + 1}`;
    return (
      <div key={entry.id}
        style={{ backgroundColor: entryCardBg, borderRadius: "12px", display: "flex", flexDirection: "column", flexShrink: 0 }}
        onMouseEnter={() => setHoveredId(entry.id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", cursor: "pointer" }}
          onClick={() => setOpenId((prev) => (prev === entry.id ? null : entry.id))}
        >
          <span style={{ flex: 1, fontSize: "12px", fontWeight: 600, color: entryLabel, letterSpacing: "-0.02em", fontFamily: FONT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
          <button onClick={(e) => { e.stopPropagation(); removeEntry(entry.id); }}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex", flexShrink: 0, opacity: hoveredId === entry.id ? 1 : 0, transition: "opacity 0.15s ease", pointerEvents: hoveredId === entry.id ? "auto" : "none" }}>
            <Trash2 size={12} color="#D0D0D0" />
          </button>
          <div style={{ display: "flex", alignItems: "center", color: "#C4C4C4", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s ease" }}>
            <ChevronDown size={13} strokeWidth={2} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.28s ease" }}>
          <div style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "16px 12px 12px" }}>
              <Field label="Job Title" placeholder="Software Engineer" value={entry.title} onChange={(v) => updateEntry(entry.id, { title: v })} />
              <Field label="Company" placeholder="Acme Corp" value={entry.company} onChange={(v) => updateEntry(entry.id, { company: v })} />
              <Field label="Location" placeholder="New York, NY" value={entry.location ?? ""} onChange={(v) => updateEntry(entry.id, { location: v })} />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <Field label="Start" placeholder="Jan 2022" value={entry.startDate} onChange={(v) => updateEntry(entry.id, { startDate: v })} />
                  <Field label="End" placeholder={entry.current ? "Present" : "Dec 2024"} value={entry.current ? "Present" : (entry.endDate ?? "")} onChange={(v) => updateEntry(entry.id, { endDate: v })} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                  <div onClick={() => updateEntry(entry.id, { current: !entry.current, endDate: "" })}
                    style={{ width: "15px", height: "15px", borderRadius: "9999px", border: `2px solid ${entry.current ? "#028FF4" : "#D0D0D0"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "border-color 0.15s ease", boxSizing: "border-box" }}>
                    {entry.current && <div style={{ width: "7px", height: "7px", borderRadius: "9999px", backgroundColor: "#028FF4" }} />}
                  </div>
                  <span style={{ fontSize: "11px", color: "#ABABAB", fontWeight: 500, letterSpacing: "-0.02em", fontFamily: FONT }}>Currently here</span>
                </label>
              </div>
              <div>
                <span style={labelStyle}>Bullet Points</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {entry.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} style={{ display: "flex", gap: "5px", alignItems: "flex-start" }}>
                      <textarea value={bullet} placeholder="Led development of…"
                        onChange={(e) => updateBullet(entry, bIdx, e.target.value)} rows={2}
                        style={{ ...inputStyle, flex: 1, resize: "none", fontSize: "12px", lineHeight: "150%", padding: "6px 8px" }}
                        onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
                        onBlur={(e) => (e.target.style.borderColor = BORDER)}
                      />
                      {entry.bullets.length > 1 && (
                        <button onClick={() => removeBullet(entry, bIdx)} style={{ background: "none", border: "none", cursor: "pointer", padding: "6px 2px", flexShrink: 0, display: "flex" }}>
                          <Trash2 size={11} color="#D0D0D0" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => addBullet(entry)}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#028FF4", fontWeight: 500, letterSpacing: "-0.02em", padding: "2px 0", fontFamily: FONT }}>
                    <Plus size={11} /> Add bullet
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px", paddingBottom: "4px" }}>
        <ArrowDownUp size={11} color="#C4C4C4" />
        {(["desc", "asc"] as const).map((dir, i) => (
          <span key={dir} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {i > 0 && <span style={{ color: "#D0D0D0", fontSize: "11px" }}>·</span>}
            <button onClick={() => applySort(dir)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "11px", fontWeight: 600, color: "#A0A0A0", fontFamily: FONT, letterSpacing: "-0.02em", padding: 0 }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#028FF4")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#A0A0A0")}
            >{dir === "desc" ? "Newest first" : "Oldest first"}</button>
          </span>
        ))}
      </div>
      {entries.map((entry, idx) => renderEntry(entry, idx))}
      {!hideAddButton && (
        <button onClick={() => onChange([...entries, { id: crypto.randomUUID(), company: "", title: "", location: "", startDate: "", endDate: "", current: false, bullets: [""] }])}
          style={{ display: "flex", alignItems: "center", gap: "5px", padding: "7px 12px", borderRadius: "9999px", border: `1px solid ${BORDER}`, backgroundColor: "#fff", cursor: "pointer", fontSize: "11px", fontWeight: 600, color: "#020202", letterSpacing: "-0.02em", fontFamily: FONT, alignSelf: "flex-start", marginTop: "4px" }}>
          <Plus size={12} strokeWidth={2.5} /> Add Experience
        </button>
      )}
    </div>
  );
}
