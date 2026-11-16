import React from 'react';
import type { PlatformId } from '../shared/types.ts';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Official YouTube Logo SVG (Red rounded badge with white play triangle)
 */
export const YouTubeIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
      fill="#FF0000"
    />
    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#FFFFFF" />
  </svg>
);

/**
 * Official Instagram Logo SVG (Camera glyph with rich brand gradient)
 */
export const InstagramIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <defs>
      <radialGradient id="ig-grad" cx="20%" cy="105%" r="120%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="10%" stopColor="#fdf497" />
        <stop offset="50%" stopColor="#fd5949" />
        <stop offset="70%" stopColor="#d6249f" />
        <stop offset="100%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad)" />
    <path
      d="M16 4H8C5.79086 4 4 5.79086 4 8V16C4 18.2091 5.79086 20 8 20H16C18.2091 20 20 18.2091 20 16V8C20 5.79086 18.2091 4 16 4Z"
      stroke="#FFFFFF"
      strokeWidth="1.8"
    />
    <circle cx="12" cy="12" r="3.6" stroke="#FFFFFF" strokeWidth="1.8" />
    <circle cx="16.5" cy="7.5" r="1.1" fill="#FFFFFF" />
  </svg>
);

/**
 * Official TikTok Logo SVG (Stylized musical note with cyan and red accents)
 */
export const TikTokIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#010101" />
    <path
      d="M16.6 8.2c-.8-.5-1.4-1.2-1.7-2-.1-.4-.2-.8-.2-1.2H12v10.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .6.1.9.2v-2.8c-.3 0-.6-.1-.9-.1-2.9 0-5.2 2.3-5.2 5.2s2.3 5.2 5.2 5.2 5.2-2.3 5.2-5.2V10.7c1.3.9 2.8 1.4 4.4 1.4V9.4c-.9 0-1.7-.4-2.5-1.2z"
      fill="#25F4EE"
    />
    <path
      d="M17.1 8.7c-.8-.5-1.4-1.2-1.7-2-.1-.4-.2-.8-.2-1.2h-2.2v10.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .6.1.9.2V10.9c-.3 0-.6-.1-.9-.1-2.9 0-5.2 2.3-5.2 5.2s2.3 5.2 5.2 5.2 5.2-2.3 5.2-5.2v-5.8c1.3.9 2.8 1.4 4.4 1.4V9.9c-.9 0-1.7-.4-2.5-1.2z"
      fill="#FE2C55"
    />
    <path
      d="M16.85 8.45c-.8-.5-1.4-1.2-1.7-2-.1-.4-.2-.8-.2-1.2h-2.45v10.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5 1.1-2.5 2.5-2.5c.3 0 .6.1.9.2v-2.8c-.3 0-.6-.1-.9-.1-2.9 0-5.2 2.3-5.2 5.2s2.3 5.2 5.2 5.2 5.2-2.3 5.2-5.2v-5.8c1.3.9 2.8 1.4 4.4 1.4V9.65c-.9 0-1.7-.4-2.5-1.2z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Official Facebook Logo SVG (Blue rounded badge with white f)
 */
export const FacebookIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#1877F2" />
    <path
      d="M16.5 13.2l.6-4h-3.8v-2.6c0-1.1.5-2.1 2.2-2.1h1.7V1.1S15.6.8 14.1.8c-3 0-5 1.8-5 5.1v3.3H5.6v4h3.5V23h4.4v-9.8h3z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Official X (Twitter) Logo SVG (Black background with clean mathematical X)
 */
export const XTwitterIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#000000" />
    <path
      d="M17.43 4.5h2.57l-5.61 6.41 6.61 8.59h-5.17l-4.05-5.3-4.63 5.3H4.59l6-6.86-6.32-8.14h5.3l3.66 4.84L17.43 4.5zm-.9 13.46h1.42L7.54 5.96H6.01l10.52 12z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Official Vimeo Logo SVG (Cyan blue rounded badge with italic v)
 */
export const VimeoIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#1AB7EA" />
    <path
      d="M18.8 7.4c-.1 1.7-1.3 4-3.5 6.9-2.3 3-4.2 4.5-5.8 4.5-.9 0-1.8-.9-2.5-2.6l-1.4-5.2c-.5-1.8-1-2.8-1.7-2.8-.2 0-.7.3-1.6 1L1.2 8C2.3 7 3.6 5.8 5.1 4.5c1.4-1.2 2.4-1.8 3.1-1.8 1.6 0 2.5 1.1 2.8 3.3.3 2.4.6 3.9.7 4.5.5 2.1 1.1 3.2 1.9 3.2.6 0 1.4-.8 2.4-2.5 1-1.6 1.5-2.9 1.5-3.7 0-1.3-.7-2-2.1-2-.6 0-1.3.1-2 .4.8-2.6 2.5-3.8 5-3.8 1.8 0 2.6 1.1 2.4 3.3z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Official Reddit Logo SVG (Orange badge with Snoo silhouette)
 */
