import { useRef, useState } from 'react'

// ── Mebble wordmark SVG (exact paths from design) ────────────────────────────
function MebbleLogo() {
  return (
    <svg height="22" viewBox="0 0 255 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 22H12V18.823H21.333V13.75H24V22ZM21.333 13.75H12V18.823H2.666V12.375H8V2.134H21.333V13.75ZM8 2.134H2.666V12.375H0V0H8V2.134Z" fill="#FF7512" />
      <path d="M33.92 19.5V2.46H38.12L42.824 15.66L47.528 2.46H51.728V19.5H48.608V7.74L44.312 19.476H41.336L37.04 7.74V19.5H33.92ZM59.446 19.788C58.166 19.788 57.054 19.516 56.11 18.972C55.166 18.412 54.438 17.628 53.926 16.62C53.414 15.612 53.158 14.436 53.158 13.092C53.158 11.748 53.414 10.58 53.926 9.588C54.438 8.58 55.158 7.796 56.086 7.236C57.03 6.676 58.126 6.396 59.374 6.396C60.59 6.396 61.654 6.668 62.566 7.212C63.494 7.756 64.206 8.54 64.702 9.564C65.198 10.588 65.446 11.82 65.446 13.26V13.956H56.35C56.414 15.076 56.718 15.924 57.262 16.5C57.822 17.06 58.558 17.34 59.47 17.34C60.158 17.34 60.726 17.188 61.174 16.884C61.638 16.564 61.958 16.124 62.134 15.564L65.278 15.756C64.926 17.004 64.23 17.988 63.19 18.708C62.166 19.428 60.918 19.788 59.446 19.788ZM56.35 11.892H62.278C62.214 10.852 61.918 10.084 61.39 9.588C60.862 9.076 60.19 8.82 59.374 8.82C58.558 8.82 57.878 9.084 57.334 9.612C56.806 10.14 56.478 10.9 56.35 11.892ZM73.535 19.788C72.639 19.788 71.855 19.596 71.183 19.212C70.527 18.828 70.015 18.292 69.647 17.604L69.575 19.5H66.647V2.46H69.719V8.508C70.071 7.916 70.575 7.42 71.231 7.02C71.887 6.604 72.655 6.396 73.535 6.396C74.639 6.396 75.591 6.676 76.391 7.236C77.207 7.78 77.831 8.556 78.263 9.564C78.711 10.556 78.935 11.732 78.935 13.092C78.935 14.452 78.711 15.636 78.263 16.644C77.831 17.636 77.207 18.412 76.391 18.972C75.591 19.516 74.639 19.788 73.535 19.788ZM72.839 17.292C73.719 17.292 74.423 16.924 74.951 16.188C75.479 15.436 75.743 14.404 75.743 13.092C75.743 11.764 75.479 10.732 74.951 9.996C74.439 9.26 73.743 8.892 72.863 8.892C72.207 8.892 71.639 9.06 71.159 9.396C70.695 9.716 70.335 10.188 70.079 10.812C69.839 11.436 69.719 12.196 69.719 13.092C69.719 13.956 69.839 14.708 70.079 15.348C70.335 15.972 70.695 16.452 71.159 16.788C71.623 17.124 72.183 17.292 72.839 17.292ZM87.007 19.788C86.111 19.788 85.327 19.596 84.655 19.212C83.999 18.828 83.487 18.292 83.119 17.604L83.047 19.5H80.119V2.46H83.191V8.508C83.543 7.916 84.047 7.42 84.703 7.02C85.359 6.604 86.127 6.396 87.007 6.396C88.111 6.396 89.063 6.676 89.863 7.236C90.679 7.78 91.303 8.556 91.735 9.564C92.183 10.556 92.407 11.732 92.407 13.092C92.407 14.452 92.183 15.636 91.735 16.644C91.303 17.636 90.679 18.412 89.863 18.972C89.063 19.516 88.111 19.788 87.007 19.788ZM86.311 17.292C87.191 17.292 87.895 16.924 88.423 16.188C88.951 15.436 89.215 14.404 89.215 13.092C89.215 11.764 88.951 10.732 88.423 9.996C87.911 9.26 87.215 8.892 86.335 8.892C85.679 8.892 85.111 9.06 84.631 9.396C84.167 9.716 83.807 10.188 83.551 10.812C83.311 11.436 83.191 12.196 83.191 13.092C83.191 13.956 83.311 14.708 83.551 15.348C83.807 15.972 84.167 16.452 84.631 16.788C85.095 17.124 85.655 17.292 86.311 17.292ZM96.78 19.5C95.852 19.5 95.108 19.26 94.548 18.78C93.988 18.3 93.708 17.532 93.708 16.476V2.46H96.78V16.164C96.78 16.484 96.86 16.724 97.02 16.884C97.196 17.044 97.436 17.124 97.74 17.124H98.676V19.5H96.78ZM104.99 19.788C103.71 19.788 102.598 19.516 101.654 18.972C100.71 18.412 99.982 17.628 99.47 16.62C98.958 15.612 98.702 14.436 98.702 13.092C98.702 11.748 98.958 10.58 99.47 9.588C99.982 8.58 100.702 7.796 101.63 7.236C102.574 6.676 103.67 6.396 104.918 6.396C106.134 6.396 107.198 6.668 108.11 7.212C109.038 7.756 109.75 8.54 110.246 9.564C110.742 10.588 110.99 11.82 110.99 13.26V13.956H101.894C101.958 15.076 102.262 15.924 102.806 16.5C103.366 17.06 104.102 17.34 105.014 17.34C105.702 17.34 106.27 17.188 106.718 16.884C107.182 16.564 107.502 16.124 107.678 15.564L110.822 15.756C110.47 17.004 109.774 17.988 108.734 18.708C107.71 19.428 106.462 19.788 104.99 19.788ZM101.894 11.892H107.822C107.758 10.852 107.462 10.084 106.934 9.588C106.406 9.076 105.734 8.82 104.918 8.82C104.102 8.82 103.422 9.084 102.878 9.612C102.35 10.14 102.022 10.9 101.894 11.892Z" fill="#000000" />
    </svg>
  )
}

