# Video Directory

Place your video files here for automatic transcoding to web-friendly formats.

## Supported Input Formats
- `.mp4`
- `.mov`
- `.avi`
- `.mkv`
- `.m4v`

## Automatic Processing
When you run `npm run build` or `npm run process-videos`, all videos in this directory will be automatically:
1. Transcoded to WebM format (VP9 codec) for modern browsers
2. Transcoded to MP4 format (H.264 codec) for compatibility
3. Generate thumbnail images for preview

## Output
Processed videos will be saved in the same directory with appropriate extensions:
- `video-name.webm` - WebM version
- `video-name.mp4` - MP4 version
- `video-name-thumb.jpg` - Thumbnail image

## Requirements
FFmpeg must be installed on your system:
- macOS: `brew install ffmpeg`
- Ubuntu/Debian: `sudo apt-get install ffmpeg`
- Windows: Download from https://ffmpeg.org/download.html

## Usage in Articles
Reference videos in your markdown articles like this:

```html
<video controls preload="metadata">
  <source src="/videos/your-video.webm" type="video/webm">
  <source src="/videos/your-video.mp4" type="video/mp4">
  Your browser doesn't support HTML5 video.
</video>
```

## ALECS Demo Video
To add the ALECS demo video:
1. Record your demonstration video
2. Save it as `alecs-demo.mp4` (or any supported format) in this directory
3. Run `npm run process-videos` to generate web-friendly versions
4. The video will automatically appear in the ALECS article