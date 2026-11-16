import React, { useState, useEffect } from 'react';
import { 
  Link2, 
  ArrowRight, 
  Clipboard, 
  X, 
  Loader2, 
  AlertCircle, 
  ListVideo, 
  Film,
  Info,
  Sparkles
} from 'lucide-react';
import type { PlatformId } from '../shared/types.ts';
import { PlatformIcon } from './PlatformIcons.tsx';
import { SupportedPlatformsStrip } from './SupportedPlatformsStrip.tsx';
import { classifyUrl } from '../shared/urlClassifier.ts';

interface HeroInputProps {
  url: string;
  setUrl: (url: string) => void;
  onFetch: (targetUrl?: string, isPlaylistMode?: boolean, isRelatedMode?: boolean) => void;
  isLoading: boolean;
  errorMessage: string | null;
  onClearError: () => void;
  mode: 'single' | 'playlist' | 'related';
  onModeChange: (mode: 'single' | 'playlist' | 'related') => void;
  onGenerateFromTopic?: (topic: string) => void;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  url,
  setUrl,
  onFetch,
  isLoading,
  errorMessage,
  onClearError,
  mode,
  onModeChange,
  onGenerateFromTopic,
}) => {
  const [detectedPlatform, setDetectedPlatform] = useState<PlatformId | null>(null);
  const [isUnsupportedUrl, setIsUnsupportedUrl] = useState(false);
  const [pasteSuccess, setPasteSuccess] = useState(false);

  // Auto-detect platform from current URL without forcibly redirecting mode
  useEffect(() => {
    const trimmed = url.trim();
    if (!trimmed) {
      setDetectedPlatform(null);
      setIsUnsupportedUrl(false);
      return;
    }

    const classification = classifyUrl(trimmed, mode);
    setDetectedPlatform(
      classification.platform !== 'unknown' ? (classification.platform as PlatformId) : null
    );

    // If user has entered a complete URL (starts with http) and it did not match any platform
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      setIsUnsupportedUrl(classification.type === 'unknown' && trimmed.length > 15);
    } else {
      setIsUnsupportedUrl(false);
    }
  }, [url, mode]);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setPasteSuccess(true);
          onClearError();
          setTimeout(() => setPasteSuccess(false), 2000);
        }
      }
    } catch {
      // Browser permission fallback
    }
  };

  const handleClear = () => {
    setUrl('');
    onClearError();
    setDetectedPlatform(null);
    setIsUnsupportedUrl(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onFetch(undefined, mode === 'playlist', mode === 'related');
    }
  };

  const handleSelectPlatformFromStrip = (platformId: PlatformId, sampleUrl: string) => {
    const classification = classifyUrl(sampleUrl);
    const isPlaylist = classification.type === 'playlist';
    if (isPlaylist && mode !== 'playlist') {
      onModeChange('playlist');
    } else if (!isPlaylist && mode === 'playlist') {
      onModeChange('single');
    }
    setUrl(sampleUrl);
    onClearError();
    onFetch(sampleUrl, isPlaylist, mode === 'related');
  };

  return (
    <section id="hero" className="relative pt-10 pb-12 md:pt-16 md:pb-20 overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-teal-400/10 blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Mode Selector Tabs (Single Video vs Related Playlist vs Batch Playlist) */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/60 mb-6 shadow-sm flex-wrap justify-center">
          <button
            type="button"
            onClick={() => onModeChange('single')}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'single'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Single Video</span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('related')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'related'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Related Playlist</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              AI
            </span>
          </button>

          <button
            type="button"
            onClick={() => onModeChange('playlist')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
              mode === 'playlist'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListVideo className="w-4 h-4 text-indigo-500" />
            <span>Playlist Downloader</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              ZIP
            </span>
          </button>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-4">
          {mode === 'single' ? (
            <>
              Download Any Video.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
                Fast & Clean.
              </span>
            </>
          ) : mode === 'related' ? (
            <>
              Generate Related Video Playlist.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
                Intelligent & Curated.
              </span>
            </>
          ) : (
            <>
              Download Entire Playlists.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500">
                Single Click & ZIP.
              </span>
            </>
          )}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
          {mode === 'single'
            ? 'Extract verified qualities up to 1080p Full HD, convert to MP3, and automatically generate relevant topic playlists.'
            : mode === 'related'
            ? 'Paste any video URL or type keywords to generate an intelligent 20-video playlist based on topic, genre, and conceptual relevance.'
            : 'Inspect all videos in a public playlist, select specific clips, download the queue, or export all files as a single ZIP archive.'}
        </p>

        {/* Input Form with Official Platform Logo Integration */}
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto mb-4">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5 p-2 bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/40 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-all">
            <div className="relative flex-1 flex items-center">
              {/* Dynamic Left Icon: Official Platform Logo or Generic Link */}
              <div className="absolute left-3.5 flex items-center justify-center pointer-events-none transition-transform duration-200">
                {detectedPlatform ? (
                  <PlatformIcon platform={detectedPlatform} size={24} />
                ) : mode === 'playlist' ? (
                  <ListVideo className="w-5 h-5 text-indigo-500" />
                ) : mode === 'related' ? (
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Link2 className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                )}
              </div>

              <input
                type={mode === 'related' ? 'text' : 'url'}
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (errorMessage) onClearError();
                }}
                placeholder={
                  mode === 'playlist'
                    ? 'Paste YouTube playlist link (e.g. https://www.youtube.com/playlist?list=...)'
                    : mode === 'related'
                    ? 'Paste video URL OR enter topic (e.g. Synthwave Beats, Classical Piano, Web Dev)...'
                    : 'Paste video link from YouTube, TikTok, Instagram, Reddit, Vimeo, Facebook, X...'
                }
                className="w-full pl-12 pr-28 py-3.5 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm sm:text-base outline-none focus:ring-0"
                autoComplete="off"
                spellCheck="false"
                required
              />

              {/* Action buttons & Detected Platform Badge inside input */}
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {detectedPlatform && (
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 animate-in fade-in duration-200">
                    <PlatformIcon platform={detectedPlatform} size={15} />
                    <span className="text-[11px] font-bold capitalize text-slate-800 dark:text-slate-200">
                      {detectedPlatform === 'twitter' ? 'X (Twitter)' : detectedPlatform}
                    </span>
                  </div>
                )}

                {url ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Clear URL"
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    title="Paste from clipboard"
                    className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span>{pasteSuccess ? 'Pasted!' : 'Paste'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer font-sans"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>
                    {mode === 'playlist'
                      ? 'Extracting Playlist...'
                      : mode === 'related'
                      ? 'Generating Related Playlist...'
                      : 'Fetching Media...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'playlist'
                      ? 'Fetch Playlist'
                      : mode === 'related'
                      ? 'Generate Playlist'
                      : 'Download'}
                  </span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Informative suggestion banner for dedicated playlist link entered in single mode */}
        {url.trim() && mode === 'single' && classifyUrl(url.trim(), 'single').isDedicatedPlaylist && (
          <div className="max-w-2xl mx-auto mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-left">
              <ListVideo className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>Dedicated playlist URL detected. Want to batch download all playlist videos?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onModeChange('playlist');
                onClearError();
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer whitespace-nowrap"
            >
              Switch to Playlist
            </button>
          </div>
        )}

        {/* Informative banner for video URL with attached playlist parameter */}
        {url.trim() && mode === 'single' && classifyUrl(url.trim(), 'single').hasBoth && (
          <div className="max-w-2xl mx-auto mb-3 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-1.5 truncate text-left">
              <Film className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="truncate">Single video selected. (Attached playlist parameter will not hijack this download).</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onModeChange('playlist');
                onClearError();
              }}
              className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap cursor-pointer ml-2"
            >
              Download Full Playlist
            </button>
          </div>
        )}

        {/* Informative banner for pure single video entered while on playlist mode */}
        {url.trim() && mode === 'playlist' && !classifyUrl(url.trim(), 'playlist').playlistId && classifyUrl(url.trim(), 'playlist').type === 'single_video' && (
          <div className="max-w-2xl mx-auto mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-xs flex items-center justify-between gap-2 animate-in fade-in">
            <div className="flex items-center gap-2 text-left">
              <Film className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>Single video URL detected. Want to download this individual video?</span>
            </div>
            <button
              type="button"
              onClick={() => {
                onModeChange('single');
                onClearError();
              }}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer whitespace-nowrap"
            >
              Switch to Single Video
            </button>
          </div>
        )}

        {/* Unsupported Platform Hint */}
        {isUnsupportedUrl && mode !== 'related' && (
          <div className="max-w-2xl mx-auto mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-center gap-2 animate-in fade-in">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Unrecognized video host. Pick from supported platforms below, or switch to Related Playlist to search by topic!</span>
          </div>
        )}

        {/* Error notification with Topic Fallback Action */}
        {errorMessage && (
          <div className="max-w-2xl mx-auto mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm text-left flex flex-col sm:flex-row items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
              <div>
                <p className="font-semibold mb-1">Extraction Notice</p>
                <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Can't extract metadata from this link? You can generate a Related Video Playlist directly using a topic or keywords!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClearError();
                    onModeChange('related');
                    if (onGenerateFromTopic && url.trim()) {
                      onGenerateFromTopic(url.trim());
                    }
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Related Playlist by Topic Instead</span>
                </button>
              </div>
            </div>
            <button
              onClick={onClearError}
              className="text-red-400 hover:text-red-600 dark:hover:text-red-200 p-1 cursor-pointer self-start"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Supported Platforms Strip (Official Logos) */}
        <SupportedPlatformsStrip
          onSelectPlatform={handleSelectPlatformFromStrip}
          activePlatform={detectedPlatform}
        />
      </div>
    </section>
  );
};
