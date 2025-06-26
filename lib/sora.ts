// Azure Sora Video Generation handler (Updated to match official docs)

export interface SoraConfig {
  apiKey: string;
  endpoint: string;
  apiVersion: string;
}

export interface VideoGenerationRequest {
  prompt: string;
  width: number;
  height: number;
  n_seconds: number;
  model: string;
}

export interface VideoGenerationJob {
  object: string;
  id: string;
  status: 'queued' | 'preprocessing' | 'running' | 'processing' | 'succeeded' | 'failed' | 'cancelled';
  created_at: number;
  finished_at: number | null;
  expires_at: number | null;
  generations: Array<{
    id: string;
    object: string;
    created_at: number;
    video_url?: string;
  }>;
  prompt: string;
  model: string;
  n_variants: number;
  n_seconds: number;
  height: number;
  width: number;
  failure_reason: string | null;
}

export interface VideoGenerationResponse {
  jobId: string;
  status: VideoGenerationJob['status'];
  videoUrl?: string;
  error?: string;
}

// Get Sora configuration from environment variables
export function getSoraConfig(): SoraConfig {
  const config: SoraConfig = {
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    apiVersion: 'preview', // Sora uses 'preview' API version
  };

  if (!config.apiKey) {
    throw new Error('AZURE_OPENAI_API_KEY is required');
  }
  if (!config.endpoint) {
    throw new Error('AZURE_OPENAI_ENDPOINT is required');
  }

  return config;
}

// Create a video generation job using Azure Sora
export async function createVideoGenerationJob(
  request: VideoGenerationRequest,
  config: SoraConfig
): Promise<string> {
  const url = `${config.endpoint}/openai/v1/video/generations/jobs?api-version=${config.apiVersion}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.apiKey,
      },
      body: JSON.stringify({
        prompt: request.prompt,
        width: request.width,
        height: request.height,
        n_seconds: request.n_seconds,
        model: request.model,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sora API error: ${response.status} ${errorText}`);
    }

    const data: VideoGenerationJob = await response.json();
    return data.id;
  } catch (error) {
    console.error('Sora video generation job creation error:', error);
    throw new Error('Failed to create video generation job');
  }
}

// Check video generation job status
export async function checkVideoGenerationJobStatus(
  jobId: string,
  config: SoraConfig
): Promise<VideoGenerationJob> {
  const url = `${config.endpoint}/openai/v1/video/generations/jobs/${jobId}?api-version=${config.apiVersion}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': config.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sora API error: ${response.status} ${errorText}`);
    }

    const data: VideoGenerationJob = await response.json();
    return data;
  } catch (error) {
    console.error('Sora status check error:', error);
    throw new Error('Failed to check video generation job status');
  }
}

// Retrieve generated video content
export async function retrieveVideoContent(
  generationId: string,
  config: SoraConfig
): Promise<ArrayBuffer> {
  const url = `${config.endpoint}/openai/v1/video/generations/${generationId}/content/video?api-version=${config.apiVersion}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': config.apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Sora API error: ${response.status} ${errorText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Sora video retrieval error:', error);
    throw new Error('Failed to retrieve video content');
  }
}

// Complete video generation workflow
export async function generateVideo(
  request: VideoGenerationRequest,
  config: SoraConfig
): Promise<VideoGenerationResponse> {
  try {
    // 1. Create video generation job
    const jobId = await createVideoGenerationJob(request, config);
    console.log(`Video generation job created: ${jobId}`);

    // 2. Poll for job status
    let jobStatus: VideoGenerationJob;
    let status: VideoGenerationJob['status'];
    
    do {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
      jobStatus = await checkVideoGenerationJobStatus(jobId, config);
      status = jobStatus.status;
      console.log(`Job status: ${status}`);
    } while (!['succeeded', 'failed', 'cancelled'].includes(status));

    // 3. Handle result
    if (status === 'succeeded') {
      const generations = jobStatus.generations;
      if (generations && generations.length > 0) {
        const generationId = generations[0].id;
        const videoContent = await retrieveVideoContent(generationId, config);
        
        return {
          jobId,
          status,
          videoUrl: `data:video/mp4;base64,${Buffer.from(videoContent).toString('base64')}`,
        };
      } else {
        throw new Error('No generations found in job result');
      }
    } else {
      return {
        jobId,
        status,
        error: jobStatus.failure_reason || 'Video generation failed',
      };
    }
  } catch (error) {
    console.error('Sora video generation error:', error);
    return {
      jobId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Generate video based on transcript and audience
export async function generateAdaptedVideo(
  transcript: string,
  audienceData: {
    age: string;
    education: string;
    interests: string;
    language: string;
    technicalLevel: string;
  },
  config: SoraConfig
): Promise<VideoGenerationResponse> {
  // Create a prompt based on transcript and audience
  const prompt = createVideoPrompt(transcript, audienceData);

  const request: VideoGenerationRequest = {
    prompt,
    width: 1920,
    height: 1080,
    n_seconds: 30, // 30 seconds
    model: 'sora',
  };

  return generateVideo(request, config);
}

// Create video prompt from transcript and audience data
function createVideoPrompt(
  transcript: string,
  audienceData: {
    age: string;
    education: string;
    interests: string;
    language: string;
    technicalLevel: string;
  }
): string {
  const ageGroup = getAgeGroup(audienceData.age);
  const style = getVisualStyle(audienceData.technicalLevel, ageGroup);

  return `Create a ${style} educational video that matches this transcript: "${transcript.substring(0, 500)}...". 
  Target audience: ${ageGroup} with ${audienceData.education} education level. 
  Interests: ${audienceData.interests}. 
  Technical level: ${audienceData.technicalLevel}. 
  Make it engaging and appropriate for the audience.`;
}

function getAgeGroup(age: string): string {
  const ageNum = parseInt(age);
  if (ageNum < 13) return 'children';
  if (ageNum < 18) return 'teenagers';
  if (ageNum < 25) return 'young adults';
  if (ageNum < 65) return 'adults';
  return 'seniors';
}

function getVisualStyle(technicalLevel: string, ageGroup: string): string {
  if (ageGroup === 'children') return 'bright, colorful, animated';
  if (technicalLevel === 'beginner') return 'simple, clear, well-lit';
  if (technicalLevel === 'advanced') return 'professional, detailed, sophisticated';
  return 'modern, clean, professional';
} 