"use client";

import { useEffect, useRef, useState } from "react";
import ResumePreview from "@/components/builder/ResumePreview";
import MebbleSpinner from "@/components/ui/MebbleSpinner";
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
  const [isMobile, setIsMobile] = useState(false);
  const [pdfState, setPdfState] = useState<"idle" | "generating" | "done" | "error">("idle");
  const resumeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768);
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

  // Desktop: auto-trigger print and close the tab after the dialog is dismissed.
  // Mobile: skip — afterprint fires immediately on mobile before the user can save.
  useEffect(() => {
    if (!data || isMobile) return;

    function handleAfterPrint() {
      window.close();
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
  }, [data, isMobile]);

  // Mobile: auto-generate PDF once resume is rendered
  useEffect(() => {
    if (!data || !isMobile || pdfState !== "idle") return;

    // Wait for fonts / layout to settle before capturing
    const t = setTimeout(() => generatePdf(), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isMobile]);

  async function generatePdf() {
    if (!resumeRef.current) return;
    setPdfState("generating");
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const el = resumeRef.current;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        width: el.scrollWidth,
        height: el.scrollHeight,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });

      // A4 dimensions in mm
      const A4_W = 210;
      const A4_H = 297;

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

      const imgW = A4_W;
      const imgH = (canvas.height * A4_W) / canvas.width;

      // Only add another page if there's more than 2mm of content remaining
      // (prevents a near-empty second page from floating-point rounding)
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      let y = 0;
      while (y < imgH - 2) {
        if (y > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, -y, imgW, imgH);
        y += A4_H;
      }

      const name = data?.resume?.personalInfo?.name?.trim().replace(/\s+/g, "_") || "resume";
      pdf.save(`${name}_resume.pdf`);
      setPdfState("done");
    } catch {
      setPdfState("error");
    }
  }

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

  const FONT = "system-ui, sans-serif";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #fff; }
        @page {
          size: A4;
          margin-top: 14mm;
          margin-right: 0;
          margin-bottom: 0;
          margin-left: 0;
        }
        @page :first {
          margin-top: 0;
        }
        @media print {
          html, body { margin: 0; padding: 0; width: 210mm; }
          .resume-print-root { box-shadow: none !important; page-break-inside: avoid; }
          /* Hide Vercel-injected toolbar and any other injected UI */
          vercel-live-feedback,
          #__vercel-toolbar-wrapper,
          #vercel-live-feedback,
          nextjs-portal,
          [data-vercel-toolbar] { display: none !important; }
          /* Force backgrounds to print */
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

      {/* Mobile status banner — fixed, no effect on print/PDF layout */}
      {isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            backgroundColor: pdfState === "error" ? "#EF4444" : "#028FF4",
            color: "#fff",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            fontFamily: FONT,
            fontSize: "13px",
            fontWeight: 500,
            lineHeight: "1.4",
            zIndex: 999,
          }}
        >
          {pdfState === "generating" && (
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MebbleSpinner size={16} style={{ filter: "brightness(0) invert(1)" }} />
              Generating PDF…
            </span>
          )}
          {pdfState === "done" && (
            <span>PDF downloaded! You can close this tab.</span>
          )}
          {pdfState === "error" && (
            <>
              <span>PDF generation failed.</span>
              <button
                onClick={() => { setPdfState("idle"); generatePdf(); }}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                Retry
              </button>
            </>
          )}
          {pdfState === "idle" && (
            <span>Preparing your resume…</span>
          )}
          <button
            onClick={() => window.history.back()}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "8px",
              color: "#fff",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            ← Back
          </button>
        </div>
      )}

      <div
        ref={resumeRef}
        className="resume-print-root"
        style={{
          width: "210mm",
          minHeight: "297mm",
          background: "#fff",
          boxShadow: "0 4px 32px rgba(0,0,0,0.10)",
          marginTop: isMobile ? "56px" : undefined,
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
