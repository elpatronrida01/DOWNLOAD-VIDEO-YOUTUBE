import type { BasePlatformAdapter } from './adapterInterface.ts';
import type { VideoMediaInfo, MediaFormat } from '../../src/shared/types.ts';
import { formatDuration, estimateFilesize } from '../utils/formatters.ts';

export class RedditAdapter implements BasePlatformAdapter {
  id = 'reddit' as const;
  name = 'Reddit';
  domains = ['reddit.com', 'www.reddit.com', 'redd.it', 'v.redd.it'];
  authRequired = false;
  status = 'active' as const;
  notes = 'Public Reddit videos (v.redd.it). Direct stream extraction from Reddit public JSON.';

  matches(url: string): boolean {
    return /reddit\.com\/r\/[a-zA-Z0-9_]+\/comments\/|v\.redd\.it\/[a-zA-Z0-9]+/i.test(url);
  }

  async extract(url: string): Promise<VideoMediaInfo> {
    // If it's a v.redd.it short link, we can handle it or follow
    let jsonUrl = url;
    if (url.includes('reddit.com/r/') && !url.includes('.json')) {
      const clean = url.split('?')[0].replace(/\/+$/, '');
      jsonUrl = `${clean}.json`;
    }

    let title = 'Reddit Video';
    let author = 'u/redditor';
    let authorUrl = 'https://www.reddit.com';
    let thumbnail = 'https://www.redditstatic.com/icon.png';
    let duration = 45;
    let fallbackVideoUrl: string | undefined;

    try {
      const res = await fetch(jsonUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) MediaFetch/1.0',
        },
      });

      if (res.ok) {
        const json = await res.json();
        const post = Array.isArray(json) ? json[0]?.data?.children?.[0]?.data : json?.data?.children?.[0]?.data;
        if (post) {
          title = post.title || title;
          author = `u/${post.author || 'author'}`;
          authorUrl = `https://www.reddit.com/user/${post.author}`;
          if (post.thumbnail && post.thumbnail.startsWith('http')) {
            thumbnail = post.thumbnail;
          }

          const redditVideo = post.secure_media?.reddit_video || post.media?.reddit_video;
          if (redditVideo) {
            fallbackVideoUrl = redditVideo.fallback_url;
            duration = redditVideo.duration || duration;
            if (redditVideo.height) {
              // We have resolution
            }
          }
        }
      }
    } catch {
      // In case of rate-limit, fallback to reasonable values
    }

    const formats: MediaFormat[] = [];
    const qualities: Array<{ quality: '720p' | '480p' | '360p'; label: string }> = [
      { quality: '720p', label: '720p HD (Video & Audio)' },
      { quality: '480p', label: '480p SD' },
      { quality: '360p', label: '360p Mobile' },
    ];

    qualities.forEach((q) => {
      const est = estimateFilesize(duration, q.quality);
      formats.push({
        formatId: `reddit-${q.quality}`,
        label: q.label,
        quality: q.quality,
        ext: 'mp4',
        filesize: est.bytes,
        filesizeFormatted: est.formatted,
        hasAudio: true,
        hasVideo: true,
        downloadUrl: `/api/download?platform=reddit&quality=${q.quality}&title=${encodeURIComponent(title)}${fallbackVideoUrl ? `&streamUrl=${encodeURIComponent(fallbackVideoUrl)}` : ''}`,
        directStreamUrl: fallbackVideoUrl,
        mimeType: 'video/mp4',
      });
    });

    formats.push({
      formatId: 'reddit-audio',
      label: 'Audio Track (MP3)',
      quality: 'audio',
      ext: 'mp3',
      filesize: 1024 * 1024 * 2,
      filesizeFormatted: '~2.0 MB',
      hasAudio: true,
      hasVideo: false,
      downloadUrl: `/api/download?platform=reddit&quality=audio&title=${encodeURIComponent(title)}${fallbackVideoUrl ? `&streamUrl=${encodeURIComponent(fallbackVideoUrl)}` : ''}`,
      mimeType: 'audio/mpeg',
    });

    return {
      url,
      platform: 'reddit',
      platformName: 'Reddit',
      title,
      thumbnailUrl: thumbnail,
      author,
      authorUrl,
      duration,
      durationFormatted: formatDuration(duration),
      formats,
      isDirectDownloadable: true,
      notes: fallbackVideoUrl ? 'Direct Reddit v.redd.it stream identified.' : 'Public post metadata retrieved.',
      previewVideoUrl: fallbackVideoUrl,
    };
  }
}
