import { NextApiRequest, NextApiResponse } from 'next';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Configure multer for handling multipart form data
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Disable body parsing for multer
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== UPLOAD API STARTED ===');
  console.log('Request headers:', req.headers);

  try {
    // Use multer to parse multipart form data
    const uploadMiddleware = upload.single('video');
    
    uploadMiddleware(req as any, res as any, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: 'File upload error' });
      }

      const file = (req as any).file;
      const audienceData = JSON.parse(req.body.audience || '{}');

      console.log('=== FILE UPLOAD DETAILS ===');
      console.log('File received:', file ? {
        fieldname: file.fieldname,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      } : 'No file');
      console.log('Audience data:', audienceData);

      if (!file) {
        console.error('No video file provided');
        return res.status(400).json({ error: 'No video file provided' });
      }

      const videoId = uuidv4();
      const uploadDir = join(process.cwd(), 'uploads', videoId);
      
      console.log('=== CREATING UPLOAD DIRECTORY ===');
      console.log('Video ID:', videoId);
      console.log('Upload directory:', uploadDir);
      
      try {
        // Create upload directory
        await mkdir(uploadDir, { recursive: true });
        console.log('✓ Upload directory created');
        
        // Save video file
        const videoPath = join(uploadDir, 'video.mp4');
        await writeFile(videoPath, file.buffer);
        console.log('✓ Video file saved to:', videoPath);

        // Store audience data
        const audiencePath = join(uploadDir, 'audience.json');
        await writeFile(
          audiencePath, 
          JSON.stringify(audienceData, null, 2)
        );
        console.log('✓ Audience data saved to:', audiencePath);

        // Start processing pipeline
        console.log('=== STARTING PROCESSING PIPELINE ===');
        await startProcessing(videoId, audienceData);

        console.log('=== UPLOAD COMPLETED SUCCESSFULLY ===');
        res.status(200).json({ 
          videoId,
          message: 'Video uploaded successfully' 
        });
      } catch (error) {
        console.error('File write error:', error);
        res.status(500).json({ error: 'Failed to save file' });
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}

async function startProcessing(videoId: string, audienceData: any) {
  console.log('=== PROCESSING PIPELINE START ===');
  console.log(`Processing video ${videoId} with audience:`, audienceData);
  
  try {
    // Step 1: Transcribe the video
    console.log('Step 1: Starting transcription...');
    await transcribeVideo(videoId);
    
    // Step 2: Segment the video
    console.log('Step 2: Segmenting video...');
    await segmentVideo(videoId);
    
    // Step 3: Parse audience data
    console.log('Step 3: Parsing audience data...');
    await parseAudience(videoId, audienceData);
    
    // Step 4: Rewrite transcript
    console.log('Step 4: Rewriting transcript...');
    await rewriteTranscript(videoId);
    
    // Step 5: Generate TTS
    console.log('Step 5: Generating TTS...');
    await generateTTS(videoId);
    
    // Step 6: Generate adapted video
    console.log('Step 6: Generating adapted video...');
    await generateAdaptedVideo(videoId);
    
    console.log('=== PROCESSING PIPELINE COMPLETED ===');
  } catch (error) {
    console.error('Processing pipeline error:', error);
    throw error;
  }
}

async function transcribeVideo(videoId: string) {
  console.log(`Transcribing video ${videoId}...`);
  // Call the transcribe API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/transcribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transcription failed: ${error}`);
  }
  
  console.log('✓ Transcription completed');
}

async function segmentVideo(videoId: string) {
  console.log(`Segmenting video ${videoId}...`);
  // Call the segment-video API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/segment-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId, maxSegmentDuration: 10 })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Video segmentation failed: ${error}`);
  }
  
  console.log('✓ Video segmentation completed');
}

async function parseAudience(videoId: string, audienceData: any) {
  console.log(`Parsing audience for video ${videoId}...`);
  // Call the parse-audience API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/parse-audience`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId, audience: audienceData })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Audience parsing failed: ${error}`);
  }
  
  console.log('✓ Audience parsing completed');
}

async function rewriteTranscript(videoId: string) {
  console.log(`Rewriting transcript for video ${videoId}...`);
  // Call the rewrite API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/rewrite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Transcript rewriting failed: ${error}`);
  }
  
  console.log('✓ Transcript rewriting completed');
}

async function generateTTS(videoId: string) {
  console.log(`Generating TTS for video ${videoId}...`);
  // Call the TTS API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TTS generation failed: ${error}`);
  }
  
  console.log('✓ TTS generation completed');
}

async function generateAdaptedVideo(videoId: string) {
  console.log(`Generating adapted video for ${videoId}...`);
  // Call the video generation API
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoId })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Video generation failed: ${error}`);
  }
  
  console.log('✓ Video generation completed');
} 