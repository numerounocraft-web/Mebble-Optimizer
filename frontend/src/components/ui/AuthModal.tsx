"use client";

import { useState } from "react";
import { X } from "lucide-react";
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
  /** Optional headline shown above the tabs, e.g. "Save to sync across devices" */
  prompt?: string;
}

export default function AuthModal({ onClose, onSuccess, prompt }: AuthModalProps) {
  const { login, register } = useAuth();
  const [tab,      setTab]      = useState<"signin" | "signup">("signin");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (tab === "signup" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (tab === "signin") {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password);
      }
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "42px",
    padding: "0 14px",
    borderRadius: "10px",
    border: "1.5px solid #EBEBEB",
    fontSize: "13px",
    fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
    color: "#1F1F1F",
    backgroundColor: "#FAFAFA",
    outline: "none",
    boxSizing: "border-box",
    letterSpacing: "-0.01em",
    transition: "border-color 0.15s",
  };

  return (
    <>
      <style>{STYLES}</style>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 9999, padding: "24px",
        }}
      >
        {/* Card */}
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

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1.5px solid #F1F1F1" }}>
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                style={{
                  flex: 1, padding: "10px 0",
                  background: "none", border: "none",
                  borderBottom: `2px solid ${tab === t ? "#028FF4" : "transparent"}`,
                  marginBottom: "-1.5px",
                  fontSize: "13px", fontWeight: 600,
                  color: tab === t ? "#028FF4" : "#AEAEB2",
                  cursor: "pointer", fontFamily: "inherit",
                  letterSpacing: "-0.02em",
                  transition: "color 0.15s, border-color 0.15s",
                }}
              >
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#028FF4"; e.target.style.backgroundColor = "#fff"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#EBEBEB"; e.target.style.backgroundColor = "#FAFAFA"; }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = "#028FF4"; e.target.style.backgroundColor = "#fff"; }}
              onBlur={(e)  => { e.target.style.borderColor = "#EBEBEB"; e.target.style.backgroundColor = "#FAFAFA"; }}
            />
            {tab === "signup" && (
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => { e.target.style.borderColor = "#028FF4"; e.target.style.backgroundColor = "#fff"; }}
                onBlur={(e)  => { e.target.style.borderColor = "#EBEBEB"; e.target.style.backgroundColor = "#FAFAFA"; }}
              />
            )}

            {error && (
              <p style={{ margin: 0, fontSize: "12px", color: "#EF4444", fontWeight: 500, letterSpacing: "-0.01em" }}>
                {error}
              </p>
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
                fontFamily: "inherit",
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
            <p style={{ margin: 0, fontSize: "11px", color: "#AEAEB2", textAlign: "center", letterSpacing: "-0.01em" }}>
              No account?{" "}
              <button
                onClick={() => { setTab("signup"); setError(""); }}
                style={{ background: "none", border: "none", color: "#028FF4", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", fontSize: "11px", padding: 0 }}
              >
                Create one free
              </button>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
