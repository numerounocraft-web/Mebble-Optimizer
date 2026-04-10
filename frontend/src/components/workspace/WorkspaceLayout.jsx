import { useState } from 'react'
import ResumeEditor from './ResumeEditor'
import { validateJobDescription } from '../../utils/validators'
import { downloadReport } from '../../services/api'
import { useResumeParser } from '../../hooks/useResumeParser'

// ── Mebble wordmark (reused from upload screen) ───────────────────────────────
function MebbleLogo() {
  return (
    <svg height="22" viewBox="0 0 255 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 22H12V18.823H21.333V13.75H24V22ZM21.333 13.75H12V18.823H2.666V12.375H8V2.134H21.333V13.75ZM8 2.134H2.666V12.375H0V0H8V2.134Z" fill="#FF7512" />
      <path d="M33.92 19.5V2.46H38.12L42.824 15.66L47.528 2.46H51.728V19.5H48.608V7.74L44.312 19.476H41.336L37.04 7.74V19.5H33.92ZM59.446 19.788C58.166 19.788 57.054 19.516 56.11 18.972C55.166 18.412 54.438 17.628 53.926 16.62C53.414 15.612 53.158 14.436 53.158 13.092C53.158 11.748 53.414 10.58 53.926 9.588C54.438 8.58 55.158 7.796 56.086 7.236C57.03 6.676 58.126 6.396 59.374 6.396C60.59 6.396 61.654 6.668 62.566 7.212C63.494 7.756 64.206 8.54 64.702 9.564C65.198 10.588 65.446 11.82 65.446 13.26V13.956H56.35C56.414 15.076 56.718 15.924 57.262 16.5C57.822 17.06 58.558 17.34 59.47 17.34C60.158 17.34 60.726 17.188 61.174 16.884C61.638 16.564 61.958 16.124 62.134 15.564L65.278 15.756C64.926 17.004 64.23 17.988 63.19 18.708C62.166 19.428 60.918 19.788 59.446 19.788ZM56.35 11.892H62.278C62.214 10.852 61.918 10.084 61.39 9.588C60.862 9.076 60.19 8.82 59.374 8.82C58.558 8.82 57.878 9.084 57.334 9.612C56.806 10.14 56.478 10.9 56.35 11.892ZM73.535 19.788C72.639 19.788 71.855 19.596 71.183 19.212C70.527 18.828 70.015 18.292 69.647 17.604L69.575 19.5H66.647V2.46H69.719V8.508C70.071 7.916 70.575 7.42 71.231 7.02C71.887 6.604 72.655 6.396 73.535 6.396C74.639 6.396 75.591 6.676 76.391 7.236C77.207 7.78 77.831 8.556 78.263 9.564C78.711 10.556 78.935 11.732 78.935 13.092C78.935 14.452 78.711 15.636 78.263 16.644C77.831 17.636 77.207 18.412 76.391 18.972C75.591 19.516 74.639 19.788 73.535 19.788ZM72.839 17.292C73.719 17.292 74.423 16.924 74.951 16.188C75.479 15.436 75.743 14.404 75.743 13.092C75.743 11.764 75.479 10.732 74.951 9.996C74.439 9.26 73.743 8.892 72.863 8.892C72.207 8.892 71.639 9.06 71.159 9.396C70.695 9.716 70.335 10.188 70.079 10.812C69.839 11.436 69.719 12.196 69.719 13.092C69.719 13.956 69.839 14.708 70.079 15.348C70.335 15.972 70.695 16.452 71.159 16.788C71.623 17.124 72.183 17.292 72.839 17.292ZM87.007 19.788C86.111 19.788 85.327 19.596 84.655 19.212C83.999 18.828 83.487 18.292 83.119 17.604L83.047 19.5H80.119V2.46H83.191V8.508C83.543 7.916 84.047 7.42 84.703 7.02C85.359 6.604 86.127 6.396 87.007 6.396C88.111 6.396 89.063 6.676 89.863 7.236C90.679 7.78 91.303 8.556 91.735 9.564C92.183 10.556 92.407 11.732 92.407 13.092C92.407 14.452 92.183 15.636 91.735 16.644C91.303 17.636 90.679 18.412 89.863 18.972C89.063 19.516 88.111 19.788 87.007 19.788ZM86.311 17.292C87.191 17.292 87.895 16.924 88.423 16.188C88.951 15.436 89.215 14.404 89.215 13.092C89.215 11.764 88.951 10.732 88.423 9.996C87.911 9.26 87.215 8.892 86.335 8.892C85.679 8.892 85.111 9.06 84.631 9.396C84.167 9.716 83.807 10.188 83.551 10.812C83.311 11.436 83.191 12.196 83.191 13.092C83.191 13.956 83.311 14.708 83.551 15.348C83.807 15.972 84.167 16.452 84.631 16.788C85.095 17.124 85.655 17.292 86.311 17.292ZM96.78 19.5C95.852 19.5 95.108 19.26 94.548 18.78C93.988 18.3 93.708 17.532 93.708 16.476V2.46H96.78V16.164C96.78 16.484 96.86 16.724 97.02 16.884C97.196 17.044 97.436 17.124 97.74 17.124H98.676V19.5H96.78ZM104.99 19.788C103.71 19.788 102.598 19.516 101.654 18.972C100.71 18.412 99.982 17.628 99.47 16.62C98.958 15.612 98.702 14.436 98.702 13.092C98.702 11.748 98.958 10.58 99.47 9.588C99.982 8.58 100.702 7.796 101.63 7.236C102.574 6.676 103.67 6.396 104.918 6.396C106.134 6.396 107.198 6.668 108.11 7.212C109.038 7.756 109.75 8.54 110.246 9.564C110.742 10.588 110.99 11.82 110.99 13.26V13.956H101.894C101.958 15.076 102.262 15.924 102.806 16.5C103.366 17.06 104.102 17.34 105.014 17.34C105.702 17.34 106.27 17.188 106.718 16.884C107.182 16.564 107.502 16.124 107.678 15.564L110.822 15.756C110.47 17.004 109.774 17.988 108.734 18.708C107.71 19.428 106.462 19.788 104.99 19.788ZM101.894 11.892H107.822C107.758 10.852 107.462 10.084 106.934 9.588C106.406 9.076 105.734 8.82 104.918 8.82C104.102 8.82 103.422 9.084 102.878 9.612C102.35 10.14 102.022 10.9 101.894 11.892Z" fill="#000000" />
    </svg>
  )
}

