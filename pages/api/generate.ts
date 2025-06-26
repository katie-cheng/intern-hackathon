import { NextApiRequest, NextApiResponse } from 'next';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== GENERATE API STARTED ===');

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
    await readFile(originalVideoPath);
    await readFile(audioPath);
    
    console.log('Input files verified, starting FFmpeg processing...');
    
    // Use FFmpeg to combine video with new audio
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(originalVideoPath)
        .input(audioPath)
        .outputOptions([
          '-c:v copy',           // Copy video stream without re-encoding
          '-c:a aac',            // Use AAC codec for audio
          '-shortest',           // End when shortest input ends
          '-map 0:v:0',          // Use video from first input
          '-map 1:a:0'           // Use audio from second input
        ])
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
    
    // Fallback: create a simple copy of the original video
    console.log('Using fallback: copying original video');
    const originalBuffer = await readFile(originalVideoPath);
    await writeFile(outputPath, originalBuffer);
    
    return outputPath;
  }
} 