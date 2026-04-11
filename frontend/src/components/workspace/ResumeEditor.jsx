import { useState, useRef, useEffect } from 'react'
import { optimizeSection } from '../../services/api'

// ── Mebble mark icon ──────────────────────────────────────────────────────────
function MebbleMark({ size = 13 }) {
  return (
    <svg height={size} viewBox="0 0 24 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M24 22H12V18.823H21.333V13.75H24V22ZM21.333 13.75H12V18.823H2.666V12.375H8V2.134H21.333V13.75ZM8 2.134H2.666V12.375H0V0H8V2.134Z"
        fill="#FF7512"
      />
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
        border: 'none', outline: 'none', resize: 'none', overflow: 'hidden',
        backgroundColor: 'transparent', width: '100%',
        fontFamily: "'Geist', system-ui, sans-serif",
        whiteSpace: 'pre-wrap',
        ...style,
      }}
    />
  )
}

// ── Contact row ───────────────────────────────────────────────────────────────
function ContactRow({ raw }) {
  if (!raw) return null
  let items = raw.split(/\s*\|\s*/).map(s => s.trim()).filter(Boolean)
  if (items.length === 1) items = raw.split(/\s{2,}/).map(s => s.trim()).filter(Boolean)
  const expanded = []
  for (const item of items) {
    expanded.push(...item.split(/\s*[·•]\s*/).map(s => s.trim()).filter(Boolean))
  }
  const isLink = (s) => /linkedin|portfolio|github|http|www\.|\.com|\.io/i.test(s)
  return (
    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px' }}>
      {expanded.map((item, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{
            fontSize: '13px', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.6,
            color: isLink(item) ? '#FF5F5E' : '#767678',
          }}>
            {item}
          </span>
          {i < expanded.length - 1 && (
            <span style={{ fontSize: '13px', color: '#D0D0D0', fontWeight: 400, flexShrink: 0 }}>|</span>
          )}
        </span>
      ))}
    </div>
  )
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
function Skeleton({ width = '100%', height = 14, style: s = {} }) {
  return (
    <div style={{
      width, height, backgroundColor: '#F0F0F0', borderRadius: '4px',
      animation: 'pulse 1.5s ease-in-out infinite', ...s,
    }} />
  )
}

// ── Utilities ─────────────────────────────────────────────────────────────────

/** Words added in newText that weren't present in oldText (3+ char words only). */
function findAddedWords(oldText, newText) {
  const oldSet = new Set((oldText.toLowerCase().match(/\b[a-z]{3,}\b/g) || []))
  return new Set(
    (newText.toLowerCase().match(/\b[a-z]{3,}\b/g) || []).filter(w => !oldSet.has(w))
  )
}

// ── Text renderer with shimmer on specific words ──────────────────────────────
function ShimmerText({ text, shimmerWords, textStyle }) {
  // Split into [non-word, word, non-word, ...] tokens
  const tokens = text.split(/(\b[a-zA-Z'-]{3,}\b)/)
  return (
    <span style={{ whiteSpace: 'pre-wrap', ...textStyle }}>
      {tokens.map((token, i) => {
        if (shimmerWords.has(token.toLowerCase())) {
          return (
            <span
              key={i}
              style={{
                animation: `word-shimmer 2.2s ease-in-out infinite`,
                animationDelay: `${(i % 6) * 0.18}s`,
                fontWeight: 600,
              }}
            >
              {token}
            </span>
          )
        }
        return token
      })}
    </span>
  )
}

// ── Glitter overlay (rendered on top of content during optimization) ──────────
function GlitterOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        borderRadius: '8px',
        background: [
          'linear-gradient(',
          '  100deg,',
          '  transparent 20%,',
          '  rgba(255, 220, 100, 0.25) 38%,',
          '  rgba(255, 255, 220, 0.55) 50%,',
          '  rgba(255, 183, 71,  0.30) 62%,',
          '  transparent 80%',
          ')',
        ].join(''),
        backgroundSize: '300% 100%',
        animation: 'glitter-sweep 1.4s linear infinite',
        pointerEvents: 'none',
        zIndex: 2,
      }}
    />
  )
}