export const RedditIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#FF4500" />
    <path
      d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm5.7 10.3c.1.2.1.4.1.6 0 2.6-3 4.7-6.8 4.7s-6.8-2.1-6.8-4.7c0-.2 0-.4.1-.6a1.7 1.7 0 0 1-.3-1 1.8 1.8 0 0 1 3-1.3 7.8 7.8 0 0 1 3.8-1.1l.8-3.7 2.6.6a1.3 1.3 0 0 1 1.2.9 1.3 1.3 0 0 1-.7 1.6l-1.9-.4-.7 3.3a7.8 7.8 0 0 1 3.8 1.1 1.8 1.8 0 0 1 3 1.3c0 .4-.1.7-.3 1z"
      fill="#FFFFFF"
    />
    <circle cx="9" cy="12.5" r="1.1" fill="#FF4500" />
    <circle cx="15" cy="12.5" r="1.1" fill="#FF4500" />
    <path
      d="M14.5 15.3c-.7.6-1.6.8-2.5.8s-1.8-.2-2.5-.8"
      stroke="#FF4500"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Official Pinterest Logo SVG (Red badge with stylized P)
 */
export const PinterestIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#E60023" />
    <path
      d="M12 3a9 9 0 0 0-3.3 17.4c-.1-.7-.1-1.8.1-2.5l1.4-5.8s-.3-.7-.3-1.8c0-1.7 1-3 2.2-3 1 0 1.5.8 1.5 1.7 0 1.1-.7 2.6-1 4.1-.3 1.2.6 2.2 1.8 2.2 2.1 0 3.8-2.3 3.8-5.5 0-2.9-2.1-4.9-5-4.9-3.4 0-5.5 2.6-5.5 5.3 0 1 .4 2.2 1 2.8.1.1.1.2.1.3l-.4 1.5c-.1.2-.2.3-.4.2-1.6-.7-2.6-3-2.6-4.8 0-3.9 2.8-7.5 8.2-7.5 4.3 0 7.7 3.1 7.7 7.2 0 4.3-2.7 7.8-6.5 7.8-1.3 0-2.5-.7-2.9-1.5l-.8 3c-.3 1.1-1.1 2.5-1.6 3.4A9 9 0 0 0 12 21a9 9 0 0 0 0-18z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Official Dailymotion Logo SVG (Blue badge with Dailymotion 'd' mark)
 */
export const DailymotionIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#0066DC" />
    <path
      d="M15.4 4.5v4.3c-1.1-1.1-2.4-1.7-3.9-1.7-3.6 0-6.2 3.1-6.2 6.9s2.6 6.9 6.2 6.9c1.5 0 2.8-.6 3.9-1.7v1.4h3.3V4.5h-3.3zm-3.2 13.5c-2.3 0-4-1.8-4-4s1.7-4 4-4 4 1.8 4 4-1.7 4-4 4z"
      fill="#FFFFFF"
    />
  </svg>
);

/**
 * Direct Video Stream Icon (Emerald green with link and media arrow)
 */
export const DirectVideoIcon: React.FC<IconProps> = ({ className = '', size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block flex-shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="24" height="24" rx="6" fill="#10B981" />
    <path
      d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
      stroke="#FFFFFF"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Dynamic Platform Icon Component
 */
export const PlatformIcon: React.FC<{ platform: PlatformId; size?: number; className?: string }> = ({
  platform,
  size = 24,
  className = '',
}) => {
  switch (platform) {
    case 'youtube':
      return <YouTubeIcon size={size} className={className} />;
    case 'instagram':
      return <InstagramIcon size={size} className={className} />;
    case 'tiktok':
      return <TikTokIcon size={size} className={className} />;
    case 'facebook':
      return <FacebookIcon size={size} className={className} />;
    case 'twitter':
      return <XTwitterIcon size={size} className={className} />;
    case 'vimeo':
      return <VimeoIcon size={size} className={className} />;
    case 'reddit':
      return <RedditIcon size={size} className={className} />;
    case 'pinterest':
      return <PinterestIcon size={size} className={className} />;
    case 'dailymotion':
      return <DailymotionIcon size={size} className={className} />;
    case 'direct':
    default:
      return <DirectVideoIcon size={size} className={className} />;
  }
};
