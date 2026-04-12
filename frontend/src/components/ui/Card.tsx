import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export default function Card({ children, className = "", style }: CardProps) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[#F1F1F1] p-5 ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
