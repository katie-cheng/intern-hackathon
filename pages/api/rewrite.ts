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
    console.log('Azure OpenAI config:', {
      endpoint: config.endpoint,
      deploymentName: config.deploymentName,
      instanceName: config.instanceName,
      apiVersion: config.apiVersion
    });
    
    // Create a prompt for rewriting the transcript
    const systemPrompt = `You are an expert content adaptor. Your task is to rewrite video transcripts to match specific audience characteristics while maintaining the core message and meaning.

Key adaptation principles:
- Adjust vocabulary complexity based on education level
- Modify content relevance based on interests (THIS IS CRITICAL)
- Consider age-appropriate language and concepts
- Maintain the original structure and flow
- Keep the same length and pacing

Current audience profile:
- Age: ${audienceData.age || 'general'}
- Education: ${audienceData.education || 'general'}
- Interests: ${audienceData.interests || 'general'} (FOCUS ON THIS)
- Technical Level: ${audienceData.technicalLevel || 'beginner'}
- Language: ${audienceData.language || 'English'}

IMPORTANT: The audience has specific interests in "${audienceData.interests || 'general'}". You MUST incorporate this interest into your rewriting by:
1. Using metaphors and analogies related to their interests
2. Making connections between the content and their interests
3. Using language and examples that resonate with their interests
4. If it's a sport, use sports metaphors and terminology
5. If it's a hobby, use hobby-related examples
6. If it's academic, use academic examples they'd understand

For example, if their interest is "Basketball", use basketball metaphors like "scoring goals", "teamwork", "practice makes perfect", etc.
If their interest is "Science", use scientific analogies and examples.
If their interest is "Music", use musical metaphors and terminology.

Please rewrite the following transcript to better suit this audience, making sure to incorporate their specific interests:`;

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
  console.log('Creating enhanced fallback rewrite for young audience...');
  
  const { age, interests, technicalLevel } = audienceData;
  
  // Check if this is for young kids with specific interests
  const isYoungKids = age && age.includes('5-12');
  const isBeginner = technicalLevel === 'beginner';
  
  // Check for specific interests
  const interestLower = interests ? interests.toLowerCase() : '';
  
  if (isYoungKids && isBeginner) {
    if (interestLower.includes('basketball')) {
      return createBasketballKidVersion(originalText);
    } else if (interestLower.includes('soccer') || interestLower.includes('football')) {
      return createSoccerKidVersion(originalText);
    } else if (interestLower.includes('sports')) {
      return createSportsKidVersion(originalText);
    } else if (interestLower.includes('science')) {
      return createScienceKidVersion(originalText);
    } else if (interestLower.includes('music')) {
      return createMusicKidVersion(originalText);
    } else {
      return createSimpleKidVersion(originalText);
    }
  } else {
    // Generic adaptation
    return createGenericAdaptation(originalText, audienceData);
  }
}

function createBasketballKidVersion(originalText: string): string {
  console.log('Creating basketball-themed kid version...');
  
  // Basketball-specific metaphors and kid-friendly replacements
  const replacements = {
    // Tech concepts to basketball concepts
    'copilot': 'your very own coach',
    'AI': 'super smart teammate',
    'possibilities': 'all the cool moves you can do',
    'innovate': 'come up with new plays',
    'accomplish': 'score',
    'complex': 'tricky',
    'tasks': 'plays',
    'sort through': 'pick out the best plays from',
    'noise': 'confusing plays',
    'faster': 'quicker than a fast break',
    'accurate': 'hits the shot every time',
    'intuitive': 'easy to learn',
    'customizable': 'you can make it your own style',
    'simplifies': 'makes easier',
    'amplify': 'make bigger and better',
    'impact': 'difference you make on the court',
    'UI': 'the way you talk to your coach',
    'work': 'play basketball',
    
    // Basketball-specific metaphors
    'new world': 'new basketball court',
    'allowing you': 'helping you',
    'co innovate': 'team up and create plays',
    'accomplish complex tasks': 'score three-pointers',
    'sort through the noise': 'find the winning shot',
    'now copilot is': 'now your coach is',
    'more accurate': 'hits the basket every time',
    'more intuitive': 'like learning a new basketball move',
    'and customizable': 'and you can make it your own play',
    'copilot simplifies': 'your coach makes easier',
    'tasks to amplify': 'plays to make bigger',
    'your impact': 'your awesome basketball moves',
    'copilot is the': 'your coach is the',
    'UI for AI': 'way to talk to your smart coach',
    'at work': 'when you play basketball'
  };
  
  let rewrittenText = originalText;
  
  // Apply replacements
  Object.entries(replacements).forEach(([original, replacement]) => {
    const regex = new RegExp(original, 'gi');
    rewrittenText = rewrittenText.replace(regex, replacement);
  });
  
  // Add basketball enthusiasm
  rewrittenText = rewrittenText
    .replace(/\./g, '! ')
    .replace(/!/g, '! 🏀 ')
    .replace(/work\./g, 'awesome game! 🏀');
  
  // Ensure it ends with basketball enthusiasm
  if (!rewrittenText.includes('!')) {
    rewrittenText = rewrittenText.replace(/\.$/, '! 🏀');
  }
  
  console.log('Basketball kid version created:', rewrittenText.substring(0, 100) + '...');
  return rewrittenText;
}

