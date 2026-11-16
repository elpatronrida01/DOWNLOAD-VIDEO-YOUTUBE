import React, { useState } from 'react';
import { 
  Download, 
  Play, 
  Pause, 
  Music, 
  Film, 
  Check, 
  Copy, 
  ExternalLink, 
  Clock, 
  User, 
  Sparkles,
  Info
} from 'lucide-react';
import type { VideoMediaInfo, MediaFormat } from '../shared/types.ts';
import { PlatformIcon } from './PlatformIcons.tsx';
import { GoogleDriveIcon } from './GoogleDriveIcon.tsx';

interface MediaResultCardProps {
  media: VideoMediaInfo;
  onDownloadFormat: (format: MediaFormat) => void;
  downloadingFormatId: string | null;
  onSaveToDrive?: (format: MediaFormat) => void;
  savingToDriveFormatId?: string | null;
  onViewRelatedPlaylist?: () => void;
}

export const MediaResultCard: React.FC<MediaResultCardProps> = ({
  media,
  onDownloadFormat,
  downloadingFormatId,
  onSaveToDrive,
  savingToDriveFormatId,
  onViewRelatedPlaylist,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [copiedFormatId, setCopiedFormatId] = useState<string | null>(null);

  const videoFormats = media.formats.filter((f) => f.hasVideo);
  const audioFormats = media.formats.filter((f) => !f.hasVideo);

  const displayFormats = activeTab === 'video' ? videoFormats : audioFormats;

  const handleCopyLink = async (format: MediaFormat) => {
    const link = format.directStreamUrl || window.location.origin + (format.downloadUrl || '');
    try {
      await navigator.clipboard.writeText(link);
      setCopiedFormatId(format.formatId);
      setTimeout(() => setCopiedFormatId(null), 2000);
    } catch {
      // Copy fallback
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 bg-slate-50/60 dark:bg-slate-950/40 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <PlatformIcon platform={media.platform} size={20} />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              {media.platformName}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {media.playlistId ? (
              <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                Single Video (From Playlist)
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            {onViewRelatedPlaylist && (
              <button
                type="button"
                onClick={onViewRelatedPlaylist}
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Related Videos</span>
              </button>
            )}

            {media.authorUrl && (
              <a
                href={media.authorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>View on {media.platformName}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            {/* Thumbnail / Preview Player Column */}
            <div className="md:col-span-5">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md group">
                {isPlayingPreview && media.previewVideoUrl ? (
                  media.previewVideoUrl.includes('embed') ? (
                    <iframe
                      src={media.previewVideoUrl}
                      title="Video Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={media.previewVideoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <>
                    <img
                      src={media.thumbnailUrl}
                      alt={media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-900/30 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                      {media.previewVideoUrl ? (
                        <button
                          type="button"
                          onClick={() => setIsPlayingPreview(true)}
                          className="w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 transition-transform cursor-pointer"
                          aria-label="Play video preview"
                        >
                          <Play className="w-6 h-6 ml-0.5 fill-white" />
                        </button>
                      ) : null}
                    </div>

                    {/* Duration badge */}
                    {media.durationFormatted && (
                      <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/80 backdrop-blur-sm text-white text-xs font-semibold rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{media.durationFormatted}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {media.previewVideoUrl && isPlayingPreview && (
                <button
                  type="button"
                  onClick={() => setIsPlayingPreview(false)}
                  className="mt-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 mx-auto"
                >
                  <Pause className="w-3.5 h-3.5" />
                  Close player preview
                </button>
              )}

              {/* Author Info */}
              <div className="mt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Creator / Channel</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {media.author || 'Original Creator'}
                  </p>
                </div>
              </div>
            </div>

            {/* Details & Formats Column */}
            <div className="md:col-span-7">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-4">
                {media.title}
              </h2>

              {/* Tabs for Video / Audio */}
              <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'video'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Film className="w-4 h-4" />
                  <span>Video Formats ({videoFormats.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('audio')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'audio'
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Music className="w-4 h-4" />
                  <span>Audio Only ({audioFormats.length})</span>
                </button>
              </div>

              {/* Formats List */}
              <div className="space-y-3">
                {displayFormats.map((format) => {
                  const isDownloading = downloadingFormatId === format.formatId;
                  const isCopied = copiedFormatId === format.formatId;

                  return (
                    <div
                      key={format.formatId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 bg-slate-50/50 dark:bg-slate-950/20 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-colors gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                            {format.label}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-bold uppercase rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {format.ext}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{format.filesizeFormatted || 'Standard stream'}</span>
                          {format.note && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="truncate">{format.note}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={() => handleCopyLink(format)}
                          title="Copy download link"
                          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        >
                          {isCopied ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Save to Google Drive Button */}
                        {onSaveToDrive && (
                          <button
                            type="button"
                            onClick={() => onSaveToDrive(format)}
                            disabled={savingToDriveFormatId === format.formatId}
                            title="Save directly to Google Drive"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-all cursor-pointer"
                          >
                            <GoogleDriveIcon size={16} />
                            <span className="hidden sm:inline">
                              {savingToDriveFormatId === format.formatId ? 'Saving...' : 'Drive'}
                            </span>
                          </button>
                        )}

                        {/* Download Trigger Button */}
                        <button
                          type="button"
                          onClick={() => onDownloadFormat(format)}
                          disabled={isDownloading}
                          className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 rounded-xl shadow-sm transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          <span>{isDownloading ? 'Preparing...' : 'Download'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Security & Disclaimer Note */}
              <div className="mt-5 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  {media.notes || 'ClipVory streams authorized and public media without logging your links.'}{' '}
                  Download speeds depend on origin server bandwidth.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
