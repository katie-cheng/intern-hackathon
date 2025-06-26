// FFmpeg video processing utilities

export interface VideoSegment {
  startTime: number; // in seconds
  endTime: number; // in seconds
  filePath: string;
}

export interface VideoInfo {
  duration: number;
  width: number;
  height: number;
  fps: number;
  bitrate: number;
  codec: string;
}

// Extract video segment using FFmpeg
export async function extractVideoSegment(
  inputPath: string,
  outputPath: string,
  startTime: number,
  duration: number
): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const command = `ffmpeg -i "${inputPath}" -ss ${startTime} -t ${duration} -c copy "${outputPath}" -y`;

  try {
    await execAsync(command);
  } catch (error) {
    console.error('FFmpeg segment extraction error:', error);
    throw new Error('Failed to extract video segment');
  }
}

// Merge video segments into a single file
export async function mergeVideoSegments(
  segments: VideoSegment[],
  outputPath: string
): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  // Create file list for FFmpeg
  const fileListPath = outputPath.replace('.mp4', '_filelist.txt');
  const fileListContent = segments
    .map(segment => `file '${segment.filePath}'`)
    .join('\n');

  const fs = await import('fs/promises');
  await fs.writeFile(fileListPath, fileListContent);

  const command = `ffmpeg -f concat -safe 0 -i "${fileListPath}" -c copy "${outputPath}" -y`;

  try {
    await execAsync(command);
    // Clean up file list
    await fs.unlink(fileListPath);
  } catch (error) {
    console.error('FFmpeg merge error:', error);
    throw new Error('Failed to merge video segments');
  }
}

// Replace audio track in video
export async function replaceAudio(
  videoPath: string,
  audioPath: string,
  outputPath: string
): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const command = `ffmpeg -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 "${outputPath}" -y`;

  try {
    await execAsync(command);
  } catch (error) {
    console.error('FFmpeg audio replacement error:', error);
    throw new Error('Failed to replace audio track');
  }
}

// Get video information
export async function getVideoInfo(videoPath: string): Promise<VideoInfo> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const command = `ffprobe -v quiet -print_format json -show_format -show_streams "${videoPath}"`;

  try {
    const { stdout } = await execAsync(command);
    const data = JSON.parse(stdout);

    const videoStream = data.streams.find((stream: any) => stream.codec_type === 'video');
    const format = data.format;

    return {
      duration: parseFloat(format.duration),
      width: videoStream.width,
      height: videoStream.height,
      fps: eval(videoStream.r_frame_rate), // e.g., "30/1" -> 30
      bitrate: parseInt(format.bit_rate),
      codec: videoStream.codec_name,
    };
  } catch (error) {
    console.error('FFprobe error:', error);
    throw new Error('Failed to get video information');
  }
}

// Resize video to target resolution
export async function resizeVideo(
  inputPath: string,
  outputPath: string,
  width: number,
  height: number
): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const command = `ffmpeg -i "${inputPath}" -vf scale=${width}:${height} -c:a copy "${outputPath}" -y`;

  try {
    await execAsync(command);
  } catch (error) {
    console.error('FFmpeg resize error:', error);
    throw new Error('Failed to resize video');
  }
}

// Extract audio from video
export async function extractAudio(
  videoPath: string,
  audioPath: string,
  format: 'wav' | 'mp3' | 'aac' = 'wav'
): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const codecMap = {
    wav: 'pcm_s16le',
    mp3: 'mp3',
    aac: 'aac',
  };

  const command = `ffmpeg -i "${videoPath}" -vn -acodec ${codecMap[format]} "${audioPath}" -y`;

  try {
    await execAsync(command);
  } catch (error) {
    console.error('FFmpeg audio extraction error:', error);
    throw new Error('Failed to extract audio');
  }
}

// Create video with audio overlay
export async function overlayAudio(
  videoPath: string,
  audioPath: string,
  outputPath: string,
  audioStartTime: number = 0
): Promise<void> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  const command = `ffmpeg -i "${videoPath}" -i "${audioPath}" -filter_complex "[1:a]adelay=${audioStartTime * 1000}|${audioStartTime * 1000}[delayed];[0:a][delayed]amix=inputs=2:duration=longest" -c:v copy "${outputPath}" -y`;

  try {
    await execAsync(command);
  } catch (error) {
    console.error('FFmpeg audio overlay error:', error);
    throw new Error('Failed to overlay audio');
  }
}

// Check if FFmpeg is available
export async function checkFFmpeg(): Promise<boolean> {
  const { exec } = await import('child_process');
  const { promisify } = await import('util');
  const execAsync = promisify(exec);

  try {
    await execAsync('ffmpeg -version');
    return true;
  } catch (error) {
    console.error('FFmpeg not found:', error);
    return false;
  }
} 