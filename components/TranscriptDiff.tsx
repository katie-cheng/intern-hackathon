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
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 p-4 rounded-xl text-sm">
        <h4 className="font-medium text-blue-100 mb-3">Changes Highlighted:</h4>
        <div className="space-y-1">
          {diffWords.map((item, index) => (
            <span
              key={index}
              className={`inline-block mr-1 px-1 rounded ${
                item.type === 'added'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : item.type === 'removed'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30 line-through'
                  : 'text-blue-200'
              }`}
            >
              {item.word}
            </span>
          ))}
        </div>
        <div className="mt-4 text-xs text-blue-200/80">
          <span className="inline-block mr-6">
            <span className="inline-block w-3 h-3 bg-green-500/20 text-green-300 mr-2 border border-green-500/30 rounded">●</span>
            Added
          </span>
          <span className="inline-block">
            <span className="inline-block w-3 h-3 bg-red-500/20 text-red-300 mr-2 border border-red-500/30 rounded">●</span>
            Removed
          </span>
        </div>
      </div>
    );
  };

  const renderTranscript = (text: string, title: string) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-blue-100">{title}</h4>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowDiff(!showDiff)}
            className={`px-4 py-2 text-xs rounded-xl transition-all duration-200 ${
              showDiff
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20'
            }`}
          >
            {showDiff ? 'Hide Diff' : 'Show Diff'}
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(text)}
            className="px-4 py-2 text-xs bg-white/10 text-blue-200 rounded-xl hover:bg-white/20 transition-all duration-200 border border-white/20"
          >
            Copy
          </button>
        </div>
      </div>
      
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-4 max-h-64 overflow-y-auto">
        <p className="text-blue-100 leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
      
      <div className="text-xs text-blue-200/60">
        <span>Word count: {text.split(' ').length}</span>
        <span className="mx-2">•</span>
        <span>Character count: {text.length}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {activeTab === 'original' && renderTranscript(original, 'Original Transcript')}
      {activeTab === 'adapted' && renderTranscript(adapted, 'Adapted Transcript')}
      
      {showDiff && renderDiffText()}
      
      {activeTab === 'adapted' && (
        <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/30 rounded-xl p-4">
          <h4 className="text-sm font-medium text-blue-100 mb-3">Adaptation Summary</h4>
          <div className="text-sm text-blue-200/80 space-y-2">
            <p><strong>Original length:</strong> {original.split(' ').length} words</p>
            <p><strong>Adapted length:</strong> {adapted.split(' ').length} words</p>
            <p><strong>Change:</strong> <span className="text-cyan-300">{adapted.split(' ').length - original.split(' ').length > 0 ? '+' : ''}{adapted.split(' ').length - original.split(' ').length} words</span></p>
            <p><strong>Similarity:</strong> <span className="text-cyan-300">{calculateSimilarity(original, adapted).toFixed(1)}%</span></p>
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