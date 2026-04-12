"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  SlidersHorizontal,
  Send,
  Plus,
  ChevronDown,
  GripVertical,
  Settings,
  Moon,
  Sun,
  Share2,
  Check,
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
function DropPlaceholder({ height, darkMode }: { height: number; darkMode?: boolean }) {
  return (
    <div
      style={{
        height: `${height}px`,
        borderRadius: "16px",
        border: `2px dashed ${darkMode ? "#383838" : "#D4D4D4"}`,
        backgroundColor: darkMode ? "#1A1A1A" : "#F4F4F6",
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
  darkMode,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  onGripPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  ghost?: boolean;
  cardRef?: (el: HTMLDivElement | null) => void;
  darkMode?: boolean;
}) {
  const dm = darkMode ?? false;
  return (
    <div
      ref={cardRef}
      style={{
        backgroundColor: dm ? "#161619" : "#F9F9FB",
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
        {/* Grip */}
        <div
          onPointerDown={onGripPointerDown}
          onClick={(e) => e.stopPropagation()}
          style={{
            display: "flex",
            alignItems: "center",
            color: dm ? "#444444" : "#C4C4C4",
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
            color: dm ? "#9A9A9A" : "#727272",
            fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
          }}
        >
          {title}
        </span>

        {/* Add button */}
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
            color: dm ? "#555555" : "#B0B0B0",
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s ease",
          }}
        >
          <ChevronDown size={15} strokeWidth={2} />
        </div>
      </div>

      {/* Animated expand/collapse */}
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
                border: `1px solid ${dm ? "#2C2C2C" : "#F0F0F0"}`,
                backgroundColor: dm ? "#161619" : "#FFFFFF",
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

  // Navbar state
  const [darkMode,          setDarkMode]          = useState(false);
  const [settingsOpen,      setSettingsOpen]      = useState(false);
  const [settingsClosing,   setSettingsClosing]   = useState(false);
  const [selectedTemplate,  setSelectedTemplate]  = useState(0);
  const [selectedColor,     setSelectedColor]     = useState("#028FF4");
  const settingsRef = useRef<HTMLDivElement>(null);

  function closeSettings() {
    setSettingsClosing(true);
    setTimeout(() => {
      setSettingsOpen(false);
      setSettingsClosing(false);
    }, 180);
  }

  // Close settings dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        closeSettings();
      }
    }
    if (settingsOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [settingsOpen]);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const t = {
    bg:               darkMode ? "#121214" : "#FFFFFF",
    surface:          darkMode ? "#1E1E1E" : "#F9F9FB",
    surfaceRaised:    darkMode ? "#161619" : "#FFFFFF",
    navBg:            darkMode ? "#121214" : "#FFFFFF",
    border:           darkMode ? "#2C2C2C" : "#F1F1F1",
    borderMid:        darkMode ? "#2C2C2C" : "#F0F0F0",
    textPrimary:      darkMode ? "#EFEFEF" : "#1F1F1F",
    textSecondary:    darkMode ? "#888888" : "#767678",
    textMuted:        darkMode ? "#606060" : "#727272",
    resumeBg:         darkMode ? "#161619" : "#F9F9FB",
    resumeBorder:     darkMode ? "#2C2C2C" : "#F0F0F0",
    dropdownBg:       darkMode ? "#1C1C1C" : "#FFFFFF",
    dropdownShadow:   darkMode ? "0 8px 32px rgba(0,0,0,0.55)" : "0 8px 32px rgba(0,0,0,0.10)",
    iconColor:        darkMode ? "#888888" : "#727272",
    settingsActiveBg: darkMode ? "#252525" : "#F1F1F1",
  };

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

    const sharedProps = { isOpen, onToggle: toggle, onGripPointerDown: onGrip, ghost, cardRef: ref, darkMode };

    switch (id) {
      case "personalInfo":
        return (
          <SectionCard key={ghost ? `${id}-ghost` : id} title="Personal Info" {...sharedProps}>
            <PersonalInfoSection
              data={resume.personalInfo}
              onChange={(v) => update("personalInfo", v)}
              darkMode={darkMode}
            />
          </SectionCard>
        );
      case "summary":
        return (
          <SectionCard key={ghost ? `${id}-ghost` : id} title="Summary" {...sharedProps}>
            <SummarySection value={resume.summary ?? ""} onChange={(v) => update("summary", v)} darkMode={darkMode} />
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
              darkMode={darkMode}
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
              darkMode={darkMode}
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
              darkMode={darkMode}
            />
          </SectionCard>
        );
    }
  }

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <>
    <style>{`
      @keyframes dropdownScale {
        0%   { opacity: 0; transform: scale(0.88); }
        100% { opacity: 1; transform: scale(1); }
      }
      @keyframes dropdownScaleOut {
        0%   { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.88); }
      }
      [data-dark="true"] input,
      [data-dark="true"] textarea {
        color: #EFEFEF !important;
        caret-color: #EFEFEF;
      }
      [data-dark="true"] input::placeholder,
      [data-dark="true"] textarea::placeholder {
        color: #4A4A4E !important;
        opacity: 1;
      }
    `}</style>
    <div
      data-dark={String(darkMode)}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        backgroundColor: t.bg,
      }}
    >
      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <div
        style={{
          height: "56px",
          flexShrink: 0,
          backgroundColor: t.navBg,
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          zIndex: 100,
        }}
      >
        {/* Left: logo */}
        <MebbleLogo height={18} />

        {/* Right: actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          {/* Dark mode toggle */}
          <button
            onClick={() => setDarkMode((d) => !d)}
            style={{
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          >
            {darkMode
              ? <Sun  size={16} color={t.iconColor} strokeWidth={1.8} />
              : <Moon size={16} color={t.iconColor} strokeWidth={1.8} />
            }
          </button>

          {/* Settings — opens template + colour dropdown */}
          <div ref={settingsRef} style={{ position: "relative" }}>
            <button
              onClick={() => settingsOpen ? closeSettings() : setSettingsOpen(true)}
              style={{
                width: "34px",
                height: "34px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border: "none",
                backgroundColor: settingsOpen ? t.settingsActiveBg : "transparent",
                cursor: "pointer",
              }}
            >
              <Settings size={16} color={t.iconColor} strokeWidth={1.8} />
            </button>

            {/* Dropdown */}
            {(settingsOpen || settingsClosing) && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "300px",
                  backgroundColor: t.dropdownBg,
                  borderRadius: "16px",
                  border: "none",
                  padding: "20px",
                  boxShadow: t.dropdownShadow,
                  zIndex: 200,
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                  transformOrigin: "top right",
                  animation: settingsClosing
                    ? "dropdownScaleOut 0.18s cubic-bezier(0.4, 0, 1, 1) forwards"
                    : "dropdownScale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards",
                }}
              >
                {/* Select Template */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: t.textPrimary, letterSpacing: "-0.02em" }}>
                    Select Template
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {[
                      /* Template 0 — Classic single column */
                      <svg key={0} width="78" height="90" viewBox="0 0 78 90" fill="none">
                        <rect x="1" y="1" width="76" height="88" rx="5" fill="#EFF6FF" stroke={selectedTemplate === 0 ? "#028FF4" : "#D0D8E4"} strokeWidth={selectedTemplate === 0 ? 2 : 1} />
                        <rect x="8" y="8"  width="62" height="10" rx="2" fill="#C2D9F7" />
                        <rect x="8" y="22" width="40" height="4"  rx="1" fill="#BFDBFE" />
                        <rect x="8" y="30" width="62" height="3"  rx="1" fill="#DBEAFE" />
                        <rect x="8" y="36" width="55" height="3"  rx="1" fill="#DBEAFE" />
                        <rect x="8" y="42" width="58" height="3"  rx="1" fill="#DBEAFE" />
                        <rect x="8" y="50" width="40" height="4"  rx="1" fill="#BFDBFE" />
                        <rect x="8" y="58" width="62" height="3"  rx="1" fill="#DBEAFE" />
                        <rect x="8" y="64" width="50" height="3"  rx="1" fill="#DBEAFE" />
                        <rect x="8" y="72" width="40" height="4"  rx="1" fill="#BFDBFE" />
                        <rect x="8" y="80" width="62" height="3"  rx="1" fill="#DBEAFE" />
                      </svg>,
                      /* Template 1 — Two column */
                      <svg key={1} width="78" height="90" viewBox="0 0 78 90" fill="none">
                        <rect x="1" y="1" width="76" height="88" rx="5" fill="#F9F9FB" stroke={selectedTemplate === 1 ? "#028FF4" : "#D0D8E4"} strokeWidth={selectedTemplate === 1 ? 2 : 1} />
                        <rect x="8"  y="8"  width="62" height="10" rx="2" fill="#E2E8F0" />
                        <rect x="8"  y="22" width="24" height="4"  rx="1" fill="#CBD5E1" />
                        <rect x="8"  y="30" width="24" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="8"  y="36" width="24" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="8"  y="42" width="24" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="8"  y="50" width="24" height="4"  rx="1" fill="#CBD5E1" />
                        <rect x="8"  y="58" width="24" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="8"  y="64" width="24" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="36" y="22" width="34" height="4"  rx="1" fill="#CBD5E1" />
                        <rect x="36" y="30" width="34" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="36" y="36" width="28" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="36" y="42" width="34" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="36" y="50" width="34" height="4"  rx="1" fill="#CBD5E1" />
                        <rect x="36" y="58" width="30" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="36" y="64" width="34" height="3"  rx="1" fill="#E2E8F0" />
                        <line x1="33" y1="20" x2="33" y2="82" stroke="#E2E8F0" strokeWidth="1" />
                      </svg>,
                      /* Template 2 — Modern sidebar */
                      <svg key={2} width="78" height="90" viewBox="0 0 78 90" fill="none">
                        <rect x="1" y="1" width="76" height="88" rx="5" fill="#F9F9FB" stroke={selectedTemplate === 2 ? "#028FF4" : "#D0D8E4"} strokeWidth={selectedTemplate === 2 ? 2 : 1} />
                        <rect x="1"  y="1"  width="22" height="88" rx="5" fill="#E8F4FD" />
                        <rect x="4"  y="8"  width="16" height="8"  rx="2" fill="#C2D9F7" />
                        <rect x="4"  y="22" width="16" height="3"  rx="1" fill="#BFDBFE" />
                        <rect x="4"  y="28" width="16" height="3"  rx="1" fill="#DBEAFE" />
                        <rect x="4"  y="34" width="16" height="3"  rx="1" fill="#DBEAFE" />
                        <rect x="4"  y="44" width="16" height="3"  rx="1" fill="#BFDBFE" />
                        <rect x="4"  y="50" width="16" height="3"  rx="1" fill="#DBEAFE" />
                        <rect x="4"  y="56" width="12" height="3"  rx="1" fill="#DBEAFE" />
                        <rect x="27" y="8"  width="44" height="4"  rx="1" fill="#CBD5E1" />
                        <rect x="27" y="16" width="44" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="27" y="22" width="36" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="27" y="30" width="44" height="4"  rx="1" fill="#CBD5E1" />
                        <rect x="27" y="38" width="44" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="27" y="44" width="38" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="27" y="50" width="44" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="27" y="58" width="44" height="4"  rx="1" fill="#CBD5E1" />
                        <rect x="27" y="66" width="40" height="3"  rx="1" fill="#E2E8F0" />
                        <rect x="27" y="72" width="44" height="3"  rx="1" fill="#E2E8F0" />
                      </svg>,
                    ].map((thumb, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedTemplate(i)}
                        style={{
                          position: "relative",
                          cursor: "pointer",
                          borderRadius: "8px",
                          flexShrink: 0,
                        }}
                      >
                        {thumb}
                        {/* Selection dot */}
                        <div
                          style={{
                            position: "absolute",
                            top: "6px",
                            right: "6px",
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            border: `2px solid ${selectedTemplate === i ? "#028FF4" : "#D0D8E4"}`,
                            backgroundColor: selectedTemplate === i ? "#028FF4" : t.dropdownBg,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div style={{ height: "1px", backgroundColor: t.border }} />

                {/* Colour */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: t.textPrimary, letterSpacing: "-0.02em" }}>
                    Colour
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {[
                      "#028FF4", "#D91E8C", "#E53E3E", "#F87171",
                      "#F59E0B", "#22C55E", "#8B5CF6", "#000000",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: color,
                          border: selectedColor === color ? "2.5px solid #FFFFFF" : "2.5px solid transparent",
                          outline: selectedColor === color ? `2.5px solid ${color}` : "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {selectedColor === color && (
                          <Check size={12} color="#FFFFFF" strokeWidth={3} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Export */}
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              height: "34px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "0 14px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#E4F3FE",
              cursor: exporting ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#028FF4", letterSpacing: "-0.02em" }}>
              {exporting ? "Exporting…" : "Export"}
            </span>
            <Share2 size={13} color="#028FF4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Content area ───────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          overflow: "hidden",
          backgroundColor: t.bg,
        }}
      >
        {/* Left panel — JD input */}
        <div
          style={{
            width: "280px",
            flexShrink: 0,
            borderRight: `1px solid ${t.border}`,
            display: "flex",
            flexDirection: "column",
            padding: "24px",
            gap: "16px",
            overflowY: "auto",
            backgroundColor: t.bg,
          }}
        >
          <p
            style={{
              fontSize: "13px",
              lineHeight: "160%",
              letterSpacing: "-0.02em",
              color: t.textMuted,
              fontWeight: 500,
              margin: 0,
            }}
          >
            Paste the job description to get keyword-matched suggestions for your resume.
          </p>
          <div
            style={{
              backgroundColor: t.surfaceRaised,
              border: `1px solid ${t.border}`,
              borderRadius: "8px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {jdFocused || jdText ? (
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                onBlur={() => setJdFocused(false)}
                placeholder="Paste job description here…"
                autoFocus
                rows={6}
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  fontSize: "13px",
                  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                  color: t.textPrimary,
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
                    fontSize: "13px",
                    lineHeight: "160%",
                    letterSpacing: "-0.02em",
                    color: t.textSecondary,
                    fontWeight: 500,
                    display: "block",
                  }}
                >
                  Paste in Job Description
                </span>
              </button>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SlidersHorizontal size={14} color={t.textMuted} />
              <button
                onClick={() => {}}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <Send size={14} color={t.textMuted} />
              </button>
            </div>
          </div>
        </div>

        {/* Center — Resume preview */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 24px",
            backgroundColor: t.bg,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "657px",
              backgroundColor: t.resumeBg,
              borderRadius: "16px",
              border: `1px solid ${t.resumeBorder}`,
              minHeight: "731px",
              flexShrink: 0,
            }}
          >
            <ResumePreview resume={resume} template={selectedTemplate} accentColor={selectedColor} />
          </div>
        </div>

        {/* Right panel — section cards */}
        <div
          style={{
            width: "400px",
            flexShrink: 0,
            borderLeft: `1px solid ${t.border}`,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            padding: "24px",
            backgroundColor: t.bg,
            userSelect: dragState ? "none" : "auto",
          }}
        >
          {displayList.map((item) =>
            item === "__placeholder__" ? (
              <DropPlaceholder key="__placeholder__" height={dragState!.cardHeight} darkMode={darkMode} />
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
    </>
  );
}
