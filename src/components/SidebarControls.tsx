/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ResumeData, WorkEntry, EducationEntry, CertificationEntry, AwardEntry, SkillItem, LanguageItem } from "../types";
import { COLOR_PRESETS, FONT_PAIRINGS, detectChronologicalGaps } from "../utils";
import {
  Settings, User, Briefcase, Award, GraduationCap, FileCheck, Layers,
  Sparkles, Trash2, Plus, PlusCircle, ArrowUp, ArrowDown, Copy, Upload, RefreshCw, Check, Sliders, ChevronDown
} from "lucide-react";
import { PremiumButton } from "./PremiumButton";
import { KawaiiSlider } from "./KawaiiSlider";
import { PremiumToggle } from "./PremiumToggle";

interface SidebarControlsProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onTriggerDownloadJSON: () => void;
  onTriggerImportJSON: (json: any) => void;
  onTriggerGrayscaleToggle: () => void;
}

export default function SidebarControls({
  data,
  onChange,
  onUndo,
  onRedo,
  onTriggerDownloadJSON,
  onTriggerImportJSON,
  onTriggerGrayscaleToggle
}: SidebarControlsProps) {
  const [activeTab, setActiveTab] = useState<string>("basics");
  const [openSectionId, setOpenSectionId] = useState<string>("style");

  // Local state for JSON raw text input pasting
  const [rawTextJson, setRawTextJson] = useState("");
  const [showJsonInput, setShowJsonInput] = useState(false);

  // Gaps analysis state
  const [computedGaps, setComputedGaps] = useState<any[]>([]);

  const toggleAccordion = (id: string) => {
    setOpenSectionId(openSectionId === id ? "" : id);
  };

  // Generic updater
  const updateData = (updater: (prev: ResumeData) => void) => {
    const next = JSON.parse(JSON.stringify(data)) as ResumeData;
    updater(next);
    next.lastUpdated = new Date().toISOString();
    onChange(next);
  };

  // 1. Core Basics updates
  const handleBasicsChange = (field: string, value: any) => {
    updateData((prev) => {
      (prev.basics as any)[field] = value;
    });
  };

  // 2. Work updates
  const handleAddWork = () => {
    const newJob: WorkEntry = {
      id: "w-" + Math.random().toString(36).substring(2, 6),
      company: "New Company",
      position: "New Position",
      location: "",
      startDate: "2024-01",
      endDate: "",
      current: true,
      highlights: ["Accomplished [X] with strong numeric metrics, using [Y] skills."],
      description: ""
    };
    updateData((prev) => {
      prev.work.push(newJob);
    });
  };

  const handleUpdateWorkField = (id: string, field: string, value: any) => {
    updateData((prev) => {
      const idx = prev.work.findIndex((item) => item.id === id);
      if (idx !== -1) {
        (prev.work[idx] as any)[field] = value;
      }
    });
  };

  const handleDuplicateWork = (w: WorkEntry) => {
    updateData((prev) => {
      const dup = { ...w, id: "w-" + Math.random().toString(36).substring(2, 6) };
      prev.work.push(dup);
    });
  };

  const handleDeleteWork = (id: string) => {
    updateData((prev) => {
      prev.work = prev.work.filter((w) => w.id !== id);
    });
  };

  const handleWorkMoveOrder = (index: number, direction: "up" | "down") => {
    updateData((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target >= 0 && target < prev.work.length) {
        const temp = prev.work[index];
        prev.work[index] = prev.work[target];
        prev.work[target] = temp;
      }
    });
  };

  // Highlights/Bullets helpers inside work
  const handleAddHighlight = (workId: string) => {
    updateData((prev) => {
      const w = prev.work.find((item) => item.id === workId);
      if (w) w.highlights.push("Accomplished [X] as measured by [Y] outcome, by doing [Z]");
    });
  };

  const handleUpdateHighlight = (workId: string, hIndex: number, text: string) => {
    updateData((prev) => {
      const w = prev.work.find((item) => item.id === workId);
      if (w) w.highlights[hIndex] = text;
    });
  };

  const handleDeleteHighlight = (workId: string, hIndex: number) => {
    updateData((prev) => {
      const w = prev.work.find((item) => item.id === workId);
      if (w) w.highlights.splice(hIndex, 1);
    });
  };

  const handleMoveHighlight = (workId: string, hIndex: number, direction: "up" | "down") => {
    updateData((prev) => {
      const w = prev.work.find((item) => item.id === workId);
      if (w) {
        const target = direction === "up" ? hIndex - 1 : hIndex + 1;
        if (target >= 0 && target < w.highlights.length) {
          const temp = w.highlights[hIndex];
          w.highlights[hIndex] = w.highlights[target];
          w.highlights[target] = temp;
        }
      }
    });
  };

  // 3. Education updates
  const handleAddEducation = () => {
    const newEdu: EducationEntry = {
      id: "e-" + Math.random().toString(36).substring(2, 6),
      institution: "New University",
      area: "Field of Study",
      studyType: "Degree",
      location: "",
      startDate: "2018-09",
      endDate: "2022-06",
      gpa: "",
      highlights: []
    };
    updateData((prev) => {
      prev.education.push(newEdu);
    });
  };

  const handleUpdateEduField = (id: string, field: string, value: any) => {
    updateData((prev) => {
      const idx = prev.education.findIndex((item) => item.id === id);
      if (idx !== -1) {
        (prev.education[idx] as any)[field] = value;
      }
    });
  };

  const handleDeleteEdu = (id: string) => {
    updateData((prev) => {
      prev.education = prev.education.filter((e) => e.id !== id);
    });
  };

  // 4. Skills updates
  const handleAddSkill = () => {
    const newSkill: SkillItem = {
      id: "s-" + Math.random().toString(36).substring(2, 6),
      name: "New Skill",
      level: 80,
      style: "chip"
    };
    updateData((prev) => {
      prev.skills.push(newSkill);
    });
  };

  const handleUpdateSkillField = (id: string, field: string, value: any) => {
    updateData((prev) => {
      const idx = prev.skills.findIndex((item) => item.id === id);
      if (idx !== -1) {
        (prev.skills[idx] as any)[field] = value;
      }
    });
  };

  const handleDeleteSkill = (id: string) => {
    updateData((prev) => {
      prev.skills = prev.skills.filter((s) => s.id !== id);
    });
  };

  // 5. Languages/Credentials triggers
  const handleAddLanguage = () => {
    const newLang: LanguageItem = {
      id: "l-" + Math.random().toString(36).substring(2, 6),
      name: "Native Language",
      fluency: "Native"
    };
    updateData((prev) => {
      prev.languages.push(newLang);
    });
  };

  const handleUpdateLanguage = (id: string, field: string, val: any) => {
    updateData((prev) => {
      const idx = prev.languages.findIndex((item) => item.id === id);
      if (idx !== -1) {
        (prev.languages[idx] as any)[field] = val;
      }
    });
  };

  const handleDeleteLanguage = (id: string) => {
    updateData((prev) => {
      prev.languages = prev.languages.filter((l) => l.id !== id);
    });
  };

  const handleAddCertification = () => {
    const newCert: CertificationEntry = {
      id: "c-" + Math.random().toString(36).substring(2, 6),
      name: "New Certification",
      issuer: "Authorized Entity",
      date: "2024-01",
      url: ""
    };
    updateData((prev) => {
      prev.certifications.push(newCert);
    });
  };

  const handleUpdateCertField = (id: string, field: string, value: any) => {
    updateData((prev) => {
      const idx = prev.certifications.findIndex((item) => item.id === id);
      if (idx !== -1) {
        (prev.certifications[idx] as any)[field] = value;
      }
    });
  };

  const handleDeleteCert = (id: string) => {
    updateData((prev) => {
      prev.certifications = prev.certifications.filter((c) => c.id !== id);
    });
  };

  // Awards section managers
  const handleAddAward = () => {
    const item: AwardEntry = {
      id: "a-" + Math.random().toString(36).substring(2, 6),
      title: "New Honor Laurel",
      awarder: "Awarding Org",
      date: "2023-11",
      summary: ""
    };
    updateData((prev) => {
      prev.awards.push(item);
    });
  };

  const handleUpdateAwardField = (id: string, field: string, val: any) => {
    updateData((prev) => {
      const idx = prev.awards.findIndex((a) => a.id === id);
      if (idx !== -1) {
        (prev.awards[idx] as any)[field] = val;
      }
    });
  };

  const handleDeleteAward = (id: string) => {
    updateData((prev) => {
      prev.awards = prev.awards.filter((a) => a.id !== id);
    });
  };

  // 6. Theme and Preset selections
  const handleSelectThemePreset = (presetId: string) => {
    const found = COLOR_PRESETS.find((p) => p.id === presetId);
    if (found) {
      updateData((prev) => {
        prev.style.themeId = presetId;
        prev.style.colors = { ...prev.style.colors, ...found.colors };
      });
    }
  };

  const handleSelectFontPairing = (pairingId: string) => {
    const found = FONT_PAIRINGS.find((f) => f.id === pairingId);
    if (found) {
      updateData((prev) => {
        prev.style.fontPairingId = pairingId;
        prev.style.fonts = { ...prev.style.fonts, ...found.fonts };
      });
    }
  };

  const handleColorChange = (colorField: string, hexColor: string) => {
    updateData((prev) => {
      (prev.style.colors as any)[colorField] = hexColor;
    });
  };

  const handleAddCustomSection = () => {
    const newId = `c-${Math.random().toString(36).substr(2, 5)}`;
    updateData((prev) => {
      const newSection = {
        id: newId,
        label: "New Custom Section",
        items: [{ id: `ci-${Date.now()}`, title: "New Item", subtitle: "", date: "", summary: "", highlights: [] }]
      };
      if (!prev.customSections) prev.customSections = [];
      prev.customSections = [...prev.customSections, newSection];
      prev.sectionOrder = [...prev.sectionOrder, `custom_${newId}`];
      prev.sectionVisibility = { ...prev.sectionVisibility, [newId]: true };
      prev.sectionLabels = { ...prev.sectionLabels, [newId]: "New Section" };
    });
  };

  const handleDeleteCustomSection = (id: string) => {
    updateData((prev) => {
      prev.customSections = (prev.customSections || []).filter(s => s.id !== id);
      prev.sectionOrder = prev.sectionOrder.filter(k => k !== `custom_${id}`);
    });
  };

  const handleUpdateCustomSectionTitle = (id: string, label: string) => {
    updateData((prev) => {
      const sec = (prev.customSections || []).find(s => s.id === id);
      if (sec) sec.label = label;
    });
  };

  const handleAddCustomItem = (secId: string) => {
    updateData((prev) => {
      const sec = (prev.customSections || []).find(s => s.id === secId);
      if (sec) {
        sec.items.push({ id: `ci-${Date.now()}`, title: "New Item", subtitle: "", date: "", summary: "", highlights: [] });
      }
    });
  };

  const handleUpdateCustomItem = (secId: string, itemId: string, field: string, value: string) => {
    updateData((prev) => {
      const sec = (prev.customSections || []).find(s => s.id === secId);
      if (sec) {
        const item = sec.items.find(i => i.id === itemId);
        if (item) (item as any)[field] = value;
      }
    });
  };

  const handleDeleteCustomItem = (secId: string, itemId: string) => {
    updateData((prev) => {
      const sec = (prev.customSections || []).find(s => s.id === secId);
      if (sec) {
        sec.items = sec.items.filter(i => i.id !== itemId);
      }
    });
  };

  const handleStyleChange = (field: string, val: any) => {
    updateData((prev) => {
      if (field === "coverLetter") {
        prev.coverLetter = val;
      } else if (field === "basics") {
        prev.basics = { ...prev.basics, ...val };
      } else {
        (prev.style as any)[field] = val;
      }
    });
  };

  const handleCustomLabelChange = (sectionKey: string, text: string) => {
    updateData((prev) => {
      prev.sectionLabels[sectionKey] = text;
    });
  };

  const handleSectionVisibilityToggle = (sectionKey: string) => {
    updateData((prev) => {
      prev.sectionVisibility[sectionKey] = !prev.sectionVisibility[sectionKey];
    });
  };

  const handleSectionLayoutChange = (sectionKey: string, gridColumns: number) => {
    updateData((prev) => {
      if (!prev.sectionLayouts) prev.sectionLayouts = {};
      prev.sectionLayouts[sectionKey] = { 
        ...prev.sectionLayouts[sectionKey],
        gridColumns: gridColumns as 1 | 2 | 3 
      };
    });
  };

  const handleSidebarToggle = (sectionKey: string) => {
    updateData((prev) => {
      if (!prev.sectionLayouts) prev.sectionLayouts = {};
      const current = prev.sectionLayouts[sectionKey]?.useSidebar || false;
      prev.sectionLayouts[sectionKey] = {
        ...prev.sectionLayouts[sectionKey],
        useSidebar: !current,
        gridColumns: prev.sectionLayouts[sectionKey]?.gridColumns || 1
      };
    });
  };

  // JSON Raw Input Parsing
  const handleImportRawText = () => {
    try {
      const parsed = JSON.parse(rawTextJson);
      onTriggerImportJSON(parsed);
      setShowJsonInput(false);
      setRawTextJson("");
    } catch (err) {
      alert("Invalid JSON format! Please check bracket balances.");
    }
  };

  // Gap Detector Trigger
  const handleRunGapCheck = () => {
    const gaps = detectChronologicalGaps(data.work);
    setComputedGaps(gaps);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200/80 dark:border-slate-800/80 divide-y divide-slate-200/40">
      {/* COCKPIT HEADER CONTROLS */}
      <div className="p-4 bg-slate-50/60 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-500 animate-spin-slow" />
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-100">Parameters Console</h2>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {onUndo && (
              <button
                type="button"
                onClick={onUndo}
                title="Undo changes"
                className="p-1 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[11px] font-medium transition"
              >
                Undo
              </button>
            )}
            {onRedo && (
              <button
                type="button"
                onClick={onRedo}
                title="Redo changes"
                className="p-1 px-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-[11px] font-medium transition"
              >
                Redo
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PARAMETERS NAVIGATION ACCORDION */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 pb-20">
        {/* SECTION A: THEME STYLE & FONT PALETTES */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => toggleAccordion("style")}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/40 text-left font-semibold text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100/40"
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-sky-500" />
              <span>Theme, Aesthetics & Typography</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSectionId === "style" ? "rotate-180" : ""}`} />
          </button>

          {openSectionId === "style" && (
            <div className="p-[18px] space-y-[18px] border-t border-slate-100 text-xs text-slate-700 dark:text-slate-300">
              {/* 1. Layout choice */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Structural Layout Presets
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "modern-sidebar", name: "Dynamic Sidebar", desc: "Classic layout with a dedicated sidebar" },
                    { id: "classic-minimal", name: "Classic Centered", desc: "Traditional clean centered design" },
                    { id: "bento-grid", name: "Bento Block Grid", desc: "Modern modular card layout" },
                    { id: "creative-pro", name: "Creative Gradient", desc: "Visually striking modern aesthetic" },
                    { id: "simple-centered", name: "Simple Centered", desc: "Minimalist and focused layout" },
                    { id: "bold-header", name: "Bold Header", desc: "Impactful design for key bio" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleStyleChange("template", t.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        data.style.template === t.id
                          ? "bg-sky-500/10 border-sky-500 text-sky-700 dark:text-sky-400"
                          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-semibold text-xs">{t.name}</div>
                      <div className="text-[10px] text-slate-600 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Color branding palettes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Cohesive Color Palettes
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COLOR_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectThemePreset(p.id)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                        data.style.themeId === p.id
                          ? "bg-slate-800 text-white border-slate-800"
                          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.colors.primary }} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom Color Pickers */}
                <div className="grid grid-cols-3 gap-2.5 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border">
                  <div>
                    <label htmlFor="color-picker-primary" className="text-[10px] text-slate-700 font-bold block mb-1">Primary Color</label>
                    <input
                      id="color-picker-primary"
                      type="color"
                      aria-label="Primary Color"
                      value={data.style.colors.primary}
                      onChange={(e) => handleColorChange("primary", e.target.value)}
                      className="w-full h-8 rounded shrink-0 cursor-pointer border-transparent bg-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="color-picker-secondary" className="text-[10px] text-slate-700 font-bold block mb-1">Secondary Color</label>
                    <input
                      id="color-picker-secondary"
                      type="color"
                      aria-label="Secondary Color"
                      value={data.style.colors.secondary}
                      onChange={(e) => handleColorChange("secondary", e.target.value)}
                      className="w-full h-8 rounded shrink-0 cursor-pointer border-transparent bg-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="color-picker-accent" className="text-[10px] text-slate-700 font-bold block mb-1">Accent Color</label>
                    <input
                      id="color-picker-accent"
                      type="color"
                      aria-label="Accent Color"
                      value={data.style.colors.accent}
                      onChange={(e) => handleColorChange("accent", e.target.value)}
                      className="w-full h-8 rounded shrink-0 cursor-pointer border-transparent bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Typography pairing sugestions */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Font Pairing Presets
                </label>
                <div className="space-y-1.5">
                  {FONT_PAIRINGS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectFontPairing(p.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl border text-[11px] transition-all cursor-pointer flex items-center justify-between ${
                        data.style.fontPairingId === p.id
                          ? "bg-slate-800 text-white border-slate-900"
                          : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <span className="font-semibold">{p.name}</span>
                      <Check className={`w-3.5 h-3.5 text-sky-400 ${data.style.fontPairingId === p.id ? "opacity-100" : "opacity-0"}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Page parameters controls */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border">
                <div>
                  <label htmlFor="style-page-size-select" className="text-[10px] text-slate-700 font-bold uppercase tracking-wide block mb-1">Page Size</label>
                  <select
                    id="style-page-size-select"
                    aria-label="Document Page Size"
                    value={data.style.pageSize}
                    onChange={(e) => handleStyleChange("pageSize", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border text-xs px-2 py-1 rounded focus:outline-none"
                  >
                    <option value="A4">A4 Standard Sheet</option>
                    <option value="Letter">US Letter</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="style-density-preset-select" className="text-[10px] text-slate-700 font-bold uppercase tracking-wide block mb-1">Density size</label>
                  <select
                    id="style-density-preset-select"
                    aria-label="Layout density scale"
                    value={data.style.sizePreset}
                    onChange={(e) => handleStyleChange("sizePreset", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border text-xs px-2 py-1 rounded focus:outline-none"
                  >
                    <option value="compact">Compact Space</option>
                    <option value="normal">Normal Elegant</option>
                    <option value="large">Large Spacious</option>
                  </select>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-200/50 dark:border-slate-800 mt-1 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Monochrome Grayscale</span>
                  <button
                    type="button"
                    onClick={onTriggerGrayscaleToggle}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider cursor-pointer transition ${
                      data.style.grayscaleMode
                        ? "bg-slate-800 text-emerald-400 border border-slate-700 dark:bg-zinc-800"
                        : "bg-white text-slate-600 border border-slate-200 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {data.style.grayscaleMode ? "ENABLED ON CANVAS" : "ENABLE PREVIEW"}
                  </button>
                </div>

                <div className="col-span-2 pt-1 border-t border-slate-200/50 dark:border-slate-800 mt-1 flex justify-between items-center text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Interactive Digital Mode</span>
                  <button
                    type="button"
                    onClick={() => handleStyleChange("digitalMode", !data.style.digitalMode)}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider cursor-pointer transition ${
                      data.style.digitalMode
                        ? "bg-slate-800 text-sky-400 border border-slate-700 dark:bg-zinc-800 dark:text-sky-400"
                        : "bg-white text-slate-600 border border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {data.style.digitalMode ? "INTERACTIVE ONLINE" : "OFFLINE / PRINT"}
                  </button>
                </div>
              </div>

              {/* 5. Fine Squeeze & Stretch sliders */}
              <div className="space-y-3 pt-1 border-t border-slate-200/55 dark:border-slate-800">
                <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Precise Fitting Sliders
                </span>
                
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-700 dark:text-slate-400 mb-1">
                    <label htmlFor="style-padding-slider" className="font-bold">Base Padding Spacing:</label>
                    <span className="font-mono">{data.style.padding}px</span>
                  </div>
                  <KawaiiSlider
                    min={12}
                    max={48}
                    step={2}
                    value={data.style.padding}
                    onChange={(val) => handleStyleChange("padding", val)}
                    baseColor="#0ea5e9"
                    ariaLabel="Base Padding Spacing"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-700 dark:text-slate-400 mb-1">
                    <label htmlFor="style-line-spacing-select" className="font-bold">Line spacing block:</label>
                    <span className="capitalize font-mono">{data.style.lineSpacing}</span>
                  </div>
                  <select
                    id="style-line-spacing-select"
                    aria-label="Line spacing block"
                    value={data.style.lineSpacing}
                    onChange={(e) => handleStyleChange("lineSpacing", e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border text-xs px-2 py-1 rounded focus:outline-none dark:text-white"
                  >
                    <option value="compact">Compact Leading</option>
                    <option value="normal">Default Snug</option>
                    <option value="spacious">Spacious leading</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-700 dark:text-slate-400 mb-1">
                    <label htmlFor="style-paragraph-margin-slider" className="font-bold">Paragraph spacing factor:</label>
                    <span className="font-mono">{data.style.paragraphMargin}x</span>
                  </div>
                  <KawaiiSlider
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    value={data.style.paragraphMargin}
                    onChange={(val) => handleStyleChange("paragraphMargin", val)}
                    baseColor="#0ea5e9"
                    ariaLabel="Paragraph spacing factor"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1.5">
                  <div className="space-y-1">
                    <label htmlFor="style-header-format-select" className="text-[10px] text-slate-700 dark:text-slate-400 font-bold block">Section Header Style:</label>
                    <select
                      id="style-header-format-select"
                      aria-label="Section Header Style"
                      value={data.style.headerStyle}
                      onChange={(e) => handleStyleChange("headerStyle", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border text-xs px-1.5 py-1 rounded focus:outline-none dark:text-white"
                    >
                      <option value="artistic">Artistic Bold (Design Default)</option>
                      <option value="minimalist">Minimalist</option>
                      <option value="timeline-integrated">Timeline Rule</option>
                      <option value="accent-rule">Accent Ribbon</option>
                      <option value="classic">Traditional Centered</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="style-bullet-preset-select" className="text-[10px] text-slate-700 dark:text-slate-400 font-bold block">Bullet Style symbol:</label>
                    <select
                      id="style-bullet-preset-select"
                      aria-label="Bullet Style symbol"
                      value={data.style.bulletStyle}
                      onChange={(e) => handleStyleChange("bulletStyle", e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border text-xs px-1.5 py-1 rounded focus:outline-none dark:text-white"
                    >
                      <option value="square-solid">Solid Square (■)</option>
                      <option value="square">Hollow Square (□)</option>
                      <option value="dash">Em Dash (—)</option>
                      <option value="diamond">Solid Diamond (◆)</option>
                      <option value="chevron">Chevron index (›)</option>
                      <option value="svg">Check badge (SVG)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION B: CORE BASICS (CONTACT DETAILS) */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => toggleAccordion("basics")}
            className="w-full flex items-center justify-between p-4 bg-slate-50/55 dark:bg-slate-900/40 text-left font-semibold text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100/40"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[9px] bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-bold px-1.5 py-0.5 rounded">1/4</span>
              <User className="w-4 h-4 text-sky-500" />
              <span>Contact & Bio Details</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSectionId === "basics" ? "rotate-180" : ""}`} />
          </button>

          {openSectionId === "basics" && (
            <div className="p-[18px] space-y-3.5 border-t border-slate-100 text-xs">
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 tracking-wide font-medium block uppercase">Full Name</label>
                  <input
                    type="text"
                    value={data.basics.name}
                    onChange={(e) => handleBasicsChange("name", e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 tracking-wide font-medium block uppercase">Job Title</label>
                  <input
                    type="text"
                    value={data.basics.title}
                    onChange={(e) => handleBasicsChange("title", e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 tracking-wide font-medium block uppercase">Email Address</label>
                  <input
                    type="email"
                    value={data.basics.email}
                    onChange={(e) => handleBasicsChange("email", e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 tracking-wide font-medium block uppercase">Phone Number</label>
                  <input
                    type="text"
                    value={data.basics.phone}
                    onChange={(e) => handleBasicsChange("phone", e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 tracking-wide font-medium block uppercase">City Location</label>
                  <input
                    type="text"
                    value={data.basics.location}
                    onChange={(e) => handleBasicsChange("location", e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 tracking-wide font-medium block uppercase">Website / url</label>
                  <input
                    type="text"
                    value={data.basics.website}
                    onChange={(e) => handleBasicsChange("website", e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 tracking-wide font-medium block uppercase">LinkedIn URL</label>
                  <input
                    type="text"
                    value={data.basics.linkedin}
                    onChange={(e) => handleBasicsChange("linkedin", e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 tracking-wide font-medium block uppercase">GitHub link</label>
                  <input
                    type="text"
                    value={data.basics.github}
                    onChange={(e) => handleBasicsChange("github", e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              {/* Photo Upload segment */}
              <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Avatar Display Photo</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold text-slate-400">{data.basics.showPhoto ? "VISIBLE" : "HIDDEN"}</span>
                    <PremiumToggle 
                      id="toggle-show-photo"
                      checked={data.basics.showPhoto}
                      onChange={(checked) => handleBasicsChange("showPhoto", checked)}
                    />
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="Paste URL of avatar portrait..."
                  value={data.basics.photoUrl}
                  onChange={(e) => handleBasicsChange("photoUrl", e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs px-2.5 py-1.5 rounded-lg mt-1 focus:outline-none dark:text-white"
                />
              </div>
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    toggleAccordion("basics");
                    toggleAccordion("work");
                  }}
                  className="px-3 py-1.5 bg-sky-500 text-white text-xs rounded-lg hover:bg-sky-600 font-medium"
                >
                  Next: Work Experience
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION C: CHRONOLOGICAL EXPERIENCE LIST */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => toggleAccordion("work")}
            className="w-full flex items-center justify-between p-4 bg-slate-50/55 dark:bg-slate-900/40 text-left font-semibold text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100/40"
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-sky-500" />
              <span>Professional History</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSectionId === "work" ? "rotate-180" : ""}`} />
          </button>

          {openSectionId === "work" && (
            <div className="p-[18px] space-y-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">Gap & Timeline Audit</span>
                  <p className="text-[10px] text-slate-400">Checks for chronological gaps &gt; 3 months</p>
                </div>
                <button
                  type="button"
                  onClick={handleRunGapCheck}
                  className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 text-[10px] font-bold cursor-pointer transition shadow-xs dark:text-zinc-200"
                >
                  Analyze Timeline
                </button>
              </div>

              {/* Show gap alerts */}
              {computedGaps.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 rounded-xl p-3 space-y-1.5 text-[11px]">
                  <span className="font-bold uppercase tracking-wider text-[9px] text-amber-700 dark:text-amber-400 block">⚠️ Chronological Gaps Found ⚠️</span>
                  {computedGaps.map((g, idx) => (
                    <div key={idx} className="leading-tight">
                      Gap of <strong>{g.gapMonths} months</strong> detected between leaving <strong>{g.afterCompany}</strong> ({g.fromDate}) and starting at <strong>{g.beforeCompany}</strong> ({g.toDate}). Consider adding a project or consulting block.
                    </div>
                  ))}
                </div>
              )}

              {computedGaps.length === 0 && (
                <div className="text-[10px] text-slate-400 text-center pb-1">All dates aligned perfectly.</div>
              )}

              <div className="flex justify-between items-center mt-2 group">
                <div className="flex gap-2 items-center text-[10px] text-slate-500">
                  Section Layout (Columns):
                  {[1, 2, 3].map(cols => (
                    <button key={cols} type="button" onClick={() => handleSectionLayoutChange("work", cols)} 
                      className={`px-2 py-0.5 rounded border ${
                        (data.sectionLayouts?.work?.gridColumns || 1) === cols ? "bg-sky-500 text-white border-sky-500" : "bg-white dark:bg-slate-900 border-slate-200"
                      }`}>
                      {cols}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-full shadow-sm">
                  <span className="text-[8px] font-black uppercase text-slate-400">Sidebar</span>
                  <PremiumToggle
                    id="toggle-sidebar-work"
                    checked={!!data.sectionLayouts?.work?.useSidebar}
                    onChange={() => handleSidebarToggle("work")}
                  />
                </div>
              </div>

              <div className="space-y-3.5">
                {data.work.map((w, index) => (
                  <div key={w.id} className="p-3 bg-slate-50/40 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl relative space-y-2">
                    <div className="flex justify-between items-center border-b border-slate-200/60 dark:border-slate-800 pb-2 mb-2">
                      <span className="font-bold block text-slate-900 dark:text-white truncate max-w-[140px]">
                        {w.company || "Unnamed Company"}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleWorkMoveOrder(index, "up")}
                          aria-label="Move work item up"
                          disabled={index === 0}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 size-6 rounded text-slate-400 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWorkMoveOrder(index, "down")}
                          aria-label="Move work item down"
                          disabled={index === data.work.length - 1}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 size-6 rounded text-slate-400 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Duplicate item"
                          onClick={() => handleDuplicateWork(w)}
                          aria-label="Duplicate work item"
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 size-6 rounded text-slate-400 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteWork(w.id)}
                          aria-label="Delete work item"
                          className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/35 size-6 rounded text-rose-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Position title</span>
                        <input
                          type="text"
                          value={w.position}
                          onChange={(e) => handleUpdateWorkField(w.id, "position", e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border px-2 py-1 rounded focus:outline-none"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Company Name</span>
                        <input
                          type="text"
                          value={w.company}
                          onChange={(e) => handleUpdateWorkField(w.id, "company", e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border px-2 py-1 rounded focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Start Date (YYYY-MM)</span>
                        <input
                          type="text"
                          value={w.startDate}
                          placeholder="e.g. 2021-03"
                          onChange={(e) => handleUpdateWorkField(w.id, "startDate", e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border px-2 py-1 rounded focus:outline-none"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Location city</span>
                        <input
                          type="text"
                          value={w.location}
                          onChange={(e) => handleUpdateWorkField(w.id, "location", e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border px-2 py-1 rounded focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t">
                      <div className="flex items-center gap-2">
                        <PremiumToggle
                          id={`curr-${w.id}`}
                          checked={w.current}
                          onChange={(checked) => handleUpdateWorkField(w.id, "current", checked)}
                        />
                        <label htmlFor={`curr-${w.id}`} className="text-[10px] text-slate-500 font-bold uppercase cursor-pointer">
                          Currently Work Here
                        </label>
                      </div>

                      {!w.current && (
                        <input
                          type="text"
                          value={w.endDate}
                          placeholder="End date"
                          onChange={(e) => handleUpdateWorkField(w.id, "endDate", e.target.value)}
                          className="ml-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] px-2 py-0.5 max-w-[96px] rounded outline-none dark:text-white"
                        />
                      )}
                    </div>

                    {/* Bullet Highlights array within experience block */}
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Key Achievements Listing (X-Y-Z)</span>
                        <button
                          type="button"
                          onClick={() => handleAddHighlight(w.id)}
                          className="text-[9px] text-sky-500 hover:underline flex items-center gap-0.5 font-bold cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" /> Add Bullet
                        </button>
                      </div>

                      {w.highlights.map((bullet, bidx) => (
                        <div key={bidx} className="flex gap-1 items-start bg-white dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800">
                          <textarea
                            value={bullet}
                            onChange={(e) => handleUpdateHighlight(w.id, bidx, e.target.value)}
                            className="flex-1 bg-transparent text-[11.5px] text-slate-700 dark:text-slate-300 outline-none resize-none min-h-[44px]"
                          />
                          <div className="flex flex-col gap-0.5 shrink-0 justify-center">
                            <button
                              type="button"
                              onClick={() => handleMoveHighlight(w.id, bidx, "up")}
                              disabled={bidx === 0}
                              className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveHighlight(w.id, bidx, "down")}
                              disabled={bidx === w.highlights.length - 1}
                              className="p-0.5 text-slate-300 hover:text-slate-600 disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteHighlight(w.id, bidx)}
                              className="p-0.5 text-rose-300 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <PremiumButton
                onClick={handleAddWork}
                className="w-full mt-2"
              >
                Add Experience Node
              </PremiumButton>
            </div>
          )}
        </div>

        {/* SECTION D: ACADEMIC EDUCATION ENTRIES */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => toggleAccordion("education")}
            className="w-full flex items-center justify-between p-4 bg-slate-50/55 dark:bg-slate-900/40 text-left font-semibold text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100/40"
          >
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-4 h-4 text-sky-500" />
              <span>Academic Education</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSectionId === "education" ? "rotate-180" : ""}`} />
          </button>

          {openSectionId === "education" && (
            <div className="p-[18px] space-y-3.5 border-t border-slate-100 dark:border-slate-800 text-xs">
              
              <div className="flex justify-between items-center mt-2 group">
                <div className="flex gap-2 items-center text-[10px] text-slate-500">
                  Section Layout (Columns):
                  {[1, 2, 3].map(cols => (
                    <button key={cols} type="button" onClick={() => handleSectionLayoutChange("education", cols)} 
                      className={`px-2 py-0.5 rounded border ${
                        (data.sectionLayouts?.education?.gridColumns || 1) === cols ? "bg-sky-500 text-white border-sky-500" : "bg-white dark:bg-slate-900 border-slate-200"
                      }`}>
                      {cols}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-full shadow-sm">
                  <span className="text-[8px] font-black uppercase text-slate-400">Sidebar</span>
                  <PremiumToggle
                    id="toggle-sidebar-education"
                    checked={!!data.sectionLayouts?.education?.useSidebar}
                    onChange={() => handleSidebarToggle("education")}
                  />
                </div>
              </div>

              {data.education.map((edu) => (
                <div key={edu.id} className="p-3 bg-slate-50/50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl relative space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1">
                    <span className="font-bold text-slate-800 dark:text-white">{edu.institution || "New Institution"}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteEdu(edu.id)}
                      className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase">Degree/Study</span>
                      <input
                        type="text"
                        value={edu.studyType}
                        onChange={(e) => handleUpdateEduField(edu.id, "studyType", e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border px-2 py-1 rounded"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase">Major/Area</span>
                      <input
                        type="text"
                        value={edu.area}
                        onChange={(e) => handleUpdateEduField(edu.id, "area", e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border px-2 py-1 rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase">GPA / Index</span>
                      <input
                        type="text"
                        value={edu.gpa}
                        placeholder="e.g. 3.9 / 4.0"
                        onChange={(e) => handleUpdateEduField(edu.id, "gpa", e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border px-2 py-1 rounded"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400 uppercase">School Location</span>
                      <input
                        type="text"
                        value={edu.location}
                        onChange={(e) => handleUpdateEduField(edu.id, "location", e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border px-2 py-1 rounded"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <PremiumButton
                onClick={handleAddEducation}
                className="w-full mt-2"
              >
                Add Academic Node
              </PremiumButton>
            </div>
          )}
        </div>

        {/* SECTION E: SKILLS & CHIPS METRICS */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => toggleAccordion("skills")}
            className="w-full flex items-center justify-between p-4 bg-slate-50/55 dark:bg-slate-900/40 text-left font-semibold text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100/40"
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-sky-500" />
              <span>Skills Competency</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSectionId === "skills" ? "rotate-180" : ""}`} />
          </button>

          {openSectionId === "skills" && (
            <div className="p-[18px] space-y-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="space-y-2.5 max-h-[290px] overflow-y-auto pr-1">
                {data.skills.map((s) => (
                  <div key={s.id} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <input
                      type="text"
                      aria-label="Skill Name"
                      value={s.name}
                      onChange={(e) => handleUpdateSkillField(s.id, "name", e.target.value)}
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded text-xs focus:outline-none dark:text-white"
                    />

                    <select
                      aria-label="Skill Style Layout"
                      value={s.style}
                      onChange={(e) => handleUpdateSkillField(s.id, "style", e.target.value)}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] px-1 py-1 rounded dark:text-white [color-scheme:dark]"
                    >
                      <option value="chip">Chip Box</option>
                      <option value="progress">Progress bar</option>
                      <option value="badge">Pure Badge</option>
                    </select>

                    <div className="w-24">
                      <KawaiiSlider
                        value={s.level}
                        onChange={(val) => handleUpdateSkillField(s.id, "level", val)}
                        baseColor={s.level < 40 ? "#fca5a5" : s.level < 70 ? "#fdba74" : "#86efac"}
                        ariaLabel={`Skill level for ${s.name}`}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(s.id)}
                      className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <PremiumButton
                onClick={handleAddSkill}
                className="w-full mt-2"
              >
                Add Competency Tag
              </PremiumButton>
            </div>
          )}
        </div>

        {/* SECTION F: CUSTOM SECTIONS (AWARDS, CERTIFICATIONS & VOLUNTEERING) */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => toggleAccordion("custom")}
            className="w-full flex items-center justify-between p-4 bg-slate-50/55 dark:bg-slate-900/40 text-left font-semibold text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100/40"
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-sky-500" />
              <span>Accolades, Certs & Volunteers</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSectionId === "custom" ? "rotate-180" : ""}`} />
          </button>

          {openSectionId === "custom" && (
            <div className="p-[18px] space-y-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              {/* Accreditations & Certifications list */}
              <div className="space-y-2 pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Accreditation Certs</span>
                  <div className="flex gap-2 items-center">
                    <div className="flex gap-1 items-center text-[9px] text-slate-400">
                       Grid:
                       {[1, 2, 3].map(cols => (
                        <button key={cols} type="button" onClick={() => handleSectionLayoutChange("certifications", cols)} 
                          className={`px-1.5 py-0.5 rounded text-[9px] border ${
                            (data.sectionLayouts?.certifications?.gridColumns || 1) === cols ? "bg-sky-500 text-white border-sky-500" : "bg-white dark:bg-slate-900 border-slate-200"
                          }`}>
                          {cols}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 ml-2">
                       <span className="text-[8px] font-black uppercase text-slate-400">Sidebar</span>
                       <PremiumToggle
                        id="toggle-sidebar-certs"
                        checked={!!data.sectionLayouts?.certifications?.useSidebar}
                        onChange={() => handleSidebarToggle("certifications")}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCertification}
                      className="text-[10px] text-sky-700 hover:text-sky-800 underline flex items-center gap-0.5 cursor-pointer font-semibold"
                    >
                      <Plus className="w-3 h-3" /> Add Cert
                    </button>
                  </div>
                </div>
                {data.certifications.map((c) => (
                  <div key={c.id} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px]">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => handleUpdateCertField(c.id, "name", e.target.value)}
                      placeholder="AWS, GCP, Scrum..."
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-xs outline-none dark:text-white"
                    />
                    <input
                      type="text"
                      value={c.issuer}
                      onChange={(e) => handleUpdateCertField(c.id, "issuer", e.target.value)}
                      placeholder="Issuer"
                      className="w-20 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded text-xs outline-none dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteCert(c.id)}
                      className="text-rose-500 p-0.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Awards and Acclamation list */}
              <div className="space-y-2 pb-3.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Awards & Recognition</span>
                  <button
                    type="button"
                    onClick={handleAddAward}
                    className="text-[10px] text-sky-700 hover:text-sky-800 underline flex items-center gap-0.5 cursor-pointer font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add Award
                  </button>
                </div>
                {data.awards.map((award) => (
                  <div key={award.id} className="bg-slate-50 dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] space-y-1.5">
                    <div className="flex justify-between items-center">
                      <input
                        type="text"
                        value={award.title}
                        onChange={(e) => handleUpdateAwardField(award.id, "title", e.target.value)}
                        placeholder="Outstanding Talent Laurel..."
                        className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-xs outline-none font-bold dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteAward(award.id)}
                        className="text-rose-500 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <input
                        type="text"
                        value={award.awarder}
                        onChange={(e) => handleUpdateAwardField(award.id, "awarder", e.target.value)}
                        placeholder="Awarder"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded text-[10px] outline-none dark:text-white"
                      />
                      <input
                        type="text"
                        value={award.date}
                        onChange={(e) => handleUpdateAwardField(award.id, "date", e.target.value)}
                        placeholder="Date (YYYY-MM)"
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded text-[10px] outline-none dark:text-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Languages Spoken list */}
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-600 dark:text-slate-300">Languages Fluency</span>
                  <button
                    type="button"
                    onClick={handleAddLanguage}
                    className="text-[10px] text-sky-700 hover:text-sky-800 underline flex items-center gap-0.5 cursor-pointer font-semibold"
                  >
                    <Plus className="w-3 h-3" /> Add Language
                  </button>
                </div>
                {data.languages.map((l) => (
                  <div key={l.id} className="flex gap-2 items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[11px]">
                    <input
                      type="text"
                      value={l.name}
                      onChange={(e) => handleUpdateLanguage(l.id, "name", e.target.value)}
                      placeholder="e.g. French"
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded text-xs outline-none dark:text-white"
                    />
                    <input
                      type="text"
                      value={l.fluency}
                      onChange={(e) => handleUpdateLanguage(l.id, "fluency", e.target.value)}
                      placeholder="Native / Fluent"
                      className="w-24 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-1.5 py-0.5 rounded text-xs outline-none dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteLanguage(l.id)}
                      className="text-rose-500 p-0.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION G: CUSTOM DYNAMIC SECTIONS */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => toggleAccordion("custom-defined")}
            className="w-full flex items-center justify-between p-4 bg-slate-50/55 dark:bg-slate-900/40 text-left font-semibold text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100/40"
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-4 h-4 text-sky-500" />
              <span>Add Custom Section Block</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSectionId === "custom-defined" ? "rotate-180" : ""}`} />
          </button>

          {openSectionId === "custom-defined" && (
            <div className="p-[18px] space-y-4 border-t border-slate-100 dark:border-slate-800 text-xs">
              <p className="text-[10px] text-slate-400">Create the sections you need (Projects, Hobbies, Publications, etc) and choose where they live on the page.</p>
              
              {(data.customSections || []).map((sec) => (
                <div key={sec.id} className="p-3 bg-slate-50/40 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                    <input
                      type="text"
                      value={sec.label}
                      onChange={(e) => handleUpdateCustomSectionTitle(sec.id, e.target.value)}
                      placeholder="Section Title..."
                      className="bg-transparent font-bold text-slate-900 dark:text-white outline-none flex-1 text-xs"
                    />
                    <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 ml-2">
                       <span className="text-[8px] font-black uppercase text-slate-400">Side</span>
                       <PremiumToggle
                        id={`toggle-sidebar-custom-${sec.id}`}
                        checked={!!data.sectionLayouts?.[`custom_${sec.id}`]?.useSidebar}
                        onChange={() => handleSidebarToggle(`custom_${sec.id}`)}
                      />
                    </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomSection(sec.id)}
                        className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {sec.items.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2 space-y-1.5">
                        <div className="flex justify-between gap-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handleUpdateCustomItem(sec.id, item.id, "title", e.target.value)}
                            placeholder="Item Heading"
                            className="bg-transparent text-[11px] font-bold outline-none flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomItem(sec.id, item.id)}
                            className="text-slate-300 hover:text-rose-500"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.subtitle || ""}
                          onChange={(e) => handleUpdateCustomItem(sec.id, item.id, "subtitle", e.target.value)}
                          placeholder="Subtitle / Link"
                          className="w-full bg-slate-50 dark:bg-slate-900 border-none px-2 py-0.5 rounded text-[10px] outline-none"
                        />
                        <textarea
                          value={item.summary}
                          onChange={(e) => handleUpdateCustomItem(sec.id, item.id, "summary", e.target.value)}
                          placeholder="Details..."
                          className="w-full bg-slate-50 dark:bg-slate-900 border-none px-2 py-1 rounded text-[10px] outline-none resize-none min-h-[40px]"
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleAddCustomItem(sec.id)}
                      className="w-full py-1.5 border border-dashed border-sky-200 dark:border-sky-900 text-sky-500 rounded-xl text-[10px] font-bold hover:bg-sky-50 dark:hover:bg-sky-950/20"
                    >
                      <Plus className="w-3 h-3 inline mr-1" /> Add Entry
                    </button>
                  </div>
                </div>
              ))}

              <PremiumButton
                onClick={handleAddCustomSection}
                className="w-full mt-2"
              >
                Add New Dynamic Section
              </PremiumButton>
            </div>
          )}
        </div>

        {/* SECTION G: COVER LETTER PAGE MANAGER */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => toggleAccordion("letter")}
            className="w-full flex items-center justify-between p-4 bg-slate-50/55 dark:bg-slate-900/40 text-left font-semibold text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100/40"
          >
            <div className="flex items-center gap-2.5">
              <FileCheck className="w-4 h-4 text-sky-500" />
              <span>Digital Cover Letter</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSectionId === "letter" ? "rotate-180" : ""}`} />
          </button>

          {openSectionId === "letter" && (
            <div className="p-[18px] space-y-3.5 border-t border-slate-100 text-xs">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border mb-2">
                <div>
                  <span className="font-bold text-slate-800 block">Include Letter block</span>
                  <p className="text-[10px] text-slate-400">Appends secondary tailored cover page</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStyleChange("coverLetter", { ...data.coverLetter, enabled: !data.coverLetter.enabled })}
                  className={`px-3 py-1 border text-[10px] font-bold rounded-lg cursor-pointer ${
                    data.coverLetter.enabled
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-600"
                      : "bg-white border-slate-200 text-slate-500 hover:bg-slate-55"
                  }`}
                >
                  {data.coverLetter.enabled ? "ENABLED" : "DISABLED"}
                </button>
              </div>

              {data.coverLetter.enabled && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400">Recipient Name</span>
                      <input
                        type="text"
                        value={data.coverLetter.addresseeName}
                        onChange={(e) => handleStyleChange("coverLetter", { ...data.coverLetter, addresseeName: e.target.value })}
                        className="w-full bg-white border px-2 py-1 rounded"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-slate-400">Recipient Title</span>
                      <input
                        type="text"
                        value={data.coverLetter.addresseeTitle}
                        onChange={(e) => handleStyleChange("coverLetter", { ...data.coverLetter, addresseeTitle: e.target.value })}
                        className="w-full bg-white border px-2 py-1 rounded"
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-medium">Company details</span>
                    <input
                      type="text"
                      value={data.coverLetter.companyName}
                      onChange={(e) => handleStyleChange("coverLetter", { ...data.coverLetter, companyName: e.target.value })}
                      placeholder="Google DeepMind..."
                      className="w-full bg-white border px-2.5 py-1 rounded mb-1"
                    />
                    <input
                      type="text"
                      value={data.coverLetter.companyAddress}
                      onChange={(e) => handleStyleChange("coverLetter", { ...data.coverLetter, companyAddress: e.target.value })}
                      placeholder="6 Pancras Square, London"
                      className="w-full bg-white border px-2.5 py-1 rounded"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400">Subject rule</span>
                    <input
                      type="text"
                      value={data.coverLetter.subject}
                      onChange={(e) => handleStyleChange("coverLetter", { ...data.coverLetter, subject: e.target.value })}
                      className="w-full bg-white border px-2 py-1 rounded"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-400">Letter Salutation</span>
                    <input
                      type="text"
                      value={data.coverLetter.salutation}
                      onChange={(e) => handleStyleChange("coverLetter", { ...data.coverLetter, salutation: e.target.value })}
                      className="w-full bg-white border px-2 py-1 rounded"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-slate-400">Cohesive narrative body text</span>
                      <span className="text-[9px] text-slate-400">Supports direct double-click edit on canvas</span>
                    </div>
                    <textarea
                      value={data.coverLetter.body}
                      onChange={(e) => handleStyleChange("coverLetter", { ...data.coverLetter, body: e.target.value })}
                      className="w-full bg-white border px-2 py-1 rounded min-h-[140px] resize-none text-[11.5px]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION H: JSON SCHEMA IMPORT/EXPORT METADATA */}
        <div className="border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-slate-900/30">
          <button
            type="button"
            onClick={() => toggleAccordion("jsonexchange")}
            className="w-full flex items-center justify-between p-4 bg-slate-50/55 dark:bg-slate-900/40 text-left font-semibold text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100/40"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 text-sky-500" />
              <span>JSON Mappings Exchange</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openSectionId === "jsonexchange" ? "rotate-180" : ""}`} />
          </button>

          {openSectionId === "jsonexchange" && (
            <div className="p-[18px] space-y-3 border-t border-slate-100 text-xs">
              <div className="flex flex-col gap-3">
                <PremiumButton
                  onClick={onTriggerDownloadJSON}
                  className="w-full"
                >
                  Export Resume Schema
                </PremiumButton>
                <button
                  type="button"
                  onClick={() => setShowJsonInput(!showJsonInput)}
                  className="w-full py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-black rounded-full text-center cursor-pointer flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest hover:border-sky-500 transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Import JSON Node
                </button>
              </div>

              {showJsonInput && (
                <div className="space-y-2 pt-2 border-t mt-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Paste standard JSON resume text:</span>
                  <textarea
                    value={rawTextJson}
                    onChange={(e) => setRawTextJson(e.target.value)}
                    placeholder='{"basics": {"name": "..."}}'
                    className="w-full h-32 bg-slate-50 border p-2 text-xs font-mono rounded"
                  />
                  <div className="flex justify-end gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setShowJsonInput(false)}
                      className="px-2.5 py-1 text-slate-400"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleImportRawText}
                      className="px-3 py-1 bg-sky-500 text-white rounded font-bold hover:bg-sky-600"
                    >
                      Parse JSON
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
