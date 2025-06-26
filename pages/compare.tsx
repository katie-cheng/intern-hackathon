import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { VideoPlayer } from '../components/VideoPlayer';
import { TranscriptDiff } from '../components/TranscriptDiff';
import { AudienceCard } from '../components/AudienceCard';

interface VideoResult {
  originalVideo: string;
  adaptedVideo: string;
  originalTranscript: string;
  adaptedTranscript: string;
  audience: {
    age: string;
    education: string;
    interests: string;
    language: string;
    technicalLevel: string;
  };
  processingTime: number;
}

export default function Compare() {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState<VideoResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'original' | 'adapted'>('original');

  useEffect(() => {
    if (id) {
      fetchResult();
    }
  }, [id]);

  const fetchResult = async () => {
    console.log('=== COMPARE PAGE: FETCHING RESULT ===');
    console.log('Video ID:', id);
    
    try {
      const url = `/api/result?id=${id}`;
      console.log('Fetching from URL:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('✓ Result data received:', data);
        setResult(data);
      } else {
        const errorText = await response.text();
        console.error('✗ API returned error:', response.status, errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('✗ Failed to fetch result:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your video...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load video result</p>
          <button 
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Video Comparison
          </h1>
          <p className="text-gray-600">
            Compare the original and adapted versions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Original Video</h2>
            <VideoPlayer videoUrl={result.originalVideo} />
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Adapted Video</h2>
            <VideoPlayer videoUrl={result.adaptedVideo} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex space-x-4 mb-4">
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'original'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Original Transcript
                </button>
                <button
                  onClick={() => setActiveTab('adapted')}
                  className={`px-4 py-2 rounded-md ${
                    activeTab === 'adapted'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Adapted Transcript
                </button>
              </div>
              
              <TranscriptDiff
                original={result.originalTranscript}
                adapted={result.adaptedTranscript}
                activeTab={activeTab}
              />
            </div>
          </div>

          <div>
            <AudienceCard audience={result.audience} />
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Processing Info</h3>
              <p className="text-sm text-gray-600">
                Processing time: {result.processingTime}s
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 