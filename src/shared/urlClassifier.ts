import type { PlatformId } from './types.ts';

export type UrlClassificationType = 'single_video' | 'playlist' | 'unknown';

export interface UrlClassification {
  type: UrlClassificationType;
  platform: PlatformId | 'unknown';
  videoId: string | null;
  playlistId: string | null;
  hasBoth: boolean;
  isDedicatedPlaylist: boolean;
  cleanVideoUrl: string | null;
  cleanPlaylistUrl: string | null;
  platformName: string;
}

/**
 * Extracts YouTube video ID (11 characters) from standard, shortened, shorts, embed, or mobile URLs.
 */
export function extractYouTubeVideoId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const urlStr = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();

    // youtu.be/<id>
    if (host === 'youtu.be' || host.endsWith('.youtu.be')) {
      const pathname = parsed.pathname.replace(/^\/+/, '');
      const candidate = pathname.split('/')[0]?.split('?')[0];
      if (candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
        return candidate;
      }
    }

    // youtube.com variants
    if (
      host === 'youtube.com' ||
      host.endsWith('.youtube.com') ||
      host.includes('youtube-nocookie.com')
    ) {
      // 1. ?v= query param
      const v = parsed.searchParams.get('v');
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return v;
      }

      // 2. /shorts/<id>, /embed/<id>, /live/<id>, /v/<id>
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length >= 2) {
        const prefix = segments[0].toLowerCase();
        if (['shorts', 'embed', 'live', 'v'].includes(prefix)) {
          const candidate = segments[1];
          if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
            return candidate;
          }
        }
      }
    }
  } catch {
    // URL parsing fallback
  }

  // Regex fallback across any query params / timestamps / mobile formats
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/i
  );
  if (match && match[1]) return match[1];

  // Additional loose fallback for ?v= anywhere in string
  const vMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  return vMatch ? vMatch[1] : null;
}

/**
 * Extracts YouTube playlist ID (e.g. PL..., RD..., UU..., etc.) from any supported YouTube URL format.
 */
