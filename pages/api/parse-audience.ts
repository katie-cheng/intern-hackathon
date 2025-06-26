import { NextApiRequest, NextApiResponse } from 'next';
import { readFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Read audience data
    const audiencePath = join(process.cwd(), 'uploads', videoId, 'audience.json');
    const audienceData = JSON.parse(await readFile(audiencePath, 'utf-8'));

    // Parse and enhance audience metadata
    const parsedAudience = await parseAudienceMetadata(audienceData);

    // Save enhanced audience data
    const enhancedPath = join(process.cwd(), 'uploads', videoId, 'audience-enhanced.json');
    await writeFile(enhancedPath, JSON.stringify(parsedAudience, null, 2));

    res.status(200).json({ 
      audience: parsedAudience,
      message: 'Audience metadata parsed successfully' 
    });

  } catch (error) {
    console.error('Audience parsing error:', error);
    res.status(500).json({ error: 'Audience parsing failed' });
  }
}

async function parseAudienceMetadata(audienceData: any) {
  // Enhance audience data with additional metadata
  const enhanced = {
    ...audienceData,
    parsedAt: new Date().toISOString(),
    languageCode: getLanguageCode(audienceData.language),
    complexityLevel: getComplexityLevel(audienceData.technicalLevel),
    targetAgeGroup: getAgeGroup(audienceData.age),
    educationLevel: getEducationLevel(audienceData.education)
  };

  return enhanced;
}

function getLanguageCode(language: string): string {
  const languageMap: { [key: string]: string } = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'zh': 'zh-CN'
  };
  return languageMap[language] || 'en-US';
}

function getComplexityLevel(level: string): string {
  const levels = ['beginner', 'intermediate', 'advanced'];
  return levels.includes(level) ? level : 'beginner';
}

function getAgeGroup(age: string): string {
  const ageNum = parseInt(age);
  if (ageNum < 13) return 'children';
  if (ageNum < 18) return 'teenagers';
  if (ageNum < 25) return 'young-adults';
  if (ageNum < 65) return 'adults';
  return 'seniors';
}

function getEducationLevel(education: string): string {
  const levels = ['high-school', 'bachelors', 'masters', 'phd'];
  return levels.includes(education) ? education : 'high-school';
}

async function writeFile(path: string, data: string) {
  const fs = await import('fs/promises');
  return fs.writeFile(path, data);
} 