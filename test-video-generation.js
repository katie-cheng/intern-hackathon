const fs = require('fs').promises;
const path = require('path');

async function testVideoGeneration() {
  console.log('=== VIDEO GENERATION DIAGNOSTIC TEST ===\n');
  
  // Test with a recent video ID from your uploads
  const testVideoId = 'b235c32e-f1d6-4703-ae56-16fe4cf451f7';
  const uploadsPath = path.join(process.cwd(), 'uploads');
  
  console.log('1. Checking uploads directory structure...');
  try {
    const uploads = await fs.readdir(uploadsPath);
    console.log(`✓ Uploads directory exists with ${uploads.length} items:`, uploads);
    
    if (uploads.includes(testVideoId)) {
      console.log(`✓ Test video directory found: ${testVideoId}`);
    } else {
      console.log(`✗ Test video directory not found: ${testVideoId}`);
      console.log('Available video IDs:', uploads);
      return;
    }
  } catch (error) {
    console.error('✗ Error accessing uploads directory:', error.message);
    return;
  }
  
  const videoDir = path.join(uploadsPath, testVideoId);
  
  console.log('\n2. Checking files in video directory...');
  try {
    const files = await fs.readdir(videoDir);
    console.log('Files found:', files);
    
    // Check each expected file
    const expectedFiles = [
      'video.mp4',
      'audience.json',
      'transcript.json',
      'audience-enhanced.json',
      'transcript-rewritten.json',
      'narration.wav',
      'adapted-video.mp4'
    ];
    
    for (const file of expectedFiles) {
      const filePath = path.join(videoDir, file);
      try {
        const stats = await fs.stat(filePath);
        console.log(`✓ ${file} exists (${stats.size} bytes)`);
        
        // Check if file is readable
        if (stats.size === 0) {
          console.log(`⚠ ${file} is empty (0 bytes)`);
        }
      } catch (error) {
        console.log(`✗ ${file} missing: ${error.message}`);
      }
    }
  } catch (error) {
    console.error('✗ Error reading video directory:', error.message);
  }
  
  console.log('\n3. Testing individual API endpoints...');
  
  const endpoints = [
    { name: 'TTS', url: '/api/tts', method: 'POST', body: { videoId: testVideoId } },
    { name: 'Generate', url: '/api/generate', method: 'POST', body: { videoId: testVideoId } }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n   Testing ${endpoint.name}...`);
    try {
      const response = await fetch(`http://localhost:3002${endpoint.url}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endpoint.body)
      });
      
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✓ Success:`, data.message || 'OK');
      } else {
        const error = await response.text();
        console.log(`   ✗ Error:`, error);
      }
    } catch (error) {
      console.log(`   ✗ Network error:`, error.message);
    }
  }
  
  console.log('\n4. Checking file contents after API calls...');
  try {
    const files = await fs.readdir(videoDir);
    
    // Check narration.wav specifically
    const narrationPath = path.join(videoDir, 'narration.wav');
    try {
      const narrationStats = await fs.stat(narrationPath);
      console.log(`✓ narration.wav exists (${narrationStats.size} bytes)`);
      
      if (narrationStats.size === 0) {
        console.log('⚠ narration.wav is empty - this is the problem!');
      } else {
        // Try to read first few bytes to check if it's valid
        const buffer = await fs.readFile(narrationPath);
        console.log(`✓ narration.wav is readable (${buffer.length} bytes)`);
        
        // Check if it looks like a WAV file (should start with "RIFF")
        if (buffer.length >= 4) {
          const header = buffer.toString('ascii', 0, 4);
          console.log(`WAV header: ${header}`);
          if (header === 'RIFF') {
            console.log('✓ Valid WAV file header detected');
          } else {
            console.log('✗ Invalid WAV file header - file may be corrupted');
          }
        }
      }
    } catch (error) {
      console.log(`✗ Error reading narration.wav: ${error.message}`);
    }
    
    // Check adapted-video.mp4
    const adaptedVideoPath = path.join(videoDir, 'adapted-video.mp4');
    try {
      const adaptedStats = await fs.stat(adaptedVideoPath);
      console.log(`✓ adapted-video.mp4 exists (${adaptedStats.size} bytes)`);
      
      if (adaptedStats.size === 0) {
        console.log('⚠ adapted-video.mp4 is empty');
      }
    } catch (error) {
      console.log(`✗ adapted-video.mp4 missing: ${error.message}`);
    }
    
  } catch (error) {
    console.error('✗ Error checking files:', error.message);
  }
  
  console.log('\n=== DIAGNOSTIC TEST COMPLETED ===');
}

// Run the test
testVideoGeneration().catch(console.error); 