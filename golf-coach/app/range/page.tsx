"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Circle, RefreshCw, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";
import { RangePlan, RangePlanSection } from "@/lib/claude";

const SESSION_LENGTHS = [
  { value: 30, label: "30 min", desc: "Quick session" },
  { value: 60, label: "60 min", desc: "Standard" },
  { value: 90, label: "90 min", desc: "Full session" },
];

const COLOR_CLASSES: Record<string, string> = {
  gray:   "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50",
  blue:   "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20",
  green:  "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20",
  orange: "border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/20",
  purple: "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20",
};

const TITLE_CLASSES: Record<string, string> = {
  gray:   "text-gray-800 dark:text-gray-200",
  blue:   "text-blue-800 dark:text-blue-300",
  green:  "text-green-800 dark:text-green-300",
  orange: "text-orange-800 dark:text-orange-300",
  purple: "text-purple-800 dark:text-purple-300",
};

function SectionCard({
  section,
  checked,
  onToggle,
}: {
  section: RangePlanSection;
  checked: Set<string>;
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const doneCount = section.items.filter(i => checked.has(i.id)).length;
  const allDone = doneCount === section.items.length;

  return (
    <div className={clsx("rounded-xl border p-4", COLOR_CLASSES[section.color])}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between mb-1"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{section.emoji}</span>
          <span className={clsx("font-semibold text-sm", TITLE_CLASSES[section.color])}>{section.title}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">· {section.duration}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">{doneCount}/{section.items.length}</span>
          {allDone && <CheckCircle2 size={16} className="text-green-500" />}
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="space-y-2 mt-3">
          {section.items.map(item => {
            const done = checked.has(item.id);
            return (
              <button
                key={item.id}
                onClick={() => onToggle(item.id)}
                className="w-full text-left flex items-start gap-3 p-2.5 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors"
              >
                <div className="mt-0.5 flex-shrink-0">
                  {done
                    ? <CheckCircle2 size={18} className="text-green-500" />
                    : <Circle size={18} className="text-gray-400 dark:text-gray-500" />
                  }
                </div>
                <div>
                  <p className={clsx("text-sm font-medium leading-snug", done ? "line-through text-gray-400 dark:text-gray-500" : "text-gray-800 dark:text-gray-200")}>
                    {item.text}
                  </p>
                  {item.note && !done && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.note}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function RangePage() {
  const [sessionMinutes, setSessionMinutes] = useState(60);
  const [plan, setPlan] = useState<RangePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // Persist checked state in localStorage per plan
  const planKey = plan ? `range-checked-${plan.session_title.slice(0, 20)}` : null;

  useEffect(() => {
    if (planKey) {
      const stored = localStorage.getItem(planKey);
      if (stored) setChecked(new Set(JSON.parse(stored)));
    }
  }, [planKey]);

  const handleToggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      if (planKey) localStorage.setItem(planKey, JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    setChecked(new Set());
    try {
      const res = await fetch("/api/range", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionMinutes }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.error || "Failed to generate plan");
      }
      const data = await res.json();
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const allItems = plan?.sections.flatMap(s => s.items) ?? [];
  const totalDone = allItems.filter(i => checked.has(i.id)).length;
  const totalItems = allItems.length;
  const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Dumbbell size={24} className="text-green-600" /> Range Practice
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Generate an AI-powered practice session based on your recent rounds
        </p>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 text-sm">Session Length</h2>
        <div className="flex gap-2 mb-4">
          {SESSION_LENGTHS.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => setSessionMinutes(value)}
              className={clsx(
                "flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                sessionMinutes === value
                  ? "bg-green-600 border-green-600 text-white"
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-green-400"
              )}
            >
              <div>{label}</div>
              <div className={clsx("text-xs font-normal", sessionMinutes === value ? "text-green-100" : "text-gray-400")}>{desc}</div>
            </button>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin" />Generating your session...</> : <><Dumbbell size={18} />{plan ? "Generate New Session" : "Generate Practice Session"}</>}
        </button>

        {error && (
          <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
      </div>

      {plan && (
        <>
          <div className="card">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="font-bold text-gray-900 dark:text-gray-100">{plan.session_title}</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">⏱ {plan.total_time}</p>
              </div>
              <button onClick={generate} disabled={loading} className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                <RefreshCw size={13} />New
              </button>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{plan.focus_summary}</p>

            {totalItems > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                  <span>Progress</span>
                  <span>{totalDone}/{totalItems} items · {pct}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {pct === 100 && (
                  <p className="text-center text-sm text-green-600 dark:text-green-400 font-semibold mt-2">
                    🎉 Session complete! Great work!
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {plan.sections.map(section => (
              <SectionCard
                key={section.id}
                section={section}
                checked={checked}
                onToggle={handleToggle}
              />
            ))}
          </div>

          <div className="card bg-gray-50 dark:bg-gray-800/50 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tap any item to check it off as you complete it. Progress is saved automatically.
            </p>
          </div>
        </>
      )}

      {!plan && !loading && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Select a session length and generate your personalized range plan</p>
        </div>
      )}
    </div>
  );
}
