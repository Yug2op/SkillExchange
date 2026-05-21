import React from 'react';

export default function BrandLoader({ className = "h-16 w-16" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      
      {/* ANIMATION FRAME WRAPPER CONTAINER */}
      <div className={`relative flex items-center justify-center ${className}`}>
        
        {/* SVG VECTOR VECTOR CONTAINER */}
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full absolute inset-0 overflow-visible"
        >
          {/* Central Core Handshake Node (Static baseline coordinate) */}
          <circle
            cx="16"
            cy="16"
            r="1.5"
            className="fill-foreground"
          />
        </svg>

        {/* LEFT DIAMOND NODE (SKILL) - Wrapped in absolute div for safe bounce */}
        <div className="absolute left-[12.5%] top-[28%] w-[43.75%] h-[43.75%] animate-bounce [animation-duration:1.4s]">
          <div className="w-full h-full border-1.5 border-primary bg-primary/40 rounded-md rotate-45" />
        </div>

        {/* RIGHT DIAMOND NODE (EXCHANGE) - Intersecting with reverse phase delay bounce */}
        <div className="absolute right-[12.5%] top-[28%] w-[43.75%] h-[43.75%] animate-bounce [animation-delay:0.2s] [animation-duration:1.4s]">
          <div className="w-full h-full border-1.5 border-secondary bg-secondary/40 rounded-md rotate-45 mix-blend-difference dark:mix-blend-screen" />
        </div>

      </div>
      
      {/* SYSTEM PIPELINE INDEX LOG LABEL */}
      <span className="text-md font-mono uppercase tracking-widest text-muted-foreground/40 animate-pulse select-none">
        Loading...
      </span>
    </div>
  );
}