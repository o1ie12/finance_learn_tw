/**
 * 租屋線's world (06 E9.4): a rental apartment, by day. Palette: wall
 * #F1E6D8, wood floor #C9A27B, curtains #7FB3D5, window #BFE0F5. A window
 * with curtains at the back, three stacked moving boxes left, a floor lamp
 * right, the 「出租」 notice on the wall as the one sign.
 */
export default function Zuwu({ className }: { className?: string }) {
  return (
    <svg className={`scene ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="zw-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="440" fill="#F1E6D8" />
      <rect x="135" y="112" width="120" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        出租
      </text>
      {/* window with curtains, back wall above the character zone */}
      <rect x="20" y="40" width="90" height="150" rx="4" fill="#BFE0F5" />
      <path d="M65 40v150M20 115h90" stroke="#fff" strokeWidth="4" />
      <path d="M14 34h102" stroke="#8C6A4E" strokeWidth="5" strokeLinecap="round" />
      <path d="M14 38h24q-6 76 4 156H14z" fill="#7FB3D5" />
      <path d="M116 38H92q6 76-4 156h28z" fill="#7FB3D5" />
      {/* skirting */}
      <rect y="428" width="390" height="12" fill="#E2D2BE" />
      {/* three moving boxes, left */}
      <rect x="6" y="372" width="76" height="56" rx="3" fill="#C9A27B" />
      <rect x="14" y="322" width="62" height="50" rx="3" fill="#D6B48E" />
      <rect x="22" y="282" width="48" height="40" rx="3" fill="#C9A27B" />
      <path d="M44 372v56M45 322v50M46 282v40" stroke="#A8825C" strokeWidth="3" />
      {/* floor lamp, right */}
      <path d="M330 250h40l-8 34h-24z" fill="#F4F0E8" />
      <rect x="347" y="284" width="6" height="144" fill="#5F6C79" />
      <ellipse cx="350" cy="430" rx="18" ry="5" fill="#5F6C79" />
      {/* wood floor */}
      <rect y="440" width="390" height="404" fill="#C9A27B" />
      <path d="M0 500H390M0 580H390M0 680H390M0 800H390M60 440v60M180 500v80M300 440v60M120 580v100M260 580v100M40 680v120M220 680v120" stroke="#B88F67" strokeWidth="2" />
      <rect x="90" y="200" width="210" height="300" fill="url(#zw-stage)" />
    </svg>
  );
}
