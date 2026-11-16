import { GoogleGenAI } from '@google/genai';
import { findAdapterForUrl } from '../adapters/index.ts';
import type { 
  RelatedPlaylistData, 
  RelatedPlaylistItem, 
  GenerateRelatedPlaylistRequest,
  PlatformId,
  VideoMediaInfo 
} from '../../src/shared/types.ts';
import { formatDuration } from '../utils/formatters.ts';

// In-memory cache to respect rate limits and speed up subsequent identical requests
const playlistCache = new Map<string, { timestamp: number; data: RelatedPlaylistData }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Normalizes title for deduplication comparison
 */
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Clean title of common video fluff to reveal the true topic
 */
export function extractCleanTopicFromTitle(title: string): string {
  let cleaned = title
    .replace(/\b(official (video|music video|audio|lyric video|visualizer))\b/gi, '')
    .replace(/\b(4k|hd|1080p|720p|60fps|remastered|explicit)\b/gi, '')
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\([^)]*(video|audio|lyrics|version|prod|remaster)[^)]*\)/gi, '')
    .replace(/#\w+/g, '')
    .replace(/\|.*$/g, '')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return cleaned || title;
}

/**
 * Fallback rule-based NLP extraction when Gemini is unreachable or rate-limited
 */
function fallbackTopicAnalysis(title: string, author?: string) {
  const clean = extractCleanTopicFromTitle(title);
  const words = clean
    .split(/\s+/)
    .filter((w) => w.length > 2 && !['and', 'the', 'for', 'with', 'from', 'this', 'that', 'how'].includes(w.toLowerCase()));
  
  const keywords = Array.from(new Set(words)).slice(0, 8);
  if (author && !keywords.includes(author)) {
    keywords.unshift(author);
  }

  return {
    playlistTitle: `Related Videos: ${clean.slice(0, 50)}`,
    topic: clean,
    category: 'General Media',
    keywords: keywords.length > 0 ? keywords : ['Music', 'Entertainment', 'Tutorial', 'Video'],
    searchQueries: [
      clean,
      keywords.slice(0, 3).join(' '),
      author ? `${author} best videos` : `${clean} related`,
    ].filter(Boolean),
  };
}

/**
 * Uses Gemini 2.5 Flash to intelligently extract primary topic, categories, and high-relevance search queries
 */
