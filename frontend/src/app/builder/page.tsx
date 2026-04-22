"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import MebbleSpinner from "@/components/ui/MebbleSpinner";
import {
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
import { analyzeBuilderResume, optimizeBuilderResume, optimizeSection, getSummaryVariants, importResumePDF } from "@/lib/api";
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
import { useAuth } from "@/lib/auth";
import { buildResumeDocx } from "@/lib/buildResumeDocx";
import {
  listCloudResumes,
  createCloudResume,
  getCloudResume,
  updateCloudResume,
} from "@/lib/api";
import AuthModal from "@/components/ui/AuthModal";
import SavePromptModal from "@/components/ui/SavePromptModal";
import UserMenu from "@/components/ui/UserMenu";

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
  const [actionWordsApplied, setActionWordsApplied] = useState(false);
  const preActionWordsRef = useRef<Resume | null>(null);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview" | "optimize">("edit");
  const [importingResume, setImportingResume] = useState(false);

  // ── Cloud save state ──────────────────────────────────────────────────────
  const [cloudResumeId,  setCloudResumeId]  = useState<string | null>(null);
  const [saveStatus,     setSaveStatus]     = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showAuthModal,  setShowAuthModal]  = useState(false);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [syncPrompt,     setSyncPrompt]     = useState<"none" | "ask">("none");
  const [pendingCloud,   setPendingCloud]   = useState<{ id: string; data: Resume } | null>(null);
  const hasSyncedRef = useRef(false);
  const resumeRef    = useRef<Resume>(EMPTY_RESUME);
  const [hydrated,   setHydrated]   = useState(false);

  // ── Hooks that must come before effects ──────────────────────────────────
  const { user, accessToken, logout } = useAuth();
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1100;

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

  // ── Save-prompt auto-trigger refs ─────────────────────────────────────────
  const savePromptShownRef  = useRef(false);
  const savePromptTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevImportingRef    = useRef(false);
  const userRef             = useRef(user);

  function closeSettings() {
    setSettingsClosing(true);
    setTimeout(() => {
      setSettingsOpen(false);
      setSettingsClosing(false);
    }, 180);
  }

  // Keep userRef current so setTimeout callbacks always see the latest value
  useEffect(() => { userRef.current = user; }, [user]);

  // ── Save-prompt: schedule helper ─────────────────────────────────────────
  function scheduleSavePrompt() {
    if (savePromptShownRef.current || user || savePromptTimerRef.current) return;
    savePromptTimerRef.current = setTimeout(() => {
      if (!savePromptShownRef.current && !userRef.current) {
        setShowSavePrompt(true);
        savePromptShownRef.current = true;
      }
      savePromptTimerRef.current = null;
    }, 3000);
  }

  // Trigger 1: 3 s after the user types their first character in any field
  useEffect(() => {
    if (user || savePromptShownRef.current) return;
    const { personalInfo, summary, experience, education, skills } = resume;
    const hasContent =
      personalInfo.name || personalInfo.email || personalInfo.phone ||
      personalInfo.location || summary ||
      experience.length > 0 || education.length > 0 || skills.length > 0;
    if (hasContent) scheduleSavePrompt();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume, user]);

  // Trigger 2: 3 s after a PDF import finishes loading
  useEffect(() => {
    if (!prevImportingRef.current && importingResume) {
      prevImportingRef.current = true;
    }
    if (prevImportingRef.current && !importingResume) {
      prevImportingRef.current = false;
      scheduleSavePrompt();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [importingResume]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (savePromptTimerRef.current) clearTimeout(savePromptTimerRef.current);
    };
  }, []);

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

  // Keep resumeRef current so effects always read the latest resume value
  useEffect(() => { resumeRef.current = resume; }, [resume]);

  // ── Restore from localStorage on mount ──────────────────────────────────
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mebble_builder_state");
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.resume)        setResume(saved.resume);
        if (saved.sectionOrder)  setSectionOrder(saved.sectionOrder);
        if (typeof saved.selectedTemplate === "number") setSelectedTemplate(saved.selectedTemplate);
        if (saved.selectedColor) setSelectedColor(saved.selectedColor);
      }
    } catch { /* ignore corrupt data */ }
    setHydrated(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist to localStorage on every change (after hydration) ───────────
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem("mebble_builder_state", JSON.stringify({
        resume, sectionOrder, selectedTemplate, selectedColor,
      }));
    } catch { /* quota exceeded — ignore */ }
  }, [resume, sectionOrder, selectedTemplate, selectedColor, hydrated]);

  // ── On login: sync local ↔ cloud ────────────────────────────────────────
  useEffect(() => {
    if (!user || !accessToken) { hasSyncedRef.current = false; return; }
    if (hasSyncedRef.current) return;
    hasSyncedRef.current = true;

    const sync = async () => {
      try {
        const resumes = await listCloudResumes(accessToken);
        if (resumes.length > 0) {
          const local = resumeRef.current;
          const localIsEmpty =
            !local.personalInfo.name && !local.personalInfo.email &&
            local.experience.length === 0 && local.education.length === 0 && !local.summary;
          setCloudResumeId(resumes[0].id);
          if (localIsEmpty) {
            const { data: cloudData } = await getCloudResume(resumes[0].id, accessToken);
            setResume(cloudData);
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
          }
        } else {
          const created = await createCloudResume(resumeRef.current, accessToken);
          setCloudResumeId(created.id);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        }
      } catch { /* silent */ }
    };
    sync();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Auto-save to cloud 3 s after resume changes ─────────────────────────
  useEffect(() => {
    if (!user || !accessToken || !cloudResumeId) return;
    setSaveStatus("saving");
    const timer = setTimeout(async () => {
      try {
        await updateCloudResume(cloudResumeId, resume, accessToken);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch {
        setSaveStatus("error");
      }
    }, 3000);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume, cloudResumeId]);

  // ── Manual first save (no cloudResumeId yet) ─────────────────────────────
  async function handleCloudSave() {
    if (!accessToken && !userRef.current) { setShowSavePrompt(true); return; }
    if (!accessToken) return; // auth still loading, skip silently
    if (cloudResumeId) return; // auto-save handles it
    setSaveStatus("saving");
    try {
      const created = await createCloudResume(resume, accessToken);
      setCloudResumeId(created.id);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }

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

  // ── Export — PDF via browser print engine ────────────────────────────────
  // Saves resume state to sessionStorage then opens /print in a new tab.
  // The print page renders the exact same ResumePreview at A4 size and
  // auto-triggers window.print(), producing a text-based (ATS-ready) PDF.
  function handleExportPDF() {
    setExportOpen(false);
    sessionStorage.setItem(
      "mebble_print",
      JSON.stringify({ resume, template: selectedTemplate, accentColor: selectedColor, sectionOrder }),
    );
    window.open("/print", "_blank");
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

  // ── Import PDF into builder ───────────────────────────────────────────────
  function handleReset() {
    setResume(EMPTY_RESUME);
    setSectionOrder(DEFAULT_ORDER);
    setOpenSection("personalInfo");
    setAnalysisResult(null);
    setAppliedKeywords([]);
    setActionWordsApplied(false);
    preOptimizeRef.current = null;
    preActionWordsRef.current = null;
    try { localStorage.removeItem("mebble_builder_state"); } catch { /* ignore */ }
  }

  async function handleImportResume(file: File) {
    setImportingResume(true);
    try {
      const result = await importResumePDF(file);
      if (!result.success) return;
      const d = result.data;
      setResume({
        ...EMPTY_RESUME,
        personalInfo: { ...EMPTY_RESUME.personalInfo, ...(d.personalInfo || {}) },
        summary:    d.summary    || EMPTY_RESUME.summary,
        experience: d.experience?.length ? d.experience.map((e: ExperienceEntry) => ({ ...newExperience(), ...e })) : EMPTY_RESUME.experience,
        education:  d.education?.length  ? d.education.map((e: EducationEntry)   => ({ ...newEducation(),  ...e })) : EMPTY_RESUME.education,
        skills:     d.skills?.length     ? d.skills                                                                  : EMPTY_RESUME.skills,
      });
      setOpenSection("personalInfo");
    } catch {
      // silent — user can retry
    } finally {
      setImportingResume(false);
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
    setActionWordsApplied(false);
    preOptimizeRef.current = null;
    preSummaryRef.current = null;
    preActionWordsRef.current = null;
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
    setActionWordsApplied(false);
    preActionWordsRef.current = null;
    preOptimizeRef.current = null;
  }

  // ── Apply action word substitutions across resume text ────────────────────
  function handleApplyActionWords() {
    if (!analysisResult?.action_words_analysis?.suggestions?.length) return;
    preActionWordsRef.current = resume;
    const suggestions = analysisResult.action_words_analysis.suggestions;

    function replaceIn(text: string): string {
      let result = text;
      for (const { current, suggested } of suggestions) {
        const regex = new RegExp(`\\b${current}\\b`, "gi");
        result = result.replace(regex, (match) =>
          match[0] === match[0].toUpperCase() && match[0] !== match[0].toLowerCase()
            ? suggested.charAt(0).toUpperCase() + suggested.slice(1)
            : suggested.toLowerCase()
        );
      }
      return result;
    }

    const newSummary = replaceIn(resume.summary ?? "");
    const newExperience = resume.experience.map((exp) => ({
      ...exp,
      bullets: exp.bullets.map(replaceIn),
    }));

    setResume((prev) => ({ ...prev, summary: newSummary, experience: newExperience }));
    setActionWordsApplied(true);
  }

  function handleUndoActionWords() {
    if (!preActionWordsRef.current) return;
    const snap = preActionWordsRef.current;
    setResume((prev) => ({ ...prev, summary: snap.summary, experience: snap.experience }));
    setActionWordsApplied(false);
    preActionWordsRef.current = null;
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

  // ── Whether the resume has any content (used for conditional UI) ─────────
  const hasResumeContent = !!(
    resume.personalInfo.name || resume.personalInfo.email || resume.personalInfo.phone ||
    resume.personalInfo.location || resume.summary ||
    resume.experience.length > 0 || resume.education.length > 0 || resume.skills.length > 0
  );

  // ── Composite ATS display score ───────────────────────────────────────────
  // Keyword match contributes up to (100 - available bonuses) points so that
  // perfect keyword coverage alone cannot reach 100; each improvement adds its bonus.
  const hasSummaryImprovement = summaryVariants.length > 0;
  const hasActionWordImprovement = (analysisResult?.action_words_analysis?.suggestions?.length ?? 0) > 0;
  const summaryBonus = hasSummaryImprovement ? 15 : 0;
  const actionBonus = hasActionWordImprovement ? 15 : 0;
  const keywordMax = 100 - summaryBonus - actionBonus;
  const displayScore = analysisResult
    ? Math.min(100, Math.round(
        analysisResult.ats_score * (keywordMax / 100)
        + (summaryApplied ? summaryBonus : 0)
        + (actionWordsApplied ? actionBonus : 0)
      ))
    : 0;

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
          minHeight: "56px",
          flexShrink: 0,
          backgroundColor: t.navBg,
          borderBottom: `1px solid ${t.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          paddingTop: isMobile ? "env(safe-area-inset-top)" : 0,
          zIndex: 100,
        }}
      >
        {/* Left: logo */}
        <MebbleLogo height={isMobile ? 26 : 18} />

        {/* Right: actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          {/* Cloud save status indicator (logged-in users only) */}
          {user && saveStatus !== "idle" && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {saveStatus === "saving" && <MebbleSpinner size={11} />}
              {saveStatus === "saved"  && <Check size={11} color="#22C55E" />}
              <span style={{
                fontSize: "11px", fontWeight: 500, letterSpacing: "-0.01em",
                color: saveStatus === "saved" ? "#22C55E" : saveStatus === "error" ? "#EF4444" : "#AEAEB2",
              }}>
                {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : "Save failed"}
              </span>
            </div>
          )}

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
                  position: isMobile ? "fixed" : "absolute",
                  top: isMobile ? "64px" : "calc(100% + 8px)",
                  right: isMobile ? "16px" : 0,
                  width: isMobile ? `min(300px, calc(100vw - 32px))` : "300px",
                  backgroundColor: t.dropdownBg,
                  borderRadius: "16px",
                  border: "none",
                  padding: "20px",
                  boxShadow: t.dropdownShadow,
                  zIndex: 300,
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
                      /* Template 2 — Accent Header */
                      <svg key={2} width="78" height="90" viewBox="0 0 78 90" fill="none">
                        <rect x="1" y="1" width="76" height="88" rx="5" fill="#FFFFFF" stroke={selectedTemplate === 2 ? "#028FF4" : "#D0D8E4"} strokeWidth={selectedTemplate === 2 ? 2 : 1} />
                        {/* Accent header bar */}
                        <rect x="1" y="1" width="76" height="22" rx="5" fill={selectedTemplate === 2 ? "#028FF4" : "#5BA4CF"} />
                        <rect x="1" y="14" width="76" height="9"  fill={selectedTemplate === 2 ? "#028FF4" : "#5BA4CF"} />
                        {/* Name in header */}
                        <rect x="8" y="7"  width="36" height="5" rx="1.5" fill="rgba(255,255,255,0.9)" />
                        {/* Contact in header */}
                        <rect x="8" y="15" width="18" height="2.5" rx="1" fill="rgba(255,255,255,0.55)" />
                        <rect x="29" y="15" width="18" height="2.5" rx="1" fill="rgba(255,255,255,0.55)" />
                        {/* Section rows with left accent stripe */}
                        <rect x="8"  y="27" width="3"  height="4"  rx="1" fill={selectedTemplate === 2 ? "#028FF4" : "#5BA4CF"} />
                        <rect x="13" y="28" width="20" height="2.5" rx="1" fill="#C4C4C4" />
                        <rect x="8"  y="34" width="62" height="2"  rx="1" fill="#EBEBEB" />
                        <rect x="8"  y="38" width="62" height="2"  rx="1" fill="#E8E8E8" />
                        <rect x="8"  y="43" width="50" height="2"  rx="1" fill="#E8E8E8" />
                        <rect x="8"  y="50" width="3"  height="4"  rx="1" fill={selectedTemplate === 2 ? "#028FF4" : "#5BA4CF"} />
                        <rect x="13" y="51" width="24" height="2.5" rx="1" fill="#C4C4C4" />
                        <rect x="8"  y="57" width="62" height="2"  rx="1" fill="#EBEBEB" />
                        <rect x="8"  y="61" width="62" height="2"  rx="1" fill="#E8E8E8" />
                        <rect x="8"  y="65" width="54" height="2"  rx="1" fill="#E8E8E8" />
                        <rect x="8"  y="72" width="3"  height="4"  rx="1" fill={selectedTemplate === 2 ? "#028FF4" : "#5BA4CF"} />
                        <rect x="13" y="73" width="16" height="2.5" rx="1" fill="#C4C4C4" />
                        <rect x="8"  y="79" width="62" height="2"  rx="1" fill="#E8E8E8" />
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

          {/* User avatar / menu */}
          {user && <UserMenu user={user} onSignOut={logout} />}
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
                <svg width="24" height="24" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.5749 70.3547C20.8397 70.2917 19.1889 69.8415 17.6226 69.0041C16.0589 68.1692 14.5809 66.946 13.1886 65.3343C10.9085 62.744 9.13292 59.5585 7.86173 55.7777C6.58803 51.997 5.95117 48.0699 5.95117 43.9966C5.95117 39.2473 6.8352 34.7893 8.60326 30.6226C10.3713 26.456 12.8002 22.8278 15.8899 19.7381C18.9796 16.6484 22.5951 14.2082 26.7366 12.4175C30.878 10.6267 35.2994 9.73007 40.0008 9.72754C44.7021 9.72502 49.1235 10.6254 53.265 12.4288C57.4064 14.2322 61.0094 16.6711 64.0738 19.7457C67.1383 22.8202 69.5671 26.4396 71.3604 30.6037C73.1537 34.7679 74.0503 39.2094 74.0503 43.9285C74.0503 48.0068 73.3946 51.9276 72.083 55.6907C70.7715 59.4538 68.958 62.6898 66.6427 65.3986C65.1697 67.0658 63.6614 68.308 62.1179 69.1252C60.5768 69.9423 58.9424 70.3509 57.2147 70.3509C56.3219 70.3509 55.4542 70.245 54.6118 70.0331C53.7669 69.8238 52.9219 69.5085 52.077 69.0873L46.7804 66.439C45.7337 65.9144 44.6277 65.5209 43.4625 65.2586C42.2947 64.9963 41.1168 64.8652 39.9289 64.8652C38.693 64.8652 37.5038 64.9963 36.3612 65.2586C35.2187 65.5209 34.1468 65.9144 33.1454 66.439L27.9245 69.0873C27.0165 69.5716 26.1375 69.9184 25.2876 70.1277C24.4351 70.3396 23.5308 70.4178 22.5749 70.3547ZM44.0337 47.8063C45.1284 46.7142 45.6757 45.3699 45.6757 43.7733C45.6757 43.2185 45.5925 42.6775 45.426 42.1503C45.257 41.6207 45.03 41.1288 44.745 40.6748L51.729 31.6479C52.7126 32.5811 53.5588 33.59 54.2675 34.6745C54.9763 35.7591 55.5122 36.9256 55.8754 38.1741C56.0469 38.6508 56.3017 39.0606 56.6397 39.4037C56.9802 39.7492 57.3875 39.922 57.8617 39.922C58.5427 39.922 59.0509 39.637 59.3863 39.0669C59.7243 38.4969 59.7836 37.8651 59.5641 37.1715C58.1568 32.9367 55.6598 29.5116 52.0732 26.8961C48.4816 24.2781 44.4575 22.9691 40.0008 22.9691C35.5289 22.9691 31.4896 24.2781 27.8829 26.8961C24.2762 29.5116 21.7704 32.9367 20.3655 37.1715C20.1461 37.8651 20.2167 38.4957 20.5774 39.0632C20.938 39.6306 21.4349 39.9169 22.068 39.922C22.5421 39.922 22.9369 39.7492 23.2521 39.4037C23.5674 39.0581 23.8108 38.6483 23.9823 38.1741C25.1072 34.7363 27.1426 31.9733 30.0885 29.8849C33.0345 27.7965 36.3385 26.7523 40.0008 26.7523C41.5443 26.7523 43.0589 26.9793 44.5445 27.4333C46.0301 27.8873 47.4337 28.5242 48.7553 29.3439L41.7486 38.4162C41.4762 38.3178 41.1849 38.2409 40.8747 38.1854C40.5645 38.1299 40.2732 38.1022 40.0008 38.1022C38.4042 38.1022 37.0599 38.6495 35.9678 39.7441C34.8731 40.8363 34.3258 42.1806 34.3258 43.7771C34.3258 45.3737 34.8731 46.718 35.9678 47.8101C37.0624 48.9022 38.4067 49.4495 40.0008 49.4521C41.5948 49.4546 42.9391 48.9073 44.0337 47.8101" fill="#C4C4C4"/>
                </svg>
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
                  <div style={{ padding: isMobile ? "16px 16px 140px" : "16px", display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
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
                        fontWeight: 500,
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
                    {!isMobile && (
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
                            <MebbleSpinner size={12} />
                            Analyzing…
                          </>
                        ) : "Analyze Resume"}
                      </button>
                    )}
                  </div>
                )}

                {/* ── Optimization tab ── */}
                {activeLeftTab === "optimization" && (
                  <div style={{ padding: isMobile ? "16px 16px 140px" : "16px", display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* Loading */}
                    {analyzing && (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", padding: "48px 0" }}>
                        <MebbleSpinner size={22} />
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
                              <MebbleSpinner size={10} />
                            )}
                          </div>
                          <ArcGauge score={displayScore} />
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
                                <MebbleSpinner size={12} />
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
                              <p style={{ fontSize: "12px", fontWeight: 500, color: "#4A4A4A", lineHeight: "160%", letterSpacing: "-0.02em", margin: 0, backgroundColor: "#F4F4F6", borderRadius: "10px", padding: "10px 12px" }}>
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
                                    <span style={{ fontSize: "12px", fontWeight: 500, color: actionWordsApplied ? "#01B747" : "#F70407", fontFamily: "inherit", textDecoration: actionWordsApplied ? "none" : undefined }}>
                                      {actionWordsApplied ? aw.suggested : aw.current}
                                    </span>
                                    {!actionWordsApplied && (
                                      <>
                                        <span style={{ fontSize: "11px", color: "#C4C4C4" }}>→</span>
                                        <span style={{ fontSize: "12px", fontWeight: 600, color: "#01B747", fontFamily: "inherit" }}>
                                          {aw.suggested}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                ))}
                              </div>
                              {actionWordsApplied ? (
                                <button
                                  onClick={handleUndoActionWords}
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
                              ) : (
                                <button
                                  onClick={handleApplyActionWords}
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
                                    cursor: "pointer",
                                    fontFamily: "inherit",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <Sparkles size={12} />
                                  Improve Action Words
                                </button>
                              )}
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
            alignItems: isMobile ? "stretch" : "center",
            padding: isMobile ? "16px 16px 80px" : "32px 24px",
            backgroundColor: t.bg,
          }}
        >
          {/* ── Upload button above preview — only when canvas already has content ── */}
          {hasResumeContent && <div style={{
            width: "100%",
            maxWidth: isMobile ? "none" : "657px",
            marginBottom: "10px",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            <label style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              height: "36px",
              padding: "0 16px",
              borderRadius: "9999px",
              border: "1.5px solid #E4E4E7",
              backgroundColor: "#FFFFFF",
              cursor: importingResume ? "default" : "pointer",
              opacity: importingResume ? 0.6 : 1,
              fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
              transition: "border-color 0.15s, background-color 0.15s",
            }}
              onMouseEnter={(e) => { if (!importingResume) { (e.currentTarget as HTMLElement).style.borderColor = "#028FF4"; (e.currentTarget as HTMLElement).style.backgroundColor = "#F0F8FF"; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E4E4E7"; (e.currentTarget as HTMLElement).style.backgroundColor = "#FFFFFF"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#028FF4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#028FF4", letterSpacing: "-0.02em" }}>
                {importingResume ? "Uploading…" : "Upload resume"}
              </span>
              <input
                type="file"
                accept=".pdf"
                style={{ display: "none" }}
                disabled={importingResume}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportResume(file);
                  e.target.value = "";
                }}
              />
            </label>
            <button
              onClick={handleReset}
              title="Clear resume"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "36px",
                height: "36px",
                borderRadius: "9999px",
                border: "1.5px solid #E4E4E7",
                backgroundColor: "#FFFFFF",
                cursor: "pointer",
                flexShrink: 0,
                transition: "border-color 0.15s, background-color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#F70407"; (e.currentTarget as HTMLElement).style.backgroundColor = "#FFF5F5"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E4E4E7"; (e.currentTarget as HTMLElement).style.backgroundColor = "#FFFFFF"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F70407" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
              </svg>
            </button>
          </div>}

          <div
            ref={previewRef}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: isMobile ? "none" : "657px",
              backgroundColor: "#FFFFFF",
              borderRadius: isMobile ? "12px" : "20px",
              border: `1px solid ${t.resumeBorder}`,
              minHeight: isMobile ? "auto" : "731px",
              flexShrink: 0,
            }}
          >
            {importingResume && (
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.85)", borderRadius: "inherit", gap: "10px", zIndex: 10 }}>
                <MebbleSpinner size={22} />
                <span style={{ fontSize: "13px", color: "#727272", fontWeight: 500, fontFamily: "var(--font-geist-sans), system-ui, sans-serif", letterSpacing: "-0.02em" }}>Importing resume…</span>
              </div>
            )}
            <div>
              <ResumePreview resume={resume} template={selectedTemplate} accentColor={selectedColor} sectionOrder={sectionOrder} highlightKeywords={appliedKeywords} onUpload={handleImportResume} />
            </div>
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

      {/* ── Save prompt (unauthenticated) ─────────────────────────────────── */}
      {showSavePrompt && (
        <SavePromptModal
          onClose={() => setShowSavePrompt(false)}
          onCreateAccount={() => { setShowSavePrompt(false); setShowAuthModal(true); }}
        />
      )}

      {/* ── Auth modal ─────────────────────────────────────────────────────── */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
          prompt="Save and sync your resume across devices"
        />
      )}

      {/* ── Sync prompt (cloud resume exists after login) ───────────────────── */}
      {syncPrompt === "ask" && pendingCloud && (
        <div
          style={{
            position: "fixed", inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9998, padding: "24px",
          }}
        >
          <div
            style={{
              width: "100%", maxWidth: "360px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px", padding: "24px",
              display: "flex", flexDirection: "column", gap: "16px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
              animation: "dropdownScale 0.2s cubic-bezier(0.16,1,0.3,1) forwards",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#1F1F1F", letterSpacing: "-0.03em" }}>
                You have a saved resume
              </p>
              <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#9A9A9C", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: "150%" }}>
                We found a resume saved to your account. Which version would you like to use?
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={() => {
                  setResume(pendingCloud.data);
                  setSyncPrompt("none");
                  setPendingCloud(null);
                }}
                style={{
                  height: "42px", borderRadius: "10px", border: "none",
                  backgroundColor: "#028FF4", color: "#FFFFFF",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "-0.02em",
                }}
              >
                Load cloud version
              </button>
              <button
                onClick={async () => {
                  setSyncPrompt("none");
                  setPendingCloud(null);
                  if (accessToken && pendingCloud) {
                    try {
                      await updateCloudResume(pendingCloud.id, resume, accessToken);
                    } catch { /* silent */ }
                  }
                }}
                style={{
                  height: "42px", borderRadius: "10px", border: "1.5px solid #E8E8EA",
                  backgroundColor: "#FFFFFF", color: "#767678",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", letterSpacing: "-0.02em",
                }}
              >
                Keep this version (overwrite cloud)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile fixed Analyze button (above tab bar) ─────────────────────── */}
      {isMobile && mobileTab === "optimize" && (
        <div style={{ position: "fixed", bottom: 64, left: 0, right: 0, padding: "0 16px 10px", zIndex: 150 }}>
          <button
            onClick={handleAnalyze}
            disabled={!jdText.trim() || analyzing}
            style={{
              width: "100%",
              height: "44px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: !jdText.trim() ? "#F1F1F1" : "#028FF4",
              color: !jdText.trim() ? "#C4C4C4" : "#FFFFFF",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "-0.02em",
              cursor: !jdText.trim() || analyzing ? "default" : "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              boxShadow: "0 4px 16px rgba(2,143,244,0.25)",
              transition: "background-color 0.15s",
            }}
          >
            {analyzing ? (
              <>
                <MebbleSpinner size={13} />
                Analyzing…
              </>
            ) : "Analyze Resume"}
          </button>
        </div>
      )}

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
