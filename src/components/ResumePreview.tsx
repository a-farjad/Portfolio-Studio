/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ResumeData, WorkEntry, EducationEntry, CertificationEntry, AwardEntry, SkillItem } from "../types";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter, Layers, BadgeCheck, Sparkles, Check } from "lucide-react";
import QRCode from "qrcode";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ResumePreviewProps {
  data: ResumeData;
  viewMode: "desktop" | "mobile";
  onUpdateBasics: (field: string, value: string) => void;
  onUpdateWorkEntry: (id: string, field: string, value: any) => void;
  onUpdateEducationEntry: (id: string, field: string, value: any) => void;
  onUpdateSkill: (id: string, field: string, value: any) => void;
  onUpdateCustomSectionItem: (sectionId: string, itemId: string, field: string, value: any) => void;
  onUpdateLetterBody: (body: string) => void;
  onUpdateSectionOrder: (order: string[]) => void;
  className?: string;
  zoom?: number; // scale percent
  matchedKeywords?: string[];
}

export default function ResumePreview({
  data,
  viewMode,
  onUpdateBasics,
  onUpdateWorkEntry,
  onUpdateEducationEntry,
  onUpdateSkill,
  onUpdateCustomSectionItem,
  onUpdateLetterBody,
  onUpdateSectionOrder,
  className = "",
  zoom = 100,
  matchedKeywords = []
}: ResumePreviewProps) {
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const qrTarget = data.basics.website || (data.basics.linkedin ? `https://linkedin.com/in/${data.basics.linkedin}` : "https://google.com");
    QRCode.toDataURL(qrTarget, {
      margin: 1,
      width: 80,
      color: {
        dark: data.style.grayscaleMode ? "#000000" : data.style.colors.primary,
        light: "#ffffff"
      }
    })
      .then((url) => setQrCodeData(url))
      .catch((err) => console.error(err));
  }, [data.basics.website, data.basics.linkedin, data.style.colors.primary, data.style.grayscaleMode]);

  const style = data.style;
  const isPrint = style.grayscaleMode;
  const isDigital = style.digitalMode;

  const highlightText = (text: string, keywords?: string[]) => {
    if (!keywords || keywords.length === 0 || !text) return text;
    const valid = keywords.filter(k => k.trim().length > 0);
    if (valid.length === 0) return text;

    // Escape regex characters
    const escaped = valid.map(k => k.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    // Use word boundaries correctly
    const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    if (parts.length === 1) return text;

    return (
      <>
        {parts.map((part, idx) => {
          const isMatch = valid.some(
            k => k.toLowerCase() === part.toLowerCase()
          );
          if (isMatch) {
            return (
              <mark
                key={`highlight-${idx}`}
                className="bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300 px-1 py-0.5 rounded font-semibold border-b-2 border-emerald-500/40 cursor-help transition-colors"
                title="Matched ATS keyword requirement tag"
              >
                {part}
              </mark>
            );
          }
          return <React.Fragment key={`text-${idx}`}>{part}</React.Fragment>;
        })}
      </>
    );
  };

  const digitalEntryClass = isDigital ? "hover:scale-[1.01] hover:bg-slate-50/50 dark:hover:bg-slate-950/30 hover:shadow-xs transition-all duration-300 rounded-xl p-2.5 -m-2.5 border border-transparent hover:border-slate-200/40 dark:hover:border-slate-800/30 cursor-pointer" : "";

  const primaryColor = isPrint ? "#000000" : style.colors.primary;
  const secondaryColor = isPrint ? "#3b3b3b" : style.colors.secondary;
  const accentColor = isPrint ? "#4b4b4b" : style.colors.accent;
  const textColor = isPrint ? "#1a1a1a" : style.colors.text;
  const paperBgColor = style.colors.paperBg;

  // Spacing variables
  const sizeMap = {
    compact: { font: "text-xs", h1: "text-xl", h2: "text-sm", pad: "p-[18px] md:p-6" },
    normal: { font: "text-[13px]", h1: "text-2xl", h2: "text-base", pad: "p-6 md:p-8" },
    large: { font: "text-sm", h1: "text-3xl", h2: "text-lg", pad: "p-7 md:p-10" }
  };
  const activeSizing = sizeMap[style.sizePreset] || sizeMap.normal;

  const leadingMap = {
    compact: "leading-tight",
    normal: "leading-snug",
    spacious: "leading-relaxed"
  };
  const activeLeading = leadingMap[style.lineSpacing] || leadingMap.normal;

  const trackingMap = {
    tighter: "tracking-tighter",
    tight: "tracking-tight",
    normal: "tracking-normal",
    wide: "tracking-wide"
  };
  const activeTracking = trackingMap[style.letterSpacing] || trackingMap.normal;

  // Layout parameters
  const pageRatio = style.pageSize === "A4" ? "aspect-[210/297]" : "aspect-[8.5/11]";
  const pageHeightClass = style.pageSize === "A4" ? "min-h-[1120px]" : "min-h-[1050px]";

  // Handle direct inline typing updates smoothly
  const handleBlur = (section: string, id: string, field: string, value: string) => {
    if (section === "basics") {
      onUpdateBasics(field, value);
    } else if (section === "work") {
      onUpdateWorkEntry(id, field, value);
    } else if (section === "education") {
      onUpdateEducationEntry(id, field, value);
    } else if (section === "skills") {
      onUpdateSkill(id, field, value);
    }
  };

  // Icon mapping
  const renderIcon = (name: string, size = 12) => {
    const css = `w-3.5 h-3.5 italic inline-block shrink-0`;
    switch (name) {
      case "mail": return <Mail className={css} />;
      case "phone": return <Phone className={css} />;
      case "location": return <MapPin className={css} />;
      case "globe": return <Globe className={css} />;
      case "linkedin": return <Linkedin className={css} />;
      case "github": return <Github className={css} />;
      case "twitter": return <Twitter className={css} />;
      default: return null;
    }
  };

  // Bullet point symbol renderer
  const renderBulletMarker = () => {
    switch (style.bulletStyle) {
      case "square-solid":
        return <span className="w-1.5 h-1.5 border border-black dark:border-white bg-black dark:bg-white block shrink-0 mr-2.5 mt-1.5 select-none" />;
      case "square":
        return <span className="w-1.5 h-1.5 border border-black dark:border-zinc-400 block shrink-0 mr-2.5 mt-1.5 select-none" />;
      case "diamond":
        return <span className="text-sky-500 mr-2 text-[10px] select-none">◆</span>;
      case "chevron":
        return <span className="text-sky-500 mr-2 text-[10px] select-none font-bold">›</span>;
      case "svg":
        return (
          <span className="mr-2 text-emerald-500 shrink-0">
            <svg className="w-3.5 h-3.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        );
      default:
        return <span className="text-slate-600 mr-2 text-sm select-none">—</span>;
    }
  };

  // Cover Letter Component
  const renderCoverLetter = () => {
    if (!data.coverLetter.enabled) return null;
    return (
      <div
        id="resume-cover-letter-page"
        className={`print-page bg-white relative shadow-md rounded-2xl w-full text-slate-800 ${pageRatio} ${activeSizing.pad} ${className} flex flex-col justify-between`}
        style={{
          fontFamily: style.fonts.body,
          color: textColor,
          backgroundColor: paperBgColor,
          padding: `${style.padding}px`
        }}
      >
        <div className="space-y-6">
          {/* Letter header matches Resume header layout */}
          <div className="border-b pb-5 flex justify-between items-start" style={{ borderColor: primaryColor + "15" }}>
            <div>
              <h2 className="font-bold tracking-tight text-3xl" style={{ fontFamily: style.fonts.heading, color: primaryColor }}>
                {data.basics.name}
              </h2>
              <p className="text-sm font-medium" style={{ color: secondaryColor }}>{data.basics.title}</p>
            </div>
            <div className="text-right text-[11px] text-slate-700 space-y-0.5">
              {data.basics.email && <div>{data.basics.email}</div>}
              {data.basics.phone && <div>{data.basics.phone}</div>}
              {data.basics.location && <div>{data.basics.location}</div>}
            </div>
          </div>

          {/* Adressee detail */}
          <div className="space-y-1 text-xs">
            <div className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">Recipient details</div>
            <div className="font-bold text-slate-800" style={{ color: primaryColor }}>{data.coverLetter.addresseeName}</div>
            {data.coverLetter.addresseeTitle && <div className="text-slate-600 font-medium">{data.coverLetter.addresseeTitle}</div>}
            {data.coverLetter.companyName && <div className="text-slate-700 font-bold">{data.coverLetter.companyName}</div>}
            {data.coverLetter.companyAddress && <div className="text-slate-700">{data.coverLetter.companyAddress}</div>}
            <div className="text-slate-600 mt-2 block">{data.coverLetter.date}</div>
          </div>

          {/* Subject heading */}
          {data.coverLetter.subject && (
            <div className="font-bold border-l-2 pl-3 py-1 text-xs" style={{ borderColor: secondaryColor, color: primaryColor }}>
              RE: {data.coverLetter.subject}
            </div>
          )}

          {/* Body editorial */}
          <div className={`space-y-4 text-xs ${activeLeading} ${activeTracking} whitespace-pre-wrap leading-relaxed`}>
            <div className="font-semibold" style={{ color: primaryColor }}>{data.coverLetter.salutation}</div>
            
            {/* Direct write to cover letter body */}
            <div
              contentEditable
              suppressContentEditableWarning
              className="outline-none focus:bg-slate-55/80 p-1 rounded transition-colors"
              onBlur={(e) => onUpdateLetterBody(e.target.innerHTML)}
              dangerouslySetInnerHTML={{ __html: data.coverLetter.body }}
            />
          </div>
        </div>

        <div>
          <div className="text-xs italic text-slate-600 mt-8 mb-1">Coordinated signature block</div>
          <div className="border-t pt-3 flex justify-between items-end" style={{ borderColor: primaryColor + "10" }}>
            <div className="space-y-4">
              <div className="text-xs font-semibold">{data.coverLetter.signoff.split("\n")[0]}</div>
              <div className="font-semibold text-sm" style={{ fontFamily: style.fonts.heading, color: primaryColor }}>
                {data.basics.name}
              </div>
            </div>
            {qrCodeData && (
              <div className="bg-white p-1 rounded-lg border border-slate-100 flex flex-col items-center shrink-0">
                <img src={qrCodeData} alt="QR Link" className="w-12 h-12" />
                <span className="text-[7px] text-slate-600 uppercase tracking-widest font-mono mt-0.5">Social QR</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Section Header Styles
  const renderSectionHeader = (labelKey: string) => {
    const textLabel = data.sectionLabels[labelKey] || labelKey;
    const variant = style.headerStyle;

    if (variant === "artistic") {
      return (
        <div className="mb-6 group/header">
          <div className="flex items-center justify-between pb-2 border-b-2 border-slate-900 dark:border-white">
            <h2 style={{ fontFamily: "Georgia, serif" }} className="font-extrabold text-xs uppercase tracking-[0.3em] text-slate-900 dark:text-white italic">
              {textLabel}
            </h2>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600" />
            </div>
          </div>
        </div>
      );
    }

    if (variant === "timeline-integrated") {
      return (
        <div className="flex items-center gap-4 mb-5 group/header">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-sm">
            <Layers className="w-5 h-5 text-sky-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-extrabold uppercase tracking-widest text-[11px] text-slate-900 dark:text-white" style={{ fontFamily: style.fonts.heading }}>
              {textLabel}
            </h2>
            <div className="h-[1px] w-full bg-gradient-to-r from-slate-200 via-slate-100 to-transparent dark:from-slate-800/60 dark:via-slate-900/40 mt-1" />
          </div>
        </div>
      );
    }

    if (variant === "accent-rule") {
      return (
        <div className="mb-5 group/header">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: secondaryColor }} />
            <h2 className="font-extrabold tracking-tight text-base text-slate-900 dark:text-white" style={{ fontFamily: style.fonts.heading }}>
              {textLabel}
            </h2>
          </div>
          <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800 mt-2" />
        </div>
      );
    }

    if (variant === "classic") {
      return (
        <div className="mb-6 text-center group/header">
          <div className="inline-block relative">
            <h2 className="font-black tracking-[0.25em] uppercase text-[11px] px-8 py-1.5 border-2 border-slate-900 dark:border-white rounded-lg text-slate-900 dark:text-white" style={{ fontFamily: style.fonts.heading }}>
              {textLabel}
            </h2>
            <div className="absolute -bottom-1 -right-1 w-full h-full border-2 border-sky-500/20 rounded-lg -z-10" />
          </div>
        </div>
      );
    }

    // Default: Minimalist minimalist
    return (
      <div className="mb-4 group/header">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="font-bold uppercase tracking-[0.2em] text-[10px] sm:text-[11px] flex items-center gap-2" style={{ fontFamily: style.fonts.heading, color: primaryColor }}>
            <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500" />
            {textLabel}
          </h2>
          <div className="flex-1 ml-4 h-[1px] bg-gradient-to-r from-slate-200/60 via-slate-100/30 to-transparent dark:from-slate-800/60 dark:via-slate-900/30" />
        </div>
      </div>
    );
  };

  // Helper renderers for dynamic sections content
  const renderBasicsHeader = () => {
    const b = data.basics;

    if (style.headerStyle === "artistic") {
      return (
        <header className="border-b border-zinc-900 dark:border-zinc-700 pb-6 mb-6">
          <h1
            contentEditable
            suppressContentEditableWarning
            style={{ fontFamily: "Georgia, serif" }}
            className="text-5xl font-black italic tracking-tighter leading-[0.85] focus:bg-zinc-100 dark:focus:bg-zinc-800 outline-none p-0.5 rounded cursor-pointer text-zinc-950 dark:text-white"
            onBlur={(e) => handleBlur("basics", "", "name", e.target.textContent || "")}
          >
            {b.name}
          </h1>
          <div className="mt-4 flex justify-between items-baseline flex-wrap gap-2 text-xs">
            <p
              contentEditable
              suppressContentEditableWarning
              className="font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-200 outline-none p-0.5"
              onBlur={(e) => handleBlur("basics", "", "title", e.target.textContent || "")}
            >
              {b.title}
            </p>
            <p className="text-[10.5px] opacity-75 font-mono text-zinc-600 dark:text-zinc-400">
              {b.email} {b.phone ? `| ${b.phone}` : ""}
            </p>
          </div>
        </header>
      );
    }

    return (
      <div className="space-y-3.5 mb-6">
        <div>
          <h1
            contentEditable
            suppressContentEditableWarning
            className={`${activeSizing.h1} font-bold tracking-tight inline-block focus:bg-slate-50 outline-none p-0.5 rounded cursor-pointer`}
            style={{ fontFamily: style.fonts.heading, color: primaryColor }}
            onBlur={(e) => handleBlur("basics", "", "name", e.target.textContent || "")}
          >
            {b.name}
          </h1>
          <div className="flex items-center gap-2">
            <span
              contentEditable
              suppressContentEditableWarning
              className="text-sm font-semibold tracking-wide block outline-none uppercase p-0.5 rounded cursor-pointer"
              style={{ color: secondaryColor }}
              onBlur={(e) => handleBlur("basics", "", "title", e.target.textContent || "")}
            >
              {b.title}
            </span>
          </div>
        </div>

        {/* Contact links strip */}
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 leading-relaxed py-3 border-t border-b border-slate-100 dark:border-slate-800/50">
          {b.email && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg group/email transition-all hover:border-sky-200 dark:hover:border-sky-900">
              {isDigital ? (
                <a
                  href={`mailto:${b.email}`}
                  title={`Email ${b.email}`}
                  className="text-sky-500 hover:text-sky-600 shrink-0"
                >
                  {renderIcon("mail")}
                </a>
              ) : (
                <span style={{ color: secondaryColor }}>{renderIcon("mail")}</span>
              )}
              <span
                contentEditable
                suppressContentEditableWarning
                className="outline-none"
                onBlur={(e) => handleBlur("basics", "", "email", e.target.textContent || "")}
              >
                {b.email}
              </span>
            </div>
          )}
          {b.phone && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg group/phone transition-all hover:border-sky-200 dark:hover:border-sky-900">
              {isDigital ? (
                <a
                  href={`tel:${b.phone}`}
                  title={`Call ${b.phone}`}
                  className="text-sky-500 hover:text-sky-600 shrink-0"
                >
                  {renderIcon("phone")}
                </a>
              ) : (
                <span style={{ color: secondaryColor }}>{renderIcon("phone")}</span>
              )}
              <span
                contentEditable
                suppressContentEditableWarning
                className="outline-none"
                onBlur={(e) => handleBlur("basics", "", "phone", e.target.textContent || "")}
              >
                {b.phone}
              </span>
            </div>
          )}
          {b.location && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg transition-all hover:border-sky-200 dark:hover:border-sky-900">
              <span style={{ color: secondaryColor }}>{renderIcon("location")}</span>
              <span
                contentEditable
                suppressContentEditableWarning
                className="outline-none"
                onBlur={(e) => handleBlur("basics", "", "location", e.target.textContent || "")}
              >
                {b.location}
              </span>
            </div>
          )}
          {b.website && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg group/web transition-all hover:border-sky-200 dark:hover:border-sky-900">
              {isDigital ? (
                <a
                  href={b.website.startsWith("http") ? b.website : `https://${b.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Go to ${b.website}`}
                  className="text-sky-500 hover:text-sky-600 shrink-0"
                >
                  {renderIcon("globe")}
                </a>
              ) : (
                <span style={{ color: secondaryColor }}>{renderIcon("globe")}</span>
              )}
              <span
                contentEditable
                suppressContentEditableWarning
                className="outline-none font-medium text-sky-700 dark:text-sky-400 hover:underline"
                onBlur={(e) => handleBlur("basics", "", "website", e.target.textContent || "")}
              >
                {b.website}
              </span>
            </div>
          )}
          {b.linkedin && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg group/linkedin transition-all hover:border-sky-200 dark:hover:border-sky-900">
              {isDigital ? (
                <a
                  href={b.linkedin.startsWith("http") ? b.linkedin : `https://linkedin.com/in/${b.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`LinkedIn: ${b.linkedin}`}
                  className="text-sky-500 hover:text-sky-600 shrink-0"
                >
                  {renderIcon("linkedin")}
                </a>
              ) : (
                <span style={{ color: secondaryColor }}>{renderIcon("linkedin")}</span>
              )}
              <span
                contentEditable
                suppressContentEditableWarning
                className="outline-none"
                onBlur={(e) => handleBlur("basics", "", "linkedin", e.target.textContent || "")}
              >
                {b.linkedin}
              </span>
            </div>
          )}
          {b.github && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg group/github transition-all hover:border-sky-200 dark:hover:border-sky-900">
              {isDigital ? (
                <a
                  href={b.github.startsWith("http") ? b.github : `https://github.com/${b.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`GitHub: ${b.github}`}
                  className="text-sky-500 hover:text-sky-600 shrink-0"
                >
                  {renderIcon("github")}
                </a>
              ) : (
                <span style={{ color: secondaryColor }}>{renderIcon("github")}</span>
              )}
              <span
                contentEditable
                suppressContentEditableWarning
                className="outline-none"
                onBlur={(e) => handleBlur("basics", "", "github", e.target.textContent || "")}
              >
                {b.github}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderWorkExperience = () => {
    if (!data.sectionVisibility.work) return null;
    const gridCols = data.sectionLayouts?.work?.gridColumns || 1;
    const gridClass = gridCols === 2 ? "grid-cols-2" : gridCols === 3 ? "grid-cols-3" : "grid-cols-1";
    return (
      <div key="work" className="space-y-4">
        {renderSectionHeader("work")}
        <div className={`grid ${gridClass} gap-4`}>
          {data.work.map((w) => (
            <div key={w.id} className={`relative group/w text-xs leading-relaxed ${digitalEntryClass} border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-white/40 dark:bg-slate-950/20`}>
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    className="font-extrabold text-slate-900 dark:text-white inline-block cursor-pointer focus:bg-slate-50 p-0.5 rounded text-[13px] tracking-tight"
                    onBlur={(e) => handleBlur("work", w.id, "position", e.target.textContent || "")}
                  >
                    {highlightText(w.position, matchedKeywords)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      className="font-bold text-sky-700 dark:text-sky-400 outline-none p-0.5 rounded cursor-pointer text-[11px] uppercase tracking-wider"
                      onBlur={(e) => handleBlur("work", w.id, "company", e.target.textContent || "")}
                    >
                      {w.company}
                    </span>
                    {w.location && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <span className="text-slate-500 text-[10px] font-bold">
                          {w.location}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-bold shrink-0 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                  <span>{w.startDate}</span>
                  <span className="mx-1 text-slate-300">—</span>
                  <span>{w.current ? "Present" : w.endDate}</span>
                </div>
              </div>

              {w.description && (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="text-slate-600 dark:text-slate-300 italic text-[11px] leading-relaxed mt-1 outline-none p-0.5"
                  onBlur={(e) => handleBlur("work", w.id, "description", e.target.textContent || "")}
                >
                  {highlightText(w.description, matchedKeywords)}
                </p>
              )}

              {w.highlights && w.highlights.length > 0 && (
                <ul className="mt-1.5 space-y-1 pl-1">
                  {w.highlights.map((bullet, bidx) => (
                    <li key={bidx} className="flex items-start">
                      {renderBulletMarker()}
                      <span className="text-slate-700 dark:text-slate-300 flex-1 leading-relaxed text-xs">
                        {highlightText(bullet, matchedKeywords)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (!data.sectionVisibility.education) return null;
    const gridCols = data.sectionLayouts?.education?.gridColumns || 1;
    const gridClass = gridCols === 2 ? "grid-cols-2" : gridCols === 3 ? "grid-cols-3" : "grid-cols-1";
    return (
      <div key="education" className="space-y-4">
        {renderSectionHeader("education")}
        <div className={`grid ${gridClass} gap-4`}>
          {data.education.map((e) => (
            <div key={e.id} className={`text-xs leading-relaxed ${digitalEntryClass} border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-white/40 dark:bg-slate-950/20`}>
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    className="font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer focus:bg-slate-50 p-0.5 rounded text-[13px] tracking-tight"
                    onBlur={(e) => handleBlur("education", e.id, "area", e.target.textContent || "")}
                  >
                    {highlightText(e.area, matchedKeywords)}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      className="font-bold text-indigo-600 dark:text-indigo-400 outline-none p-0.5 rounded cursor-pointer text-[11px] uppercase tracking-wider"
                      onBlur={(e) => handleBlur("education", e.id, "studyType", e.target.textContent || "")}
                    >
                      {highlightText(e.studyType, matchedKeywords)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-slate-500 font-bold uppercase text-[10px] tracking-widest outline-none p-0.5"
                      onBlur={(e) => handleBlur("education", e.id, "institution", e.target.textContent || "")}
                    >
                      {highlightText(e.institution, matchedKeywords)}
                    </div>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-bold shrink-0 uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">
                  <div>{e.startDate} — {e.endDate}</div>
                  {e.gpa && <div className="text-emerald-600 dark:text-emerald-400 mt-0.5">GPA: {e.gpa}</div>}
                </div>
              </div>

              {e.highlights && e.highlights.length > 0 && (
                <ul className="mt-1 space-y-0.5 pl-1">
                  {e.highlights.map((bullet, bidx) => (
                    <li key={bidx} className="flex items-start">
                      {renderBulletMarker()}
                      <span className="text-slate-600 dark:text-slate-300 flex-1 leading-normal text-xs">
                        {highlightText(bullet, matchedKeywords)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCertifications = () => {
    if (!data.sectionVisibility.certifications || data.certifications.length === 0) return null;
    const gridCols = data.sectionLayouts?.certifications?.gridColumns || 1;
    const gridClass = gridCols === 2 ? "grid-cols-2" : gridCols === 3 ? "grid-cols-3" : "grid-cols-1";
    return (
      <div key="certifications" className="space-y-3">
        {renderSectionHeader("certifications")}
        <div className={`grid ${gridClass} gap-3`}>
          {data.certifications.map((c) => {
            const inner = (
              <div className={`w-full px-3 py-2 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 transition-all duration-300 shadow-xs hover:border-sky-300 dark:hover:border-sky-900 ${digitalEntryClass}`}>
                <div className="w-8 h-8 rounded-lg bg-sky-100/50 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                  <BadgeCheck className="w-4 h-4 text-sky-500" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block tracking-tight line-clamp-1">{highlightText(c.name, matchedKeywords)}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{c.issuer}</span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">{c.date}</span>
                </div>
              </div>
            );
            return isDigital && c.url ? (
              <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" className="block cursor-pointer" title={`Verify Certification: ${c.name}`}>
                {inner}
              </a>
            ) : (
              <div key={c.id}>{inner}</div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSkills = () => {
    if (!data.sectionVisibility.skills || data.skills.length === 0) return null;
    return (
      <div key="skills" className="space-y-3">
        {renderSectionHeader("skills")}
        <div className="space-y-4 text-xs">
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s) => {
              if (s.style === "chip") {
                return (
                  <span
                    key={s.id}
                    className="px-3 py-1.5 bg-sky-50/50 dark:bg-slate-900 border border-sky-100/60 dark:border-slate-800 rounded-xl text-[11px] font-bold select-none shadow-xs flex items-center gap-1.5 hover:scale-[1.03] transition-all cursor-default"
                  >
                    <span className="w-1 h-1 rounded-full bg-sky-500" />
                    {highlightText(s.name, matchedKeywords)}
                    <span className="text-[9px] text-slate-400 font-medium">({s.level}%)</span>
                  </span>
                );
              }
              if (s.style === "progress") {
                return (
                  <div key={s.id} className={`w-full sm:w-[calc(50%-8px)] bg-slate-50/30 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 px-3 py-2 rounded-xl block shrink-0 leading-tight ${digitalEntryClass}`}>
                    <div className="flex justify-between items-center mb-1.5 font-bold text-slate-700 dark:text-slate-200">
                      <span>{highlightText(s.name, matchedKeywords)}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{s.level}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/50 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-sky-500 bg-[length:200%_100%] animate-gradient-x rounded-full" style={{ width: `${s.level}%` }} />
                    </div>
                  </div>
                );
              }
              // badge style
              return (
                <span
                  key={s.id}
                  className="px-3 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-bold rounded-lg select-none shadow-xs hover:border-sky-300 dark:hover:border-sky-800 transition-colors cursor-default"
                  style={{
                    color: primaryColor,
                  }}
                >
                  {highlightText(s.name, matchedKeywords)}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderLanguages = () => {
    if (!data.sectionVisibility.languages || data.languages.length === 0) return null;
    return (
      <div key="languages" className="space-y-3">
        {renderSectionHeader("languages")}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {data.languages.map((l) => (
            <div
              key={l.id}
              className={`px-3 py-2 bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-medium flex flex-col gap-1 transition-all hover:border-sky-200 dark:hover:border-sky-900 ${digitalEntryClass}`}
            >
              <span className="font-bold text-slate-800 dark:text-white">{l.name}</span>
              <span className="text-[10px] text-sky-700 dark:text-sky-400 font-bold uppercase tracking-wider">{l.fluency}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCustomSection = (sec: any) => {
    return (
      <div key={sec.id} className="space-y-3 pt-1">
        {renderSectionHeader(sec.id)}
        <div className={`grid ${data.sectionLayouts?.[sec.id]?.gridColumns === 2 ? "grid-cols-2" : data.sectionLayouts?.[sec.id]?.gridColumns === 3 ? "grid-cols-3" : "grid-cols-1"} gap-4`}>
          {sec.items.map((item: any) => (
            <div key={item.id} className={`text-xs leading-relaxed border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-white/40 dark:bg-slate-950/20 ${digitalEntryClass}`}>
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    className="font-extrabold text-slate-900 dark:text-white outline-none cursor-pointer focus:bg-slate-50 p-0.5 rounded text-[13px] tracking-tight"
                    onBlur={(e) => onUpdateCustomSectionItem(sec.id, item.id, "title", e.target.textContent || "")}
                  >
                    {highlightText(item.title, matchedKeywords)}
                  </h3>
                  {item.subtitle && (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      className="text-indigo-600 dark:text-indigo-400 font-bold outline-none text-[10px] uppercase tracking-widest cursor-pointer"
                      onBlur={(e) => onUpdateCustomSectionItem(sec.id, item.id, "subtitle", e.target.textContent || "")}
                    >
                      {highlightText(item.subtitle, matchedKeywords)}
                    </div>
                  )}
                </div>
                {item.date && (
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800 shrink-0">
                    {item.date}
                  </span>
                )}
              </div>
              {item.summary && (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  className="text-slate-600 dark:text-slate-300 text-[11px] mt-2 leading-relaxed outline-none focus:bg-slate-50 rounded"
                  onBlur={(e) => onUpdateCustomSectionItem(sec.id, item.id, "summary", e.target.textContent || "")}
                >
                  {highlightText(item.summary, matchedKeywords)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = data.sectionOrder.indexOf(active.id);
      const newIndex = data.sectionOrder.indexOf(over.id);
      onUpdateSectionOrder(arrayMove(data.sectionOrder, oldIndex, newIndex));
    }
  };

  // Helper renderer for sortable items
  const SortableSection = ({ id, children }: { id: string; children: React.ReactNode } & any) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, cursor: 'grab' };
    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {children}
      </div>
    );
  };

  const renderResumePage = () => {
    const sectionNodes: { id: string; node: React.ReactNode }[] = [];

    // Parse according to user sorting
    data.sectionOrder.forEach((sectionKey) => {
      let node: React.ReactNode | null = null;
      if (sectionKey === "work") node = renderWorkExperience();
      else if (sectionKey === "education") node = renderEducation();
      else if (sectionKey === "skills") node = renderSkills();
      else if (sectionKey === "languages") node = renderLanguages();
      else if (sectionKey === "certifications") node = renderCertifications();
      else if (sectionKey.startsWith("custom_")) {
        const secId = sectionKey.replace("custom_", "");
        const sec = data.customSections.find(s => s.id === secId);
        if (sec && data.sectionVisibility[sec.id] !== false) node = renderCustomSection(sec);
      }
      else if (sectionKey === "awards" && data.sectionVisibility.awards) {
        node = (
          <div key="awards" className="space-y-2">
            {renderSectionHeader("awards")}
            <div className="space-y-2.5">
              {data.awards.map((a) => (
                <div key={a.id} className={`text-xs ${digitalEntryClass} border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-white/40 dark:bg-slate-950/20`}>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="font-extrabold text-slate-900 dark:text-white block tracking-tight">{highlightText(a.title, matchedKeywords)}</span>
                      <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{highlightText(a.awarder, matchedKeywords)}</div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800">{a.date}</span>
                  </div>
                  {a.summary && <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{highlightText(a.summary, matchedKeywords)}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      } else if (sectionKey === "publications" && data.sectionVisibility.publications) {
        node = (
          <div key="publications" className="space-y-2">
            {renderSectionHeader("publications")}
            <div className="space-y-2.5">
              {data.publications.map((p) => (
                <div key={p.id} className={`text-xs leading-tight ${digitalEntryClass} border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-white/40 dark:bg-slate-950/20`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="font-extrabold text-slate-900 dark:text-white block tracking-tight">{highlightText(p.name, matchedKeywords)}</span>
                      <div className="text-[10px] font-bold text-sky-700 dark:text-sky-400 uppercase tracking-widest">{highlightText(p.publisher, matchedKeywords)}</div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800 shrink-0">{p.releaseDate}</span>
                  </div>
                  {p.summary && <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{highlightText(p.summary, matchedKeywords)}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      } else if (sectionKey === "volunteer" && data.sectionVisibility.volunteer) {
        node = (
          <div key="volunteer" className="space-y-2">
            {renderSectionHeader("volunteer")}
            <div className="space-y-3">
              {data.volunteer.map((v) => (
                <div key={v.id} className={`text-xs ${digitalEntryClass} border border-slate-100 dark:border-slate-800 p-3 rounded-lg bg-white/40 dark:bg-slate-950/20`}>
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <span className="font-extrabold text-slate-900 dark:text-white block tracking-tight">{highlightText(v.position, matchedKeywords)}</span>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{highlightText(v.organization, matchedKeywords)}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-800 shrink-0">
                      {v.startDate} — {v.current ? "Present" : v.endDate}
                    </span>
                  </div>
                  {v.summary && <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 leading-relaxed italic border-l-2 border-slate-100 dark:border-slate-800 pl-3">{highlightText(v.summary, matchedKeywords)}</p>}
                </div>
              ))}
            </div>
          </div>
        );
      } else if (sectionKey === "references" && data.sectionVisibility.references) {
        node = (
          <div key="references" className="space-y-2">
            {renderSectionHeader("references")}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.references.map((r) => (
                <div key={r.id} className={`text-xs p-4 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 ${digitalEntryClass} flex items-start gap-3`}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm font-bold text-slate-400">
                    {r.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <span className="font-extrabold text-slate-900 dark:text-white block tracking-tight">{highlightText(r.name, matchedKeywords)}</span>
                    <span className="text-[10px] text-sky-700 dark:text-sky-400 block font-bold uppercase tracking-widest">{highlightText(r.relationship, matchedKeywords)} @ {highlightText(r.company, matchedKeywords)}</span>
                    <div className="flex flex-col gap-0.5 mt-2">
                      {r.email && <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5"><Mail className="w-2.5 h-2.5 opacity-50" /> {r.email}</div>}
                      {r.phone && <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5"><Phone className="w-2.5 h-2.5 opacity-50" /> {r.phone}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      if (node) sectionNodes.push({ id: sectionKey, node });
    });

    // Handle missing sections
    data.customSections.forEach(sec => {
        if (!data.sectionOrder.includes("custom_" + sec.id)) {
            if (data.sectionVisibility[sec.id] !== false) {
                const node = renderCustomSection(sec);
                if (node) sectionNodes.push({ id: "custom_" + sec.id, node });
            }
        }
    });

    const sortableContent = (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sectionNodes.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {sectionNodes.map(({ id, node }) => (
            <SortableSection key={id} id={id}>
              {node}
            </SortableSection>
          ))}
        </SortableContext>
      </DndContext>
    );

    // 1. Sidemenu/Sidebar asymmetric structure
    if (style.template === "modern-sidebar") {
      const sidebarKeys = data.sectionOrder.filter(k => {
        const layout = data.sectionLayouts?.[k];
        if (layout?.useSidebar === true) return true;
        if (layout?.useSidebar === false) return false;
        // Defaults for this template
        return ["skills", "languages", "certifications", "references"].includes(k);
      });
      const mainKeys = data.sectionOrder.filter(k => !sidebarKeys.includes(k));

      return (
        <div className="flex flex-col md:flex-row h-full min-h-[1050px] bg-white dark:bg-slate-950 overflow-hidden shadow-2xl rounded-3xl border border-slate-200 dark:border-slate-800">
          <aside className="w-[32%] bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col gap-6 shrink-0">
            {data.basics.showPhoto && data.basics.photoUrl && (
              <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-md bg-white border border-slate-200 mb-2">
                <img src={data.basics.photoUrl} alt={data.basics.name} className="w-full h-full object-cover" />
              </div>
            )}
            {renderBasicsHeader()}
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sidebarKeys} strategy={verticalListSortingStrategy}>
                <div className="space-y-6 min-h-[100px]">
                  {sidebarKeys.map(k => {
                    const sNode = sectionNodes.find(s => s.id === k);
                    return sNode ? <SortableSection key={k} id={k}>{sNode.node}</SortableSection> : null;
                  })}
                </div>
              </SortableContext>
            </DndContext>

            {qrCodeData && (
              <div className="bg-white/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800 p-3 rounded-2xl flex items-center gap-3 mt-auto">
                <img src={qrCodeData} alt="QR Link" className="w-12 h-12" />
                <div className="leading-tight">
                  <div className="text-[10px] font-black uppercase text-slate-900 dark:text-white">Live Node</div>
                  <div className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Interactive Scan</div>
                </div>
              </div>
            )}
          </aside>
          
          <main className="flex-1 p-10">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={mainKeys} strategy={verticalListSortingStrategy}>
                <div className="space-y-8 min-h-[400px]">
                  {mainKeys.map(k => {
                    const sNode = sectionNodes.find(s => s.id === k);
                    return sNode ? <SortableSection key={k} id={k}>{sNode.node}</SortableSection> : null;
                  })}
                </div>
              </SortableContext>
            </DndContext>
          </main>
        </div>
      );
    }
    
    if (style.template === "bento-grid") {
      return (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-[18px] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-2xl">
            <div className="flex gap-4 items-center">
              {data.basics.showPhoto && data.basics.photoUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shadow-sm shrink-0">
                  <img src={data.basics.photoUrl} alt={data.basics.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: style.fonts.heading, color: primaryColor }}>
                  {data.basics.name}
                </h2>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">{data.basics.title}</span>
              </div>
            </div>
          </div>
          {sortableContent}
        </div>
      );
    }
    
    if (style.template === "creative-pro") {
      return (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex gap-[18px] items-center">
              {data.basics.showPhoto && data.basics.photoUrl && (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo-400 shrink-0 shadow-lg">
                  <img src={data.basics.photoUrl} alt={data.basics.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="space-y-1 text-center md:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: style.fonts.heading }}>
                  {data.basics.name}
                </h1>
                <p className="text-xs uppercase tracking-widest font-bold text-indigo-300">{data.basics.title}</p>
                <div className="flex flex-wrap gap-x-3 text-[10.5px] text-slate-300 pt-1 justify-center md:justify-start opacity-80">
                  <span>{data.basics.email}</span>
                  <span>•</span>
                  <span>{data.basics.phone}</span>
                  <span>•</span>
                  <span>{data.basics.location}</span>
                </div>
              </div>
            </div>

            {qrCodeData && (
              <div className="bg-white/10 backdrop-blur p-1 rounded-xl shrink-0 flex flex-col items-center">
                <img src={qrCodeData} alt="Creative QR" className="w-14 h-14 invert text-indigo-200" />
                <span className="text-[8px] font-bold uppercase tracking-wider text-indigo-200 mt-1">Visit Work</span>
              </div>
            )}
          </div>
          {sortableContent}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {/* These are now implicitly included in sortableContent, but we kept it this way to preserve structure */}
            </div>
            <div className="space-y-5">
            </div>
          </div>
        </div>
      );
    }
    
    // Default / All other layouts
    return (
      <div className="space-y-6">
        {renderBasicsHeader()}
        {sortableContent}
      </div>
    );
  };



  const baseScale = zoom ? zoom / 100 : 1;
  const isMobileSimulated = viewMode === "mobile";
  const finalScale = isMobile ? 1 : (isMobileSimulated ? baseScale * 0.52 : baseScale);

  return (
    <div
      className={`relative w-full overflow-x-auto p-2 md:p-8 flex flex-col items-center gap-8`}
    >
      {/* Dynamic zoom or fit scaling applied via inline CSS */}
      <div
        id="resume-print-preview-canvas"
        className={`print-page bg-white relative transition-shadow duration-300 rounded-2xl text-zinc-900 ${
          isPrint ? "shadow-none border border-slate-300 w-full" : "shadow-xl border border-zinc-200 dark:border-zinc-800"
        } ${
          isMobile ? "w-full max-w-full min-h-0 h-auto" : `w-[794px] max-w-none ${pageRatio}`
        } ${activeSizing.pad} ${className}`}
        style={{
          fontFamily: style.fonts.body,
          color: textColor,
          backgroundColor: paperBgColor,
          padding: isMobile ? "20px" : `${style.padding}px`,
          transform: (!isMobile && finalScale !== 1) ? `scale(${finalScale})` : "none",
          transformOrigin: "top center"
        }}
      >
        {/* PAGE 01 Marker - Artistic Flair */}
        {!isPrint && (
          <div className="absolute top-0 right-0 p-2 text-[8px] bg-zinc-100/90 dark:bg-zinc-800 text-zinc-400 font-mono select-none uppercase tracking-[0.1em] pointer-events-none rounded-bl z-10 border-l border-b border-zinc-200/40">
            PAGE 01
          </div>
        )}

        {/* Subtle margins overlay guidelines for the artistic workspace look */}
        {!isPrint && (
          <div className="absolute inset-0 flex pointer-events-none opacity-25 z-0">
            <div className="w-12 border-r border-dashed border-zinc-400 h-full"></div>
            <div className="flex-1 h-full"></div>
            <div className="w-12 border-l border-dashed border-zinc-400 h-full"></div>
          </div>
        )}

        {/* Relative content layer above grids */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          {renderResumePage()}
        </div>

        {/* Visual Page break indicator at standard ratio height margin bounds on Desktop screen view */}
        {viewMode === "desktop" && (
          <div className="page-break-line my-8 pointer-events-none no-print border-t border-dashed" />
        )}
      </div>

      {/* Render optional Cover Letter Page if enabled */}
      {data.coverLetter.enabled && renderCoverLetter()}
    </div>
  );
}
