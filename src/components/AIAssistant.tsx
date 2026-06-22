/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sparkles,
  Brain,
  CheckCircle,
  HelpCircle,
  Loader2,
  Target,
  BarChart2,
  Check,
  FileText,
  AlertTriangle,
  Cpu,
  BookOpen
} from "lucide-react";
import { detectChronologicalGaps } from "../utils";

interface AIAssistantProps {
  resumeText: string;
  onApplyRewrittenBullet: (originalText: string, rewrittenText: string) => void;
  availableBullets: Array<{ section: string; company: string; text: string; index: number; entryId: string }>;
  work?: any[];
  onUpdateMatchedKeywords?: (keywords: string[]) => void;
}

interface MatchResponse {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  atsSuggestions: string[];
  coachingTips: string[];
  fallback: boolean;
  provider?: string;
}

export default function AIAssistant({
  resumeText,
  onApplyRewrittenBullet,
  availableBullets,
  work = [],
  onUpdateMatchedKeywords
}: AIAssistantProps) {
  // Navigation: Sub-tabs within AI Suite ["ats-diagnose", "xyz-coach"]
  const [activeSubTab, setActiveSubTab] = useState<"ats-diagnose" | "xyz-coach">("ats-diagnose");

  // Global Engine Switcher
  const [engineProvider, setEngineProvider] = useState<"gemini" | "ollama">("gemini");

  // Standard Bullet optimize state
  const [selectedBulletToEdit, setSelectedBulletToEdit] = useState("");
  const [customBulletIn, setCustomBulletIn] = useState("");
  const [selectedVerb, setSelectedVerb] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewrittenOutput, setRewrittenOutput] = useState("");
  const [rewriteFallback, setRewriteFallback] = useState(false);
  const [rewriteError, setRewriteError] = useState("");

  // Interactive XYZ builder params
  const [xyzX, setXyzX] = useState(""); // Accomplishment
  const [xyzY, setXyzY] = useState(""); // Measurement (Metric outcomes)
  const [xyzZ, setXyzZ] = useState(""); // Action/Methodology
  const [selectedIndustryPreset, setSelectedIndustryPreset] = useState("");

  // Job Match & keyword highlighted state
  const [jobDescription, setJobDescription] = useState("");
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [matchError, setMatchError] = useState("");

  // Action verbs lists
  const verbPresets = ["Spearheaded", "Orchestrated", "Engineered", "Optimized", "Slashed", "Formulated"];

  // Pre-cooked contextual industry placeholders mapping
  const industryPresets = [
    {
      id: "software",
      label: "Software Engineering",
      x: "accelerated API response metrics",
      y: "by 42% decrease in loading latency",
      z: "by refactoring the caching middleware layer to Redundant Redis nodes"
    },
    {
      id: "sales",
      label: "Sales & Client Growth",
      x: "expanded the enterprise pipelines transaction volume",
      y: "generating over $280K in net-new recurrent revenue",
      z: "by implementing a multi-tiered customer outreach strategy and automated lead qualifying"
    },
    {
      id: "product",
      label: "Product Management",
      x: "directed cross-functional product sprint releases",
      y: "leading to an 18% improvement in customer sign-up conversions",
      z: "by orchestrating user testing groups and simplifying the profile onboarding steps"
    },
    {
      id: "marketing",
      label: "Digital Marketing",
      x: "amplified social brand footprint and clicks",
      y: "boosting inbound organic lead volumes by 150% YoY",
      z: "by engineering systemic search engine optimizations and editorial newsletter sequences"
    }
  ];

  // Gaps calculation
  const timelineGaps = detectChronologicalGaps(work);

  const handleApplyIndustryPreset = (presetId: string) => {
    const preset = industryPresets.find((p) => p.id === presetId);
    if (preset) {
      setXyzX(preset.x);
      setXyzY(preset.y);
      setXyzZ(preset.z);
      setSelectedIndustryPreset(presetId);
    }
  };

  const handleRewrite = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Choose which source text to optimize
    let sourceText = "";
    if (activeSubTab === "xyz-coach" && (xyzX || xyzY || xyzZ)) {
      sourceText = `Accomplished X: ${xyzX || "[insert accomplishment]"} as measured by Y: ${xyzY || "[insert metric]"}, by doing Z: ${xyzZ || "[insert action]"}`;
    } else {
      sourceText = customBulletIn || selectedBulletToEdit;
    }

    if (!sourceText.trim()) return;

    setIsRewriting(true);
    setRewrittenOutput("");
    setRewriteError("");
    setRewriteFallback(false);

    try {
      const response = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletText: sourceText,
          actionVerb: selectedVerb,
          provider: engineProvider
        })
      });

      const result = await response.json();
      if (response.ok) {
        setRewrittenOutput(result.rewritten);
        setRewriteFallback(result.fallback || false);
      } else {
        setRewriteError(result.error || "Failed to utilize AI model");
      }
    } catch (err: any) {
      setRewriteError(`Connection error: ${err.message || "Failed to reach server backend"}`);
    } finally {
      setIsRewriting(false);
    }
  };

  const handleMatchJob = async () => {
    if (!jobDescription.trim()) return;
    setIsMatching(true);
    setMatchError("");
    setMatchResult(null);

    try {
      const response = await fetch("/api/ai/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          provider: engineProvider
        })
      });

      const result = await response.json();
      if (response.ok) {
        setMatchResult(result);
        
        // Sync matched keywords up to preview component highlight triggers
        if (onUpdateMatchedKeywords && result.matchedKeywords) {
          onUpdateMatchedKeywords(result.matchedKeywords);
        }
      } else {
        setMatchError(result.error || "An error occurred while matching");
      }
    } catch (err: any) {
      setMatchError(`Server error lookup: ${err.message || "Unreachable endpoint"}`);
    } finally {
      setIsMatching(false);
    }
  };

  const handleSelectPreexisting = (bulletVal: string) => {
    setSelectedBulletToEdit(bulletVal);
    setCustomBulletIn("");
  };

  const handleApply = () => {
    let originalText = customBulletIn || selectedBulletToEdit;
    if (activeSubTab === "xyz-coach" && (xyzX || xyzY || xyzZ)) {
      originalText = `Accomplished ${xyzX || "[X]"}, measured by ${xyzY || "[Y]"}, by doing ${xyzZ || "[Z]"}`;
    }

    if (rewrittenOutput) {
      onApplyRewrittenBullet(originalText || "Added newly formulated bullet point", rewrittenOutput);
      
      // Clear inputs
      setRewrittenOutput("");
      setSelectedBulletToEdit("");
      setCustomBulletIn("");
      setXyzX("");
      setXyzY("");
      setXyzZ("");
    }
  };

  return (
    <div className="space-y-4">
      {/* GLOBAL CONTROLLER: MODEL SELECT SWITCH */}
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5">
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 leading-snug">
          <Cpu className="w-3.5 h-3.5 text-sky-500" />
          <span>AI Intelligence Provider</span>
        </label>
        <div className="flex bg-white dark:bg-slate-950 p-0.5 rounded-lg border">
          <button
            type="button"
            onClick={() => setEngineProvider("gemini")}
            className={`px-3 py-1 text-[10px] font-bold tracking-wide rounded-md transition-all cursor-pointer ${
              engineProvider === "gemini"
                ? "bg-slate-800 dark:bg-sky-500/15 text-white dark:text-sky-400 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:dark:text-slate-200"
            }`}
          >
            Gemini Flash 3.5
          </button>
          <button
            type="button"
            onClick={() => setEngineProvider("ollama")}
            className={`px-3 py-1 text-[10px] font-bold tracking-wide rounded-md transition-all cursor-pointer ${
              engineProvider === "ollama"
                ? "bg-slate-800 dark:bg-sky-500/15 text-white dark:text-sky-400 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:dark:text-slate-200"
            }`}
          >
            Local Ollama
          </button>
        </div>
      </div>

      {/* REGIONAL TAB BAR CONTROLS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveSubTab("ats-diagnose")}
          className={`flex-1 py-2 text-center text-xs font-semibold tracking-wide rounded-lg transition ${
            activeSubTab === "ats-diagnose"
              ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-sky-500 dark:text-sky-400 font-bold shadow-xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          ATS Diagnostics & Gaps
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("xyz-coach")}
          className={`flex-1 py-2 text-center text-xs font-semibold tracking-wide rounded-lg transition ${
            activeSubTab === "xyz-coach"
              ? "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 text-sky-500 dark:text-sky-400 font-bold shadow-xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
          }`}
        >
          X-Y-Z Builder & Coach
        </button>
      </div>

      {/* INNER VIEWPORTS */}
      {activeSubTab === "ats-diagnose" ? (
        <div className="space-y-4">
          {/* PASTE JOB SPEC */}
          <div className="bg-white dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-[18px] space-y-3.5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Target Role Alignment
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal">
              Provide the job description you're applying for. The scanner will run semantic keyword analysis, compute a compatibility scorecard, and highlight key terms inside your resume preview document frame.
            </p>

            <div className="space-y-3 text-xs">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste formal job description details here (skills, qualifications, tech stack requirements)..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 min-h-[96px] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
              />

              {matchError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] leading-relaxed">
                  <strong>Service Warning:</strong> {matchError}
                </div>
              )}

              <button
                type="button"
                onClick={handleMatchJob}
                disabled={isMatching || !jobDescription.trim()}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-950 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 rounded-xl text-xs font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-transparent"
              >
                {isMatching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing parsed document nodes...
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-3.5 h-3.5 text-sky-500" />
                    Calculate Match Compatibility
                  </>
                )}
              </button>
            </div>

            {/* RESULTS VIEW */}
            {matchResult && (
              <div className="space-y-4 pt-3.5 border-t text-xs">
                {/* Score Dial */}
                <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border">
                  <div className="relative shrink-0 flex items-center justify-center">
                    <svg className="w-12 h-12" viewBox="0 0 36 36">
                      <path
                        className="text-slate-200 dark:text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={matchResult.score >= 75 ? "text-emerald-500" : "text-amber-500"}
                        strokeDasharray={`${matchResult.score}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
                        {matchResult.score}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">Compatibility Scoring Analytics</h5>
                    <p className="text-[10px] text-slate-500 leading-normal pr-1">
                      {matchResult.score >= 80
                        ? "Terrific match! Outstanding phrase frequency alignment. Ready for digital queues!"
                        : matchResult.score >= 65
                        ? "Moderate match. Inserting some of the recommended missing phrases below will boost scores."
                        : "Weak matching density. Follow coaching list to improve structure alignment."}
                    </p>
                  </div>
                </div>

                {/* Keyword metrics list */}
                <div className="space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                      Matched Terms Glowing In Document ({matchResult.matchedKeywords.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {matchResult.matchedKeywords.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/15 rounded-md text-[9px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {matchResult.matchedKeywords.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No term match highlights found yet.</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider block mb-1">
                      Missing High-Importance Keywords ({matchResult.missingKeywords.length})
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {matchResult.missingKeywords.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/15 rounded-md text-[9px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                      {matchResult.missingKeywords.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">No major key gaps identified.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* ATS Parser layout adjustment tips */}
                {matchResult.atsSuggestions.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      ATS Format Recommendations
                    </span>
                    <ul className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300 list-disc pl-3">
                      {matchResult.atsSuggestions.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Content coaching improvements */}
                {matchResult.coachingTips.length > 0 && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/40">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Resume Achievement Coaching
                    </span>
                    <ul className="space-y-1 text-[10px] text-slate-600 dark:text-slate-300 list-disc pl-3">
                      {matchResult.coachingTips.map((tip, idx) => (
                        <li key={idx} className="leading-relaxed">{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CHRONOLOGICAL GAP AUDIT DETAILS */}
          <div className="bg-white dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-[18px] space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                ATS Chronology Gap Inspector
              </span>
            </div>

            <p className="text-[10px] text-slate-400 leading-normal mb-1">
              ATS database engines closely parse timeline grids. Unexplained gaps exceeding 3 months trigger review highlights. Our inspector audits your employment start and end dates automatically.
            </p>

            {timelineGaps.length === 0 ? (
              <div className="flex items-center gap-2 p-3.5 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Perfect Timeline Continuity! No unexplained employment gaps detected.</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl text-[11px] font-medium leading-normal">
                  ⚠️ <strong>Unexplained Timeline Breaks Found ({timelineGaps.length}):</strong>
                </div>

                <div className="space-y-2.5">
                  {timelineGaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-900 border rounded-xl leading-relaxed text-[11px] space-y-1 border-slate-200/80 dark:border-slate-800/80"
                    >
                      <div className="flex justify-between items-center text-slate-800 dark:text-slate-200">
                        <strong className="font-semibold text-rose-500">
                          Gap of {gap.gapMonths} Months
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {gap.fromDate} — {gap.toDate}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Occurred between <strong>{gap.afterCompany}</strong> and subsequent <strong>{gap.beforeCompany}</strong>.
                      </p>
                      
                      {/* Interactive coaching on how to explains gaps */}
                      <div className="border-t border-slate-200/50 dark:border-slate-800/80 pt-1.5 mt-1.5 text-[9px] text-slate-400 space-y-1">
                        <span className="font-bold uppercase tracking-wider text-sky-500 block">Mitigation Advice:</span>
                        <ul className="list-disc pl-3 space-y-0.5">
                          <li>Option 1: Add a "Freelance Consultant" project entry covering this period.</li>
                          <li>Option 2: Embed certifications or intensive coursework completed during this stretch.</li>
                          <li>Option 3: Use year-only formatting (e.g., "2024 — 2025") inside settings to reduce precision.</li>
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* EDUCATIONAL BOOK: THE GOOGLE XYZ FORMULA */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-[18px] text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400">
                Google Execution Framework
              </span>
            </div>

            <h4 className="font-bold text-xs text-slate-100 block mb-1">
              Laszlo Bock's X-Y-Z Resume Formula
            </h4>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-[11px] leading-relaxed text-slate-300 font-mono italic mb-2.5">
              "Accomplished [X] as measured by [Y], by doing [Z]"
            </div>

            {/* Before vs After interactive cards */}
            <div className="grid grid-cols-2 gap-2 text-[9px] leading-relaxed pt-1">
              <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="font-bold text-rose-400 uppercase tracking-widest block mb-0.5">Weak formulation</span>
                <p className="text-slate-400">"Wrote code for subscription checkout page and enhanced performance limits."</p>
              </div>
              <div className="p-2 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                <span className="font-bold text-emerald-400 uppercase tracking-widest block mb-0.5">Google Formatted (X-Y-Z)</span>
                <p className="text-slate-200">"Reformed subscriptional checkout pipeline [Z], lowering payload drag by 35% [Y], driving $140K in client trials [X]."</p>
              </div>
            </div>
          </div>

          {/* INTERACTIVE BUILDER FIELD ACCORDION */}
          <div className="bg-white dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-[18px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider block">
                Interactive Formula Workspace
              </span>
              <span className="text-[9px] text-slate-400">Context presets available</span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1 mb-2">
              {industryPresets.map((ip) => (
                <button
                  key={ip.id}
                  type="button"
                  onClick={() => handleApplyIndustryPreset(ip.id)}
                  className={`px-2 py-1 rounded-md border text-[9px] font-bold transition-all ${
                    selectedIndustryPreset === ip.id
                      ? "bg-sky-500/10 border-sky-500/40 text-sky-500"
                      : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {ip.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 text-xs leading-normal">
              {/* Field X */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold text-slate-500 block uppercase">
                    X: Accomplished Indicator (The Success Outcome)
                  </label>
                  <span className="text-[9px] text-slate-400 italic">E.g., "expanded transaction pipeline"</span>
                </div>
                <input
                  type="text"
                  value={xyzX}
                  onChange={(e) => setXyzX(e.target.value)}
                  placeholder="The outcome or metric driven goal achieved..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                />
              </div>

              {/* Field Y */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold text-slate-500 block uppercase">
                    Y: Measurement Outcome (The Numeric Value Metrics)
                  </label>
                  <span className="text-[9px] text-slate-400 italic">E.g., "by over 45% load drop"</span>
                </div>
                <input
                  type="text"
                  value={xyzY}
                  onChange={(e) => setXyzY(e.target.value)}
                  placeholder="Percentage, Dollar volume, Time-savings, scale figures..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                />
              </div>

              {/* Field Z */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-semibold text-slate-500 block uppercase">
                    Z: Actions Accomplished (The Execution Approach)
                  </label>
                  <span className="text-[9px] text-slate-400 italic">E.g., "by deploying optimized caching rules"</span>
                </div>
                <input
                  type="text"
                  value={xyzZ}
                  onChange={(e) => setXyzZ(e.target.value)}
                  placeholder="Technologies, systems, methodologies utilized..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
                />
              </div>

              {/* LIVE WORKSPACE PREVIEW ELEMENT */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/50 leading-relaxed text-slate-600 dark:text-slate-300 text-[11px] leading-normal font-sans italic">
                <strong className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block not-italic mb-1 font-sans">
                  Formula Sentence Construct Hook:
                </strong>
                {xyzX || xyzY || xyzZ ? (
                  <span>
                    "Accelerated results by accomplished <strong>{xyzX || '[Outcome]'}</strong>, as measured by <strong>{xyzY || '[Metric]'}</strong>, through doing <strong>{xyzZ || '[Methodology]'}</strong>."
                  </span>
                ) : (
                  <span className="text-slate-400">Fill parameters above or click an industry preset to preview automated compounding.</span>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleRewrite()}
                  disabled={isRewriting || (!xyzX && !xyzY && !xyzZ)}
                  className="w-full py-2 bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 rounded-xl font-bold text-xs text-white tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-sky-950/20 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 dark:disabled:from-slate-800 dark:disabled:to-slate-800"
                >
                  {isRewriting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Compiling executive vocabulary...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Optimize Compounded XYZ Formula
                    </>
                  )}
                </button>
              </div>

              {rewriteError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-[10px] leading-relaxed">
                  <strong>Bullet Generator Limit:</strong> {rewriteError}
                </div>
              )}
            </div>

            {/* COMPLETED REWRITE PREVIEW ELEMENT */}
            {rewrittenOutput && (
              <div className="mt-4 p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white space-y-3 animate-fade-in text-xs">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-sky-400 font-bold block mb-1">
                    AI Formulated Active Bullet (Google Recommended)
                  </span>
                  <p className="text-xs text-slate-200 italic leading-relaxed">
                    "{rewrittenOutput}"
                  </p>
                </div>

                {rewriteFallback && (
                  <div className="text-[9px] text-slate-500">
                    ⚠️ Simulator fallback active (Add your Gemini secret token in settings for full LLM engine generation).
                  </div>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setRewrittenOutput("")}
                    className="px-2.5 py-1 text-[11px] text-slate-400 hover:text-slate-200"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={handleApply}
                    className="px-3 py-1 bg-sky-500/15 text-sky-400 border border-sky-500/30 rounded-lg text-[11px] font-bold hover:bg-sky-500/25 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Inject to Core Resume
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* LEGACY INDIVIDUAL BULLET ADJUSTMENT FORM */}
          <div className="bg-white dark:bg-slate-950/30 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-[18px] space-y-3.5 text-xs">
            <span className="text-[11px] font-bold text-slate-800 dark:text-white uppercase tracking-wider block">
              Quick Single-Bullet Enhancer
            </span>

            {availableBullets.length > 0 && (
              <div>
                <label htmlFor="ai-assisted-bullet-select" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Choose bullet from resume
                </label>
                <select
                  id="ai-assisted-bullet-select"
                  aria-label="Choose bullet from resume"
                  value={selectedBulletToEdit}
                  onChange={(e) => handleSelectPreexisting(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="">-- Click to select bullet point --</option>
                  {availableBullets.map((b, idx) => (
                    <option key={idx} value={b.text}>
                      [{b.company.substring(0, 10)}] {b.text.substring(0, 48)}...
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="ai-manual-bullet-input" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                Or enter text manual to optimize
              </label>
              <textarea
                id="ai-manual-bullet-input"
                aria-label="Manual bullet text entry"
                value={selectedBulletToEdit || customBulletIn}
                onChange={(e) => {
                  if (!selectedBulletToEdit) setCustomBulletIn(e.target.value);
                }}
                disabled={!!selectedBulletToEdit}
                placeholder="Write custom bullets or phrases to rebuild..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 min-h-[50px] focus:outline-none"
              />
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Inject powerful action leading verbs
              </span>
              <div className="flex flex-wrap gap-1">
                {verbPresets.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSelectedVerb(v)}
                    className={`px-2 py-0.5 rounded border text-[10px] font-semibold cursor-pointer ${
                      selectedVerb === v
                        ? "bg-sky-500/10 border-sky-500/40 text-sky-500"
                        : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
                    }`}
                  >
                    {v}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedVerb("")}
                  className="text-[10px] text-slate-400 hover:text-slate-300 ml-auto"
                >
                  Reset
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleRewrite()}
              disabled={isRewriting || (!selectedBulletToEdit && !customBulletIn)}
              className="w-full py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 rounded-xl font-bold text-xs disabled:opacity-40"
            >
              {isRewriting ? "Optimizing active sentence..." : "Rewrite Quick Bullet"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
