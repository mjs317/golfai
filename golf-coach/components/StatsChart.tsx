"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface StatsChartProps {
  data: Array<{ date: string; fairway_pct: number; gir_pct: number }>;
}

export default function StatsChart({ data }: StatsChartProps) {
  const chartData = [...data].reverse().map(r => ({
    date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "FW%": r.fairway_pct,
    "GIR%": r.gir_pct,
  }));

  return (
    <div>
      <h3 className="font-semibold text-gray-700 text-sm mb-3">Fairway & GIR % (Recent Rounds)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip formatter={(value) => [`${value}%`]} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="FW%" fill="#16a34a" radius={[3, 3, 0, 0]} />
          <Bar dataKey="GIR%" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
