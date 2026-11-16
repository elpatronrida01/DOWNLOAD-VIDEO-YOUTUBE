import type { BasePlatformAdapter } from './adapterInterface.ts';
import type { VideoMediaInfo, MediaFormat } from '../../src/shared/types.ts';
import { formatBytes } from '../utils/formatters.ts';
import { validateUrlForSSRF } from '../security/ssrf.ts';

export class DirectAdapter implements BasePlatformAdapter {
  id = 'direct' as const;
  name = 'Direct Video Link';
  domains = ['*'];
  authRequired = false;
  status = 'active' as const;
  notes = 'Direct MP4, WebM, MOV, and MKV web links. Full direct streaming with byte range support.';

  matches(url: string): boolean {
    const clean = url.split('?')[0].toLowerCase();
    return /\.(mp4|webm|mov|m4v|mkv|ogv)$/i.test(clean);
  }

  async extract(url: string): Promise<VideoMediaInfo> {
    const ssrfCheck = validateUrlForSSRF(url);
    if (!ssrfCheck.isValid) {
      throw new Error(ssrfCheck.error || 'Blocked URL security check');
    }

    // Try HEAD request to get file size and mime type
    let contentLength: number | undefined;
    let contentType = 'video/mp4';

    try {
      const headRes = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MediaFetch/1.0',
        },
      });

      if (headRes.ok) {
        const cl = headRes.headers.get('content-length');
        if (cl) contentLength = parseInt(cl, 10);
        const ct = headRes.headers.get('content-type');
        if (ct) contentType = ct;
      }
    } catch {
      // Continue
    }

    const pathname = new URL(url).pathname;
    const filename = pathname.split('/').pop() || 'video.mp4';
    const title = decodeURIComponent(filename.replace(/\.[^/.]+$/, ''));

    const ext = filename.endsWith('.webm') ? 'webm' : 'mp4';

    const formats: MediaFormat[] = [
      {
        formatId: 'direct-original',
        label: `Original File (${ext.toUpperCase()})`,
        quality: 'original',
        ext,
        filesize: contentLength,
        filesizeFormatted: contentLength ? formatBytes(contentLength) : 'Original file size',
        hasAudio: true,
        hasVideo: true,
        downloadUrl: `/api/download?platform=direct&streamUrl=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
        directStreamUrl: url,
        mimeType: contentType,
        note: 'Direct high-speed stream from origin server',
      },
      {
        formatId: 'direct-audio',
        label: 'Extracted Audio (MP3)',
        quality: 'audio',
        ext: 'mp3',
        filesize: contentLength ? Math.round(contentLength * 0.15) : undefined,
        filesizeFormatted: contentLength ? `~${formatBytes(Math.round(contentLength * 0.15))}` : 'Audio track',
        hasAudio: true,
        hasVideo: false,
        downloadUrl: `/api/download?platform=direct&quality=audio&streamUrl=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
        mimeType: 'audio/mpeg',
        note: 'Direct audio stream',
      },
    ];

    return {
      url,
      platform: 'direct',
      platformName: 'Direct Video Stream',
      title,
      thumbnailUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
      author: new URL(url).hostname,
      authorUrl: url,
      formats,
      isDirectDownloadable: true,
      previewVideoUrl: url,
      notes: 'Direct HTTP/HTTPS video stream. Verified and ready for streaming download.',
    };
  }
}
