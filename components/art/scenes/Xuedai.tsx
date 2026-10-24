/**
 * 學貸線's world (06 E9.4): the gate of 星河大學 (fictional), by day.
 * Palette: sky #D6E8F5, lawn #9CCB8A, brick #B9825F, path #E6DCC8. A gate
 * arch with the sign at the back, a clock tower right, a bench left, two
 * trees, a banner.
 */
export default function Xuedai({ className }: { className?: string }) {
  return (
    <svg className={`scene ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="xd-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="440" fill="#D6E8F5" />
      {/* gate arch carrying the sign */}
      <rect x="58" y="96" width="274" height="62" rx="8" fill="#B9825F" />
      <rect x="58" y="158" width="24" height="282" fill="#B9825F" />
      <rect x="308" y="158" width="24" height="282" fill="#B9825F" />
      <rect x="95" y="112" width="200" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        星河大學
      </text>
      {/* clock tower, right */}
      <rect x="340" y="40" width="46" height="280" fill="#A8735A" />
      <path d="M336 40l27-28 27 28z" fill="#8C5E48" />
      <circle cx="363" cy="70" r="15" fill="#fff" />
      <path d="M363 60v10l7 4" fill="none" stroke="#8C5E48" strokeWidth="3" strokeLinecap="round" />
      {/* banner, left */}
      <rect x="10" y="40" width="38" height="50" rx="3" fill="var(--line)" opacity=".7" />
      {/* trees */}
      <circle cx="40" cy="250" r="34" fill="#5E9E52" />
      <rect x="36" y="280" width="8" height="70" fill="#7A5230" />
      <circle cx="354" cy="360" r="28" fill="#5E9E52" />
      <rect x="350" y="386" width="8" height="54" fill="#7A5230" />
      {/* lawn and path */}
      <rect y="320" width="390" height="120" fill="#B5D9A6" />
      <rect y="440" width="390" height="404" fill="#9CCB8A" />
      <path d="M150 440L90 844H300L240 440z" fill="#E6DCC8" />
      {/* bench, left */}
      <rect x="10" y="500" width="70" height="12" rx="4" fill="#8C5E48" />
      <rect x="16" y="512" width="6" height="22" fill="#6E4A38" />
      <rect x="68" y="512" width="6" height="22" fill="#6E4A38" />
      <rect x="90" y="200" width="210" height="300" fill="url(#xd-stage)" />
    </svg>
  );
}
