import React, { useState, useMemo } from 'react';
import { 
  ListVideo, 
  CheckSquare, 
  Square, 
  Archive, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Loader2, 
  Play, 
  Music, 
  Film, 
  RotateCcw,
  XCircle,
  ExternalLink
} from 'lucide-react';
import type { PlaylistInfo, PlaylistItem } from '../shared/types.ts';
import { GoogleDriveIcon } from './GoogleDriveIcon.tsx';

interface PlaylistViewProps {
  playlist: PlaylistInfo;
  onDownloadSingleItem: (item: PlaylistItem, quality: string, ext: 'mp4' | 'mp3') => void;
  onDownloadSelectedZip: (items: PlaylistItem[], quality: string, ext: 'mp4' | 'mp3') => void;
  isDownloadingZip: boolean;
  onSaveZipToDrive?: (items: PlaylistItem[], quality: string, ext: 'mp4' | 'mp3') => void;
  isSavingZipToDrive?: boolean;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  playlist,
  onDownloadSingleItem,
  onDownloadSelectedZip,
  isDownloadingZip,
  onSaveZipToDrive,
  isSavingZipToDrive,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(playlist.items.slice(0, 10).map((i) => i.id)) // Default select first 10
  );
  const [selectedQuality, setSelectedQuality] = useState<string>('720p');
  const [selectedFormat, setSelectedFormat] = useState<'mp4' | 'mp3'>('mp4');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Queue state for sequential downloading
  const [queueState, setQueueState] = useState<{
    isRunning: boolean;
    currentIndex: number;
    completedIds: Set<string>;
    failedIds: Set<string>;
  }>({
    isRunning: false,
    currentIndex: 0,
    completedIds: new Set(),
    failedIds: new Set(),
  });

  // Filter items by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return playlist.items;
    const q = searchQuery.toLowerCase();
    return playlist.items.filter((item) => item.title.toLowerCase().includes(q));
  }, [playlist.items, searchQuery]);

  // Paginated items
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, page]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(playlist.items.map((i) => i.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const selectedItems = useMemo(() => {
    return playlist.items.filter((i) => selectedIds.has(i.id));
  }, [playlist.items, selectedIds]);

  const handleStartQueue = async () => {
    if (selectedItems.length === 0) return;

    setQueueState({
      isRunning: true,
      currentIndex: 0,
      completedIds: new Set(),
      failedIds: new Set(),
    });

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      setQueueState((prev) => ({ ...prev, currentIndex: i }));

      try {
        await onDownloadSingleItem(item, selectedQuality, selectedFormat);
        // Add artificial breathing delay so browser download manager doesn't stall
        await new Promise((r) => setTimeout(r, 600));

        setQueueState((prev) => {
          const nextCompleted = new Set(prev.completedIds);
          nextCompleted.add(item.id);
          return { ...prev, completedIds: nextCompleted };
        });
      } catch (err) {
        setQueueState((prev) => {
          const nextFailed = new Set(prev.failedIds);
          nextFailed.add(item.id);
          return { ...prev, failedIds: nextFailed };
        });
      }
    }

    setQueueState((prev) => ({ ...prev, isRunning: false }));
  };

  const handleCancelQueue = () => {
    setQueueState((prev) => ({ ...prev, isRunning: false }));
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Playlist Header Card */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
            {/* Thumbnail */}
            <div className="w-full sm:w-48 sm:h-32 aspect-video sm:aspect-auto rounded-2xl overflow-hidden bg-slate-800 flex-shrink-0 shadow-lg border border-white/10 relative">
              <img
                src={playlist.thumbnailUrl}
                alt={playlist.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <ListVideo className="w-8 h-8 text-white/90" />
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[11px] font-bold">
                {playlist.totalVideos} videos
              </span>
            </div>

            {/* Title & Metadata */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-[11px] font-semibold text-indigo-300 mb-2">
                <ListVideo className="w-3.5 h-3.5" />
                <span>Public YouTube Playlist</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold leading-snug truncate">
                {playlist.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
                <span>By {playlist.author || 'YouTube Channel'}</span>
                <span aria-hidden="true">·</span>
                <span>{playlist.totalVideos} videos retrieved</span>
              </p>

              <div className="flex items-center gap-3 mt-4 text-xs">
                <a
                  href={playlist.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-300 hover:text-white underline font-medium"
                >
                  <span>Open on YouTube</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Global Controls & Format Selector */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Format & Quality pickers */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('mp4');
                    if (selectedQuality === 'audio') setSelectedQuality('720p');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedFormat === 'mp4'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Video (MP4)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFormat('mp3');
                    setSelectedQuality('audio');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 font-semibold rounded-lg transition-colors cursor-pointer ${
                    selectedFormat === 'mp3'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Audio (MP3)</span>
                </button>
              </div>

              {selectedFormat === 'mp4' && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-500 font-medium">Quality:</span>
                  {(['1080p', '720p', '480p', '360p'] as const).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setSelectedQuality(q)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                        selectedQuality === q
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Master Download Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => onDownloadSelectedZip(selectedItems, selectedQuality, selectedFormat)}
                disabled={isDownloadingZip || selectedItems.length === 0}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-sm transition-all cursor-pointer"
              >
                {isDownloadingZip ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Compressing ZIP...</span>
                  </>
                ) : (
                  <>
                    <Archive className="w-3.5 h-3.5" />
                    <span>Download {selectedItems.length} as ZIP Archive</span>
                  </>
                )}
              </button>

              {onSaveZipToDrive && (
                <button
                  type="button"
                  onClick={() => onSaveZipToDrive(selectedItems, selectedQuality, selectedFormat)}
                  disabled={isSavingZipToDrive || selectedItems.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:text-indigo-600 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  title="Save ZIP archive directly into your Google Drive"
                >
                  <GoogleDriveIcon size={16} />
                  <span>{isSavingZipToDrive ? 'Exporting to Drive...' : 'Save ZIP to Drive'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={queueState.isRunning ? handleCancelQueue : handleStartQueue}
                disabled={selectedItems.length === 0}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  queueState.isRunning
                    ? 'bg-red-50 text-red-600 border-red-300 dark:bg-red-950/40 dark:text-red-400'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {queueState.isRunning ? (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Stop Queue ({queueState.currentIndex + 1}/{selectedItems.length})</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Individually in Queue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search & Selection Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Select All ({playlist.items.length})</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:underline cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Deselect All</span>
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
              ({selectedIds.size} selected)
            </span>
          </div>

          {/* Search within playlist */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search in playlist..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Download Queue Progress Bar (when active) */}
        {queueState.isRunning && (
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-200/60 dark:border-indigo-900/40">
            <div className="flex justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200 mb-1.5">
              <span>Downloading Item {queueState.currentIndex + 1} of {selectedItems.length}...</span>
              <span>{Math.round(((queueState.currentIndex + 1) / selectedItems.length) * 100)}%</span>
            </div>
            <div className="w-full bg-indigo-200/50 dark:bg-indigo-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                style={{ width: `${((queueState.currentIndex + 1) / selectedItems.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Video Items List */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {paginatedItems.map((item, idx) => {
            const isSelected = selectedIds.has(item.id);
            const isCompleted = queueState.completedIds.has(item.id);
            const isFailed = queueState.failedIds.has(item.id);
            const isCurrent = queueState.isRunning && selectedItems[queueState.currentIndex]?.id === item.id;

            return (
              <div
                key={item.id}
                className={`p-4 flex items-center gap-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                  isSelected ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                }`}
              >
                {/* Selection Checkbox */}
                <button
                  type="button"
                  onClick={() => handleToggleSelect(item.id)}
                  className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex-shrink-0"
                >
                  {isSelected ? (
                    <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400 fill-indigo-100 dark:fill-indigo-950" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  )}
                </button>

                {/* Index */}
                <span className="text-xs font-bold text-slate-400 w-6 text-center flex-shrink-0">
                  {item.index}
                </span>

                {/* Thumbnail */}
                <div className="w-20 h-12 sm:w-28 sm:h-16 rounded-xl overflow-hidden bg-slate-950 flex-shrink-0 relative group">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80';
                    }}
                  />
                  {item.duration && (
                    <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[10px] font-semibold text-white">
                      {item.duration}
                    </span>
                  )}
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>{item.author || playlist.author}</span>
                    {item.duration && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-3 h-3" />
                          {item.duration}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Status or Single Download Action */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="hidden sm:inline">Downloading...</span>
                    </span>
                  )}

                  {isCompleted && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Saved</span>
                    </span>
                  )}

                  {isFailed && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
                      <AlertCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Failed</span>
                    </span>
                  )}

                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => onDownloadSingleItem(item, selectedQuality, selectedFormat)}
                      title="Download this single video"
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-800"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(page - 1) * itemsPerPage + 1}–{Math.min(page * itemsPerPage, filteredItems.length)} of {filteredItems.length} videos
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-2 font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
