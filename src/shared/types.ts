export type PlatformId =
  | 'youtube'
  | 'instagram'
  | 'tiktok'
  | 'facebook'
  | 'twitter'
  | 'vimeo'
  | 'reddit'
  | 'pinterest'
  | 'dailymotion'
  | 'direct';

export interface MediaFormat {
  formatId: string;
  label: string; // e.g., '1080p Full HD', '720p HD', '480p SD', '360p', 'Audio (MP3)'
  quality: '1080p' | '720p' | '480p' | '360p' | 'audio' | 'original';
  ext: 'mp4' | 'webm' | 'mp3' | 'm4a';
  filesize?: number;
  filesizeFormatted?: string;
  hasAudio: boolean;
  hasVideo: boolean;
  downloadUrl?: string; // Internal or proxy download endpoint
  directStreamUrl?: string; // Raw upstream video stream URL if accessible
  bitrate?: number;
  mimeType?: string;
  note?: string;
}

export interface VideoMediaInfo {
  url: string;
  platform: PlatformId;
  platformName: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  author?: string;
  authorUrl?: string;
  authorAvatar?: string;
  duration?: number; // in seconds
  durationFormatted?: string;
  views?: number;
  likes?: number;
  publishDate?: string;
  formats: MediaFormat[];
  isDirectDownloadable: boolean;
  requiresAuth?: boolean;
  notes?: string;
  previewVideoUrl?: string;
  isPlaylist?: boolean;
  playlistId?: string;
}

export interface PlaylistItem {
  id: string;
  index: number;
  title: string;
  url: string;
  thumbnailUrl: string;
  duration?: string;
  author?: string;
  status?: 'idle' | 'queued' | 'downloading' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  downloadUrl?: string;
}

export interface PlaylistInfo {
  id: string;
  url: string;
  platform: PlatformId;
  platformName: string;
  title: string;
  description?: string;
  author?: string;
  thumbnailUrl: string;
  totalVideos: number;
  items: PlaylistItem[];
  supportedQualities: Array<'1080p' | '720p' | '480p' | '360p' | 'audio'>;
  notes?: string;
}

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  color: string;
  icon: string;
  domains: string[];
  status: 'active' | 'limited' | 'configured';
  statusLabel: string;
  capabilities: string[];
  sampleUrl: string;
  sampleTitle: string;
  samplePlaylistUrl?: string;
  samplePlaylistTitle?: string;
  authNote?: string;
  supportsPlaylists?: boolean;
}

export interface DownloadHistoryItem {
  id: string;
  timestamp: number;
  url: string;
  platform: PlatformId;
  platformName: string;
  title: string;
  thumbnailUrl: string;
  formatSelected: string;
  ext: string;
  quality: string;
  downloadUrl?: string;
  isPlaylist?: boolean;
  itemCount?: number;
}

export interface ExtractRequest {
  url: string;
}

export interface ExtractResponse {
  success: boolean;
  data?: VideoMediaInfo;
  error?: string;
  code?: string;
}

export interface PlaylistExtractResponse {
  success: boolean;
  data?: PlaylistInfo;
  error?: string;
  code?: string;
}

export interface RelatedPlaylistItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  platform: PlatformId;
  platformName: string;
  duration?: string;
  durationSeconds?: number;
  author?: string;
  views?: string;
  publishedAt?: string;
  isDownloadable?: boolean;
}

export interface RelatedPlaylistData {
  originalVideo: {
    id?: string;
    title: string;
    url: string;
    thumbnailUrl: string;
    platform: PlatformId;
    platformName: string;
    author?: string;
    duration?: string;
  };
  playlistTitle: string;
  topic: string;
  category: string;
  keywords: string[];
  concepts?: string[];
  totalVideos: number;
  items: RelatedPlaylistItem[];
  hasMore: boolean;
  page?: number;
}

export interface RelatedPlaylistResponse {
  success: boolean;
  data?: RelatedPlaylistData;
  error?: string;
  code?: string;
}

export interface GenerateRelatedPlaylistRequest {
  url?: string;
  topic?: string;
  keywords?: string[];
  platform?: PlatformId;
  originalVideoInfo?: Partial<VideoMediaInfo>;
  page?: number;
  limit?: number;
  excludeIds?: string[];
}
