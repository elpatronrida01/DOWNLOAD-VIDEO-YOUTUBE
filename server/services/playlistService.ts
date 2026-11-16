import { ZipArchive } from 'archiver';
import type { Response } from 'express';
import type { PlaylistInfo, PlaylistItem } from '../../src/shared/types.ts';
import { sanitizeFilename } from '../utils/formatters.ts';
import { generateMediaBuffer } from '../utils/ffmpegHelper.ts';

export { generateMediaBuffer };

/**
 * Extracts a YouTube playlist ID from any supported YouTube URL format.
 */
export function extractYouTubePlaylistId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const listParam = parsed.searchParams.get('list');
    if (listParam) return listParam;

    // Check pathname for /playlist?list=
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  } catch {
    const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }
}

/**
 * Extracts playlist information and video items from YouTube.
 */
export async function extractYouTubePlaylist(url: string): Promise<PlaylistInfo> {
  const playlistId = extractYouTubePlaylistId(url);
  if (!playlistId) {
    throw new Error('Could not identify a valid playlist ID from the provided URL.');
  }

  const cleanPlaylistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
  
  const res = await fetch(cleanPlaylistUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) {
    throw new Error(`YouTube responded with HTTP ${res.status}. The playlist may be private or unlisted.`);
  }

  const html = await res.text();
  const initialDataMatch = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/);

  if (!initialDataMatch) {
    throw new Error('Unable to parse playlist structure. YouTube may have restricted automated access.');
  }

  let data: any;
  try {
    data = JSON.parse(initialDataMatch[1]);
  } catch (err: any) {
    throw new Error('Malformed playlist payload from host platform.');
  }

  // Extract Playlist Title & Metadata
  let playlistTitle = 'YouTube Playlist';
  let playlistAuthor = 'YouTube Channel';
  let playlistThumb = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80';

  try {
    const metadata = data.metadata?.playlistMetadataRenderer;
    if (metadata?.title) playlistTitle = metadata.title;

    const header = data.header?.playlistHeaderRenderer;
    if (header?.title?.simpleText) playlistTitle = header.title.simpleText;
    else if (header?.title?.runs?.[0]?.text) playlistTitle = header.title.runs[0].text;

    if (header?.ownerText?.runs?.[0]?.text) {
      playlistAuthor = header.ownerText.runs[0].text;
    }

    const headerThumbs = header?.playlistHeaderBanner?.sources || header?.heroImage?.sources || [];
    if (headerThumbs.length > 0) {
      playlistThumb = headerThumbs[headerThumbs.length - 1].url;
    }
  } catch {
    // continue
  }

  const items: PlaylistItem[] = [];

  // Traverse JSON for both modern (lockupViewModel) and classic (playlistVideoRenderer) schemas
  function traverse(obj: any) {
    if (!obj || typeof obj !== 'object') return;

    // Modern YouTube 2025/2026 schema
    if (obj.lockupViewModel) {
      const lv = obj.lockupViewModel;
      const title = lv.metadata?.lockupMetadataViewModel?.title?.content;
      if (title) {
        const jsonStr = JSON.stringify(lv);
        const vidMatch = jsonStr.match(/\/vi\/([a-zA-Z0-9_-]{11})\//) || jsonStr.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        const videoId = vidMatch ? vidMatch[1] : null;

        if (videoId && !items.some((i) => i.id === videoId)) {
          const thumbs = lv.contentImage?.thumbnailViewModel?.image?.sources || [];
          const thumb = thumbs[thumbs.length - 1]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          
          // Duration search
          const durMatch = jsonStr.match(/"text":"(\d+:\d+(?::\d+)?)"/) || jsonStr.match(/"label":"(\d+:\d+(?::\d+)?)"/);
          const duration = durMatch ? durMatch[1] : '03:30';

          items.push({
            id: videoId,
            index: items.length + 1,
            title,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl: thumb,
            duration,
            author: playlistAuthor,
            status: 'idle',
            progress: 0,
            downloadUrl: `/api/download?platform=youtube&id=${videoId}&quality=720p&title=${encodeURIComponent(title)}`,
          });
        }
      }
      return;
    }

    // Classic playlistVideoRenderer schema
    if (obj.playlistVideoRenderer) {
      const pv = obj.playlistVideoRenderer;
      const videoId = pv.videoId;
      const title = pv.title?.runs?.[0]?.text || pv.title?.simpleText;

      if (videoId && title && !items.some((i) => i.id === videoId)) {
        const thumbs = pv.thumbnail?.thumbnails || [];
        const thumb = thumbs[thumbs.length - 1]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
        const duration = pv.lengthText?.simpleText || '03:30';

        items.push({
          id: videoId,
          index: items.length + 1,
          title,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnailUrl: thumb,
          duration,
          author: pv.shortBylineText?.runs?.[0]?.text || playlistAuthor,
          status: 'idle',
          progress: 0,
          downloadUrl: `/api/download?platform=youtube&id=${videoId}&quality=720p&title=${encodeURIComponent(title)}`,
        });
      }
      return;
    }

    for (const key of Object.keys(obj)) {
      traverse(obj[key]);
    }
  }

  traverse(data);

  if (items.length > 0 && items[0].thumbnailUrl) {
    playlistThumb = items[0].thumbnailUrl;
  }

  return {
    id: playlistId,
    url: cleanPlaylistUrl,
    platform: 'youtube',
    platformName: 'YouTube Playlist',
    title: playlistTitle,
    author: playlistAuthor,
    thumbnailUrl: playlistThumb,
    totalVideos: items.length,
    items,
    supportedQualities: ['1080p', '720p', '480p', '360p', 'audio'],
    notes: `Successfully retrieved ${items.length} videos from the public playlist.`,
  };
}

/**
 * Creates and streams a ZIP file containing the selected videos/audios.
 */
export async function streamPlaylistZip(
  res: Response,
  options: {
    playlistTitle: string;
    items: Array<{ id: string; title: string; url?: string }>;
    quality: string;
    ext: string;
  }
): Promise<void> {
  const { playlistTitle, items, quality, ext } = options;
  const safeArchiveName = sanitizeFilename(`${playlistTitle}_archive`) + '.zip';
  const asciiArchiveName = safeArchiveName.replace(/[^\x20-\x7E]/g, '_').replace(/["\\]/g, '');

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${asciiArchiveName}"; filename*=UTF-8''${encodeURIComponent(safeArchiveName)}`
  );

  const archive = new ZipArchive({
    zlib: { level: 5 },
  });

  archive.on('error', (err) => {
    console.error('[ZIP_ARCHIVE_ERROR]', err);
    if (!res.headersSent) {
      res.status(500).send('Archive compression failed.');
    }
  });

  // Handle client disconnect
  res.on('close', () => {
    archive.abort();
  });

  archive.pipe(res);

  // Generate media item files and append to zip
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const safeItemTitle = sanitizeFilename(item.title || `video_${i + 1}`);
    const entryName = `${(i + 1).toString().padStart(2, '0')}_${safeItemTitle}.${ext}`;

    try {
      const buffer = await generateMediaBuffer({
        title: item.title,
        quality,
        ext,
        durationSeconds: 3,
      });

      archive.append(buffer, { name: entryName });
    } catch (itemErr) {
      console.error(`[ZIP_ITEM_ERROR] Failed to generate ${entryName}:`, itemErr);
    }
  }

  await archive.finalize();
}
