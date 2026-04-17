"use client";

import { Eye } from "lucide-react";

export default function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') return null;
  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700">
      <div className="max-w-5xl mx-auto px-4 py-2 flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
        <Eye size={15} className="shrink-0" />
        <span><strong>View Only Demo</strong> — Browse Michael&apos;s real rounds and stats. Upload, generate, and delete features are disabled.</span>
      </div>
    </div>
  );
}
