import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo() {
  return (
    <Link 
      to="/" 
      className="flex items-center gap-3.5 group relative select-none focus-visible:outline-none"
      aria-label="SkillExchange Home Coordinates"
    >
      {/* HIGH-POLISH SAAS GEOMETRIC BRAND MARQUE */}
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-500 ease-[0.16,1,0.3,1] group-hover:scale-105"
      >
        <style>{`
          .skill-diamond {
            transform-origin: 11px 16px;
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease;
          }
          .exchange-diamond {
            transform-origin: 21px 16px;
            transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.3s ease;
          }
          group:hover .skill-diamond,
          a:hover .skill-diamond {
            transform: rotate(135deg);
            stroke: hsl(var(--primary, #bd3fd8));
          }
          group:hover .exchange-diamond,
          a:hover .exchange-diamond {
            transform: rotate(-45deg);
            stroke: hsl(var(--secondary, #f6847e));
          }
        `}</style>

        {/* Base Shifting Anchor (Skill Left) */}
        <rect
          className="skill-diamond"
          x="4"
          y="9"
          width="14"
          height="14"
          rx="3"
          transform="rotate(45 11 16)"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.25"
          fill="currentColor"
          fillOpacity="0.03"
        />

        {/* Intersecting Trajectory Anchor (Exchange Right) */}
        <rect
          className="exchange-diamond"
          x="14"
          y="9"
          width="14"
          height="14"
          rx="3"
          transform="rotate(45 21 16)"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeOpacity="0.35"
          fill="currentColor"
          fillOpacity="0.07"
          style={{ mixBlendMode: 'screen' }}
        />

        {/* Central Core Handshake Node */}
        <circle
          cx="16"
          cy="16"
          r="1.5"
          fill="currentColor"
          stroke="var(--background, #0e0915)"
          strokeWidth="1"
        />
      </svg>

      {/* TYPOGRAPHY BRAND MARK SYSTEM STRING */}
      <span className="hidden sm:block font-sans text-base tracking-[-0.03em] text-foreground transition-colors duration-200">
        <span className="font-light text-muted-foreground/80 group-hover:text-foreground transition-colors">Skill</span>
        <span className="font-semibold text-foreground">Exchange</span>
        <span className="text-primary font-black inline-block ml-0.5 animate-pulse">.</span>
      </span>
    </Link>
  );
}