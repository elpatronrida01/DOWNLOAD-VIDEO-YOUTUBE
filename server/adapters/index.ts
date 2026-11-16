import type { BasePlatformAdapter } from './adapterInterface.ts';
import type { PlatformConfig, PlatformId, VideoMediaInfo } from '../../src/shared/types.ts';
import { YouTubeAdapter } from './youtubeAdapter.ts';
import { InstagramAdapter } from './instagramAdapter.ts';
import { TikTokAdapter } from './tiktokAdapter.ts';
import { FacebookAdapter } from './facebookAdapter.ts';
import { TwitterAdapter } from './twitterAdapter.ts';
import { VimeoAdapter } from './vimeoAdapter.ts';
import { RedditAdapter } from './redditAdapter.ts';
import { PinterestAdapter } from './pinterestAdapter.ts';
import { DailymotionAdapter } from './dailymotionAdapter.ts';
import { DirectAdapter } from './directAdapter.ts';

const adapters: BasePlatformAdapter[] = [
  new YouTubeAdapter(),
  new InstagramAdapter(),
  new TikTokAdapter(),
  new FacebookAdapter(),
  new TwitterAdapter(),
  new VimeoAdapter(),
  new RedditAdapter(),
  new PinterestAdapter(),
  new DailymotionAdapter(),
  new DirectAdapter(),
];

export function findAdapterForUrl(url: string): BasePlatformAdapter | undefined {
  return adapters.find((adapter) => adapter.matches(url));
}

export function getAllAdapters(): BasePlatformAdapter[] {
  return adapters;
}

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    icon: 'youtube',
    domains: ['youtube.com', 'youtu.be'],
    status: 'active',
    statusLabel: 'Active & Verified',
    capabilities: ['1080p Full HD', '720p HD', '480p SD', '360p', 'Audio (MP3)', 'Shorts', 'Full Playlists'],
    sampleUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    sampleTitle: 'Rick Astley - Never Gonna Give You Up',
    supportsPlaylists: true,
    samplePlaylistUrl: 'https://www.youtube.com/playlist?list=PLrAXtmErZgOdP_8GztsuKi9nrraNbKKp4',
    samplePlaylistTitle: 'Lex Fridman Podcast (Public Playlist)',
    authNote: 'Supports public videos, shorts, and full public playlists via metadata parser.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E1306C',
    icon: 'instagram',
    domains: ['instagram.com'],
    status: 'active',
    statusLabel: 'Active (Public Only)',
    capabilities: ['Reels (1080p)', 'Public Feed Videos', 'Original Audio MP3'],
    sampleUrl: 'https://www.instagram.com/reel/C3bA18bLH5P/',
    sampleTitle: 'Instagram Public Nature Reel',
    authNote: 'Supports public reels and posts. Private accounts are strictly protected.',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#00F2FE',
    icon: 'music',
    domains: ['tiktok.com', 'vm.tiktok.com'],
    status: 'active',
    statusLabel: 'Active & Verified',
    capabilities: ['HD MP4 (No Watermark)', 'Standard MP4', 'Soundtrack MP3'],
    sampleUrl: 'https://www.tiktok.com/@scout2015/video/6718335390845095173',
    sampleTitle: 'TikTok Corgi Puppy Video',
    authNote: 'Official oEmbed metadata extraction and high quality stream export.',
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    color: '#1AB7EA',
    icon: 'video',
    domains: ['vimeo.com'],
    status: 'active',
    statusLabel: 'Active & Progressive Streams',
    capabilities: ['1080p High Bitrate', '720p HD', '480p', 'Audio MP3', 'Embed Preview'],
    sampleUrl: 'https://vimeo.com/76979871',
    sampleTitle: 'The New Vimeo Player (Official)',
    authNote: 'Full oEmbed integration with progressive direct streams.',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    color: '#FF4500',
    icon: 'message-square',
    domains: ['reddit.com', 'redd.it', 'v.redd.it'],
    status: 'active',
    statusLabel: 'Direct v.redd.it Streams',
    capabilities: ['720p HD MP4', '480p SD', 'Audio Track MP3', 'Direct Proxying'],
    sampleUrl: 'https://www.reddit.com/r/videos/comments/6vsv8s/guy_accidentally_creates_masterpiece/',
    sampleTitle: 'Reddit Community Video Post',
    authNote: 'Direct extraction via Reddit JSON API and v.redd.it video CDN.',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    color: '#1DA1F2',
    icon: 'twitter',
    domains: ['x.com', 'twitter.com'],
    status: 'active',
    statusLabel: 'Active & Syndicated',
    capabilities: ['720p MP4', '480p MP4', 'Audio MP3', 'Public Tweets'],
    sampleUrl: 'https://twitter.com/NASA/status/1678826727228833792',
    sampleTitle: 'NASA Deep Space Video Tweet',
    authNote: 'Official X syndication API for public video tweets.',
  },
  {
    id: 'dailymotion',
    name: 'Dailymotion',
    color: '#0066DC',
    icon: 'film',
    domains: ['dailymotion.com', 'dai.ly'],
    status: 'active',
    statusLabel: 'Active & Official API',
    capabilities: ['1080p Full HD', '720p HD', '480p SD', 'Audio MP3'],
    sampleUrl: 'https://www.dailymotion.com/video/x8bgf9q',
    sampleTitle: 'Dailymotion Nature Documentary',
    authNote: 'Integrated with official Dailymotion public REST API.',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    icon: 'facebook',
    domains: ['facebook.com', 'fb.watch'],
    status: 'active',
    statusLabel: 'Public Videos',
    capabilities: ['HD 720p MP4', 'SD 480p MP4', 'Audio MP3'],
    sampleUrl: 'https://www.facebook.com/watch/?v=10153231379946729',
    sampleTitle: 'Facebook Public Page Video',
    authNote: 'Supports public creator and page videos. Private groups protected.',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#E60023',
    icon: 'pin',
    domains: ['pinterest.com', 'pin.it'],
    status: 'active',
    statusLabel: 'Active Video Pins',
    capabilities: ['720p Video Pin MP4', 'Audio Track MP3'],
    sampleUrl: 'https://www.pinterest.com/pin/123456789/',
    sampleTitle: 'Pinterest Creative DIY Video Pin',
    authNote: 'Public video pin inspection.',
  },
  {
    id: 'direct',
    name: 'Direct MP4 / WebM',
    color: '#10B981',
    icon: 'link-2',
    domains: ['All public HTTP/HTTPS video files'],
    status: 'active',
    statusLabel: 'Direct Stream & Range',
    capabilities: ['Original High-Speed Binary Stream', 'Byte-Range Seeking', 'Audio Extraction'],
    sampleUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    sampleTitle: 'Nature Blooming (Verified CC0 Open Video MP4)',
    authNote: 'Supports any valid public video link with SSRF verification.',
  },
];
