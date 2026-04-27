// Decorative SVG leaves used across pages
export const LeafShape = ({ className = "", color = "currentColor" }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 200 200" className={className} fill={color} xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M100 10 C150 30 180 80 170 130 C160 175 110 195 60 180 C30 170 15 140 20 110 C28 60 60 25 100 10 Z" opacity="0.9" />
    <path d="M100 30 Q105 100 60 175" stroke="hsl(var(--earth))" strokeWidth="2" fill="none" opacity="0.4" />
  </svg>
);
