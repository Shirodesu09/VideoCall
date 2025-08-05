import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getEmotionColor } from '../../utils/colorUtils';

const emotionValues = {
  angry: 1,
  disgust: 2,
  fear: 3,
  sad: 4,
  neutral: 5,
  happy: 6,
  surprise: 7
};

const CustomTimelineTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const emotionColor = getEmotionColor(data.emotion);
    return (
      <div className="bg-white p-4 shadow-lg rounded-md border border-gray-200">
        <p className="text-sm text-gray-500">{data.timestamp}</p>
        <p className="font-medium mt-1">
          Emotion: <span style={{ color: emotionColor }}>{data.emotion}</span>
        </p>
        <p className="text-sm"> Confidence: {data.Confidence}</p>
      </div>
    );
  }
  return null;
};

const CustomizedDot = ({ cx, cy, payload }) => {
  const color = getEmotionColor(payload.emotion);
  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      fill={color}
      stroke="#fff"
      strokeWidth={2}
      className="transition-all duration-300 ease-in-out hover:r-7"
    />
  );
};

export function EmotionTimelineChart({ data }) {
  const chartData = data.map((item, index) => ({
    ...item,
    index,
    emotionValue: emotionValues[item.emotion] || emotionValues.neutral,
    displayTime: item.timestamp.split(', ')[1]
  }));

  const getTicks = () => {
    if (chartData.length <= 10) return chartData.map((_, i) => i);
    const interval = Math.ceil(chartData.length / 10);
    const ticks = [];
    for (let i = 0; i < chartData.length; i += interval) ticks.push(i);
    if (!ticks.includes(chartData.length - 1)) ticks.push(chartData.length - 1);
    return ticks;
  };

  // Calculate dynamic width based on data length
  const minWidth = 800; // Minimum width of the chart
  const itemWidth = 100; // Width per data point
  const chartWidth = Math.max(minWidth, chartData.length * itemWidth);

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ width: `${chartWidth}px`, height: "500px" }}>
        <LineChart 
          width={chartWidth}
          height={500}
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis
            dataKey="index"
            ticks={getTicks()}
            tickFormatter={(i) => chartData[i]?.displayTime || ''}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis
            domain={[1, 7]}
            ticks={[1,2,3,4,5,6,7]}
            tickFormatter={(v) => {
              const keys = Object.keys(emotionValues);
              const emot = keys.find((k) => emotionValues[k] === v);
              return emot ? emot.charAt(0).toUpperCase() + emot.slice(1) : '';
            }}
          />
          <Tooltip content={<CustomTimelineTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="emotionValue"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
            dot={<CustomizedDot />}
            name="Emotion"
          />
        </LineChart>
      </div>
    </div>
  );
}