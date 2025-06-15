#!/usr/bin/env node

import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIDEO_SOURCE_DIR = path.join(__dirname, '..', 'static', 'videos');
const VIDEO_OUTPUT_DIR = path.join(__dirname, '..', 'static', 'videos');

// Supported input formats
const SUPPORTED_FORMATS = ['.mp4', '.mov', '.avi', '.mkv', '.m4v'];

// Output formats and their encoding settings
const OUTPUT_FORMATS = {
  webm: {
    extension: '.webm',
    codec: 'libvpx-vp9',
    settings: '-c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus'
  },
  mp4: {
    extension: '.mp4',
    codec: 'libx264',
    settings: '-c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k'
  }
};

async function checkFFmpeg() {
  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (error) {
    console.error('FFmpeg is not installed. Please install FFmpeg to process videos.');
    console.error('On macOS: brew install ffmpeg');
    console.error('On Ubuntu/Debian: sudo apt-get install ffmpeg');
    console.error('On Windows: Download from https://ffmpeg.org/download.html');
    return false;
  }
}

async function getVideoInfo(filePath) {
  try {
    const { stdout } = await execAsync(
      `ffprobe -v quiet -print_format json -show_format -show_streams "${filePath}"`
    );
    return JSON.parse(stdout);
  } catch (error) {
    console.error(`Error getting video info for ${filePath}:`, error);
    return null;
  }
}

async function transcodeVideo(inputPath, outputPath, format) {
  const formatConfig = OUTPUT_FORMATS[format];
  
  console.log(`Transcoding ${path.basename(inputPath)} to ${format}...`);
  
  try {
    // Create a thumbnail
    const thumbnailPath = outputPath.replace(formatConfig.extension, '-thumb.jpg');
    await execAsync(
      `ffmpeg -i "${inputPath}" -ss 00:00:01.000 -vframes 1 -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" "${thumbnailPath}" -y`
    );
    
    // Transcode the video
    await execAsync(
      `ffmpeg -i "${inputPath}" ${formatConfig.settings} -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" "${outputPath}" -y`
    );
    
    console.log(`✓ Successfully transcoded to ${format}`);
    return true;
  } catch (error) {
    console.error(`Error transcoding ${inputPath} to ${format}:`, error.message);
    return false;
  }
}

async function processVideos() {
  // Check if FFmpeg is installed
  if (!await checkFFmpeg()) {
    process.exit(1);
  }
  
  // Ensure directories exist
  try {
    await fs.mkdir(VIDEO_SOURCE_DIR, { recursive: true });
    await fs.mkdir(VIDEO_OUTPUT_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating directories:', error);
    process.exit(1);
  }
  
  // Get all video files
  const files = await fs.readdir(VIDEO_SOURCE_DIR);
  const videoFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
  });
  
  if (videoFiles.length === 0) {
    console.log('No video files found to process.');
    console.log(`Place video files in: ${VIDEO_SOURCE_DIR}`);
    console.log(`Supported formats: ${SUPPORTED_FORMATS.join(', ')}`);
    return;
  }
  
  console.log(`Found ${videoFiles.length} video(s) to process`);
  
  // Process each video
  for (const videoFile of videoFiles) {
    const inputPath = path.join(VIDEO_SOURCE_DIR, videoFile);
    const baseName = path.basename(videoFile, path.extname(videoFile));
    
    console.log(`\nProcessing: ${videoFile}`);
    
    // Get video information
    const videoInfo = await getVideoInfo(inputPath);
    if (videoInfo) {
      const duration = parseFloat(videoInfo.format.duration);
      const size = (parseInt(videoInfo.format.size) / 1024 / 1024).toFixed(2);
      console.log(`Duration: ${Math.floor(duration / 60)}:${Math.floor(duration % 60).toString().padStart(2, '0')}`);
      console.log(`Size: ${size} MB`);
    }
    
    // Check if already processed
    let needsProcessing = false;
    for (const format of Object.keys(OUTPUT_FORMATS)) {
      const outputPath = path.join(VIDEO_OUTPUT_DIR, baseName + OUTPUT_FORMATS[format].extension);
      try {
        const outputStat = await fs.stat(outputPath);
        const inputStat = await fs.stat(inputPath);
        if (inputStat.mtime > outputStat.mtime) {
          needsProcessing = true;
          break;
        }
      } catch {
        needsProcessing = true;
        break;
      }
    }
    
    if (!needsProcessing) {
      console.log('✓ Already processed and up to date');
      continue;
    }
    
    // Transcode to each format
    for (const format of Object.keys(OUTPUT_FORMATS)) {
      const outputPath = path.join(VIDEO_OUTPUT_DIR, baseName + OUTPUT_FORMATS[format].extension);
      await transcodeVideo(inputPath, outputPath, format);
    }
  }
  
  console.log('\n✅ Video processing complete!');
}

// Run the script
processVideos().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});