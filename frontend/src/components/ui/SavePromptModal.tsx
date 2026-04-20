"use client";

import { X } from "lucide-react";
import MebbleLogo from "@/components/ui/MebbleLogo";

const FONT = "var(--font-geist-sans), system-ui, sans-serif";

const STYLES = `
  @keyframes savePromptIn {
    from { opacity: 0; transform: scale(0.96) translateY(8px); }
    to   { opacity: 1; transform: scale(1)    translateY(0);   }
  }
`;

interface Props {
  onClose: () => void;
  onCreateAccount: () => void;
}

export default function SavePromptModal({ onClose, onCreateAccount }: Props) {
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
            animation: "savePromptIn 0.22s cubic-bezier(0.16,1,0.3,1) forwards",
            boxShadow: "0 24px 64px rgba(0,0,0,0.14)",
          }}
        >
          {/* Header row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <MebbleLogo height={14} />
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#AEAEB2", display: "flex", alignItems: "center", padding: 0 }}
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Icon */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{
              width: "52px", height: "52px",
              borderRadius: "16px",
              backgroundColor: "#FFF7ED",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.0007 18.6663C16.0007 15.1301 17.4054 11.7387 19.9059 9.23825C22.4064 6.73777 25.7978 5.33301 29.334 5.33301C32.8702 5.33301 36.2616 6.73777 38.7621 9.23825C41.2626 11.7387 42.6673 15.1301 42.6673 18.6663C42.6673 22.2026 41.2626 25.5939 38.7621 28.0944C36.2616 30.5949 32.8702 31.9997 29.334 31.9997C25.7978 31.9997 22.4064 30.5949 19.9059 28.0944C17.4054 25.5939 16.0007 22.2026 16.0007 18.6663ZM12.8593 39.125C17.134 36.517 22.9473 34.6663 29.334 34.6663C30.5269 34.6663 31.6967 34.7286 32.8433 34.853C33.3014 34.9021 33.7389 35.0691 34.1132 35.3376C34.4876 35.6061 34.7859 35.9671 34.9793 36.3852C35.1727 36.8033 35.2544 37.2644 35.2165 37.7236C35.1787 38.1827 35.0225 38.6242 34.7633 39.005C32.9572 41.6564 31.9942 44.7916 32.0007 47.9997C32.0007 50.453 32.5527 52.773 33.534 54.845C33.7252 55.2487 33.8119 55.6939 33.7863 56.1398C33.7606 56.5857 33.6234 57.018 33.3871 57.3971C33.1509 57.7761 32.8232 58.0898 32.4342 58.3092C32.0452 58.5287 31.6073 58.6469 31.1607 58.653L29.334 58.6663C23.39 58.6663 17.774 58.293 13.566 57.1783C11.4727 56.6237 9.50198 55.829 8.00865 54.629C6.42732 53.3597 5.33398 51.5863 5.33398 49.333C5.33398 47.2343 6.28865 45.2717 7.58465 43.629C8.90198 41.9623 10.7233 40.429 12.8593 39.1223V39.125ZM42.6673 47.9997C42.6673 47.2924 42.9483 46.6142 43.4484 46.1141C43.9485 45.614 44.6267 45.333 45.334 45.333H47.974C49.462 45.333 50.6673 46.5383 50.6673 48.0263V53.6903C51.1757 53.9839 51.5729 54.4369 51.7976 54.9793C52.0222 55.5216 52.0616 56.1229 51.9097 56.6899C51.7577 57.2569 51.423 57.7579 50.9573 58.1153C50.4916 58.4726 49.921 58.6663 49.334 58.6663H48.0273C47.313 58.6663 46.6279 58.3826 46.1228 57.8775C45.6177 57.3724 45.334 56.6873 45.334 55.973V50.6663C44.6267 50.6663 43.9485 50.3854 43.4484 49.8853C42.9483 49.3852 42.6673 48.7069 42.6673 47.9997ZM48.0006 37.333C47.321 37.3338 46.6672 37.594 46.173 38.0606C45.6788 38.5272 45.3814 39.1649 45.3415 39.8434C45.3017 40.5219 45.5224 41.19 45.9587 41.7112C46.3949 42.2324 47.0137 42.5674 47.6886 42.6477L48.006 42.6663C48.6857 42.6656 49.3394 42.4053 49.8336 41.9387C50.3279 41.4722 50.6253 40.8345 50.6651 40.156C50.7049 39.4774 50.4842 38.8093 50.0479 38.2881C49.6117 37.7669 48.9929 37.432 48.318 37.3517L48.0006 37.333Z" fill="#FF7512"/>
              </svg>
            </div>
          </div>

          {/* Body */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", textAlign: "center" }}>
            <p style={{
              margin: 0, fontSize: "16px", fontWeight: 700,
              color: "#1F1F1F", letterSpacing: "-0.03em", fontFamily: FONT,
            }}>
              Your progress isn&apos;t being saved
            </p>
            <p style={{
              margin: 0, fontSize: "13px", fontWeight: 500,
              color: "#767678", letterSpacing: "-0.01em", lineHeight: "160%", fontFamily: FONT,
            }}>
              Without an account, your resume will be lost when you close or refresh this tab. Create a free account to save your work and access it from anywhere.
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <button
              onClick={onCreateAccount}
              style={{
                height: "44px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: "#028FF4",
                color: "#FFFFFF",
                fontSize: "13px", fontWeight: 600,
                cursor: "pointer", fontFamily: FONT,
                letterSpacing: "-0.02em",
                transition: "background-color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#0278D0"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#028FF4"; }}
            >
              Create free account
            </button>

            <button
              onClick={onClose}
              style={{
                height: "44px",
                borderRadius: "9999px",
                border: "1.5px solid #E8E8EA",
                backgroundColor: "#FFFFFF",
                color: "#767678",
                fontSize: "13px", fontWeight: 600,
                cursor: "pointer", fontFamily: FONT,
                letterSpacing: "-0.02em",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#CFCFD1"; (e.currentTarget as HTMLElement).style.color = "#1F1F1F"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#E8E8EA"; (e.currentTarget as HTMLElement).style.color = "#767678"; }}
            >
              Continue without an account
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
