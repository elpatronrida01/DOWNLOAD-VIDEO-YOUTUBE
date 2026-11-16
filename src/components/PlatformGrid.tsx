import React from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  ArrowUpRight,
  ShieldAlert,
  Play
} from 'lucide-react';
import type { PlatformConfig } from '../shared/types.ts';
import { PlatformIcon } from './PlatformIcons.tsx';

interface PlatformGridProps {
  platforms: PlatformConfig[];
  onSelectSample: (sampleUrl: string) => void;
}

export const PlatformGrid: React.FC<PlatformGridProps> = ({
  platforms,
  onSelectSample,
}) => {
  return (
    <section id="platforms" className="max-w-6xl mx-auto px-4 sm:px-6 mb-24 scroll-mt-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Supported Platforms & Capability Status
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
          Transparent status for every supported video platform. We only support authorized content and public media.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow-md transition-all group"
          >
            <div>
              {/* Top Row: Icon, Name & Status */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 transition-transform group-hover:scale-105">
                    <PlatformIcon platform={platform.id} size={36} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">
                      {platform.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{platform.statusLabel}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className="space-y-1.5 my-3">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available Features:</p>
                <div className="flex flex-wrap gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  {platform.capabilities.map((cap, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800/80 text-[11px] font-medium"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>

              {/* Technical / Auth Note */}
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                {platform.authNote}
              </p>
            </div>

            {/* Test Sample Action */}
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => onSelectSample(platform.sampleUrl)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200/80 dark:border-slate-700/80 transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Test Video Link</span>
                <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              </button>

              {platform.supportsPlaylists && platform.samplePlaylistUrl && (
                <button
                  type="button"
                  onClick={() => onSelectSample(platform.samplePlaylistUrl!)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-[11px] font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors cursor-pointer"
                >
                  <span>Test Sample Playlist</span>
                  <ArrowUpRight className="w-3 h-3 ml-0.5 opacity-70" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compliance banner */}
      <div className="mt-8 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
        <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
        <p>
          <strong className="font-semibold">Legal & Technical Transparency:</strong> ClipVory does not bypass digital rights management (DRM), authentication paywalls, or private account protections. Only download videos you have legitimate authorization or legal fair-use rights to save.
        </p>
      </div>
    </section>
  );
};
