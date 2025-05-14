import { useEffect, useState } from 'react';
import { useEmotionStore } from "../../store";
import {EmotionDistributionChart} from "./EmotionDistributionChart"
import EmotionSummary from "./EmotionSummary"
import {EmotionTimelineChart} from "./EmotionTimelineChart"
import { BarChartIcon, PieChartIcon } from 'lucide-react';

function LeaveCall() {
  const { emotionHistory } = useEmotionStore();
  const [emotionData, setEmotionData] = useState([]);

  useEffect(() => {
    console.log("Saving Emotion History:", emotionHistory);
    localStorage.setItem('emotionHistory', JSON.stringify(emotionHistory));
  }, [emotionHistory]);

  // ✅ Load from localStorage on component mount (and after saves)
  useEffect(() => {
    const storedData = localStorage.getItem('emotionHistory');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setEmotionData(parsedData);
      console.log("Loaded Emotion History:", parsedData);
    }
  }, []); // Runs once on mount

  return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
              <PieChartIcon className="h-6 w-6 text-indigo-500" />
              Emotion Analytics Dashboard
            </h1>
            <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</span>
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