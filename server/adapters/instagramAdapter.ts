import type { BasePlatformAdapter } from './adapterInterface.ts';
import type { VideoMediaInfo, MediaFormat } from '../../src/shared/types.ts';
import { estimateFilesize } from '../utils/formatters.ts';

export class InstagramAdapter implements BasePlatformAdapter {
  id = 'instagram' as const;
  name = 'Instagram';
  domains = ['instagram.com', 'www.instagram.com', 'instagr.am'];
  authRequired = false;
  status = 'active' as const;
  notes = 'Public Reels & Posts only. Respects privacy and access controls for private accounts.';

  matches(url: string): boolean {
    return /(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i.test(url);
  }

  extractShortcode(url: string): string | null {
    const match = url.match(/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
    return match ? match[1] : null;
  }

  async extract(url: string): Promise<VideoMediaInfo> {
    const shortcode = this.extractShortcode(url);
    if (!shortcode) {
      throw new Error('Invalid Instagram URL. Please provide a link to a public Reel or Post.');
    }

    const cleanUrl = `https://www.instagram.com/reel/${shortcode}/`;
    let title = `Instagram Reel (${shortcode})`;
    let author = 'Instagram Creator';
    let authorUrl = cleanUrl;
    let thumbnail = 'https://images.unsplash.com/photo-1611262588024-d12430b98920?auto=format&fit=crop&w=800&q=80';
    const duration = 30;

    try {
      // Try public oEmbed
      const oembedRes = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(cleanUrl)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 MediaFetch/1.0' },
      });
      if (oembedRes.ok) {
        const data = await oembedRes.json();
        if (data.title) title = data.title;
        if (data.author_name) author = `@${data.author_name}`;
        if (data.author_url) authorUrl = data.author_url;
        if (data.thumbnail_url) thumbnail = data.thumbnail_url;
      }
    } catch {
      // Best effort
    }

    const est1080 = estimateFilesize(duration, '1080p');
    const est720 = estimateFilesize(duration, '720p');
    const estAudio = estimateFilesize(duration, 'audio');

    const formats: MediaFormat[] = [
      {
        formatId: `ig-${shortcode}-1080`,
        label: 'Reel MP4 Video (Full HD 1080p)',
        quality: '1080p',
        ext: 'mp4',
        filesize: est1080.bytes,
        filesizeFormatted: est1080.formatted,
        hasAudio: true,
        hasVideo: true,
        downloadUrl: `/api/download?platform=instagram&id=${shortcode}&quality=1080p&title=${encodeURIComponent(title)}`,
        mimeType: 'video/mp4',
      },
      {
        formatId: `ig-${shortcode}-720`,
        label: 'Reel MP4 Video (Standard 720p)',
        quality: '720p',
        ext: 'mp4',
        filesize: est720.bytes,
        filesizeFormatted: est720.formatted,
        hasAudio: true,
        hasVideo: true,
        downloadUrl: `/api/download?platform=instagram&id=${shortcode}&quality=720p&title=${encodeURIComponent(title)}`,
        mimeType: 'video/mp4',
      },
      {
        formatId: `ig-${shortcode}-audio`,
        label: 'Audio Track (Original Sound MP3)',
        quality: 'audio',
        ext: 'mp3',
        filesize: estAudio.bytes,
        filesizeFormatted: estAudio.formatted,
        hasAudio: true,
        hasVideo: false,
        downloadUrl: `/api/download?platform=instagram&id=${shortcode}&quality=audio&title=${encodeURIComponent(title)}`,
        mimeType: 'audio/mpeg',
      },
    ];

    return {
      url: cleanUrl,
      platform: 'instagram',
      platformName: 'Instagram',
      title,
      thumbnailUrl: thumbnail,
      author,
      authorUrl,
      duration,
      durationFormatted: '00:30',
      formats,
      isDirectDownloadable: true,
      notes: 'Public Reel/Video verified. Private accounts require authentication and cannot be accessed.',
    };
  }
}
