"use client";

import { useState } from "react";
import { Download, SlidersHorizontal, Send, Plus } from "lucide-react";
import MebbleLogo from "@/components/ui/MebbleLogo";
import ResumePreview from "@/components/builder/ResumePreview";
import PersonalInfoSection from "@/components/builder/sections/PersonalInfoSection";
import SummarySection from "@/components/builder/sections/SummarySection";
import ExperienceSection from "@/components/builder/sections/ExperienceSection";
import EducationSection from "@/components/builder/sections/EducationSection";
import SkillsSection from "@/components/builder/sections/SkillsSection";
import {
  EMPTY_RESUME,
  type Resume,
  type ExperienceEntry,
  type EducationEntry,
  type SkillGroup,
} from "@/lib/schemas/resume";
import { exportResumePDF } from "@/lib/api";

function newExperience(): ExperienceEntry {
  return {
    id: crypto.randomUUID(),
    company: "",
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [""],
  };
}

function newEducation(): EducationEntry {
  return {
    id: crypto.randomUUID(),
    institution: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    gpa: "",
  };
}

function newSkillGroup(): SkillGroup {
  return { id: crypto.randomUUID(), category: "", items: [] };
}

// ── Section card wrapper ──────────────────────────────────────────────────────
function SectionCard({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "#F9F9FB",
        borderRadius: "16px",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        flexShrink: 0,
      }}
    >
      {/* Section header */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "14px",
              lineHeight: "90%",
              letterSpacing: "-0.02em",
              color: "#727272",
              fontWeight: 600,
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
            }}
          >
            {title}
          </span>
          {actionLabel && onAction && (
            <button
              onClick={onAction}
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
                fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                letterSpacing: "-0.02em",
                padding: 0,
              }}
            >
              <Plus size={10} strokeWidth={2.5} />
              {actionLabel}
            </button>
          )}
        </div>
        <div style={{ height: "1px", backgroundColor: "#EDEDED", alignSelf: "stretch" }} />
      </div>

      {/* Fields container */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "16px",
          borderRadius: "12px",
          outline: "1px solid #F0F0F0",
          backgroundColor: "#FFFFFF",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BuilderPage() {
  const [resume, setResume] = useState<Resume>(EMPTY_RESUME);
  const [jdText, setJdText] = useState("");
  const [jdFocused, setJdFocused] = useState(false);
  const [exporting, setExporting] = useState(false);

  function update<K extends keyof Resume>(key: K, value: Resume[K]) {
    setResume((r) => ({ ...r, [key]: value }));
  }

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await exportResumePDF(resume);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.personalInfo.name || "resume"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // endpoint not yet wired
    } finally {
      setExporting(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* ── Left sidebar ───────────────────────────────────────────────────── */}
      <div
        style={{
          width: "321px",
          flexShrink: 0,
          backgroundColor: "#F9F9FB",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "32px",
          gap: "32px",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div style={{ alignSelf: "flex-start" }}>
          <MebbleLogo />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* JD area at bottom */}
        <div
          style={{
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              lineHeight: "160%",
              letterSpacing: "-0.02em",
              color: "#727272",
              fontWeight: 500,
              margin: 0,
            }}
          >
            Your uploaded resume is currently in display. To get a well
            optimized Resume for your application, kindly paste or send the job
            requirements.
          </p>

          {/* JD input card */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #F1F1F1",
              borderRadius: "8px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxShadow: "0 6px 24px 0 rgba(236,236,236,0.2)",
            }}
          >
            {jdFocused || jdText ? (
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                onBlur={() => setJdFocused(false)}
                placeholder="Paste job description here…"
                autoFocus
                rows={4}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: "13px",
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  color: "#1F1F1F",
                  backgroundColor: "transparent",
                  lineHeight: "160%",
                  letterSpacing: "-0.02em",
                }}
              />
            ) : (
              <button
                onClick={() => setJdFocused(true)}
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "text",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    fontSize: "14px",
                    lineHeight: "160%",
                    letterSpacing: "-0.02em",
                    color: "#767678",
                    fontWeight: 500,
                    display: "block",
                  }}
                >
                  Paste in Job Description
                </span>
              </button>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <SlidersHorizontal size={14} color="#727272" />
              <button
                onClick={() => {}}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                }}
              >
                <Send size={14} color="#727272" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main area ──────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          padding: "32px",
          gap: "32px",
          overflow: "hidden",
        }}
      >
        {/* ── Inline header ────────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexShrink: 0,
          }}
        >
          {/* Left: title badge + dot */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                padding: "8px 10px",
                borderRadius: "8px",
                backgroundColor: "#F7F7F7",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  lineHeight: "160%",
                  letterSpacing: "-0.02em",
                  color: "#727272",
                  fontWeight: 600,
                }}
              >
                Resume builder
              </span>
            </div>
            <div
              style={{
                width: "39px",
                height: "39px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                backgroundColor: "#F7F7F7",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "9999px",
                  backgroundColor: "#FF7512",
                  display: "inline-block",
                }}
              />
            </div>
          </div>

          {/* Download button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              paddingTop: "12px",
              paddingBottom: "12px",
              paddingLeft: "16px",
              paddingRight: "14px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#E4F3FE",
              cursor: exporting ? "default" : "pointer",
              fontFamily: "inherit",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontSize: "14px",
                lineHeight: "120%",
                color: "#028FF4",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              {exporting ? "Exporting…" : "Download"}
            </span>
            <Download size={14} color="#028FF4" strokeWidth={2} />
          </button>
        </div>

        {/* ── Content row ──────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            gap: 0,
          }}
        >
          {/* Center: resume preview */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "32px",
            }}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "657px",
                backgroundColor: "#F9F9FB",
                borderRadius: "16px",
                border: "1px solid #F0F0F0",
                minHeight: "731px",
                flexShrink: 0,
              }}
            >
              <ResumePreview resume={resume} />
            </div>
          </div>

          {/* Right panel: stacked section cards */}
          <div
            style={{
              width: "331px",
              flexShrink: 0,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              paddingLeft: "32px",
            }}
          >
            {/* Personal Info */}
            <SectionCard title="Personal Info">
              <PersonalInfoSection
                data={resume.personalInfo}
                onChange={(v) => update("personalInfo", v)}
              />
            </SectionCard>

            {/* Summary */}
            <SectionCard title="Summary">
              <SummarySection
                value={resume.summary ?? ""}
                onChange={(v) => update("summary", v)}
              />
            </SectionCard>

            {/* Experience */}
            <SectionCard
              title="Experience"
              actionLabel="Add Experience"
              onAction={() =>
                update("experience", [...resume.experience, newExperience()])
              }
            >
              <ExperienceSection
                entries={resume.experience}
                onChange={(v) => update("experience", v)}
                hideAddButton
              />
            </SectionCard>

            {/* Education */}
            <SectionCard
              title="Education"
              actionLabel="Add Education"
              onAction={() =>
                update("education", [...resume.education, newEducation()])
              }
            >
              <EducationSection
                entries={resume.education}
                onChange={(v) => update("education", v)}
                hideAddButton
              />
            </SectionCard>

            {/* Skills */}
            <SectionCard
              title="Skills"
              actionLabel="Add Skill Group"
              onAction={() =>
                update("skills", [...resume.skills, newSkillGroup()])
              }
            >
              <SkillsSection
                groups={resume.skills}
                onChange={(v) => update("skills", v)}
                hideAddButton
              />
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
