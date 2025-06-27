import React from 'react';

interface AudienceData {
  age: string;
  education: string;
  interests: string;
  language: string;
  technicalLevel: string;
  includeBackgroundMusic?: boolean;
}

interface AudienceFormProps {
  audienceData: AudienceData;
  onAudienceChange: (data: AudienceData) => void;
}

export const AudienceForm: React.FC<AudienceFormProps> = ({ 
  audienceData, 
  onAudienceChange 
}) => {
  const handleChange = (field: keyof AudienceData, value: string | boolean) => {
    onAudienceChange({
      ...audienceData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-blue-100">Target Audience</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-blue-200 mb-2">
            Age Range
          </label>
          <select
            value={audienceData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-md bg-white/10 border border-blue-300/30 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-blue-100 placeholder-blue-200/50 [&>option]:bg-white [&>option]:text-gray-900"
          >
            <option value="">Select age range</option>
            <option value="5-12">5-12 (Children)</option>
            <option value="13-17">13-17 (Teenagers)</option>
            <option value="18-24">18-24 (Young Adults)</option>
            <option value="25-34">25-34 (Adults)</option>
            <option value="35-44">35-44 (Adults)</option>
            <option value="45-54">45-54 (Adults)</option>
            <option value="55-64">55-64 (Adults)</option>
            <option value="65+">65+ (Seniors)</option>
          </select>
        </div>

        {/* Education Level */}
        <div>
          <label className="block text-sm font-medium text-blue-200 mb-2">
            Education Level
          </label>
          <select
            value={audienceData.education}
            onChange={(e) => handleChange('education', e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-md bg-white/10 border border-blue-300/30 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-blue-100 placeholder-blue-200/50 [&>option]:bg-white [&>option]:text-gray-900"
          >
            <option value="">Select education level</option>
            <option value="elementary">Elementary School</option>
            <option value="middle">Middle School</option>
            <option value="high-school">High School</option>
            <option value="bachelors">Bachelor's Degree</option>
            <option value="masters">Master's Degree</option>
            <option value="phd">PhD/Doctorate</option>
          </select>
        </div>

        {/* Technical Level */}
        <div>
          <label className="block text-sm font-medium text-blue-200 mb-2">
            Technical Level
          </label>
          <select
            value={audienceData.technicalLevel}
            onChange={(e) => handleChange('technicalLevel', e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-md bg-white/10 border border-blue-300/30 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-blue-100 placeholder-blue-200/50 [&>option]:bg-white [&>option]:text-gray-900"
          >
            <option value="">Select technical level</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-blue-200 mb-2">
            Language
          </label>
          <select
            value={audienceData.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full px-4 py-3 backdrop-blur-md bg-white/10 border border-blue-300/30 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-blue-100 placeholder-blue-200/50 [&>option]:bg-white [&>option]:text-gray-900"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="pt">Portuguese</option>
            <option value="ru">Russian</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block text-sm font-medium text-blue-200 mb-2">
          Interests & Background
        </label>
        <textarea
          value={audienceData.interests}
          onChange={(e) => handleChange('interests', e.target.value)}
          placeholder="e.g., Technology, Science, Arts, Business, Sports, Gaming, etc."
          rows={3}
          className="w-full px-4 py-3 backdrop-blur-md bg-white/10 border border-blue-300/30 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-blue-100 placeholder-blue-200/50 resize-none"
        />
        <p className="mt-2 text-xs text-blue-200/60">
          Describe the audience's interests, background, or specific context
        </p>
      </div>

      {/* Background Music Toggle */}
      <div className="flex items-center space-x-3 p-4 backdrop-blur-md bg-white/5 border border-blue-300/20 rounded-xl">
        <input
          type="checkbox"
          id="includeBackgroundMusic"
          checked={audienceData.includeBackgroundMusic || false}
          onChange={(e) => handleChange('includeBackgroundMusic', e.target.checked)}
          className="h-5 w-5 text-blue-500 focus:ring-blue-400 border-blue-300/50 rounded bg-white/10"
        />
        <label htmlFor="includeBackgroundMusic" className="text-sm font-medium text-blue-100">
          Include music
        </label>
      </div>

      {/* Audience Preview */}
      {audienceData.age && (
        <div className="backdrop-blur-md bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
          <h4 className="text-sm font-medium text-blue-200 mb-3">Audience Summary</h4>
          <div className="text-sm text-blue-100/80 space-y-2">
            <p><strong>Target:</strong> {audienceData.age} year olds</p>
            <p><strong>Education:</strong> {audienceData.education || 'Not specified'}</p>
            <p><strong>Technical Level:</strong> {audienceData.technicalLevel || 'Not specified'}</p>
            <p><strong>Language:</strong> {audienceData.language}</p>
            {audienceData.interests && (
              <p><strong>Interests:</strong> {audienceData.interests}</p>
            )}
            <p><strong>Background Music:</strong> {(audienceData.includeBackgroundMusic || false) ? 'Yes' : 'No'}</p>
          </div>
        </div>
      )}
    </div>
  );
}; 