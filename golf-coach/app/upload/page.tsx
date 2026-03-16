"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, CheckCircle, AlertCircle, ChevronRight, Loader2, ImagePlus } from "lucide-react";
import clsx from "clsx";
import { CoachingAnalysis, ParsedRoundData } from "@/lib/types";

type UploadStep = "upload" | "processing" | "results";

interface AnalysisResult {
  round: { id: string };
  parsedData: ParsedRoundData;
  coaching: CoachingAnalysis;
}

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<UploadStep>("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const imageFiles = Array.from(newFiles).filter(f => f.type.startsWith("image/"));
    setFiles(prev => [...prev, ...imageFiles].slice(0, 6));
  };

  const removeFile = (index: number) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (files.length === 0) { setError("Please upload at least one screenshot."); return; }
    setError(null);
    setStep("processing");

    const steps = ["Reading your screenshots...", "Extracting round stats with AI...", "Analyzing your performance...", "Generating personalized drills...", "Saving to your history..."];
    let stepIdx = 0;
    setProcessingStatus(steps[0]);
    const interval = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setProcessingStatus(steps[stepIdx]);
    }, 3000);

    try {
      const formData = new FormData();
      files.forEach(f => formData.append("screenshots", f));
      if (notes) formData.append("notes", notes);

      const response = await fetch("/api/analyze", { method: "POST", body: formData });
      clearInterval(interval);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Analysis failed");
      }

      const data = await response.json();
      setResult(data);
      setStep("results");
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("upload");
    }
  };

  if (step === "processing") return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="text-5xl mb-5">⛳</div>
      <Loader2 size={36} className="animate-spin text-green-600 mb-4" />
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Analyzing Your Round</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs">{processingStatus}</p>
      <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">This takes about 15-20 seconds...</p>
    </div>
  );

  if (step === "results" && result) {
    const { parsedData, coaching } = result;
    const scoreToPar = parsedData.gross_score - parsedData.par;
    return (
      <div className="space-y-5 max-w-2xl mx-auto">
        <div className="card bg-green-50 border-green-200 text-center">
          <CheckCircle className="text-green-600 mx-auto mb-2" size={32} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Round Saved!</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{parsedData.course_name} • {(() => { const [y,m,d] = parsedData.date.split("-").map(Number); return new Date(y, m-1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }); })()}</p>
          <div className="mt-3 flex justify-center gap-6">
            <div><div className="text-3xl font-bold text-gray-900">{parsedData.gross_score}</div><div className="text-xs text-gray-500">Gross</div></div>
            <div>
              <div className={clsx("text-3xl font-bold", scoreToPar < 0 ? "text-green-600" : scoreToPar === 0 ? "text-gray-700" : "text-red-500")}>
                {scoreToPar === 0 ? "E" : scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`}
              </div>
              <div className="text-xs text-gray-500">vs Par</div>
            </div>
            {parsedData.net_score && <div><div className="text-3xl font-bold text-blue-600">{parsedData.net_score}</div><div className="text-xs text-gray-500">Net</div></div>}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-900 mb-2">🎯 Coach&apos;s Recap</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{coaching.recap}</p>
          {coaching.trend_note && <p className="text-blue-700 text-sm mt-2 bg-blue-50 rounded-lg p-3">📈 {coaching.trend_note}</p>}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">✅ What Worked</h3>
            <ul className="space-y-2">{coaching.strengths.map((s, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>{s}</li>)}</ul>
          </div>
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">🔧 Areas to Improve</h3>
            <ul className="space-y-2">{coaching.weaknesses.map((w, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span>{w}</li>)}</ul>
          </div>
        </div>

        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="font-bold text-gray-900 mb-2 text-sm">⭐ Priority Focus This Week</h3>
          <p className="text-gray-700 text-sm">{coaching.priority_focus}</p>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">🏌️ Recommended Drills</h3>
          <div className="space-y-3">
            {coaching.drills.map((drill, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{i + 1}. {drill.title}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{drill.focus_area}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">⏱ {drill.duration}</p>
                <p className="text-sm text-gray-700 leading-relaxed">{drill.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4 text-sm">📊 Round Stats</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Fairways", value: `${parsedData.stats.fairway_percentage}%`, sub: `${parsedData.stats.fairways_hit}/${parsedData.stats.fairways_attempted}` },
              { label: "GIR", value: `${parsedData.stats.gir_percentage}%`, sub: `${parsedData.stats.gir}/${parsedData.stats.gir_attempted}` },
              { label: "Putts", value: parsedData.stats.total_putts, sub: `${parsedData.stats.putts_per_hole}/hole` },
              { label: "Chips", value: parsedData.stats.chip_shots, sub: "shots" },
              { label: "Sand", value: parsedData.stats.sand_shots, sub: "shots" },
              { label: "Penalties", value: parsedData.stats.penalties, sub: "strokes" },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="font-bold text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
                <div className="text-xs text-gray-400">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => { setFiles([]); setNotes(""); setResult(null); setStep("upload"); }} className="btn-secondary flex-1">Upload Another</button>
          <button onClick={() => router.push("/")} className="btn-primary flex-1 flex items-center justify-center gap-2">View Dashboard <ChevronRight size={16} /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Upload Round</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload screenshots from your 18 Birdies app. Claude reads them automatically — no manual entry!</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800 mb-2">📱 Which screenshots to upload from 18 Birdies:</p>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• The <strong>Stats tab</strong> showing holes 1-9 (FW, GIR, Putts, Chips, etc.)</li>
          <li>• The <strong>Stats tab</strong> showing the Out/Total summary</li>
          <li>• Optional: Scores tab for hole-by-hole scores</li>
        </ul>
        <p className="text-xs text-blue-500 mt-2">2-4 screenshots per round is ideal. Max 6 images.</p>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={clsx("border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          dragOver ? "border-green-500 bg-green-50 dark:bg-green-900/20" : "border-gray-200 dark:border-gray-700 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
        )}>
        <ImagePlus size={36} className={clsx("mx-auto mb-3", dragOver ? "text-green-500" : "text-gray-300")} />
        <p className="font-medium text-gray-700 dark:text-gray-300">{dragOver ? "Drop screenshots here" : "Tap to upload screenshots"}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, HEIC • Up to 6 images</p>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{files.length} screenshot{files.length !== 1 ? "s" : ""} ready</p>
          <div className="grid grid-cols-3 gap-2">
            {files.map((file, i) => (
              <div key={i} className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={URL.createObjectURL(file)} alt={`Screenshot ${i+1}`} className="w-full h-28 object-cover rounded-lg border border-gray-200" />
                <button onClick={() => removeFile(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
              </div>
            ))}
            {files.length < 6 && (
              <button onClick={() => fileInputRef.current?.click()} className="h-28 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-500 transition-colors"><ImagePlus size={24} /></button>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1.5">Round Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Struggled off the tee today, hit some good wedges near the end." className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100 placeholder-gray-400 bg-white dark:bg-gray-800" rows={3} />
      </div>

      <button onClick={handleSubmit} disabled={files.length === 0} className="btn-primary w-full flex items-center justify-center gap-2">
        <Upload size={18} />Analyze Round with AI
      </button>
    </div>
  );
}
