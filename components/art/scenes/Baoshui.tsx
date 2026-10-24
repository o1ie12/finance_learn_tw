/**
 * 報稅線's world (06 E9.4): 稅務服務台's service hall (fictional), by day.
 * Palette: wall #EEEAD9, floor #C9C3AE, display #1B1B1B with #E5483B
 * digits (a physical object here, not a meaning). Counter windows at the
 * back, a queue-number display, a ticket machine left, a form rack right,
 * waiting chairs.
 */
export default function Baoshui({ className }: { className?: string }) {
  return (
    <svg className={`scene ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="bs-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="440" fill="#EEEAD9" />
      <rect x="95" y="112" width="200" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        稅務服務台
      </text>
      {/* queue display (the digits are shapes, not text) */}
      <rect x="296" y="52" width="80" height="40" rx="4" fill="#1B1B1B" />
      <path d="M308 82l6-20 6 20M310 76h8M328 62v20M338 62h10v10h-10v10h10M356 62h10v20h-10zM356 72h10" fill="none" stroke="#E5483B" strokeWidth="3" strokeLinejoin="round" />
      {/* counter windows */}
      <rect x="14" y="160" width="104" height="40" rx="4" fill="#DCD6C0" />
      <rect x="143" y="160" width="104" height="40" rx="4" fill="#DCD6C0" />
      <rect x="272" y="160" width="104" height="40" rx="4" fill="#DCD6C0" />
      <rect y="300" width="390" height="140" fill="#E2DCC6" />
      <rect y="292" width="390" height="10" fill="#B8B09A" />
      {/* ticket machine, left */}
      <rect x="18" y="330" width="52" height="110" rx="8" fill="#5F6C79" />
      <rect x="28" y="344" width="32" height="20" rx="3" fill="#EEEAD9" />
      {/* form rack, right */}
      <rect x="318" y="320" width="56" height="120" rx="4" fill="#B8B09A" />
      <rect x="326" y="330" width="40" height="24" fill="#fff" />
      <rect x="326" y="362" width="40" height="24" fill="#fff" />
      <rect x="326" y="394" width="40" height="24" fill="#fff" />
      {/* floor */}
      <rect y="440" width="390" height="404" fill="#C9C3AE" />
      <path d="M0 520H390M0 640H390M0 780H390M98 440L50 844M292 440L340 844" stroke="#BCB59F" strokeWidth="1.5" />
      {/* waiting chairs, front */}
      <rect x="20" y="560" width="30" height="30" rx="6" fill="#5F6C79" />
      <rect x="54" y="560" width="30" height="30" rx="6" fill="#5F6C79" />
      <rect x="306" y="560" width="30" height="30" rx="6" fill="#5F6C79" />
      <rect x="340" y="560" width="30" height="30" rx="6" fill="#5F6C79" />
      <rect x="90" y="200" width="210" height="300" fill="url(#bs-stage)" />
    </svg>
  );
}
