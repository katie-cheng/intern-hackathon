const fs = require('fs').promises;
const path = require('path');

async function testPipeline() {
  console.log('=== STARTING COMPREHENSIVE PIPELINE TEST ===\n');
  
  // Test 1: Check if uploads directory exists
  console.log('1. Testing uploads directory...');
  try {
    const uploadsPath = path.join(process.cwd(), 'uploads');
    await fs.access(uploadsPath);
    const uploads = await fs.readdir(uploadsPath);
    console.log(`✓ Uploads directory exists with ${uploads.length} items:`, uploads);
  } catch (error) {
    console.error('✗ Uploads directory error:', error.message);
  }
  
  // Test 2: Check each upload directory
  console.log('\n2. Testing individual upload directories...');
  try {
    const uploadsPath = path.join(process.cwd(), 'uploads');
    const uploads = await fs.readdir(uploadsPath);
    
    for (const uploadId of uploads) {
      console.log(`\n   Testing upload: ${uploadId}`);
      const uploadPath = path.join(uploadsPath, uploadId);
      const files = await fs.readdir(uploadPath);
      console.log(`   Files:`, files);
      
      // Check for required files
      const requiredFiles = ['video.mp4', 'audience.json'];
      const missingFiles = requiredFiles.filter(file => !files.includes(file));
      
      if (missingFiles.length > 0) {
        console.log(`   ✗ Missing files:`, missingFiles);
      } else {
        console.log(`   ✓ All required files present`);
      }
      
      // Check for processing files
      const processingFiles = ['transcript.json', 'audience-enhanced.json', 'transcript-rewritten.json', 'adapted-video.mp4'];
      const presentProcessingFiles = processingFiles.filter(file => files.includes(file));
      
      if (presentProcessingFiles.length > 0) {
        console.log(`   ✓ Processing files found:`, presentProcessingFiles);
      } else {
        console.log(`   ✗ No processing files found`);
      }
    }
  } catch (error) {
    console.error('✗ Error testing upload directories:', error.message);
  }
  
  // Test 3: Test API endpoints
  console.log('\n3. Testing API endpoints...');
  
  const testVideoId = 'test-video-id';
  const baseUrl = 'http://localhost:3002';
  
  const endpoints = [
    { name: 'Transcribe', url: '/api/transcribe', method: 'POST', body: { videoId: testVideoId } },
    { name: 'Parse Audience', url: '/api/parse-audience', method: 'POST', body: { videoId: testVideoId, audience: {} } },
    { name: 'Rewrite', url: '/api/rewrite', method: 'POST', body: { videoId: testVideoId } },
    { name: 'TTS', url: '/api/tts', method: 'POST', body: { videoId: testVideoId } },
    { name: 'Generate', url: '/api/generate', method: 'POST', body: { videoId: testVideoId } },
    { name: 'Result', url: `/api/result?id=${testVideoId}`, method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n   Testing ${endpoint.name}...`);
    try {
      const response = await fetch(`${baseUrl}${endpoint.url}`, {
        method: endpoint.method,
        headers: endpoint.method === 'POST' ? { 'Content-Type': 'application/json' } : {},
        body: endpoint.method === 'POST' ? JSON.stringify(endpoint.body) : undefined
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
  
  console.log('\n=== PIPELINE TEST COMPLETED ===');
}

// Run the test
testPipeline().catch(console.error); 