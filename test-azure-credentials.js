const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function testAzureCredentials() {
  console.log('=== AZURE CREDENTIALS TEST ===\n');
  
  // Check environment variables
  console.log('1. Checking environment variables...');
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;
  const openaiKey = process.env.AZURE_OPENAI_API_KEY;
  const openaiEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  
  console.log('AZURE_SPEECH_KEY:', speechKey ? '✓ Set' : '✗ Missing');
  console.log('AZURE_SPEECH_REGION:', speechRegion ? '✓ Set' : '✗ Missing');
  console.log('AZURE_OPENAI_API_KEY:', openaiKey ? '✓ Set' : '✗ Missing');
  console.log('AZURE_OPENAI_ENDPOINT:', openaiEndpoint ? '✓ Set' : '✗ Missing');
  
  if (!speechKey || !speechRegion) {
    console.log('\n❌ Azure Speech credentials are missing!');
    console.log('Please update your .env.local file with real Azure Speech credentials.');
    console.log('You can get these from the Azure portal: https://portal.azure.com');
    return;
  }
  
  // Test Azure Speech API connectivity
  console.log('\n2. Testing Azure Speech API connectivity...');
  try {
    const response = await fetch(`https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm'
      },
      body: '<speak version="1.0" xml:lang="en-US"><voice xml:lang="en-US" name="en-US-JennyNeural">Hello, this is a test.</voice></speak>'
    });
    
    if (response.ok) {
      console.log('✓ Azure Speech TTS API is working');
    } else {
      console.log(`✗ Azure Speech TTS API error: ${response.status}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.log('✗ Azure Speech TTS API connection failed:', error.message);
  }
  
  // Test Azure Speech STT API
  console.log('\n3. Testing Azure Speech STT API...');
  try {
    // Create a simple test audio file (1 second of silence)
    const testAudioPath = './test-audio.wav';
    const audioBuffer = createTestWavFile();
    fs.writeFileSync(testAudioPath, audioBuffer);
    
    const response = await fetch(`https://${speechRegion}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=en-US`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'audio/wav'
      },
      body: audioBuffer
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✓ Azure Speech STT API is working');
      console.log('STT test result:', result);
    } else {
      console.log(`✗ Azure Speech STT API error: ${response.status}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
    
    // Clean up test file
    fs.unlinkSync(testAudioPath);
  } catch (error) {
    console.log('✗ Azure Speech STT API connection failed:', error.message);
  }
  
  console.log('\n=== CREDENTIALS TEST COMPLETED ===');
}

function createTestWavFile() {
  // Create a minimal valid WAV file (1 second of silence)
  const sampleRate = 16000;
  const duration = 1;
  const numSamples = sampleRate * duration;
  
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + numSamples * 2, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(numSamples * 2, 40);
  
  const audioData = Buffer.alloc(numSamples * 2, 0); // Silent audio
  return Buffer.concat([header, audioData]);
}

testAzureCredentials().catch(console.error); 