// ── Optimize button ───────────────────────────────────────────────────────────
function OptimizeBtn({ onClick, disabled, state }) {
  // state: 'idle' | 'loading'
  const label = state === 'loading' ? 'Optimizing…' : 'Optimize'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        backgroundColor: '#FFF0E6',
        border: '1px solid #FFD4B0',
        borderRadius: '9999px',
        padding: '4px 10px 4px 8px',
        cursor: disabled ? 'wait' : 'pointer',
        fontSize: '12px', fontWeight: 600, color: '#FF7512',
        fontFamily: "'Geist', system-ui, sans-serif",
        letterSpacing: '-0.01em',
        flexShrink: 0,
        transition: 'opacity 0.15s ease',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <MebbleMark size={12} />
      <span>{label}</span>
    </button>
  )
}

// ── Single job entry inside the Experience section ────────────────────────────
function JobEntry({ entry, index, result, onEntryChange, externalShimmer }) {
  const [text, setText] = useState(entry)
  const [optimizing, setOptimizing] = useState(false)
  const [shimmerWords, setShimmerWords] = useState(null)   // Set<string> | null
  const [isEditing, setIsEditing] = useState(false)

  // Sync when parent re-parses (new file)
  useEffect(() => { setText(entry) }, [entry])

  // Apply bulk "Add All" shimmer from parent
  useEffect(() => {
    if (!externalShimmer) return
    setText(externalShimmer.text)
    setShimmerWords(externalShimmer.shimmerWords)
    setIsEditing(false)
    setOptimizing(false)
  }, [externalShimmer])

  // Highlight only if THIS entry's text contains a weak action word from the analysis
  const actionSuggestions = result?.action_words_analysis?.suggestions || []
  const needsHighlight = !shimmerWords && actionSuggestions.some(({ current }) =>
    new RegExp(`\\b${current}\\b`, 'i').test(text)
  )

  async function handleOptimize() {
    if (optimizing || !result) return
    setOptimizing(true)
    try {
      const res = await optimizeSection({
        sectionType: 'experience',
        content: text,
        missingKeywords: result.missing_keywords || [],
        domain: result.domain || 'general',
      })
      if (res.success) {
        // Prefer shimmer-ing the specific suggested verbs that landed in the new text
        const suggestedVerbs = new Set(actionSuggestions.map(s => s.suggested.toLowerCase()))
        const oldWords = new Set((text.toLowerCase().match(/\b[a-z]{3,}\b/g) || []))
        const verbShimmer = new Set(
          (res.optimized.toLowerCase().match(/\b[a-z]{3,}\b/g) || [])
            .filter(w => suggestedVerbs.has(w) && !oldWords.has(w))
        )
        // Fall back to any new word if the optimizer used different replacements
        const shimmer = verbShimmer.size > 0 ? verbShimmer : findAddedWords(text, res.optimized)
        setText(res.optimized)
        onEntryChange(index, res.optimized)
        setShimmerWords(shimmer)
        setIsEditing(false)
      }
    } catch { /* silently fail */ }
    finally { setOptimizing(false) }
  }

  function handleChange(e) {
    setText(e.target.value)
    onEntryChange(index, e.target.value)
    // If user edits after optimization, clear shimmer
    if (shimmerWords) setShimmerWords(null)
  }

  const baseTextStyle = {
    fontSize: '13px', fontWeight: 500,
    letterSpacing: '-0.02em', lineHeight: 1.6,
    color: '#767678',
    fontFamily: "'Geist', system-ui, sans-serif",
  }

  return (
    <div style={{
      position: 'relative',
      borderRadius: '8px',
      padding: needsHighlight || optimizing ? '10px 12px' : '0',
      backgroundColor: needsHighlight
        ? 'rgba(246, 123, 34, 0.08)'
        : optimizing ? 'rgba(246, 123, 34, 0.05)' : 'transparent',
      transition: 'background-color 0.3s ease, padding 0.3s ease',
    }}>

      {/* Glitter overlay during optimization */}
      {optimizing && <GlitterOverlay />}

      {/* Entry content — shimmer text OR editable textarea */}
      {shimmerWords && !isEditing ? (
        <div>
          <ShimmerText text={text} shimmerWords={shimmerWords} textStyle={baseTextStyle} />
          <button
            onClick={() => setIsEditing(true)}
            style={{
              marginTop: '6px', display: 'block',
              fontSize: '11px', fontWeight: 500, color: '#A0A0A0',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, fontFamily: 'inherit', letterSpacing: '-0.01em',
            }}
          >
            ✎ Edit
          </button>
        </div>
      ) : (
        <AutoTextarea value={text} onChange={handleChange} style={baseTextStyle} />
      )}

      {/* Optimize button — only when highlight is active */}
      {needsHighlight && !optimizing && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <OptimizeBtn onClick={handleOptimize} disabled={optimizing} state="idle" />
        </div>
      )}
      {optimizing && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', position: 'relative', zIndex: 3 }}>
          <OptimizeBtn onClick={() => {}} disabled state="loading" />
        </div>
      )}
    </div>
  )
}

