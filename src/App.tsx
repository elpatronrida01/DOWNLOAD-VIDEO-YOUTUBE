import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  X 
} from 'lucide-react';
import { Header } from './components/Header.tsx';
import { HeroInput } from './components/HeroInput.tsx';
import { MediaResultCard } from './components/MediaResultCard.tsx';
import { PlaylistView } from './components/PlaylistView.tsx';
import { RelatedVideosPlaylistSection } from './components/RelatedVideosPlaylistSection.tsx';
import { HistorySection } from './components/HistorySection.tsx';
import { PlatformGrid } from './components/PlatformGrid.tsx';
import { FeaturesSection } from './components/FeaturesSection.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { Footer } from './components/Footer.tsx';
import { Modals, ActiveModal } from './components/Modals.tsx';
import { DownloadProgressModal, type DownloadErrorDetails } from './components/DownloadProgressModal.tsx';
import { GoogleDriveModal } from './components/GoogleDriveModal.tsx';
import { initAuth, googleSignIn, getAccessToken } from './services/googleAuth.ts';
import { getOrCreateClipVoryFolder, uploadMediaToDrive } from './services/googleDrive.ts';
import { sanitizeClientFilename } from './utils/formatters.ts';
import type { 
  VideoMediaInfo, 
  MediaFormat, 
  PlatformConfig, 
  DownloadHistoryItem,
  ExtractResponse,
  PlaylistInfo,
  PlaylistItem,
  PlaylistExtractResponse,
  RelatedPlaylistData,
  RelatedPlaylistItem,
  RelatedPlaylistResponse
} from './shared/types.ts';
import { classifyUrl } from './shared/urlClassifier.ts';
import { useTheme } from './context/ThemeContext.tsx';

const LOCAL_STORAGE_HISTORY_KEY = 'clipvory_history_v1';

