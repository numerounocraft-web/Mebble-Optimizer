"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ExperienceEntry } from "@/lib/schemas/resume";

const FONT = "var(--font-geist-sans), system-ui, sans-serif";

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

function Field({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <span style={labelStyle}>{label}</span>
      <input
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

interface Props {
  entries: ExperienceEntry[];
  onChange: (entries: ExperienceEntry[]) => void;
  hideAddButton?: boolean;
}

export default function ExperienceSection({ entries, onChange, hideAddButton }: Props) {
  function removeEntry(id: string) {
    onChange(entries.filter((e) => e.id !== id));
  }

  function updateEntry(id: string, patch: Partial<ExperienceEntry>) {
    onChange(entries.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }

  function updateBullet(entry: ExperienceEntry, idx: number, value: string) {
    const bullets = [...entry.bullets];
    bullets[idx] = value;
    updateEntry(entry.id, { bullets });
  }

  function addBullet(entry: ExperienceEntry) {
    updateEntry(entry.id, { bullets: [...entry.bullets, ""] });
  }

  function removeBullet(entry: ExperienceEntry, idx: number) {
    const bullets = entry.bullets.filter((_, i) => i !== idx);
    updateEntry(entry.id, { bullets: bullets.length ? bullets : [""] });
  }

  if (entries.length === 0) {
    return (
      <p
        style={{
          fontSize: "12px",
          color: "#C3C3C3",
          fontFamily: FONT,
          letterSpacing: "-0.02em",
          margin: 0,
        }}
      >
        No experience entries yet. Use "Add Experience" above.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {entries.map((entry, entryIdx) => (
        <div
          key={entry.id}
          style={{
            border: "1px solid #F0F0F0",
            borderRadius: "10px",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            backgroundColor: "#FAFAFA",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#ABABAB",
                letterSpacing: "-0.02em",
                fontFamily: FONT,
              }}
            >
              Experience {entryIdx + 1}
            </span>
            <button
              onClick={() => removeEntry(entry.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
              }}
            >
              <Trash2 size={13} color="#D0D0D0" />
            </button>
          </div>

          <Field
            label="Job Title"
            placeholder="Software Engineer"
            value={entry.title}
            onChange={(v) => updateEntry(entry.id, { title: v })}
          />
          <Field
            label="Company"
            placeholder="Acme Corp"
            value={entry.company}
            onChange={(v) => updateEntry(entry.id, { company: v })}
          />
          <Field
            label="Location"
            placeholder="New York, NY"
            value={entry.location ?? ""}
            onChange={(v) => updateEntry(entry.id, { location: v })}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <Field
              label="Start"
              placeholder="Jan 2022"
              value={entry.startDate}
              onChange={(v) => updateEntry(entry.id, { startDate: v })}
            />
            <Field
              label="End"
              placeholder={entry.current ? "Present" : "Dec 2024"}
              value={entry.current ? "Present" : (entry.endDate ?? "")}
              onChange={(v) => updateEntry(entry.id, { endDate: v })}
            />
          </div>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={entry.current}
              onChange={(e) =>
                updateEntry(entry.id, { current: e.target.checked, endDate: "" })
              }
              style={{ accentColor: "#FF7512", width: "13px", height: "13px" }}
            />
            <span
              style={{
                fontSize: "11px",
                color: "#ABABAB",
                fontWeight: 500,
                letterSpacing: "-0.02em",
                fontFamily: FONT,
              }}
            >
              Currently here
            </span>
          </label>

          {/* Bullets */}
          <div>
            <span style={labelStyle}>Bullet Points</span>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
                padding: "8px",
              }}
            >
              {entry.bullets.map((bullet, bIdx) => (
                <div
                  key={bIdx}
                  style={{
                    display: "flex",
                    gap: "5px",
                    alignItems: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: "#C3C3C3",
                      fontSize: "13px",
                      marginTop: "6px",
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    ·
                  </span>
                  <textarea
                    value={bullet}
                    placeholder="Led development of…"
                    onChange={(e) => updateBullet(entry, bIdx, e.target.value)}
                    rows={2}
                    style={{
                      ...inputStyle,
                      flex: 1,
                      resize: "none",
                      fontSize: "12px",
                      lineHeight: "150%",
                      padding: "6px 8px",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
                    onBlur={(e) => (e.target.style.borderColor = "#F0F0F0")}
                  />
                  {entry.bullets.length > 1 && (
                    <button
                      onClick={() => removeBullet(entry, bIdx)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "6px 2px",
                        flexShrink: 0,
                        display: "flex",
                      }}
                    >
                      <Trash2 size={11} color="#D0D0D0" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addBullet(entry)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "11px",
                  color: "#028FF4",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  padding: "2px 0",
                  fontFamily: FONT,
                }}
              >
                <Plus size={11} /> Add bullet
              </button>
            </div>
          </div>
        </div>
      ))}

      {!hideAddButton && (
        <button
          onClick={() =>
            onChange([
              ...entries,
              {
                id: crypto.randomUUID(),
                company: "",
                title: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                bullets: [""],
              },
            ])
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "7px 12px",
            borderRadius: "9999px",
            border: "1px solid #F0F0F0",
            backgroundColor: "#fff",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: 600,
            color: "#020202",
            letterSpacing: "-0.02em",
            fontFamily: FONT,
            alignSelf: "flex-start",
          }}
        >
          <Plus size={12} strokeWidth={2.5} />
          Add Experience
        </button>
      )}
    </div>
  );
}
