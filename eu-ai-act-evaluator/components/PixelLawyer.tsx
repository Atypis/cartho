'use client';

export function PixelLawyer({ className = "" }: { className?: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Background */}
      <rect width="64" height="64" fill="transparent" />

      {/* Desk */}
      <rect x="8" y="48" width="48" height="8" fill="#5C3A21" />
      <rect x="8" y="48" width="48" height="2" fill="#6B4728" />

      {/* Book on desk */}
      <rect x="32" y="42" width="16" height="2" fill="#8B4513" />
      <rect x="32" y="44" width="16" height="8" fill="#A0522D" />
      <rect x="33" y="44" width="14" height="8" fill="#CD853F" />
      <line x1="40" y1="44" x2="40" y2="52" stroke="#8B4513" strokeWidth="1" />

      {/* Lawyer body - sitting */}
      <rect x="20" y="32" width="16" height="16" fill="#2B1810" /> {/* Robe */}
      <rect x="22" y="34" width="12" height="2" fill="#3D2817" /> {/* Robe highlight */}

      {/* Arms reading book */}
      <rect x="28" y="38" width="4" height="8" fill="#E8B088" /> {/* Right arm */}
      <rect x="32" y="40" width="4" height="4" fill="#E8B088" /> {/* Right hand on book */}

      {/* Head */}
      <rect x="24" y="20" width="12" height="12" fill="#E8B088" />

      {/* Hair */}
      <rect x="24" y="20" width="12" height="4" fill="#3D2817" />
      <rect x="24" y="20" width="2" height="8" fill="#3D2817" />
      <rect x="34" y="20" width="2" height="8" fill="#3D2817" />

      {/* Glasses */}
      <rect x="26" y="26" width="3" height="3" fill="transparent" stroke="#2B1810" strokeWidth="1" />
      <rect x="31" y="26" width="3" height="3" fill="transparent" stroke="#2B1810" strokeWidth="1" />
      <line x1="29" y1="27" x2="31" y2="27" stroke="#2B1810" strokeWidth="1" />

      {/* Smile */}
      <rect x="28" y="29" width="4" height="1" fill="#2B1810" />

      {/* Thought bubble (optional - can be toggled) */}
      <circle cx="44" cy="20" r="4" fill="white" stroke="#2B1810" strokeWidth="1" />
      <circle cx="42" cy="24" r="2" fill="white" stroke="#2B1810" strokeWidth="1" />
      <text x="42" y="23" fontSize="6" fill="#2B1810" fontFamily="monospace">§</text>
    </svg>
  );
}

export function PixelLawyerAnimated({ className = "" }: { className?: string }) {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Background */}
      <rect width="64" height="64" fill="transparent" />

      {/* Desk */}
      <rect x="8" y="48" width="48" height="8" fill="#5C3A21" />
      <rect x="8" y="48" width="48" height="2" fill="#6B4728" />

      {/* Book on desk - animated pages */}
      <rect x="32" y="42" width="16" height="2" fill="#8B4513" />
      <rect x="32" y="44" width="16" height="8" fill="#A0522D">
        <animate
          attributeName="fill"
          values="#A0522D;#CD853F;#A0522D"
          dur="2s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="33" y="44" width="14" height="8" fill="#CD853F" />
      <line x1="40" y1="44" x2="40" y2="52" stroke="#8B4513" strokeWidth="1">
        <animate
          attributeName="x1"
          values="40;39;40"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="x2"
          values="40;39;40"
          dur="2s"
          repeatCount="indefinite"
        />
      </line>

      {/* Lawyer body - sitting */}
      <rect x="20" y="32" width="16" height="16" fill="#2B1810" />
      <rect x="22" y="34" width="12" height="2" fill="#3D2817" />

      {/* Arms reading book */}
      <rect x="28" y="38" width="4" height="8" fill="#E8B088" />
      <rect x="32" y="40" width="4" height="4" fill="#E8B088" />

      {/* Head - subtle nod animation */}
      <rect x="24" y="20" width="12" height="12" fill="#E8B088">
        <animate
          attributeName="y"
          values="20;21;20"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Hair */}
      <rect x="24" y="20" width="12" height="4" fill="#3D2817">
        <animate
          attributeName="y"
          values="20;21;20"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="24" y="20" width="2" height="8" fill="#3D2817">
        <animate
          attributeName="y"
          values="20;21;20"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>
      <rect x="34" y="20" width="2" height="8" fill="#3D2817">
        <animate
          attributeName="y"
          values="20;21;20"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Glasses */}
      <g>
        <animate
          attributeName="opacity"
          values="1;0.8;1"
          dur="3s"
          repeatCount="indefinite"
        />
        <rect x="26" y="26" width="3" height="3" fill="transparent" stroke="#2B1810" strokeWidth="1">
          <animate
            attributeName="y"
            values="26;27;26"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="31" y="26" width="3" height="3" fill="transparent" stroke="#2B1810" strokeWidth="1">
          <animate
            attributeName="y"
            values="26;27;26"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>
        <line x1="29" y1="27" x2="31" y2="27" stroke="#2B1810" strokeWidth="1">
          <animate
            attributeName="y1"
            values="27;28;27"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values="27;28;27"
            dur="3s"
            repeatCount="indefinite"
          />
        </line>
      </g>

      {/* Smile */}
      <rect x="28" y="29" width="4" height="1" fill="#2B1810">
        <animate
          attributeName="y"
          values="29;30;29"
          dur="3s"
          repeatCount="indefinite"
        />
      </rect>

      {/* Thought bubble - fades in/out */}
      <g>
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          dur="6s"
          repeatCount="indefinite"
        />
        <circle cx="44" cy="20" r="4" fill="white" stroke="#2B1810" strokeWidth="1" />
        <circle cx="42" cy="24" r="2" fill="white" stroke="#2B1810" strokeWidth="1" />
        <text x="42" y="23" fontSize="6" fill="#2B1810" fontFamily="monospace">§</text>
      </g>
    </svg>
  );
}
