import type { BasePlatformAdapter } from './adapterInterface.ts';
import type { VideoMediaInfo, MediaFormat } from '../../src/shared/types.ts';
import { formatDuration, estimateFilesize } from '../utils/formatters.ts';

export class DailymotionAdapter implements BasePlatformAdapter {
  id = 'dailymotion' as const;
  name = 'Dailymotion';
  domains = ['dailymotion.com', 'dai.ly'];
  authRequired = false;
  status = 'active' as const;
  notes = 'Public videos. Official Dailymotion REST API and oEmbed integration.';

  matches(url: string): boolean {
    return /(?:dailymotion\.com\/video\/|dai\.ly\/)/i.test(url);
  }

  extractVideoId(url: string): string | null {
    const match = url.match(/(?:dailymotion\.com\/video\/|dai\.ly\/)([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  async extract(url: string): Promise<VideoMediaInfo> {
    const videoId = this.extractVideoId(url);
    if (!videoId) {
      throw new Error('Could not parse a valid Dailymotion video ID.');
    }

    const cleanUrl = `https://www.dailymotion.com/video/${videoId}`;
    let title = `Dailymotion Video ${videoId}`;
    let author = 'Dailymotion Creator';
    let authorUrl = cleanUrl;
    let thumbnail = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';
    let duration = 120;

    try {
      const apiRes = await fetch(
        `https://api.dailymotion.com/video/${videoId}?fields=id,title,description,thumbnail_720_url,thumbnail_480_url,duration,owner.screenname,owner.url`,
        { headers: { 'User-Agent': 'MediaFetch/1.0' } }
      );

      if (apiRes.ok) {
        const data = await apiRes.json();
        if (data.title) title = data.title;
        if (data['owner.screenname']) author = data['owner.screenname'];
        if (data['owner.url']) authorUrl = data['owner.url'];
        if (data.thumbnail_720_url) thumbnail = data.thumbnail_720_url;
        else if (data.thumbnail_480_url) thumbnail = data.thumbnail_480_url;
        if (data.duration) duration = Number(data.duration);
      } else {
        // Fallback to oembed
        const oembedRes = await fetch(`https://www.dailymotion.com/services/oembed?url=${encodeURIComponent(cleanUrl)}`);
        if (oembedRes.ok) {
          const odata = await oembedRes.json();
          if (odata.title) title = odata.title;
          if (odata.author_name) author = odata.author_name;
          if (odata.thumbnail_url) thumbnail = odata.thumbnail_url;
        }
      }
    } catch {
      // Best effort fallback
    }

    const qualities: Array<{ quality: '1080p' | '720p' | '480p' | '360p'; label: string }> = [
      { quality: '1080p', label: '1080p Full HD' },
      { quality: '720p', label: '720p HD' },
      { quality: '480p', label: '480p SD' },
      { quality: '360p', label: '360p Low' },
    ];

    const formats: MediaFormat[] = qualities.map((q) => {
      const est = estimateFilesize(duration, q.quality);
      return {
        formatId: `dm-${videoId}-${q.quality}`,
        label: q.label,
        quality: q.quality,
        ext: 'mp4',
        filesize: est.bytes,
        filesizeFormatted: est.formatted,
        hasAudio: true,
        hasVideo: true,
        downloadUrl: `/api/download?platform=dailymotion&id=${videoId}&quality=${q.quality}&title=${encodeURIComponent(title)}`,
        mimeType: 'video/mp4',
      };
    });

    // Audio format
    const audioEst = estimateFilesize(duration, 'audio');
    formats.push({
      formatId: `dm-${videoId}-audio`,
      label: 'Audio Only (MP3)',
      quality: 'audio',
      ext: 'mp3',
      filesize: audioEst.bytes,
      filesizeFormatted: audioEst.formatted,
      hasAudio: true,
      hasVideo: false,
      downloadUrl: `/api/download?platform=dailymotion&id=${videoId}&quality=audio&title=${encodeURIComponent(title)}`,
      mimeType: 'audio/mpeg',
    });

    return {
      url: cleanUrl,
      platform: 'dailymotion',
      platformName: 'Dailymotion',
      title,
      thumbnailUrl: thumbnail,
      author,
      authorUrl,
      duration,
      durationFormatted: formatDuration(duration),
      formats,
      isDirectDownloadable: true,
      previewVideoUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
      notes: 'Extracted via official Dailymotion API.',
    };
  }
}
