import React from 'react';

export function Logo({ size = 26, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-svg-icon ${className}`}
    >
      <rect width="100" height="100" rx="24" fill="#ffffff" />
      {/* Dynamic Linkspace "L" and connected node graph paths */}
      <path
        d="M28 24V74C28 75.1046 28.8954 76 30 76H72"
        stroke="#0c1d28"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="72" cy="76" r="6" fill="#0c1d28" />
      <circle cx="28" cy="24" r="6" fill="#0c1d28" />
      <path
        d="M48 42L68 42M68 42L58 32M68 42L58 52"
        stroke="#0c1d28"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
