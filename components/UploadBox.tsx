import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadBoxProps {
  onFileSelect: (file: File) => void;
}

export const UploadBox: React.FC<UploadBoxProps> = ({ onFileSelect }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm']
    },
    multiple: false
  });

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-blue-100">Upload Video</h3>
      
      <div
        {...getRootProps()}
        className={`backdrop-blur-md border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragActive
            ? 'border-blue-400 bg-blue-500/20'
            : 'border-blue-300/50 bg-white/5 hover:border-blue-400/70 hover:bg-white/10'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-lg font-medium text-blue-100">
              {isDragActive ? 'Drop your video here' : 'Drag & drop your video here'}
            </p>
            <p className="text-blue-200/70 mt-2">
              or click to browse files
            </p>
            <p className="text-sm text-blue-200/50 mt-2">
              Supports MP4, MOV, AVI, MKV, WebM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}; 