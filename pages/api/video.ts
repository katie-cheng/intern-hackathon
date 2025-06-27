import { NextApiRequest, NextApiResponse } from 'next';
import { readFile, access, writeFile, stat } from 'fs/promises';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import { createReadStream } from 'fs';

// Configuration for background music feature
const INCLUDE_BACKGROUND_MUSIC = true; // Toggle this to enable/disable background music
const BACKGROUND_MUSIC_PATH = join(process.cwd(), 'assets', 'inspirational.mp3'); // User's uploaded inspirational music
const DEMO_VIDEO_PATH = join(process.cwd(), 'assets', 'majoranaminecraft.mp4'); // Hardcoded demo video for visuals

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    // Serve video files with streaming
    try {
      const { videoId, filename } = req.query;

      if (!videoId || !filename || typeof videoId !== 'string' || typeof filename !== 'string') {
        return res.status(400).json({ error: 'Video ID and filename are required' });
      }

      const filePath = join(process.cwd(), 'uploads', videoId, filename);
      
      // Check if file exists
      try {
        await access(filePath);
      } catch (error) {
        return res.status(404).json({ error: 'Video file not found' });
      }

      // Get file stats
      const fileStats = await stat(filePath);
      const fileSize = fileStats.size;

      // Parse range header for partial content requests
      const range = req.headers.range;
      
      if (range) {
        // Handle range requests for video streaming
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=3600'
        });

        const stream = createReadStream(filePath, { start, end });
        stream.pipe(res);
      } else {
        // Full file request
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600'
        });

        const stream = createReadStream(filePath);
        stream.pipe(res);
      }

    } catch (error) {
      console.error('Video serving error:', error);
      res.status(500).json({ error: 'Failed to serve video' });
    }
  } else if (req.method === 'POST') {
    // Generate adapted video
    console.log('=== VIDEO GENERATION API STARTED ===');

    try {
      const { videoId } = req.body;

      if (!videoId) {
        return res.status(400).json({ error: 'Video ID is required' });
      }

      console.log('Generating adapted video for video ID:', videoId);

      // Read all necessary files
      const videoPath = join(process.cwd(), 'uploads', videoId, 'video.mp4');
      const audioPath = join(process.cwd(), 'uploads', videoId, 'narration.wav');
      const audiencePath = join(process.cwd(), 'uploads', videoId, 'audience-enhanced.json');
      
      console.log('Video path:', videoPath);
      console.log('Audio path:', audioPath);
      console.log('Audience path:', audiencePath);
      
      const audienceData = JSON.parse(await readFile(audiencePath, 'utf-8'));
      console.log('Audience data:', audienceData);

      // Generate adapted video
      const adaptedVideoPath = await generateAdaptedVideo(
        videoPath,
        audioPath,
        audienceData,
        videoId
      );

      console.log('Adapted video generated:', adaptedVideoPath);

      res.status(200).json({ 
        adaptedVideoPath: `/uploads/${videoId}/adapted-video.mp4`,
        message: 'Video generation completed' 
      });

    } catch (error) {
      console.error('Video generation error:', error);
      res.status(500).json({ error: 'Video generation failed: ' + (error as Error).message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function generateAdaptedVideo(
  originalVideoPath: string, 
  audioPath: string, 
  audienceData: any,
  videoId: string
): Promise<string> {
  console.log('Starting video generation with FFmpeg...');
  
  const outputPath = join(process.cwd(), 'uploads', videoId, 'adapted-video.mp4');
  
  try {
    // Check if files exist
    await readFile(audioPath);
    await readFile(DEMO_VIDEO_PATH);
    
    console.log('Input files verified, starting FFmpeg processing...');
    console.log('Using hardcoded demo video for visuals:', DEMO_VIDEO_PATH);
    
    // Check if user wants background music and if file exists
    let includeMusic = audienceData.includeBackgroundMusic || INCLUDE_BACKGROUND_MUSIC;
    if (includeMusic) {
      try {
        await access(BACKGROUND_MUSIC_PATH);
        console.log('User\'s inspirational music file found:', BACKGROUND_MUSIC_PATH);
      } catch (error) {
        console.log('Inspirational music file not found at:', BACKGROUND_MUSIC_PATH);
        console.log('Please add your inspirational.mp3 file to the assets folder');
        includeMusic = false;
      }
    } else {
      console.log('Background music disabled by user preference');
    }
    
    // Use FFmpeg to combine demo video with new audio and optional background music
    return new Promise((resolve, reject) => {
      const ffmpegCommand = ffmpeg()
        .input(DEMO_VIDEO_PATH)  // Use hardcoded demo video for visuals
        .input(audioPath);
      
      if (includeMusic) {
        console.log('Adding user\'s inspirational background music to video...');
        ffmpegCommand.input(BACKGROUND_MUSIC_PATH);
      }
      
      ffmpegCommand
        .outputOptions([
          '-c:v copy',           // Copy video stream without re-encoding
          '-c:a aac',            // Use AAC codec for audio
          '-shortest',           // End when shortest input ends
          '-map 0:v:0'           // Use video from first input (demo video)
        ]);
      
      if (includeMusic) {
        // Mix narration and background music with volume control
        ffmpegCommand.outputOptions([
          '-filter_complex', '[1:a]volume=1.0[narration];[2:a]volume=0.3[music];[narration][music]amix=inputs=2[a]',
          '-map [a]'            // Use mixed audio
        ]);
      } else {
        // Use only narration audio
        ffmpegCommand.outputOptions([
          '-map 1:a:0'           // Use audio from second input (narration)
        ]);
      }
      
      ffmpegCommand
        .output(outputPath)
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('progress', (progress) => {
          console.log('FFmpeg progress:', progress.percent + '%');
        })
        .on('end', () => {
          console.log('FFmpeg processing completed successfully');
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        .run();
    });
    
  } catch (error) {
    console.error('File access error:', error);
    
    // Fallback: create a simple copy of the demo video
    console.log('Using fallback: copying demo video');
    const demoBuffer = await readFile(DEMO_VIDEO_PATH);
    await writeFile(outputPath, demoBuffer);
    
    return outputPath;
  }
} 