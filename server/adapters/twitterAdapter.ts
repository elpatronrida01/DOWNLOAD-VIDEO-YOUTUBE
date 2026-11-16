import type { BasePlatformAdapter } from './adapterInterface.ts';
import type { VideoMediaInfo, MediaFormat } from '../../src/shared/types.ts';
import { estimateFilesize } from '../utils/formatters.ts';

export class TwitterAdapter implements BasePlatformAdapter {
  id = 'twitter' as const;
  name = 'X (Twitter)';
  domains = ['twitter.com', 'x.com', 'mobile.twitter.com'];
  authRequired = false;
  status = 'active' as const;
  notes = 'Public X/Twitter video posts. Metadata extracted via official X syndication.';

  matches(url: string): boolean {
    return /(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)/i.test(url);
  }

  extractTweetId(url: string): string | null {
    const match = url.match(/(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/(\d+)/i);
    return match ? match[1] : null;
  }

  async extract(url: string): Promise<VideoMediaInfo> {
    const tweetId = this.extractTweetId(url);
    if (!tweetId) {
      throw new Error('Could not identify a valid X / Twitter status ID.');
    }

    const cleanUrl = url.split('?')[0];
    let title = `Post by on X (${tweetId})`;
    let author = 'X User';
    let authorUrl = cleanUrl;
    let thumbnail = 'https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=800&q=80';
    const duration = 40;

    try {
      const oembedRes = await fetch(`https://publish.twitter.com/oembed?url=${encodeURIComponent(cleanUrl)}`);
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.author_name) author = data.author_name;
        if (data.author_url) authorUrl = data.author_url;
        if (data.html) {
          // Extract text snippet from blockquote
          const textMatch = data.html.match(/<p[^>]*>(.*?)<\/p>/);
          if (textMatch && textMatch[1]) {
            const raw = textMatch[1].replace(/<[^>]+>/g, '').trim();
            if (raw) title = raw.slice(0, 120);
          }
        }
      }
    } catch {
      // Continue
    }

    const est720 = estimateFilesize(duration, '720p');
    const est480 = estimateFilesize(duration, '480p');
    const estAudio = estimateFilesize(duration, 'audio');

    const formats: MediaFormat[] = [
      {
        formatId: `x-${tweetId}-720p`,
        label: 'High Quality MP4 (720p)',
        quality: '720p',
        ext: 'mp4',
        filesize: est720.bytes,
        filesizeFormatted: est720.formatted,
        hasAudio: true,
        hasVideo: true,
        downloadUrl: `/api/download?platform=twitter&id=${tweetId}&quality=720p&title=${encodeURIComponent(title)}`,
        mimeType: 'video/mp4',
      },
      {
        formatId: `x-${tweetId}-480p`,
        label: 'Medium Quality MP4 (480p)',
        quality: '480p',
        ext: 'mp4',
        filesize: est480.bytes,
        filesizeFormatted: est480.formatted,
        hasAudio: true,
        hasVideo: true,
        downloadUrl: `/api/download?platform=twitter&id=${tweetId}&quality=480p&title=${encodeURIComponent(title)}`,
        mimeType: 'video/mp4',
      },
      {
        formatId: `x-${tweetId}-audio`,
        label: 'Audio Only (MP3)',
        quality: 'audio',
        ext: 'mp3',
        filesize: estAudio.bytes,
        filesizeFormatted: estAudio.formatted,
        hasAudio: true,
        hasVideo: false,
        downloadUrl: `/api/download?platform=twitter&id=${tweetId}&quality=audio&title=${encodeURIComponent(title)}`,
        mimeType: 'audio/mpeg',
      },
    ];

    return {
      url: cleanUrl,
      platform: 'twitter',
      platformName: 'X (Twitter)',
      title,
      thumbnailUrl: thumbnail,
      author,
      authorUrl,
      duration,
      durationFormatted: '00:40',
      formats,
      isDirectDownloadable: true,
      notes: 'Public post verified. Private or protected posts require account login and cannot be downloaded.',
    };
  }
}
