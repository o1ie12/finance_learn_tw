/**
 * The platform (06 E9.2): home, the creator and the ride. Numbers from the
 * spec: wall #D9E0E6 with a 28px tile grid to y250, door header to y266,
 * tunnel with glass panels to y440, the tactile strip y440 to 454 with
 * ticks every 18px, then the floor. Bench and route-map poster sit left,
 * outside the character zone (x90 to 300, y200 to 500); the stage light is
 * drawn last (E9.1.4). Art: raw hex is allowed here (E2.1).
 */
export default function Platform({ className }: { className?: string }) {
  return (
    <svg className={`scene ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <pattern id="pf-tile" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M28 0H0V28" fill="none" stroke="#C3CDD5" strokeWidth="1" />
        </pattern>
        <pattern id="pf-tick" x="4" width="18" height="14" patternUnits="userSpaceOnUse">
          <rect width="2" height="14" fill="#D9A900" />
        </pattern>
        <radialGradient id="pf-glow" cx="50%" cy="0%" r="70%">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="pf-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* wall and tiles */}
      <rect width="390" height="250" fill="#D9E0E6" />
      <rect width="390" height="250" fill="url(#pf-tile)" />
      {/* route-map poster, left wall */}
      <rect x="18" y="118" width="62" height="84" rx="4" fill="#F4F6F8" />
      <path d="M26 140h46M26 158l20 0 14 14h12M30 184l18-26 20 0" fill="none" stroke="#0070BD" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 176h46" fill="none" stroke="#1F8A4C" strokeWidth="3" strokeLinecap="round" />
      {/* door header, tunnel, glass, mullions */}
      <rect y="250" width="390" height="16" fill="#2B3440" />
      <rect y="266" width="390" height="174" fill="#1B232B" />
      <rect x="10" y="278" width="112" height="150" rx="6" fill="#2E3B47" opacity=".92" />
      <rect x="139" y="278" width="112" height="150" rx="6" fill="#2E3B47" opacity=".92" />
      <rect x="268" y="278" width="112" height="150" rx="6" fill="#2E3B47" opacity=".92" />
      <rect x="127" y="266" width="8" height="174" fill="#8C99A3" />
      <rect x="256" y="266" width="8" height="174" fill="#8C99A3" />
      {/* tactile strip */}
      <rect y="440" width="390" height="14" fill="#F2C200" />
      <rect y="440" width="390" height="14" fill="url(#pf-tick)" />
      {/* floor, glow, seams */}
      <rect y="454" width="390" height="390" fill="#AEB8C0" />
      <rect y="454" width="390" height="260" fill="url(#pf-glow)" />
      <path d="M0 540H390M0 640H390M0 760H390M98 454L40 844M195 454V844M292 454L350 844" stroke="#9DA8B1" strokeWidth="1" />
      {/* bench, left */}
      <rect x="14" y="470" width="66" height="12" rx="4" fill="#5F6C79" />
      <rect x="20" y="482" width="6" height="22" fill="#3D4A57" />
      <rect x="68" y="482" width="6" height="22" fill="#3D4A57" />
      {/* stage light, drawn last */}
      <rect x="90" y="200" width="210" height="300" fill="url(#pf-stage)" />
    </svg>
  );
}
