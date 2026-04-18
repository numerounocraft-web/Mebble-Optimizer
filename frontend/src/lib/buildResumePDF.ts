import { jsPDF } from "jspdf";
import type { Resume } from "./schemas/resume";

// ── Layout constants (all in mm) ──────────────────────────────────────────────
const PAGE_W   = 210;
const PAGE_H   = 297;
const MARGIN_X = 18;
const MARGIN_T = 18;
const MARGIN_B = 16;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// ── Font sizes (pt) ───────────────────────────────────────────────────────────
const FS = {
  name:        18,
  contact:      8.5,
  sectionLabel: 8,
  jobTitle:    10,
  jobMeta:      8.5,
  bullet:       8.5,
  body:         8.5,
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function ptToMm(pt: number) { return pt * 0.3528; }

function lineH(fs: number, leading = 1.45) { return ptToMm(fs) * leading; }

export function buildResumePDF(resume: Resume, accentColor = "#028FF4"): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  // Hex → [r, g, b]
  const hexRgb = (hex: string): [number, number, number] => {
    const c = hex.replace("#", "");
    return [
      parseInt(c.slice(0, 2), 16),
      parseInt(c.slice(2, 4), 16),
      parseInt(c.slice(4, 6), 16),
    ];
  };

  const [ar, ag, ab] = hexRgb(accentColor);

  let y = MARGIN_T;

  // Ensure we never write below the bottom margin; add a new page if needed.
  function checkPage(needed = 6) {
    if (y + needed > PAGE_H - MARGIN_B) {
      doc.addPage();
      y = MARGIN_T;
    }
  }

  // Write a line of text and advance y.
  function writeLine(
    text: string,
    fs: number,
    style: "normal" | "bold" = "normal",
    color: [number, number, number] = [30, 30, 30],
    extraSpacing = 0,
  ) {
    doc.setFontSize(fs);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
    doc.text(text, MARGIN_X, y);
    y += lineH(fs) + extraSpacing;
  }

  // Write wrapped text (respects CONTENT_W); returns final y.
  function writeWrapped(
    text: string,
    fs: number,
    style: "normal" | "bold" = "normal",
    color: [number, number, number] = [60, 60, 60],
    indent = 0,
  ) {
    doc.setFontSize(fs);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CONTENT_W - indent);
    for (const line of lines) {
      checkPage();
      doc.text(line, MARGIN_X + indent, y);
      y += lineH(fs);
    }
  }

  // Horizontal rule
  function rule(color: [number, number, number] = [220, 220, 220]) {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.25);
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y);
    y += 2.5;
  }

  // Section heading
  function sectionHeading(label: string) {
    checkPage(10);
    y += 3;
    doc.setFontSize(FS.sectionLabel);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(ar, ag, ab);
    doc.text(label.toUpperCase(), MARGIN_X, y);
    y += lineH(FS.sectionLabel, 1.2);
    rule([ar, ag, ab]);
  }

  // ── 1. Header ───────────────────────────────────────────────────────────────
  const { personalInfo } = resume;

  if (personalInfo.name) {
    doc.setFontSize(FS.name);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(20, 20, 20);
    doc.text(personalInfo.name, MARGIN_X, y);
    y += lineH(FS.name, 1.2);
  }

  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    ...(personalInfo.links ?? []).map((l) => l.url || l.label),
  ].filter(Boolean);

  if (contactParts.length) {
    doc.setFontSize(FS.contact);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    const contactLine = contactParts.join("   ·   ");
    const wrapped = doc.splitTextToSize(contactLine, CONTENT_W);
    for (const line of wrapped) {
      doc.text(line, MARGIN_X, y);
      y += lineH(FS.contact);
    }
    y += 1;
  }

  // ── 2. Summary ──────────────────────────────────────────────────────────────
  if (resume.summary?.trim()) {
    sectionHeading("Summary");
    writeWrapped(resume.summary.trim(), FS.body, "normal", [60, 60, 60]);
  }

  // ── 3. Experience ───────────────────────────────────────────────────────────
  if (resume.experience?.length) {
    sectionHeading("Experience");

    for (const exp of resume.experience) {
      checkPage(12);

      // Title + company row
      const titleLine = [exp.title, exp.company].filter(Boolean).join("  ·  ");
      if (titleLine) {
        doc.setFontSize(FS.jobTitle);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 20, 20);
        doc.text(titleLine, MARGIN_X, y);
        y += lineH(FS.jobTitle, 1.2);
      }

      // Dates + location row
      const dateStr = [
        exp.startDate,
        exp.current ? "Present" : exp.endDate,
      ].filter(Boolean).join(" – ");
      const metaParts = [dateStr, exp.location].filter(Boolean);
      if (metaParts.length) {
        doc.setFontSize(FS.jobMeta);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(130, 130, 130);
        doc.text(metaParts.join("   |   "), MARGIN_X, y);
        y += lineH(FS.jobMeta, 1.3);
      }

      // Bullets
      const bullets = exp.bullets.filter(Boolean);
      for (const bullet of bullets) {
        checkPage();
        doc.setFontSize(FS.bullet);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        // Bullet dot
        doc.text("•", MARGIN_X, y);
        const lines = doc.splitTextToSize(bullet, CONTENT_W - 5);
        for (let i = 0; i < lines.length; i++) {
          checkPage();
          doc.text(lines[i], MARGIN_X + 4, y);
          y += lineH(FS.bullet);
        }
      }

      y += 2; // gap between entries
    }
  }

  // ── 4. Education ────────────────────────────────────────────────────────────
  if (resume.education?.length) {
    sectionHeading("Education");

    for (const edu of resume.education) {
      checkPage(10);

      if (edu.institution) {
        doc.setFontSize(FS.jobTitle);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 20, 20);
        doc.text(edu.institution, MARGIN_X, y);
        y += lineH(FS.jobTitle, 1.2);
      }

      const degreeLine = [edu.degree, edu.field].filter(Boolean).join(", ");
      if (degreeLine) {
        doc.setFontSize(FS.body);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        doc.text(degreeLine, MARGIN_X, y);
        y += lineH(FS.body);
      }

      const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(" – ");
      if (dateStr) {
        doc.setFontSize(FS.jobMeta);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(130, 130, 130);
        doc.text(dateStr, MARGIN_X, y);
        y += lineH(FS.jobMeta);
      }

      y += 2;
    }
  }

  // ── 5. Skills ───────────────────────────────────────────────────────────────
  if (resume.skills?.length) {
    sectionHeading("Skills");

    for (const group of resume.skills) {
      checkPage();
      const items = group.items.filter(Boolean).join(", ");
      if (!items) continue;

      doc.setFontSize(FS.body);

      if (group.category) {
        // "Category: items…"
        doc.setFont("helvetica", "bold");
        doc.setTextColor(20, 20, 20);
        const catLabel = `${group.category}: `;
        const catW = doc.getTextWidth(catLabel);

        doc.text(catLabel, MARGIN_X, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(60, 60, 60);
        const itemLines = doc.splitTextToSize(items, CONTENT_W - catW);
        doc.text(itemLines[0] ?? "", MARGIN_X + catW, y);
        y += lineH(FS.body);
        for (let i = 1; i < itemLines.length; i++) {
          checkPage();
          doc.text(itemLines[i], MARGIN_X + catW, y);
          y += lineH(FS.body);
        }
      } else {
        writeWrapped(items, FS.body);
      }

      y += 1;
    }
  }

  return doc;
}
