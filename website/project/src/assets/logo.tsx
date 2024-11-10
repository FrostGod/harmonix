export const Logo = () => (
  <svg width="50" height="50" viewBox="0 0 200 200">
    <g>
      {/* Flower petals */}
      <path
        d="M100 20 C60 60, 60 140, 100 180 C140 140, 140 60, 100 20"
        fill="#FF69B4"
      />
      <path
        d="M20 100 C60 60, 140 60, 180 100 C140 140, 60 140, 20 100"
        fill="#FFB6C1"
      />
      {/* Headphones */}
      <path
        d="M85 100 C85 80, 115 80, 115 100"
        fill="#E0FFE0"
        strokeWidth="4"
      />
      {/* Music notes */}
      <path
        d="M130 70 Q140 60, 150 70 L155 90"
        stroke="#2E8B57"
        fill="none"
        strokeWidth="3"
      />
      <circle cx="155" cy="90" r="4" fill="#2E8B57" />
    </g>
  </svg>
); 