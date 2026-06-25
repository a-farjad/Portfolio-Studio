/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ACTION_VERBS } from "../utils";
import { Sparkles, Search, Copy, Check, Info } from "lucide-react";

interface ActionVerbPanelProps {
  onSelectActionVerb?: (verb: string) => void;
}

export default function ActionVerbPanel({ onSelectActionVerb }: ActionVerbPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);

  const handleCopy = (verb: string) => {
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 2000);
    if (onSelectActionVerb) {
      onSelectActionVerb(verb);
    }
  };

  return (
    <div className="bg-slate-50/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4.5 backdrop-blur-md">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-sky-100 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Action Verb Library</h3>
            <p className="text-[11px] text-slate-500">Power verbs to start your bullet points</p>
          </div>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search power verbs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-sky-500 transition-all placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-4 max-h-[280px] overflow-y-auto pr-1">
        {Object.entries(ACTION_VERBS).map(([category, verbs]) => {
          const filteredVerbs = verbs.filter((verb) =>
            verb.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filteredVerbs.length === 0) return null;

          return (
            <div key={category} className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {category}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {filteredVerbs.map((verb) => (
                  <button
                    key={verb}
                    type="button"
                    onClick={() => handleCopy(verb)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-white dark:bg-slate-950 hover:bg-sky-50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer group"
                  >
                    <span>{verb}</span>
                    <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {copiedVerb === verb ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-start gap-2 p-2 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/10 rounded-lg text-[10px] text-slate-600 dark:text-amber-200/80 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <span>
          <strong>Pro-Tip:</strong> Resumes scored via ATS filters achieve 4x higher passage rates when bullets describe actual, measurable achievements using active verbal leads.
        </span>
      </div>
    </div>
  );
}
