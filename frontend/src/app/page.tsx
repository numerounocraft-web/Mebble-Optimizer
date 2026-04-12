import Link from "next/link";
import { FileText, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import MebbleLogo from "@/components/ui/MebbleLogo";

function FeaturePreviewCard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div
        style={{
          backgroundColor: "#DCEFFE",
          borderRadius: "12px",
          padding: "16px",
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          opacity: 0.85,
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="5" fill="#A8D4F5" />
          <text x="4" y="17" fontSize="8" fontWeight="700" fill="#3B82F6" fontFamily="Geist,sans-serif">PDF</text>
        </svg>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#5BAEE8" strokeWidth="2" />
          <path d="M16.5 16.5L21 21" stroke="#5BAEE8" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="#5BAEE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#5BAEE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#5BAEE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p style={{ fontSize: "11px", color: "#BABABA", fontWeight: 500, letterSpacing: "-0.01em" }}>
        · Job Description Parsing
      </p>
      <p style={{ fontSize: "13px", color: "#ABABAB", fontWeight: 600, letterSpacing: "-0.02em" }}>
        Real-time Keyword Matching
      </p>
      <p style={{ fontSize: "11px", color: "#BABABA", fontWeight: 500, letterSpacing: "-0.01em" }}>
        · ATS Score Analysis
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "321px",
          flexShrink: 0,
          backgroundColor: "#F9F9FB",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "32px",
          overflow: "hidden",
        }}
      >
        <MebbleLogo />
        <FeaturePreviewCard />
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "380px", display: "flex", flexDirection: "column", gap: "40px" }}>

          {/* Headline */}
          <p
            style={{
              fontSize: "32px",
              fontWeight: 600,
              lineHeight: "110%",
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            <span style={{ color: "#C3C3C3" }}>The </span>
            <span style={{ color: "#020202" }}>Resume</span>
            <span style={{ color: "#C3C3C3" }}> Builder That Thinks Like a </span>
            <span style={{ color: "#F46702" }}>Recruiter.</span>
          </p>

          {/* Body */}
          <p
            style={{
              fontSize: "14px",
              lineHeight: "160%",
              color: "#767678",
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            Build your resume from scratch, then instantly optimize it against any job description. Mebble combines a smart builder with ATS analysis so your CV speaks the language of recruiters.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

            {/* Build Resume — primary */}
            <Link href="/builder" style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#FF7512",
                  borderRadius: "16px",
                  padding: "20px",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: "rgba(255,255,255,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <FileText size={18} color="#fff" />
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>
                      Build a Resume
                    </p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>
                      Start from scratch with guided sections
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} color="rgba(255,255,255,0.8)" />
              </div>
            </Link>

            {/* Optimize Resume — secondary */}
            <Link href="/optimize" style={{ textDecoration: "none" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "#F9F9FB",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid #F1F1F1",
                  cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      backgroundColor: "#E4F3FE",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Sparkles size={18} color="#028FF4" />
                  </div>
                  <div>
                    <p style={{ fontSize: "14px", fontWeight: 600, color: "#020202", letterSpacing: "-0.02em", margin: 0 }}>
                      Optimize Existing Resume
                    </p>
                    <p style={{ fontSize: "12px", color: "#767678", fontWeight: 500, letterSpacing: "-0.01em", margin: 0 }}>
                      Upload a PDF and get an ATS score
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} color="#C3C3C3" />
              </div>
            </Link>
          </div>

          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle size={13} color="#01B747" />
            <span style={{ fontSize: "12px", color: "#767678", fontWeight: 500, letterSpacing: "-0.01em" }}>
              ATS-ready · Keyword matched · Export to PDF
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
