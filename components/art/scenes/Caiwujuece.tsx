/**
 * 財務決策線's world (06 E9.4): a rooftop at dusk. Three flat sky bands
 * (#2B3A67, #6B5B95, #F4A261; no gradient), roof #3B4660, skyline #1E2A44
 * with lit windows #FFD27A, a signpost with two arrows in the line's color
 * and white right, a railing left. No sign text: the choice is the arrows.
 * Night scene: .scene--night (E9.1.5); the stage light is warm.
 */
export default function Caiwujuece({ className }: { className?: string }) {
  return (
    <svg className={`scene scene--night ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="cw-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#FFE9B0" stopOpacity=".35" />
          <stop offset="1" stopColor="#FFE9B0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="160" fill="#2B3A67" />
      <rect y="160" width="390" height="120" fill="#6B5B95" />
      <rect y="280" width="390" height="160" fill="#F4A261" />
      {/* skyline with lit windows */}
      <path d="M0 440V330h40v-30h34v50h30v-80h36v60h28v-40h34v90h30v-60h40v30h30v-70h34v40h14v120z" fill="#1E2A44" />
      <path d="M48 312h8M48 326h8M140 290h8M140 306h8M150 320h8M246 300h8M258 318h8M330 290h8M342 306h8M20 350h8M200 360h8M300 360h8" stroke="#FFD27A" strokeWidth="6" />
      {/* roof */}
      <rect y="440" width="390" height="404" fill="#3B4660" />
      <path d="M0 520H390M0 640H390M0 780H390" stroke="#343E56" strokeWidth="2" />
      {/* railing, left */}
      <path d="M0 400h80M0 420h80" stroke="#8C99A3" strokeWidth="4" />
      <path d="M10 400v40M40 400v40M70 400v40" stroke="#8C99A3" strokeWidth="4" />
      {/* signpost with two arrows, right */}
      <rect x="342" y="300" width="6" height="140" fill="#8C99A3" />
      <path d="M312 304h44l12 12-12 12h-44z" fill="var(--line)" />
      <path d="M380 340h-44l-12 12 12 12h44z" fill="#fff" />
      <rect x="90" y="200" width="210" height="300" fill="url(#cw-stage)" />
    </svg>
  );
}
