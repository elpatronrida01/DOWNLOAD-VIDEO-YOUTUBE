import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  Download, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  FileText, 
  FileSpreadsheet, 
  Copy, 
  Check, 
  Loader2, 
  Play, 
  Clock, 
  User, 
  Archive, 
  Tag, 
  FolderPlus,
  ArrowRight,
  Search,
  ListPlus,
  Filter
} from 'lucide-react';
import type { 
  RelatedPlaylistData, 
  RelatedPlaylistItem, 
  PlatformId 
} from '../shared/types.ts';
import { PlatformIcon } from './PlatformIcons.tsx';
import { GoogleDriveIcon } from './GoogleDriveIcon.tsx';

interface RelatedVideosPlaylistSectionProps {
  playlistData: RelatedPlaylistData | null;
  isLoading: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  onDownloadSingleItem: (item: RelatedPlaylistItem, quality: string, ext: 'mp4' | 'mp3') => void;
  onDownloadSelectedZip: (items: RelatedPlaylistItem[], quality: string, ext: 'mp4' | 'mp3') => void;
  isDownloadingZip: boolean;
  onSaveZipToDrive?: (items: RelatedPlaylistItem[], quality: string, ext: 'mp4' | 'mp3') => void;
  isSavingZipToDrive?: boolean;
  onGenerateFromTopic: (topic: string, keywords?: string[]) => void;
}

