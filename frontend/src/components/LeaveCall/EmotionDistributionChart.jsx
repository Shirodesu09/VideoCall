import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { emotionColors } from "../../utils/colorUtils";

const emotionNames = [
  "angry",
  "disgust",
  "fear",
  "happy",
  "neutral",
  "sad",
  "surprise",
];

export function EmotionDistributionChart({ data }) {
  const avg = emotionNames.map((e) => {
    const sum = data.reduce(
      (acc, item) => acc + (item.all_predictions?.[e] || 0),
      0
    );
    const value = sum / data.length;
    return {
      name: e.charAt(0).toUpperCase() + e.slice(1),
      value,
      color: emotionColors[e],
    };
  });

  const averageEmotions = [...avg].sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={averageEmotions}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        barSize={40}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
        <XAxis
          dataKey="name"
          scale="band"
          tick={{ fontSize: 12 }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          domain={[
            0,
            Math.max(...averageEmotions.map((i) => i.value)) * 1.2,
          ]}
        />
        <Legend />
        <Bar
          dataKey="value"
          name="Emotion Intensity"
          animationDuration={1500}
        >
          {averageEmotions.map((entry, idx) => (
            <Cell key={`cell-${idx}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
