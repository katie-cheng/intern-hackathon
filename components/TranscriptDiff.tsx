import React, { useState } from 'react';

interface TranscriptDiffProps {
  original: string;
  adapted: string;
  activeTab: 'original' | 'adapted';
}

export const TranscriptDiff: React.FC<TranscriptDiffProps> = ({
  original,
  adapted,
  activeTab
}) => {
  const [showDiff, setShowDiff] = useState(false);

  // Simple diff highlighting (in production, use a proper diff library)
  const highlightDifferences = (text1: string, text2: string) => {
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');
    const maxLength = Math.max(words1.length, words2.length);
    
    const diffWords: Array<{ word: string; type: 'same' | 'added' | 'removed' }> = [];
    
    for (let i = 0; i < maxLength; i++) {
      if (i < words1.length && i < words2.length) {
        if (words1[i] === words2[i]) {
          diffWords.push({ word: words1[i], type: 'same' });
        } else {
          diffWords.push({ word: words1[i], type: 'removed' });
          diffWords.push({ word: words2[i], type: 'added' });
        }
      } else if (i < words1.length) {
        diffWords.push({ word: words1[i], type: 'removed' });
      } else if (i < words2.length) {
        diffWords.push({ word: words2[i], type: 'added' });
      }
    }
    
    return diffWords;
  };

  const diffWords = showDiff ? highlightDifferences(original, adapted) : [];

  const renderDiffText = () => {
    if (!showDiff) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-md text-sm">
        <h4 className="font-medium text-gray-900 mb-2">Changes Highlighted:</h4>
        <div className="space-y-1">
          {diffWords.map((item, index) => (
            <span
              key={index}
              className={`inline-block mr-1 px-1 rounded ${
                item.type === 'added'
                  ? 'bg-green-100 text-green-800'
                  : item.type === 'removed'
                  ? 'bg-red-100 text-red-800 line-through'
                  : 'text-gray-700'
              }`}
            >
              {item.word}
            </span>
          ))}
        </div>
        <div className="mt-3 text-xs text-gray-500">
          <span className="inline-block mr-4">
            <span className="inline-block w-3 h-3 bg-green-100 text-green-800 mr-1">●</span>
            Added
          </span>
          <span className="inline-block">
            <span className="inline-block w-3 h-3 bg-red-100 text-red-800 mr-1">●</span>
            Removed
          </span>
        </div>
      </div>
    );
  };

  const renderTranscript = (text: string, title: string) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              showDiff
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showDiff ? 'Hide Diff' : 'Show Diff'}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(text)}
            className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Copy
          </button>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-md p-4 max-h-64 overflow-y-auto">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
      
      <div className="text-xs text-gray-500">
        <span>Word count: {text.split(' ').length}</span>
        <span className="mx-2">•</span>
        <span>Character count: {text.length}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {activeTab === 'original' && renderTranscript(original, 'Original Transcript')}
      {activeTab === 'adapted' && renderTranscript(adapted, 'Adapted Transcript')}
      
      {showDiff && renderDiffText()}
      
      {activeTab === 'adapted' && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Adaptation Summary</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Original length:</strong> {original.split(' ').length} words</p>
            <p><strong>Adapted length:</strong> {adapted.split(' ').length} words</p>
            <p><strong>Change:</strong> {adapted.split(' ').length - original.split(' ').length > 0 ? '+' : ''}{adapted.split(' ').length - original.split(' ').length} words</p>
            <p><strong>Similarity:</strong> {calculateSimilarity(original, adapted).toFixed(1)}%</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Calculate text similarity percentage
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set(Array.from(words1).filter(x => words2.has(x)));
  const union = new Set([...Array.from(words1), ...Array.from(words2)]);
  
  return (intersection.size / union.size) * 100;
} 