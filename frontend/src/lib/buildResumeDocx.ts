import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  LevelFormat,
  convertInchesToTwip,
} from "docx";
import type { Resume } from "./schemas/resume";

// Hex → { r, g, b } 0-255
function hexToRgb(hex: string) {
  const c = hex.replace("#", "");
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

// Accent color as RRGGBB string (no #)
function accentStr(hex: string) {
  return hex.replace("#", "").toUpperCase();
}

function rule(accent: string): Paragraph {
  return new Paragraph({
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: accentStr(accent) },
    },
    spacing: { after: 80 },
  });
}

function sectionHeading(label: string, accent: string): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 200, after: 40 },
      children: [
        new TextRun({
          text: label.toUpperCase(),
          bold: true,
          size: 18,
          color: accentStr(accent),
          font: "Calibri",
        }),
      ],
    }),
    rule(accent),
  ];
}

export async function buildResumeDocx(resume: Resume, accentColor = "#028FF4"): Promise<Blob> {
  const accent = accentColor;
  const children: Paragraph[] = [];

  // ── Header ────────────────────────────────────────────────────────────────────
  const { personalInfo } = resume;

  if (personalInfo.name) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: personalInfo.name,
            bold: true,
            size: 44,
            font: "Calibri",
            color: "141414",
          }),
        ],
      })
    );
  }

  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.location,
    ...(personalInfo.links ?? []).map((l) => l.url || l.label),
  ].filter(Boolean) as string[];

  if (contactParts.length) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: contactParts.join("   ·   "),
            size: 18,
            color: "646464",
            font: "Calibri",
          }),
        ],
      })
    );
  }

  // ── Summary ───────────────────────────────────────────────────────────────────
  if (resume.summary?.trim()) {
    children.push(...sectionHeading("Summary", accent));
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({
            text: resume.summary.trim(),
            size: 20,
            font: "Calibri",
            color: "3C3C3C",
          }),
        ],
      })
    );
  }

  // ── Experience ────────────────────────────────────────────────────────────────
  if (resume.experience?.length) {
    children.push(...sectionHeading("Experience", accent));

    for (const exp of resume.experience) {
      const titleLine = [exp.title, exp.company].map((s) => s?.trim()).filter(Boolean).join("  ·  ");
      if (titleLine) {
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({ text: titleLine, bold: true, size: 22, font: "Calibri", color: "141414" }),
            ],
          })
        );
      }

      const dateStr = [exp.startDate, exp.current ? "Present" : exp.endDate]
        .filter(Boolean).join(" – ");
      const metaParts = [dateStr, exp.location?.trim()].filter(Boolean);
      if (metaParts.length) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: metaParts.join("   |   "), size: 18, font: "Calibri", color: "828282" }),
            ],
          })
        );
      }

      for (const bullet of exp.bullets.filter(Boolean)) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: bullet, size: 20, font: "Calibri", color: "3C3C3C" }),
            ],
          })
        );
      }
    }
  }

  // ── Education ─────────────────────────────────────────────────────────────────
  if (resume.education?.length) {
    children.push(...sectionHeading("Education", accent));

    for (const edu of resume.education) {
      if (edu.institution) {
        children.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({ text: edu.institution, bold: true, size: 22, font: "Calibri", color: "141414" }),
            ],
          })
        );
      }
      const degreeLine = [edu.degree, edu.field].map((s) => s?.trim()).filter(Boolean).join(", ");
      if (degreeLine) {
        children.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: degreeLine, size: 20, font: "Calibri", color: "3C3C3C" }),
            ],
          })
        );
      }
      const dateStr = [edu.startDate, edu.endDate].filter(Boolean).join(" – ");
      if (dateStr) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: dateStr, size: 18, font: "Calibri", color: "828282" }),
            ],
          })
        );
      }
    }
  }

  // ── Skills ────────────────────────────────────────────────────────────────────
  if (resume.skills?.length) {
    children.push(...sectionHeading("Skills", accent));

    for (const group of resume.skills) {
      const items = group.items.filter(Boolean).join(", ");
      if (!items) continue;

      if (group.category) {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: `${group.category.trim()}: `, bold: true, size: 20, font: "Calibri", color: "141414" }),
              new TextRun({ text: items, size: 20, font: "Calibri", color: "3C3C3C" }),
            ],
          })
        );
      } else {
        children.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [new TextRun({ text: items, size: 20, font: "Calibri", color: "3C3C3C" })],
          })
        );
      }
    }
  }

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: "bullet-list",
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: "•",
              alignment: AlignmentType.LEFT,
              style: {
                paragraph: {
                  indent: { left: convertInchesToTwip(0.25), hanging: convertInchesToTwip(0.25) },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}
