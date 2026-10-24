/**
 * 存錢線's world (06 E9.4): 晨光儲蓄所 (fictional), by day. Palette: wall
 * #E7F0E4, floor #D9D2C3, green #1E7D4F, wood #B98B5A. A number-ticket
 * machine left, a counter with a passbook stack, a brochure rack right, a
 * wall clock and a pig-shaped poster on the back wall.
 */
export default function Cunqian({ className }: { className?: string }) {
  return (
    <svg className={`scene ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="cq-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="440" fill="#E7F0E4" />
      <rect x="95" y="112" width="200" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        晨光儲蓄所
      </text>
      {/* wall clock and pig poster */}
      <circle cx="44" cy="80" r="22" fill="#fff" stroke="#1E7D4F" strokeWidth="4" />
      <path d="M44 66v14l10 6" fill="none" stroke="#1E7D4F" strokeWidth="3" strokeLinecap="round" />
      <rect x="312" y="56" width="58" height="76" rx="4" fill="#fff" />
      <ellipse cx="341" cy="96" rx="20" ry="14" fill="#F2A7B0" />
      <circle cx="356" cy="92" r="6" fill="#F2A7B0" />
      <rect x="326" y="106" width="5" height="10" fill="#F2A7B0" />
      <rect x="348" y="106" width="5" height="10" fill="#F2A7B0" />
      {/* counter */}
      <rect y="300" width="390" height="140" fill="#D3DECF" />
      <rect y="292" width="390" height="12" fill="#B98B5A" />
      <rect x="320" y="268" width="40" height="8" rx="2" fill="#1E7D4F" />
      <rect x="322" y="260" width="36" height="8" rx="2" fill="#2E9A63" />
      <rect x="318" y="276" width="44" height="16" rx="2" fill="#1E7D4F" />
      {/* ticket machine, left */}
      <rect x="18" y="340" width="56" height="100" rx="8" fill="#1E7D4F" />
      <rect x="28" y="354" width="36" height="24" rx="4" fill="#E7F0E4" />
      <rect x="36" y="394" width="20" height="6" rx="2" fill="#E7F0E4" />
      {/* brochure rack, right */}
      <rect x="318" y="334" width="56" height="106" rx="4" fill="#B98B5A" />
      <rect x="326" y="344" width="40" height="22" fill="#fff" />
      <rect x="326" y="374" width="40" height="22" fill="#CDE6D5" />
      <rect x="326" y="404" width="40" height="22" fill="#fff" />
      {/* floor */}
      <rect y="440" width="390" height="404" fill="#D9D2C3" />
      <path d="M0 520H390M0 620H390M0 740H390M130 440L80 844M260 440L310 844" stroke="#CBC3B2" strokeWidth="1.5" />
      <rect x="90" y="200" width="210" height="300" fill="url(#cq-stage)" />
    </svg>
  );
}
