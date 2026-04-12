"use client";

import type { Resume } from "@/lib/schemas/resume";

interface Props {
  resume: Resume;
  template?: number;      // 0 = Classic, 1 = Two-Column, 2 = Modern Sidebar
  accentColor?: string;   // link / accent color
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
function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        padding: "80px 40px",
        minHeight: "400px",
        fontFamily: FONT,
      }}
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#E0E0E0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p style={{ ...body("#D0D0D0"), textAlign: "center" }}>
        Start filling in your details —<br />your resume will appear here live
      </p>
    </div>
  );
}

/* ── Shared helpers ─────────────────────────────────────────────────────────── */
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

function Template0({ resume, accent }: { resume: Resume; accent: string }) {
  const { personalInfo, summary, experience, education, skills } = resume;
  const contactItems = buildContactItems(resume);

  return (
    <div style={{ fontFamily: FONT, padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Name + Contact */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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

      {/* Summary */}
      {summary && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <SectionHeader0 title="Professional Summary" />
          <p style={body()}>{summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <SectionHeader0 title="Professional Experience" />
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {experience.map((exp) => (
              <div key={exp.id} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
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
                  <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "2px", listStyleType: "disc" }}>
                    {exp.bullets.filter(Boolean).map((b, bi) => (
                      <li key={bi} style={{ ...body(), display: "list-item" }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 1 — Two Column
   Header full-width · Left col: Skills + Education · Right col: Summary + Exp
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

function Template1({ resume, accent }: { resume: Resume; accent: string }) {
  const { personalInfo, summary, experience, education, skills } = resume;
  const contactItems = buildContactItems(resume);

  return (
    <div style={{ fontFamily: FONT, padding: "32px", display: "flex", flexDirection: "column", gap: "0" }}>
      {/* Full-width header */}
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
        {/* Left column — 36% */}
        <div style={{ width: "36%", flexShrink: 0, display: "flex", flexDirection: "column", gap: "20px" }}>
          {skills.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
          )}

          {education.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
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
          )}
        </div>

        {/* Right column — 64% */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
          {summary && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <SectionHeader1 title="Professional Summary" accent={accent} />
              <p style={body()}>{summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <SectionHeader1 title="Experience" accent={accent} />
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {experience.map((exp) => (
                  <div key={exp.id} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
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
                      <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "2px", listStyleType: "disc" }}>
                        {exp.bullets.filter(Boolean).map((b, bi) => (
                          <li key={bi} style={{ ...body(), fontSize: "12px", display: "list-item" }}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   TEMPLATE 2 — Modern Sidebar
   Left sidebar with accent bg: name + contact + skills
   Right main: summary + experience + education
══════════════════════════════════════════════════════════════════════════════ */
function Template2({ resume, accent }: { resume: Resume; accent: string }) {
  const { personalInfo, summary, experience, education, skills } = resume;
  const contactItems = buildContactItems(resume);

  // Lighten accent for sidebar bg — use a fixed light tint
  const sidebarBg = "#EFF6FF";

  return (
    <div style={{ fontFamily: FONT, display: "flex", minHeight: "100%", borderRadius: "16px", overflow: "hidden" }}>
      {/* Left sidebar */}
      <div
        style={{
          width: "32%",
          flexShrink: 0,
          backgroundColor: sidebarBg,
          padding: "28px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Name */}
        {personalInfo.name && (
          <div>
            <span style={{ fontSize: "16px", lineHeight: "130%", letterSpacing: "-0.03em", color: "#1F1F1F", fontWeight: 700, fontFamily: FONT }}>
              {personalInfo.name}
            </span>
          </div>
        )}

        {/* Contact info stacked */}
        {contactItems.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.10em", color: accent, fontWeight: 700, fontFamily: FONT, marginBottom: "4px", display: "block" }}>
              CONTACT
            </span>
            {contactItems.map((item, i) => (
              <div key={i}>
                {item.kind === "link"
                  ? <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ ...body(accent), fontSize: "11px", textDecoration: "none", wordBreak: "break-all" }}>{item.label}</a>
                  : <p style={{ ...body(), fontSize: "11px" }}>{item.value}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.10em", color: accent, fontWeight: 700, fontFamily: FONT, display: "block" }}>
              SKILLS
            </span>
            {skills.map((group) => (
              <div key={group.id} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {group.category && (
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "#1F1F1F", fontFamily: FONT }}>
                    {group.category}
                  </span>
                )}
                <p style={{ ...body(), fontSize: "11px" }}>{group.items.join(", ")}</p>
              </div>
            ))}
          </div>
        )}

        {/* Education in sidebar */}
        {education.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "10px", letterSpacing: "0.10em", color: accent, fontWeight: 700, fontFamily: FONT, display: "block" }}>
              EDUCATION
            </span>
            {education.map((edu) => (
              <div key={edu.id} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#1F1F1F", fontFamily: FONT }}>
                  {edu.institution || "Institution"}
                </span>
                <p style={{ ...body(), fontSize: "11px" }}>
                  {[edu.degree, edu.field].filter(Boolean).join(", ")}
                </p>
                {(edu.startDate || edu.endDate) && (
                  <p style={{ ...body(), fontSize: "10px", color: "#AEAEB2" }}>
                    {edu.startDate}{edu.startDate && edu.endDate ? " – " : ""}{edu.endDate}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right main content */}
      <div style={{ flex: 1, padding: "28px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {summary && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "0.08em", color: accent, fontWeight: 700, fontFamily: FONT }}>
              PROFESSIONAL SUMMARY
            </span>
            <div style={{ height: "1.5px", backgroundColor: "#E8E8E8", marginBottom: "6px" }} />
            <p style={body()}>{summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "11px", letterSpacing: "0.08em", color: accent, fontWeight: 700, fontFamily: FONT }}>
              EXPERIENCE
            </span>
            <div style={{ height: "1.5px", backgroundColor: "#E8E8E8", marginBottom: "6px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {experience.map((exp) => (
                <div key={exp.id} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
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
                  {exp.company && <p style={{ ...body(accent), fontSize: "12px", fontWeight: 600 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>}
                  {exp.bullets.filter(Boolean).length > 0 && (
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "16px", display: "flex", flexDirection: "column", gap: "2px", listStyleType: "disc" }}>
                      {exp.bullets.filter(Boolean).map((b, bi) => (
                        <li key={bi} style={{ ...body(), display: "list-item" }}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   Root export
══════════════════════════════════════════════════════════════════════════════ */
export default function ResumePreview({ resume, template = 0, accentColor = DEFAULT_ACCENT }: Props) {
  const { personalInfo, summary, experience, education, skills } = resume;

  const hasContent =
    personalInfo.name ||
    summary ||
    experience.length > 0 ||
    education.length > 0 ||
    skills.length > 0;

  if (!hasContent) return <EmptyState />;

  if (template === 1) return <Template1 resume={resume} accent={accentColor} />;
  if (template === 2) return <Template2 resume={resume} accent={accentColor} />;
  return <Template0 resume={resume} accent={accentColor} />;
}