// ── Placeholder icons for right-panel cards ───────────────────────────────────
function SummaryPlaceholder() {
  return (
    <svg width="121" height="121" viewBox="0 0 121 121" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M86.346 91.194C86.346 92.885 85.81 94.534 84.814 95.902L79.863 102.703C79.469 103.244 78.841 103.563 78.172 103.563C76.648 103.563 75.636 101.986 76.271 100.601L77.69 97.504C78.369 96.022 77.286 94.335 75.656 94.335C74.42 94.335 73.419 93.334 73.419 92.098V88.184C73.419 84.786 76.173 82.032 79.57 82.032H79.882C83.452 82.032 86.346 84.926 86.346 88.496V91.194ZM103.563 91.194C103.563 92.885 103.026 94.534 102.03 95.902L97.079 102.704C96.686 103.244 96.058 103.563 95.389 103.563C93.867 103.563 92.856 101.988 93.49 100.604L94.911 97.502C95.59 96.021 94.508 94.335 92.879 94.335C91.645 94.335 90.644 93.334 90.644 92.1V88.184C90.644 84.786 93.398 82.032 96.795 82.032H97.103C100.671 82.032 103.563 84.924 103.563 88.492V91.194ZM64.806 90.645C64.806 93.023 62.878 94.951 60.5 94.951H21.744C19.366 94.951 17.438 93.023 17.438 90.645C17.438 88.266 19.366 86.338 21.744 86.338H60.5C62.878 86.338 64.806 88.266 64.806 90.645ZM103.563 60.501C103.563 62.879 101.635 64.807 99.256 64.807H21.744C19.366 64.807 17.438 62.879 17.438 60.501C17.438 58.123 19.366 56.195 21.744 56.195H99.256C101.635 56.195 103.563 58.123 103.563 60.501ZM26.089 23.5C25.41 24.981 26.492 26.667 28.121 26.667C29.355 26.667 30.356 27.668 30.356 28.902V32.818C30.356 36.216 27.602 38.97 24.205 38.97H23.897C20.329 38.97 17.438 36.078 17.438 32.51V29.808C17.438 28.116 17.974 26.468 18.97 25.1L23.921 18.298C24.314 17.758 24.942 17.439 25.61 17.439C27.133 17.439 28.144 19.014 27.51 20.398L26.089 23.5ZM43.31 23.498C42.631 24.98 43.714 26.667 45.344 26.667C46.58 26.667 47.581 27.668 47.581 28.904V32.818C47.581 36.216 44.827 38.97 41.43 38.97H41.118C37.548 38.97 34.654 36.076 34.654 32.506V29.808C34.654 28.116 35.19 26.468 36.186 25.1L41.137 18.299C41.531 17.758 42.159 17.439 42.828 17.439C44.352 17.439 45.364 19.016 44.729 20.401L43.31 23.498Z" fill="#E7E7E7" />
    </svg>
  )
}

