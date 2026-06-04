import React from "react";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "w-8 h-8" }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Emerald premium gradients */}
        <linearGradient id="logo-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id="logo-grad-2" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#064e3b" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* Outer elegant hexagon/shield outline */}
      <path
        d="M50 8L86 28.8V71.2L50 92L14 71.2V28.8L50 8Z"
        stroke="url(#logo-grad-1)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Intersecting premium ribbons forming a stylized letter A */}
      <path
        d="M50 22L76 72H63L50 47L37 72H24L50 22Z"
        fill="url(#logo-grad-1)"
      />
      {/* Inner glowing crossbar detail */}
      <path
        d="M40 52H60L50 32L40 52Z"
        fill="url(#logo-grad-2)"
      />
    </svg>
  );
}
