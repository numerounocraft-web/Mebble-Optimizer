import { useState, useRef, useEffect } from 'react'
import { optimizeSection } from '../../services/api'

// ── Mebble mark icon (geometric mark only, no wordmark text) ─────────────────
function MebbleMark({ size = 14 }) {
  return (
    <svg height={size} viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 22H12V18.823H21.333V13.75H24V22ZM21.333 13.75H12V18.823H2.666V12.375H8V2.134H21.333V13.75ZM8 2.134H2.666V12.375H0V0H8V2.134Z"
        fill="#FF7512"
      />
    </svg>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none"
      style={{ animation: 'spin 0.8s linear infinite', display: 'block' }}
    >
      <circle cx="12" cy="12" r="10" stroke="#FF7512" strokeWidth="2.5"
        strokeDasharray="44 16" strokeLinecap="round" />
    </svg>
  )
}

// ── Auto-resize textarea ──────────────────────────────────────────────────────
function AutoTextarea({ value, onChange, style }) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={onChange}
      rows={1}
      style={{
        border: 'none',
        outline: 'none',
        resize: 'none',
        overflow: 'hidden',
        backgroundColor: 'transparent',
        width: '100%',
        fontFamily: "'Geist', system-ui, sans-serif",
        ...style,
      }}
    />
  )
}

// ── Contact row — parse pipe-separated or spaced contact details ──────────────
function ContactRow({ raw }) {
  if (!raw) return null

  // Split by | or common separators
  const parts = raw.split(/\s*[\|]\s*/).map(s => s.trim()).filter(Boolean)
  // If no pipes found, try splitting by email/phone patterns
  const items = parts.length > 1
    ? parts
    : raw.split(/\s{2,}/).map(s => s.trim()).filter(Boolean)

  const linkStyle = {
    fontSize: '13px', fontWeight: 500, letterSpacing: '-0.02em',
    color: '#FF5F5E', textDecoration: 'none', lineHeight: '160%',
  }
  const textStyle = {
    fontSize: '13px', fontWeight: 500, letterSpacing: '-0.02em',
    color: '#767678', lineHeight: '160%',
  }
  const sepStyle = {
    fontSize: '13px', color: '#D0D0D0', fontWeight: 400,
  }

  const isLink = (s) => /linkedin|portfolio|github|http|www\./i.test(s)

  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isLink(item) ? (
            <span style={linkStyle}>{item}</span>
          ) : (
            <span style={textStyle}>{item}</span>
          )}
          {i < items.length - 1 && <span style={sepStyle}>|</span>}
        </span>
      ))}
    </div>
  )
}

// ── Individual resume section ─────────────────────────────────────────────────
function ResumeSection({ section, result, onContentChange }) {
  const [content, setContent] = useState(section.content)
  const [optimizing, setOptimizing] = useState(false)
  const [justOptimized, setJustOptimized] = useState(false)

  // Sync if parent updates (e.g. fresh parse)
  useEffect(() => {
    setContent(section.content)
  }, [section.content])

  const needsOptimization =
    section.optimizable &&
    result &&
    result.missing_keywords?.length > 0

  async function handleOptimize() {
    if (optimizing || !result) return
    setOptimizing(true)
    setJustOptimized(false)
    try {
      const res = await optimizeSection({
        sectionType: section.type,
        content,
        missingKeywords: result.missing_keywords || [],
        domain: result.domain || 'general',
      })
      if (res.success) {
        setContent(res.optimized)
        onContentChange(section.id, res.optimized)
        setJustOptimized(true)
        setTimeout(() => setJustOptimized(false), 3000)
      }
    } catch {
      // silently fail
    } finally {
      setOptimizing(false)
    }
  }

  function handleChange(e) {
    setContent(e.target.value)
    onContentChange(section.id, e.target.value)
  }

  const highlightBg = 'rgba(246, 123, 34, 0.08)'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: needsOptimization ? '12px' : '0',
        borderRadius: needsOptimization ? '8px' : '0',
        backgroundColor: needsOptimization ? highlightBg : 'transparent',
        transition: 'background-color 0.25s ease, padding 0.25s ease',
        position: 'relative',
      }}
    >
      {/* Section heading row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em',
          lineHeight: '160%', color: '#1F1F1F',
        }}>
          {section.heading}
        </span>

        {/* Optimize button — shown when section needs optimization */}
        {needsOptimization && (
          <button
            onClick={handleOptimize}
            disabled={optimizing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: optimizing ? '#FFF0E6' : (justOptimized ? '#ECFDF5' : '#FFF0E6'),
              border: `1px solid ${optimizing ? '#FFD4B0' : (justOptimized ? '#D1FAE5' : '#FFD4B0')}`,
              borderRadius: '9999px',
              padding: '5px 10px 5px 8px',
              cursor: optimizing ? 'wait' : 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              color: optimizing ? '#FF7512' : (justOptimized ? '#059669' : '#FF7512'),
              fontFamily: "'Geist', system-ui, sans-serif",
              letterSpacing: '-0.01em',
              transition: 'all 0.2s ease',
              flexShrink: 0,
            }}
          >
            {optimizing ? <Spinner /> : <MebbleMark size={13} />}
            <span>
              {optimizing ? 'Optimizing…' : justOptimized ? 'Optimized ✓' : 'Optimize'}
            </span>
          </button>
        )}
      </div>

      {/* Divider line under heading */}
      <div style={{ height: '1px', backgroundColor: '#EBEBEB' }} />

      {/* Editable section content */}
      <AutoTextarea
        value={content}
        onChange={handleChange}
        style={{
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '-0.02em',
          lineHeight: '160%',
          color: '#767678',
        }}
      />
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ width = '100%', height = 16, style = {} }) {
  return (
    <div style={{
      width, height,
      backgroundColor: '#F0F0F0',
      borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  )
}

// ── Main ResumeEditor component ───────────────────────────────────────────────
export default function ResumeEditor({ sections, loading, error, result, onSectionChange }) {
  if (loading) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Skeleton width="40%" height={18} />
        <Skeleton width="70%" height={14} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <Skeleton width="30%" height={14} />
          <Skeleton height={13} />
          <Skeleton height={13} />
          <Skeleton width="85%" height={13} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          <Skeleton width="35%" height={14} />
          <Skeleton height={13} />
          <Skeleton height={13} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '32px' }}>
        <p style={{ fontSize: '13px', color: '#EF4444', fontWeight: 500 }}>{error}</p>
      </div>
    )
  }

  if (!sections || sections.length === 0) {
    return (
      <div style={{ padding: '32px' }}>
        <p style={{ fontSize: '13px', color: '#A0A0A0', fontWeight: 500 }}>No resume content found.</p>
      </div>
    )
  }

  const header = sections.find(s => s.type === 'header')
  const bodySections = sections.filter(s => s.type !== 'header')

  return (
    <div style={{
      height: '100%',
      overflowY: 'auto',
      padding: '32px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      fontFamily: "'Geist', system-ui, sans-serif",
    }}>
      {/* Header block */}
      {header && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{
            fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em',
            lineHeight: '160%', color: '#1F1F1F',
          }}>
            {header.name}
          </span>
          <ContactRow raw={header.content} />
        </div>
      )}

      {/* Body sections */}
      {bodySections.map(section => (
        <ResumeSection
          key={section.id}
          section={section}
          result={result}
          onContentChange={onSectionChange}
        />
      ))}
    </div>
  )
}