// ── Experience section — renders each job entry separately ───────────────────
function ExperienceSection({ section, result, onContentChange, externalShimmer }) {
  // entries are \n\n-separated blocks
  const [entries, setEntries] = useState(() => section.content.split(/\n\n+/).filter(e => e.trim()))
  // Per-entry shimmer objects set when "Add All" fires: [{text, shimmerWords}, ...]
  const [entryShimmers, setEntryShimmers] = useState([])

  useEffect(() => {
    setEntries(section.content.split(/\n\n+/).filter(e => e.trim()))
  }, [section.content])

  // Apply bulk "Add All" shimmer — split the optimized full text back into entries
  useEffect(() => {
    if (!externalShimmer) { setEntryShimmers([]); return }
    const newEntries = externalShimmer.text.split(/\n\n+/).filter(e => e.trim())
    setEntries(newEntries)
    setEntryShimmers(newEntries.map(text => ({
      text,
      shimmerWords: externalShimmer.shimmerWords,
    })))
  }, [externalShimmer])

  function handleEntryChange(index, newText) {
    const updated = [...entries]
    updated[index] = newText
    setEntries(updated)
    onContentChange(section.id, updated.join('\n\n'))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Section heading */}
      <span style={{
        fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em',
        lineHeight: 1.6, color: '#1F1F1F',
      }}>
        {section.heading}
      </span>
      <div style={{ height: '1px', backgroundColor: '#EBEBEB' }} />

      {/* Individual job entries */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {entries.map((entry, i) => (
          <JobEntry
            key={i}
            entry={entry}
            index={i}
            result={result}
            onEntryChange={handleEntryChange}
            externalShimmer={entryShimmers[i] || null}
          />
        ))}
      </div>
    </div>
  )
}

