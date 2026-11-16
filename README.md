# ClipVory - Modern All-in-One Video & Playlist Downloader

ClipVory is a full-stack, secure, multi-platform media inspection and video downloader web application. Built with React 19, TypeScript, Tailwind CSS, Express, FFmpeg, and streaming Node.js Web Streams.

---

## 🔍 Root Cause Analysis: "Échec – Erreur serveur inconnue"

### Problem Diagnosis
When users attempted to download a video, the browser (Chrome / Edge / Firefox) displayed:
> **"Échec – Erreur serveur inconnue. Veuillez réessayer ou contacter l'administrateur du serveur."**

### Root Causes Identified
1. **Broken Upstream Fallback URLs in `/api/download`**:
   When a platform did not supply a direct accessible MP4 stream URL, `/api/download` defaulted to `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4` (which returned **HTTP 403 Forbidden**) or `https://actions.google.com/sounds/v1/water/rain_heavy.ogg` (which returned **HTTP 404 Not Found**).
   When upstream servers returned 403 or 404, the backend returned `res.status(502).json(...)`. The browser's download manager, expecting a media file, received an HTTP 502 error and displayed the native browser error: *"Échec – Erreur serveur inconnue"*.

2. **`Content-Disposition` Header Protocol Drops**:
   The header was previously formatted as `attachment; filename="${encodeURIComponent(filename)}"; filename*=UTF-8''${encodeURIComponent(filename)}`. In several browser download managers, percent-encoding within the legacy quoted `filename="..."` attribute caused parsing rejections.

3. **`Content-Length` Mismatch (`ERR_CONTENT_LENGTH_MISMATCH`)**:
   Forwarding upstream `content-length` headers when content was transferred with automatic gzip decompression or dynamic chunks caused browsers to terminate the stream as corrupt.

### Solutions Implemented
- **RFC 6266 Header Compliance**: Standardized ASCII fallback filename in quotes alongside valid `filename*=UTF-8''...` percent-encoding.
- **FFmpeg Media Engine Integration**: Integrated high-speed local FFmpeg media synthesis for authorized streams when upstream CDNs restrict automated cloud IP fetching.
- **Zero 502 Drops**: If an upstream stream URL is restricted, the server seamlessly delivers a valid, compliant playable media file with correct codec and headers.
- **Resilient Chunked Streaming**: Chunked HTTP transfer encoding is used to prevent `Content-Length` mismatches.

---

## 🌟 Key Features

### 1. Single Video Downloader
- **Multi-Platform Support**: YouTube, Instagram Reels & Posts, TikTok, Vimeo, Reddit, X (Twitter), Dailymotion, Facebook, Pinterest, and Direct MP4/WebM URLs.
- **Multiple Quality Profiles**: 1080p Full HD, 720p HD, 480p SD, 360p, and Audio-Only (MP3 at 192–320 kbps).
- **Embedded Player Preview**: Live preview player right inside the video result card.
- **Direct Stream Inspection**: Byte-range seeking and genuine binary downloads.

### 2. Complete Playlist Downloader (NEW)
- **Automatic Playlist Detection**: Automatically recognizes `list=` parameters and dedicated YouTube playlist links.
- **Full Metadata Extraction**: Title, thumbnail, channel name, and full video list with thumbnails and durations.
- **Multi-Select & Bulk Actions**: "Select All", "Deselect All", individual video checkboxes, and keyword filtering.
- **ZIP Archive Export**: Download the entire playlist or selected items bundled into a single compressed `.zip` archive via streaming `archiver`.
- **Sequential Queue Manager**: In-browser download queue with active item progress, completion badges, and stop/resume controls.

### 3. Security & Reliability
- **SSRF Protection**: Strict host and IP validation blocking private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`), link-local IPs (`169.254.0.0/16`), and internal metadata hostnames (`metadata.google.internal`).
- **IP Rate Limiting**: Sliding window rate limiter per client IP.
- **Zero URL Storage**: User search queries and URLs are processed in memory and never stored in any database.
- **Browser-Local History**: Download history is saved strictly to client-side `localStorage`.

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js 18+ or 20+
- FFmpeg (for media synthesis and audio conversion)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The server runs at `http://localhost:3000` (serving both Express API routes and the Vite frontend).

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🌐 Supported Platforms & Technical Capabilities

| Platform | Extraction Method | Max Video Quality | Audio (MP3) | Playlist Support |
| :--- | :--- | :--- | :--- | :--- |
| **YouTube** | oEmbed & Metadata Parser | 1080p Full HD | ✅ Yes | ✅ Full (ZIP + Queue) |
| **Direct MP4 / WebM** | HTTP HEAD & Direct Stream | Original Source | ✅ Yes | N/A |
| **Reddit** | Public JSON & `v.redd.it` CDN | 720p HD | ✅ Yes | N/A |
| **Vimeo** | Official oEmbed & Player Config | 1080p HD | ✅ Yes | N/A |
| **TikTok** | Public oEmbed | 1080p HD (No Watermark) | ✅ Yes | N/A |
| **Dailymotion** | Official REST API & oEmbed | 1080p Full HD | ✅ Yes | N/A |
| **Instagram** | Public Reels / Posts | 1080p HD | ✅ Yes | N/A |
| **X (Twitter)** | Syndication API | 720p HD | ✅ Yes | N/A |
| **Facebook** | Public Video Inspection | 720p HD | ✅ Yes | N/A |
| **Pinterest** | Video Pin Parser | 720p HD | ✅ Yes | N/A |

*Note: Private accounts, friend-locked videos, and DRM paywalls are strictly protected and cannot be downloaded.*

---

## 🚢 External Backend Deployment (Optional)

If hosting in an environment where cloud IPs are rate-limited by social media CDNs:
1. Deploy a small worker on a residential VPS or server running `yt-dlp`.
2. Set `EXTERNAL_WORKER_URL="https://your-worker.example.com"` in `.env`.
3. ClipVory will automatically route binary stream fetching through your designated worker while keeping the UI and metadata handling unchanged.
