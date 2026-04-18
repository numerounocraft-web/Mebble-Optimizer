"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Lock,
  Loader2,
  Sparkles,
  RotateCcw,
  Plus,
  ChevronDown,
  GripVertical,
  FileDown,
  Check,
  Eye,
  PenLine,
} from "lucide-react";
import { AnimatedAtom, type AnimatedAtomHandle } from "@/components/ui/AnimatedAtom";
import ArcGauge from "@/components/optimizer/ArcGauge";
import KeywordPills from "@/components/optimizer/KeywordPills";
import { analyzeBuilderResume, optimizeBuilderResume, optimizeSection, getSummaryVariants } from "@/lib/api";
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
import { features } from "@/lib/features";
import { useWindowSize } from "@/lib/hooks";
import { buildResumePDF } from "@/lib/buildResumePDF";
import { buildResumeDocx } from "@/lib/buildResumeDocx";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnalysisData {
  ats_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  domain: string;
  action_words_analysis: {
    found: string[];
    suggestions: { current: string; suggested: string }[];
  };
}

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
  ghost?: boolean;
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
        {/* Grip */}
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
            color: "#B0B0B0",
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
  const [activeLeftTab, setActiveLeftTab] = useState<"jd" | "optimization">("jd");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisData | null>(null);
  const [summaryVariants, setSummaryVariants] = useState<string[]>([]);
  const [variantIndex, setVariantIndex] = useState(0);
  const [optimizingKeywords, setOptimizingKeywords] = useState(false);
  const [appliedKeywords, setAppliedKeywords] = useState<string[]>([]);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview" | "optimize">("edit");
  const preOptimizeRef = useRef<{ resume: Resume; analysisResult: AnalysisData } | null>(null);
  const [summaryApplied, setSummaryApplied] = useState(false);
  const preSummaryRef = useRef<string | null>(null);

  const [openSection, setOpenSection] = useState<SectionId | null>("personalInfo");
  const [sectionOrder, setSectionOrder] = useState<SectionId[]>(DEFAULT_ORDER);
  const [dragState, setDragState] = useState<DragState | null>(null);

  // Navbar state
  const [settingsOpen,      setSettingsOpen]      = useState(false);
  const [settingsClosing,   setSettingsClosing]   = useState(false);
  const [exportOpen,        setExportOpen]        = useState(false);
  const [selectedTemplate,  setSelectedTemplate]  = useState(0);
  const [selectedColor,     setSelectedColor]     = useState("#028FF4");
  const settingsRef    = useRef<HTMLDivElement>(null);
  const exportRef      = useRef<HTMLDivElement>(null);
  const previewRef     = useRef<HTMLDivElement>(null);
  const settingsIconRef = useRef<AnimatedAtomHandle>(null);

  function closeSettings() {
    setSettingsClosing(true);
    setTimeout(() => {
      setSettingsOpen(false);
      setSettingsClosing(false);
    }, 180);
  }

  // Apply LinkedIn prefill if arriving from the import flow
  useEffect(() => {
    const raw = localStorage.getItem("mebble_linkedin_prefill");
    if (!raw) return;
    localStorage.removeItem("mebble_linkedin_prefill");
    try {
      const d = JSON.parse(raw);
      setResume((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          ...(d.personalInfo || {}),
          // Preserve existing links array shape; merge LinkedIn URL if present
          links: d.personalInfo?.links?.length
            ? d.personalInfo.links
            : prev.personalInfo.links,
        },
        summary:    d.summary    || prev.summary,
        experience: d.experience?.length ? d.experience.map((e: ExperienceEntry) => ({ ...newExperience(), ...e })) : prev.experience,
        education:  d.education?.length  ? d.education.map((e: EducationEntry)   => ({ ...newEducation(),  ...e })) : prev.education,
        skills:     d.skills?.length     ? d.skills                                                                  : prev.skills,
      }));
      // Open Personal Info so the user sees the imported data first
      setOpenSection("personalInfo");
    } catch {
      // malformed data — silently ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    if (exportOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [exportOpen]);

  // Debounced live score — silently re-analyzes 1.5 s after the resume stops changing
  useEffect(() => {
    if (!jdText.trim() || !analysisResult || analyzing) return;
    const text = resumeToText();
    setReanalyzing(true);
    const timer = setTimeout(async () => {
      try {
        const response = await analyzeBuilderResume(text, jdText);
        const data: AnalysisData = response.data;
        setAnalysisResult((prev) =>
          prev
            ? { ...prev, ats_score: data.ats_score, matched_keywords: data.matched_keywords, missing_keywords: data.missing_keywords }
            : prev
        );
        setAppliedKeywords([]);
      } catch {
        // silent — keep showing the last known score
      } finally {
        setReanalyzing(false);
      }
    }, 1500);
    return () => {
      clearTimeout(timer);
      setReanalyzing(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume, jdText]);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const t = {
    bg:               "#FFFFFF",
    surface:          "#F9F9FB",
    surfaceRaised:    "#FFFFFF",
    navBg:            "#FFFFFF",
    border:           "#F1F1F1",
    borderMid:        "#F0F0F0",
    textPrimary:      "#1F1F1F",
    textSecondary:    "#767678",
    textMuted:        "#727272",
    resumeBorder:     "#F0F0F0",
    dropdownBg:       "#FFFFFF",
    dropdownShadow:   "0 8px 32px rgba(0,0,0,0.10)",
    iconColor:        "#727272",
    settingsActiveBg: "#F1F1F1",
  };

  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1100;

  // Resume is "ready" when it has a name plus at least some content
  const resumeIsReady = !!(
    resume.personalInfo.name &&
    (resume.summary || resume.experience.length > 0)
  );

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

  // ── Export — PDF via jsPDF ────────────────────────────────────────────────
  function handleExportPDF() {
    setExporting(true);
    setExportOpen(false);
    try {
      const doc = buildResumePDF(resume, selectedColor);
      const filename = `${resume.personalInfo.name || "resume"}.pdf`;
      doc.save(filename);
    } finally {
      setExporting(false);
    }
  }

  // ── Export — Word via docx ────────────────────────────────────────────────
  async function handleExportDocx() {
    setExporting(true);
    setExportOpen(false);
    try {
      const blob = await buildResumeDocx(resume, selectedColor);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${resume.personalInfo.name || "resume"}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Word export failed", err);
    } finally {
      setExporting(false);
    }
  }

  // ── Convert resume state → plain text for the backend analyzer ───────────────
  function resumeToText(): string {
    const { personalInfo, summary, experience, education, skills } = resume;
    const lines: string[] = [];

    if (personalInfo.name) lines.push(personalInfo.name);
    const contact = [personalInfo.phone, personalInfo.email, personalInfo.location].filter(Boolean);
    if (contact.length) lines.push(contact.join(" | "));
    const links = (personalInfo.links ?? []).filter((l) => l.url).map((l) => l.label || l.url);
    if (links.length) lines.push(links.join(" | "));

    if (summary) {
      lines.push("\nPROFESSIONAL SUMMARY");
      lines.push(summary);
    }

    if (experience.length) {
      lines.push("\nPROFESSIONAL EXPERIENCE");
      for (const exp of experience) {
        const header = [exp.title, exp.company].filter(Boolean).join(" — ");
        if (header) lines.push(header);
        const dates = [exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ");
        if (dates) lines.push(dates);
        if (exp.location) lines.push(exp.location);
        for (const b of exp.bullets.filter(Boolean)) lines.push(`• ${b}`);
      }
    }

    if (education.length) {
      lines.push("\nEDUCATION");
      for (const edu of education) {
        if (edu.institution) lines.push(edu.institution);
        const degree = [edu.degree, edu.field].filter(Boolean).join(", ");
        if (degree) lines.push(degree);
        const dates = [edu.startDate, edu.endDate].filter(Boolean).join(" – ");
        if (dates) lines.push(dates);
      }
    }

    if (skills.length) {
      lines.push("\nSKILLS");
      for (const group of skills) {
        const line = [group.category, group.items.join(", ")].filter(Boolean).join(": ");
        if (line) lines.push(line);
      }
    }

    return lines.join("\n");
  }

  // ── Analyze (optimization panel) ──────────────────────────────────────────
  async function handleAnalyze() {
    if (!jdText.trim()) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    setSummaryVariants([]);
    setVariantIndex(0);
    setAppliedKeywords([]);
    setSummaryApplied(false);
    preOptimizeRef.current = null;
    preSummaryRef.current = null;
    setActiveLeftTab("optimization");

    try {
      const response = await analyzeBuilderResume(resumeToText(), jdText);
      const data: AnalysisData = response.data;
      setAnalysisResult(data);

      // Fetch up to 3 optimised summary variants
      if (resume.summary && data.missing_keywords?.length > 0) {
        try {
          const variantsRes = await getSummaryVariants(
            resume.summary,
            data.missing_keywords.slice(0, 10),
            data.domain ?? "general"
          );
          setSummaryVariants(variantsRes.variants ?? []);
          setVariantIndex(0);
        } catch {
          // Non-critical — skip silently
        }
      }
    } catch (err) {
      console.error("Analysis failed", err);
    } finally {
      setAnalyzing(false);
    }
  }

  // ── Apply / undo optimized summary variants ────────────────────────────────
  function handleApplySummary() {
    const variant = summaryVariants[variantIndex];
    if (!variant) return;
    // Save original only on first apply
    if (!summaryApplied) {
      preSummaryRef.current = resume.summary ?? "";
      setSummaryApplied(true);
    }
    update("summary", variant);
    // Advance to the next variant so clicking again shows a new one
    setVariantIndex((i) => Math.min(i + 1, summaryVariants.length));
  }

  function handleUndoSummary() {
    if (preSummaryRef.current !== null) {
      update("summary", preSummaryRef.current);
    }
    setSummaryApplied(false);
    setVariantIndex(0);
    preSummaryRef.current = null;
  }

  // ── Apply missing keywords into the resume ────────────────────────────────
  async function handleOptimizeKeywords() {
    if (!analysisResult?.missing_keywords?.length) return;
    setOptimizingKeywords(true);

    // Snapshot current state so undo can restore it
    preOptimizeRef.current = { resume, analysisResult };

    try {
      const resumeData = {
        summary: resume.summary ?? "",
        experience: resume.experience.map((exp) => ({
          id: exp.id,
          bullets: exp.bullets.filter(Boolean),
        })),
      };
      const response = await optimizeBuilderResume(
        resumeData,
        analysisResult.missing_keywords,
        analysisResult.domain ?? "general"
      );
      const data = response.data as {
        summary: string;
        experience: { id: string; bullets: string[] }[];
      };

      // Apply optimized summary
      if (data.summary) update("summary", data.summary);

      // Apply optimized experience bullets, preserving all other fields
      if (data.experience?.length) {
        const updated = resume.experience.map((exp) => {
          const opt = data.experience.find((o) => o.id === exp.id);
          return opt?.bullets?.length ? { ...exp, bullets: opt.bullets } : exp;
        });
        update("experience", updated);
      }

      // Track which keywords were added and move them from missing → matched,
      // then immediately recalculate the score from the new keyword counts.
      const added = analysisResult.missing_keywords;
      setAppliedKeywords(added);
      setAnalysisResult((prev) => {
        if (!prev) return prev;
        const newMatched = [...prev.matched_keywords, ...added];
        const total = prev.matched_keywords.length + prev.missing_keywords.length;
        const newScore = total > 0 ? Math.round((newMatched.length / total) * 100) : prev.ats_score;
        return {
          ...prev,
          ats_score: newScore,
          matched_keywords: newMatched,
          missing_keywords: [],
        };
      });
    } catch (err) {
      console.error("Keyword optimization failed", err);
      preOptimizeRef.current = null;
    } finally {
      setOptimizingKeywords(false);
    }
  }

  // ── Undo keyword optimization ──────────────────────────────────────────────
  function handleUndo() {
    if (!preOptimizeRef.current) return;
    setResume(preOptimizeRef.current.resume);
    setAnalysisResult(preOptimizeRef.current.analysisResult);
    setAppliedKeywords([]);
    preOptimizeRef.current = null;
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
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
    `}</style>
    <div
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

          {/* Settings — opens template + colour dropdown */}
          <div ref={settingsRef} style={{ position: "relative" }}>
            <button
              onClick={() => settingsOpen ? closeSettings() : setSettingsOpen(true)}
              onMouseEnter={() => settingsIconRef.current?.startAnimation()}
              onMouseLeave={() => settingsIconRef.current?.stopAnimation()}
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
              <AnimatedAtom
                ref={settingsIconRef}
                size={16}
                style={{ color: t.iconColor, pointerEvents: "none" }}
              />
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

          {/* Export dropdown */}
          <div ref={exportRef} style={{ position: "relative" }}>
            <button
              onClick={() => setExportOpen((o) => !o)}
              disabled={exporting}
              style={{
                height: "34px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "0 14px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: exportOpen ? "#CBE8FD" : "#E4F3FE",
                cursor: exporting ? "default" : "pointer",
                fontFamily: "inherit",
                transition: "background-color 0.15s",
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#028FF4", letterSpacing: "-0.02em" }}>
                {exporting ? "Exporting…" : "Export"}
              </span>
              <FileDown size={13} color="#028FF4" strokeWidth={2} />
            </button>

            {exportOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "180px",
                  backgroundColor: t.dropdownBg,
                  borderRadius: "14px",
                  padding: "8px",
                  boxShadow: t.dropdownShadow,
                  zIndex: 200,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                  animation: "dropdownScale 0.18s cubic-bezier(0.16,1,0.3,1) forwards",
                  transformOrigin: "top right",
                }}
              >
                {[
                  { label: "PDF Document", ext: "pdf", onClick: handleExportPDF },
                  { label: "Word Document", ext: "docx", onClick: handleExportDocx },
                ].map(({ label, ext, onClick }) => (
                  <button
                    key={ext}
                    onClick={onClick}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      width: "100%",
                      padding: "9px 12px",
                      borderRadius: "9px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#F4F4F6"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  >
                    <span style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      color: ext === "pdf" ? "#E53E3E" : "#2B6CB0",
                      backgroundColor: ext === "pdf" ? "#FFF5F5" : "#EBF8FF",
                      padding: "2px 5px",
                      borderRadius: "4px",
                      flexShrink: 0,
                    }}>
                      {ext.toUpperCase()}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: 500, color: t.textPrimary, letterSpacing: "-0.01em" }}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
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
        {/* Left panel — Optimization (V2+ only) */}
        {features.jdOptimization && <div
          style={{
            width: isMobile ? "100%" : "280px",
            flexShrink: 0,
            borderRight: isMobile ? "none" : `1px solid ${t.border}`,
            display: isMobile ? (mobileTab === "optimize" ? "flex" : "none") : isTablet ? "none" : "flex",
            flexDirection: "column",
            backgroundColor: t.bg,
            overflow: "hidden",
          }}
        >
          {/* Locked state — resume not filled yet */}
          {!resumeIsReady && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "32px 24px",
                gap: "14px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  backgroundColor: "#F4F4F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Lock size={17} color="#C4C4C4" strokeWidth={1.8} />
              </div>
              <p style={{ fontSize: "12px", color: "#C0C0C0", lineHeight: "160%", letterSpacing: "-0.02em", fontWeight: 500, margin: 0 }}>
                Fill in your resume details to unlock AI optimization
              </p>
            </div>
          )}

          {/* Active state — tabs */}
          {resumeIsReady && (
            <>
              {/* Tab bar */}
              <div style={{ display: "flex", borderBottom: `1px solid ${t.border}`, flexShrink: 0 }}>
                {(["jd", "optimization"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveLeftTab(tab)}
                    style={{
                      flex: 1,
                      padding: "13px 4px",
                      background: "none",
                      border: "none",
                      borderBottom: `2px solid ${activeLeftTab === tab ? "#028FF4" : "transparent"}`,
                      fontSize: "11px",
                      fontWeight: 600,
                      color: activeLeftTab === tab ? "#028FF4" : "#B8B8B8",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      letterSpacing: "-0.01em",
                      transition: "color 0.15s, border-color 0.15s",
                      marginBottom: "-1px",
                    }}
                  >
                    {tab === "jd" ? "Job Description" : "Optimization"}
                  </button>
                ))}
              </div>

              {/* Tab body */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

                {/* ── Job Description tab ── */}
                {activeLeftTab === "jd" && (
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
                    <p style={{ fontSize: "12px", color: "#B8B8B8", lineHeight: "160%", letterSpacing: "-0.02em", margin: 0 }}>
                      Paste a job description to see how well your resume matches and get keyword suggestions.
                    </p>
                    <textarea
                      value={jdText}
                      onChange={(e) => setJdText(e.target.value)}
                      placeholder="Paste job description here…"
                      style={{
                        flex: 1,
                        minHeight: "180px",
                        border: `1px solid ${t.border}`,
                        borderRadius: "10px",
                        padding: "10px 12px",
                        fontSize: "12px",
                        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
                        color: t.textPrimary,
                        backgroundColor: t.surface,
                        lineHeight: "160%",
                        letterSpacing: "-0.02em",
                        resize: "none",
                        outline: "none",
                        boxSizing: "border-box",
                        width: "100%",
                      }}
                    />
                    <button
                      onClick={handleAnalyze}
                      disabled={!jdText.trim() || analyzing}
                      style={{
                        width: "100%",
                        height: "36px",
                        borderRadius: "9999px",
                        border: "none",
                        backgroundColor: !jdText.trim() ? "#F1F1F1" : "#028FF4",
                        color: !jdText.trim() ? "#C4C4C4" : "#FFFFFF",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        cursor: !jdText.trim() || analyzing ? "default" : "pointer",
                        fontFamily: "inherit",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        flexShrink: 0,
                        transition: "background-color 0.15s",
                      }}
                    >
                      {analyzing ? (
                        <>
                          <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                          Analyzing…
                        </>
                      ) : "Analyze Resume"}
                    </button>
                  </div>
                )}

                {/* ── Optimization tab ── */}
                {activeLeftTab === "optimization" && (
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* Loading */}
                    {analyzing && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "48px 0" }}>
                        <Loader2 size={22} color="#028FF4" style={{ animation: "spin 1s linear infinite" }} />
                        <p style={{ fontSize: "12px", color: "#B8B8B8", margin: 0, letterSpacing: "-0.02em" }}>
                          Analyzing your resume…
                        </p>
                      </div>
                    )}

                    {/* No results yet */}
                    {!analyzing && !analysisResult && (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 0", textAlign: "center" }}>
                        <p style={{ fontSize: "12px", color: "#C4C4C4", lineHeight: "160%", margin: 0, letterSpacing: "-0.02em" }}>
                          Paste a job description and hit{" "}
                          <span style={{ fontWeight: 600, color: "#B0B0B0" }}>Analyze Resume</span>{" "}
                          to see your results here.
                        </p>
                      </div>
                    )}

                    {/* Results */}
                    {!analyzing && analysisResult && (
                      <>
                        {/* ATS Score */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", color: "#C4C4C4", textTransform: "uppercase" }}>
                              ATS Score
                            </span>
                            {reanalyzing && (
                              <Loader2 size={10} color="#C4C4C4" style={{ animation: "spin 1s linear infinite", flexShrink: 0 }} />
                            )}
                          </div>
                          <ArcGauge score={analysisResult.ats_score} />
                        </div>

                        <div style={{ height: "1px", backgroundColor: t.border }} />

                        {/* Keyword pills */}
                        <KeywordPills
                          matched={analysisResult.matched_keywords ?? []}
                          missing={analysisResult.missing_keywords ?? []}
                        />

                        {/* Add Keywords / Undo button */}
                        {appliedKeywords.length > 0 ? (
                          <button
                            onClick={handleUndo}
                            style={{
                              width: "100%",
                              height: "36px",
                              borderRadius: "9999px",
                              border: "1.5px solid #E0E0E0",
                              backgroundColor: "transparent",
                              color: "#767678",
                              fontSize: "12px",
                              fontWeight: 600,
                              letterSpacing: "-0.02em",
                              cursor: "pointer",
                              fontFamily: "inherit",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            <RotateCcw size={12} />
                            Undo
                          </button>
                        ) : (analysisResult.missing_keywords?.length ?? 0) > 0 ? (
                          <button
                            onClick={handleOptimizeKeywords}
                            disabled={optimizingKeywords}
                            style={{
                              width: "100%",
                              height: "36px",
                              borderRadius: "9999px",
                              border: "none",
                              backgroundColor: "#028FF4",
                              color: "#FFFFFF",
                              fontSize: "12px",
                              fontWeight: 600,
                              letterSpacing: "-0.02em",
                              cursor: optimizingKeywords ? "default" : "pointer",
                              fontFamily: "inherit",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "6px",
                            }}
                          >
                            {optimizingKeywords ? (
                              <>
                                <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} />
                                Adding keywords…
                              </>
                            ) : (
                              <>
                                <Sparkles size={12} />
                                Add Keywords to Resume
                              </>
                            )}
                          </button>
                        ) : null}

                        {/* Optimized Summary — variant cycling */}
                        {summaryVariants.length > 0 && variantIndex < summaryVariants.length && (
                          <>
                            <div style={{ height: "1px", backgroundColor: t.border }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {/* Header + variant counter */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", color: "#C4C4C4", textTransform: "uppercase" }}>
                                  Optimized Summary
                                </span>
                                <span style={{ fontSize: "10px", color: "#C4C4C4", fontWeight: 500, letterSpacing: "-0.01em" }}>
                                  {variantIndex + 1} / {summaryVariants.length}
                                </span>
                              </div>

                              {/* Variant text */}
                              <p style={{ fontSize: "12px", color: "#4A4A4A", lineHeight: "160%", letterSpacing: "-0.02em", margin: 0, backgroundColor: "#F4F4F6", borderRadius: "10px", padding: "10px 12px" }}>
                                {summaryVariants[variantIndex]}
                              </p>

                              {/* Action buttons */}
                              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                <button
                                  onClick={handleApplySummary}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    background: "none",
                                    border: "1px solid #028FF4",
                                    borderRadius: "9999px",
                                    padding: "5px 14px",
                                    fontSize: "11px",
                                    fontWeight: 600,
                                    color: "#028FF4",
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    letterSpacing: "-0.02em",
                                  }}
                                >
                                  <Check size={11} />
                                  Apply to Resume
                                </button>
                                {summaryApplied && (
                                  <button
                                    onClick={handleUndoSummary}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      background: "none",
                                      border: "1.5px solid #E0E0E0",
                                      borderRadius: "9999px",
                                      padding: "5px 14px",
                                      fontSize: "11px",
                                      fontWeight: 600,
                                      color: "#767678",
                                      cursor: "pointer",
                                      fontFamily: "inherit",
                                      letterSpacing: "-0.02em",
                                    }}
                                  >
                                    <RotateCcw size={11} />
                                    Undo
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        )}

                        {/* All variants exhausted — only show Undo */}
                        {summaryVariants.length > 0 && variantIndex >= summaryVariants.length && summaryApplied && (
                          <>
                            <div style={{ height: "1px", backgroundColor: t.border }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <span style={{ fontSize: "11px", color: "#01B747", fontWeight: 600, letterSpacing: "-0.02em" }}>
                                All variants applied
                              </span>
                              <button
                                onClick={handleUndoSummary}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  background: "none",
                                  border: "1.5px solid #E0E0E0",
                                  borderRadius: "9999px",
                                  padding: "5px 14px",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  color: "#767678",
                                  cursor: "pointer",
                                  fontFamily: "inherit",
                                  letterSpacing: "-0.02em",
                                  alignSelf: "flex-start",
                                }}
                              >
                                <RotateCcw size={11} />
                                Undo Changes
                              </button>
                            </div>
                          </>
                        )}

                        {/* Action Words */}
                        {(analysisResult.action_words_analysis?.suggestions?.length ?? 0) > 0 && (
                          <>
                            <div style={{ height: "1px", backgroundColor: t.border }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.07em", color: "#C4C4C4", textTransform: "uppercase" }}>
                                Action Words
                              </span>
                              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                                {analysisResult.action_words_analysis.suggestions.map((aw, i) => (
                                  <div
                                    key={i}
                                    style={{
                                      backgroundColor: "#F4F4F6",
                                      borderRadius: "8px",
                                      padding: "8px 10px",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "6px",
                                    }}
                                  >
                                    <span style={{ fontSize: "12px", fontWeight: 500, color: "#F70407", fontFamily: "inherit" }}>
                                      {aw.current}
                                    </span>
                                    <span style={{ fontSize: "11px", color: "#C4C4C4" }}>→</span>
                                    <span style={{ fontSize: "12px", fontWeight: 600, color: "#01B747", fontFamily: "inherit" }}>
                                      {aw.suggested}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>}

        {/* Center — Resume preview */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "auto",
            display: isMobile ? (mobileTab === "preview" ? "flex" : "none") : "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: isMobile ? "16px 16px 80px" : "32px 24px",
            backgroundColor: t.bg,
          }}
        >
          <div
            ref={previewRef}
            style={{
              width: "100%",
              maxWidth: "657px",
              backgroundColor: "#FFFFFF",
              borderRadius: isMobile ? "12px" : "20px",
              border: `1px solid ${t.resumeBorder}`,
              minHeight: "731px",
              flexShrink: 0,
              transformOrigin: "top center",
              transform: (() => {
                if (!isMobile) return "none";
                const available = windowWidth - 32;
                const scale = available < 657 ? available / 657 : 1;
                return `scale(${scale})`;
              })(),
              marginBottom: (() => {
                if (!isMobile) return 0;
                const available = windowWidth - 32;
                const scale = available < 657 ? available / 657 : 1;
                return scale < 1 ? `${(731 * (scale - 1))}px` : 0;
              })(),
            }}
          >
            <ResumePreview resume={resume} template={selectedTemplate} accentColor={selectedColor} sectionOrder={sectionOrder} highlightKeywords={appliedKeywords} />
          </div>
        </div>

        {/* Right panel — section cards */}
        <div
          style={{
            width: isMobile ? "100%" : isTablet ? "300px" : "400px",
            flexShrink: 0,
            borderLeft: isMobile ? "none" : `1px solid ${t.border}`,
            overflowY: "auto",
            display: isMobile ? (mobileTab === "edit" ? "flex" : "none") : "flex",
            flexDirection: "column",
            gap: "10px",
            padding: isMobile ? "16px 16px 80px" : "24px",
            backgroundColor: t.bg,
            userSelect: dragState ? "none" : "auto",
          }}
        >
          {displayList.map((item) =>
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

      {/* ── Mobile bottom tab bar ───────────────────────────────────────────── */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: 64,
            backgroundColor: "#FFFFFF",
            borderTop: `1px solid ${t.border}`,
            display: "flex",
            zIndex: 200,
          }}
        >
          {(
            [
              { id: "edit"     as const, label: "Edit",     icon: <PenLine  size={20} strokeWidth={1.8} /> },
              { id: "preview"  as const, label: "Preview",  icon: <Eye      size={20} strokeWidth={1.8} /> },
              ...(features.jdOptimization
                ? [{ id: "optimize" as const, label: "Optimize", icon: <Sparkles size={20} strokeWidth={1.8} /> }]
                : []),
            ] as { id: "edit" | "preview" | "optimize"; label: string; icon: React.ReactNode }[]
          ).map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => setMobileTab(id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                color: mobileTab === id ? "#028FF4" : "#AEAEB2",
                transition: "color 0.15s",
              }}
            >
              {icon}
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "-0.01em" }}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
    </>
  );
}
