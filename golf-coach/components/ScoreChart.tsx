"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useTheme } from "./ThemeProvider";

interface ScoreChartProps {
  data: Array<{ date: string; gross_score: number; par: number; holes_played: number }>;
}

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export default function ScoreChart({ data }: ScoreChartProps) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const chartData = [...data].reverse().map(r => ({
    date: parseLocalDate(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    scoreToPar: r.gross_score - r.par,
  }));

  const gridColor = dark ? "#374151" : "#f0f0f0";
  const tickColor = dark ? "#6b7280" : "#9ca3af";
  const tooltipStyle = dark
    ? { fontSize: 12, borderRadius: 8, backgroundColor: "#1f2937", border: "1px solid #374151", color: "#f9fafb" }
    : { fontSize: 12, borderRadius: 8 };

  return (
    <div>
      <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3">Score vs Par (Recent Rounds)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: tickColor }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: tickColor }} tickLine={false} tickFormatter={v => v > 0 ? `+${v}` : `${v}`} />
          <Tooltip formatter={(value) => [Number(value) > 0 ? `+${value}` : `${value}`, "Score to Par"]} contentStyle={tooltipStyle} />
          <ReferenceLine y={0} stroke="#16a34a" strokeDasharray="4 4" />
          <Line type="monotone" dataKey="scoreToPar" stroke="#16a34a" strokeWidth={2.5} dot={{ fill: "#16a34a", r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
