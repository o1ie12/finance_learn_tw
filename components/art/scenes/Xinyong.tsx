/**
 * 信用線's world (06 E9.4): the lobby of 星河銀行 (fictional), by day.
 * Palette from the spec: wall #DDE9EE, floor #CBD6DC, counter #7D93A3,
 * plant #3F8F6B. Three teller windows on the back wall, a sign bar in the
 * line's color, rope stanchions left, a plant right, floor perspective lines.
 * Inside the character zone only fills and the stage light (E9.1.4): the
 * counter there is a plain band. The sign sits below the top bar (the bar
 * and status area cover the top 103px of the canvas). The sign's text color is --line-on (white
 * fails on 信用線's yellow, E2.5c).
 */
export default function Xinyong({ className }: { className?: string }) {
  return (
    <svg className={`scene ${className ?? ""}`} viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="xy-stage" cx="50%" cy="52%" r="38%">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="390" height="440" fill="#DDE9EE" />
      {/* sign bar */}
      <rect x="95" y="112" width="200" height="38" rx="6" fill="var(--line)" opacity=".92" />
      <text x="195" y="138" textAnchor="middle" fontSize="20" fontWeight="700" letterSpacing="3" fill="var(--line-on, #fff)">
        星河銀行
      </text>
      {/* three teller windows */}
      <rect x="22" y="160" width="100" height="120" rx="6" fill="#C9DBE3" />
      <rect x="145" y="160" width="100" height="120" rx="6" fill="#C9DBE3" />
      <rect x="268" y="160" width="100" height="120" rx="6" fill="#C9DBE3" />
      <path d="M22 258h100M145 258h100M268 258h100" stroke="#B3C7D1" strokeWidth="3" />
      {/* counter: detail outside the character zone, a plain band inside */}
      <rect y="330" width="390" height="110" fill="#C3D1D8" />
      <rect y="322" width="390" height="10" fill="#7D93A3" />
      <rect x="0" y="342" width="84" height="82" fill="#7D93A3" />
      <rect x="306" y="342" width="84" height="82" fill="#7D93A3" />
      {/* floor and perspective lines */}
      <rect y="440" width="390" height="404" fill="#CBD6DC" />
      <path d="M195 440V844M130 440L40 844M260 440L350 844M65 440L-60 844M325 440L450 844M0 560H390M0 700H390" stroke="#BAC7CE" strokeWidth="1.5" />
      {/* rope stanchions, left */}
      <rect x="18" y="470" width="6" height="64" rx="3" fill="#8A9AA6" />
      <rect x="66" y="470" width="6" height="64" rx="3" fill="#8A9AA6" />
      <path d="M21 480q24 18 48 0" fill="none" stroke="#B3261E" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="21" cy="536" rx="12" ry="4" fill="#8A9AA6" />
      <ellipse cx="69" cy="536" rx="12" ry="4" fill="#8A9AA6" />
      {/* plant, right */}
      <rect x="326" y="500" width="40" height="40" rx="6" fill="#7D93A3" />
      <path d="M346 500c-24-20-30-48-14-62 4 22 10 30 14 40 4-12 8-30 22-40 10 22-2 46-22 62z" fill="#3F8F6B" />
      {/* stage light, drawn last */}
      <rect x="90" y="200" width="210" height="300" fill="url(#xy-stage)" />
    </svg>
  );
}