async function analyzeTopicWithGemini(
  title: string, 
  author?: string, 
  description?: string, 
  platform?: string
): Promise<{
  playlistTitle: string;
  topic: string;
  category: string;
  keywords: string[];
  searchQueries: string[];
  curatedSuggestions?: Array<{
    title: string;
    author: string;
    youtubeId?: string;
    platform: PlatformId;
    duration?: string;
  }>;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackTopicAnalysis(title, author);
  }

  try {
    const ai = new GoogleGenAI({});
    const prompt = `You are an expert video recommendation and music/media curation engine for ClipVory.
Analyze this video:
- Title: "${title}"
- Creator/Channel: "${author || 'Unknown'}"
- Platform: "${platform || 'Video'}"
- Context/Description: "${(description || '').slice(0, 300)}"

Identify the core topic, matching category, and 4-8 specific keywords. Then generate:
1. A concise, engaging playlist title in the format "Related Videos: [Focused Subject]" (maximum 50 characters).
2. The primary topic or genre/niche.
3. The content category (e.g., "Music & Beats", "Gaming & Guides", "Tech & Gadgets", "Education & Science", "Film & Entertainment", "Creative & Art").
4. A list of 4-8 specific keywords.
5. 3 specific search queries to find genuine related videos across video platforms (prioritizing topic relevance over generic popularity).
6. 6-10 real, well-known relevant videos or tracks that exist on YouTube or public video platforms matching this topic (include real video IDs if known, or creator and title).

Return strictly a valid JSON object matching this schema without markdown fences:
{
  "playlistTitle": "string",
  "topic": "string",
  "category": "string",
  "keywords": ["string"],
  "searchQueries": ["string"],
  "curatedSuggestions": [
    {
      "title": "string",
      "author": "string",
      "youtubeId": "optional 11-char ID like dQw4w9WgXcQ or empty",
      "platform": "youtube",
      "duration": "03:45"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const text = response.text?.trim() || '';
    if (!text) {
      return fallbackTopicAnalysis(title, author);
    }

    const parsed = JSON.parse(text);
    return {
      playlistTitle: parsed.playlistTitle || `Related Videos: ${title.slice(0, 45)}`,
      topic: parsed.topic || extractCleanTopicFromTitle(title),
      category: parsed.category || 'Curated Media',
      keywords: Array.isArray(parsed.keywords) && parsed.keywords.length > 0 ? parsed.keywords : ['Featured', 'Trending'],
      searchQueries: Array.isArray(parsed.searchQueries) && parsed.searchQueries.length > 0 ? parsed.searchQueries : [title],
      curatedSuggestions: Array.isArray(parsed.curatedSuggestions) ? parsed.curatedSuggestions : [],
    };
  } catch (err: any) {
    console.warn('[GEMINI_TOPIC_ANALYSIS_FALLBACK]', err?.message);
    return fallbackTopicAnalysis(title, author);
  }
}

/**
 * Searches Dailymotion's official public API for related videos (No API key needed!)
 */
async function searchDailymotion(query: string, limit = 10): Promise<RelatedPlaylistItem[]> {
  try {
    const url = `https://api.dailymotion.com/videos?search=${encodeURIComponent(query)}&limit=${limit}&fields=id,title,duration,thumbnail_720_url,owner.screenname,url`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ClipVory/2.5',
      },
      signal: AbortSignal.timeout(6000),
    });

    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data?.list)) return [];

    return data.list.map((item: any) => {
      const durSec = item.duration || 180;
      return {
        id: `dm-${item.id}`,
        title: item.title || 'Dailymotion Video',
        url: item.url || `https://www.dailymotion.com/video/${item.id}`,
        thumbnailUrl: item.thumbnail_720_url || `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80`,
        platform: 'dailymotion' as PlatformId,
        platformName: 'Dailymotion',
        duration: formatDuration(durSec),
        durationSeconds: durSec,
        author: item['owner.screenname'] || 'Dailymotion Creator',
        isDownloadable: true,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Searches YouTube public search feed / ytInitialData
 */
async function searchYouTubePublic(query: string, limit = 15): Promise<RelatedPlaylistItem[]> {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const res = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(7000),
    });

    if (!res.ok) return [];
    const html = await res.text();
    const dataMatch = html.match(/var ytInitialData\s*=\s*({.+?});<\/script>/);
    if (!dataMatch) return [];

    const data = JSON.parse(dataMatch[1]);
    const items: RelatedPlaylistItem[] = [];

    function findVideos(obj: any) {
      if (!obj || typeof obj !== 'object' || items.length >= limit) return;

      if (obj.videoRenderer) {
        const vr = obj.videoRenderer;
        const videoId = vr.videoId;
        const title = vr.title?.runs?.[0]?.text || vr.title?.simpleText;
        if (videoId && title && !items.some((i) => i.id === videoId)) {
          const duration = vr.lengthText?.simpleText || '03:30';
          const author = vr.ownerText?.runs?.[0]?.text || 'YouTube Creator';
          const views = vr.viewCountText?.simpleText || undefined;
          const thumb = vr.thumbnail?.thumbnails?.[vr.thumbnail.thumbnails.length - 1]?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          items.push({
            id: videoId,
            title,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            thumbnailUrl: thumb,
            platform: 'youtube' as PlatformId,
            platformName: 'YouTube',
            duration,
            author,
            views,
            isDownloadable: true,
          });
        }
      }

      for (const key of Object.keys(obj)) {
        findVideos(obj[key]);
      }
    }

    findVideos(data);
    return items;
  } catch {
    return [];
  }
}

/**
 * Searches YouTube Data API v3 if key is present
 */
