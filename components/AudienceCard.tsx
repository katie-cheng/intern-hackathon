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
    if (ageNum < 13) return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (ageNum < 18) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (ageNum < 25) return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (ageNum < 65) return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
  };

  const getTechnicalLevelColor = (level: string): string => {
    const colors: { [key: string]: string } = {
      'beginner': 'bg-green-500/20 text-green-300 border-green-500/30',
      'intermediate': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      'advanced': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      'expert': 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[level] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  };

  return (
    <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-blue-100">Target Audience</h3>
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center border border-blue-500/30">
          <svg className="w-5 h-5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        {/* Age Group */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-200/80">Age Group:</span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getAgeGroupColor(audience.age)}`}>
            {getAgeGroup(audience.age)} ({audience.age})
          </span>
        </div>

        {/* Education Level */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-200/80">Education:</span>
          <span className="text-sm text-blue-100">
            {getEducationLabel(audience.education)}
          </span>
        </div>

        {/* Technical Level */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-200/80">Technical Level:</span>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTechnicalLevelColor(audience.technicalLevel)}`}>
            {getTechnicalLevelLabel(audience.technicalLevel)}
          </span>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-200/80">Language:</span>
          <span className="text-sm text-blue-100">
            {getLanguageLabel(audience.language)}
          </span>
        </div>

        {/* Interests */}
        {audience.interests && (
          <div className="pt-4 border-t border-white/20">
            <span className="text-sm font-medium text-blue-200/80 block mb-3">Interests:</span>
            <div className="flex flex-wrap gap-2">
              {audience.interests.split(',').map((interest, index) => (
                <span
                  key={index}
                  className="px-3 py-1 text-xs bg-white/10 text-blue-200 rounded-lg border border-white/20"
                >
                  {interest.trim()}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Adaptation Insights */}
      <div className="mt-6 pt-4 border-t border-white/20">
        <h4 className="text-sm font-medium text-blue-100 mb-4">Adaptation Insights</h4>
        <div className="space-y-3 text-xs text-blue-200/80">
          {audience.age && parseInt(audience.age) < 18 && (
            <div className="flex items-start space-x-3">
              <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Content will be simplified for younger audience</span>
            </div>
          )}
          
          {audience.technicalLevel === 'beginner' && (
            <div className="flex items-start space-x-3">
              <svg className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Technical concepts will be explained in simple terms</span>
            </div>
          )}
          
          {audience.technicalLevel === 'advanced' && (
            <div className="flex items-start space-x-3">
              <svg className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Content will include advanced technical details</span>
            </div>
          )}
          
          {audience.language !== 'en' && (
            <div className="flex items-start space-x-3">
              <svg className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
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