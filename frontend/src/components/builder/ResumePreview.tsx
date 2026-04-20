"use client";


import type { Resume } from "@/lib/schemas/resume";

type SectionId = "personalInfo" | "summary" | "experience" | "education" | "skills";

const DEFAULT_ORDER: SectionId[] = ["personalInfo", "summary", "experience", "education", "skills"];

interface Props {
  resume: Resume;
  template?: number;
  accentColor?: string;
  sectionOrder?: SectionId[];
  highlightKeywords?: string[];
  onUpload?: (file: File) => void;
  forPrint?: boolean;
}

/* ── Keyword shimmer highlight ──────────────────────────────────────────────── */
function HighlightedText({ text, keywords }: { text: string; keywords: string[] }) {
  if (!keywords.length || !text) return <>{text}</>;
  const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        keywords.some((kw) => kw.toLowerCase() === part.toLowerCase()) ? (
          <span
            key={i}
            style={{
              background: "linear-gradient(90deg, #028FF4 0%, #8B5CF6 50%, #EC4899 100%)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "kwShimmer 2.5s linear infinite",
              fontWeight: 700,
            }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const FONT = '"Geist", var(--font-geist-sans), system-ui, sans-serif';
const DEFAULT_ACCENT = "#028FF4";

/* ── Shared base styles ─────────────────────────────────────────────────────── */
const body = (color = "#767678"): React.CSSProperties => ({
  fontSize: "13px",
  lineHeight: "160%",
  letterSpacing: "-0.02em",
  fontFamily: FONT,
  color,
  fontWeight: 500,
  margin: 0,
});

/* ── Empty state ────────────────────────────────────────────────────────────── */
function EmptyState({ onUpload }: { onUpload?: (file: File) => void }) {

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "80px 40px",
        minHeight: "400px",
        fontFamily: FONT,
      }}
    >
      <svg width="287" height="162" viewBox="0 0 287 162" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_d_4573_15978)">
          <rect x="96.832" y="2.5" width="135.333" height="130.008" rx="13.0442" fill="white" shapeRendering="crispEdges"/>
          <rect x="97.0055" y="2.67346" width="134.986" height="129.661" rx="12.8707" stroke="#EBEBEB" strokeWidth="0.346919" shapeRendering="crispEdges"/>
          <rect width="96.2007" height="8.1526" transform="translate(116.398 22.0664)" fill="#F3F3F3"/>
          <rect width="96.2007" height="8.1526" transform="translate(116.398 52.4219)" fill="#F3F3F3"/>
          <rect width="96.2007" height="8.1526" transform="translate(116.398 66.125)" fill="#F3F3F3"/>
          <rect width="85.6023" height="7.33734" transform="translate(116.398 79.8281)" fill="#F3F3F3"/>
          <rect width="59.514" height="7.33734" transform="translate(116.398 92.7168)" fill="#F3F3F3"/>
          <rect width="38.3172" height="7.33734" transform="translate(116.398 105.604)" fill="#F3F3F3"/>
        </g>
        <g filter="url(#filter1_d_4573_15978)">
          <rect x="187" y="46.4824" width="100" height="96.0651" rx="9.63855" transform="rotate(5.81056 187 46.4824)" fill="white" shapeRendering="crispEdges"/>
          <rect x="187.115" y="46.6229" width="99.7437" height="95.8088" rx="9.51038" transform="rotate(5.81056 187.115 46.6229)" stroke="#EBEBEB" strokeWidth="0.256345" shapeRendering="crispEdges"/>
          <rect width="71.0843" height="6.0241" transform="translate(199.92 62.3301) rotate(5.81056)" fill="#F3F3F3"/>
          <rect width="71.0843" height="6.0241" transform="translate(197.648 84.6445) rotate(5.81056)" fill="#F3F3F3"/>
          <rect width="71.0843" height="6.0241" transform="translate(196.623 94.7178) rotate(5.81056)" fill="#F3F3F3"/>
          <rect width="63.253" height="5.42169" transform="translate(195.598 104.792) rotate(5.81056)" fill="#F3F3F3"/>
          <rect width="43.9759" height="5.42169" transform="translate(194.635 114.266) rotate(5.81056)" fill="#F3F3F3"/>
          <rect width="28.3133" height="5.42169" transform="translate(193.67 123.74) rotate(5.81056)" fill="#F3F3F3"/>
        </g>
        <g filter="url(#filter2_d_4573_15978)">
          <rect y="63.0195" width="100" height="96.0651" rx="9.63855" transform="rotate(-8.30917 0 63.0195)" fill="white" shapeRendering="crispEdges"/>
          <rect x="0.14535" y="63.1278" width="99.7437" height="95.8088" rx="9.51038" transform="rotate(-8.30917 0.14535 63.1278)" stroke="#EBEBEB" strokeWidth="0.256345" shapeRendering="crispEdges"/>
          <rect width="71.0843" height="6.0241" transform="translate(16.3945 75.2363) rotate(-8.30917)" fill="#F3F3F3"/>
          <rect width="71.0843" height="6.0241" transform="translate(19.6367 97.4307) rotate(-8.30917)" fill="#F3F3F3"/>
          <rect width="71.0843" height="6.0241" transform="translate(21.0996 107.45) rotate(-8.30917)" fill="#F3F3F3"/>
          <rect width="63.253" height="5.42169" transform="translate(22.5625 117.47) rotate(-8.30917)" fill="#F3F3F3"/>
          <rect width="43.9759" height="5.42169" transform="translate(23.9395 126.893) rotate(-8.30917)" fill="#F3F3F3"/>
          <rect width="28.3133" height="5.42169" transform="translate(25.3164 136.315) rotate(-8.30917)" fill="#F3F3F3"/>
        </g>
        <defs>
          <filter id="filter0_d_4573_15978" x="96.832" y="2.5" width="136.965" height="133.269" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="1.63052" dy="3.26104"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4573_15978"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4573_15978" result="shape"/>
          </filter>
          <filter id="filter1_d_4573_15978" x="177.273" y="46.4824" width="110.418" height="108.105" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="1.20482" dy="2.40964"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4573_15978"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4573_15978" result="shape"/>
          </filter>
          <filter id="filter2_d_4573_15978" x="-1.31596" y="48.5684" width="114.15" height="111.917" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feFlood floodOpacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dx="-1.31596" dy="2.40964"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.07 0"/>
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_4573_15978"/>
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_4573_15978" result="shape"/>
          </filter>
        </defs>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
        <p style={{ fontSize: "14px", lineHeight: "160%", letterSpacing: "-0.02em", color: "#1F1F1F", fontFamily: FONT, fontWeight: 500, margin: 0, textAlign: "center" }}>
          No information to display
        </p>
        <p style={{ fontSize: "13px", lineHeight: "160%", letterSpacing: "-0.02em", color: "#727272", fontFamily: FONT, fontWeight: 500, margin: 0, textAlign: "center" }}>
          Get started and build your resume.<br />This canvas previews your information.
        </p>
      </div>

      {onUpload && (
        <>
          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%", maxWidth: "240px" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#EBEBEB" }} />
            <span style={{ fontSize: "11px", color: "#C0C0C0", fontFamily: FONT, fontWeight: 500, letterSpacing: "-0.01em" }}>or</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "#EBEBEB" }} />
          </div>

          {/* Upload button */}
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              height: "36px",
              padding: "0 18px",
              borderRadius: "9999px",
              border: "1.5px solid #E4E4E7",
              backgroundColor: "#FFFFFF",
              cursor: "pointer",
              fontFamily: FONT,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#028FF4" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#028FF4", letterSpacing: "-0.02em" }}>
              Upload existing resume
            </span>
            <input
              type="file"
              accept=".pdf"
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && onUpload) onUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        </>
      )}
    </div>
  );
}

