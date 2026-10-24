/**
 * 投資線's world (06 E9.4): 穩健證券's trading office (fictional), at night.
 * Palette: wall #14202E, floor #0E1823, desks #2B3A4D, screen glow #8FD3FF.
 * Three monitors with neutral white line charts above the character zone,
 * ▲ ▼ marks on the ticker band (no red or green, E2.2), desks left and right.
 */
export default function Touzi({ className }: { className?: string }) {
  return (
    <svg className={`scene scene--night ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="tz-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#FFE9B0" stopOpacity=".35" />
          <stop offset="1" stopColor="#FFE9B0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="440" fill="#14202E" />
      <rect x="95" y="112" width="200" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        穩健證券
      </text>
      {/* ticker band */}
      <rect y="60" width="390" height="26" fill="#0B1520" />
      <path d="M14 73l5-6 5 6zM90 69l5 6 5-6zM170 73l5-6 5 6zM250 69l5 6 5-6zM330 73l5-6 5 6z" fill="#8FD3FF" />
      <path d="M30 73h44M106 73h44M186 73h44M266 73h44M346 73h34" stroke="#8FD3FF" strokeWidth="2" opacity=".6" />
      {/* three monitors */}
      <rect x="14" y="156" width="104" height="42" rx="6" fill="#1F2D3D" stroke="#8FD3FF" strokeWidth="2" />
      <path d="M24 188l18-8 16 4 20-14 16 6 14-10" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="143" y="156" width="104" height="42" rx="6" fill="#1F2D3D" stroke="#8FD3FF" strokeWidth="2" />
      <path d="M153 170l20 6 18-4 18 12 16-2 12 8" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="272" y="156" width="104" height="42" rx="6" fill="#1F2D3D" stroke="#8FD3FF" strokeWidth="2" />
      <path d="M282 188l16-4 16-12 18 6 16-8 14 2" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" />
      {/* desk and chair, left */}
      <rect x="0" y="360" width="86" height="12" fill="#2B3A4D" />
      <rect x="10" y="372" width="8" height="68" fill="#2B3A4D" />
      <rect x="68" y="372" width="8" height="68" fill="#2B3A4D" />
      <rect x="20" y="318" width="44" height="34" rx="4" fill="#1F2D3D" stroke="#8FD3FF" strokeWidth="1.5" />
      {/* desk, right */}
      <rect x="304" y="360" width="86" height="12" fill="#2B3A4D" />
      <rect x="370" y="372" width="8" height="68" fill="#2B3A4D" />
      {/* floor */}
      <rect y="440" width="390" height="404" fill="#0E1823" />
      <path d="M0 540H390M0 680H390M120 440L60 844M270 440L330 844" stroke="#182636" strokeWidth="2" />
      <ellipse cx="195" cy="470" rx="160" ry="30" fill="#8FD3FF" opacity=".06" />
      <rect x="90" y="200" width="210" height="300" fill="url(#tz-stage)" />
    </svg>
  );
}
