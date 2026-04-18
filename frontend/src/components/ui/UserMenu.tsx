"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import type { AuthUser } from "@/lib/auth";

interface UserMenuProps {
  user: AuthUser;
  onSignOut: () => void;
}

export default function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const initials = user.email.slice(0, 2).toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
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
          fontFamily: "inherit",
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
            width: "220px",
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
            <p style={{ margin: 0, fontSize: "11px", color: "#AEAEB2", fontWeight: 500, letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </p>
          </div>

          {/* Sign out */}
          <button
            onClick={() => { setOpen(false); onSignOut(); }}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              width: "100%",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              color: "#EF4444",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "-0.01em",
              textAlign: "left",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#FFF5F5"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
          >
            <LogOut size={14} strokeWidth={2} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
