"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";
import RoundCard from "@/components/RoundCard";

interface Round {
  id: string; date: string; course_name: string; holes_played: number;
  gross_score: number; net_score: number | null; par: number;
  fairways_hit: number; fairways_attempted: number;
  gir: number; gir_attempted: number;
  total_putts: number; chip_shots: number;
  pars_or_better: number; bogeys_or_worse: number; penalties: number;
}

export default function HistoryPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "9" | "18">("all");

  useEffect(() => {
    fetch("/api/rounds?limit=100").then(r => r.json()).then(d => { setRounds(d.rounds || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? rounds : rounds.filter(r => r.holes_played === parseInt(filter));

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-400 text-sm">Loading history...</div></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Round History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{rounds.length} total rounds tracked</p>
        </div>
        <Link href="/upload"><button className="btn-primary text-sm flex items-center gap-1.5"><Upload size={15} />New</button></Link>
      </div>

      {rounds.length > 0 && (
        <div className="flex gap-2">
          {(["all", "9", "18"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === f ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"}`}>
              {f === "all" ? "All Rounds" : `${f} Holes`}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-gray-500 dark:text-gray-400">{rounds.length === 0 ? "No rounds yet. Upload your first round!" : `No ${filter}-hole rounds found.`}</p>
          {rounds.length === 0 && <Link href="/upload" className="mt-4 inline-block"><button className="btn-primary">Upload First Round</button></Link>}
        </div>
      ) : (
        <div className="space-y-3">{filtered.map(round => <RoundCard key={round.id} round={round} />)}</div>
      )}
    </div>
  );
}