export const RelatedVideosPlaylistSection: React.FC<RelatedVideosPlaylistSectionProps> = ({
  playlistData,
  isLoading,
  onRefresh,
  onLoadMore,
  isLoadingMore,
  onDownloadSingleItem,
  onDownloadSelectedZip,
  isDownloadingZip,
  onSaveZipToDrive,
  isSavingZipToDrive,
  onGenerateFromTopic,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    if (!playlistData?.items) return new Set();
    return new Set(playlistData.items.map((i) => i.id));
  });

  const [copiedLinks, setCopiedLinks] = useState(false);
  const [isExporting, setIsExporting] = useState<'txt' | 'csv' | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<'720p' | '1080p' | 'audio'>('720p');
  const [manualTopicInput, setManualTopicInput] = useState('');

  // Keep selection synchronized when playlist items change
  React.useEffect(() => {
    if (playlistData?.items) {
      setSelectedIds(new Set(playlistData.items.map((i) => i.id)));
    }
  }, [playlistData?.playlistTitle]);

  if (isLoading && !playlistData) {
    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 animate-in fade-in">
        <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Generating Intelligent Related Videos Playlist...
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            ClipVory is analyzing the video's topic, keywords, and matching authentic related media across platforms.
          </p>
        </div>
      </section>
    );
  }

  if (!playlistData) {
    return (
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Related Videos Playlist Generator
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Generate a custom playlist from any video link or search topic directly.
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualTopicInput.trim()) {
                onGenerateFromTopic(manualTopicInput.trim());
              }
            }}
            className="flex flex-col sm:flex-row gap-2.5 max-w-2xl"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={manualTopicInput}
                onChange={(e) => setManualTopicInput(e.target.value)}
                placeholder="Enter topic or keywords (e.g., Synthwave Chill Beats, Web Dev Guide...)"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !manualTopicInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Playlist</span>
            </button>
          </form>

          {/* Quick topic pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Try popular topics:</span>
            {['Lofi Study Beats', 'Acoustic Guitar Covers', 'Nature 4K Wildlife', 'Tech Reviews', 'Cooking Tutorials'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onGenerateFromTopic(t)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const { originalVideo, playlistTitle, topic, category, keywords, items, hasMore } = playlistData;

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(items.map((i) => i.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const selectedItems = items.filter((i) => selectedIds.has(i.id));

  // Copy playlist links action
  const handleCopyLinks = async () => {
    const targets = selectedItems.length > 0 ? selectedItems : items;
    const linksText = targets.map((i) => `${i.title}\n${i.url}`).join('\n\n');
    try {
      await navigator.clipboard.writeText(linksText);
      setCopiedLinks(true);
      setTimeout(() => setCopiedLinks(false), 2500);
    } catch {
      // fallback
    }
  };

  // Export as TXT or CSV action
  const handleExport = async (format: 'txt' | 'csv') => {
    setIsExporting(format);
    const targets = selectedItems.length > 0 ? selectedItems : items;

    try {
      const res = await fetch('/api/related-playlist/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistTitle,
          items: targets,
          format,
        }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${playlistTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_playlist.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <section id="related-playlist-section" className="max-w-5xl mx-auto px-4 sm:px-6 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        
        {/* Section Top Header with Gradient Accent */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-cyan-50/40 dark:from-indigo-950/40 dark:via-slate-900 dark:to-cyan-950/20 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Intelligent Related Videos Playlist</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {playlistTitle}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Topic: {topic}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {category}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {items.length} {items.length === 1 ? 'video' : 'videos'} matched
                </span>
              </div>
            </div>

            {/* Quick Refresh & Re-generate */}
            <div className="flex items-center gap-2 self-start lg:self-center">
              <button
                type="button"
                onClick={onRefresh}
                disabled={isLoading}
                title="Regenerate and discover fresh related videos"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-200 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
                <span>{isLoading ? 'Refreshing...' : 'Refresh Playlist'}</span>
              </button>
            </div>
          </div>

          {/* Original Source Video Reference Card */}
          {originalVideo && originalVideo.title && (
            <div className="mt-6 p-4 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-950 flex-shrink-0">
                <img
                  src={originalVideo.thumbnailUrl}
                  alt={originalVideo.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="absolute top-1 left-1">
                  <PlatformIcon platform={originalVideo.platform} size={16} />
                </div>
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-0.5">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px]">
                    Matched from original video:
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {originalVideo.title}
                </h4>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1">
                  {originalVideo.author && (
                    <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {originalVideo.author}
                    </span>
                  )}
                  {originalVideo.duration && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {originalVideo.duration}
                    </span>
                  )}
                </div>
              </div>

              {/* Keywords Tag Cloud */}
              {keywords && keywords.length > 0 && (
                <div className="hidden md:flex flex-wrap gap-1.5 max-w-xs justify-end">
                  {keywords.slice(0, 5).map((kw) => (
                    <span
                      key={kw}
                      className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Toolbar */}
        <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Selection Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>Select All</span>
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Deselect All</span>
            </button>
            <span className="text-xs text-slate-500 font-medium ml-2">
              {selectedItems.length} of {items.length} selected
            </span>
          </div>

          {/* Export & Download Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quality selector for batch download */}
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none"
            >
              <option value="720p">720p HD</option>
              <option value="1080p">1080p Full HD</option>
              <option value="audio">MP3 Audio</option>
            </select>

            {/* Copy Links */}
            <button
              type="button"
              onClick={handleCopyLinks}
              title="Copy links of selected videos to clipboard"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              {copiedLinks ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLinks ? 'Copied!' : 'Copy Links'}</span>
            </button>

            {/* Export TXT */}
            <button
              type="button"
              onClick={() => handleExport('txt')}
              disabled={isExporting !== null}
              title="Export playlist as plain text file"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>TXT</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={() => handleExport('csv')}
              disabled={isExporting !== null}
              title="Export playlist as CSV spreadsheet"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>CSV</span>
            </button>

            {/* Download Selected Videos (ZIP Archive) */}
            <button
              type="button"
              onClick={() => {
                const targets = selectedItems.length > 0 ? selectedItems : items;
                const ext = selectedQuality === 'audio' ? 'mp3' : 'mp4';
                onDownloadSelectedZip(targets, selectedQuality, ext);
              }}
              disabled={isDownloadingZip || (selectedItems.length === 0 && items.length === 0)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 shadow-sm transition-all cursor-pointer"
            >
              {isDownloadingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
              <span>{isDownloadingZip ? 'Creating ZIP...' : `Download Playlist (ZIP)`}</span>
            </button>

            {/* Google Drive Export Button */}
            {onSaveZipToDrive && (
              <button
                type="button"
                onClick={() => {
                  const targets = selectedItems.length > 0 ? selectedItems : items;
                  const ext = selectedQuality === 'audio' ? 'mp3' : 'mp4';
                  onSaveZipToDrive(targets, selectedQuality, ext);
                }}
                disabled={isSavingZipToDrive || (selectedItems.length === 0 && items.length === 0)}
                title="Save complete playlist archive to Google Drive"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                {isSavingZipToDrive ? <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" /> : <GoogleDriveIcon size={14} />}
                <span>{isSavingZipToDrive ? 'Uploading...' : 'Save to Drive'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Items Grid / List */}
        <div className="p-4 sm:p-6 divide-y divide-slate-100 dark:divide-slate-800/80">
          {items.map((item, index) => {
            const isSelected = selectedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`py-3 sm:py-4 px-2 sm:px-3 rounded-2xl transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected ? 'bg-indigo-50/30 dark:bg-indigo-950/15' : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                }`}
              >
                {/* Left: Checkbox + Number + Thumbnail + Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Select Checkbox */}
                  <button
                    type="button"
                    onClick={() => handleToggleSelect(item.id)}
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer flex-shrink-0"
                    aria-label={`Select ${item.title}`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                    )}
                  </button>

                  <span className="text-xs font-bold text-slate-400 w-5 text-right flex-shrink-0">
                    {index + 1}
                  </span>

                  {/* Thumbnail with platform badge */}
                  <div className="relative w-28 sm:w-32 aspect-video rounded-xl overflow-hidden bg-slate-900 flex-shrink-0 group">
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    {/* Platform logo badge on thumbnail */}
                    <div className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-md">
                      <PlatformIcon platform={item.platform} size={14} />
                    </div>

                    {/* Duration badge */}
                    {item.duration && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-semibold text-white">
                        {item.duration}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                        <PlatformIcon platform={item.platform} size={13} />
                        <span>{item.platformName}</span>
                      </span>
                      {item.author && (
                        <>
                          <span>•</span>
                          <span className="truncate">{item.author}</span>
                        </>
                      )}
                      {item.views && (
                        <>
                          <span>•</span>
                          <span>{item.views}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {/* Open video on original platform */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open on ${item.platformName}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  {/* Download single video from playlist */}
                  <button
                    type="button"
                    onClick={() => {
                      const ext = selectedQuality === 'audio' ? 'mp3' : 'mp4';
                      onDownloadSingleItem(item, selectedQuality, ext);
                    }}
                    title="Download this video"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button & Footer Strip */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {items.length} related videos based on conceptual topic similarity and relevance.
          </p>

          <div className="flex items-center gap-3">
            {hasMore && (
              <button
                type="button"
                onClick={onLoadMore}
                disabled={isLoadingMore}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-slate-800 dark:text-slate-200 shadow-sm transition-all cursor-pointer"
              >
                {isLoadingMore ? <Loader2 className="w-4 h-4 animate-spin text-indigo-600" /> : <ListPlus className="w-4 h-4" />}
                <span>{isLoadingMore ? 'Loading More...' : 'Load More Videos'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};
