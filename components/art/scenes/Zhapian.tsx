/**
 * 詐騙線's world (06 E9.4): an alley of phone screens (巷口), at night.
 * Palette: wall #1A1F2B, ground #11151D, cyan #7FE0FF and amber #FFE27A
 * glows. Alley perspective lines, four floating phone rectangles with "!"
 * bubbles, a street lamp left, bins right, overhead wires. Uneasy, not
 * frightening: nothing graphic.
 */
export default function Zhapian({ className }: { className?: string }) {
  return (
    <svg className={`scene scene--night ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="zp-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#FFE9B0" stopOpacity=".35" />
          <stop offset="1" stopColor="#FFE9B0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="440" fill="#1A1F2B" />
      <rect x="95" y="112" width="200" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        巷口
      </text>
      {/* wires */}
      <path d="M0 50q195 50 390 0M0 84q195 34 390 4" fill="none" stroke="#2C3446" strokeWidth="2" />
      {/* alley walls in perspective */}
      <path d="M0 160L120 230V440H0z" fill="#202634" />
      <path d="M390 160L270 230V440H390z" fill="#202634" />
      {/* four phones with "!" bubbles */}
      <rect x="14" y="180" width="30" height="52" rx="6" fill="#11151D" stroke="#7FE0FF" strokeWidth="2" />
      <circle cx="50" cy="176" r="9" fill="#FFE27A" />
      <rect x="49" y="170" width="2.5" height="7" fill="#11151D" />
      <rect x="342" y="196" width="30" height="52" rx="6" fill="#11151D" stroke="#7FE0FF" strokeWidth="2" />
      <circle cx="338" cy="192" r="9" fill="#FFE27A" />
      <rect x="337" y="186" width="2.5" height="7" fill="#11151D" />
      <rect x="120" y="58" width="26" height="44" rx="5" fill="#11151D" stroke="#7FE0FF" strokeWidth="2" opacity=".8" />
      <rect x="250" y="160" width="26" height="40" rx="5" fill="#11151D" stroke="#FFE27A" strokeWidth="2" opacity=".8" />
      {/* street lamp, left */}
      <rect x="40" y="290" width="6" height="150" fill="#3A4458" />
      <rect x="28" y="280" width="30" height="12" rx="4" fill="#3A4458" />
      <ellipse cx="43" cy="296" rx="18" ry="6" fill="#FFE27A" opacity=".35" />
      {/* bins, right */}
      <rect x="318" y="384" width="30" height="56" rx="4" fill="#2C3446" />
      <rect x="352" y="394" width="30" height="46" rx="4" fill="#262D3D" />
      {/* ground */}
      <rect y="440" width="390" height="404" fill="#11151D" />
      <path d="M120 440L-40 844M270 440L430 844M195 440V844M0 560H390M0 700H390" stroke="#1C2230" strokeWidth="2" />
      <ellipse cx="195" cy="470" rx="150" ry="28" fill="#7FE0FF" opacity=".05" />
      <rect x="90" y="200" width="210" height="300" fill="url(#zp-stage)" />
    </svg>
  );
}
