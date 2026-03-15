import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  icon?: string;
  color?: "green" | "blue" | "orange" | "red" | "gray";
}

const colorMap = {
  green: "bg-green-50 border-green-200",
  blue: "bg-blue-50 border-blue-200",
  orange: "bg-orange-50 border-orange-200",
  red: "bg-red-50 border-red-200",
  gray: "bg-gray-50 border-gray-200",
};

export default function StatCard({ label, value, subValue, trend, trendLabel, icon, color = "gray" }: StatCardProps) {
  return (
    <div className={clsx("rounded-xl border p-4 flex flex-col gap-1", colorMap[color])}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subValue && <div className="text-xs text-gray-500">{subValue}</div>}
      {trendLabel && (
        <div className={clsx("text-xs font-medium mt-1",
          trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-gray-500"
        )}>
          {trend === "up" ? "↑ " : trend === "down" ? "↓ " : ""}{trendLabel}
        </div>
      )}
    </div>
  );
}