// ── Upload tray icon (exact paths from design) ────────────────────────────────
function UploadIcon() {
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="upload-clip"><rect width="120" height="120" fill="#fff" /></clipPath></defs>
      <g clipPath="url(#upload-clip)">
        <path d="M52.5 67.5H67.5V37.5H90L60 7.5L30 37.5H52.5V67.5ZM75 50.625V62.19L109.343 75L60 93.397L10.658 75L45 62.19V50.625L0 67.5V97.5L60 120L120 97.5V67.5L75 50.625Z" fill="#C8C8C8" />
      </g>
    </svg>
  )
}

// ── Sidebar feature preview card ──────────────────────────────────────────────
function FeaturePreviewCard() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Decorative icon grid */}
      <div style={{
        backgroundColor: '#DCEFFE',
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        opacity: 0.85,
      }}>
        {/* PDF icon */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="5" fill="#A8D4F5" />
          <text x="4" y="17" fontSize="8" fontWeight="700" fill="#3B82F6" fontFamily="Geist,sans-serif">PDF</text>
        </svg>
        {/* Search icon */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="7" stroke="#5BAEE8" strokeWidth="2" />
          <path d="M16.5 16.5L21 21" stroke="#5BAEE8" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {/* Tool icon */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="#5BAEE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Doc icon */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#5BAEE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#5BAEE8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* Labels */}
      <p style={{ fontSize: '11px', color: '#BABABA', fontWeight: 500, letterSpacing: '-0.01em' }}>
        · Job Description Parsing
      </p>
      <p style={{ fontSize: '13px', color: '#ABABAB', fontWeight: 600, letterSpacing: '-0.02em' }}>
        Real-time Keyword Matching
      </p>
      <p style={{ fontSize: '11px', color: '#BABABA', fontWeight: 500, letterSpacing: '-0.01em' }}>
        ·
      </p>
    </div>
  )
}

// ── Main upload screen ────────────────────────────────────────────────────────
export default function UploadScreen({ onFile, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onFile(dropped)
  }

  function handleChange(e) {
    const selected = e.target.files[0]
    if (selected) onFile(selected)
  }

  function triggerPicker() {
    inputRef.current?.click()
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: "'Geist', system-ui, sans-serif" }}>

      {/* ── Left sidebar ── */}
      <div style={{
        width: '321px',
        flexShrink: 0,
        backgroundColor: '#F9F9FB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px',
        overflow: 'hidden',
      }}>
        <MebbleLogo />
        <FeaturePreviewCard />
      </div>

      {/* ── Main content ── */}
      <div style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ width: '360px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Headline — single sentence, wraps naturally */}
          <p style={{
            fontSize: '32px',
            fontWeight: 600,
            lineHeight: '110%',
            letterSpacing: '-0.04em',
            margin: 0,
          }}>
            <span style={{ color: '#C3C3C3' }}>The </span>
            <span style={{ color: '#020202' }}>Resume</span>
            <span style={{ color: '#C3C3C3' }}> Builder That Thinks Like a </span>
            <span style={{ color: '#F46702' }}>Recruiter.</span>
          </p>

          {/* Body text */}
          <p style={{
            fontSize: '14px',
            lineHeight: '160%',
            color: '#767678',
            fontWeight: 500,
            letterSpacing: '-0.02em',
          }}>
            Your next big role starts with a resume that speaks the language of recruiters. By analyzing your experience against top-tier industry requirements, Mebble transforms your standard CV into a high-performance career asset.
          </p>

          {/* Upload area — drag-and-drop only, no click on icon */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '16px',
            }}
          >
            <input ref={inputRef} type="file" accept=".pdf" style={{ display: 'none' }} onChange={handleChange} />

            <div style={{
              padding: '20px',
              borderRadius: '16px',
              border: dragging ? '2px dashed #028FF4' : '2px dashed transparent',
              backgroundColor: dragging ? '#E4F3FE' : 'transparent',
              transition: 'all 0.15s ease',
            }}>
              <UploadIcon />
            </div>

            {error && (
              <p style={{ fontSize: '13px', color: '#EF4444', fontWeight: 500 }}>{error}</p>
            )}

            {/* Upload CV button — sole trigger for file picker */}
            <button
              onClick={triggerPicker}
              style={{
                display: 'flex',
                alignItems: 'center',
                alignSelf: 'flex-end',
                gap: '4px',
                backgroundColor: '#E4F3FE',
                border: 'none',
                borderRadius: '9999px',
                padding: '12px 14px 12px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                color: '#028FF4',
                fontFamily: 'inherit',
                letterSpacing: '-0.01em',
              }}
            >
              Upload CV
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#028FF4" />
                <path d="M8 12h8M13 8l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
