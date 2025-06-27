import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { VideoPlayer } from '../../components/VideoPlayer';
import { TranscriptDiff } from '../../components/TranscriptDiff';
import { AudienceCard } from '../../components/AudienceCard';

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

interface ComparePageProps {
  id: string;
}

export default function Compare({ id }: ComparePageProps) {
  const router = useRouter();
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-100">Processing your video...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8">
          <p className="text-red-300 mb-4">Failed to load video result</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-4 tracking-tight">
            Nova
          </h1>
          <p className="text-xl text-blue-100/80">
            Video Comparison Results
          </p>
        </div>

        {/* Video Comparison Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-100">Original Video</h2>
            <VideoPlayer videoUrl={result.originalVideo} />
          </div>
          
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-semibold mb-4 text-blue-100">Adapted Video</h2>
            <VideoPlayer videoUrl={result.adaptedVideo} />
          </div>
        </div>

        {/* Content Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'original'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20'
                  }`}
                >
                  Original Transcript
                </button>
                <button
                  onClick={() => setActiveTab('adapted')}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'adapted'
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20'
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

          <div className="space-y-6">
            <AudienceCard audience={result.audience} />
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
              <h3 className="text-lg font-semibold mb-4 text-blue-100">Processing Info</h3>
              <p className="text-sm text-blue-200/80">
                Processing time: <span className="text-cyan-300 font-medium">{result.processingTime}s</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Required for dynamic routes in Next.js
export async function getStaticPaths() {
  // Since we don't know all possible IDs at build time, we'll return an empty array
  // This means the page will be generated on-demand (SSR)
  return {
    paths: [],
    fallback: 'blocking'
  };
}

export async function getStaticProps({ params }: { params: { id: string } }) {
  return {
    props: {
      id: params.id
    }
  };
} 