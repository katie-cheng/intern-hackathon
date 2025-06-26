import { NextApiRequest, NextApiResponse } from 'next';
import { readFile, access } from 'fs/promises';
import { join } from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== RESULT API STARTED ===');
  console.log('Query parameters:', req.query);

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      console.error('Invalid video ID:', id);
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log('Video ID:', id);

    // Read all result files
    const basePath = join(process.cwd(), 'uploads', id);
    console.log('Base path:', basePath);
    
    // Check if directory exists
    try {
      await access(basePath);
      console.log('✓ Upload directory exists');
    } catch (error) {
      console.error('✗ Upload directory does not exist:', basePath);
      return res.status(404).json({ error: 'Video not found' });
    }

    // List all files in the directory
    const { readdir } = await import('fs/promises');
    const files = await readdir(basePath);
    console.log('Files in directory:', files);

    // Check for required files
    const requiredFiles = [
      'audience-enhanced.json',
      'transcript-rewritten.json',
      'adapted-video.mp4'
    ];

    console.log('=== CHECKING REQUIRED FILES ===');
    for (const file of requiredFiles) {
      const filePath = join(basePath, file);
      try {
        await access(filePath);
        console.log(`✓ ${file} exists`);
      } catch (error) {
        console.error(`✗ ${file} missing:`, filePath);
      }
    }

    // Try to read audience data
    console.log('=== READING AUDIENCE DATA ===');
    let audienceData;
    try {
      const audiencePath = join(basePath, 'audience-enhanced.json');
      const audienceContent = await readFile(audiencePath, 'utf-8');
      audienceData = JSON.parse(audienceContent);
      console.log('✓ Audience data loaded:', audienceData);
    } catch (error) {
      console.error('✗ Failed to read audience data:', error);
      // Try fallback to original audience.json
      try {
        const fallbackPath = join(basePath, 'audience.json');
        const fallbackContent = await readFile(fallbackPath, 'utf-8');
        audienceData = JSON.parse(fallbackContent);
        console.log('✓ Fallback audience data loaded:', audienceData);
      } catch (fallbackError) {
        console.error('✗ Fallback audience data also failed:', fallbackError);
        return res.status(500).json({ error: 'Failed to read audience data' });
      }
    }
    
    // Try to read transcript data
    console.log('=== READING TRANSCRIPT DATA ===');
    let transcriptData;
    try {
      const transcriptPath = join(basePath, 'transcript-rewritten.json');
      const transcriptContent = await readFile(transcriptPath, 'utf-8');
      transcriptData = JSON.parse(transcriptContent);
      console.log('✓ Transcript data loaded:', transcriptData);
    } catch (error) {
      console.error('✗ Failed to read transcript data:', error);
      return res.status(500).json({ error: 'Failed to read transcript data' });
    }

    // Check if adapted video exists
    console.log('=== CHECKING ADAPTED VIDEO ===');
    const adaptedVideoPath = join(basePath, 'adapted-video.mp4');
    try {
      await access(adaptedVideoPath);
      console.log('✓ Adapted video exists');
    } catch (error) {
      console.error('✗ Adapted video missing:', adaptedVideoPath);
      return res.status(500).json({ error: 'Adapted video not found' });
    }

    // Calculate processing time (placeholder)
    const processingTime = 45; // seconds

    const result = {
      originalVideo: `/api/video?videoId=${id}&filename=video.mp4`,
      adaptedVideo: `/api/video?videoId=${id}&filename=adapted-video.mp4`,
      originalTranscript: transcriptData.original,
      adaptedTranscript: transcriptData.rewritten,
      audience: {
        age: audienceData.age,
        education: audienceData.education,
        interests: audienceData.interests,
        language: audienceData.language,
        technicalLevel: audienceData.technicalLevel
      },
      processingTime
    };

    console.log('=== RESULT PREPARED SUCCESSFULLY ===');
    console.log('Result structure:', Object.keys(result));

    res.status(200).json(result);

  } catch (error) {
    console.error('Result fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch result' });
  }
} 