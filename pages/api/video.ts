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

    // Read the video file
    const videoBuffer = await readFile(filePath);

    // Set appropriate headers for video streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Length', videoBuffer.length);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Send the video buffer
    res.status(200).send(videoBuffer);

  } catch (error) {
    console.error('Video serving error:', error);
    res.status(500).json({ error: 'Failed to serve video' });
  }
} 