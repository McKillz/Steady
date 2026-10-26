import React from 'react';

// Steady brand mark — a minimal pulse/signal line evoking a calm, steady
// rhythm and connected daily signals. Original artwork, no copyrighted imagery.
export default function BrandMark({ className = 'h-10 w-10' }) {
  return (
    <div className={`flex items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-amber-500 text-white shadow-sm ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[55%] w-[55%]"
        aria-hidden="true"
      >
        <path d="M2 12h3.5l2-6 3 12 2.5-8 2 4h6.5" />
      </svg>
    </div>
  );
}