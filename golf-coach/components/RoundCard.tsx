import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import clsx from "clsx";

interface RoundCardProps {
  round: {
    id: string; date: string; course_name: string; holes_played: number;
    gross_score: number; net_score: number | null; par: number;
    fairways_hit: number; fairways_attempted: number;
    gir: number; gir_attempted: number;
    total_putts: number; pars_or_better: number;
  };
}

export default function RoundCard({ round }: RoundCardProps) {
  const scoreToPar = round.gross_score - round.par;
  const fwPct = round.fairways_attempted > 0 ? Math.round((round.fairways_hit / round.fairways_attempted) * 100) : null;
  const girPct = round.gir_attempted > 0 ? Math.round((round.gir / round.gir_attempted) * 100) : null;

  return (
    <Link href={`/history/${round.id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
              <MapPin size={12} /><span>{round.course_name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar size={12} />
              <span>{new Date(round.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{round.holes_played} holes</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{round.gross_score}</div>
            <div className={clsx("text-sm font-semibold",
              scoreToPar < 0 ? "text-green-600" : scoreToPar === 0 ? "text-gray-600" : "text-red-500"
            )}>
              {scoreToPar === 0 ? "E" : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`}
            </div>
            {round.net_score && <div className="text-xs text-gray-400">Net {round.net_score}</div>}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 pt-3 border-t border-gray-100">
          {fwPct !== null && <div className="text-center"><div className="text-sm font-bold text-gray-800">{fwPct}%</div><div className="text-xs text-gray-400">FW Hit</div></div>}
          {girPct !== null && <div className="text-center"><div className="text-sm font-bold text-gray-800">{girPct}%</div><div className="text-xs text-gray-400">GIR</div></div>}
          <div className="text-center"><div className="text-sm font-bold text-gray-800">{round.total_putts}</div><div className="text-xs text-gray-400">Putts</div></div>
          <div className="text-center"><div className="text-sm font-bold text-gray-800">{round.pars_or_better}</div><div className="text-xs text-gray-400">Par+</div></div>
        </div>
      </div>
    </Link>
  );
}
