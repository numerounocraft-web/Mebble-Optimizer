"use client";

import type { Resume } from "@/lib/schemas/resume";

interface Props {
  resume: Resume;
}

const FONT = '"Geist", var(--font-geist-sans), system-ui, sans-serif';

/* Base body text — 13px, 160% line-height, -0.02em tracking, #767678 */
const BODY: React.CSSProperties = {
  fontSize: "13px",
  lineHeight: "160%",
  letterSpacing: "-0.02em",
  fontFamily: FONT,
  color: "#767678",
  fontWeight: 500,
  margin: 0,
};

/* Section header */
function SectionHeader({ title }: { title: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span
        style={{
          fontSize: "14px",
          lineHeight: "160%",
          letterSpacing: "-0.02em",
          color: "#1F1F1F",
          fontWeight: 600,
          fontFamily: FONT,
        }}
      >
        {title.toUpperCase()}
      </span>
      <div style={{ height: "1px", backgroundColor: "#E8E8E8" }} />
    </div>
  );
}

/* Empty state */
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
        color: "#D0D0D0",
        fontFamily: FONT,
        minHeight: "400px",
      }}
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
        <path
          d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
          stroke="#E0E0E0"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
          stroke="#E0E0E0"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p
        style={{
          ...BODY,
          textAlign: "center",
          color: "#D0D0D0",
        }}
      >
        Start filling in your details —
        <br />
        your resume will appear here live
      </p>
    </div>
  );
}

export default function ResumePreview({ resume }: Props) {
  const { personalInfo, summary, experience, education, skills } = resume;

  const hasContent =
    personalInfo.name ||
    summary ||
    experience.length > 0 ||
    education.length > 0 ||
    skills.length > 0;

  if (!hasContent) return <EmptyState />;

  /* Contact row items */
  const contactItems: string[] = [];
  if (personalInfo.phone) contactItems.push(personalInfo.phone);
  if (personalInfo.email) contactItems.push(personalInfo.email);
  if (personalInfo.location) contactItems.push(personalInfo.location);
  if (personalInfo.linkedin)
    contactItems.push(personalInfo.linkedin.replace(/^https?:\/\/(www\.)?/, ""));
  if (personalInfo.website)
    contactItems.push(personalInfo.website.replace(/^https?:\/\/(www\.)?/, ""));

  return (
    <div
      style={{
        fontFamily: FONT,
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      {/* ── Name + Contact ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {personalInfo.name && (
          <span
            style={{
              fontSize: "14px",
              lineHeight: "160%",
              letterSpacing: "-0.02em",
              color: "#1F1F1F",
              fontWeight: 600,
              fontFamily: FONT,
            }}
          >
            {personalInfo.name}
          </span>
        )}

        {contactItems.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0",
            }}
          >
            {contactItems.map((item, i) => (
              <span
                key={i}
                style={{
                  ...BODY,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {i > 0 && (
                  <span
                    style={{
                      margin: "0 8px",
                      color: "#C8C8C8",
                      fontWeight: 400,
                    }}
                  >
                    |
                  </span>
                )}
                {item}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Professional Summary ─────────────────────────────────────────────── */}
      {summary && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <SectionHeader title="Professional Summary" />
          <p style={BODY}>{summary}</p>
        </div>
      )}

      {/* ── Experience ───────────────────────────────────────────────────────── */}
      {experience.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <SectionHeader title="Professional Experience" />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {experience.map((exp) => (
              <div key={exp.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {/* Title + Date row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      lineHeight: "160%",
                      letterSpacing: "-0.02em",
                      color: "#1F1F1F",
                      fontWeight: 600,
                      fontFamily: FONT,
                    }}
                  >
                    {exp.title || "Job Title"}
                    {exp.company && (
                      <span
                        style={{
                          fontWeight: 500,
                          color: "#767678",
                        }}
                      >
                        {" "}
                        — {exp.company}
                      </span>
                    )}
                  </span>
                  {(exp.startDate || exp.endDate || exp.current) && (
                    <span
                      style={{
                        ...BODY,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {exp.startDate}
                      {exp.startDate && (exp.current || exp.endDate) ? " – " : ""}
                      {exp.current ? "Present" : exp.endDate}
                    </span>
                  )}
                </div>

                {/* Location */}
                {exp.location && <p style={BODY}>{exp.location}</p>}

                {/* Bullets */}
                {exp.bullets.filter(Boolean).length > 0 && (
                  <ul
                    style={{
                      margin: "4px 0 0 0",
                      paddingLeft: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    {exp.bullets.filter(Boolean).map((b, bi) => (
                      <li key={bi} style={BODY}>
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Education ────────────────────────────────────────────────────────── */}
      {education.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <SectionHeader title="Education" />
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {education.map((edu) => (
              <div key={edu.id} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: "16px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      lineHeight: "160%",
                      letterSpacing: "-0.02em",
                      color: "#1F1F1F",
                      fontWeight: 600,
                      fontFamily: FONT,
                    }}
                  >
                    {edu.institution || "Institution"}
                  </span>
                  {(edu.startDate || edu.endDate) && (
                    <span style={{ ...BODY, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {edu.startDate}
                      {edu.startDate && edu.endDate ? " – " : ""}
                      {edu.endDate}
                    </span>
                  )}
                </div>
                <p style={BODY}>
                  {[edu.degree, edu.field].filter(Boolean).join(", ")}
                  {edu.gpa && <span> · GPA: {edu.gpa}</span>}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Skills ───────────────────────────────────────────────────────────── */}
      {skills.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <SectionHeader title="Core Competencies" />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {skills.map((group) => (
              <p key={group.id} style={BODY}>
                {group.category && (
                  <span
                    style={{
                      fontWeight: 600,
                      color: "#1F1F1F",
                    }}
                  >
                    {group.category}:{" "}
                  </span>
                )}
                {group.items.join(", ")}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