/* ── Contact items ──────────────────────────────────────────────────────────── */
type ContactItem =
  | { kind: "text"; value: string }
  | { kind: "link"; label: string; url: string };

function buildContactItems(resume: Resume): ContactItem[] {
  const { personalInfo } = resume;
  const items: ContactItem[] = [];
  if (personalInfo.phone)    items.push({ kind: "text", value: personalInfo.phone });
  if (personalInfo.email)    items.push({ kind: "text", value: personalInfo.email });
  if (personalInfo.location) items.push({ kind: "text", value: personalInfo.location });
  for (const link of personalInfo.links ?? []) {
    if (link.url) items.push({ kind: "link", label: link.label || link.url, url: link.url });
  }
  return items;
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 0 — Classic (single column)
══════════════════════════════════════════════════════════════════════════════ */
function SectionHeader0({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "2px" }}>
      <span style={{ fontSize: "12px", lineHeight: "160%", letterSpacing: "0.08em", color: "#1F1F1F", fontWeight: 700, fontFamily: FONT }}>
        {title.toUpperCase()}
      </span>
      <div style={{ height: "1px", backgroundColor: "#E8E8E8" }} />
    </div>
  );
}

function Template0({ resume, accent, sectionOrder, highlight }: { resume: Resume; accent: string; sectionOrder: SectionId[]; highlight: string[] }) {
  const { personalInfo, summary, experience, education, skills } = resume;
  const contactItems = buildContactItems(resume);

  function renderSection(id: SectionId) {
    switch (id) {
      case "personalInfo":
        if (!personalInfo.name && contactItems.length === 0) return null;
        return (
          <div key="personalInfo" style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {personalInfo.name && (
              <span style={{ fontSize: "24px", lineHeight: "120%", letterSpacing: "-0.03em", color: "#1F1F1F", fontWeight: 700, fontFamily: FONT }}>
                {personalInfo.name}
              </span>
            )}
            {contactItems.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
                {contactItems.map((item, i) => (
                  <span key={i} style={{ ...body(), display: "flex", alignItems: "center" }}>
                    {i > 0 && <span style={{ margin: "0 8px", color: "#C8C8C8" }}>|</span>}
                    {item.kind === "link"
                      ? <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ ...body(accent), textDecoration: "none" }}>{item.label}</a>
                      : item.value}
                  </span>
                ))}
              </div>
            )}
          </div>
        );

      case "summary":
        if (!summary) return null;
        return (
          <div key="summary" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <SectionHeader0 title="Professional Summary" />
            <p style={body()}><HighlightedText text={summary} keywords={highlight} /></p>
          </div>
        );

      case "experience":
        if (experience.length === 0) return null;
        return (
          <div key="experience" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <SectionHeader0 title="Professional Experience" />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {experience.map((exp) => (
                <div key={exp.id} style={{ display: "flex", flexDirection: "column", gap: "3px", pageBreakInside: "avoid", breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px" }}>
                    <span style={{ fontSize: "13px", lineHeight: "160%", letterSpacing: "-0.02em", color: "#1F1F1F", fontWeight: 600, fontFamily: FONT }}>
                      {exp.title || "Job Title"}
                      {exp.company && <span style={{ fontWeight: 500, color: "#767678" }}> — {exp.company}</span>}
                    </span>
                    {(exp.startDate || exp.endDate || exp.current) && (
                      <span style={{ ...body(), whiteSpace: "nowrap", flexShrink: 0 }}>
                        {exp.startDate}{exp.startDate && (exp.current || exp.endDate) ? " – " : ""}{exp.current ? "Present" : exp.endDate}
                      </span>
                    )}
                  </div>
                  {exp.location && <p style={body()}>{exp.location}</p>}
                  {exp.bullets.filter(Boolean).length > 0 && (
                    <div style={{ margin: "4px 0 0 0", display: "flex", flexDirection: "column", gap: "2px" }}>
                      {exp.bullets.filter(Boolean).map((b, bi) => (
                        <div key={bi} style={{ display: "flex", gap: "7px", alignItems: "flex-start" }}>
                          <span style={{ ...body(), flexShrink: 0 }}>•</span>
                          <span style={body()}><HighlightedText text={b} keywords={highlight} /></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "education":
        if (education.length === 0) return null;
        return (
          <div key="education" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <SectionHeader0 title="Education" />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {education.map((edu) => (
                <div key={edu.id} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "16px" }}>
                    <span style={{ fontSize: "13px", lineHeight: "160%", letterSpacing: "-0.02em", color: "#1F1F1F", fontWeight: 600, fontFamily: FONT }}>
                      {edu.institution || "Institution"}
                    </span>
                    {(edu.startDate || edu.endDate) && (
                      <span style={{ ...body(), whiteSpace: "nowrap", flexShrink: 0 }}>
                        {edu.startDate}{edu.startDate && edu.endDate ? " – " : ""}{edu.endDate}
                      </span>
                    )}
                  </div>
                  <p style={body()}>
                    {[edu.degree, edu.field].filter(Boolean).join(", ")}
                    {edu.gpa && <span> · GPA: {edu.gpa}</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      case "skills":
        if (skills.length === 0) return null;
        return (
          <div key="skills" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <SectionHeader0 title="Core Competencies" />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {skills.map((group) => (
                <p key={group.id} style={body()}>
                  {group.category && <span style={{ fontWeight: 600, color: "#1F1F1F" }}>{group.category}: </span>}
                  {group.items.join(", ")}
                </p>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div style={{ fontFamily: FONT, padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {sectionOrder.map((id) => renderSection(id))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 1 — Two Column
   Header full-width · Left col: skills + education · Right col: summary + exp
   Order within each column follows sectionOrder
══════════════════════════════════════════════════════════════════════════════ */
function SectionHeader1({ title, accent }: { title: string; accent: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "4px" }}>
      <span style={{ fontSize: "11px", letterSpacing: "0.10em", color: accent, fontWeight: 700, fontFamily: FONT }}>
        {title.toUpperCase()}
      </span>
      <div style={{ height: "1.5px", backgroundColor: "#E8E8E8" }} />
    </div>
  );
}

function Template1({ resume, accent, sectionOrder, highlight }: { resume: Resume; accent: string; sectionOrder: SectionId[]; highlight: string[] }) {
  const { personalInfo, summary, experience, education, skills } = resume;
  const contactItems = buildContactItems(resume);

  const leftIds  = sectionOrder.filter((id) => id === "skills"   || id === "education");
  const rightIds = sectionOrder.filter((id) => id === "summary"  || id === "experience");

  function renderLeft(id: SectionId) {
    switch (id) {
      case "skills":
        return skills.length === 0 ? null : (
          <div key="skills" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SectionHeader1 title="Skills" accent={accent} />
            {skills.map((group) => (
              <div key={group.id} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {group.category && (
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#1F1F1F", fontFamily: FONT, letterSpacing: "-0.01em" }}>
                    {group.category}
                  </span>
                )}
                <p style={{ ...body(), fontSize: "12px" }}>{group.items.join(", ")}</p>
              </div>
            ))}
          </div>
        );

      case "education":
        return education.length === 0 ? null : (
          <div key="education" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SectionHeader1 title="Education" accent={accent} />
            {education.map((edu) => (
              <div key={edu.id} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#1F1F1F", fontFamily: FONT }}>
                  {edu.institution || "Institution"}
                </span>
                <p style={{ ...body(), fontSize: "12px" }}>
                  {[edu.degree, edu.field].filter(Boolean).join(", ")}
                </p>
                {(edu.startDate || edu.endDate) && (
                  <p style={{ ...body(), fontSize: "11px", color: "#AEAEB2" }}>
                    {edu.startDate}{edu.startDate && edu.endDate ? " – " : ""}{edu.endDate}
                  </p>
                )}
              </div>
            ))}
          </div>
        );

      default: return null;
    }
  }

  function renderRight(id: SectionId) {
    switch (id) {
      case "summary":
        return !summary ? null : (
          <div key="summary" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SectionHeader1 title="Professional Summary" accent={accent} />
            <p style={body()}><HighlightedText text={summary} keywords={highlight} /></p>
          </div>
        );

      case "experience":
        return experience.length === 0 ? null : (
          <div key="experience" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <SectionHeader1 title="Experience" accent={accent} />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {experience.map((exp) => (
                <div key={exp.id} style={{ display: "flex", flexDirection: "column", gap: "3px", pageBreakInside: "avoid", breakInside: "avoid" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#1F1F1F", fontFamily: FONT, letterSpacing: "-0.02em" }}>
                      {exp.title || "Job Title"}
                    </span>
                    {(exp.startDate || exp.endDate || exp.current) && (
                      <span style={{ ...body(), fontSize: "11px", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {exp.startDate}{exp.startDate && (exp.current || exp.endDate) ? " – " : ""}{exp.current ? "Present" : exp.endDate}
                      </span>
                    )}
                  </div>
                  {exp.company && <p style={{ ...body(), fontSize: "12px", color: accent }}>{exp.company}</p>}
                  {exp.bullets.filter(Boolean).length > 0 && (
                    <div style={{ margin: "4px 0 0 0", display: "flex", flexDirection: "column", gap: "2px" }}>
                      {exp.bullets.filter(Boolean).map((b, bi) => (
                        <div key={bi} style={{ display: "flex", gap: "7px", alignItems: "flex-start" }}>
                          <span style={{ ...body(), fontSize: "12px", flexShrink: 0 }}>•</span>
                          <span style={{ ...body(), fontSize: "12px" }}><HighlightedText text={b} keywords={highlight} /></span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  }

  return (
    <div style={{ fontFamily: FONT, padding: "32px", display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Full-width header — always at top */}
      <div style={{ paddingBottom: "20px", borderBottom: "2px solid #E8E8E8", marginBottom: "20px" }}>
        {personalInfo.name && (
          <span style={{ fontSize: "22px", lineHeight: "120%", letterSpacing: "-0.03em", color: "#1F1F1F", fontWeight: 700, fontFamily: FONT, display: "block" }}>
            {personalInfo.name}
          </span>
        )}
        {contactItems.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", marginTop: "6px" }}>
            {contactItems.map((item, i) => (
              <span key={i} style={{ ...body(), display: "flex", alignItems: "center" }}>
                {i > 0 && <span style={{ margin: "0 8px", color: "#C8C8C8" }}>|</span>}
                {item.kind === "link"
                  ? <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ ...body(accent), textDecoration: "none" }}>{item.label}</a>
                  : item.value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Two columns */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        <div style={{ width: "36%", flexShrink: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
          {leftIds.map((id) => renderLeft(id))}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {rightIds.map((id) => renderRight(id))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 2 — Accent Header
   Full-width accent-coloured header (white name + contact) · single-column body
   Section headings: 3 px accent left-border stripe + uppercase label + rule
══════════════════════════════════════════════════════════════════════════════ */
function Template2({ resume, accent, sectionOrder, highlight, forPrint }: { resume: Resume; accent: string; sectionOrder: SectionId[]; highlight: string[]; forPrint?: boolean }) {
  const { personalInfo, summary, experience, education, skills } = resume;
  const contactItems = buildContactItems(resume);

  function SectionHeading({ title }: { title: string }) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <div style={{ width: "3px", alignSelf: "stretch", minHeight: "16px", backgroundColor: accent, borderRadius: "2px", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#1A1A1A", fontFamily: FONT }}>
            {title.toUpperCase()}
          </span>
          <div style={{ height: "1px", backgroundColor: "#EBEBEB", marginTop: "4px" }} />
        </div>
      </div>
    );
  }

  function renderSection(id: SectionId) {
    switch (id) {
      case "personalInfo": return null;

      case "summary":
        return !summary ? null : (
          <div key="summary" style={{ marginBottom: "18px" }}>
            <SectionHeading title="Professional Summary" />
            <p style={{ ...body(), lineHeight: "170%", margin: 0 }}>
              <HighlightedText text={summary} keywords={highlight} />
            </p>
          </div>
        );

      case "experience":
        return experience.length === 0 ? null : (
          <div key="experience" style={{ marginBottom: "18px" }}>
            <SectionHeading title="Experience" />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.02em", fontFamily: FONT }}>
                      {exp.title}
                    </span>
                    {(exp.startDate || exp.endDate || exp.current) && (
                      <span style={{ ...body(), fontSize: "11px", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {exp.startDate}{exp.startDate && (exp.current || exp.endDate) ? " – " : ""}{exp.current ? "Present" : exp.endDate}
                      </span>
                    )}
                  </div>
                  {exp.company && (
                    <p style={{ fontSize: "12px", fontWeight: 600, color: accent, fontFamily: FONT, margin: "2px 0 6px" }}>
                      {exp.company}{exp.location ? ` · ${exp.location}` : ""}
                    </p>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                    {exp.bullets.filter(Boolean).map((b, bi) => (
                      <div key={bi} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <span style={{ color: accent, flexShrink: 0, fontSize: "13px", lineHeight: "155%", fontWeight: 700 }}>·</span>
                        <span style={body()}><HighlightedText text={b} keywords={highlight} /></span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "education":
        return education.length === 0 ? null : (
          <div key="education" style={{ marginBottom: "18px" }}>
            <SectionHeading title="Education" />
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {education.map((ed) => (
                <div key={ed.id}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#1A1A1A", letterSpacing: "-0.02em", fontFamily: FONT }}>
                      {ed.institution}
                    </span>
                    {(ed.startDate || ed.endDate) && (
                      <span style={{ ...body(), fontSize: "11px", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {ed.startDate}{ed.startDate && ed.endDate ? " – " : ""}{ed.endDate}
                      </span>
                    )}
                  </div>
                  {(ed.degree || ed.field) && (
                    <p style={{ fontSize: "12px", fontWeight: 600, color: accent, fontFamily: FONT, margin: "2px 0 0" }}>
                      {[ed.degree, ed.field].filter(Boolean).join(", ")}
                      {ed.gpa ? ` · GPA ${ed.gpa}` : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "skills":
        return skills.length === 0 ? null : (
          <div key="skills" style={{ marginBottom: "18px" }}>
            <SectionHeading title="Skills" />
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {skills.map((group) => (
                <div key={group.id} style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "baseline" }}>
                  {group.category && (
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#1A1A1A", fontFamily: FONT, flexShrink: 0 }}>
                      {group.category}:
                    </span>
                  )}
                  <span style={body()}>{group.items.join(", ")}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  }

  return (
    <div style={{ fontFamily: FONT, display: "flex", flexDirection: "column", borderRadius: forPrint ? 0 : "20px", overflow: forPrint ? "visible" : "hidden" }}>
      {/* ── Accent header ── */}
      <div style={{ backgroundColor: accent, padding: "28px 28px 22px" }}>
        {personalInfo.name && (
          <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.03em", color: "#FFFFFF", lineHeight: "1.1", marginBottom: "10px", fontFamily: FONT }}>
            {personalInfo.name}
          </div>
        )}
        {contactItems.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center" }}>
            {contactItems.map((item, i) => (
              <span key={i} style={{ fontSize: "11px", color: "rgba(255,255,255,0.85)", fontWeight: 500, fontFamily: FONT, display: "flex", alignItems: "center" }}>
                {i > 0 && <span style={{ margin: "0 8px", color: "rgba(255,255,255,0.4)" }}>|</span>}
                {item.kind === "link"
                  ? <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ color: "#FFFFFF", textDecoration: "none", fontWeight: 600 }}>{item.label}</a>
                  : <span style={{ wordBreak: "break-all" }}>{item.value}</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column" }}>
        {sectionOrder.map((id) => renderSection(id))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Root export
══════════════════════════════════════════════════════════════════════════════ */
export default function ResumePreview({
  resume,
  template = 0,
  accentColor = DEFAULT_ACCENT,
  sectionOrder = DEFAULT_ORDER,
  highlightKeywords = [],
  onUpload,
  forPrint = false,
}: Props) {
  const { personalInfo, summary, experience, education, skills } = resume;

  const hasContent =
    personalInfo.name ||
    summary ||
    experience.length > 0 ||
    education.length > 0 ||
    skills.length > 0;

  if (!hasContent) return <EmptyState onUpload={onUpload} />;

  // Strip highlights in print mode — gradient text can misrender in PDF
  const highlight = forPrint ? [] : highlightKeywords;
  const sharedProps = { resume, accent: accentColor, sectionOrder, highlight };

  return (
    <>
      {highlight.length > 0 && (
        <style>{`
          @keyframes kwShimmer {
            0%   { background-position: 0% center; }
            100% { background-position: 200% center; }
          }
        `}</style>
      )}
      {template === 1 ? <Template1 {...sharedProps} /> : template === 2 ? <Template2 {...sharedProps} forPrint={forPrint} /> : <Template0 {...sharedProps} />}
    </>
  );
}
