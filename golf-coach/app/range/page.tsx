"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Circle, RefreshCw, Dumbbell, ChevronDown, ChevronUp, Save, Check, Trash2 } from "lucide-react";
import clsx from "clsx";
import { RangePlan, RangePlanSection } from "@/lib/claude";

type SessionType = 'practice' | 'warmup';
type ActiveTab = 'generate' | 'history';

const PRACTICE_LENGTHS = [
  { value: 30, label: "30 min", desc: "Quick session" },
  { value: 60, label: "60 min", desc: "Standard" },
  { value: 90, label: "90 min", desc: "Full session" },
];

const WARMUP_LENGTHS = [
  { value: 10, label: "10 min", desc: "Very quick" },
  { value: 20, label: "20 min", desc: "Standard" },
  { value: 30, label: "30 min", desc: "Full warm-up" },
];

interface HistorySession {
  id: string;
  session_title: string;
  total_time: string;
  focus_summary: string;
  session_notes: string | null;
  completed_at: string;
  session_type: 'practice' | 'warmup';
}

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

function TypeBadge({ type }: { type: 'practice' | 'warmup' }) {
  return (
    <span className={clsx(
      "text-xs font-medium px-2 py-0.5 rounded-full",
      type === 'warmup'
        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
    )}>
      {type === 'warmup' ? 'Warm-Up' : 'Practice'}
    </span>
  );
}

