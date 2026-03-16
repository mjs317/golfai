"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTheme } from "./ThemeProvider";

interface StatsChartProps {
  data: Array<{ date: string; fairway_pct: number; gir_pct: number }>;
}

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function StatsChart({ data }: StatsChartProps) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const chartData = [...data].reverse().map(r => ({
    date: parseLocalDate(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "FW%": r.fairway_pct,
    "GIR%": r.gir_pct,
  }));

  const gridColor = dark ? "#374151" : "#f0f0f0";
  const tickColor = dark ? "#6b7280" : "#9ca3af";
  const tooltipStyle = dark
    ? { fontSize: 12, borderRadius: 8, backgroundColor: "#1f2937", border: "1px solid #374151", color: "#f9fafb" }
    : { fontSize: 12, borderRadius: 8 };

  return (
    <div>
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3">Fairway & GIR % (Recent Rounds)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
          <Tooltip formatter={(value) => [`${value}%`]} contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
          <Bar dataKey="FW%" fill="#16a34a" radius={[3, 3, 0, 0]} />
          <Bar dataKey="GIR%" fill="#3b82f6" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