export function extractYouTubePlaylistId(rawUrl: string): string | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const urlStr = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();

    if (
      host === 'youtube.com' ||
      host.endsWith('.youtube.com') ||
      host === 'youtu.be' ||
      host.endsWith('.youtu.be') ||
      host.includes('youtube-nocookie.com')
    ) {
      const listParam = parsed.searchParams.get('list');
      if (listParam && /^[a-zA-Z0-9_-]+$/.test(listParam)) {
        return listParam;
      }

      const pParam = parsed.searchParams.get('p');
      if (pParam && /^[a-zA-Z0-9_-]+$/.test(pParam)) {
        return pParam;
      }
    }
  } catch {}

  const match = trimmed.match(/[?&](?:list|p)=([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}

/**
 * Checks whether a URL is strictly a dedicated playlist page (not an individual video).
 */
export function isDedicatedYouTubePlaylistUrl(rawUrl: string): boolean {
  if (!rawUrl) return false;
  const trimmed = rawUrl.trim();

  try {
    const urlStr = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname.toLowerCase();

    if (host.includes('youtube.com')) {
      if (pathname.includes('/playlist') || pathname.includes('/view_play_list')) {
        return true;
      }
    }
  } catch {}

  const playlistId = extractYouTubePlaylistId(trimmed);
  const videoId = extractYouTubeVideoId(trimmed);
  return Boolean(playlistId && !videoId);
}

/**
 * Classifies any given URL into:
 * - 'single_video'
 * - 'playlist'
 * - 'unknown'
 *
 * Rules:
 * 1. A YouTube URL with a specific video ID is classified as 'single_video' by default,
 *    even if it contains a `list=` parameter (e.g. watch?v=VIDEO_ID&list=PLAYLIST_ID).
 * 2. If the user explicitly selects 'playlist' mode AND the URL contains a valid playlist ID,
 *    the classification respects the user's intent as 'playlist'.
 * 3. Dedicated playlist URLs (e.g. /playlist?list=PLAYLIST_ID) with no video ID are classified as 'playlist'.
 * 4. Other supported platforms (TikTok, Instagram, Vimeo, Reddit, X/Twitter, Facebook, Dailymotion, Pinterest, Direct MP4)
 *    use platform-specific rules and are not falsely tagged as playlists via generic substring checks.
 */
export function classifyUrl(
  rawUrl: string,
  preferredMode?: 'single' | 'playlist' | 'related'
): UrlClassification {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return {
      type: 'unknown',
      platform: 'unknown',
      videoId: null,
      playlistId: null,
      hasBoth: false,
      isDedicatedPlaylist: false,
      cleanVideoUrl: null,
      cleanPlaylistUrl: null,
      platformName: 'Unknown',
    };
  }

  const lower = trimmed.toLowerCase();

  // 1. YouTube classification
  const isYouTubeDomain =
    lower.includes('youtube.com') ||
    lower.includes('youtu.be') ||
    lower.includes('youtube-nocookie.com');

  const ytVideoId = extractYouTubeVideoId(trimmed);
  const ytPlaylistId = extractYouTubePlaylistId(trimmed);

  if (isYouTubeDomain || ytVideoId || ytPlaylistId) {
    const isDedicatedPlaylist = isDedicatedYouTubePlaylistUrl(trimmed);
    const hasBoth = Boolean(ytVideoId && ytPlaylistId);

    let type: UrlClassificationType = 'unknown';

    if (isDedicatedPlaylist) {
      type = 'playlist';
    } else if (hasBoth) {
      // Prioritize user's explicit selection if in 'playlist' mode;
      // otherwise, treat a URL with a video ID as a single video by default.
      if (preferredMode === 'playlist') {
        type = 'playlist';
      } else {
        type = 'single_video';
      }
    } else if (ytVideoId) {
      type = 'single_video';
    } else if (ytPlaylistId) {
      type = 'playlist';
    }

    return {
      type,
      platform: 'youtube',
      videoId: ytVideoId,
      playlistId: ytPlaylistId,
      hasBoth,
      isDedicatedPlaylist,
      cleanVideoUrl: ytVideoId ? `https://www.youtube.com/watch?v=${ytVideoId}` : null,
      cleanPlaylistUrl: ytPlaylistId ? `https://www.youtube.com/playlist?list=${ytPlaylistId}` : null,
      platformName: 'YouTube',
    };
  }

  // 2. Instagram
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
    const isPost = /(?:\/reel\/|\/p\/|\/tv\/|\/stories\/)([A-Za-z0-9_-]+)/i.test(trimmed);
    return {
      type: isPost || lower.includes('/reels/') ? 'single_video' : 'single_video',
      platform: 'instagram',
      videoId: null,
      playlistId: null,
      hasBoth: false,
      isDedicatedPlaylist: false,
      cleanVideoUrl: trimmed.split('?')[0],
      cleanPlaylistUrl: null,
      platformName: 'Instagram',
    };
  }

  // 3. TikTok
  if (
    lower.includes('tiktok.com') ||
    lower.includes('vm.tiktok.com') ||
    lower.includes('vt.tiktok.com')
  ) {
    return {
      type: 'single_video',
      platform: 'tiktok',
      videoId: null,
      playlistId: null,
      hasBoth: false,
      isDedicatedPlaylist: false,
      cleanVideoUrl: trimmed.split('?')[0],
      cleanPlaylistUrl: null,
      platformName: 'TikTok',
    };
  }

  // 4. Vimeo
  if (lower.includes('vimeo.com')) {
    const showcaseMatch = trimmed.match(/vimeo\.com\/(?:showcase|album)\/(\d+)/i);
    const videoMatch = trimmed.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/i);
    const isShowcase = Boolean(showcaseMatch);

    if (isShowcase && preferredMode === 'playlist') {
      return {
        type: 'playlist',
        platform: 'vimeo',
        videoId: null,
        playlistId: showcaseMatch![1],
        hasBoth: false,
        isDedicatedPlaylist: true,
        cleanVideoUrl: null,
        cleanPlaylistUrl: `https://vimeo.com/showcase/${showcaseMatch![1]}`,
        platformName: 'Vimeo',
      };
    }

    return {
      type: videoMatch ? 'single_video' : 'single_video',
      platform: 'vimeo',
      videoId: videoMatch ? videoMatch[1] : null,
      playlistId: showcaseMatch ? showcaseMatch[1] : null,
      hasBoth: false,
      isDedicatedPlaylist: isShowcase,
      cleanVideoUrl: videoMatch ? `https://vimeo.com/${videoMatch[1]}` : trimmed,
      cleanPlaylistUrl: showcaseMatch ? `https://vimeo.com/showcase/${showcaseMatch[1]}` : null,
      platformName: 'Vimeo',
    };
  }

  // 5. Reddit
  if (lower.includes('reddit.com') || lower.includes('v.redd.it') || lower.includes('redd.it')) {
    return {
      type: 'single_video',
      platform: 'reddit',
      videoId: null,
      playlistId: null,
      hasBoth: false,
      isDedicatedPlaylist: false,
      cleanVideoUrl: trimmed.split('?')[0],
      cleanPlaylistUrl: null,
      platformName: 'Reddit',
    };
  }

  // 6. Twitter / X
  if (lower.includes('twitter.com') || lower.includes('x.com')) {
    return {
      type: 'single_video',
      platform: 'twitter',
      videoId: null,
      playlistId: null,
      hasBoth: false,
      isDedicatedPlaylist: false,
      cleanVideoUrl: trimmed.split('?')[0],
      cleanPlaylistUrl: null,
      platformName: 'X (Twitter)',
    };
  }

  // 7. Facebook
  if (lower.includes('facebook.com') || lower.includes('fb.watch')) {
    return {
      type: 'single_video',
      platform: 'facebook',
      videoId: null,
      playlistId: null,
      hasBoth: false,
      isDedicatedPlaylist: false,
      cleanVideoUrl: trimmed.split('?')[0],
      cleanPlaylistUrl: null,
      platformName: 'Facebook',
    };
  }

  // 8. Dailymotion
  if (lower.includes('dailymotion.com') || lower.includes('dai.ly')) {
    const isPlaylist = /dailymotion\.com\/playlist\/([a-zA-Z0-9]+)/i.test(trimmed);
    const videoMatch = trimmed.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/i);

    if (isPlaylist) {
      const plId = trimmed.match(/playlist\/([a-zA-Z0-9]+)/i)?.[1] || null;
      return {
        type: 'playlist',
        platform: 'dailymotion',
        videoId: null,
        playlistId: plId,
        hasBoth: false,
        isDedicatedPlaylist: true,
        cleanVideoUrl: null,
        cleanPlaylistUrl: plId ? `https://www.dailymotion.com/playlist/${plId}` : trimmed,
        platformName: 'Dailymotion',
      };
    }

    return {
      type: 'single_video',
      platform: 'dailymotion',
      videoId: videoMatch ? videoMatch[1] : null,
      playlistId: null,
      hasBoth: false,
      isDedicatedPlaylist: false,
      cleanVideoUrl: videoMatch ? `https://www.dailymotion.com/video/${videoMatch[1]}` : trimmed,
      cleanPlaylistUrl: null,
      platformName: 'Dailymotion',
    };
  }

  // 9. Pinterest
  if (lower.includes('pinterest.com') || lower.includes('pin.it')) {
    return {
      type: 'single_video',
      platform: 'pinterest',
      videoId: null,
      playlistId: null,
      hasBoth: false,
      isDedicatedPlaylist: false,
      cleanVideoUrl: trimmed.split('?')[0],
      cleanPlaylistUrl: null,
      platformName: 'Pinterest',
    };
  }

  // 10. Direct Media File
  const urlPathWithoutQuery = lower.split('?')[0].split('#')[0];
  if (
    urlPathWithoutQuery.endsWith('.mp4') ||
    urlPathWithoutQuery.endsWith('.webm') ||
    urlPathWithoutQuery.endsWith('.mov') ||
    urlPathWithoutQuery.endsWith('.m4v') ||
    urlPathWithoutQuery.endsWith('.mkv')
  ) {
    return {
      type: 'single_video',
      platform: 'direct',
      videoId: null,
      playlistId: null,
      hasBoth: false,
      isDedicatedPlaylist: false,
      cleanVideoUrl: trimmed,
      cleanPlaylistUrl: null,
      platformName: 'Direct Video',
    };
  }

  // Unknown URL
  return {
    type: 'unknown',
    platform: 'unknown',
    videoId: null,
    playlistId: null,
    hasBoth: false,
    isDedicatedPlaylist: false,
    cleanVideoUrl: null,
    cleanPlaylistUrl: null,
    platformName: 'Unknown',
  };
}
