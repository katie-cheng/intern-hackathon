require('dotenv').config({ path: '.env.local' });

async function testAzureDeployments() {
  console.log('=== AZURE OPENAI DEPLOYMENT TEST ===');
  
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION;
  
  if (!apiKey || !endpoint) {
    console.error('❌ Missing Azure OpenAI credentials in .env.local');
    console.log('Please ensure AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT are set');
    return;
  }
  
  console.log('✓ Azure OpenAI credentials found');
  console.log('Endpoint:', endpoint);
  console.log('API Version from .env.local:', apiVersion);
  
  // Valid Azure OpenAI API versions to try
  const validApiVersions = [
    '2024-02-15-preview',
    '2023-12-01-preview', 
    '2023-08-01-preview',
    '2023-07-01-preview',
    '2023-06-01-preview',
    '2023-05-15',
    '2023-03-15-preview'
  ];
  
  console.log('\n🔍 Testing different API versions...');
  
  for (const testApiVersion of validApiVersions) {
    console.log(`\n--- Testing API version: ${testApiVersion} ---`);
    
    try {
      const deploymentsUrl = `${endpoint}/openai/deployments?api-version=${testApiVersion}`;
      console.log('URL:', deploymentsUrl);
      
      const response = await fetch(deploymentsUrl, {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        console.log('✅ API version works!');
        
        const deployments = await response.json();
        console.log('✓ Successfully retrieved deployments');
        console.log('\n📋 Available deployments:');
        
        if (deployments.data && deployments.data.length > 0) {
          deployments.data.forEach((deployment, index) => {
            console.log(`${index + 1}. Name: "${deployment.id}"`);
            console.log(`   Model: ${deployment.model}`);
            console.log(`   Status: ${deployment.status}`);
            console.log('');
          });
          
          // Test each deployment
          console.log('🧪 Testing each deployment...');
          
          for (const deployment of deployments.data) {
            if (deployment.status === 'succeeded') {
              console.log(`\nTesting deployment: "${deployment.id}"`);
              
              try {
                const chatUrl = `${endpoint}/openai/deployments/${deployment.id}/chat/completions?api-version=${testApiVersion}`;
                
                const chatResponse = await fetch(chatUrl, {
                  method: 'POST',
                  headers: {
                    'api-key': apiKey,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    messages: [
                      { role: 'user', content: 'Hello! This is a test message.' }
                    ],
                    max_tokens: 50
                  })
                });
                
                if (chatResponse.ok) {
                  console.log(`✅ "${deployment.id}" - WORKS!`);
                  console.log('   This is your correct deployment name for .env.local');
                  console.log(`   Set AZURE_OPENAI_DEPLOYMENT_NAME="${deployment.id}"`);
                  console.log(`   Set AZURE_OPENAI_API_VERSION="${testApiVersion}"`);
                  return;
                } else {
                  console.log(`❌ "${deployment.id}" - Failed: ${chatResponse.status}`);
                }
              } catch (error) {
                console.log(`❌ "${deployment.id}" - Error: ${error.message}`);
              }
            }
          }
        } else {
          console.log('❌ No deployments found');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Failed:', errorText.substring(0, 200));
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
  
  console.log('\n❌ No working API version found. Please check:');
  console.log('1. Your Azure OpenAI resource exists and is active');
  console.log('2. Your API key is correct');
  console.log('3. Your endpoint URL is correct');
  console.log('4. You have the necessary permissions');
}

testAzureDeployments().catch(console.error); 