"use client";

import { Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { SkillGroup } from "@/lib/schemas/resume";

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

interface Props {
  groups: SkillGroup[];
  onChange: (groups: SkillGroup[]) => void;
  hideAddButton?: boolean;
}

export default function SkillsSection({ groups, onChange, hideAddButton }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function removeGroup(id: string) {
    onChange(groups.filter((g) => g.id !== id));
  }

  function updateGroup(id: string, patch: Partial<SkillGroup>) {
    onChange(groups.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function addSkill(group: SkillGroup) {
    const draft = (drafts[group.id] ?? "").trim();
    if (!draft) return;
    updateGroup(group.id, { items: [...group.items, draft] });
    setDrafts((d) => ({ ...d, [group.id]: "" }));
  }

  function removeSkill(group: SkillGroup, skill: string) {
    updateGroup(group.id, { items: group.items.filter((s) => s !== skill) });
  }

  if (groups.length === 0) {
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
        No skill groups yet. Use &ldquo;Add Skill Group&rdquo; above.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {groups.map((group) => (
        <div
          key={group.id}
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
          {/* Category + remove */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input
              placeholder="Category (e.g. Languages)"
              value={group.category}
              onChange={(e) => updateGroup(group.id, { category: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
              onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
              onBlur={(e) => (e.target.style.borderColor = "#F0F0F0")}
            />
            <button
              onClick={() => removeGroup(group.id)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "2px",
                display: "flex",
                flexShrink: 0,
              }}
            >
              <Trash2 size={13} color="#D0D0D0" />
            </button>
          </div>

          {/* Pills */}
          {group.items.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {group.items.map((skill) => (
                <span
                  key={skill}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "3px 9px",
                    borderRadius: "9999px",
                    backgroundColor: "#fff",
                    border: "1px solid #F0F0F0",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#1F1F1F",
                    letterSpacing: "-0.02em",
                    fontFamily: FONT,
                  }}
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(group, skill)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    <X size={9} color="#C3C3C3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add skill input */}
          <div style={{ display: "flex", gap: "6px" }}>
            <input
              placeholder="Type skill, press Enter"
              value={drafts[group.id] ?? ""}
              onChange={(e) =>
                setDrafts((d) => ({ ...d, [group.id]: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill(group);
                }
              }}
              style={{
                ...inputStyle,
                flex: 1,
                fontSize: "12px",
                padding: "6px 8px",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#FF7512")}
              onBlur={(e) => (e.target.style.borderColor = "#F0F0F0")}
            />
            <button
              onClick={() => addSkill(group)}
              style={{
                background: "#E4F3FE",
                border: "none",
                borderRadius: "8px",
                padding: "6px 10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                color: "#028FF4",
                flexShrink: 0,
              }}
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      ))}

      {!hideAddButton && (
        <button
          onClick={() => {
            const g: SkillGroup = {
              id: crypto.randomUUID(),
              category: "",
              items: [],
            };
            onChange([...groups, g]);
            setDrafts((d) => ({ ...d, [g.id]: "" }));
          }}
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
          Add Skill Group
        </button>
      )}
    </div>
  );
}
