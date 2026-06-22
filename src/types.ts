/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  linkedin: string;
  github: string;
  twitter: string;
  photoUrl: string;
  showPhoto: boolean;
}

export interface WorkEntry {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
  description: string;
}

export interface EducationEntry {
  id: string;
  institution: string;
  area: string;
  studyType: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  highlights: string[];
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url: string;
}

export interface AwardEntry {
  id: string;
  title: string;
  awarder: string;
  date: string;
  summary: string;
}

export interface PublicationEntry {
  id: string;
  name: string;
  publisher: string;
  releaseDate: string;
  url: string;
  summary: string;
}

export interface VolunteerEntry {
  id: string;
  organization: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  summary: string;
  highlights: string[];
}

export interface ReferenceEntry {
  id: string;
  name: string;
  relationship: string;
  company: string;
  email: string;
  phone: string;
}

export interface SkillItem {
  id: string;
  name: string;
  level: number; // 0 - 100
  style: "chip" | "badge" | "progress";
}

export interface LanguageItem {
  id: string;
  name: string;
  fluency: string; // e.g. "Native", "Fluent", "Conversational"
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  summary: string;
  highlights: string[];
}

export interface CustomSection {
  id: string;
  label: string;
  items: CustomSectionItem[];
}

export interface CoverLetterData {
  enabled: boolean;
  addresseeName: string;
  addresseeTitle: string;
  companyName: string;
  companyAddress: string;
  date: string;
  subject: string;
  salutation: string;
  body: string;
  signoff: string;
}

export interface ResumeStyle {
  template: "modern-sidebar" | "classic-minimal" | "bento-grid" | "creative-pro" | "simple-centered" | "bold-header";
  headerStyle: "minimalist" | "timeline-integrated" | "accent-rule" | "classic" | "artistic";
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    bg: string;
    paperBg: string;
  };
  fonts: {
    heading: string;
    body: string;
    mono: string;
  };
  sizePreset: "compact" | "normal" | "large";
  lineSpacing: "compact" | "normal" | "spacious";
  pageSize: "A4" | "Letter";
  padding: number; // 12px to 48px base
  letterSpacing: "tighter" | "tight" | "normal" | "wide";
  paragraphMargin: number; // multiplier scale 0.5 to 2.0
  hyphenation: boolean;
  bulletStyle: "dash" | "diamond" | "chevron" | "svg" | "square" | "square-solid";
  customCss: string;
  digitalMode: boolean; // enables interactive badges, link-clicks, hover effects
  grayscaleMode: boolean; // forces black and white printable evaluation
  themeId: string;
  fontPairingId: string;
}

export interface ResumeData {
  id: string;
  versionName: string;
  lastUpdated: string;
  basics: ContactInfo;
  work: WorkEntry[];
  education: EducationEntry[];
  certifications: CertificationEntry[];
  awards: AwardEntry[];
  publications: PublicationEntry[];
  volunteer: VolunteerEntry[];
  references: ReferenceEntry[];
  skills: SkillItem[];
  languages: LanguageItem[];
  customSections: CustomSection[];
  coverLetter: CoverLetterData;
  style: ResumeStyle;
  sectionLabels: Record<string, string>; // user overrides, e.g. { work: "Professional Projects" }
  sectionVisibility: Record<string, boolean>; // e.g., { certifications: true, coverLetter: false }
  sectionOrder: string[]; // e.g. ["basics", "work", "education", "skills", ...]
  sectionLayouts: Record<string, { gridColumns: 1 | 2 | 3; useSidebar?: boolean }>; // e.g. { work: { gridColumns: 2, useSidebar: true } }
}

export interface HistoryVersion {
  id: string;
  versionName: string;
  timestamp: string;
  data: Omit<ResumeData, "id" | "versionName">;
}
