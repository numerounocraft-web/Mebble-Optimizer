"use client";

import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "blue" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-5 py-3 text-sm",
  };

  const variants = {
    primary: "bg-[#FF7512] text-white hover:bg-[#e56a10]",
    blue: "bg-[#E4F3FE] text-[#028FF4] hover:bg-[#d0eafd]",
    secondary:
      "bg-white text-[#020202] border border-[#F1F1F1] hover:bg-[#F9F9FB]",
    ghost: "bg-transparent text-[#767678] hover:bg-[#F9F9FB]",
    danger: "bg-[#FEE2E2] text-[#F70407] hover:bg-[#fecaca]",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      style={{ letterSpacing: "-0.01em" }}
      {...props}
    >
      {children}
    </button>
  );
}
