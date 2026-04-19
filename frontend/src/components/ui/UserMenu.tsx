"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import type { AuthUser } from "@/lib/auth";
import { useAuth } from "@/lib/auth";

interface UserMenuProps {
  user: AuthUser;
  onSignOut: () => void;
}

export default function UserMenu({ user, onSignOut }: UserMenuProps) {
  const { deleteAccount } = useAuth();
  const [open,        setOpen]        = useState(false);
  const [confirming,  setConfirming]  = useState(false);
  const [deleting,    setDeleting]    = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
        setDeleteError("");
      }
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const initials = user.email.slice(0, 2).toUpperCase();

  async function handleDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount();
      // onAuthStateChange clears user state — no need to call onSignOut
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete account. Please try again.");
      setDeleting(false);
    }
  }

  const FONT = "var(--font-geist-sans), system-ui, sans-serif";

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Avatar button */}
      <button
        onClick={() => { setOpen((o) => !o); setConfirming(false); setDeleteError(""); }}
        title={user.email}
        style={{
          width: 34, height: 34,
          borderRadius: "50%",
          border: "none",
          backgroundColor: "#028FF4",
          color: "#FFFFFF",
          fontSize: "11px",
          fontWeight: 700,
          letterSpacing: "0.02em",
          cursor: "pointer",
          fontFamily: FONT,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {initials}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: "240px",
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            padding: "8px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
            zIndex: 300,
            animation: "dropdownScale 0.18s cubic-bezier(0.16,1,0.3,1) forwards",
            transformOrigin: "top right",
          }}
        >
          {/* Email */}
          <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid #F4F4F6", marginBottom: "4px" }}>
            <p style={{ margin: 0, fontSize: "11px", color: "#AEAEB2", fontWeight: 500, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: FONT }}>
              {user.email}
            </p>
          </div>

          {/* Sign out */}
          <button
            onClick={() => { setOpen(false); onSignOut(); }}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              width: "100%", padding: "8px 12px",
              borderRadius: "8px", border: "none", background: "none",
              cursor: "pointer", fontFamily: FONT,
              color: "#3C3C3C", fontSize: "12px", fontWeight: 500,
              letterSpacing: "-0.01em", textAlign: "left",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#F4F4F6"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
          >
            <LogOut size={14} strokeWidth={2} color="#727272" />
            Sign out
          </button>

          {/* Divider */}
          <div style={{ height: "1px", backgroundColor: "#F4F4F6", margin: "4px 0" }} />

          {/* Delete account — normal state */}
          {!confirming && (
            <button
              onClick={() => setConfirming(true)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "8px 12px",
                borderRadius: "8px", border: "none", background: "none",
                cursor: "pointer", fontFamily: FONT,
                color: "#EF4444", fontSize: "12px", fontWeight: 500,
                letterSpacing: "-0.01em", textAlign: "left",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FFF5F5"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <Trash2 size={14} strokeWidth={2} />
              Delete account
            </button>
          )}

          {/* Delete account — confirmation state */}
          {confirming && (
            <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                <AlertTriangle size={14} color="#F59E0B" strokeWidth={2} style={{ flexShrink: 0, marginTop: "1px" }} />
                <p style={{ margin: 0, fontSize: "11px", color: "#6B7280", fontWeight: 500, lineHeight: "150%", letterSpacing: "-0.01em", fontFamily: FONT }}>
                  This will permanently delete your account and all saved resumes. This cannot be undone.
                </p>
              </div>

              {deleteError && (
                <p style={{ margin: 0, fontSize: "11px", color: "#EF4444", fontWeight: 500, letterSpacing: "-0.01em", fontFamily: FONT }}>
                  {deleteError}
                </p>
              )}

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    flex: 1, height: "32px", borderRadius: "8px", border: "none",
                    backgroundColor: deleting ? "#FCA5A5" : "#EF4444",
                    color: "#FFFFFF", fontSize: "11px", fontWeight: 600,
                    cursor: deleting ? "default" : "pointer",
                    fontFamily: FONT, letterSpacing: "-0.01em",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                  }}
                >
                  {deleting
                    ? <><Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> Deleting…</>
                    : "Yes, delete"
                  }
                </button>
                <button
                  onClick={() => { setConfirming(false); setDeleteError(""); }}
                  disabled={deleting}
                  style={{
                    flex: 1, height: "32px", borderRadius: "8px",
                    border: "1.5px solid #E8E8EA", backgroundColor: "#FFFFFF",
                    color: "#727272", fontSize: "11px", fontWeight: 600,
                    cursor: deleting ? "default" : "pointer",
                    fontFamily: FONT, letterSpacing: "-0.01em",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
