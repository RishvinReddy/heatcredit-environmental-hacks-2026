import React from "react";

interface DoodleProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Hand-drawn sun sketch with organic rays
 */
export function DoodleSun({ className = "w-12 h-12 text-amber-600/85", ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Loose, imperfect sketched circle */}
      <path
        d="M 50,22 C 66,21 78,34 78,50 C 77,66 65,78 49,78 C 33,77 22,65 22,49 C 23,33 35,22 50,22 Z"
        strokeDasharray="180"
        className="opacity-90"
      />
      {/* Radiant sketch rays with subtle varied lengths */}
      <path d="M 50,8 L 49,16" />
      <path d="M 50,84 L 51,92" />
      <path d="M 8,50 L 16,49" />
      <path d="M 84,50 L 92,51" />
      <path d="M 20,20 L 26,26" />
      <path d="M 74,74 L 80,80" />
      <path d="M 21,79 L 27,73" />
      <path d="M 79,21 L 73,27" />
      {/* Secondary micro accents */}
      <path d="M 33,14 L 35,19" strokeWidth="1.6" />
      <path d="M 67,14 L 65,19" strokeWidth="1.6" />
      <path d="M 86,34 L 81,36" strokeWidth="1.6" />
      <path d="M 86,66 L 81,64" strokeWidth="1.6" />
    </svg>
  );
}

/**
 * Hand-drawn imperfect underline
 */
export function DoodleUnderline({ className = "w-48 h-4 text-amber-700/80", ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 200 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M 4,9 C 45,13 95,5 145,10 C 168,12 188,8 196,7" />
      <path d="M 18,12 C 60,15 110,9 160,13 C 175,14 185,12 190,11" strokeWidth="1.4" opacity="0.6" />
    </svg>
  );
}

/**
 * Curved sketch arrow pointing towards a visual or target
 */
export function DoodleArrow({ className = "w-16 h-12 text-amber-700/85", ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 100 60"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {/* Sweeping curve */}
      <path d="M 8,48 C 28,12 62,8 88,32" />
      {/* Arrowhead strokes */}
      <path d="M 72,28 L 88,32 L 80,46" />
    </svg>
  );
}

/**
 * Downward curved sketch arrow
 */
export function DoodleArrowDown({ className = "w-10 h-14 text-amber-700/85", ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 40 70"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M 15,6 C 28,24 26,45 18,62" />
      <path d="M 8,50 L 18,62 L 28,52" />
    </svg>
  );
}

/**
 * Hand-drawn loose oval/circle around a word or stat
 */
export function DoodleCircle({ className = "w-full h-full text-amber-700/70", ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 120 50"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M 12,28 C 10,14 36,8 65,7 C 98,6 112,16 110,30 C 107,43 78,46 45,45 C 20,44 7,36 8,26 C 9,18 24,11 46,9" />
    </svg>
  );
}

/**
 * Wavy rising heat lines
 */
export function DoodleHeatWave({ className = "w-10 h-8 text-amber-600/80", ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M 8,34 C 12,28 6,20 10,12 C 12,8 10,6 9,4" />
      <path d="M 20,36 C 24,30 18,22 22,14 C 24,10 22,7 21,5" />
      <path d="M 32,34 C 36,28 30,20 34,12 C 36,8 34,6 33,4" />
    </svg>
  );
}

/**
 * Notebook starburst emphasis spark
 */
export function DoodleSparkle({ className = "w-6 h-6 text-amber-600/80", ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 30 30"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M 15,3 L 15,27" />
      <path d="M 3,15 L 27,15" />
      <path d="M 7,7 L 23,23" strokeWidth="1.5" />
      <path d="M 23,7 L 7,23" strokeWidth="1.5" />
    </svg>
  );
}

/**
 * Hand-drawn decorative bracket for grouping sections
 */
export function DoodleBracket({ className = "w-8 h-32 text-amber-700/60", ...props }: DoodleProps) {
  return (
    <svg
      viewBox="0 0 30 120"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M 25,6 C 12,8 10,24 10,48 C 10,56 4,58 2,60 C 4,62 10,64 10,72 C 10,96 12,112 25,114" />
    </svg>
  );
}

/**
 * Clean SVG Github Icon
 */
export function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

/**
 * Clean SVG LinkedIn Icon
 */
export function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}
