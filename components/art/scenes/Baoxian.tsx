/**
 * 保險線's world (06 E9.4): 安心診所's waiting room (fictional), by day.
 * Palette: wall #E4F1F2, floor #CFE0E2, chairs #5BA7B0, cross #2A9D8F. A
 * row of three chairs left, a reception desk with a plant at the back, a
 * white plus on a teal rounded square, a wall clock.
 */
export default function Baoxian({ className }: { className?: string }) {
  return (
    <svg className={`scene ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="bx-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="440" fill="#E4F1F2" />
      <rect x="95" y="112" width="200" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        安心診所
      </text>
      {/* cross and clock */}
      <rect x="22" y="62" width="56" height="56" rx="14" fill="#2A9D8F" />
      <path d="M50 74v32M34 90h32" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
      <circle cx="342" cy="88" r="24" fill="#fff" stroke="#5BA7B0" strokeWidth="4" />
      <path d="M342 72v16l12 4" fill="none" stroke="#5BA7B0" strokeWidth="3" strokeLinecap="round" />
      {/* reception desk at the back */}
      <rect y="300" width="390" height="140" fill="#D6E8EA" />
      <rect x="0" y="250" width="390" height="10" fill="#BFD9DC" />
      <rect x="312" y="216" width="30" height="34" rx="4" fill="#5BA7B0" />
      <path d="M327 216c-16-14-18-34-6-42 2 14 4 20 6 28 3-10 6-20 16-28 6 16-2 30-16 42z" fill="#3F8F6B" />
      {/* three chairs, left */}
      <rect x="4" y="370" width="26" height="30" rx="6" fill="#5BA7B0" />
      <rect x="32" y="370" width="26" height="30" rx="6" fill="#5BA7B0" />
      <rect x="60" y="370" width="26" height="30" rx="6" fill="#5BA7B0" />
      <rect x="4" y="400" width="82" height="10" rx="3" fill="#4A8F97" />
      <rect x="12" y="410" width="5" height="30" fill="#4A8F97" />
      <rect x="74" y="410" width="5" height="30" fill="#4A8F97" />
      {/* floor */}
      <rect y="440" width="390" height="404" fill="#CFE0E2" />
      <path d="M0 540H390M0 660H390M0 780H390M195 440V844M98 440L50 844M292 440L340 844" stroke="#BFD3D6" strokeWidth="1.5" />
      <rect x="90" y="200" width="210" height="300" fill="url(#bx-stage)" />
    </svg>
  );
}
