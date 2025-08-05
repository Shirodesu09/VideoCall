import React from 'react';
import { MehIcon, SmileIcon, FrownIcon, AlertTriangleIcon } from 'lucide-react';
import { getEmotionColor } from '../../utils/colorUtils';

const getEmotionIcon = (emotion) => {
  if (!emotion) return <MehIcon className="w-5 h-5 text-gray-500" />;
  
  switch (emotion.toLowerCase()) {
    case 'happy':
      return <SmileIcon className="w-5 h-5 text-amber-500" />;
    case 'sad':
    case 'angry':
    case 'disgust':
    case 'fear':
      return <FrownIcon className="w-5 h-5 text-blue-500" />;
    case 'surprise':
      return <AlertTriangleIcon className="w-5 h-5 text-pink-500" />;
    case 'neutral':
    default:
      return <MehIcon className="w-5 h-5 text-gray-500" />;
  }
};

function EmotionSummary({ data = [] }) {

  if (!Array.isArray(data)) {
    return <div className="p-6 text-red-500">Invalid data format</div>;
  }

  // Filter out invalid entries and count occurrences
  const validData = data.filter(entry => entry && typeof entry === 'object');
  const emotionCounts = validData.reduce((acc, entry) => {
    const emotion = entry?.emotion || 'neutral';
    acc[emotion] = (acc[emotion] || 0) + 1;
    return acc;
  }, {});

  const emotionStats = Object.keys(emotionCounts).map((emotion) => ({
    emotion,
    count: emotionCounts[emotion],
    color: getEmotionColor(emotion),
  }));

  emotionStats.sort((a, b) => b.count - a.count);

  // calculate average confidence
  const avgConfidence = validData.length > 0 
    ? validData.reduce((sum, entry) => {
        const confidenceStr = entry?.confidence*100 || '0%';
        const confidenceValue = parseFloat(confidenceStr.toString().replace('%', '')) || 0;
        return sum + confidenceValue;
      }, 0) / validData.length
    : 0;

  
  const latest = validData[validData.length - 1] || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500 mb-2">DOMINANT EMOTION</h2>
        <div className="flex items-center mt-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
            style={{ 
              backgroundColor: `${getEmotionColor(emotionStats[0]?.emotion || 'neutral')}20` 
            }}
          >
            {getEmotionIcon(emotionStats[0]?.emotion)}
          </div>
          <div>
            <span className="text-2xl font-semibold capitalize">
              {emotionStats[0]?.emotion || 'neutral'}
            </span>
            <p className="text-gray-500 text-sm">
              {validData.length > 0 
                ? `${((emotionStats[0]?.count / validData.length) * 100 || 0).toFixed(1)}% of recordings`
                : 'No data'}
            </p>
          </div>
        </div>
      </div>

      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500 mb-2">AVERAGE MODEL CONFIDENCE</h2>
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-semibold">{avgConfidence.toFixed(1)}%</span>
            <div className="text-gray-500 text-sm">Reliability score</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${Math.min(avgConfidence, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-sm font-medium text-gray-500 mb-2">LAST DETECTED EMOTION</h2>
        <div className="flex items-center mt-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
            style={{ 
              backgroundColor: `${getEmotionColor(latest.emotion || 'neutral')}20` 
            }}
          >
            {getEmotionIcon(latest.emotion)}
          </div>
          <div>
            <span className="text-2xl font-semibold capitalize">
              {latest.emotion || 'neutral'}
            </span>
            <p className="text-gray-500 text-sm">
              {latest.confidence ? `${latest.confidence} confidence` : 'No data'}
            </p>
          </div>
        </div>
      </div>

      
      {validData.length > 0 && (
        <div className="col-span-1 md:col-span-3 bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-500 mb-3">EMOTION DISTRIBUTION</h2>
          <div className="flex flex-wrap gap-2">
            {emotionStats.map((stat) => (
              <div
                key={stat.emotion}
                className="flex items-center bg-gray-50 px-3 py-2 rounded-md"
              >
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: stat.color }}
                ></div>
                <span className="text-sm font-medium capitalize">{stat.emotion}</span>
                <span className="text-xs text-gray-500 ml-2">
                  {((stat.count / validData.length) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmotionSummary;