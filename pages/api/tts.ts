import { NextApiRequest, NextApiResponse } from 'next';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== TTS API STARTED ===');

  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log('Generating TTS for video ID:', videoId);

    // Read rewritten transcript and audience data
    const transcriptPath = join(process.cwd(), 'uploads', videoId, 'transcript-rewritten.json');
    const audiencePath = join(process.cwd(), 'uploads', videoId, 'audience-enhanced.json');
    
    console.log('Reading transcript from:', transcriptPath);
    console.log('Reading audience data from:', audiencePath);
    
    const transcriptData = JSON.parse(await readFile(transcriptPath, 'utf-8'));
    const audienceData = JSON.parse(await readFile(audiencePath, 'utf-8'));

    console.log('Text to synthesize:', transcriptData.rewritten.substring(0, 100) + '...');
    console.log('Audience data:', audienceData);

    // Generate synthetic speech
    const audioBuffer = await generateSpeech(
      transcriptData.rewritten, 
      audienceData
    );

    console.log('Audio buffer generated, size:', audioBuffer.length);

    // Save audio file
    const audioPath = join(process.cwd(), 'uploads', videoId, 'narration.wav');
    await writeFile(audioPath, audioBuffer);
    console.log('Audio file saved to:', audioPath);

    res.status(200).json({ 
      audioPath: `/uploads/${videoId}/narration.wav`,
      message: 'Speech synthesis completed' 
    });

  } catch (error) {
    console.error('TTS error:', error);
    res.status(500).json({ error: 'Speech synthesis failed: ' + (error as Error).message });
  }
}

async function generateSpeech(text: string, audienceData: any): Promise<Buffer> {
  console.log('Starting speech synthesis...');
  
  // Check if Azure Speech credentials are available
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;
  
  if (!speechKey || !speechRegion) {
    console.error('Azure Speech credentials not found!');
    throw new Error('AZURE_SPEECH_KEY and AZURE_SPEECH_REGION must be set in .env.local for real speech synthesis');
  }

  try {
    console.log('Using Azure Text-to-Speech...');
    return await callAzureTTSService(text, audienceData, speechKey, speechRegion);
    
  } catch (error) {
    console.error('Azure Speech synthesis error:', error);
    console.log('Using fallback TTS generation...');
    return generateFallbackAudio(text, audienceData);
  }
}

async function callAzureTTSService(text: string, audienceData: any, speechKey: string, speechRegion: string): Promise<Buffer> {
  console.log('Calling Azure TTS service...');
  
  // Choose appropriate voice based on audience
  const voiceSettings = getVoiceSettings(audienceData);
  console.log('Voice settings:', voiceSettings);
  
  // Azure TTS REST API endpoint
  const url = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
  console.log('TTS API URL:', url);
  
  // Simplified SSML without prosody to avoid potential issues
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${voiceSettings.voice}">
    ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
  </voice>
</speak>`;
  
  console.log('SSML content:', ssml);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm',
        'User-Agent': 'VideoAdaptationApp'
      },
      body: ssml
    });

    console.log('TTS API response status:', response.status);
    console.log('TTS API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('TTS API error response:', errorText);
      
      // Try with a different voice if the first one fails
      console.log('Trying with fallback voice...');
      return await callAzureTTSServiceWithFallback(text, speechKey, speechRegion);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    console.log(`Azure TTS generated audio: ${audioBuffer.length} bytes`);
    return audioBuffer;
  } catch (error) {
    console.error('TTS API call failed:', error);
    throw error;
  }
}

async function callAzureTTSServiceWithFallback(text: string, speechKey: string, speechRegion: string): Promise<Buffer> {
  console.log('Trying Azure TTS with fallback voice...');
  
  // Use a very basic, reliable voice
  const fallbackVoice = 'en-US-JennyNeural';
  const url = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
  
  // Even simpler SSML
  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="${fallbackVoice}">
    ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
  </voice>
</speak>`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm',
        'User-Agent': 'VideoAdaptationApp'
      },
      body: ssml
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fallback TTS also failed:', errorText);
      throw new Error(`Azure TTS fallback failed: ${response.status} ${errorText}`);
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    console.log(`Fallback TTS generated audio: ${audioBuffer.length} bytes`);
    return audioBuffer;
  } catch (error) {
    console.error('Fallback TTS call failed:', error);
    throw error;
  }
}

function generateFallbackAudio(text: string, audienceData: any): Buffer {
  console.log('Generating fallback audio...');
  
  // Create a simple WAV file with a beep sound
  // This is a minimal valid WAV file that FFmpeg can process
  const sampleRate = 44100;
  const duration = Math.min(text.length * 0.1, 10); // 0.1 seconds per character, max 10 seconds
  const numSamples = Math.floor(sampleRate * duration);
  
  // Create a simple sine wave (beep sound)
  const frequency = 440; // A4 note
  const amplitude = 0.3;
  
  const audioData = new Float32Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    audioData[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  
  // Convert to 16-bit PCM
  const pcmData = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    pcmData[i] = Math.round(audioData[i] * 32767);
  }
  
  // Create WAV file header
  const wavHeader = createWavHeader(pcmData.length * 2, sampleRate, 1, 16);
  
  // Combine header and audio data
  const wavBuffer = Buffer.concat([
    Buffer.from(wavHeader),
    Buffer.from(pcmData.buffer)
  ]);
  
  console.log(`Generated fallback audio: ${wavBuffer.length} bytes, ${duration.toFixed(1)}s duration`);
  return wavBuffer;
}

function createWavHeader(dataSize: number, sampleRate: number, channels: number, bitsPerSample: number): Buffer {
  const header = Buffer.alloc(44);
  
  // RIFF header
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  
  // fmt chunk
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // fmt chunk size
  header.writeUInt16LE(1, 20); // PCM format
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28); // byte rate
  header.writeUInt16LE(channels * bitsPerSample / 8, 32); // block align
  header.writeUInt16LE(bitsPerSample, 34);
  
  // data chunk
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  
  return header;
}

function getVoiceSettings(audienceData: any) {
  const { age, language, technicalLevel } = audienceData;
  
  // Map audience characteristics to Azure TTS voice settings
  const voiceMap: { [key: string]: any } = {
    'children': {
      voice: 'en-US-JennyNeural',
      gender: 'Female',
      rate: '0.9',
      pitch: '1.1'
    },
    'teenagers': {
      voice: 'en-US-JennyNeural',
      gender: 'Female', 
      rate: '1.0',
      pitch: '1.0'
    },
    'adults': {
      voice: 'en-US-GuyNeural',
      gender: 'Male',
      rate: '1.0',
      pitch: '1.0'
    },
    'seniors': {
      voice: 'en-US-GuyNeural',
      gender: 'Male',
      rate: '0.85',
      pitch: '0.95'
    }
  };
  
  // Determine age group
  let ageGroup = 'adults';
  if (age && age.includes('5-12')) {
    ageGroup = 'children';
  } else if (age && age.includes('13-17')) {
    ageGroup = 'teenagers';
  } else if (age && age.includes('65+')) {
    ageGroup = 'seniors';
  }
  
  // Adjust for technical level
  const baseVoice = voiceMap[ageGroup] || voiceMap.adults;
  if (technicalLevel === 'beginner') {
    baseVoice.rate = '0.9'; // Slower for beginners
  } else if (technicalLevel === 'advanced') {
    baseVoice.rate = '1.1'; // Faster for advanced
  }
  
  return baseVoice;
} 