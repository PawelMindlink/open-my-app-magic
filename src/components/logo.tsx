import { cn } from "@/lib/utils";
import React from "react";

export const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 250 80" className="w-full h-full">
        <defs>
          <path id="pentagon" d="M2.5 0 L5 1.75 L4 4.5 L1 4.5 L0 1.75 Z" />
        </defs>
        
        {/* Mindlink Text */}
        <text 
          x="50%" 
          y="35" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fill="#333"
          fontFamily="Montserrat, sans-serif"
          fontSize="32"
          fontWeight="bold"
          letterSpacing="-0.5"
        >
          mindlink
        </text>

        {/* First dot */}
        <g transform="translate(33, 31) rotate(180)">
           <use href="#pentagon" fill="#F77F00" />
        </g>
        
        {/* Second dot */}
         <g transform="translate(212, 22) rotate(30)">
          <use href="#pentagon" fill="#F77F00" />
        </g>
        
        {/* Vertical Bar */}
        <rect x="220" y="55" width="4" height="20" fill="#F77F00" />
      </svg>
    </div>
  );
};
