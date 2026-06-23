/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ResumeData } from "./types";
import { DEFAULT_RESUME_DATA, importFromJSONResume, exportToJSONResume } from "./utils";
import SidebarControls from "./components/SidebarControls";
import ResumePreview from "./components/ResumePreview";
import AIAssistant from "./components/AIAssistant";
import ActionVerbPanel from "./components/ActionVerbPanel";
import {
  FileText,   Sparkles, Monitor, Smartphone, Printer, Share2, Clipboard, Download, RefreshCw, Layers,
  History, Settings, Eye, CheckCircle2, RotateCw, Moon, Sun, Info, Menu, X, ArrowLeftRight
} from "lucide-react";

export default function App() {
  // Main data state
  const [resumeData, setResumeData] = useState<ResumeData>(DEFAULT_RESUME_DATA);

  // Layout View mode selector
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");

  // Dynamic Workspace partitioning slide (percent width of the left settings column)
  const [sidebarWidth, setSidebarWidth] = useState<number>(38); // default to 38%

  // Sidebar Sub-tabs [Edit, AI, Verbs]
  const [controlsTab, setControlsTab] = useState<"content" | "layout" | "ai" | "verbs">("content");

  // Local storage auto save indication
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving">("saved");

  // Share link copy state
  const [shareLink, setShareLink] = useState<string>("");
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // Undo/Redo stacks
  const [undoStack, setUndoStack] = useState<ResumeData[]>([]);
  const [redoStack, setRedoStack] = useState<ResumeData[]>([]);

  // Dark Editor interface toggle
  const [editorDarkMode, setEditorDarkMode] = useState<boolean>(false);

  // Synchronize editor dark mode selection to the root html element so Tailwind's dark: classes activate
  useEffect(() => {
    if (editorDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [editorDarkMode]);

  // Zoom control
  const [canvasZoom, setCanvasZoom] = useState<number>(100);

  // ATS keyword highlighting synchronization state
  const [atsMatchedKeywords, setAtsMatchedKeywords] = useState<string[]>([]);

  // Real-device mobile/tablet responsiveness support
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  const [mobileWorkplaceView, setMobileWorkplaceView] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check if there's shared ID on path
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedId = params.get("share");
    if (sharedId) {
      fetch(`/api/share/${sharedId}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.data) {
            setResumeData(res.data);
          }
        })
        .catch((err) => console.error("Could not fetch shared portfolio node data", err));
    } else {
      // Load local cache if available and no sharing coordinates are requested
      try {
        const cached = localStorage.getItem("resume_designer_cache_v2");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.basics && parsed.work) {
            setResumeData(parsed);
          }
        }
      } catch (err) {
        console.error("Local Storage reading error", err);
      }
    }
  }, []);

  // Update State with back-up registry (Supports Undo list limit up to 5 entries)
  const handleUpdateResume = (next: ResumeData) => {
    setUndoStack((prev) => {
      const suite = [...prev, resumeData];
      if (suite.length > 5) suite.shift();
      return suite;
    });
    setRedoStack([]); // empty redo on new typing change
    setResumeData(next);
    setSaveStatus("saving");
  };

  // Local Auto storage loop
  useEffect(() => {
    if (saveStatus === "saving") {
      const timer = setTimeout(() => {
        localStorage.setItem("resume_designer_cache_v2", JSON.stringify(resumeData));
        setSaveStatus("saved");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [resumeData, saveStatus]);

  // Undo operation
  const handleUndo = () => {
    if (undoStack.length === 0) return;
    const prevData = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, resumeData]);
    setResumeData(prevData);
  };

  // Redo operation
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const nextData = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setUndoStack((prev) => [...prev, resumeData]);
    setResumeData(nextData);
  };

  // Reset entirely to factory defaults
  const handleResetToDefaults = () => {
    // Clear ALL persistence
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear state
    setResumeData(DEFAULT_RESUME_DATA);
    setUndoStack([]);
    setRedoStack([]);
    setSaveStatus("saved");
    
    // Forced hard reload to clear any remaining memory
    window.location.href = window.location.pathname; 
  };

  // Double click or side focus text updates
  const handleUpdateBasics = (field: string, val: string) => {
    const next = { ...resumeData };
    (next.basics as any)[field] = val;
    handleUpdateResume(next);
  };

  const handleUpdateWorkEntry = (id: string, field: string, val: any) => {
    const next = { ...resumeData };
    const idx = next.work.findIndex((w) => w.id === id);
    if (idx !== -1) {
      (next.work[idx] as any)[field] = val;
      handleUpdateResume(next);
    }
  };

  const handleUpdateEducationEntry = (id: string, field: string, val: any) => {
    const next = { ...resumeData };
    const idx = next.education.findIndex((e) => e.id === id);
    if (idx !== -1) {
      (next.education[idx] as any)[field] = val;
      handleUpdateResume(next);
    }
  };

  const handleUpdateSkill = (id: string, field: string, val: any) => {
    const next = { ...resumeData };
    const idx = next.skills.findIndex((s) => s.id === id);
    if (idx !== -1) {
      (next.skills[idx] as any)[field] = val;
      handleUpdateResume(next);
    }
  };

  const handleUpdateCustomSectionItem = (sectionId: string, itemId: string, field: string, val: any) => {
    const next = { ...resumeData };
    const sidx = next.customSections.findIndex((s) => s.id === sectionId);
    if (sidx !== -1) {
      const idx = next.customSections[sidx].items.findIndex((itm) => itm.id === itemId);
      if (idx !== -1) {
        (next.customSections[sidx].items[idx] as any)[field] = val;
        handleUpdateResume(next);
      }
    }
  };

  const onUpdateLetterBody = (bodyHtml: string) => {
    const next = { ...resumeData };
    next.coverLetter.body = bodyHtml;
    handleUpdateResume(next);
  };

  const handleUpdateSectionOrder = (order: string[]) => {
    const next = { ...resumeData };
    next.sectionOrder = order;
    handleUpdateResume(next);
  };

  // Triggering AI Rewriting applying
  const handleApplyRewrittenBullet = (originalText: string, rewrittenText: string) => {
    const next = { ...resumeData };
    // Find where the bullet text lives in experience highlights
    let found = false;
    next.work.forEach((w) => {
      const hidx = w.highlights.indexOf(originalText);
      if (hidx !== -1) {
        w.highlights[hidx] = rewrittenText;
        found = true;
      }
    });

    if (!found) {
      // Check education courses
      next.education.forEach((e) => {
        const hidx = e.highlights.indexOf(originalText);
        if (hidx !== -1) {
          e.highlights[hidx] = rewrittenText;
          found = true;
        }
      });
    }

    if (found) {
      handleUpdateResume(next);
      alert("Successfully synchronized bullet modification onto preview document.");
    } else {
      // If none matched (pasted block), alert user and we can also append it to first job highlight
      if (next.work.length > 0) {
        next.work[0].highlights.push(rewrittenText);
        handleUpdateResume(next);
        alert("Bullet point appended to your primary experience highlights block.");
      }
    }
  };

  // Extraction of current bullets for AI selection options
  const getPreexistingBullets = () => {
    const list: Array<{ section: string; company: string; text: string; index: number; entryId: string }> = [];
    resumeData.work.forEach((w) => {
      w.highlights.forEach((h, idx) => {
        list.push({ section: "Experience", company: w.company, text: h, index: idx, entryId: w.id });
      });
    });
    resumeData.education.forEach((e) => {
      e.highlights.forEach((h, idx) => {
        list.push({ section: "Education", company: e.institution, text: h, index: idx, entryId: e.id });
      });
    });
    return list;
  };

  // Standard JSON Schema download triggers
  const handleTriggerDownloadJSON = () => {
    const schemaObj = exportToJSONResume(resumeData);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schemaObj, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `resume-schema-${resumeData.basics.name.toLowerCase().replace(/\s/g, "-")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleTriggerImportJSON = (jsonObj: any) => {
    const parsedData = importFromJSONResume(jsonObj);
    const next = { ...resumeData, ...parsedData };
    handleUpdateResume(next);
    alert("Standard JSONResume Schema translated and applied successfully.");
  };

  const handleTriggerGrayscaleToggle = () => {
    const next = { ...resumeData };
    next.style.grayscaleMode = !next.style.grayscaleMode;
    handleUpdateResume(next);
  };

  // Share portfolio coordinates via backend container
  const handleSharePortfolio = async () => {
    setIsSharing(true);
    setShareLink("");
    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: resumeData
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        const link = `${window.location.origin}/?share=${result.shareId}`;
        setShareLink(link);
        navigator.clipboard.writeText(link);
      } else {
        alert("Failed to allocate shared sync coordinates.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  const triggerNativePrint = () => {
    window.print();
  };

  // Convert full resume payload into basic flat text strings for AI matching contextual references
  const getFlattenedResumeText = () => {
    const b = resumeData.basics;
    const experienceText = resumeData.work
      .map((w) => `${w.company} ${w.position} ${w.description} ${w.highlights.join(". ")}`)
      .join("\n");
    const educationText = resumeData.education
      .map((e) => `${e.institution} ${e.area} ${e.studyType} ${e.highlights.join(". ")}`)
      .join("\n");
    const skillsText = resumeData.skills.map((s) => s.name).join(", ");
    return `${b.name} ${b.title}\nExperience:\n${experienceText}\nEducation:\n${educationText}\nSkills: ${skillsText}`;
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      editorDarkMode ? "bg-zinc-950 text-zinc-100" : "bg-zinc-100 text-zinc-900"
    }`}>
      
      {/* 1. APP MAIN BAR CONTROL DECK */}
      <header className="no-print h-14 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 shrink-0 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-black dark:bg-zinc-100 rounded flex items-center justify-center shadow-md">
            <span className="text-white dark:text-zinc-900 font-extrabold text-lg leading-none">P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold tracking-tight text-sm text-zinc-900 dark:text-white uppercase">
                Portfolio Studio <span className="font-normal text-zinc-500 dark:text-zinc-400">/ v2.4</span>
              </h1>
            </div>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest leading-none mt-0.5">Artistic Flair Engine</p>
          </div>
        </div>

        {/* Action parameters row */}
        <div className="flex items-center gap-2.5">
          {/* Saved Status Indicator */}
          <span className="hidden sm:inline-flex text-[10px] uppercase font-bold text-green-800 dark:text-green-400 items-center gap-1.5 px-3 py-1 bg-green-500/5 dark:bg-green-500/10 rounded-full border border-green-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>Saved</span>
          </span>

          {/* Editor Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setEditorDarkMode(!editorDarkMode)}
            title="Toggle theme of workspace panel"
            aria-label="Toggle theme"
            className="p-1.5 border rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 cursor-pointer text-zinc-600 dark:text-zinc-300 transition-colors"
          >
            {editorDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-zinc-500" />}
          </button>

          {/* Reset presets action */}
          <button
            type="button"
            onClick={handleResetToDefaults}
            title="Wipe canvas to default templates"
            className="p-1.5 px-3.5 border rounded-lg border-zinc-200 dark:border-zinc-800 text-[10px] font-bold tracking-widest uppercase hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition cursor-pointer"
          >
            Reset
          </button>

          {/* Core print PDF button */}
          <button
            type="button"
            onClick={triggerNativePrint}
            className="px-5 py-2 bg-black hover:bg-zinc-900 dark:bg-white dark:text-black dark:hover:bg-zinc-100 text-white text-xs font-bold uppercase tracking-widest transition-colors duration-200 rounded shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </header>

      {/* MOBILE SCREEN ACTIVE MODE SWITCHER SPECIAL ACTIONS BAR */}
      {isMobileScreen && (
        <div className="no-print bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-2.5 flex items-center justify-center gap-2 sticky z-40">
          <button
            type="button"
            onClick={() => setMobileWorkplaceView("edit")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              mobileWorkplaceView === "edit"
                ? "bg-black dark:bg-white text-white dark:text-zinc-950 font-extrabold"
                : "bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>1. Edit Details</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileWorkplaceView("preview")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-[11px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
              mobileWorkplaceView === "preview"
                ? "bg-black dark:bg-white text-white dark:text-zinc-950 font-extrabold"
                : "bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 border border-zinc-200 dark:border-zinc-700"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>2. Live Preview</span>
          </button>
        </div>
      )}

      {/* 2. DYNAMIC WORKSPACE SPLIT AREA */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
        
        {/* LEFT WORKSPACE PANELS DOCK */}
        <div
          className={`no-print h-full flex flex-col border-r shadow-xs shrink-0 bg-slate-50 dark:bg-slate-900 border-slate-200/60 transition-all overflow-hidden z-20 ${
            isMobileScreen 
              ? (mobileWorkplaceView === "edit" ? "w-full" : "hidden") 
              : "w-auto"
          }`}
          style={isMobileScreen ? { width: "100%" } : { width: `${sidebarWidth}%` }}
        >
          {/* Sub-tab Navigation */}
          <div className="flex border-b text-xs border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
            {[
              { id: "content", name: "Content" },
              { id: "layout", name: "Layout" },
              { id: "ai", name: "AI Optimizer" },
              { id: "verbs", name: "Active Verbs" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setControlsTab(tab.id as any)}
                className={`flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  controlsTab === tab.id
                    ? "border-b-2 border-black dark:border-white text-black dark:text-white bg-white dark:bg-zinc-950"
                    : "border-b-2 border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {(controlsTab === "content" || controlsTab === "layout") && (
              <SidebarControls
                tab={controlsTab as "content" | "layout"}
                data={resumeData}
                onChange={handleUpdateResume}
                onUndo={undoStack.length > 0 ? handleUndo : undefined}
                onRedo={redoStack.length > 0 ? handleRedo : undefined}
                onTriggerDownloadJSON={handleTriggerDownloadJSON}
                onTriggerImportJSON={handleTriggerImportJSON}
                onTriggerGrayscaleToggle={handleTriggerGrayscaleToggle}
              />
            )}
            {controlsTab === "ai" && (
              <div className="p-4 space-y-4">
                <div className="p-[18px] bg-white dark:bg-slate-950 border rounded-2xl">
                  <h3 className="font-bold text-slate-900 w-max border-b-2 pb-1 text-xs uppercase dark:text-white mb-2">
                    AI Workspace Companion
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
                    Improve bullet points with Google X-Y-Z formula parameters, or run ATS diagnostics against target roles.
                  </p>
                  <AIAssistant
                    resumeText={getFlattenedResumeText()}
                    onApplyRewrittenBullet={handleApplyRewrittenBullet}
                    availableBullets={getPreexistingBullets()}
                    work={resumeData.work}
                    onUpdateMatchedKeywords={setAtsMatchedKeywords}
                  />
                </div>
              </div>
            )}
            {controlsTab === "verbs" && (
              <div className="p-4">
                <ActionVerbPanel />
              </div>
            )}
          </div>

          {/* Cloud Sync/Share bar footer */}
          <div className="p-[18px] bg-slate-50/80 dark:bg-slate-950 border-t border-slate-200/60 space-y-3.5 mt-auto">
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleResetToDefaults}
                className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 border-2 border-red-700 text-white font-black rounded-xl text-[11px] uppercase tracking-[0.25em] hover:bg-red-700 active:scale-[0.98] transition-all cursor-pointer shadow-lg group z-50 relative"
              >
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                Factory Reset All Data
              </button>
              <p className="text-[9px] text-center text-red-700 dark:text-red-400 font-bold uppercase leading-tight px-4">
                Warning: Clicking this will immediately wipe all your progress and personal links from this browser.
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-extrabold tracking-wide uppercase text-slate-500">Collaboratory syncing</span>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block mt-0.5">Publish Web Link</span>
              </div>
              <button
                type="button"
                onClick={handleSharePortfolio}
                disabled={isSharing}
                className="px-3.5 py-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded-xl text-xs font-bold tracking-wide inline-flex items-center gap-1.5 cursor-pointer shadow hover:bg-slate-800"
              >
                <Share2 className="w-3.5 h-3.5" />
                {isSharing ? "Synching..." : "Allocate Node"}
              </button>
            </div>

            {shareLink && (
              <div className="p-2.5 bg-sky-50 dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-xl flex items-center justify-between gap-1 mt-2 text-[11px]">
                <span className="text-sky-800 dark:text-sky-400 truncate font-mono select-all flex-1 pr-2">
                  {shareLink}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    alert("Shareable review URL copied to clipboard registry!");
                  }}
                  className="p-1 px-2.5 bg-white text-slate-800 hover:bg-slate-50 border border-slate-200/50 rounded-lg shrink-0 font-bold font-sans text-[10px]"
                >
                  Copy URL
                </button>
              </div>
            )}
          </div>
        </div>

        {/* VISUAL DIVIDER GRABBER SLIDER */}
        <div className="no-print hidden md:flex absolute top-0 bottom-0 left-[38%] transition-all select-none z-30 cursor-ew-resize items-center justify-center p-0" style={{ left: `calc(${sidebarWidth}% - 5px)` }}>
          <div className="w-2 bg-transparent h-full relative group">
            {/* The vertical divider line */}
            <div className="w-[1px] bg-slate-200/80 dark:bg-slate-800 h-full mx-auto" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-950 border shadow-md size-7 rounded-lg flex items-center justify-center scale-90 opacity-40 group-hover:opacity-100 transition duration-200 text-slate-400 hover:text-sky-500">
              <ArrowLeftRight className="w-3 h-3 rotate-90 md:rotate-0" />
            </div>
            {/* Custom overlay range slider to divide continuous sidebarWidth width strictly between 30 and 60 */}
            <input
              type="range"
              min="30"
              max="60"
              value={sidebarWidth}
              onChange={(e) => setSidebarWidth(parseInt(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
              aria-label="Sidebar resizer width"
            />
          </div>
        </div>

        {/* RIGHT DOCUMENT PREVIEW VIEWPORT AREA */}
        <div className={`flex-1 h-full overflow-y-auto flex flex-col pt-4 md:pt-0 ${
          isMobileScreen 
            ? (mobileWorkplaceView === "preview" ? "w-full" : "hidden") 
            : "w-auto"
        }`}>
          
          {/* Sub-header Bar: Zoom, Print info */}
          <div className="no-print h-12 shrink-0 border-b border-zinc-200 dark:border-zinc-800/80 px-4 flex items-center justify-between text-xs bg-zinc-50/50 dark:bg-zinc-900/10">
            <div className="flex items-center gap-3">
              {/* Cover Letter Active indicator */}
              {resumeData.coverLetter.enabled && (
                <span className="select-none inline-flex items-center gap-1 text-[10px] font-bold text-black dark:text-white px-2.5 py-1 bg-white dark:bg-zinc-800 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm">
                  Cover Letter Active
                </span>
              )}
            </div>

            {/* Scale Percent Zoom */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Scaling:</span>
              <select
                aria-label="Canvas Zoom Scale"
                value={canvasZoom}
                onChange={(e) => setCanvasZoom(parseInt(e.target.value))}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium px-2 py-1 rounded focus:outline-none"
              >
                <option value="75">75% Comfort</option>
                <option value="90">90% Medium</option>
                <option value="100">100% Vector</option>
                <option value="115">115% Zoom-In</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-zinc-200 dark:bg-zinc-900/40 p-4 relative flex justify-center items-start">
            {/* Direct preview document sheet canvas */}
            <ResumePreview
              data={resumeData}
              viewMode={viewMode}
              onUpdateBasics={handleUpdateBasics}
              onUpdateWorkEntry={handleUpdateWorkEntry}
              onUpdateEducationEntry={handleUpdateEducationEntry}
              onUpdateSkill={handleUpdateSkill}
              onUpdateCustomSectionItem={handleUpdateCustomSectionItem}
              onUpdateLetterBody={onUpdateLetterBody}
              onUpdateSectionOrder={handleUpdateSectionOrder}
              zoom={canvasZoom}
              matchedKeywords={atsMatchedKeywords}
            />
          </div>
        </div>
      </main>

      {/* PRINT-ONLY MASTER SHEET WRAPPER FOR NATIVE NATIVE PRINT ENGINES */}
      <div className="print-only hidden">
        <ResumePreview
          data={resumeData}
          viewMode="desktop"
          onUpdateBasics={handleUpdateBasics}
          onUpdateWorkEntry={handleUpdateWorkEntry}
          onUpdateEducationEntry={handleUpdateEducationEntry}
          onUpdateSkill={handleUpdateSkill}
          onUpdateCustomSectionItem={handleUpdateCustomSectionItem}
          onUpdateLetterBody={onUpdateLetterBody}
          onUpdateSectionOrder={handleUpdateSectionOrder}
          matchedKeywords={atsMatchedKeywords}
        />
      </div>
    </div>
  );
}
