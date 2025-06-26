// Azure OpenAI configuration and utilities
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

export interface AzureOpenAIConfig {
  apiKey: string;
  apiVersion: string;
  deploymentName: string;
  instanceName: string;
  endpoint: string;
}

// Get Azure OpenAI configuration from environment variables
export function getAzureOpenAIConfig(): AzureOpenAIConfig {
  const config: AzureOpenAIConfig = {
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2023-05-15',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || '',
    instanceName: process.env.AZURE_OPENAI_INSTANCE_NAME || '',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
  };

  // Validate required fields
  if (!config.apiKey) {
    throw new Error('AZURE_OPENAI_API_KEY is required');
  }
  if (!config.deploymentName) {
    throw new Error('AZURE_OPENAI_DEPLOYMENT_NAME is required');
  }
  if (!config.instanceName) {
    throw new Error('AZURE_OPENAI_INSTANCE_NAME is required');
  }

  return config;
}

// Azure OpenAI API wrapper for chat completions
export async function azureOpenAIChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  config: AzureOpenAIConfig,
  options: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  } = {}
) {
  const url = `https://${config.instanceName}.openai.azure.com/openai/deployments/${config.deploymentName}/chat/completions?api-version=${config.apiVersion}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      top_p: options.topP || 1,
      frequency_penalty: options.frequencyPenalty || 0,
      presence_penalty: options.presencePenalty || 0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// Azure OpenAI API wrapper for text completions
export async function azureOpenAITextCompletion(
  prompt: string,
  config: AzureOpenAIConfig,
  options: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
  } = {}
) {
  const url = `https://${config.instanceName}.openai.azure.com/openai/deployments/${config.deploymentName}/completions?api-version=${config.apiVersion}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': config.apiKey,
    },
    body: JSON.stringify({
      prompt,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      top_p: options.topP || 1,
      frequency_penalty: options.frequencyPenalty || 0,
      presence_penalty: options.presencePenalty || 0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Azure OpenAI API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].text;
}

// Utility function to create system message
export function createSystemMessage(content: string): { role: 'system'; content: string } {
  return { role: 'system', content };
}

// Utility function to create user message
export function createUserMessage(content: string): { role: 'user'; content: string } {
  return { role: 'user', content };
}

// Utility function to create assistant message
export function createAssistantMessage(content: string): { role: 'assistant'; content: string } {
  return { role: 'assistant', content };
} 