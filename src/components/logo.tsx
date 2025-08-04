
import { cn } from "@/lib/utils";
import React from "react";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 300 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <path id="pentagon" d="M2.5 0 L5 1.75 L4 4.5 L1 4.5 L0 1.75 Z" />
        </defs>

        {/* The main "mindlink" text */}
        <text
          x="150"
          y="35"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="hsl(var(--foreground))"
          fontFamily="Montserrat, sans-serif"
          fontSize="40"
          fontWeight="bold"
          letterSpacing="-0.5"
        >
          mindlink
        </text>

        {/* Subtitle text */}
        <text
          x="150"
          y="65"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="hsl(var(--foreground))"
          fontFamily="Assistant, sans-serif"
          fontSize="10"
          letterSpacing="1.5"
        >
          DIGITAL & E-COMMERCE
        </text>
        <text
          x="150"
          y="80"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="hsl(var(--foreground))"
          fontFamily="Assistant, sans-serif"
          fontSize="10"
          letterSpacing="1.5"
        >
          CONSULTING
        </text>

        {/* Orange decorative elements */}
        {/* Dot on the 'i' */}
        <rect x="123" y="21" width="6" height="6" fill="hsl(var(--primary))" />

        {/* Square left of 'm' */}
        <rect x="38" y="32" width="8" height="8" fill="hsl(var(--primary))" />
        
        {/* Pentagon right of 'k' */}
        <g transform="translate(250, 31) rotate(30)">
          <use href="#pentagon" fill="hsl(var(--primary))" transform="scale(1.8)" />
        </g>
        
        {/* Vertical Bar */}
        <rect x="268" y="68" width="4" height="20" fill="hsl(var(--primary))" />
      </svg>
    </div>
  );
};
