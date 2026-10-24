/**
 * 職涯線's world (06 E9.4): 晴空科技's open office (fictional), by day.
 * Palette: wall #E9EDF2, floor #B7C4D1, partitions #8FA6BD, window
 * #CFE3F5. A desk with a monitor left, a window with a skyline at the back,
 * a whiteboard with three sticky notes right, a plant, a wall clock.
 */
export default function Zhiya({ className }: { className?: string }) {
  return (
    <svg className={`scene ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="zy-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="440" fill="#E9EDF2" />
      <rect x="95" y="112" width="200" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        晴空科技
      </text>
      {/* window with a skyline, back wall (above the character zone) */}
      <rect x="110" y="160" width="170" height="40" rx="4" fill="#CFE3F5" />
      <path d="M110 200v-14h18v-10h14v18h16v-22h20v16h18v-8h22v12h16v-10h22v18z" fill="#A9C4DD" />
      <circle cx="40" cy="74" r="20" fill="#fff" stroke="#8FA6BD" strokeWidth="4" />
      <path d="M40 62v12l9 5" fill="none" stroke="#8FA6BD" strokeWidth="3" strokeLinecap="round" />
      {/* partitions */}
      <rect y="330" width="390" height="110" fill="#DCE3EA" />
      <rect x="0" y="300" width="86" height="140" fill="#8FA6BD" />
      <rect x="304" y="300" width="86" height="140" fill="#8FA6BD" />
      {/* desk with monitor, left */}
      <rect x="8" y="262" width="58" height="36" rx="4" fill="#2B3440" />
      <rect x="32" y="298" width="10" height="8" fill="#2B3440" />
      {/* whiteboard with three sticky notes, right */}
      <rect x="306" y="206" width="76" height="64" rx="4" fill="#fff" stroke="#8FA6BD" strokeWidth="3" />
      <rect x="314" y="216" width="18" height="18" fill="#FFE27A" />
      <rect x="338" y="220" width="18" height="18" fill="#9AD0F5" />
      <rect x="320" y="242" width="18" height="18" fill="#F7B7A3" />
      {/* floor */}
      <rect y="440" width="390" height="404" fill="#B7C4D1" />
      <path d="M0 560H390M0 700H390M130 440L80 844M260 440L310 844" stroke="#A9B7C5" strokeWidth="1.5" />
      {/* plant, left front */}
      <rect x="18" y="500" width="40" height="40" rx="6" fill="#8FA6BD" />
      <path d="M38 500c-22-18-26-44-12-56 4 20 9 28 12 36 4-12 8-28 20-36 8 20-2 42-20 56z" fill="#3F8F6B" />
      <rect x="90" y="200" width="210" height="300" fill="url(#zy-stage)" />
    </svg>
  );
}