export default function RangePage() {
  // Session generation state
  const [sessionType, setSessionType] = useState<SessionType>('practice');
  const [sessionMinutes, setSessionMinutes] = useState(60);
  const [chippingGreen, setChippingGreen] = useState(true);
  const [puttingGreen, setPuttingGreen] = useState(true);
  const [plan, setPlan] = useState<RangePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  // Session notes + save state
  const [sessionNotes, setSessionNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<ActiveTab>('generate');

  // History state
  const [sessions, setSessions] = useState<HistorySession[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Persist checked state in localStorage per plan
  const planKey = plan ? `range-checked-${plan.session_title.slice(0, 20)}` : null;

  useEffect(() => {
    if (planKey) {
      const stored = localStorage.getItem(planKey);
      if (stored) setChecked(new Set(JSON.parse(stored)));
    }
  }, [planKey]);

  // Reset session minutes when session type changes if current value isn't valid
  useEffect(() => {
    const validValues = (sessionType === 'practice' ? PRACTICE_LENGTHS : WARMUP_LENGTHS).map(l => l.value);
    if (!validValues.includes(sessionMinutes)) {
      setSessionMinutes(sessionType === 'practice' ? 60 : 20);
    }
  }, [sessionType]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setConfirmDeleteId(null);
    if (tab === 'history' && sessions.length === 0 && !historyLoading) {
      loadHistory();
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch('/api/range/sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      // silent
    } finally {
      setHistoryLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/range/sessions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch {
      // silent
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

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
    setSessionNotes("");
    setSaved(false);
    try {
      const res = await fetch("/api/range", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionMinutes,
          sessionType,
          facilityOptions: { chippingGreen, puttingGreen },
        }),
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

  const saveSession = async () => {
    if (!plan || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/range/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_title: plan.session_title,
          total_time: plan.total_time,
          focus_summary: plan.focus_summary,
          sections: plan.sections,
          session_notes: sessionNotes.trim() || null,
          session_type: sessionType,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      const savedData = await res.json();
      setSaved(true);
      // Optimistically prepend to history so the count badge and list update immediately
      setSessions(prev => [{
        id: savedData.session.id,
        session_title: plan.session_title,
        total_time: plan.total_time,
        focus_summary: plan.focus_summary,
        session_notes: sessionNotes.trim() || null,
        completed_at: savedData.session.completed_at,
        session_type: sessionType,
      }, ...prev]);
      // Clear localStorage checklist since it's now saved
      if (planKey) localStorage.removeItem(planKey);
    } catch {
      // Silently handle — don't break the flow
    } finally {
      setSaving(false);
    }
  };

  const allItems = plan?.sections.flatMap(s => s.items) ?? [];
  const totalDone = allItems.filter(i => checked.has(i.id)).length;
  const totalItems = allItems.length;
  const pct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
  const isComplete = pct === 100 && totalItems > 0;

  const sessionLengths = sessionType === 'practice' ? PRACTICE_LENGTHS : WARMUP_LENGTHS;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Dumbbell size={24} className="text-green-600" /> Range Practice
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          AI-powered sessions that learn from your rounds and evolve as you improve
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => handleTabChange('generate')}
          className={clsx(
            "flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'generate'
              ? "border-green-600 text-green-600 dark:text-green-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          Session
        </button>
        <button
          onClick={() => handleTabChange('history')}
          className={clsx(
            "flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'history'
              ? "border-green-600 text-green-600 dark:text-green-400"
              : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          )}
        >
          History{sessions.length > 0 && <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">({sessions.length})</span>}
        </button>
      </div>

      {/* Generate tab */}
      {activeTab === 'generate' && (
        <>
          <div className="card">
            {/* Session type toggle */}
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">Session Type</h2>
              <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => setSessionType('practice')}
                  className={clsx(
                    "flex-1 py-2 text-sm font-medium transition-colors",
                    sessionType === 'practice'
                      ? "bg-green-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  Practice Session
                </button>
                <button
                  onClick={() => setSessionType('warmup')}
                  className={clsx(
                    "flex-1 py-2 text-sm font-medium transition-colors border-l border-gray-200 dark:border-gray-700",
                    sessionType === 'warmup'
                      ? "bg-green-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  Pre-Round Warm-Up
                </button>
              </div>
              {sessionType === 'warmup' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  Focused warm-up before your round — builds rhythm and confidence, not swing changes.
                </p>
              )}
            </div>

            {/* Session length */}
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">Session Length</h2>
            <div className="flex gap-2 mb-4">
              {sessionLengths.map(({ value, label, desc }) => (
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

            {/* Facility checkboxes */}
            <div className="mb-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-sm">Available Facilities</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={chippingGreen}
                    onChange={e => setChippingGreen(e.target.checked)}
                    className="w-4 h-4 rounded accent-green-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Chipping green available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={puttingGreen}
                    onChange={e => setPuttingGreen(e.target.checked)}
                    className="w-4 h-4 rounded accent-green-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Putting green available</span>
                </label>
              </div>
            </div>

            <button
              onClick={generate}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin" />Generating your session...</>
                : <><Dumbbell size={18} />{plan ? "Generate New Session" : sessionType === 'warmup' ? "Generate Warm-Up Plan" : "Generate Practice Session"}</>
              }
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
                    <div className="flex items-center gap-2 mb-1">
                      <TypeBadge type={sessionType} />
                    </div>
                    <h2 className="font-bold text-gray-900 dark:text-gray-100">{plan.session_title}</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">⏱ {plan.total_time}</p>
                  </div>
                  {!saved && (
                    <button onClick={generate} disabled={loading} className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400 transition-colors">
                      <RefreshCw size={13} />New
                    </button>
                  )}
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

              {/* Notes + Save — appears when session is 100% complete */}
              {isComplete && (
                <div className={clsx(
                  "card border-2 transition-all",
                  saved
                    ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20"
                    : "border-green-200 dark:border-green-700"
                )}>
                  {saved ? (
                    <div className="text-center py-2">
                      <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 font-semibold mb-1">
                        <Check size={20} />Session saved to your log!
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Your notes and this session will inform your next AI-generated plan.
                      </p>
                      <button
                        onClick={generate}
                        className="mt-3 btn-primary text-sm flex items-center gap-2 mx-auto"
                      >
                        <Dumbbell size={16} />{sessionType === 'warmup' ? 'Generate New Warm-Up' : 'Generate Next Session'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">🎉</span>
                        <h3 className="font-bold text-gray-900 dark:text-gray-100">Session Complete!</h3>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Add notes about what felt good, what needs more work, or anything you want Claude to remember for next time.
                      </p>
                      <textarea
                        value={sessionNotes}
                        onChange={e => setSessionNotes(e.target.value)}
                        placeholder={sessionType === 'warmup'
                          ? "e.g. Felt loose and confident off the tee. Short irons felt sharp. Driver needed a few extra swings to find rhythm."
                          : "e.g. Alignment stick drill really clicked today. Still struggling with lag putting. Driver felt much better with the tempo cue."
                        }
                        className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-800 mb-3"
                        rows={3}
                      />
                      <button
                        onClick={saveSession}
                        disabled={saving}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {saving
                          ? <><Loader2 size={16} className="animate-spin" />Saving...</>
                          : <><Save size={16} />Save Session & Notes</>
                        }
                      </button>
                    </>
                  )}
                </div>
              )}

              {!isComplete && (
                <div className="card bg-gray-50 dark:bg-gray-800/50 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tap any item to check it off as you complete it. Notes and save unlock when you finish the session.
                  </p>
                </div>
              )}
            </>
          )}

          {!plan && !loading && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a session type and generate your personalized plan</p>
              <p className="text-xs mt-1 opacity-70">Claude uses your recent rounds and past sessions to build a targeted plan</p>
            </div>
          )}
        </>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div>
          {historyLoading && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin" />Loading history...
            </div>
          )}

          {!historyLoading && sessions.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-gray-500">
              <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No sessions saved yet.</p>
              <p className="text-xs mt-1 opacity-70">Complete a session on the Session tab to see it here.</p>
            </div>
          )}

          {!historyLoading && sessions.length > 0 && (
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="card">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <TypeBadge type={session.session_type} />
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{session.total_time}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {new Date(session.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{session.session_title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{session.focus_summary}</p>
                      {session.session_notes && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-1 line-clamp-2">"{session.session_notes}"</p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {confirmDeleteId === session.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => deleteSession(session.id)}
                            disabled={deletingId === session.id}
                            className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            {deletingId === session.id ? '...' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(session.id)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded"
                          title="Delete session"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
