import { NextApiRequest, NextApiResponse } from 'next';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { getAzureOpenAIConfig, azureOpenAIChatCompletion } from '../../lib/azureOpenAI';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('=== REWRITE API STARTED ===');

  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    console.log('Rewriting transcript for video ID:', videoId);

    // Read transcript and audience data
    const transcriptPath = join(process.cwd(), 'uploads', videoId, 'transcript.json');
    const audiencePath = join(process.cwd(), 'uploads', videoId, 'audience-enhanced.json');
    
    console.log('Reading transcript from:', transcriptPath);
    console.log('Reading audience data from:', audiencePath);
    
    const transcriptData = JSON.parse(await readFile(transcriptPath, 'utf-8'));
    const audienceData = JSON.parse(await readFile(audiencePath, 'utf-8'));

    console.log('Original transcript:', transcriptData.text.substring(0, 100) + '...');
    console.log('Audience data:', audienceData);

    // Analyze and rewrite transcript
    const rewrittenTranscript = await rewriteTranscript(
      transcriptData.text, 
      audienceData
    );

    console.log('Rewritten transcript:', rewrittenTranscript.substring(0, 100) + '...');

    // Save rewritten transcript
    const rewrittenPath = join(process.cwd(), 'uploads', videoId, 'transcript-rewritten.json');
    const rewrittenData = {
      original: transcriptData.text,
      rewritten: rewrittenTranscript,
      timestamp: new Date().toISOString(),
      videoId: videoId
    };
    
    await writeFile(rewrittenPath, JSON.stringify(rewrittenData, null, 2));
    console.log('Rewritten transcript saved to:', rewrittenPath);

    res.status(200).json({ 
      original: transcriptData.text,
      rewritten: rewrittenTranscript,
      message: 'Transcript rewritten successfully' 
    });

  } catch (error) {
    console.error('Rewrite error:', error);
    res.status(500).json({ error: 'Transcript rewriting failed: ' + (error as Error).message });
  }
}

async function rewriteTranscript(originalText: string, audienceData: any): Promise<string> {
  console.log('Starting transcript rewriting with Azure OpenAI...');
  
  try {
    const config = getAzureOpenAIConfig();
    
    // Create a prompt for rewriting the transcript
    const systemPrompt = `You are an expert content adaptor. Your task is to rewrite video transcripts to match specific audience characteristics while maintaining the core message and meaning.

Key adaptation principles:
- Adjust vocabulary complexity based on education level
- Modify content relevance based on interests
- Consider age-appropriate language and concepts
- Maintain the original structure and flow
- Keep the same length and pacing

Current audience profile:
- Age: ${audienceData.age || 'general'}
- Education: ${audienceData.education || 'general'}
- Interests: ${audienceData.interests || 'general'}
- Technical Level: ${audienceData.technicalLevel || 'beginner'}
- Language: ${audienceData.language || 'English'}

Please rewrite the following transcript to better suit this audience:`;

    const userPrompt = `Original transcript:
"${originalText}"

Please provide only the rewritten transcript without any additional commentary or explanations.`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    console.log('Sending request to Azure OpenAI...');
    const rewrittenText = await azureOpenAIChatCompletion(messages, config, {
      temperature: 0.7,
      maxTokens: 2000
    });

    console.log('Azure OpenAI response received');
    return rewrittenText.trim();

  } catch (error) {
    console.error('Azure OpenAI rewrite error:', error);
    
    // Fallback to placeholder rewriting if Azure OpenAI fails
    console.log('Using fallback placeholder rewriting');
    return createFallbackRewrite(originalText, audienceData);
  }
}

function createFallbackRewrite(originalText: string, audienceData: any): string {
  console.log('Creating fallback rewrite...');
  
  let rewrittenText = originalText;
  
  // Simple text adaptation based on audience characteristics
  if (audienceData.technicalLevel === 'beginner') {
    rewrittenText = rewrittenText
      .replace(/complex/g, 'simple')
      .replace(/difficult/g, 'easy')
      .replace(/advanced/g, 'basic')
      .replace(/sophisticated/g, 'straightforward');
  } else if (audienceData.technicalLevel === 'advanced') {
    rewrittenText = rewrittenText
      .replace(/simple/g, 'sophisticated')
      .replace(/basic/g, 'advanced')
      .replace(/easy/g, 'comprehensive')
      .replace(/straightforward/g, 'nuanced');
  }
  
  if (audienceData.age && audienceData.age.includes('5-12')) {
    rewrittenText = rewrittenText
      .replace(/difficult/g, 'challenging')
      .replace(/problem/g, 'puzzle')
      .replace(/issue/g, 'situation')
      .replace(/complicated/g, 'tricky');
  }
  
  if (audienceData.interests && audienceData.interests.includes('sports')) {
    rewrittenText = rewrittenText
      .replace(/process/g, 'game plan')
      .replace(/strategy/g, 'play')
      .replace(/goal/g, 'target')
      .replace(/achieve/g, 'score');
  }
  
  return rewrittenText;
} 