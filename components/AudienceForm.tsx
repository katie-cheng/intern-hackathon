import React from 'react';

interface AudienceData {
  age: string;
  education: string;
  interests: string;
  language: string;
  technicalLevel: string;
}

interface AudienceFormProps {
  audienceData: AudienceData;
  onAudienceChange: (data: AudienceData) => void;
}

export const AudienceForm: React.FC<AudienceFormProps> = ({ 
  audienceData, 
  onAudienceChange 
}) => {
  const handleChange = (field: keyof AudienceData, value: string) => {
    onAudienceChange({
      ...audienceData,
      [field]: value,
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Target Audience</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Age */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Age Range
          </label>
          <select
            value={audienceData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Education Level
          </label>
          <select
            value={audienceData.education}
            onChange={(e) => handleChange('education', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technical Level
          </label>
          <select
            value={audienceData.technicalLevel}
            onChange={(e) => handleChange('technicalLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Language
          </label>
          <select
            value={audienceData.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Interests & Background
        </label>
        <textarea
          value={audienceData.interests}
          onChange={(e) => handleChange('interests', e.target.value)}
          placeholder="e.g., Technology, Science, Arts, Business, Sports, Gaming, etc."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">
          Describe the audience's interests, background, or specific context
        </p>
      </div>

      {/* Audience Preview */}
      {audienceData.age && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Audience Summary</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Target:</strong> {audienceData.age} year olds</p>
            <p><strong>Education:</strong> {audienceData.education || 'Not specified'}</p>
            <p><strong>Technical Level:</strong> {audienceData.technicalLevel || 'Not specified'}</p>
            <p><strong>Language:</strong> {audienceData.language}</p>
            {audienceData.interests && (
              <p><strong>Interests:</strong> {audienceData.interests}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}; 