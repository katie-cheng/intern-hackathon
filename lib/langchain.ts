import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { LLMChain } from 'langchain/chains';
import { ConversationChain } from 'langchain/chains';
import { BufferMemory } from 'langchain/memory';

// Initialize Azure OpenAI client
export const llm = new ChatOpenAI({
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_INSTANCE_NAME,
  temperature: 0.7,
});

// Memory for conversation context
export const memory = new BufferMemory();

// Conversation chain for maintaining context
export const conversationChain = new ConversationChain({
  llm,
  memory,
});

// Prompt template for transcript adaptation
export const transcriptAdaptationPrompt = PromptTemplate.fromTemplate(`
You are an expert at adapting educational content for different audiences.

Original transcript: {originalTranscript}

Target audience characteristics:
- Age: {age}
- Education level: {education}
- Technical level: {technicalLevel}
- Interests: {interests}
- Language: {language}

Please rewrite this transcript to be more appropriate for the target audience. Consider:
1. Vocabulary complexity
2. Sentence structure
3. Cultural references
4. Technical depth
5. Engagement level

Adapted transcript:
`);

// Chain for transcript adaptation
export const transcriptAdaptationChain = new LLMChain({
  llm,
  prompt: transcriptAdaptationPrompt,
});

// Prompt template for content analysis
export const contentAnalysisPrompt = PromptTemplate.fromTemplate(`
Analyze the following content and provide insights for adaptation:

Content: {content}

Please provide:
1. Key topics and concepts
2. Complexity level assessment
3. Cultural references
4. Technical terminology
5. Suggested adaptations for {targetAudience}

Analysis:
`);

// Chain for content analysis
export const contentAnalysisChain = new LLMChain({
  llm,
  prompt: contentAnalysisPrompt,
});

// Function to adapt transcript for specific audience
export async function adaptTranscript(
  originalTranscript: string,
  audienceData: {
    age: string;
    education: string;
    technicalLevel: string;
    interests: string;
    language: string;
  }
): Promise<string> {
  try {
    const result = await transcriptAdaptationChain.call({
      originalTranscript,
      ...audienceData,
    });

    return result.text;
  } catch (error) {
    console.error('Error adapting transcript:', error);
    throw new Error('Failed to adapt transcript');
  }
}

// Function to analyze content
export async function analyzeContent(
  content: string,
  targetAudience: string
): Promise<string> {
  try {
    const result = await contentAnalysisChain.call({
      content,
      targetAudience,
    });

    return result.text;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw new Error('Failed to analyze content');
  }
} 