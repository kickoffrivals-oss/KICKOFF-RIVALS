import React from "react";

interface RedAviatorPlaneProps {
  className?: string;
  isFlying?: boolean;
  flipped?: boolean;
}

/**
 * Scalable SVG Red Aviator Aeroplane
 * Faithfully wraps the 3D red monoplane asset in an SVG viewport with
 * animated spinning propeller disk, wind vortex trails, and infinite scalability.
 */
export const RedAviatorPlane: React.FC<RedAviatorPlaneProps> = ({
  className = "w-20 h-12 sm:w-28 sm:h-16 md:w-36 md:h-20",
  isFlying = true,
  flipped = true,
}) => {
  return (
    <div
      className={`relative inline-block select-none pointer-events-none transition-transform ${
        flipped ? "scale-x-[-1]" : ""
      } ${className}`}
    >
      <svg
        viewBox="0 0 800 474"
        className="w-full h-full overflow-visible drop-shadow-[0_12px_24px_rgba(220,38,38,0.45)]"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyan/white wind speed streaks for flight */}
          <linearGradient id="windStreak" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0" />
            <stop offset="60%" stopColor="#00f0ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
          </linearGradient>

          {/* Propeller motion blur radial glow */}
          <radialGradient id="propellerBlur" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ef4444" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#1e293b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Dynamic Flight Wingtip Wind Trails */}
        {isFlying && (
          <g className="opacity-75">
            {/* Wingtip vortex trail 1 */}
            <path
              d="M 68 248 C -30 255 -100 270 -180 290"
              fill="none"
              stroke="url(#windStreak)"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-pulse"
            />
            {/* Wingtip vortex trail 2 */}
            <path
              d="M 740 210 C 820 195 890 180 970 165"
              fill="none"
              stroke="url(#windStreak)"
              strokeWidth="4"
              strokeLinecap="round"
              className="animate-pulse"
            />
          </g>
        )}

        {/* High-Resolution Cleaned 3D Red Aviator Monoplane */}
        <image
          href="/games/aviator/red_aviator_plane.png"
          x="0"
          y="0"
          width="800"
          height="474"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Animated Spinning Propeller Disk Overlay during Flight */}
        {isFlying && (
          <g transform="translate(228, 206)">
            {/* Rotational blur disc around propeller hub */}
            <ellipse
              cx="0"
              cy="0"
              rx="135"
              ry="135"
              fill="url(#propellerBlur)"
              className="animate-spin"
              style={{ animationDuration: "0.15s" }}
            />
            {/* Whirring propeller blade arc highlights */}
            <circle
              cx="0"
              cy="0"
              r="125"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="20 40"
              opacity="0.6"
              className="animate-spin"
              style={{ animationDuration: "0.2s" }}
            />
            <circle
              cx="0"
              cy="0"
              r="80"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="15 35"
              opacity="0.7"
              className="animate-spin"
              style={{ animationDuration: "0.12s", animationDirection: "reverse" }}
            />
          </g>
        )}
      </svg>
    </div>
  );
};

export default RedAviatorPlane;
