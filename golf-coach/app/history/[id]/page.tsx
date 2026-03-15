"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Drill, HoleData } from "@/lib/types";
import clsx from "clsx";

interface RoundDetail {
  id: string; date: string; course_name: string; holes_played: number;
  gross_score: number; net_score: number | null; par: number;
  fairways_hit: number; fairways_attempted: number;
  gir: number; gir_attempted: number; total_putts: number;
  chip_shots: number; sand_shots: number; penalties: number;
  pars_or_better: number; bogeys_or_worse: number;
  holes: HoleData[]; ai_recap: string;
  ai_strengths: string[]; ai_weaknesses: string[]; ai_drills: Drill[];
  notes: string;
}

export default function RoundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [round, setRound] = useState<RoundDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/rounds/${params.id}`).then(r => r.json()).then(d => { setRound(d.round); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Delete this round?")) return;
    await fetch(`/api/rounds?id=${round?.id}`, { method: "DELETE" });
    router.push("/history");
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="text-gray-400 text-sm">Loading...</div></div>;
  if (!round) return <div className="text-center py-16"><p className="text-gray-500">Round not found.</p><Link href="/history"><button className="btn-secondary mt-4">Back to History</button></Link></div>;

  const scoreToPar = round.gross_score - round.par;
  const fwPct = round.fairways_attempted > 0 ? Math.round((round.fairways_hit / round.fairways_attempted) * 100) : null;
  const girPct = round.gir_attempted > 0 ? Math.round((round.gir / round.gir_attempted) * 100) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/history" className="flex items-center gap-1 text-gray-500 hover:text-gray-900 text-sm"><ArrowLeft size={16} />History</Link>
        <button onClick={handleDelete} className="flex items-center gap-1 text-red-400 hover:text-red-600 text-sm"><Trash2 size={15} />Delete</button>
      </div>

      <div className="card text-center">
        <p className="text-sm text-gray-500">{round.course_name} • {new Date(round.date).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
        <div className="flex justify-center gap-8 mt-3">
          <div><div className="text-4xl font-bold text-gray-900">{round.gross_score}</div><div className="text-xs text-gray-500 mt-0.5">Gross</div></div>
          <div>
            <div className={clsx("text-4xl font-bold", scoreToPar < 0 ? "text-green-600" : scoreToPar === 0 ? "text-gray-700" : "text-red-500")}>
              {scoreToPar === 0 ? "E" : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">vs Par {round.par}</div>
          </div>
          {round.net_score && <div><div className="text-4xl font-bold text-blue-600">{round.net_score}</div><div className="text-xs text-gray-500 mt-0.5">Net</div></div>}
        </div>
        <div className="mt-2 text-xs text-gray-400">{round.holes_played} holes</div>
      </div>

      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4 text-sm">Round Stats</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Fairways", value: fwPct !== null ? `${fwPct}%` : "N/A", sub: `${round.fairways_hit}/${round.fairways_attempted}` },
            { label: "GIR", value: girPct !== null ? `${girPct}%` : "N/A", sub: `${round.gir}/${round.gir_attempted}` },
            { label: "Putts", value: round.total_putts, sub: `${round.holes_played > 0 ? Math.round((round.total_putts / round.holes_played) * 10) / 10 : 0}/hole` },
            { label: "Chips", value: round.chip_shots, sub: "shots" },
            { label: "Sand", value: round.sand_shots, sub: "shots" },
            { label: "Penalties", value: round.penalties, sub: "strokes" },
          ].map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
              <div className="text-xs text-gray-400">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {round.holes && round.holes.length > 0 && (
        <div className="card overflow-x-auto">
          <h3 className="font-bold text-gray-900 mb-3 text-sm">Hole by Hole</h3>
          <table className="w-full text-xs text-center min-w-max">
            <thead><tr className="text-gray-400"><th className="pb-2 text-left">Hole</th><th className="pb-2">Par</th><th className="pb-2">Score</th><th className="pb-2">+/-</th><th className="pb-2">FW</th><th className="pb-2">GIR</th><th className="pb-2">Putts</th><th className="pb-2">Chips</th><th className="pb-2">Pen</th></tr></thead>
            <tbody>
              {round.holes.map((h: HoleData) => {
                const diff = h.score - h.par;
                return (
                  <tr key={h.hole} className="border-t border-gray-100">
                    <td className="py-1.5 text-left font-medium text-gray-700">{h.hole}</td>
                    <td className="py-1.5 text-gray-500">{h.par}</td>
                    <td className="py-1.5"><span className={clsx("font-bold", diff <= -2 ? "text-yellow-500" : diff === -1 ? "text-green-600" : diff === 0 ? "text-gray-700" : diff === 1 ? "text-orange-500" : "text-red-500")}>{h.score}</span></td>
                    <td className={clsx("py-1.5 font-medium", diff < 0 ? "text-green-600" : diff === 0 ? "text-gray-500" : "text-red-500")}>{diff === 0 ? "E" : diff > 0 ? `+${diff}` : diff}</td>
                    <td className="py-1.5">{h.fairway_hit === null ? <span className="text-gray-300">—</span> : h.fairway_hit ? <span className="text-green-500">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="py-1.5">{h.gir ? <span className="text-green-500">✓</span> : <span className="text-red-400">✗</span>}</td>
                    <td className="py-1.5 text-gray-700">{h.putts}</td>
                    <td className="py-1.5 text-gray-700">{h.chip_shots}</td>
                    <td className="py-1.5 text-gray-700">{h.penalties || 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {round.ai_recap && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-2">🎯 Coach&apos;s Recap</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{round.ai_recap}</p>
        </div>
      )}

      {(round.ai_strengths?.length > 0 || round.ai_weaknesses?.length > 0) && (
        <div className="grid md:grid-cols-2 gap-4">
          {round.ai_strengths?.length > 0 && <div className="card"><h3 className="font-bold text-gray-900 mb-3 text-sm">✅ Strengths</h3><ul className="space-y-2">{round.ai_strengths.map((s: string, i: number) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-green-500">•</span>{s}</li>)}</ul></div>}
          {round.ai_weaknesses?.length > 0 && <div className="card"><h3 className="font-bold text-gray-900 mb-3 text-sm">🔧 Focus Areas</h3><ul className="space-y-2">{round.ai_weaknesses.map((w: string, i: number) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-orange-400">•</span>{w}</li>)}</ul></div>}
        </div>
      )}

      {round.ai_drills?.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">🏌️ Recommended Drills</h3>
          <div className="space-y-3">
            {round.ai_drills.map((drill: Drill, i: number) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{i + 1}. {drill.title}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{drill.focus_area}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">⏱ {drill.duration}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{drill.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {round.notes && (
        <div className="card bg-yellow-50 border-yellow-100">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">📝 Notes</h3>
          <p className="text-sm text-gray-700">{round.notes}</p>
        </div>
      )}
    </div>
  );
}