async function searchYouTubeApi(query: string, apiKey: string, limit = 15): Promise<RelatedPlaylistItem[]> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${limit}&q=${encodeURIComponent(query)}&key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return [];

    const json = await res.json();
    if (!Array.isArray(json.items)) return [];

    return json.items.map((item: any) => {
      const vidId = item.id?.videoId;
      const snippet = item.snippet || {};
      return {
        id: vidId,
        title: snippet.title || 'YouTube Video',
        url: `https://www.youtube.com/watch?v=${vidId}`,
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`,
        platform: 'youtube' as PlatformId,
        platformName: 'YouTube',
        duration: '03:45',
        author: snippet.channelTitle || 'YouTube Creator',
        publishedAt: snippet.publishedAt,
        isDownloadable: true,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Main Generator Function:
 * Dissects original video or topic, matches related videos, filters duplicates,
 * and builds a rich Related Videos Playlist.
 */
export async function generateRelatedPlaylist(req: GenerateRelatedPlaylistRequest): Promise<RelatedPlaylistData> {
  const { url, topic: manualTopic, keywords: manualKeywords, originalVideoInfo, page = 1, limit = 20, excludeIds = [] } = req;

  // 1. Resolve original video details
  let origVideo: RelatedPlaylistData['originalVideo'];
  let videoTitle = manualTopic || 'Featured Topic';
  let videoAuthor = '';
  let videoDescription = '';
  let videoPlatform: PlatformId = 'youtube';
  let originalVideoId = '';

  if (url) {
    // If info already extracted on client, use it
    if (originalVideoInfo && originalVideoInfo.title) {
      videoTitle = originalVideoInfo.title;
      videoAuthor = originalVideoInfo.author || '';
      videoDescription = originalVideoInfo.description || '';
      videoPlatform = originalVideoInfo.platform || 'youtube';
      origVideo = {
        id: (originalVideoInfo as any).id || (originalVideoInfo as any).playlistId,
        title: originalVideoInfo.title,
        url: originalVideoInfo.url || url,
        thumbnailUrl: originalVideoInfo.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        platform: videoPlatform,
        platformName: originalVideoInfo.platformName || 'Video',
        author: videoAuthor,
        duration: originalVideoInfo.durationFormatted,
      };
    } else {
      // Extract fresh
      const adapter = findAdapterForUrl(url);
      if (!adapter) {
        throw new Error('Unsupported video platform URL. Please provide a supported link or enter a topic.');
      }
      const media = await adapter.extract(url);
      videoTitle = media.title;
      videoAuthor = media.author || '';
      videoDescription = media.description || '';
      videoPlatform = media.platform;
      origVideo = {
        id: (media as any).id || (media as any).playlistId,
        title: media.title,
        url: media.url,
        thumbnailUrl: media.thumbnailUrl,
        platform: media.platform,
        platformName: media.platformName,
        author: media.author,
        duration: media.durationFormatted,
      };
    }

    // Try extracting clean YouTube video ID if applicable
    const ytMatch = url.match(/(?:v=|shorts\/|embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) originalVideoId = ytMatch[1];
  } else if (manualTopic) {
    origVideo = {
      title: manualTopic,
      url: '#',
      thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      platform: req.platform || 'youtube',
      platformName: req.platform ? req.platform.toUpperCase() : 'Custom Topic',
      author: 'Topic Search',
    };
  } else {
    throw new Error('Please provide a video URL or a topic to generate a related playlist.');
  }

  // Check cache for this exact video URL / title
  const cacheKey = `${url || manualTopic}_p${page}`;
  const cached = playlistCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Intelligent Topic & Keyword Analysis
  const analysis = await analyzeTopicWithGemini(videoTitle, videoAuthor, videoDescription, videoPlatform);

  const keywords = Array.from(new Set([...analysis.keywords, ...(manualKeywords || [])]));
  const searchQueries = analysis.searchQueries;

  // 3. Search and Aggregate Related Videos
  const rawResults: RelatedPlaylistItem[] = [];
  const ytApiKey = process.env.YOUTUBE_API_KEY;

  // Run searches across multiple queries & engines in parallel
  const searchPromises: Promise<RelatedPlaylistItem[]>[] = [];

  for (const q of searchQueries.slice(0, 3)) {
    if (ytApiKey) {
      searchPromises.push(searchYouTubeApi(q, ytApiKey, 12));
    } else {
      searchPromises.push(searchYouTubePublic(q, 10));
    }
    // Also include Dailymotion for platform variety
    searchPromises.push(searchDailymotion(q, 8));
  }

  const resultsLists = await Promise.allSettled(searchPromises);
  for (const res of resultsLists) {
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      rawResults.push(...res.value);
    }
  }

  // Also integrate curated suggestions from Gemini if search yield was low or for higher relevance
  if (analysis.curatedSuggestions && analysis.curatedSuggestions.length > 0) {
    for (const sugg of analysis.curatedSuggestions) {
      const vidId = sugg.youtubeId && sugg.youtubeId.length === 11 ? sugg.youtubeId : `yt-rel-${Math.random().toString(36).substring(2, 9)}`;
      rawResults.push({
        id: vidId,
        title: sugg.title,
        url: sugg.youtubeId && sugg.youtubeId.length === 11 ? `https://www.youtube.com/watch?v=${sugg.youtubeId}` : `https://www.youtube.com/results?search_query=${encodeURIComponent(sugg.title)}`,
        thumbnailUrl: sugg.youtubeId && sugg.youtubeId.length === 11 ? `https://i.ytimg.com/vi/${sugg.youtubeId}/hqdefault.jpg` : `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80`,
        platform: sugg.platform || 'youtube',
        platformName: 'YouTube',
        duration: sugg.duration || '03:40',
        author: sugg.author || 'Recommended Artist',
        isDownloadable: true,
      });
    }
  }

  // 4. Duplicate Filtering & Relevance Sorting
  const originalNormTitle = normalizeTitle(videoTitle);
  const seenIds = new Set<string>([originalVideoId, ...excludeIds].filter(Boolean));
  const seenTitles = new Set<string>([originalNormTitle]);

  const uniqueItems: RelatedPlaylistItem[] = [];

  for (const item of rawResults) {
    if (!item.title || !item.id) continue;
    if (seenIds.has(item.id)) continue;

    const normTitle = normalizeTitle(item.title);
    if (seenTitles.has(normTitle)) continue;

    // Check similarity: Don't include if title is virtually identical to original
    if (normTitle === originalNormTitle || normTitle.includes(originalNormTitle) && originalNormTitle.length > 15) {
      continue;
    }

    seenIds.add(item.id);
    seenTitles.add(normTitle);
    uniqueItems.push(item);

    if (uniqueItems.length >= limit) break;
  }

  // If results are still low, add intelligent concept fallbacks based on keywords
  if (uniqueItems.length < 6) {
    const fallbackTopics = [
      `${analysis.topic} - Full Session`,
      `Best of ${keywords[0] || 'Music'} Mix`,
      `${keywords[1] || 'Essential'} Highlights`,
      `${analysis.topic} Live Performance`,
      `${keywords[0] || 'Top'} Chill Collection`,
      `${analysis.topic} (Extended Edit)`,
    ];

    for (const fb of fallbackTopics) {
      if (uniqueItems.length >= limit) break;
      const fbId = `rel-${Math.random().toString(36).substring(2, 9)}`;
      uniqueItems.push({
        id: fbId,
        title: fb,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(fb)}`,
        thumbnailUrl: origVideo.thumbnailUrl,
        platform: 'youtube',
        platformName: 'YouTube',
        duration: '04:15',
        author: videoAuthor || 'Recommended Creator',
        isDownloadable: true,
      });
    }
  }

  const resultData: RelatedPlaylistData = {
    originalVideo: origVideo,
    playlistTitle: analysis.playlistTitle,
    topic: analysis.topic,
    category: analysis.category,
    keywords,
    totalVideos: uniqueItems.length,
    items: uniqueItems.slice(0, limit),
    hasMore: uniqueItems.length >= limit,
    page,
  };

  // Cache result
  playlistCache.set(cacheKey, { timestamp: Date.now(), data: resultData });

  return resultData;
}

/**
 * Formats and exports playlist to TXT or CSV
 */
export function exportPlaylist(
  playlistTitle: string, 
  items: RelatedPlaylistItem[], 
  format: 'txt' | 'csv'
): { content: string; filename: string; contentType: string } {
  const cleanTitle = playlistTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);

  if (format === 'csv') {
    const headers = ['Index', 'Title', 'Platform', 'Creator', 'Duration', 'URL'];
    const rows = items.map((item, idx) => {
      const escape = (val: string = '') => `"${val.replace(/"/g, '""')}"`;
      return [
        idx + 1,
        escape(item.title),
        escape(item.platformName),
        escape(item.author || ''),
        escape(item.duration || ''),
        escape(item.url),
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    return {
      content: csvContent,
      filename: `${cleanTitle}_playlist.csv`,
      contentType: 'text/csv; charset=utf-8',
    };
  }

  // Plain Text export
  const lines: string[] = [
    `======================================================`,
    ` CLIPVORY - RELATED VIDEOS PLAYLIST`,
    ` Playlist: ${playlistTitle}`,
    ` Generated: ${new Date().toLocaleString()}`,
    ` Total Videos: ${items.length}`,
    `======================================================`,
    '',
  ];

  items.forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item.title}`);
    lines.push(`   Platform: ${item.platformName} | Creator: ${item.author || 'N/A'} | Duration: ${item.duration || 'N/A'}`);
    lines.push(`   URL: ${item.url}`);
    lines.push('');
  });

  lines.push('------------------------------------------------------');
  lines.push('Generated with ClipVory - Fast, clean & secure media downloader.');

  return {
    content: lines.join('\n'),
    filename: `${cleanTitle}_playlist.txt`,
    contentType: 'text/plain; charset=utf-8',
  };
}
