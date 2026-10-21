const MAIN_ANGLES = Array.from({ length: 24 }, (_, i) => i * 7.5);
const ACCENT_ANGLES = Array.from({ length: 24 }, (_, i) => 3.75 + i * 7.5);

// Engraved rosette, the fine line pattern printed on banknotes and cheques.
// `spread` and `accentSpread` change how open the pattern looks.
export default function Rosette({ spread, accentSpread, className = '' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 1000"
      className={`pointer-events-none absolute h-[1000px] w-[1000px] origin-center animate-settle motion-reduce:animate-none ${className}`}
    >
      <g fill="none" stroke="currentColor" strokeWidth="1" className="text-verdigris">
        {MAIN_ANGLES.map((angle) => (
          <ellipse
            key={angle}
            cx="500"
            cy="500"
            rx="460"
            ry={spread}
            transform={`rotate(${angle} 500 500)`}
          />
        ))}
        <circle cx="500" cy="500" r="472" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="1" className="text-brass opacity-[0.28]">
        {ACCENT_ANGLES.map((angle) => (
          <ellipse
            key={angle}
            cx="500"
            cy="500"
            rx="460"
            ry={accentSpread}
            transform={`rotate(${angle} 500 500)`}
          />
        ))}
        <circle cx="500" cy="500" r="38" />
      </g>
    </svg>
  );
}