function KeywordBankPlaceholder() {
  return (
    <svg width="140" height="133" viewBox="0 0 140 133" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M65.135 72.915H55.879L60.507 60.578L65.135 72.915Z" fill="#E7E7E7" />
      <path d="M53.265 22.462C55.524 21.383 57.996 20.823 60.5 20.823C63.003 20.823 65.475 21.383 67.734 22.462C69.721 23.415 71.541 24.968 74.087 27.141L74.485 27.474C76.905 29.541 79.219 30.519 82.451 30.776L82.965 30.816C86.303 31.083 88.688 31.27 90.765 32.006C93.126 32.84 95.27 34.191 97.041 35.962C98.812 37.731 100.164 39.875 100.999 42.236C101.73 44.313 101.917 46.697 102.184 50.035L102.224 50.549C102.482 53.781 103.465 56.095 105.527 58.515L105.86 58.908C108.032 61.459 109.59 63.279 110.538 65.266C111.617 67.525 112.177 69.997 112.177 72.501C112.177 75.004 111.617 77.476 110.538 79.735C109.585 81.722 108.032 83.542 105.86 86.088L105.527 86.486C103.419 88.957 102.477 91.281 102.224 94.452L102.184 94.966C101.917 98.304 101.73 100.689 100.994 102.766C100.16 105.127 98.809 107.271 97.039 109.042C95.269 110.813 93.125 112.165 90.765 113C88.688 113.731 86.303 113.918 82.965 114.185L82.451 114.225C79.219 114.483 76.905 115.466 74.485 117.528L74.087 117.86C71.541 120.033 69.721 121.591 67.734 122.539C65.475 123.618 63.003 124.178 60.5 124.178C57.996 124.178 55.524 123.618 53.265 122.539C51.278 121.586 49.458 120.033 46.912 117.86L46.514 117.528C44.094 115.466 41.78 114.483 38.548 114.225L38.034 114.185C34.696 113.918 32.312 113.731 30.235 112.995C27.874 112.161 25.729 110.81 23.959 109.04C22.188 107.27 20.835 105.126 20 102.766C19.269 100.689 19.082 98.304 18.815 94.966L18.775 94.452C18.517 91.281 17.575 88.957 15.473 86.486L15.14 86.088C12.967 83.542 11.409 81.722 10.461 79.735C9.382 77.476 8.822 75.004 8.822 72.501C8.822 69.997 9.382 67.525 10.461 65.266C11.414 63.279 12.967 61.459 15.14 58.913L15.473 58.515C17.575 56.095 18.517 53.781 18.775 50.549L18.815 50.035C19.082 46.697 19.269 44.313 20.005 42.236C20.839 39.875 22.191 37.73 23.96 35.959C25.73 34.189 27.874 32.836 30.235 32.001C32.312 31.27 34.696 31.083 38.034 30.816L38.548 30.776C41.78 30.519 44.094 29.541 46.514 27.474L46.907 27.141C49.458 24.968 51.278 23.41 53.265 22.462ZM64.039 48.487C63.768 47.767 63.284 47.147 62.652 46.709C62.02 46.272 61.269 46.037 60.5 46.037C59.73 46.037 58.98 46.272 58.347 46.709C57.715 47.147 57.231 47.767 56.96 48.487L41.835 88.82C41.643 89.289 41.547 89.791 41.553 90.297C41.559 90.804 41.666 91.304 41.869 91.768C42.071 92.232 42.365 92.65 42.732 92.999C43.1 93.347 43.533 93.618 44.008 93.796C44.482 93.973 44.986 94.054 45.492 94.033C45.998 94.012 46.495 93.889 46.952 93.672C47.41 93.456 47.819 93.149 48.156 92.771C48.493 92.394 48.751 91.952 48.914 91.472L53.038 80.482H67.961L72.085 91.472C72.421 92.394 73.044 93.149 73.843 93.649C74.642 94.148 75.582 94.354 76.508 94.232C77.434 94.11 78.285 93.667 78.92 92.98C79.555 92.293 79.933 91.406 79.988 90.475C80.011 89.956 79.929 89.438 79.748 88.952L64.039 48.487Z" fill="#E7E7E7" />
      {/* Blue key overlay */}
      <g transform="translate(98, 0)">
        <path d="M9.2 32.8C9.2 28.6 11.6 24.8 15.4 22.8C19.2 20.8 23.8 21.2 27.2 23.6L38.8 15.6C39.6 15 40.6 15.2 41.2 16L41.8 16.8C42.4 17.6 42.2 18.6 41.4 19.2L33.8 24.6C35.4 27.4 35.6 30.8 34.4 33.8C33.2 36.8 30.6 39 27.4 39.8L28.2 43.4C28.4 44.4 27.8 45.2 26.8 45.4L25 45.8C24 46 23.2 45.4 23 44.4L22.2 41C21.6 41 21 40.8 20.4 40.6L19.6 44.2C19.4 45.2 18.4 45.8 17.4 45.6L15.6 45.2C14.6 45 14 44 14.2 43L15 39.6C11.6 37.8 9.2 35.4 9.2 32.8ZM18.2 34.4C20.2 35.6 22.8 35.2 24.4 33.4C26 31.6 26 28.8 24.4 27C22.8 25.2 20.2 24.8 18.2 26C16.2 27.2 15.4 29.6 16.2 31.8C16.6 33 17.2 33.8 18.2 34.4Z" fill="#028FF4" />
      </g>
    </svg>
  )
}

