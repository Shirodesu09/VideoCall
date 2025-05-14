// Using consistent colors for each emotion
export const emotionColors = {
  angry: '#EF4444', // red
  disgust: '#84CC16', // lime
  fear: '#8B5CF6', // purple
  happy: '#F59E0B', // amber
  neutral: '#6B7280', // gray
  sad: '#3B82F6', // blue
  surprise: '#EC4899', // pink
};

// Function to get color for an emotion
export const getEmotionColor = (emotion) => {
  return emotionColors[emotion?.toLowerCase()] || '#9CA3AF';
};

// Function to get contrasting text color for better readability
export const getTextColor = (backgroundColor) => {
  // Extract hex values and convert to RGB
  const r = parseInt(backgroundColor.slice(1, 3), 16);
  const g = parseInt(backgroundColor.slice(3, 5), 16);
  const b = parseInt(backgroundColor.slice(5, 7), 16);
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black text for light backgrounds and white text for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

// Format confidence percentage for display
export const formatConfidence = (confidence) => {
  return confidence.replace(/[^0-9.]/g, '');
};