// ── Generic section (summary, education, skills, etc.) ───────────────────────
function ResumeSection({ section, result, onContentChange, externalShimmer }) {
  const [content, setContent] = useState(section.content)
  const [optimizing, setOptimizing] = useState(false)
  const [shimmerWords, setShimmerWords] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => { setContent(section.content) }, [section.content])

  // Apply bulk "Add All" shimmer from parent
  useEffect(() => {
    if (!externalShimmer) return
    setContent(externalShimmer.text)
    setShimmerWords(externalShimmer.shimmerWords)
    setIsEditing(false)
  }, [externalShimmer])

  const needsOptimization = section.optimizable && result?.missing_keywords?.length > 0 && !shimmerWords

  async function handleOptimize() {
    if (optimizing || !result) return
    setOptimizing(true)
    try {
      const res = await optimizeSection({
        sectionType: section.type,
        content,
        missingKeywords: result.missing_keywords || [],
        domain: result.domain || 'general',
      })
      if (res.success) {
        const added = findAddedWords(content, res.optimized)
        setContent(res.optimized)
        onContentChange(section.id, res.optimized)
        setShimmerWords(added)
        setIsEditing(false)
      }
    } catch { /* silently fail */ }
    finally { setOptimizing(false) }
  }

  function handleChange(e) {
    setContent(e.target.value)
    onContentChange(section.id, e.target.value)
    if (shimmerWords) setShimmerWords(null)
  }

  const baseTextStyle = {
    fontSize: '13px', fontWeight: 500,
    letterSpacing: '-0.02em', lineHeight: 1.6, color: '#767678',
    fontFamily: "'Geist', system-ui, sans-serif",
  }

  return (
    <div style={{
      position: 'relative',
      display: 'flex', flexDirection: 'column', gap: '12px',
      padding: (needsOptimization || optimizing) ? '10px 12px' : '0',
      borderRadius: '8px',
      backgroundColor: needsOptimization
        ? 'rgba(246, 123, 34, 0.08)'
        : optimizing ? 'rgba(246, 123, 34, 0.05)' : 'transparent',
      transition: 'background-color 0.3s ease, padding 0.3s ease',
    }}>

      {optimizing && <GlitterOverlay />}

      {/* Heading row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.6, color: '#1F1F1F' }}>
          {section.heading}
        </span>
        {needsOptimization && !optimizing && (
          <OptimizeBtn onClick={handleOptimize} disabled={false} state="idle" />
        )}
        {optimizing && (
          <div style={{ position: 'relative', zIndex: 3 }}>
            <OptimizeBtn onClick={() => {}} disabled state="loading" />
          </div>
        )}
      </div>

      <div style={{ height: '1px', backgroundColor: '#EBEBEB' }} />

      {/* Content — shimmer display or textarea */}
      {shimmerWords && !isEditing ? (
        <div>
          <ShimmerText text={content} shimmerWords={shimmerWords} textStyle={baseTextStyle} />
          <button
            onClick={() => setIsEditing(true)}
            style={{
              marginTop: '6px', display: 'block',
              fontSize: '11px', fontWeight: 500, color: '#A0A0A0',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 0, fontFamily: 'inherit', letterSpacing: '-0.01em',
            }}
          >
            ✎ Edit
          </button>
        </div>
      ) : (
        <AutoTextarea value={content} onChange={handleChange} style={baseTextStyle} />
      )}
    </div>
  )
}

// ── Main ResumeEditor ─────────────────────────────────────────────────────────
export default function ResumeEditor({ sections, loading, error, result, onSectionChange, sectionShimmer = {} }) {
  if (loading) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Skeleton width="40%" height={18} />
        <Skeleton width="70%" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          <Skeleton width="30%" height={14} />
          <Skeleton /><Skeleton /><Skeleton width="80%" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
          <Skeleton width="35%" height={14} />
          <Skeleton /><Skeleton /><Skeleton width="70%" />
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
      height: '100%', overflowY: 'auto', padding: '32px',
      display: 'flex', flexDirection: 'column', gap: '24px',
      fontFamily: "'Geist', system-ui, sans-serif",
    }}>
      {/* Header: name + contact */}
      {header && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <span style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.6, color: '#1F1F1F' }}>
            {header.name}
          </span>
          <ContactRow raw={header.content} />
        </div>
      )}

      {/* Body sections */}
      {bodySections.map(section =>
        section.type === 'experience' ? (
          <ExperienceSection
            key={section.id}
            section={section}
            result={result}
            onContentChange={onSectionChange}
            externalShimmer={sectionShimmer[section.id] || null}
          />
        ) : (
          <ResumeSection
            key={section.id}
            section={section}
            result={result}
            onContentChange={onSectionChange}
            externalShimmer={sectionShimmer[section.id] || null}
          />
        )
      )}
    </div>
  )
}