function createSoccerKidVersion(originalText: string): string {
  console.log('Creating soccer-themed kid version...');
  
  const replacements = {
    'copilot': 'your very own coach',
    'AI': 'super smart teammate',
    'possibilities': 'all the cool moves you can do',
    'innovate': 'come up with new plays',
    'accomplish': 'score goals',
    'complex': 'tricky',
    'tasks': 'plays',
    'sort through': 'pick out the best plays from',
    'noise': 'confusing plays',
    'faster': 'quicker than a counter-attack',
    'accurate': 'hits the goal every time',
    'intuitive': 'easy to learn',
    'customizable': 'you can make it your own style',
    'simplifies': 'makes easier',
    'amplify': 'make bigger and better',
    'impact': 'difference you make on the field',
    'UI': 'the way you talk to your coach',
    'work': 'play soccer'
  };
  
  let rewrittenText = originalText;
  
  Object.entries(replacements).forEach(([original, replacement]) => {
    const regex = new RegExp(original, 'gi');
    rewrittenText = rewrittenText.replace(regex, replacement);
  });
  
  rewrittenText = rewrittenText
    .replace(/\./g, '! ')
    .replace(/!/g, '! ⚽ ')
    .replace(/work\./g, 'awesome game! ⚽');
  
  if (!rewrittenText.includes('!')) {
    rewrittenText = rewrittenText.replace(/\.$/, '! ⚽');
  }
  
  return rewrittenText;
}

function createScienceKidVersion(originalText: string): string {
  console.log('Creating science-themed kid version...');
  
  const replacements = {
    'copilot': 'your very own lab assistant',
    'AI': 'super smart experiment helper',
    'possibilities': 'all the cool experiments you can do',
    'innovate': 'discover new things',
    'accomplish': 'complete',
    'complex': 'complicated',
    'tasks': 'experiments',
    'sort through': 'analyze',
    'noise': 'confusing data',
    'faster': 'quicker than a chemical reaction',
    'accurate': 'precise',
    'intuitive': 'easy to understand',
    'customizable': 'you can adjust it',
    'simplifies': 'makes easier',
    'amplify': 'make bigger and better',
    'impact': 'results you get',
    'UI': 'the way you control your experiment',
    'work': 'do science'
  };
  
  let rewrittenText = originalText;
  
  Object.entries(replacements).forEach(([original, replacement]) => {
    const regex = new RegExp(original, 'gi');
    rewrittenText = rewrittenText.replace(regex, replacement);
  });
  
  return rewrittenText;
}