export default function App() {
  const { isDark, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'single' | 'playlist' | 'related'>('single');
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Single Video state
  const [mediaInfo, setMediaInfo] = useState<VideoMediaInfo | null>(null);
  const [downloadingFormatId, setDownloadingFormatId] = useState<string | null>(null);
  const [progressModalFormat, setProgressModalFormat] = useState<MediaFormat | null>(null);
  
  // Real-time Download Progress & Diagnostics state
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadStatus, setDownloadStatus] = useState<'downloading' | 'completed' | 'error'>('downloading');
  const [downloadErrorDetails, setDownloadErrorDetails] = useState<DownloadErrorDetails | null>(null);
  const [bytesReceived, setBytesReceived] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);

  // Playlist state
  const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Related Videos Playlist state
  const [relatedPlaylistData, setRelatedPlaylistData] = useState<RelatedPlaylistData | null>(null);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [isLoadingMoreRelated, setIsLoadingMoreRelated] = useState(false);
  const [isDownloadingRelatedZip, setIsDownloadingRelatedZip] = useState(false);
  const [isSavingRelatedZipToDrive, setIsSavingRelatedZipToDrive] = useState(false);

  // Google Drive state
  const [driveUser, setDriveUser] = useState<User | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [savingToDriveFormatId, setSavingToDriveFormatId] = useState<string | null>(null);
  const [isSavingZipToDrive, setIsSavingZipToDrive] = useState(false);
  const [driveNotification, setDriveNotification] = useState<{
    type: 'info' | 'success' | 'error';
    message: string;
    link?: string;
  } | null>(null);

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([]);

  const [history, setHistory] = useState<DownloadHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Listen for Google Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setDriveUser(user);
      },
      () => {
        setDriveUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Load platforms metadata from backend
  useEffect(() => {
    fetch('/api/platforms')
      .then((res) => res.json())
      .then((data) => {
        if (data.platforms) {
          setPlatforms(data.platforms);
        }
      })
      .catch(() => {});
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: DownloadHistoryItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== item.id && h.url !== item.url);
      const next = [item, ...filtered].slice(0, 25);
      try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    } catch {}
  };

  const triggerRelatedPlaylistFetch = async (targetUrl: string, originalMedia?: VideoMediaInfo) => {
    setIsLoadingRelated(true);
    try {
      const res = await fetch('/api/related-playlist/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: targetUrl,
          originalVideoInfo: originalMedia,
        }),
      });

      const data: RelatedPlaylistResponse = await res.json();
      if (res.ok && data.success && data.data) {
        setRelatedPlaylistData(data.data);
      }
    } catch (err) {
      console.warn('Failed to load related playlist in background:', err);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const handleFetch = async (targetUrl?: string, isPlaylistMode = false, isRelatedMode = false) => {
    const finalUrl = (targetUrl || url).trim();
    if (!finalUrl) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Explicitly determine which workflow to execute
    // Priority: Explicit parameter if provided by caller, otherwise the active tab mode
    const activeWorkflow: 'single' | 'playlist' | 'related' = 
      isRelatedMode ? 'related' :
      isPlaylistMode ? 'playlist' :
      mode;

    // 1. Related Playlist Mode
    if (activeWorkflow === 'related') {
      try {
        const isHttpUrl = /^https?:\/\//i.test(finalUrl);
        const reqPayload = isHttpUrl ? { url: finalUrl } : { topic: finalUrl };
        const res = await fetch('/api/related-playlist/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reqPayload),
        });

        const data: RelatedPlaylistResponse = await res.json();
        if (!res.ok || !data.success || !data.data) {
          throw new Error(data.error || 'Unable to generate related playlist.');
        }

        setRelatedPlaylistData(data.data);
        setMediaInfo(null);
        setPlaylistInfo(null);
        setMode('related');
      } catch (err: any) {
        setErrorMessage(err.message || 'Error generating related playlist.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. Playlist Extraction Mode
    if (activeWorkflow === 'playlist') {
      try {
        const classification = classifyUrl(finalUrl, 'playlist');
        const targetPlaylistUrl = classification.cleanPlaylistUrl || finalUrl;

        const res = await fetch('/api/playlist/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetPlaylistUrl }),
        });

        const data: PlaylistExtractResponse = await res.json();

        if (!res.ok || !data.success || !data.data) {
          throw new Error(data.error || 'Unable to extract playlist information.');
        }

        setPlaylistInfo(data.data);
        setMediaInfo(null);
        setRelatedPlaylistData(null);
        setMode('playlist');
      } catch (err: any) {
        setErrorMessage(err.message || 'An error occurred while fetching the playlist.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 3. Single Video Extraction Mode (activeWorkflow === 'single')
    // Validates single video, fetches metadata, and NEVER automatically switches to playlist mode!
    try {
      const classification = classifyUrl(finalUrl, 'single');

      // Warn if user pasted a dedicated playlist URL into single video mode
      if (classification.isDedicatedPlaylist && !classification.videoId) {
        throw new Error('This URL is a dedicated playlist. Please switch to the "Playlist Downloader" tab to inspect and batch download this playlist.');
      }

      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      });

      const data: ExtractResponse = await res.json();

      if (!res.ok || !data.success || !data.data) {
        throw new Error(data.error || 'Failed to extract video information.');
      }

      setMediaInfo(data.data);
      setPlaylistInfo(null);
      setMode('single');

      // Automatically identify video's topic and generate related playlist below
      triggerRelatedPlaylistFetch(finalUrl, data.data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error: could not connect to extraction service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshRelated = async () => {
    if (!relatedPlaylistData) return;
    setIsLoadingRelated(true);
    try {
      const res = await fetch('/api/related-playlist/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: relatedPlaylistData.originalVideo?.url !== '#' ? relatedPlaylistData.originalVideo?.url : undefined,
          topic: relatedPlaylistData.topic,
          keywords: relatedPlaylistData.keywords,
          page: 1,
        }),
      });

      const data: RelatedPlaylistResponse = await res.json();
      if (res.ok && data.success && data.data) {
        setRelatedPlaylistData(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRelated(false);
    }
  };

  const handleLoadMoreRelated = async () => {
    if (!relatedPlaylistData || isLoadingMoreRelated) return;
    setIsLoadingMoreRelated(true);

    try {
      const nextPage = (relatedPlaylistData.page || 1) + 1;
      const res = await fetch('/api/related-playlist/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: relatedPlaylistData.originalVideo?.url !== '#' ? relatedPlaylistData.originalVideo?.url : undefined,
          topic: relatedPlaylistData.topic,
          keywords: relatedPlaylistData.keywords,
          page: nextPage,
          excludeIds: relatedPlaylistData.items.map((i) => i.id),
        }),
      });

      const data: RelatedPlaylistResponse = await res.json();
      if (res.ok && data.success && data.data && data.data.items.length > 0) {
        setRelatedPlaylistData((prev) => {
          if (!prev) return data.data!;
          const existingIds = new Set(prev.items.map((i) => i.id));
          const newItems = data.data!.items.filter((i) => !existingIds.has(i.id));
          return {
            ...prev,
            items: [...prev.items, ...newItems],
            page: nextPage,
            hasMore: data.data!.hasMore && newItems.length > 0,
          };
        });
      }
    } catch (err) {
      console.error('Failed to load more related videos:', err);
    } finally {
      setIsLoadingMoreRelated(false);
    }
  };

  const handleGenerateFromTopic = (topic: string, keywords?: string[]) => {
    setUrl(topic);
    setMode('related');
    setErrorMessage(null);
    setIsLoading(true);

    fetch('/api/related-playlist/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, keywords }),
    })
      .then((res) => res.json())
      .then((data: RelatedPlaylistResponse) => {
        if (!data.success || !data.data) {
          throw new Error(data.error || 'Failed to generate playlist from topic.');
        }
        setRelatedPlaylistData(data.data);
        setMediaInfo(null);
        setPlaylistInfo(null);
        setTimeout(() => {
          document.getElementById('related-playlist-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      })
      .catch((err) => {
        setErrorMessage(err.message || 'Failed to generate playlist.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleDownloadSingleRelatedItem = async (item: RelatedPlaylistItem, quality: string, ext: 'mp4' | 'mp3') => {
    const downloadUrl = `/api/download?platform=${item.platform}&id=${item.id}&quality=${quality}&title=${encodeURIComponent(item.title)}&ext=${ext}&streamUrl=${encodeURIComponent(item.url)}`;
    
    const pseudoFormat: MediaFormat = {
      formatId: `rel-${item.id}`,
      label: `${quality} ${ext.toUpperCase()}`,
      quality: quality as any,
      ext,
      hasAudio: true,
      hasVideo: ext === 'mp4',
      downloadUrl,
    };

    setProgressModalFormat(pseudoFormat);
    setDownloadProgress(0);
    setDownloadStatus('downloading');
    setDownloadErrorDetails(null);
    setBytesReceived(0);
    setTotalBytes(0);

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        let errMessage = `Download failed with HTTP ${response.status}`;
        let reqId = response.headers.get('x-request-id') || undefined;
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
          if (errData.requestId) reqId = errData.requestId;
        } catch {}

        setDownloadStatus('error');
        setDownloadErrorDetails({
          requestId: reqId,
          message: errMessage,
          status: response.status,
        });
        return;
      }

      const contentLengthHeader = response.headers.get('content-length');
      const total = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      setTotalBytes(total);

      const reader = response.body?.getReader();
      const chunks: BlobPart[] = [];
      let received = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            setBytesReceived(received);
            if (total > 0) {
              setDownloadProgress(Math.min(99, Math.round((received / total) * 100)));
            } else {
              setDownloadProgress(50);
            }
          }
        }
      }

      const mimeType = ext === 'mp3' ? 'audio/mpeg' : 'video/mp4';
      const blob = new Blob(chunks, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${sanitizeClientFilename(item.title)}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 10000);

      setDownloadProgress(100);
      setDownloadStatus('completed');

      saveToHistory({
        id: `rel-${item.id}-${Date.now()}`,
        timestamp: Date.now(),
        url: item.url,
        platform: item.platform,
        platformName: item.platformName,
        title: item.title,
        thumbnailUrl: item.thumbnailUrl,
        formatSelected: `${quality} ${ext.toUpperCase()}`,
        ext,
        quality,
        downloadUrl,
      });
    } catch (err: any) {
      setDownloadStatus('error');
      setDownloadErrorDetails({
        message: err.message || 'Connection error downloading related item.',
      });
    }
  };

  const handleDownloadRelatedSelectedZip = async (items: RelatedPlaylistItem[], quality: string, ext: 'mp4' | 'mp3') => {
    if (!relatedPlaylistData || items.length === 0) return;
    setIsDownloadingRelatedZip(true);

    try {
      const res = await fetch('/api/playlist/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistTitle: relatedPlaylistData.playlistTitle,
          items: items.map((i) => ({ id: i.id, title: i.title, url: i.url })),
          quality,
          ext,
        }),
      });

      if (!res.ok) {
        throw new Error('Server failed to compress related playlist into ZIP archive.');
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${sanitizeClientFilename(relatedPlaylistData.playlistTitle)}_archive.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      saveToHistory({
        id: `relzip-${Date.now()}`,
        timestamp: Date.now(),
        url: relatedPlaylistData.originalVideo?.url || window.location.href,
        platform: 'youtube',
        platformName: 'Related Playlist Bundle',
        title: `${relatedPlaylistData.playlistTitle} (${items.length} videos ZIP)`,
        thumbnailUrl: relatedPlaylistData.items[0]?.thumbnailUrl || relatedPlaylistData.originalVideo?.thumbnailUrl || '',
        formatSelected: `${quality} ZIP Archive`,
        ext: 'zip' as any,
        quality,
        isPlaylist: true,
        itemCount: items.length,
      });
    } catch (err: any) {
      setErrorMessage(`ZIP compression error: ${err.message}`);
    } finally {
      setIsDownloadingRelatedZip(false);
    }
  };

  const handleSaveRelatedZipToDrive = async (items: RelatedPlaylistItem[], quality: string, ext: 'mp4' | 'mp3') => {
    if (!relatedPlaylistData || items.length === 0) return;

    let token = await getAccessToken();
    if (!token || !driveUser) {
      try {
        const res = await googleSignIn();
        if (!res?.accessToken) {
          throw new Error('Sign-in cancelled or failed to obtain access token.');
        }
        token = res.accessToken;
        setDriveUser(res.user);
      } catch (authErr: any) {
        setDriveNotification({
          type: 'error',
          message: authErr.message || 'Google Drive authentication was cancelled.',
        });
        return;
      }
    }

    if (!token) {
      setDriveNotification({
        type: 'error',
        message: 'Could not obtain Google Drive access token.',
      });
      return;
    }

    setIsSavingRelatedZipToDrive(true);
    setDriveNotification({
      type: 'info',
      message: `Compressing and saving "${relatedPlaylistData.playlistTitle}" to Google Drive...`,
    });

    try {
      const res = await fetch('/api/playlist/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistTitle: relatedPlaylistData.playlistTitle,
          items: items.map((i) => ({ id: i.id, title: i.title, url: i.url })),
          quality,
          ext,
        }),
      });

      if (!res.ok) {
        let errorDetail = `Failed to create archive on server (${res.status}).`;
        try {
          const errData = await res.json();
          if (errData.error) errorDetail = errData.error;
        } catch {}
        throw new Error(errorDetail);
      }

      const blob = await res.blob();
      const folderId = await getOrCreateClipVoryFolder(token);
      const uploaded = await uploadMediaToDrive(token, {
        filename: `${sanitizeClientFilename(relatedPlaylistData.playlistTitle)}_archive.zip`,
        mimeType: 'application/zip',
        blob,
        folderId,
      });

      setDriveNotification({
        type: 'success',
        message: `Successfully uploaded "${uploaded.name}" (${items.length} related videos) to Google Drive!`,
        link: uploaded.webViewLink,
      });
    } catch (err: any) {
      setDriveNotification({
        type: 'error',
        message: err.message || 'Failed to save related playlist ZIP to Google Drive.',
      });
    } finally {
      setIsSavingRelatedZipToDrive(false);
    }
  };

  // Resilient streaming download handler for single video/audio
  const handleDownloadFormat = async (format: MediaFormat) => {
    if (!mediaInfo) return;

    setDownloadingFormatId(format.formatId);
    setProgressModalFormat(format);
    setDownloadProgress(0);
    setDownloadStatus('downloading');
    setDownloadErrorDetails(null);
    setBytesReceived(0);
    setTotalBytes(0);

    const targetDownloadUrl = format.downloadUrl || format.directStreamUrl;
    if (!targetDownloadUrl) {
      setDownloadStatus('error');
      setDownloadErrorDetails({
        message: 'No download endpoint found for this format.',
      });
      setDownloadingFormatId(null);
      return;
    }

    try {
      const response = await fetch(targetDownloadUrl);

      if (!response.ok) {
        let errMessage = `Download request failed with status ${response.status}.`;
        let reqId = response.headers.get('x-request-id') || undefined;
        let stage: string | undefined = undefined;

        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
          if (errData.requestId) reqId = errData.requestId;
          if (errData.stage) stage = errData.stage;
        } catch {
          // If not JSON, use default error message
        }

        setDownloadStatus('error');
        setDownloadErrorDetails({
          requestId: reqId,
          message: errMessage,
          stage,
          status: response.status,
        });
        setDownloadingFormatId(null);
        return;
      }

      const contentLengthHeader = response.headers.get('content-length');
      const total = contentLengthHeader ? parseInt(contentLengthHeader, 10) : (format.filesize || 0);
      setTotalBytes(total);

      const reader = response.body?.getReader();
      const chunks: BlobPart[] = [];
      let received = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            setBytesReceived(received);
            if (total > 0) {
              setDownloadProgress(Math.min(99, Math.round((received / total) * 100)));
            } else {
              setDownloadProgress(50);
            }
          }
        }
      }

      const mimeType = format.ext === 'mp3' ? 'audio/mpeg' : 'video/mp4';
      const blob = new Blob(chunks, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const safeTitle = sanitizeClientFilename(mediaInfo.title);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${safeTitle}.${format.ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 10000);

      setDownloadProgress(100);
      setDownloadStatus('completed');

      // Record in history
      const historyItem: DownloadHistoryItem = {
        id: `${mediaInfo.platform}-${Date.now()}`,
        timestamp: Date.now(),
        url: mediaInfo.url,
        platform: mediaInfo.platform,
        platformName: mediaInfo.platformName,
        title: mediaInfo.title,
        thumbnailUrl: mediaInfo.thumbnailUrl,
        formatSelected: format.label,
        ext: format.ext,
        quality: format.quality,
        downloadUrl: targetDownloadUrl,
      };
      saveToHistory(historyItem);
    } catch (err: any) {
      console.error('[CLIENT_DOWNLOAD_FAILED]', err);
      setDownloadStatus('error');
      setDownloadErrorDetails({
        message: err.message || 'Network stream was interrupted. Please retry.',
      });
    } finally {
      setDownloadingFormatId(null);
    }
  };

  // Google Drive save single media handler
  const handleSaveToDrive = async (format: MediaFormat) => {
    if (!mediaInfo) return;
    setSavingToDriveFormatId(format.formatId);
    setDriveNotification({
      type: 'info',
      message: `Connecting to Google Drive to save "${mediaInfo.title}.${format.ext}"...`,
    });

    try {
      let token = await getAccessToken();
      if (!token || !driveUser) {
        const res = await googleSignIn();
        if (!res?.accessToken) {
          throw new Error('Sign-in cancelled or failed to obtain access token.');
        }
        token = res.accessToken;
        setDriveUser(res.user);
      }

      setDriveNotification({
        type: 'info',
        message: `Preparing "${mediaInfo.title}.${format.ext}" and uploading to Google Drive...`,
      });

      const targetUrl = format.downloadUrl || format.directStreamUrl;
      if (!targetUrl) throw new Error('Download URL not found.');

      // Fetch media file
      const mediaRes = await fetch(targetUrl);
      if (!mediaRes.ok) {
        let errorDetail = `Failed to retrieve media stream (${mediaRes.status}).`;
        try {
          const errData = await mediaRes.json();
          if (errData.error) errorDetail = errData.error;
        } catch {
          // Response body was not JSON
        }
        throw new Error(errorDetail);
      }
      const blob = await mediaRes.blob();

      // Find or create 'ClipVory Downloads' folder in user's Drive
      const folderId = await getOrCreateClipVoryFolder(token);
      const mimeType = format.ext === 'mp3' ? 'audio/mpeg' : 'video/mp4';

      const uploaded = await uploadMediaToDrive(token, {
        filename: `${mediaInfo.title}.${format.ext}`,
        mimeType,
        blob,
        folderId,
      });

      setDriveNotification({
        type: 'success',
        message: `Successfully uploaded "${uploaded.name}" to Google Drive folder "ClipVory Downloads"!`,
        link: uploaded.webViewLink,
      });
    } catch (err: any) {
      setDriveNotification({
        type: 'error',
        message: err.message || 'Failed to save file to Google Drive.',
      });
    } finally {
      setSavingToDriveFormatId(null);
    }
  };

  // Google Drive save playlist zip handler
  const handleSaveZipToDrive = async (items: PlaylistItem[], quality: string, ext: 'mp4' | 'mp3') => {
    if (!playlistInfo || items.length === 0) return;
    setIsSavingZipToDrive(true);
    setDriveNotification({
      type: 'info',
      message: `Connecting to Google Drive to save "${playlistInfo.title}" archive...`,
    });

    try {
      let token = await getAccessToken();
      if (!token || !driveUser) {
        const res = await googleSignIn();
        if (!res?.accessToken) {
          throw new Error('Sign-in cancelled or failed to obtain access token.');
        }
        token = res.accessToken;
        setDriveUser(res.user);
      }

      setDriveNotification({
        type: 'info',
        message: `Generating ZIP archive for ${items.length} items and uploading to Google Drive...`,
      });

      const res = await fetch('/api/playlist/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistTitle: playlistInfo.title,
          items: items.map((i) => ({ id: i.id, title: i.title, url: i.url })),
          quality,
          ext,
        }),
      });

      if (!res.ok) {
        let errorDetail = `Server failed to compress playlist into ZIP archive (${res.status}).`;
        try {
          const errData = await res.json();
          if (errData.error) errorDetail = errData.error;
        } catch {}
        throw new Error(errorDetail);
      }

      const blob = await res.blob();
      const folderId = await getOrCreateClipVoryFolder(token);
      const uploaded = await uploadMediaToDrive(token, {
        filename: `${playlistInfo.title}_archive.zip`,
        mimeType: 'application/zip',
        blob,
        folderId,
      });

      setDriveNotification({
        type: 'success',
        message: `Successfully uploaded "${uploaded.name}" (${items.length} videos) to Google Drive!`,
        link: uploaded.webViewLink,
      });
    } catch (err: any) {
      setDriveNotification({
        type: 'error',
        message: err.message || 'Failed to save playlist ZIP to Google Drive.',
      });
    } finally {
      setIsSavingZipToDrive(false);
    }
  };

  // Playlist single item download handler
  const handleDownloadSinglePlaylistItem = async (item: PlaylistItem, quality: string, ext: 'mp4' | 'mp3') => {
    const downloadUrl = `/api/download?platform=youtube&id=${item.id}&quality=${quality}&title=${encodeURIComponent(item.title)}&ext=${ext}`;
    
    // Open progress modal with this item format
    const pseudoFormat: MediaFormat = {
      formatId: `pl-item-${item.id}`,
      label: `${quality} ${ext.toUpperCase()}`,
      quality: quality as any,
      ext,
      hasAudio: true,
      hasVideo: ext === 'mp4',
      downloadUrl,
    };

    setProgressModalFormat(pseudoFormat);
    setDownloadProgress(0);
    setDownloadStatus('downloading');
    setDownloadErrorDetails(null);
    setBytesReceived(0);
    setTotalBytes(0);

    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        let errMessage = `Download failed with HTTP ${response.status}`;
        let reqId = response.headers.get('x-request-id') || undefined;
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
          if (errData.requestId) reqId = errData.requestId;
        } catch {}

        setDownloadStatus('error');
        setDownloadErrorDetails({
          requestId: reqId,
          message: errMessage,
          status: response.status,
        });
        return;
      }

      const contentLengthHeader = response.headers.get('content-length');
      const total = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
      setTotalBytes(total);

      const reader = response.body?.getReader();
      const chunks: BlobPart[] = [];
      let received = 0;

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            received += value.length;
            setBytesReceived(received);
            if (total > 0) {
              setDownloadProgress(Math.min(99, Math.round((received / total) * 100)));
            }
          }
        }
      }

      const mimeType = ext === 'mp3' ? 'audio/mpeg' : 'video/mp4';
      const blob = new Blob(chunks, { type: mimeType });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${sanitizeClientFilename(item.title)}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 10000);

      setDownloadProgress(100);
      setDownloadStatus('completed');

      // Add to history
      saveToHistory({
        id: `pl-${item.id}-${Date.now()}`,
        timestamp: Date.now(),
        url: item.url,
        platform: 'youtube',
        platformName: 'YouTube Playlist Item',
        title: item.title,
        thumbnailUrl: item.thumbnailUrl,
        formatSelected: `${quality} ${ext.toUpperCase()}`,
        ext,
        quality,
        downloadUrl,
      });
    } catch (err: any) {
      setDownloadStatus('error');
      setDownloadErrorDetails({
        message: err.message || 'Connection error downloading playlist item.',
      });
    }
  };

  // Playlist ZIP archive download handler
  const handleDownloadSelectedZip = async (items: PlaylistItem[], quality: string, ext: 'mp4' | 'mp3') => {
    if (!playlistInfo || items.length === 0) return;

    setIsDownloadingZip(true);

    try {
      const res = await fetch('/api/playlist/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playlistTitle: playlistInfo.title,
          items: items.map((i) => ({ id: i.id, title: i.title, url: i.url })),
          quality,
          ext,
        }),
      });

      if (!res.ok) {
        throw new Error('Server failed to compress playlist into ZIP.');
      }

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `${sanitizeClientFilename(playlistInfo.title)}_archive.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      // Record in history
      saveToHistory({
        id: `zip-${playlistInfo.id}-${Date.now()}`,
        timestamp: Date.now(),
        url: playlistInfo.url,
        platform: 'youtube',
        platformName: 'YouTube Playlist ZIP',
        title: `${playlistInfo.title} (${items.length} videos ZIP)`,
        thumbnailUrl: playlistInfo.thumbnailUrl,
        formatSelected: `${quality} ZIP Bundle`,
        ext: 'zip' as any,
        quality,
        isPlaylist: true,
        itemCount: items.length,
      });
    } catch (err: any) {
      setErrorMessage(`ZIP compression error: ${err.message}`);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleRedownload = (item: DownloadHistoryItem) => {
    setUrl(item.url);
    if (item.isPlaylist) {
      setMode('playlist');
      handleFetch(item.url, true);
    } else {
      setMode('single');
      handleFetch(item.url, false);
    }
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setErrorMessage(null);
    const classification = classifyUrl(sampleUrl);
    const isPl = classification.type === 'playlist';
    setMode(isPl ? 'playlist' : 'single');
    handleFetch(sampleUrl, isPl);
    document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        onNavigate={scrollToSection}
        historyCount={history.length}
        onOpenDrive={() => setIsDriveModalOpen(true)}
        driveUser={driveUser}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero & Input Section */}
        <HeroInput
          url={url}
          setUrl={setUrl}
          onFetch={handleFetch}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onClearError={() => setErrorMessage(null)}
          mode={mode}
          onModeChange={(m) => {
            setMode(m);
            setErrorMessage(null);
          }}
          onGenerateFromTopic={handleGenerateFromTopic}
        />

        {/* Single Video Results Card */}
        {mediaInfo && !playlistInfo && (
          <MediaResultCard
            media={mediaInfo}
            onDownloadFormat={handleDownloadFormat}
            downloadingFormatId={downloadingFormatId}
            onSaveToDrive={handleSaveToDrive}
            savingToDriveFormatId={savingToDriveFormatId}
            onViewRelatedPlaylist={() => {
              const el = document.getElementById('related-playlist-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* Intelligent Related Videos Playlist Generator */}
        {((mediaInfo && !playlistInfo) || mode === 'related' || relatedPlaylistData) && (
          <RelatedVideosPlaylistSection
            playlistData={relatedPlaylistData}
            isLoading={isLoadingRelated}
            onRefresh={handleRefreshRelated}
            onLoadMore={handleLoadMoreRelated}
            isLoadingMore={isLoadingMoreRelated}
            onDownloadSingleItem={handleDownloadSingleRelatedItem}
            onDownloadSelectedZip={handleDownloadRelatedSelectedZip}
            isDownloadingZip={isDownloadingRelatedZip}
            onSaveZipToDrive={handleSaveRelatedZipToDrive}
            isSavingZipToDrive={isSavingRelatedZipToDrive}
            onGenerateFromTopic={handleGenerateFromTopic}
          />
        )}

        {/* Playlist Results View */}
        {playlistInfo && (
          <PlaylistView
            playlist={playlistInfo}
            onDownloadSingleItem={handleDownloadSinglePlaylistItem}
            onDownloadSelectedZip={handleDownloadSelectedZip}
            isDownloadingZip={isDownloadingZip}
            onSaveZipToDrive={handleSaveZipToDrive}
            isSavingZipToDrive={isSavingZipToDrive}
          />
        )}

        {/* History Section */}
        <HistorySection
          history={history}
          onClearHistory={handleClearHistory}
          onRedownload={handleRedownload}
        />

        {/* Supported Platforms Grid */}
        <PlatformGrid
          platforms={platforms}
          onSelectSample={handleSelectSample}
        />

        {/* Features & Security */}
        <FeaturesSection />

        {/* FAQ Section */}
        <FaqSection />
      </main>

      {/* Footer */}
      <Footer
        onOpenModal={(modal) => setActiveModal(modal)}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Modals */}
      <Modals
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
      />

      {/* Google Drive Storage Management Modal */}
      <GoogleDriveModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        user={driveUser}
        onUserChange={setDriveUser}
      />

      {/* Download Progress & Diagnostics Modal */}
      <DownloadProgressModal
        format={progressModalFormat}
        videoTitle={mediaInfo?.title || playlistInfo?.title || 'clipvory_media'}
        progress={downloadProgress}
        status={downloadStatus}
        errorDetails={downloadErrorDetails}
        bytesReceived={bytesReceived}
        totalBytes={totalBytes}
        onRetry={() => {
          if (progressModalFormat) {
            handleDownloadFormat(progressModalFormat);
          }
        }}
        onClose={() => {
          setProgressModalFormat(null);
          setDownloadStatus('downloading');
          setDownloadProgress(0);
          setDownloadErrorDetails(null);
        }}
      />

      {/* Floating Google Drive Sync Toast */}
      {driveNotification && (
        <div 
          className="fixed bottom-5 right-5 z-50 max-w-md w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5"
          role="status"
          aria-live="polite"
        >
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0">
            {driveNotification.type === 'info' && <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />}
            {driveNotification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            {driveNotification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              {driveNotification.type === 'info' && 'Google Drive Syncing'}
              {driveNotification.type === 'success' && 'Google Drive Upload Complete'}
              {driveNotification.type === 'error' && 'Google Drive Error'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 break-words">
              {driveNotification.message}
            </p>
            {driveNotification.link && (
              <a
                href={driveNotification.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <span>View file in Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <button
            type="button"
            onClick={() => setDriveNotification(null)}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
