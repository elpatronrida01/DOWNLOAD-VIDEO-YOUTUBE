import React from 'react';
import type { PlatformId } from '../shared/types.ts';
import { PlatformIcon } from './PlatformIcons.tsx';

interface SupportedPlatformsStripProps {
  onSelectPlatform: (platformId: PlatformId, sampleUrl: string) => void;
  activePlatform?: PlatformId | null;
}

interface PlatformItem {
  id: PlatformId;
  name: string;
  badge: string;
  sampleUrl: string;
  isAvailable: boolean;
}

export const SupportedPlatformsStrip: React.FC<SupportedPlatformsStripProps> = ({
  onSelectPlatform,
  activePlatform,
}) => {
  const platforms: PlatformItem[] = [
    {
      id: 'youtube',
      name: 'YouTube',
      badge: '1080p & Playlists',
      sampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      isAvailable: true,
    },
    {
      id: 'instagram',
      name: 'Instagram',
      badge: 'Reels & Posts',
      sampleUrl: 'https://www.instagram.com/reel/C3bA18bLH5P/',
      isAvailable: true,
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      badge: 'No Watermark HD',
      sampleUrl: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
      isAvailable: true,
    },
    {
      id: 'reddit',
      name: 'Reddit',
      badge: 'v.redd.it HD',
      sampleUrl: 'https://www.reddit.com/r/videos/comments/6vsv8s/guy_accidentally_creates_masterpiece/',
      isAvailable: true,
    },
    {
      id: 'vimeo',
      name: 'Vimeo',
      badge: 'Progressive HD',
      sampleUrl: 'https://vimeo.com/76979871',
      isAvailable: true,
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      badge: 'Video Tweets',
      sampleUrl: 'https://twitter.com/NASA/status/1678826727228833792',
      isAvailable: true,
    },
    {
      id: 'facebook',
      name: 'Facebook',
      badge: 'Watch & Reels',
      sampleUrl: 'https://www.facebook.com/watch/?v=10153231379946729',
      isAvailable: true,
    },
    {
      id: 'dailymotion',
      name: 'Dailymotion',
      badge: 'Full HD API',
      sampleUrl: 'https://www.dailymotion.com/video/x8bgf9q',
      isAvailable: true,
    },
    {
      id: 'pinterest',
      name: 'Pinterest',
      badge: 'Video Pins',
      sampleUrl: 'https://www.pinterest.com/pin/123456789/',
      isAvailable: true,
    },
    {
      id: 'direct',
      name: 'Direct MP4',
      badge: 'Byte-Range Stream',
      sampleUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
      isAvailable: true,
    },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto mt-6 pt-4">
      <div className="flex items-center justify-between mb-3.5 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Supported Platforms
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
          Click any platform to load a test link
        </span>
      </div>

      {/* Responsive Horizontal Strip / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
        {platforms.map((p) => {
          const isActive = activePlatform === p.id;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectPlatform(p.id, p.sampleUrl)}
              aria-label={`Select ${p.name} downloader`}
              className={`group flex items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer select-none
                ${
                  isActive
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 shadow-md shadow-indigo-500/10 scale-[1.02]'
                    : 'bg-white dark:bg-slate-900/90 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm hover:scale-[1.02]'
                }`}
            >
              {/* Platform Official Icon */}
              <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                <PlatformIcon platform={p.id} size={28} />
              </div>

              {/* Text info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {p.name}
                  </span>
                </div>
                <span className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 truncate">
                  {p.badge}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
