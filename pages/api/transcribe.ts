import { NextApiRequest, NextApiResponse } from 'next';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Debug: Check environment variables
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('AZURE_SPEECH_KEY:', process.env.AZURE_SPEECH_KEY ? `${process.env.AZURE_SPEECH_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('AZURE_SPEECH_REGION:', process.env.AZURE_SPEECH_REGION || 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All env vars with AZURE:', Object.keys(process.env).filter(key => key.includes('AZURE')));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('=== TRANSCRIPTION API STARTED ===');
    const { videoId } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log('Transcribing video:', videoId);
    
    // Check if Azure credentials are available
    const speechKey = process.env.AZURE_SPEECH_KEY;
    const speechRegion = process.env.AZURE_SPEECH_REGION;
    
    console.log('Azure Speech Key available:', !!speechKey);
    console.log('Azure Speech Region available:', !!speechRegion);
    
    if (!speechKey || !speechRegion) {
      console.error('Missing Azure Speech credentials');
      return res.status(500).json({ 
        error: 'Azure Speech credentials not configured. Please set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION in your .env.local file.' 
      });
    }

    const uploadDir = join(process.cwd(), 'uploads', videoId);
    const videoPath = join(uploadDir, 'video.mp4');
    const audioPath = join(uploadDir, 'audio.wav');
    const transcriptPath = join(uploadDir, 'transcript.json');

    console.log('Upload directory:', uploadDir);
    console.log('Video path:', videoPath);
    console.log('Audio path:', audioPath);
    console.log('Transcript path:', transcriptPath);

    // Check if video file exists
    try {
      await readFile(videoPath);
      console.log('Video file found and readable');
    } catch (error) {
      console.error('Video file not found:', error);
      return res.status(404).json({ error: 'Video file not found' });
    }

    // Extract audio from video
    console.log('Step 1: Extracting audio from video...');
    try {
      await extractAudioFromVideo(videoPath, audioPath);
      console.log('Audio extraction completed');
    } catch (error) {
      console.error('Audio extraction failed:', error);
      return res.status(500).json({ error: `Audio extraction failed: ${(error as Error).message}` });
    }

    // Read the audio file
    console.log('Step 2: Reading audio file...');
    let audioBuffer: Buffer;
    try {
      audioBuffer = await readFile(audioPath);
      console.log('Audio file read successfully, size:', audioBuffer.length);
    } catch (error) {
      console.error('Failed to read audio file:', error);
      return res.status(500).json({ error: `Failed to read audio file: ${(error as Error).message}` });
    }

    // Call Azure Speech API
    console.log('Step 3: Calling Azure Speech API...');
    let transcript: string;
    try {
      transcript = await callAzureSpeechAPI(audioBuffer, speechKey, speechRegion);
      console.log('Transcription completed successfully');
      console.log('Transcript:', transcript);
    } catch (error) {
      console.error('Azure Speech API call failed:', error);
      return res.status(500).json({ error: `Transcription failed: ${(error as Error).message}` });
    }

    // Save transcript
    console.log('Step 4: Saving transcript...');
    try {
      const transcriptData = {
        text: transcript,
        timestamp: new Date().toISOString(),
        videoId: videoId,
        source: 'azure_speech_api'
      };
      await writeFile(transcriptPath, JSON.stringify(transcriptData, null, 2), 'utf8');
      console.log('Transcript saved successfully');
    } catch (error) {
      console.error('Failed to save transcript:', error);
      return res.status(500).json({ error: `Failed to save transcript: ${(error as Error).message}` });
    }

    console.log('=== TRANSCRIPTION COMPLETED SUCCESSFULLY ===');
    res.status(200).json({ 
      success: true, 
      transcript,
      message: 'Transcription completed successfully' 
    });

  } catch (error) {
    console.error('Unexpected error in transcription API:', error);
    res.status(500).json({ 
      error: `Unexpected error: ${(error as Error).message}` 
    });
  }
}

async function extractAudioFromVideo(videoPath: string, audioPath: string): Promise<void> {
  console.log('Starting audio extraction...');
  console.log('Video path:', videoPath);
  console.log('Audio output path:', audioPath);
  
  // Check if video file exists
  try {
    const videoStats = await readFile(videoPath);
    console.log('Video file exists, size:', videoStats.length);
  } catch (error) {
    throw new Error(`Video file not found or not readable: ${(error as Error).message}`);
  }
  
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-vn',           // No video
        '-acodec', 'pcm_s16le',  // 16-bit PCM audio
        '-ar', '16000',  // 16kHz sample rate (good for speech)
        '-ac', '1'       // Mono audio
      ])
      .output(audioPath)
      .on('start', (commandLine) => {
        console.log('FFmpeg audio extraction command:', commandLine);
      })
      .on('progress', (progress) => {
        console.log('Audio extraction progress:', progress.percent + '%');
      })
      .on('end', async () => {
        console.log('Audio extraction completed successfully');
        
        // Verify the audio file was created and has content
        try {
          const audioStats = await readFile(audioPath);
          console.log('Audio file created successfully, size:', audioStats.length);
          
          if (audioStats.length === 0) {
            reject(new Error('Audio file was created but is empty - video may not contain audio'));
            return;
          }
          
          resolve();
        } catch (error) {
          reject(new Error(`Audio file verification failed: ${(error as Error).message}`));
        }
      })
      .on('error', (err) => {
        console.error('FFmpeg audio extraction error:', err);
        reject(new Error(`Audio extraction failed: ${err.message}`));
      })
      .run();
  });
}

async function transcribeAudio(audioPath: string): Promise<string> {
  console.log('Starting Azure Speech-to-Text transcription...');
  
  // Check if Azure Speech credentials are available
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;
  
  if (!speechKey || !speechRegion) {
    console.error('Azure Speech credentials not found!');
    throw new Error('AZURE_SPEECH_KEY and AZURE_SPEECH_REGION must be set in .env.local for real transcription');
  }

  try {
    // Read the audio file
    const audioBuffer = await readFile(audioPath);
    console.log('Audio file read, size:', audioBuffer.length);
    
    if (audioBuffer.length === 0) {
      throw new Error('Audio file is empty - video may not contain audio');
    }
    
    // Use Azure Speech REST API for transcription
    const transcript = await callAzureSpeechAPI(audioBuffer, speechKey, speechRegion);
    console.log('Azure Speech API response received');
    
    if (!transcript || transcript.trim().length === 0) {
      throw new Error('Azure Speech API returned empty transcript');
    }
    
    return transcript;
    
  } catch (error) {
    console.error('Azure Speech transcription error:', error);
    throw new Error(`Real transcription failed: ${(error as Error).message}. Please check your Azure Speech credentials and try again.`);
  }
}

async function callAzureSpeechAPI(audioBuffer: Buffer, speechKey: string, speechRegion: string): Promise<string> {
  console.log('Calling Azure Speech API...');
  const url = `https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`;
  
  console.log('API URL:', url);
  console.log('Audio buffer size:', audioBuffer.length);
  console.log('Speech key length:', speechKey.length);
  console.log('Speech region:', speechRegion);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'audio/wav',
        'Accept': 'application/json'
      },
      body: audioBuffer
    });

    console.log('Azure Speech API response status:', response.status);
    console.log('Azure Speech API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure Speech API error response:', errorText);
      throw new Error(`Azure Speech API error: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('Azure Speech API result:', result);
    
    const transcript = result.DisplayText || result.NBest?.[0]?.Display || result.Results?.[0]?.DisplayText;
    
    if (!transcript) {
      console.error('No transcript found in Azure Speech API response:', result);
      throw new Error('Azure Speech API returned no transcript data');
    }
    
    return transcript;
  } catch (error) {
    console.error('Fetch error details:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: ${error.message}. Check your internet connection and Azure Speech service availability.`);
    }
    throw error;
  }
} 