/**
 * 創業線's world (06 E9.4): a small shopfront (小店), in the morning.
 * Palette: sky #FFE3C2, wall #F4EBDD, shutter #B8C0C8, awning stripes in
 * the line's color and white. A half-open shutter, a counter with the
 * 「營業中」 sign, crates of goods right, a hanging bulb, a chalkboard menu.
 */
export default function Chuangye({ className }: { className?: string }) {
  return (
    <svg className={`scene ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="cy-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id="cy-awning" width="32" height="40" patternUnits="userSpaceOnUse">
          <rect width="16" height="40" fill="var(--line)" />
          <rect x="16" width="16" height="40" fill="#fff" />
        </pattern>
      </defs>
      <rect width="390" height="100" fill="#FFE3C2" />
      <rect y="100" width="390" height="340" fill="#F4EBDD" />
      {/* awning */}
      <rect y="64" width="390" height="40" fill="url(#cy-awning)" />
      <rect x="95" y="112" width="200" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        營業中
      </text>
      {/* half-open shutter: ribbed panel above the character zone */}
      <rect x="100" y="160" width="190" height="40" fill="#B8C0C8" />
      <path d="M100 170h190M100 180h190M100 190h190" stroke="#A3ACB5" strokeWidth="2" />
      <rect y="200" width="390" height="240" fill="#3A3226" opacity=".12" />
      {/* hanging bulb and chalkboard, left */}
      <path d="M40 104v40" stroke="#5F6C79" strokeWidth="2" />
      <circle cx="40" cy="152" r="10" fill="#FFD27A" />
      <rect x="10" y="230" width="70" height="90" rx="4" fill="#2F3A33" />
      <path d="M20 250h50M20 270h40M20 290h46" stroke="#E9EEF2" strokeWidth="3" strokeLinecap="round" opacity=".8" />
      {/* counter */}
      <rect y="350" width="390" height="90" fill="#D9C7AE" />
      <rect y="342" width="390" height="10" fill="#B08A63" />
      {/* crates of goods, right */}
      <rect x="306" y="380" width="78" height="60" rx="3" fill="#B08A63" />
      <rect x="314" y="360" width="20" height="20" rx="10" fill="#E8743B" />
      <rect x="338" y="362" width="20" height="18" rx="9" fill="#F2B134" />
      <rect x="360" y="360" width="18" height="20" rx="9" fill="#7FB069" />
      {/* floor */}
      <rect y="440" width="390" height="404" fill="#CFC3B0" />
      <path d="M0 540H390M0 660H390M120 440L60 844M270 440L330 844" stroke="#C0B39E" strokeWidth="1.5" />
      <rect x="90" y="200" width="210" height="300" fill="url(#cy-stage)" />
    </svg>
  );
}
