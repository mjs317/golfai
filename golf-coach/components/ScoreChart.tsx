"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

interface ScoreChartProps {
  data: Array<{ date: string; gross_score: number; par: number; holes_played: number }>;
}

export default function ScoreChart({ data }: ScoreChartProps) {
  const chartData = [...data].reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    scoreToPar: r.gross_score - r.par,
  }));

  return (
    <div>
      <h3 className="font-semibold text-gray-700 text-sm mb-3">Score vs Par (Recent Rounds)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} tickFormatter={v => v > 0 ? `+${v}` : `${v}`} />
          <Tooltip formatter={(value) => [Number(value) > 0 ? `+${value}` : `${value}`, "Score to Par"]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <ReferenceLine y={0} stroke="#16a34a" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="scoreToPar" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: "#16a34a", r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
