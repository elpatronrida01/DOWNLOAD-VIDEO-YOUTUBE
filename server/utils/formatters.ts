export function formatDuration(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatBytes(bytes: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let value = bytes;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }

  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function sanitizeFilename(name: string, fallback = 'clipvory-download'): string {
  const cleaned = name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 100);
  return cleaned || fallback;
}

export function estimateFilesize(durationSec: number, quality: string): { bytes: number; formatted: string } {
  // Approximate bitrates in bits per second
  const bitrates: Record<string, number> = {
    '1080p': 4_500_000, // ~4.5 Mbps
    '720p': 2_500_000,  // ~2.5 Mbps
    '480p': 1_200_000,  // ~1.2 Mbps
    '360p': 700_000,    // ~700 Kbps
    audio: 192_000,     // 192 Kbps
    original: 3_000_000,
  };

  const dur = durationSec > 0 ? durationSec : 180; // default 3 min if unknown
  const bitrate = bitrates[quality] || 2_000_000;
  const bytes = Math.round((dur * bitrate) / 8);

  return {
    bytes,
    formatted: `~${formatBytes(bytes)}`,
  };
}
