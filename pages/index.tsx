import { useState } from 'react';
import { UploadBox } from '../components/UploadBox';
import { AudienceForm } from '../components/AudienceForm';

export default function Home() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audienceData, setAudienceData] = useState({
    age: '',
    education: '',
    interests: '',
    language: 'en',
    technicalLevel: 'beginner'
  });

  const handleSubmit = async () => {
    if (!videoFile) return;

    setIsProcessing(true);
    setError(null);
    console.log('Starting upload process...', { videoFile, audienceData });

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('audience', JSON.stringify(audienceData));

    try {
      console.log('Sending request to /api/upload...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        // Redirect to compare page with video ID
        window.location.href = `/compare/${result.videoId}`;
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Upload failed:', errorData);
        setError(errorData.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Network error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section with Nova Title */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 bg-clip-text text-transparent mb-6 tracking-tight">
            Nova
          </h1>
          <p className="text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
            Transform any video into personalized content that resonates with your audience
          </p>
        </div>

        {/* Main Content Glass Pane */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="space-y-8">
            <UploadBox onFileSelect={setVideoFile} />
            <AudienceForm 
              audienceData={audienceData} 
              onAudienceChange={setAudienceData} 
            />
            
            {error && (
              <div className="backdrop-blur-md bg-red-500/20 border border-red-400/30 rounded-xl p-4">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={!videoFile || isProcessing}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : videoFile ? 'Transform Video' : 'Upload a video first'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 