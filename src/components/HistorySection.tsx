import React from 'react';
import { History, Trash2, Download, ExternalLink } from 'lucide-react';
import type { DownloadHistoryItem } from '../shared/types.ts';
import { PlatformIcon } from './PlatformIcons.tsx';

interface HistorySectionProps {
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
  onRedownload: (item: DownloadHistoryItem) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({
  history,
  onClearHistory,
  onRedownload,
}) => {
  return (
    <section id="history" className="max-w-4xl mx-auto px-4 sm:px-6 mb-20 scroll-mt-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            Recent Downloads
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stored locally in your browser. Never sent to our servers.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer border border-red-200/60 dark:border-red-900/40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No download history yet</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
            Once you fetch and download videos, your recent media files will appear here for quick access.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {history.map((item) => {
            const dateStr = new Date(item.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={item.id}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 relative">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <span className="absolute bottom-1 right-1 text-[9px] font-bold px-1 bg-black/80 text-white rounded">
                    {item.ext.toUpperCase()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                    <PlatformIcon platform={item.platform} size={14} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {item.platformName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{dateStr}</span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      Format: {item.quality}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRedownload(item)}
                  title="Download again"
                  className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-300 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
