"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Upload } from "lucide-react";
import StatCard from "@/components/StatCard";
import ScoreChart from "@/components/ScoreChart";
import StatsChart from "@/components/StatsChart";
import RoundCard from "@/components/RoundCard";

interface RoundSummary {
  id: string; date: string; course_name: string; holes_played: number;
  gross_score: number; net_score: number | null; par: number;
  fairways_hit: number; fairways_attempted: number;
  gir: number; gir_attempted: number;
  total_putts: number; chip_shots: number;
  pars_or_better: number; bogeys_or_worse: number; penalties: number;
}

function getYear(dateStr: string) {
  return dateStr.split("-")[0];
}

export default function Dashboard() {
  const [allRounds, setAllRounds] = useState<RoundSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/rounds?limit=200").then(r => r.json()).then(d => {
      setAllRounds(d.rounds || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const years = Array.from(new Set(allRounds.map(r => getYear(r.date)))).sort((a, b) => b.localeCompare(a));

  const rounds = yearFilter === "all"
    ? allRounds
    : allRounds.filter(r => getYear(r.date) === yearFilter);

  const lastRound = rounds[0];

  const avgOf = (arr: number[]) => arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null;

  const avgFwPct = avgOf(rounds.filter(r => r.fairways_attempted > 0).map(r => Math.round((r.fairways_hit / r.fairways_attempted) * 100)));
  const avgGirPct = avgOf(rounds.filter(r => r.gir_attempted > 0).map(r => Math.round((r.gir / r.gir_attempted) * 100)));
  const avgPutts = avgOf(rounds.map(r => r.total_putts));

  const chartData = rounds.slice(0, 10).map(r => ({
    date: r.date, gross_score: r.gross_score, par: r.par, holes_played: r.holes_played,
    fairway_pct: r.fairways_attempted > 0 ? Math.round((r.fairways_hit / r.fairways_attempted) * 100) : 0,
    gir_pct: r.gir_attempted > 0 ? Math.round((r.gir / r.gir_attempted) * 100) : 0,
    putts_per_hole: r.holes_played > 0 ? Math.round((r.total_putts / r.holes_played) * 10) / 10 : 0,
  }));

  const filterLabel = yearFilter === "all" ? "All Time" : yearFilter;

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center"><div className="text-4xl mb-3">⛳</div><div className="text-gray-500 dark:text-gray-400 text-sm">Loading your stats...</div></div>
    </div>
  );

  if (allRounds.length === 0) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⛳</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Welcome, Michael!</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Upload your first round from 18 Birdies to start your AI coaching journey. Goal: 14 → single digits!</p>
        <Link href="/upload"><button className="btn-primary flex items-center gap-2 mx-auto"><Upload size={18} />Upload First Round</button></Link>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{rounds.length} round{rounds.length !== 1 ? "s" : ""} • Goal: 14 → Single Digits</p>
        </div>
        <Link href="/upload"><button className="btn-primary flex items-center gap-2 text-sm"><Upload size={16} /><span className="hidden sm:inline">New Round</span><span className="sm:hidden">+</span></button></Link>
      </div>

      {years.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setYearFilter("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${yearFilter === "all" ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
          >
            All Time
          </button>
          {years.map(y => (
            <button
              key={y}
              onClick={() => setYearFilter(y)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${yearFilter === y ? "bg-green-600 text-white" : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">{filterLabel} Averages</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {avgFwPct !== null && <StatCard label="Fairways Hit" value={`${avgFwPct}%`} subValue={filterLabel} icon="🎯" color={Number(avgFwPct) >= 50 ? "green" : "orange"} />}
          {avgGirPct !== null && <StatCard label="GIR %" value={`${avgGirPct}%`} subValue={filterLabel} icon="🟢" color={Number(avgGirPct) >= 40 ? "green" : "orange"} />}
          {avgPutts !== null && <StatCard label="Avg Putts" value={avgPutts} subValue="per round" icon="🏴" color={Number(avgPutts) <= 16 ? "green" : "orange"} />}
          <StatCard label="Rounds Played" value={rounds.length} subValue={filterLabel} icon="📋" color="blue" />
        </div>
      </div>

      {chartData.length >= 2 && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="card"><ScoreChart data={chartData} /></div>
          <div className="card"><StatsChart data={chartData} /></div>
        </div>
      )}

      {lastRound && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Latest Round</h2>
          <RoundCard round={lastRound} />
        </div>
      )}

      {rounds.length > 1 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Recent Rounds</h2>
            <Link href="/history" className="text-sm text-green-600 dark:text-green-400 font-medium hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {rounds.slice(1, 4).map(round => <RoundCard key={round.id} round={round} />)}
          </div>
        </div>
      )}
    </div>
  );
}
