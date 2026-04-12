"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import MebbleLogo from "@/components/ui/MebbleLogo";

/* ── Keyframe animations injected once ─────────────────────────────────────── */
const STYLES = `
  @keyframes buildFloat {
    0%   { transform: translateY(0px) scale(1.15); }
    50%  { transform: translateY(-4px) scale(1.18); }
    100% { transform: translateY(0px) scale(1.15); }
  }
  @keyframes slidersWiggle {
    0%   { transform: scale(1.15) rotate(0deg); }
    25%  { transform: scale(1.15) rotate(-6deg); }
    75%  { transform: scale(1.15) rotate(6deg); }
    100% { transform: scale(1.15) rotate(0deg); }
  }
`;

/* ── Build a Resume icon ────────────────────────────────────────────────────── */
function BuildIcon({ hovered }: { hovered: boolean }) {
  const anim: React.CSSProperties = hovered
    ? { animation: "buildFloat 0.7s ease-in-out infinite" }
    : { transform: "scale(1)", transition: "transform 0.25s ease" };

  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" style={anim}>
      <rect x="4"  y="13" width="21" height="23" rx="4" fill="#028FF4" opacity="0.18" />
      <rect x="11" y="7"  width="21" height="23" rx="4" fill="#028FF4" opacity="0.5"  />
      <rect x="17" y="11" width="13" height="15" rx="3" fill="#028FF4" />
    </svg>
  );
}

/* ── Optimize Existing Resume icon — sliders ────────────────────────────────── */
function OptimizeIcon({ hovered, active }: { hovered: boolean; active: boolean }) {
  const color = active ? "#028FF4" : "#AEAEB2";
  const anim: React.CSSProperties = hovered
    ? { animation: "slidersWiggle 0.55s ease-in-out infinite" }
    : { transform: "scale(1)", transition: "transform 0.25s ease" };

  return (
    <svg width="42" height="42" viewBox="0 0 42 42" fill="none" style={anim}>
      {/* Three horizontal track lines */}
      <line x1="6"  y1="12" x2="36" y2="12" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="6"  y1="21" x2="36" y2="21" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1="6"  y1="30" x2="36" y2="30" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Slider handles */}
      <circle cx="14" cy="12" r="4.5" fill="white" stroke={color} strokeWidth="3" />
      <circle cx="26" cy="21" r="4.5" fill="white" stroke={color} strokeWidth="3" />
      <circle cx="18" cy="30" r="4.5" fill="white" stroke={color} strokeWidth="3" />
    </svg>
  );
}


/* ── Page ───────────────────────────────────────────────────────────────────── */
export default function HomePage() {
  const [hoveredBuild,    setHoveredBuild]    = useState(false);
  const [hoveredOptimize, setHoveredOptimize] = useState(false);

  const CARD_SIZE = 140; // px — same for both cards

  return (
    <>
      <style>{STYLES}</style>

      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
        }}
      >
        {/* Main content */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px",
          }}
        >
          <div style={{ width: "100%", maxWidth: "360px", display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Logo */}
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <MebbleLogo height={16} />
            </div>

            {/* Headline */}
            <p
              style={{
                fontSize: "32px",
                fontWeight: 600,
                lineHeight: "115%",
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
                fontSize: "13px",
                lineHeight: "160%",
                color: "#767678",
                fontWeight: 500,
                letterSpacing: "-0.01em",
                margin: 0,
              }}
            >
              Your next big role starts with a resume that speaks the language of recruiters. Mebble transforms your standard CV into a high-performance career asset.
            </p>

            {/* CTA Cards — side by side, fixed equal size */}
            <div style={{ display: "flex", gap: "12px" }}>

              {/* Build a Resume */}
              <Link href="/builder" style={{ textDecoration: "none", flex: 1 }}>
                <div
                  onMouseEnter={() => setHoveredBuild(true)}
                  onMouseLeave={() => setHoveredBuild(false)}
                  style={{
                    width: "100%",
                    height: `${CARD_SIZE}px`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "14px",
                    backgroundColor: "#FFFFFF",
                    border: `3px solid ${hoveredBuild ? "#0075CC" : "#028FF4"}`,
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: hoveredBuild ? "0 4px 16px rgba(2,143,244,0.18)" : "none",
                    boxSizing: "border-box",
                  }}
                >
                  <BuildIcon hovered={hoveredBuild} />
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      lineHeight: "120%",
                      color: "#767678",
                      letterSpacing: "-0.02em",
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    Build a Resume
                  </p>
                  <ArrowRight size={14} color="#028FF4" />
                </div>
              </Link>

              {/* Optimize Existing Resume */}
              <Link href="/optimize" style={{ textDecoration: "none", flex: 1 }}>
                <div
                  onMouseEnter={() => setHoveredOptimize(true)}
                  onMouseLeave={() => setHoveredOptimize(false)}
                  style={{
                    width: "100%",
                    height: `${CARD_SIZE}px`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "14px",
                    backgroundColor: "#FFFFFF",
                    border: `3px solid ${hoveredOptimize ? "#D8D8D8" : "#F1F1F1"}`,
                    borderRadius: "14px",
                    cursor: "pointer",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: hoveredOptimize ? "0 4px 16px rgba(0,0,0,0.07)" : "none",
                    boxSizing: "border-box",
                  }}
                >
                  <div style={{ position: "absolute", bottom: "10px", right: "10px" }}>
                    <ArrowRight size={14} color="#AEAEB2" />
                  </div>
                  <OptimizeIcon hovered={hoveredOptimize} active={false} />
                  <p
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      lineHeight: "120%",
                      color: "#767678",
                      letterSpacing: "-0.02em",
                      margin: 0,
                      textAlign: "center",
                    }}
                  >
                    Optimize Existing<br />Resume
                  </p>
                  <ArrowRight size={14} color="#AEAEB2" />
                </div>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
