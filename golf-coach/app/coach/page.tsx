"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Round {
  id: string; date: string; gross_score: number; par: number; holes_played: number;
  fairways_hit: number; fairways_attempted: number;
  gir: number; gir_attempted: number; total_putts: number;
  chip_shots: number; sand_shots: number; penalties: number;
  pars_or_better: number; bogeys_or_worse: number;
  ai_drills: Array<{ title: string; description: string; duration: string; focus_area: string; difficulty: string }>;
}

export default function CoachPage() {
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rounds?limit=20").then(r => r.json()).then(d => { setRounds(d.rounds || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-400 text-sm">Loading coach insights...</div></div>;

  if (rounds.length === 0) return (
    <div className="text-center py-16">
      <div className="text-4xl mb-3">🏌️</div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">No Data Yet</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">Upload a few rounds and your AI coach will build a personalized improvement plan.</p>
      <Link href="/upload"><button className="btn-primary">Upload First Round</button></Link>
    </div>
  );

  const avg = (arr: number[]) => arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : 0;

  const avgFw = avg(rounds.filter(r => r.fairways_attempted > 0).map(r => (r.fairways_hit / r.fairways_attempted) * 100));
  const avgGir = avg(rounds.filter(r => r.gir_attempted > 0).map(r => (r.gir / r.gir_attempted) * 100));
  const avgPuttsPerHole = avg(rounds.map(r => r.total_putts / r.holes_played));
  const avgChipsPerHole = avg(rounds.map(r => r.chip_shots / r.holes_played));
  const avgPenalties = avg(rounds.map(r => r.penalties));

  const weaknesses: Array<{ area: string; current: string; target: string; priority: "high" | "medium"; tip: string }> = [];
  if (avgFw < 50) weaknesses.push({ area: "Driving Accuracy", current: `${Math.round(avgFw)}% fairways hit`, target: "50%+ for single digits", priority: "high", tip: "Focus on tempo and alignment. Consider hitting 3-wood on tight holes." });
  if (avgGir < 35) weaknesses.push({ area: "Approach Shots / GIR", current: `${Math.round(avgGir)}% GIR`, target: "35%+ for single digits", priority: "high", tip: "Work on distance control with mid-irons. Aim for center of green." });
  if (avgPuttsPerHole > 2.0) weaknesses.push({ area: "Putting", current: `${avgPuttsPerHole} putts/hole`, target: "< 2.0 putts/hole", priority: avgPuttsPerHole > 2.2 ? "high" : "medium", tip: "Spend 50% of practice time on 3-6 foot putts. Gate drill daily." });
  if (avgChipsPerHole > 0.6) weaknesses.push({ area: "Short Game / Chipping", current: `${avgChipsPerHole} chips/hole`, target: "< 0.5 chips/hole", priority: "medium", tip: "Practice bump-and-run. Focus on landing spot, not the hole." });
  if (avgPenalties > 1.5) weaknesses.push({ area: "Course Management", current: `${avgPenalties} penalties/round`, target: "< 1 penalty/round", priority: "medium", tip: "Lay up more often. No hero shots from trouble." });

  const drillMap = new Map<string, typeof rounds[0]["ai_drills"][0]>();
  rounds.slice(0, 5).forEach(r => (r.ai_drills || []).forEach(d => { if (!drillMap.has(d.title)) drillMap.set(d.title, d); }));
  const allDrills = Array.from(drillMap.values()).slice(0, 8);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your AI Coach</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Based on {rounds.length} round{rounds.length !== 1 ? "s" : ""} • Goal: 14 → Single Digits</p>
      </div>

      <div className="card bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
        <h2 className="font-bold text-green-900 dark:text-green-300 mb-3">📊 Season Progress Snapshot</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Avg Fairway %", value: `${Math.round(avgFw)}%`, ok: avgFw >= 50 },
            { label: "Avg GIR %", value: `${Math.round(avgGir)}%`, ok: avgGir >= 35 },
            { label: "Avg Putts/Hole", value: avgPuttsPerHole, ok: avgPuttsPerHole <= 2.0 },
            { label: "Avg Chips/Hole", value: avgChipsPerHole, ok: avgChipsPerHole <= 0.5 },
          ].map((s, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between">
              <div><div className="text-xs text-gray-500 dark:text-gray-400">{s.label}</div><div className="font-bold text-gray-900 dark:text-gray-100">{s.value}</div></div>
              <span className={s.ok ? "text-green-500 text-lg" : "text-orange-400 text-lg"}>{s.ok ? "✓" : "⚠"}</span>
            </div>
          ))}
        </div>
      </div>

      {weaknesses.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">🎯 Areas to Focus On</h2>
          <div className="space-y-3">
            {weaknesses.map((w, i) => (
              <div key={i} className={`p-4 rounded-xl border ${w.priority === "high" ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{w.area}</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${w.priority === "high" ? "bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300" : "bg-yellow-200 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300"}`}>{w.priority === "high" ? "High Priority" : "Medium Priority"}</span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current: <strong>{w.current}</strong> → Target: {w.target}</div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{w.tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-2">📅 Weekly Practice Blueprint</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Tailored for: 1 range session/week + 9 holes/week</p>
        <div className="space-y-3">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-xl p-4">
            <div className="font-semibold text-green-900 dark:text-green-300 text-sm mb-1">🏌️ Range Session (~60 min)</div>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
              {avgFw < 50 && <li>• <strong>20 min:</strong> Tee shots — alignment sticks, tempo focus</li>}
              {avgGir < 35 && <li>• <strong>20 min:</strong> Mid-iron approaches — targets at 100, 125, 150 yds</li>}
              {avgChipsPerHole > 0.5 && <li>• <strong>10 min:</strong> Chipping — land-zone targeting drill</li>}
              <li>• <strong>10 min:</strong> Putting — 3-6 foot gate drill on practice green</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4">
            <div className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-1">⛳ On-Course (9 holes)</div>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5">
              {avgFw < 50 && <li>• Pick a landing zone before every tee shot</li>}
              {avgGir < 35 && <li>• Aim for center of green on all approach shots</li>}
              {avgPuttsPerHole > 2.0 && <li>• Focus on lag putting — no 3-putts goal</li>}
              {avgPenalties > 1.5 && <li>• Play conservatively — take smart lay-ups</li>}
              <li>• Track: which holes cost you the most strokes?</li>
            </ul>
          </div>
        </div>
      </div>

      {allDrills.length > 0 && (
        <div className="card">
          <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-4">🔧 Your Drill Library</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Drills recommended from your recent rounds</p>
          <div className="space-y-3">
            {allDrills.map((drill, i) => (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{drill.title}</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">{drill.focus_area}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">⏱ {drill.duration}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{drill.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card bg-gray-50 dark:bg-gray-800/50">
        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-3">🏆 Milestones to Single Digits</h2>
        <div className="space-y-2">
          {[
            { label: "Shoot +7 or better for 9 holes", done: rounds.some(r => r.holes_played === 9 && (r.gross_score - r.par) <= 7) },
            { label: "Hit 50%+ fairways in a round", done: rounds.some(r => r.fairways_attempted > 0 && r.fairways_hit / r.fairways_attempted >= 0.5) },
            { label: "Hit 40%+ GIR in a round", done: rounds.some(r => r.gir_attempted > 0 && r.gir / r.gir_attempted >= 0.4) },
            { label: "18 or fewer putts for 9 holes", done: rounds.some(r => r.holes_played === 9 && r.total_putts <= 18) },
            { label: "No penalty strokes in a round", done: rounds.some(r => r.penalties === 0) },
            { label: "5+ pars or better in 9 holes", done: rounds.some(r => r.holes_played === 9 && r.pars_or_better >= 5) },
          ].map((m, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className={`text-lg ${m.done ? "text-green-500" : "text-gray-300 dark:text-gray-600"}`}>{m.done ? "✅" : "⭕"}</span>
              <span className={`text-sm ${m.done ? "text-green-700 dark:text-green-400 font-medium" : "text-gray-600 dark:text-gray-400"}`}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
