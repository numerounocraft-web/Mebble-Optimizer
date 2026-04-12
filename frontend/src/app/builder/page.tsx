"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Download,
  SlidersHorizontal,
  Send,
  Plus,
  ChevronDown,
  GripVertical,
} from "lucide-react";
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

// ── Types ─────────────────────────────────────────────────────────────────────
type SectionId = "personalInfo" | "summary" | "experience" | "education" | "skills";

const DEFAULT_ORDER: SectionId[] = [
  "personalInfo",
  "summary",
  "experience",
  "education",
  "skills",
];

interface DragState {
  id: SectionId;
  fromIndex: number;
  hoverIndex: number;
  startPointerY: number;
  currentPointerY: number;
  cardTop: number;   // card's top (px) when drag started
  cardLeft: number;
  cardWidth: number;
  cardHeight: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── Drop placeholder ──────────────────────────────────────────────────────────
function DropPlaceholder({ height }: { height: number }) {
  return (
    <div
      style={{
        height: `${height}px`,
        borderRadius: "16px",
        border: "2px dashed #D4D4D4",
        backgroundColor: "#F4F4F6",
        flexShrink: 0,
        transition: "all 0.15s ease",
      }}
    />
  );
}

// ── Section card ──────────────────────────────────────────────────────────────
function SectionCard({
  title,
  actionLabel,
  onAction,
  children,
  isOpen,
  onToggle,
  onGripPointerDown,
  ghost,
  cardRef,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onGripPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  ghost?: boolean;   // true = invisible size-keeper while floating clone exists
  cardRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={cardRef}
      style={{
        backgroundColor: "#F9F9FB",
        borderRadius: "16px",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        opacity: ghost ? 0 : 1,
        transition: "opacity 0.1s ease",
        userSelect: "none",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px 16px",
          cursor: "pointer",
        }}
        onClick={onToggle}
      >
        {/* Grip — stops click from toggling */}
        <div
          onPointerDown={onGripPointerDown}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex",
            alignItems: "center",
            color: "#C4C4C4",
            cursor: "grab",
            flexShrink: 0,
            touchAction: "none",
          }}
        >
          <GripVertical size={15} strokeWidth={2} />
        </div>

        {/* Title */}
        <span
          style={{
            flex: 1,
            fontSize: "13px",
            fontWeight: 600,
            lineHeight: "90%",
            letterSpacing: "-0.02em",
            color: "#727272",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          }}
        >
          {title}
        </span>

        {/* Add button — fades in when open */}
        {actionLabel && onAction && (
          <button
            onClick={(e) => { e.stopPropagation(); onAction(); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              background: "none",
              border: "none",
              cursor: isOpen ? "pointer" : "default",
              fontSize: "11px",
              fontWeight: 600,
              color: "#028FF4",
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              letterSpacing: "-0.02em",
              padding: 0,
              flexShrink: 0,
              opacity: isOpen ? 1 : 0,
              pointerEvents: isOpen ? "auto" : "none",
              transition: "opacity 0.2s ease",
            }}
          >
            <Plus size={10} strokeWidth={2.5} />
            {actionLabel}
          </button>
        )}

