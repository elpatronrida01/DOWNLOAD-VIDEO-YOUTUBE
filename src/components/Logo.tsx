import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  withText = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 28, icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { box: 38, icon: 38, text: 'text-xl', sub: 'text-[10px]' },
    lg: { box: 48, icon: 48, text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 64, icon: 64, text: 'text-3xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon SVG */}
      <div 
        className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-200"
        style={{ width: dim.box, height: dim.box }}
      >
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          <defs>
            {/* Primary Background Gradient */}
            <linearGradient id="mf-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4338CA" />
              <stop offset="45%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>

            {/* Inner Sheen Gradient */}
            <linearGradient id="mf-sheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
            </linearGradient>

            {/* Arrow & Symbol Glow */}
            <linearGradient id="mf-symbol-grad" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>

            {/* Subtle Drop Shadow */}
            <filter id="mf-inner-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* Squircle App Container */}
          <rect
            x="1"
            y="1"
            width="42"
            height="42"
            rx="12"
            fill="url(#mf-bg-grad)"
          />

          {/* Glass Highlight Sheen */}
          <rect
            x="1.5"
            y="1.5"
            width="41"
            height="21"
            rx="10.5"
            fill="url(#mf-sheen)"
          />

          {/* Border Stroke */}
          <rect
            x="1"
            y="1"
            width="42"
            height="42"
            rx="12"
            stroke="white"
            strokeOpacity="0.2"
            strokeWidth="1.2"
          />

          {/* MediaFetch Core Symbol: Dynamic Play-Triangle fused with High-Speed Download Arrow & Audio/Video Wave */}
          <g filter="url(#mf-inner-shadow)">
            {/* Media Base Tray / Receiving Arc */}
            <path
              d="M 12 30.5 C 12 31.88 13.12 33 14.5 33 L 29.5 33 C 30.88 33 32 31.88 32 30.5"
              stroke="white"
              strokeWidth="2.8"
              strokeLinecap="round"
            />

            {/* Downward Arrow Stem */}
            <path
              d="M 22 10.5 L 22 25.5"
              stroke="url(#mf-symbol-grad)"
              strokeWidth="3.2"
              strokeLinecap="round"
            />

            {/* Downward Arrow Head / Fast Chevron */}
            <path
              d="M 15.5 19.5 L 22 26 L 28.5 19.5"
              stroke="url(#mf-symbol-grad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Play-Symbol Accent Dot / Stream Sparkle */}
            <circle cx="31.5" cy="12.5" r="2.2" fill="#38BDF8" />
            <circle cx="31.5" cy="12.5" r="1.2" fill="#FFFFFF" />
          </g>
        </svg>
      </div>

      {/* Optional Wordmark */}
      {withText && (
        <div className="flex flex-col text-left">
          <span className={`${dim.text} font-black tracking-tight text-slate-900 dark:text-white leading-none flex items-center`}>
            Clip<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">Vory</span>
          </span>
          <span className={`${dim.sub} font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mt-0.5`}>
            Universal Downloader
          </span>
        </div>
      )}
    </div>
  );
};
