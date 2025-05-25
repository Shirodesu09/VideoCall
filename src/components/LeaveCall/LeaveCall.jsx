import { useEffect, useState } from 'react';
import { useEmotionStore } from "../../store";
import { EmotionDistributionChart } from "./EmotionDistributionChart";
import EmotionSummary from "./EmotionSummary";
import { EmotionTimelineChart } from "./EmotionTimelineChart";
import { BarChartIcon, PieChartIcon } from 'lucide-react';
import logo from "../../assets/tale-logo.png";

function LeaveCall() {
  const { emotionHistory } = useEmotionStore();
  const [emotionData, setEmotionData] = useState([]);

  useEffect(() => {
    localStorage.setItem('emotionHistory', JSON.stringify(emotionHistory));
  }, [emotionHistory]);

  useEffect(() => {
    const storedData = localStorage.getItem('emotionHistory');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setEmotionData(parsedData);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Logo on the left */}
          <div className="flex-shrink-0">
            <img src={logo} alt="Logo" className="h-10" />
          </div>
          
          {/* Title centered */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Emotion Analytics Dashboard
            </h1>
          </div>
          
          {/* Last updated on the right */}
          <div className="flex-shrink-0">
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmotionSummary data={emotionData} />
        
        <div className="mt-8 grid grid-cols-1 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <BarChartIcon className="h-5 w-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Emotion Timeline</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Track how emotions change over time. Hover over points for details.
            </p>
            <div className="h-96">
              <EmotionTimelineChart data={emotionData} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center mb-4">
              <BarChartIcon className="h-5 w-5 text-indigo-500 mr-2" />
              <h2 className="text-lg font-medium text-gray-900">Emotion Distribution</h2>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Visualize the intensity of each emotion across all measurements.
            </p>
            <div className="h-96">
              <EmotionDistributionChart data={emotionData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default LeaveCall;