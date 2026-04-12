import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

const inputBase =
  "w-full rounded-xl border border-[#F1F1F1] bg-[#F9F9FB] px-3 py-2.5 text-sm text-[#020202] placeholder:text-[#767678] focus:outline-none focus:border-[#028FF4] focus:bg-white transition-colors";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="text-xs font-semibold text-[#020202]"
          style={{ letterSpacing: "-0.01em" }}
        >
          {label}
        </label>
      )}
      <input
        className={`${inputBase} ${error ? "border-[#F70407]" : ""} ${className}`}
        style={{ letterSpacing: "-0.01em" }}
        {...props}
      />
      {error && (
        <span className="text-xs text-[#F70407]" style={{ letterSpacing: "-0.01em" }}>
          {error}
        </span>
      )}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = "", ...props }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="text-xs font-semibold text-[#020202]"
          style={{ letterSpacing: "-0.01em" }}
        >
          {label}
        </label>
      )}
      <textarea
        className={`${inputBase} resize-none ${error ? "border-[#F70407]" : ""} ${className}`}
        style={{ letterSpacing: "-0.01em" }}
        {...props}
      />
      {error && (
        <span className="text-xs text-[#F70407]" style={{ letterSpacing: "-0.01em" }}>
          {error}
        </span>
      )}
    </div>
  );
}
