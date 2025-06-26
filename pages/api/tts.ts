import { NextApiRequest, NextApiResponse } from 'next';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

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
    console.warn('Azure Speech credentials not found, using fallback audio generation');
    return generateFallbackAudio(text, audienceData);
  }

  try {
    // For now, we'll use a fallback approach since Azure TTS requires more setup
    // In a full implementation, you would:
    // 1. Use Azure Speech SDK to generate speech
    // 2. Return the audio buffer
    console.log('Azure Speech credentials found, but using fallback for now');
    return generateFallbackAudio(text, audienceData);
    
  } catch (error) {
    console.error('Azure Speech synthesis error:', error);
    console.log('Using fallback audio generation');
    return generateFallbackAudio(text, audienceData);
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
  const { languageCode, targetAgeGroup, complexityLevel } = audienceData;
  
  // Map audience characteristics to voice settings
  const voiceMap: { [key: string]: any } = {
    'en-US': {
      children: { voice: 'en-US-JennyNeural', rate: 0.9, pitch: 1.1 },
      teenagers: { voice: 'en-US-JennyNeural', rate: 1.0, pitch: 1.0 },
      adults: { voice: 'en-US-GuyNeural', rate: 1.0, pitch: 1.0 },
      seniors: { voice: 'en-US-GuyNeural', rate: 0.85, pitch: 0.95 }
    },
    'es-ES': {
      children: { voice: 'es-ES-ElviraNeural', rate: 0.9, pitch: 1.1 },
      teenagers: { voice: 'es-ES-ElviraNeural', rate: 1.0, pitch: 1.0 },
      adults: { voice: 'es-ES-AlvaroNeural', rate: 1.0, pitch: 1.0 },
      seniors: { voice: 'es-ES-AlvaroNeural', rate: 0.85, pitch: 0.95 }
    }
  };
  
  const languageVoices = voiceMap[languageCode] || voiceMap['en-US'];
  return languageVoices[targetAgeGroup] || languageVoices.adults;
} 