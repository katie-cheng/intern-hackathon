import { NextApiRequest, NextApiResponse } from 'next';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import ffmpeg from 'fluent-ffmpeg';

interface VideoSegment {
  id: number;
  startTime: number;
  endTime: number | null;
  duration: number | null;
  sentences: string[];
  content: string;
  needsAdaptation: boolean;
  filePath?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== VIDEO SEGMENTATION API STARTED ===');

  try {
    const { videoId, maxSegmentDuration = 10 } = req.body; // Default 10 seconds

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log('Segmenting video ID:', videoId, 'Max segment duration:', maxSegmentDuration);

    const videoPath = join(process.cwd(), 'uploads', videoId, 'video.mp4');
    const transcriptPath = join(process.cwd(), 'uploads', videoId, 'transcript.json');
    
    // Read transcript to identify key moments
    const transcriptData = JSON.parse(await readFile(transcriptPath, 'utf-8'));
    
    // Analyze transcript and create segments
    const segments = await analyzeTranscriptAndCreateSegments(
      transcriptData.text, 
      videoPath, 
      videoId, 
      maxSegmentDuration
    );

    // Save segment information
    const segmentsPath = join(process.cwd(), 'uploads', videoId, 'segments.json');
    await writeFile(segmentsPath, JSON.stringify(segments, null, 2));

    console.log('Video segmentation completed, segments:', segments.length);

    res.status(200).json({ 
      segments,
      message: 'Video segmentation completed' 
    });

  } catch (error) {
    console.error('Video segmentation error:', error);
    res.status(500).json({ error: 'Video segmentation failed: ' + (error as Error).message });
  }
}

async function analyzeTranscriptAndCreateSegments(
  transcript: string, 
  videoPath: string, 
  videoId: string, 
  maxDuration: number
): Promise<VideoSegment[]> {
  console.log('Analyzing transcript for segmentation...');
  
  // Split transcript into sentences
  const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Estimate timing (rough approximation: 150 words per minute)
  const wordsPerMinute = 150;
  const words = transcript.split(/\s+/).length;
  const totalDuration = (words / wordsPerMinute) * 60; // seconds
  
  console.log(`Estimated total duration: ${totalDuration.toFixed(1)}s`);
  
  // Create segments based on content and timing
  const segments: VideoSegment[] = [];
  let currentTime = 0;
  let segmentIndex = 0;
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (!sentence) continue;
    
    // Estimate sentence duration
    const sentenceWords = sentence.split(/\s+/).length;
    const sentenceDuration = (sentenceWords / wordsPerMinute) * 60;
    
    // Check if we need to start a new segment
    if (currentTime + sentenceDuration > maxDuration && segments.length > 0) {
      // Finalize current segment
      const lastSegment = segments[segments.length - 1];
      lastSegment.endTime = currentTime;
      lastSegment.duration = currentTime - lastSegment.startTime;
      
      // Start new segment
      currentTime = 0;
      segmentIndex++;
    }
    
    // Add sentence to current segment
    if (segments.length === 0 || currentTime === 0) {
      segments.push({
        id: segmentIndex,
        startTime: currentTime,
        endTime: null,
        duration: null,
        sentences: [],
        content: '',
        needsAdaptation: false
      });
    }
    
    const currentSegment = segments[segments.length - 1];
    currentSegment.sentences.push(sentence);
    currentSegment.content += sentence + '. ';
    currentTime += sentenceDuration;
  }
  
  // Finalize last segment
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    lastSegment.endTime = currentTime;
    lastSegment.duration = currentTime - lastSegment.startTime;
  }
  
  // Extract video segments using FFmpeg
  for (const segment of segments) {
    await extractVideoSegment(videoPath, videoId, segment);
    
    // Determine if segment needs adaptation based on content
    segment.needsAdaptation = shouldAdaptSegment(segment.content);
  }
  
  return segments;
}

async function extractVideoSegment(
  videoPath: string, 
  videoId: string, 
  segment: VideoSegment
): Promise<void> {
  const segmentPath = join(process.cwd(), 'uploads', videoId, `segment-${segment.id}.mp4`);
  
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .outputOptions([
        '-ss', segment.startTime.toString(),  // Start time
        '-t', (segment.duration || 0).toString(),    // Duration
        '-c', 'copy'                          // Copy without re-encoding
      ])
      .output(segmentPath)
      .on('start', (commandLine) => {
        console.log(`Extracting segment ${segment.id}:`, commandLine);
      })
      .on('end', () => {
        console.log(`Segment ${segment.id} extracted successfully`);
        segment.filePath = segmentPath;
        resolve();
      })
      .on('error', (err) => {
        console.error(`Error extracting segment ${segment.id}:`, err);
        reject(err);
      })
      .run();
  });
}

function shouldAdaptSegment(content: string): boolean {
  // Simple heuristics to determine if segment needs adaptation
  const adaptationKeywords = [
    'complex', 'difficult', 'advanced', 'technical', 'sophisticated',
    'complicated', 'challenging', 'intricate', 'elaborate'
  ];
  
  const contentLower = content.toLowerCase();
  const keywordCount = adaptationKeywords.filter(keyword => 
    contentLower.includes(keyword)
  ).length;
  
  // Adapt if more than 2 adaptation keywords are found
  return keywordCount > 2;
} 