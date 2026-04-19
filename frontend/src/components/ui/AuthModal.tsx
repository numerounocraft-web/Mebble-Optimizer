"use client";

import { useState } from "react";
import { X, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";
import MebbleLogo from "@/components/ui/MebbleLogo";

const STYLES = `
  @keyframes authModalIn {
    from { opacity: 0; transform: scale(0.96) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }
`;

interface AuthModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  prompt?: string;
}

// ── Map Supabase error strings to user-friendly messages ──────────────────────
type FieldError = { field?: "email" | "password" | "confirm"; message: string };

function mapError(raw: string, tab: "signin" | "signup"): FieldError {
  const m = raw.toLowerCase();

  if (m.includes("invalid login credentials") || m.includes("invalid credentials"))
    return { message: "Incorrect email or password. Please try again." };

  if (m.includes("email not confirmed"))
    return { field: "email", message: "Your email isn't verified yet. Check your inbox for a confirmation link." };

  if (m.includes("user already registered") || m.includes("already registered"))
    return { field: "email", message: "An account with this email already exists. Try signing in instead." };

  if (m.includes("password should be at least") || m.includes("password must be at least"))
    return { field: "password", message: "Password must be at least 6 characters." };

  if (m.includes("unable to validate email") || m.includes("invalid email") || m.includes("valid email"))
    return { field: "email", message: "Please enter a valid email address." };

  if (m.includes("rate limit") || m.includes("too many requests") || m.includes("email rate"))
    return { message: "Too many attempts. Please wait a moment and try again." };

  if (m.includes("network") || m.includes("failed to fetch") || m.includes("fetch"))
    return { message: "Connection error. Check your internet and try again." };

  if (m.includes("weak password"))
    return { field: "password", message: "Password is too weak. Use letters, numbers and symbols." };

  if (m.includes("signup is disabled") || m.includes("signups not allowed"))
    return { message: "New sign-ups are temporarily disabled. Please try again later." };

  return { message: raw };
}

// ── Validation ────────────────────────────────────────────────────────────────
function validateForm(
  tab: "signin" | "signup",
  email: string,
  password: string,
  confirm: string
): FieldError | null {
  if (!email.trim())
    return { field: "email", message: "Email address is required." };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return { field: "email", message: "Please enter a valid email address." };

  if (!password)
    return { field: "password", message: "Password is required." };

  if (tab === "signup" && password.length < 6)
    return { field: "password", message: "Password must be at least 6 characters." };

  if (tab === "signup" && password !== confirm)
    return { field: "confirm", message: "Passwords do not match." };

  return null;
}