function ATSScorePlaceholder() {
  return (
    <svg width="121" height="121" viewBox="0 0 121 121" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M34.143 106.412C31.519 106.316 29.022 105.635 26.653 104.369C24.288 103.106 22.052 101.256 19.947 98.818C16.498 94.9 13.812 90.082 11.89 84.364C9.963 78.645 9 72.706 9 66.545C9 59.361 10.337 52.619 13.011 46.317C15.685 40.015 19.359 34.527 24.032 29.854C28.705 25.181 34.174 21.49 40.438 18.781C46.702 16.073 53.389 14.717 60.5 14.713C67.611 14.709 74.298 16.071 80.562 18.799C86.826 21.526 92.275 25.215 96.91 29.865C101.546 34.516 105.219 39.99 107.931 46.288C110.644 52.586 112 59.304 112 66.442C112 72.61 111.008 78.54 109.024 84.232C107.041 89.924 104.298 94.818 100.796 98.915C98.568 101.437 96.287 103.316 93.952 104.552C91.621 105.788 89.149 106.406 86.536 106.406C85.186 106.406 83.873 106.246 82.599 105.925C81.321 105.608 80.043 105.132 78.765 104.495L70.754 100.489C69.171 99.695 67.498 99.1 65.736 98.704C63.97 98.307 62.188 98.109 60.391 98.109C58.522 98.109 56.723 98.307 54.995 98.704C53.267 99.1 51.646 99.695 50.131 100.489L42.235 104.495C40.861 105.227 39.532 105.752 38.246 106.068C36.957 106.389 35.589 106.507 34.143 106.412ZM66.6 72.307C68.255 70.655 69.083 68.622 69.083 66.207C69.083 65.368 68.957 64.55 68.706 63.752C68.45 62.951 68.107 62.207 67.676 61.521L78.239 47.867C79.727 49.279 81.007 50.805 82.079 52.445C83.15 54.086 83.961 55.85 84.51 57.738C84.77 58.459 85.155 59.079 85.666 59.598C86.181 60.121 86.797 60.382 87.515 60.382C88.545 60.382 89.313 59.951 89.821 59.089C90.332 58.227 90.421 57.271 90.09 56.222C87.961 49.817 84.184 44.636 78.76 40.68C73.327 36.721 67.241 34.741 60.5 34.741C53.736 34.741 47.627 36.721 42.172 40.68C36.717 44.636 32.926 49.817 30.802 56.222C30.47 57.271 30.577 58.225 31.122 59.083C31.668 59.941 32.419 60.374 33.377 60.382C34.094 60.382 34.691 60.121 35.168 59.598C35.645 59.075 36.013 58.456 36.272 57.738C37.974 52.539 41.052 48.36 45.508 45.201C49.964 42.042 54.961 40.463 60.5 40.463C62.835 40.463 65.126 40.806 67.372 41.493C69.619 42.18 71.742 43.143 73.741 44.383L63.144 58.105C62.732 57.956 62.291 57.839 61.822 57.755C61.353 57.672 60.912 57.63 60.5 57.63C58.085 57.63 56.052 58.457 54.4 60.113C52.745 61.765 51.917 63.798 51.917 66.213C51.917 68.628 52.745 70.661 54.4 72.313C56.056 73.965 58.089 74.792 60.5 74.796C62.911 74.8 64.944 73.972 66.6 72.313" fill="#E7E7E7" />
    </svg>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const font = { fontFamily: "'Geist', system-ui, sans-serif" }
const cardLabel = { fontSize: '14px', fontWeight: 600, color: '#727272', letterSpacing: '-0.02em', lineHeight: '160%' }

// ── Keyword pill ──────────────────────────────────────────────────────────────
function Pill({ word, variant }) {
  const colors = {
    matched: { bg: '#ECFDF5', color: '#059669', border: '#D1FAE5' },
    missing: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
  }
  const c = colors[variant]
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '9999px',
      fontSize: '12px', fontWeight: 500, letterSpacing: '-0.01em',
      backgroundColor: c.bg, color: c.color, border: `1px solid ${c.border}`,
    }}>
      {word}
    </span>
  )
}

