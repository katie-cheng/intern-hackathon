import React from 'react';

interface AudienceData {
  age: string;
  education: string;
  interests: string;
  language: string;
  technicalLevel: string;
}

interface AudienceCardProps {
  audience: AudienceData;
}

export const AudienceCard: React.FC<AudienceCardProps> = ({ audience }) => {
  const getAgeGroup = (age: string): string => {
    const ageNum = parseInt(age);
    if (ageNum < 13) return 'Children';
    if (ageNum < 18) return 'Teenagers';
    if (ageNum < 25) return 'Young Adults';
    if (ageNum < 65) return 'Adults';
    return 'Seniors';
  };

  const getEducationLabel = (education: string): string => {
    const labels: { [key: string]: string } = {
      'elementary': 'Elementary School',
      'middle': 'Middle School',
      'high-school': 'High School',
      'bachelors': "Bachelor's Degree",
      'masters': "Master's Degree",
      'phd': 'PhD/Doctorate'
    };
    return labels[education] || education;
  };

  const getTechnicalLevelLabel = (level: string): string => {
    const labels: { [key: string]: string } = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced',
      'expert': 'Expert'
    };
    return labels[level] || level;
  };

  const getLanguageLabel = (language: string): string => {
    const labels: { [key: string]: string } = {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ar': 'Arabic'
    };
    return labels[language] || language;
  };

  const getAgeGroupColor = (age: string): string => {
    const ageNum = parseInt(age);
    if (ageNum < 13) return 'bg-blue-100 text-blue-800';
    if (ageNum < 18) return 'bg-purple-100 text-purple-800';
    if (ageNum < 25) return 'bg-green-100 text-green-800';
    if (ageNum < 65) return 'bg-gray-100 text-gray-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getTechnicalLevelColor = (level: string): string => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-orange-100 text-orange-800',
      'expert': 'bg-red-100 text-red-800'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Target Audience</h3>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        {/* Age Group */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Age Group:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAgeGroupColor(audience.age)}`}>
            {getAgeGroup(audience.age)} ({audience.age})
          </span>
        </div>

        {/* Education Level */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Education:</span>
          <span className="text-sm text-gray-900">
            {getEducationLabel(audience.education)}
          </span>
        </div>

        {/* Technical Level */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Technical Level:</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTechnicalLevelColor(audience.technicalLevel)}`}>
            {getTechnicalLevelLabel(audience.technicalLevel)}
          </span>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Language:</span>
          <span className="text-sm text-gray-900">
            {getLanguageLabel(audience.language)}
          </span>
        </div>

        {/* Interests */}
        {audience.interests && (
          <div className="pt-2 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700 block mb-2">Interests:</span>
            <div className="flex flex-wrap gap-2">
              {audience.interests.split(',').map((interest, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-md"
                >
                  {interest.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Adaptation Insights */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Adaptation Insights</h4>
        <div className="space-y-2 text-xs text-gray-600">
          {audience.age && parseInt(audience.age) < 18 && (
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Content will be simplified for younger audience</span>
            </div>
          )}
          
          {audience.technicalLevel === 'beginner' && (
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Technical concepts will be explained in simple terms</span>
            </div>
          )}
          
          {audience.technicalLevel === 'advanced' && (
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Content will include advanced technical details</span>
            </div>
          )}
          
          {audience.language !== 'en' && (
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Content will be adapted for {getLanguageLabel(audience.language)} speakers</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 