        {/* Chevron */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            color: "#B0B0B0",
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        >
          <ChevronDown size={15} strokeWidth={2} />
        </div>
      </div>

      {/* Animated expand/collapse via grid-template-rows */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: isOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.28s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "0 16px 16px" }}>
              <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid #F0F0F0",
                backgroundColor: "#FFFFFF",
              }}
            >
              {children}
            </div>
          </div>
        </div>
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

  const [openSection, setOpenSection] = useState<SectionId | null>("personalInfo");
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(DEFAULT_ORDER);
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Stores a ref to each rendered card DOM node
  const cardRefs = useRef<Map<SectionId, HTMLDivElement>>(new Map());

  function update<K extends keyof Resume>(key: K, value: Resume[K]) {
    setResume((r) => ({ ...r, [key]: value }));
  }

  function toggleSection(id: SectionId) {
    setOpenSection((prev) => (prev === id ? null : id));
  }

  // ── Drag: compute which index the pointer is hovering ───────────────────────
  const computeHoverIndex = useCallback(
    (pointerY: number, draggingId: SectionId): number => {
      const orderWithout = sectionOrder.filter((id) => id !== draggingId);
      // Find the first card whose midpoint (+ 12 px offset) is below the pointer
      for (let i = 0; i < orderWithout.length; i++) {
        const el = cardRefs.current.get(orderWithout[i]);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2 + 12; // 12 px Y-axis offset
        if (pointerY < mid) return i;
      }
      return orderWithout.length;
    },
    [sectionOrder]
  );

  // ── Drag: pointer down on grip ─────────────────────────────────────────────
  function handleGripPointerDown(id: SectionId, e: React.PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const el = cardRefs.current.get(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const fromIndex = sectionOrder.indexOf(id);

    setDragState({
      id,
      fromIndex,
      hoverIndex: fromIndex,
      startPointerY: e.clientY,
      currentPointerY: e.clientY,
      cardTop: rect.top,
      cardLeft: rect.left,
      cardWidth: rect.width,
      cardHeight: rect.height,
    });
  }

  // ── Drag: pointer move ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!dragState) return;

    function onMove(e: PointerEvent) {
      setDragState((prev) => {
        if (!prev) return null;
        const hoverIndex = computeHoverIndex(e.clientY, prev.id);
        return { ...prev, currentPointerY: e.clientY, hoverIndex };
      });
    }

    function onUp() {
      setDragState((prev) => {
        if (!prev) return null;
        // Commit reorder
        setSectionOrder((order) => {
          const next = order.filter((id) => id !== prev.id);
          next.splice(prev.hoverIndex, 0, prev.id);
          return next;
        });
        return null;
      });
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragState, computeHoverIndex]);

  // ── Build display list (order + placeholder slot) ──────────────────────────
  type DisplayItem = SectionId | "__placeholder__";
  const displayList: DisplayItem[] = dragState
    ? (() => {
        const without = sectionOrder.filter((id) => id !== dragState.id);
        without.splice(dragState.hoverIndex, 0, "__placeholder__" as SectionId);
        return without as DisplayItem[];
      })()
    : sectionOrder;

  // ── Floating clone position ────────────────────────────────────────────────
  const floatingTop = dragState
    ? dragState.cardTop + (dragState.currentPointerY - dragState.startPointerY)
    : 0;

  // ── Export ─────────────────────────────────────────────────────────────────
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

  // ── Render a single section card ───────────────────────────────────────────
  function renderCard(id: SectionId, ghost = false) {
    const isOpen = !ghost && openSection === id;
    const toggle = () => toggleSection(id);
    const onGrip = (e: React.PointerEvent<HTMLDivElement>) => handleGripPointerDown(id, e);
    const ref = (el: HTMLDivElement | null) => {
      if (el) cardRefs.current.set(id, el);
      else cardRefs.current.delete(id);
    };

    const sharedProps = { isOpen, onToggle: toggle, onGripPointerDown: onGrip, ghost, cardRef: ref };

    switch (id) {
      case "personalInfo":
        return (
          <SectionCard key={ghost ? `${id}-ghost` : id} title="Personal Info" {...sharedProps}>
            <PersonalInfoSection
              data={resume.personalInfo}
              onChange={(v) => update("personalInfo", v)}
            />
          </SectionCard>
        );
      case "summary":
        return (
          <SectionCard key={ghost ? `${id}-ghost` : id} title="Summary" {...sharedProps}>
            <SummarySection value={resume.summary ?? ""} onChange={(v) => update("summary", v)} />
          </SectionCard>
        );
      case "experience":
        return (
          <SectionCard
            key={ghost ? `${id}-ghost` : id}
            title="Experience"
            actionLabel="Add Experience"
            onAction={() => update("experience", [...resume.experience, newExperience()])}
            {...sharedProps}
          >
            <ExperienceSection
              entries={resume.experience}
              onChange={(v) => update("experience", v)}
              hideAddButton
            />
          </SectionCard>
        );
      case "education":
        return (
          <SectionCard
            key={ghost ? `${id}-ghost` : id}
            title="Education"
            actionLabel="Add Education"
            onAction={() => update("education", [...resume.education, newEducation()])}
            {...sharedProps}
          >
            <EducationSection
              entries={resume.education}
              onChange={(v) => update("education", v)}
              hideAddButton
            />
          </SectionCard>
        );
      case "skills":
        return (
          <SectionCard
            key={ghost ? `${id}-ghost` : id}
            title="Skills"
            actionLabel="Add Skill Group"
            onAction={() => update("skills", [...resume.skills, newSkillGroup()])}
            {...sharedProps}
          >
            <SkillsSection
              groups={resume.skills}
              onChange={(v) => update("skills", v)}
              hideAddButton
            />
          </SectionCard>
        );
    }
  }

  // ── JSX ───────────────────────────────────────────────────────────────────
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
        <div style={{ alignSelf: "flex-start" }}>
          <MebbleLogo />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column", gap: "16px" }}>
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
            Your uploaded resume is currently in display. To get a well optimized Resume for your
            application, kindly paste or send the job requirements.
          </p>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SlidersHorizontal size={14} color="#727272" />
              <button
                onClick={() => {}}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
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
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
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
              <span style={{ fontSize: "14px", lineHeight: "160%", letterSpacing: "-0.02em", color: "#727272", fontWeight: 600 }}>
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
              <span style={{ width: "8px", height: "8px", borderRadius: "9999px", backgroundColor: "#FF7512", display: "inline-block" }} />
            </div>
          </div>

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
            <span style={{ fontSize: "14px", lineHeight: "120%", color: "#028FF4", fontWeight: 600, letterSpacing: "-0.02em" }}>
              {exporting ? "Exporting…" : "Download"}
            </span>
            <Download size={14} color="#028FF4" strokeWidth={2} />
          </button>
        </div>

        {/* Content row */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden", gap: 0 }}>
          {/* Resume preview */}
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

          {/* Right panel */}
          <div
            style={{
              width: "340px",
              flexShrink: 0,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              paddingLeft: "32px",
              // Prevent text selection during drag
              userSelect: dragState ? "none" : "auto",
            }}
          >
            {displayList.map((item, idx) =>
              item === "__placeholder__" ? (
                <DropPlaceholder key="__placeholder__" height={dragState!.cardHeight} />
              ) : (
                renderCard(item as SectionId, dragState?.id === item)
              )
            )}

            {/* Floating clone that follows the cursor */}
            {dragState && (
              <div
                style={{
                  position: "fixed",
                  top: floatingTop,
                  left: dragState.cardLeft,
                  width: dragState.cardWidth,
                  zIndex: 1000,
                  pointerEvents: "none",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  borderRadius: "16px",
                  opacity: 0.97,
                }}
              >
                {renderCard(dragState.id)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
