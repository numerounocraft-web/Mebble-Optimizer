"use client";

import { useEffect, useState } from "react";
import ResumePreview from "@/components/builder/ResumePreview";
import type { Resume } from "@/lib/schemas/resume";

type SectionId = "personalInfo" | "summary" | "experience" | "education" | "skills";

interface PrintData {
  resume: Resume;
  template: number;
  accentColor: string;
  sectionOrder: SectionId[];
}

export default function PrintPage() {
  const [data, setData] = useState<PrintData | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("mebble_print");
      if (raw) {
        setData(JSON.parse(raw));
        sessionStorage.removeItem("mebble_print");
      } else {
        setMissing(true);
      }
    } catch {
      setMissing(true);
    }
  }, []);

  // Auto-trigger print once resume data is loaded and fonts have had time to settle.
  // After the dialog is dismissed, close the tab. If the browser blocks window.close()
  // (e.g. the tab was focused by the user before printing), redirect to the builder.
  useEffect(() => {
    if (!data) return;

    function handleAfterPrint() {
      window.close();
      // Fallback: if still open 300 ms later, navigate back to the builder
      setTimeout(() => { window.location.replace("/builder"); }, 300);
    }

    const t = setTimeout(() => {
      window.addEventListener("afterprint", handleAfterPrint, { once: true });
      window.print();
    }, 900);

    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [data]);

  if (missing) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", fontFamily: "system-ui, sans-serif", color: "#888", fontSize: "14px",
      }}>
        No resume data found. Please use the Export button in the builder.
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff; }
        /* Zero out every margin side explicitly — some mobile browsers ignore
           the shorthand and still inject a URL footer unless each side is set. */
        @page {
          size: A4;
          margin: 0;
          margin-top: 0;
          margin-right: 0;
          margin-bottom: 0;
          margin-left: 0;
        }
        @media print {
          html, body { margin: 0; padding: 0; width: 210mm; }
          .resume-print-root { box-shadow: none !important; page-break-inside: avoid; }
          /* Force backgrounds (colours, gradients) to print without requiring
             the user to manually enable "Background graphics" in the dialog. */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
        }
        /* Screen: show the resume as a centered A4 card */
        @media screen {
          body { background: #F4F4F5; display: flex; justify-content: center; padding: 40px 0 80px; }
        }
      `}</style>

      <div
        className="resume-print-root"
        style={{
          width: "210mm",
          minHeight: "297mm",
          background: "#fff",
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
        }}
      >
        <ResumePreview
          resume={data.resume}
          template={data.template}
          accentColor={data.accentColor}
          sectionOrder={data.sectionOrder}
          forPrint
        />
      </div>
    </>
  );
}
