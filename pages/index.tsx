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
        window.location.href = `/compare?id=${result.videoId}`;
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Adapt Videos to Any Audience
          </h1>
          <p className="text-lg text-gray-600">
            Upload a video and specify your target audience to get a customized version
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
          <UploadBox onFileSelect={setVideoFile} />
          <AudienceForm 
            audienceData={audienceData} 
            onAudienceChange={setAudienceData} 
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          <button
            onClick={handleSubmit}
            disabled={!videoFile || isProcessing}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : videoFile ? 'Process Video' : 'Upload a video first'}
          </button>
        </div>
      </div>
    </div>
  );
} 