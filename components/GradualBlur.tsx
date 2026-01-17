"use client";

import { useRef } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

type GradualBlurProps = {
  children: React.ReactNode;
  className?: string;
};

export default function GradualBlur({ children, className = "" }: GradualBlurProps) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
    >
      {/* Content */}
      <div className={`transition-all duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
        {children}
      </div>

      {/* Gradual blur overlay - bottom to top */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/80 to-transparent backdrop-blur-[1px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/60 to-transparent backdrop-blur-[2px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0a0e1a] via-[#0a0e1a]/40 to-transparent backdrop-blur-[4px]" />
        <div className="absolute inset-x-0 bottom-0 h-1/6 bg-gradient-to-t from-[#0a0e1a] to-transparent backdrop-blur-[8px]" />
      </div>
    </div>
  );
}