export default function AuthModal({ onClose, onSuccess, prompt }: AuthModalProps) {
  const { login, register } = useAuth();

  const [tab,          setTab]          = useState<"signin" | "signup">("signin");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [confirm,      setConfirm]      = useState("");
  const [loading,      setLoading]      = useState(false);
  const [fieldError,   setFieldError]   = useState<FieldError | null>(null);
  const [emailSent,    setEmailSent]    = useState(false);

  function switchTab(t: "signin" | "signup") {
    setTab(t);
    setFieldError(null);
    setEmailSent(false);
  }

  function inputStyle(field: "email" | "password" | "confirm"): React.CSSProperties {
    const hasError = fieldError?.field === field;
    return {
      width: "100%",
      height: "42px",
      padding: "0 14px",
      borderRadius: "10px",
      border: `1.5px solid ${hasError ? "#EF4444" : "#EBEBEB"}`,
      fontSize: "13px",
      fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
      color: "#1F1F1F",
      backgroundColor: hasError ? "#FFF8F8" : "#FAFAFA",
      outline: "none",
      boxSizing: "border-box" as const,
      letterSpacing: "-0.01em",
      transition: "border-color 0.15s, background-color 0.15s",
    };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);

    const validation = validateForm(tab, email, password, confirm);
    if (validation) { setFieldError(validation); return; }

    setLoading(true);
    try {
      if (tab === "signin") {
        await login(email.trim(), password);
        onSuccess?.();
        onClose();
      } else {
        await register(email.trim(), password);
        // Supabase sends a confirmation email — show the check-inbox screen
        setEmailSent(true);
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "Something went wrong.";
      setFieldError(mapError(raw, tab));
    } finally {
      setLoading(false);
    }
  }

  const FONT = "var(--font-geist-sans), system-ui, sans-serif";

  return (
    <>
      <style>{STYLES}</style>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: "24px",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%", maxWidth: "380px",
            backgroundColor: "#FFFFFF",
            borderRadius: "20px",
            padding: "24px",
            display: "flex", flexDirection: "column", gap: "20px",
            animation: "authModalIn 0.22s cubic-bezier(0.16,1,0.3,1) forwards",
            boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <MebbleLogo height={14} />
              {prompt && (
                <p style={{ margin: 0, fontSize: "13px", fontWeight: 500, color: "#9A9A9C", letterSpacing: "-0.01em" }}>
                  {prompt}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#AEAEB2", display: "flex", alignItems: "center", flexShrink: 0 }}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* ── Email sent confirmation screen ── */}
          {emailSent ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", padding: "8px 0 4px" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Mail size={22} color="#028FF4" strokeWidth={1.8} />
              </div>
              <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
                <p style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#1F1F1F", letterSpacing: "-0.03em", fontFamily: FONT }}>
                  Check your email
                </p>
                <p style={{ margin: 0, fontSize: "13px", color: "#9A9A9C", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: "155%", fontFamily: FONT }}>
                  We sent a confirmation link to<br />
                  <span style={{ color: "#1F1F1F", fontWeight: 600 }}>{email}</span>
                </p>
                <p style={{ margin: 0, fontSize: "12px", color: "#B0B0B0", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: "155%", fontFamily: FONT }}>
                  Click the link in the email to activate your account, then sign in.
                </p>
              </div>
              <button
                onClick={() => switchTab("signin")}
                style={{
                  width: "100%", height: "42px", borderRadius: "10px", border: "none",
                  backgroundColor: "#028FF4", color: "#FFFFFF",
                  fontSize: "13px", fontWeight: 600, cursor: "pointer",
                  fontFamily: FONT, letterSpacing: "-0.02em",
                }}
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div style={{ display: "flex", borderBottom: "1.5px solid #F1F1F1" }}>
                {(["signin", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => switchTab(t)}
                    style={{
                      flex: 1, padding: "10px 0",
                      background: "none", border: "none",
                      borderBottom: `2px solid ${tab === t ? "#028FF4" : "transparent"}`,
                      marginBottom: "-1.5px",
                      fontSize: "13px", fontWeight: 600,
                      color: tab === t ? "#028FF4" : "#AEAEB2",
                      cursor: "pointer", fontFamily: FONT,
                      letterSpacing: "-0.02em",
                      transition: "color 0.15s, border-color 0.15s",
                    }}
                  >
                    {t === "signin" ? "Sign In" : "Create Account"}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }} noValidate>

                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (fieldError?.field === "email") setFieldError(null); }}
                    style={inputStyle("email")}
                    onFocus={(e) => { if (fieldError?.field !== "email") { e.target.style.borderColor = "#028FF4"; e.target.style.backgroundColor = "#fff"; } }}
                    onBlur={(e)  => { if (fieldError?.field !== "email") { e.target.style.borderColor = "#EBEBEB"; e.target.style.backgroundColor = "#FAFAFA"; } }}
                  />
                  {fieldError?.field === "email" && (
                    <p style={{ margin: 0, fontSize: "11px", color: "#EF4444", fontWeight: 500, letterSpacing: "-0.01em", fontFamily: FONT }}>
                      {fieldError.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (fieldError?.field === "password") setFieldError(null); }}
                    style={inputStyle("password")}
                    onFocus={(e) => { if (fieldError?.field !== "password") { e.target.style.borderColor = "#028FF4"; e.target.style.backgroundColor = "#fff"; } }}
                    onBlur={(e)  => { if (fieldError?.field !== "password") { e.target.style.borderColor = "#EBEBEB"; e.target.style.backgroundColor = "#FAFAFA"; } }}
                  />
                  {fieldError?.field === "password" && (
                    <p style={{ margin: 0, fontSize: "11px", color: "#EF4444", fontWeight: 500, letterSpacing: "-0.01em", fontFamily: FONT }}>
                      {fieldError.message}
                    </p>
                  )}
                  {tab === "signup" && !fieldError && (
                    <p style={{ margin: 0, fontSize: "11px", color: "#B0B0B0", fontWeight: 500, letterSpacing: "-0.01em", fontFamily: FONT }}>
                      At least 6 characters
                    </p>
                  )}
                </div>

                {/* Confirm password */}
                {tab === "signup" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); if (fieldError?.field === "confirm") setFieldError(null); }}
                      style={inputStyle("confirm")}
                      onFocus={(e) => { if (fieldError?.field !== "confirm") { e.target.style.borderColor = "#028FF4"; e.target.style.backgroundColor = "#fff"; } }}
                      onBlur={(e)  => { if (fieldError?.field !== "confirm") { e.target.style.borderColor = "#EBEBEB"; e.target.style.backgroundColor = "#FAFAFA"; } }}
                    />
                    {fieldError?.field === "confirm" && (
                      <p style={{ margin: 0, fontSize: "11px", color: "#EF4444", fontWeight: 500, letterSpacing: "-0.01em", fontFamily: FONT }}>
                        {fieldError.message}
                      </p>
                    )}
                  </div>
                )}

                {/* General (non-field) error */}
                {fieldError && !fieldError.field && (
                  <div style={{
                    padding: "10px 12px",
                    borderRadius: "9px",
                    backgroundColor: "#FFF5F5",
                    border: "1px solid #FECACA",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}>
                    <svg style={{ flexShrink: 0, marginTop: "1px" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p style={{ margin: 0, fontSize: "12px", color: "#EF4444", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: "150%", fontFamily: FONT }}>
                      {fieldError.message}
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    height: "42px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: loading ? "#C8E4FF" : "#028FF4",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: loading ? "default" : "pointer",
                    fontFamily: FONT,
                    letterSpacing: "-0.02em",
                    transition: "background-color 0.15s",
                    marginTop: "4px",
                  }}
                >
                  {loading
                    ? (tab === "signin" ? "Signing in…" : "Creating account…")
                    : (tab === "signin" ? "Sign In" : "Create Account")}
                </button>
              </form>

              {tab === "signin" && (
                <p style={{ margin: 0, fontSize: "11px", color: "#AEAEB2", textAlign: "center", letterSpacing: "-0.01em", fontFamily: FONT }}>
                  No account?{" "}
                  <button
                    onClick={() => switchTab("signup")}
                    style={{ background: "none", border: "none", color: "#028FF4", fontWeight: 600, cursor: "pointer", fontFamily: FONT, fontSize: "11px", padding: 0 }}
                  >
                    Create one free
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