// ── Score arc gauge ───────────────────────────────────────────────────────────
function ScoreGauge({ score }) {
  const r = 40, cx = 60, cy = 55, strokeW = 8
  const circumference = Math.PI * r  // half-circle
  const progress = (score / 100) * circumference
  const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444'
  return (
    <svg width="120" height="80" viewBox="0 0 120 80">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#E7E7E7" strokeWidth={strokeW} strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round"
        strokeDasharray={`${progress} ${circumference}`} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700"
        fill="#020202" fontFamily="Geist, system-ui, sans-serif">{score}%</text>
    </svg>
  )
}

// ── Category badge color ──────────────────────────────────────────────────────
function categoryColor(cat) {
  return { Excellent: '#10B981', Great: '#10B981', Good: '#F59E0B', Poor: '#EF4444' }[cat] || '#727272'
}

export default function WorkspaceLayout({ file, result, loading, error, onAnalyze, onReset }) {
  const [jobDescription, setJobDescription] = useState('')
  const [jdError, setJdError] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [activeTab, setActiveTab] = useState('optimization')
  const { sections, loading: parseLoading, error: parseError, updateSection } = useResumeParser(file)

  const fileName = file?.name?.replace(/\.pdf$/i, '') || 'Resume'

  function handleAnalyze() {
    const err = validateJobDescription(jobDescription)
    if (err) { setJdError(err); return }
    setJdError(null)
    onAnalyze(file, jobDescription)
  }

  async function handleDownload() {
    if (!result) return
    setDownloading(true)
    try {
      const response = await downloadReport(result)
      const blob = new Blob([response.report], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'resume-report.md'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', ...font, backgroundColor: '#FFFFFF' }}>

      {/* ── Left sidebar ── */}
      <div style={{
        width: '321px', flexShrink: 0,
        backgroundColor: '#F9F9FB',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: '32px', padding: '32px', overflow: 'hidden',
        justifyContent: 'flex-start',
      }}>
        <MebbleLogo />

        {/* Spacer pushes instructions + JD card to bottom */}
        <div style={{ flex: 1 }} />

        {/* Instructions */}
        <p style={{
          fontSize: '13px', fontWeight: 500, color: '#727272',
          letterSpacing: '-0.02em', lineHeight: '160%',
          alignSelf: 'stretch', textAlign: 'left',
        }}>
          Your uploaded resume is currently in display. To get a well optimized Resume for your application, kindly paste or send the job requirements.
        </p>

        {/* JD input card */}
        <div style={{
          alignSelf: 'stretch',
          backgroundColor: '#FFFFFF',
          border: '1px solid #F1F1F1',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0px 6px 9px 22px #ECECEC33',
          display: 'flex', flexDirection: 'column', gap: '16px',
        }}>
          <textarea
            value={jobDescription}
            onChange={e => { setJobDescription(e.target.value); setJdError(null) }}
            placeholder="Paste in Job Description"
            rows={3}
            style={{
              fontSize: '14px', fontWeight: 500, color: '#020202',
              letterSpacing: '-0.02em', lineHeight: '160%',
              border: 'none', outline: 'none', resize: 'none',
              backgroundColor: 'transparent', width: '100%',
              fontFamily: 'inherit',
              '::placeholder': { color: '#767678' },
            }}
          />
          {jdError && (
            <p style={{ fontSize: '12px', color: '#EF4444', margin: 0 }}>{jdError}</p>
          )}
          {/* Icon row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={onReset}
              title="Upload new resume"
              style={{
                width: '28px', height: '28px', borderRadius: '9999px',
                backgroundColor: '#F0F0F0', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#727272" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              title="Analyze"
              style={{
                width: '28px', height: '28px', borderRadius: '9999px',
                backgroundColor: loading ? '#E4F3FE' : '#028FF4',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background-color 0.15s ease',
              }}
            >
              {loading ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="#028FF4" strokeWidth="2" strokeDasharray="30 10" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main area ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '32px', gap: '32px', overflow: 'hidden',
        backgroundColor: '#FFFFFF',
      }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexShrink: 0 }}>
          {/* File name pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <div style={{
              backgroundColor: '#F7F7F7', borderRadius: '8px',
              padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#727272', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
                {fileName}
              </span>
            </div>
            {/* Orange dot / indicator */}
            <div style={{
              width: '39px', height: '39px', flexShrink: 0,
              backgroundColor: '#FF7512', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={!result || downloading}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              backgroundColor: '#E4F3FE', border: 'none',
              borderRadius: '9999px', padding: '12px 14px 12px 16px',
              cursor: result ? 'pointer' : 'not-allowed',
              opacity: result ? 1 : 0.5,
              fontSize: '14px', fontWeight: 600, color: '#028FF4',
              fontFamily: 'inherit', letterSpacing: '-0.01em',
              transition: 'opacity 0.15s ease',
            }}
          >
            {downloading ? 'Downloading...' : 'Download'}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="#028FF4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Content row */}
        <div style={{ display: 'flex', flex: 1, gap: 0, overflow: 'hidden' }}>

          {/* Left: tabs + resume */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '32px', overflow: 'hidden', marginRight: '32px' }}>

            {/* Tab bar */}
            <div style={{
              display: 'inline-flex', alignSelf: 'flex-start',
              backgroundColor: '#F7F7F7', borderRadius: '8px', padding: '4px', gap: 0,
              flexShrink: 0,
            }}>
              {['optimization', 'structure'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '8px', borderRadius: '8px', border: 'none',
                    backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent',
                    cursor: 'pointer', width: '100px',
                    fontSize: '14px', fontWeight: 600, letterSpacing: '-0.02em',
                    color: activeTab === tab ? '#727272' : '#D8D8D8',
                    fontFamily: 'inherit', transition: 'all 0.15s ease',
                    lineHeight: '160%',
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Resume editor card */}
            <div style={{
              flex: 1, borderRadius: '16px',
              backgroundColor: '#F9F9FB',
              border: '1px solid #F0F0F0',
              overflow: 'hidden',
            }}>
              <ResumeEditor
                sections={sections}
                loading={parseLoading}
                error={parseError}
                result={result}
                onSectionChange={updateSection}
              />
            </div>
          </div>

          {/* Right: analysis cards */}
          <div style={{ width: '331px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '32px', overflowY: 'auto' }}>

            {/* Summary card */}
            <div style={{
              backgroundColor: '#F9F9FB', borderRadius: '16px',
              padding: '16px', display: 'flex', flexDirection: 'column',
              alignItems: 'flex-end', gap: '32px', flex: '0 0 auto',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ alignSelf: 'stretch' }}>
                  <span style={cardLabel}>Summary</span>
                </div>
                {result ? (
                  <p style={{ fontSize: '13px', color: '#727272', lineHeight: '160%', letterSpacing: '-0.02em', fontWeight: 500, alignSelf: 'stretch' }}>
                    {result.summary}
                  </p>
                ) : (
                  <SummaryPlaceholder />
                )}
              </div>
            </div>

            {/* Keyword Bank card */}
            <div style={{
              backgroundColor: '#F9F9FB', borderRadius: '16px',
              padding: '16px', display: 'flex', flexDirection: 'column',
              alignItems: 'flex-end', gap: '32px', flex: '0 0 auto',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ alignSelf: 'stretch' }}>
                  <span style={cardLabel}>Keyword Bank</span>
                </div>
                {result ? (
                  <div style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {result.matched_keywords?.length > 0 && (
                      <div>
                        <p style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Matched</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {result.matched_keywords.map(k => <Pill key={k} word={k} variant="matched" />)}
                        </div>
                      </div>
                    )}
                    {result.missing_keywords?.length > 0 && (
                      <div>
                        <p style={{ fontSize: '11px', color: '#A0A0A0', fontWeight: 500, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Missing</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {result.missing_keywords.map(k => <Pill key={k} word={k} variant="missing" />)}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <KeywordBankPlaceholder />
                )}
              </div>
            </div>

            {/* ATS Score card */}
            <div style={{
              backgroundColor: '#F9F9FB', borderRadius: '16px',
              padding: '16px', display: 'flex', flexDirection: 'column',
              alignItems: 'flex-end', gap: '32px', flex: '0 0 auto',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignSelf: 'stretch', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ alignSelf: 'stretch' }}>
                  <span style={cardLabel}>ATS Score</span>
                </div>
                {result ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <ScoreGauge score={result.ats_score} />
                    <span style={{
                      fontSize: '13px', fontWeight: 600,
                      color: categoryColor(result.score_category),
                      letterSpacing: '-0.02em',
                    }}>
                      {result.score_category}
                    </span>
                  </div>
                ) : (
                  <ATSScorePlaceholder />
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
