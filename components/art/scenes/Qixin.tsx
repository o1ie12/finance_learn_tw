/**
 * 消費線's world (06 E9.4): 暖陽夜市 (fictional), at night. Palette: sky
 * #1E2740, ground #3A3F52, awnings #E8743B and #F2B134, lanterns #FFD27A.
 * String lights across the top, two striped stalls left and right, a menu
 * board with prices on the right stall, steam puffs, a warm light pool.
 * Night scene: .scene--night (E9.1.5); the stage light is warm.
 */
export default function Qixin({ className }: { className?: string }) {
  return (
    <svg className={`scene scene--night ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="qx-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#FFE9B0" stopOpacity=".35" />
          <stop offset="1" stopColor="#FFE9B0" stopOpacity="0" />
        </radialGradient>
        <pattern id="qx-stripe" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="10" height="20" fill="#E8743B" />
          <rect x="10" width="10" height="20" fill="#F2B134" />
        </pattern>
      </defs>
      <rect width="390" height="440" fill="#1E2740" />
      <rect x="95" y="112" width="200" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        暖陽夜市
      </text>
      {/* string lights */}
      <path d="M0 70q98 40 195 0t195 0" fill="none" stroke="#5A607A" strokeWidth="2" />
      <circle cx="40" cy="82" r="6" fill="#FFD27A" />
      <circle cx="100" cy="88" r="6" fill="#FFD27A" />
      <circle cx="160" cy="80" r="6" fill="#FFD27A" />
      <circle cx="230" cy="80" r="6" fill="#FFD27A" />
      <circle cx="290" cy="88" r="6" fill="#FFD27A" />
      <circle cx="350" cy="82" r="6" fill="#FFD27A" />
      {/* left stall */}
      <rect x="0" y="236" width="86" height="28" fill="url(#qx-stripe)" />
      <rect x="6" y="264" width="6" height="176" fill="#5A607A" />
      <rect x="74" y="264" width="6" height="176" fill="#5A607A" />
      <rect x="0" y="360" width="86" height="80" fill="#6B4A3A" />
      <circle cx="30" cy="350" r="9" fill="#C8C0B0" opacity=".5" />
      <circle cx="44" cy="334" r="12" fill="#C8C0B0" opacity=".4" />
      {/* right stall with a menu board */}
      <rect x="304" y="236" width="86" height="28" fill="url(#qx-stripe)" />
      <rect x="310" y="264" width="6" height="176" fill="#5A607A" />
      <rect x="378" y="264" width="6" height="176" fill="#5A607A" />
      <rect x="318" y="278" width="56" height="64" rx="4" fill="#2A2F40" />
      <path d="M326 292h40M326 306h32M326 320h36" stroke="#FFD27A" strokeWidth="3" strokeLinecap="round" />
      <rect x="304" y="360" width="86" height="80" fill="#6B4A3A" />
      {/* ground and light pool */}
      <rect y="440" width="390" height="404" fill="#3A3F52" />
      <ellipse cx="195" cy="520" rx="170" ry="60" fill="#FFE9B0" opacity=".12" />
      <path d="M0 600H390M0 720H390" stroke="#454B60" strokeWidth="2" />
      <rect x="90" y="200" width="210" height="300" fill="url(#qx-stage)" />
    </svg>
  );
}
