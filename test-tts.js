require('dotenv').config({ path: '.env.local' });

async function testAzureTTS() {
  console.log('=== AZURE TTS TEST ===');
  
  const speechKey = process.env.AZURE_SPEECH_KEY;
  const speechRegion = process.env.AZURE_SPEECH_REGION;
  
  if (!speechKey || !speechRegion) {
    console.error('❌ Missing Azure Speech credentials in .env.local');
    return;
  }
  
  console.log('✓ Azure Speech credentials found');
  console.log('Region:', speechRegion);
  
  const testText = "Hello! This is a test of Azure Text-to-Speech.";
  const url = `https://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
  
  // Test 1: Simple SSML
  console.log('\n🧪 Test 1: Simple SSML');
  const simpleSSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-JennyNeural">
    ${testText}
  </voice>
</speak>`;
  
  try {
    const response1 = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm',
        'User-Agent': 'VideoAdaptationApp'
      },
      body: simpleSSML
    });
    
    console.log('Response status:', response1.status);
    console.log('Response headers:', Object.fromEntries(response1.headers.entries()));
    
    if (response1.ok) {
      const audioBuffer = Buffer.from(await response1.arrayBuffer());
      console.log('✅ Simple SSML works! Audio size:', audioBuffer.length, 'bytes');
    } else {
      const errorText = await response1.text();
      console.log('❌ Simple SSML failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Simple SSML error:', error.message);
  }
  
  // Test 2: Even simpler SSML
  console.log('\n🧪 Test 2: Minimal SSML');
  const minimalSSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-JennyNeural">Hello world.</voice>
</speak>`;
  
  try {
    const response2 = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm'
      },
      body: minimalSSML
    });
    
    console.log('Response status:', response2.status);
    
    if (response2.ok) {
      const audioBuffer = Buffer.from(await response2.arrayBuffer());
      console.log('✅ Minimal SSML works! Audio size:', audioBuffer.length, 'bytes');
    } else {
      const errorText = await response2.text();
      console.log('❌ Minimal SSML failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Minimal SSML error:', error.message);
  }
  
  // Test 3: Different voice
  console.log('\n🧪 Test 3: Different voice');
  const guySSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-GuyNeural">Hello world.</voice>
</speak>`;
  
  try {
    const response3 = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': speechKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'riff-16khz-16bit-mono-pcm'
      },
      body: guySSML
    });
    
    console.log('Response status:', response3.status);
    
    if (response3.ok) {
      const audioBuffer = Buffer.from(await response3.arrayBuffer());
      console.log('✅ Guy voice works! Audio size:', audioBuffer.length, 'bytes');
    } else {
      const errorText = await response3.text();
      console.log('❌ Guy voice failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Guy voice error:', error.message);
  }
}

testAzureTTS().catch(console.error); 