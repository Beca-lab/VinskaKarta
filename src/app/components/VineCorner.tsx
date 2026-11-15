type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const POSITION: Record<Corner, string> = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-2 right-2",
};

const FLIP: Record<Corner, string> = {
  "top-left": "",
  "top-right": "transform scale-x-[-1]",
  "bottom-left": "transform scale-y-[-1]",
  "bottom-right": "transform scale-[-1]",
};

/** Ukras u uglu drvenog rama: grana vinove loze sa grozdom i listovima. */
export function VineCorner({ corner }: { corner: Corner }) {
  return (
    <div className={`absolute ${POSITION[corner]} w-24 h-24 pointer-events-none z-10`}>
      <svg viewBox="0 0 100 100" className={`w-full h-full ${FLIP[corner]}`}>
        {/* Grana */}
        <path
          d="M5,95 Q15,75 25,65 Q35,55 45,45 Q55,35 65,25 Q75,15 95,5"
          stroke="#4a5d23"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Grozd */}
        <circle cx="35" cy="55" r="5" fill="#7c3aed" opacity="0.9" />
        <circle cx="42" cy="53" r="5" fill="#8b5cf6" opacity="0.9" />
        <circle cx="28" cy="53" r="5" fill="#6d28d9" opacity="0.9" />
        <circle cx="35" cy="48" r="5" fill="#7c3aed" opacity="0.9" />
        <circle cx="35" cy="62" r="5" fill="#6d28d9" opacity="0.9" />
        <circle cx="42" cy="60" r="4.5" fill="#8b5cf6" opacity="0.85" />
        <circle cx="28" cy="60" r="4.5" fill="#6d28d9" opacity="0.85" />

        {/* Listovi */}
        <path d="M50,40 Q55,35 60,40 Q65,45 60,50 Q55,55 50,50 Q45,45 50,40" fill="#4d7c0f" opacity="0.8" />
        <path d="M20,70 Q25,65 30,70 Q35,75 30,80 Q25,85 20,80 Q15,75 20,70" fill="#65a30d" opacity="0.8" />
        <path d="M68,28 Q73,23 78,28 Q83,33 78,38 Q73,43 68,38 Q63,33 68,28" fill="#4d7c0f" opacity="0.75" />
      </svg>
    </div>
  );
}