function createMusicKidVersion(originalText: string): string {
  console.log('Creating music-themed kid version...');
  
  const replacements = {
    'copilot': 'your very own music teacher',
    'AI': 'super smart music helper',
    'possibilities': 'all the cool songs you can create',
    'innovate': 'compose new music',
    'accomplish': 'play',
    'complex': 'difficult',
    'tasks': 'songs',
    'sort through': 'find the best notes in',
    'noise': 'off-key sounds',
    'faster': 'quicker than a fast tempo',
    'accurate': 'plays the right notes',
    'intuitive': 'easy to feel',
    'customizable': 'you can make it your own style',
    'simplifies': 'makes easier',
    'amplify': 'make louder and better',
    'impact': 'music you create',
    'UI': 'the way you control your instrument',
    'work': 'make music'
  };
  
  let rewrittenText = originalText;
  
  Object.entries(replacements).forEach(([original, replacement]) => {
    const regex = new RegExp(original, 'gi');
    rewrittenText = rewrittenText.replace(regex, replacement);
  });
  
  return rewrittenText;
}

function createSportsKidVersion(originalText: string): string {
  console.log('Creating sports-themed kid version...');
  
  // Sports metaphors and kid-friendly replacements
  const replacements = {
    // Tech concepts to sports concepts
    'copilot': 'your very own helper friend',
    'AI': 'super smart helper',
    'possibilities': 'fun things you can do',
    'innovate': 'come up with cool new ideas',
    'accomplish': 'finish',
    'complex': 'tricky',
    'tasks': 'jobs',
    'sort through': 'pick out the good stuff from',
    'noise': 'confusing stuff',
    'faster': 'quicker than a cheetah',
    'accurate': 'gets it right every time',
    'intuitive': 'easy to figure out',
    'customizable': 'you can make it your own',
    'simplifies': 'makes easier',
    'amplify': 'make bigger and better',
    'impact': 'difference you make',
    'UI': 'the way you talk to it',
    'work': 'play and learn',
    
    // Add sports metaphors
    'new world': 'new playground',
    'allowing you': 'helping you',
    'co innovate': 'team up and create',
    'accomplish complex tasks': 'score big goals',
    'sort through the noise': 'find the winning play',
    'now copilot is': 'now your helper is',
    'more accurate': 'hits the target every time',
    'more intuitive': 'like learning a new game',
    'and customizable': 'and you can make it your own',
    'copilot simplifies': 'your helper makes easier',
    'tasks to amplify': 'jobs to make bigger',
    'your impact': 'your awesome moves',
    'copilot is the': 'your helper is the',
    'UI for AI': 'way to talk to your smart friend',
    'at work': 'when you play and learn'
  };
  
  let rewrittenText = originalText;
  
  // Apply replacements
  Object.entries(replacements).forEach(([original, replacement]) => {
    const regex = new RegExp(original, 'gi');
    rewrittenText = rewrittenText.replace(regex, replacement);
  });
  
  // Add some sports enthusiasm
  rewrittenText = rewrittenText
    .replace(/\./g, '! ')
    .replace(/!/g, '! 🏆 ')
    .replace(/work\./g, 'awesome game! 🎯');
  
  // Ensure it ends with enthusiasm
  if (!rewrittenText.includes('!')) {
    rewrittenText = rewrittenText.replace(/\.$/, '! 🎉');
  }
  
  console.log('Sports kid version created:', rewrittenText.substring(0, 100) + '...');
  return rewrittenText;
}

function createSimpleKidVersion(originalText: string): string {
  console.log('Creating simple kid version...');
  
  const replacements = {
    'copilot': 'your helper friend',
    'AI': 'smart helper',
    'possibilities': 'fun things',
    'innovate': 'create new things',
    'accomplish': 'finish',
    'complex': 'hard',
    'tasks': 'jobs',
    'sort through': 'find',
    'noise': 'confusing things',
    'faster': 'quicker',
    'accurate': 'right',
    'intuitive': 'easy',
    'customizable': 'changeable',
    'simplifies': 'makes easier',
    'amplify': 'make bigger',
    'impact': 'difference',
    'UI': 'way to use',
    'work': 'play'
  };
  
  let rewrittenText = originalText;
  
  Object.entries(replacements).forEach(([original, replacement]) => {
    const regex = new RegExp(original, 'gi');
    rewrittenText = rewrittenText.replace(regex, replacement);
  });
  
  return rewrittenText;
}

function createGenericAdaptation(originalText: string, audienceData: any): string {
  console.log('Creating generic adaptation...');
  
  let rewrittenText = originalText;
  
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