import { useState } from 'react';

export default function TestPipeline() {
  const [videoId, setVideoId] = useState('');
  const [status, setStatus] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testPipeline = async () => {
    if (!videoId) {
      alert('Please enter a video ID');
      return;
    }

    setStatus('Testing pipeline...');
    addLog('Starting pipeline test for video ID: ' + videoId);

    const steps = [
      { name: 'Transcribe', endpoint: '/api/transcribe' },
      { name: 'Parse Audience', endpoint: '/api/parse-audience' },
      { name: 'Rewrite', endpoint: '/api/rewrite' },
      { name: 'TTS', endpoint: '/api/tts' },
      { name: 'Generate', endpoint: '/api/generate' },
      { name: 'Result', endpoint: `/api/result?id=${videoId}` }
    ];

    for (const step of steps) {
      try {
        addLog(`Testing ${step.name}...`);
        
        const response = await fetch(step.endpoint, {
          method: step.name === 'Result' ? 'GET' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: step.name === 'Result' ? undefined : JSON.stringify({ videoId })
        });

        if (response.ok) {
          const data = await response.json();
          addLog(`✓ ${step.name} successful: ${data.message || 'OK'}`);
        } else {
          const error = await response.text();
          addLog(`✗ ${step.name} failed: ${error}`);
        }
      } catch (error) {
        addLog(`✗ ${step.name} error: ${(error as Error).message}`);
      }
    }

    setStatus('Pipeline test completed');
    addLog('Pipeline test completed');
  };

  const viewResult = () => {
    if (videoId) {
      window.open(`/compare?id=${videoId}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pipeline Test</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter video ID"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={testPipeline}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Test Pipeline
            </button>
            <button
              onClick={viewResult}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              View Result
            </button>
          </div>
          
          {status && (
            <div className="text-sm text-gray-600 mb-4">
              Status: {status}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Test Logs</h2>
          <div className="bg-gray-100 rounded-md p-4 h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Run a test to see results.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 