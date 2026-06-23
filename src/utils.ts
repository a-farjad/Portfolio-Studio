/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResumeData, HistoryVersion, WorkEntry } from "./types";

export const ACTION_VERBS = {
  "Leadership & Direction": [
    "Spearheaded", "Orchestrated", "Directed", "Chaired", "Governed", "Guided", "Fostered", "Championed", "Steered", "Commanded"
  ],
  "Innovation & Design": [
    "Formulated", "Engineered", "Devised", "Pioneered", "Conceptualized", "Architected", "Launched", "Created", "Iterated", "Designed"
  ],
  "Execution & Delivery": [
    "Executed", "Deployed", "Implemented", "Slashed", "Optimized", "Consolidated", "Accelerated", "Surpassed", "Maximized", "Streamlined"
  ],
  "Strategy & Analysis": [
    "Analyzed", "Audited", "Diagnosed", "Forecasted", "Evaluated", "Validated", "Deconstructed", "Synthesized", "Investigated", "Mapped"
  ],
  "Relations & Growth": [
    "Advised", "Collaborated", "Negotiated", "Advocated", "Facilitated", "Cultivated", "Secured", "Mentored", "Amplified", "Expanded"
  ]
};

export const COLOR_PRESETS = [
  {
    id: "artistic-editorial",
    name: "Artistic Editorial",
    colors: {
      primary: "#18181b", // zinc-900
      secondary: "#000000",
      accent: "#a1a1aa", // zinc-400
      text: "#18181b",
      bg: "#f4f4f5", // zinc-100
      paperBg: "#ffffff"
    }
  },
  {
    id: "cosmic-slate",
    name: "Cosmic Slate",
    colors: {
      primary: "#1e293b", // Slate 800
      secondary: "#0369a1", // Sky 700
      accent: "#f59e0b", // Amber 500
      text: "#0f172a", // Slate 900
      bg: "#f1f5f9", // Slate 100
      paperBg: "#ffffff"
    }
  },
  {
    id: "emerald-forest",
    name: "Emerald Forest",
    colors: {
      primary: "#064e3b", // Emerald 900
      secondary: "#115e59", // Teal 800
      accent: "#10b981", // Emerald 500
      text: "#0f172a",
      bg: "#ecfdf5", // Emerald 500 light
      paperBg: "#ffffff"
    }
  },
  {
    id: "royal-navy",
    name: "Royal Navy",
    colors: {
      primary: "#1e3a8a", // Navy 900
      secondary: "#1d4ed8", // Blue 700
      accent: "#ec4899", // Pink 500
      text: "#1e293b",
      bg: "#eff6ff",
      paperBg: "#ffffff"
    }
  },
  {
    id: "creative-crimson",
    name: "Creative Crimson",
    colors: {
      primary: "#7f1d1d", // Crimson 900
      secondary: "#b91c1c", // Red 700
      accent: "#f59e0b", // Amber 500
      text: "#1c1917",
      bg: "#fff5f5",
      paperBg: "#ffffff"
    }
  },
  {
    id: "amber-sunset",
    name: "Amber Sunset",
    colors: {
      primary: "#1b1918", // Charcoal
      secondary: "#b45309", // Amber 700
      accent: "#4f46e5", // Indigo 600
      text: "#292524",
      bg: "#fef3c7",
      paperBg: "#ffffff"
    }
  },
  {
    id: "monochrome",
    name: "Monochrome",
    colors: {
      primary: "#171717", // Neutral 900
      secondary: "#404040", // Neutral 700
      accent: "#171717",
      text: "#262626",
      bg: "#f5f5f5",
      paperBg: "#ffffff"
    }
  }
];

export const FONT_PAIRINGS = [
  {
    id: "artistic-editorial",
    name: "Artistic Editorial (Georgia + Inter)",
    fonts: {
      heading: "Georgia",
      body: "Inter",
      mono: "Courier Prime"
    }
  },
  {
    id: "silicon-valley",
    name: "The Tech Founder (Space Grotesk + Inter)",
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      mono: "JetBrains Mono"
    }
  },
  {
    id: "editorial-board",
    name: "The Editorialist (Playfair Display + Georgia)",
    fonts: {
      heading: "Playfair Display",
      body: "Georgia",
      mono: "Courier Prime"
    }
  },
  {
    id: "modern-minimalist",
    name: "The Architect (Outfit + Inter)",
    fonts: {
      heading: "Outfit",
      body: "Inter",
      mono: "Fira Code"
    }
  },
  {
    id: "scholarly-distinction",
    name: "The Classical Academic (Lora + Garamond)",
    fonts: {
      heading: "Lora",
      body: "Garamond",
      mono: "Source Code Pro"
    }
  },
  {
    id: "bold-developer",
    name: "The Creative Coder (JetBrains Mono + Inter)",
    fonts: {
      heading: "JetBrains Mono",
      body: "Inter",
      mono: "JetBrains Mono"
    }
  },
  {
    id: "vintage-press",
    name: "The Literary Press (Merriweather + PT Serif)",
    fonts: {
      heading: "Merriweather",
      body: "PT Serif",
      mono: "Courier Prime"
    }
  }
];

export const GOOGLE_FONTS_IMPORTS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300&family=JetBrains+Mono:wght@400;500;600&family=Fira+Code:wght@400;500&family=Source+Code+Pro:wght@400;500&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=EB+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@400;500;600;700&family=PT+Serif:ital,wght@0,400;0,700;1,400&family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
`;

export const HEADING_FONTS = [
  "Georgia", "Space Grotesk", "Outfit", "Playfair Display", "Lora", "Merriweather", "Inter", "Montserrat", "JetBrains Mono", "EB Garamond"
];

export const BODY_FONTS = [
  "Inter", "Georgia", "Garamond", "PT Serif", "Roboto", "Open Sans", "EB Garamond"
];

export const MONO_FONTS = [
  "JetBrains Mono", "Fira Code", "Source Code Pro", "Courier Prime"
];

export const DEFAULT_RESUME_DATA: ResumeData = {
  id: "template-1",
  versionName: "Master Version",
  lastUpdated: new Date().toISOString(),
  basics: {
    name: "Full Name",
    title: "Senior Professional Title",
    email: "",
    phone: "",
    website: "",
    location: "City, State",
    linkedin: "",
    github: "",
    twitter: "",
    photoUrl: "",
    showPhoto: false
  },
  work: [],
  education: [],
  certifications: [],
  awards: [],
  publications: [],
  volunteer: [],
  references: [],
  skills: [],
  languages: [],
  customSections: [],
  coverLetter: {
    enabled: false,
    addresseeName: "",
    addresseeTitle: "",
    companyName: "",
    companyAddress: "",
    date: new Date().toISOString().split("T")[0],
    subject: "",
    salutation: "",
    body: "",
    signoff: ""
  },
  style: {
    template: "modern-sidebar",
    headerStyle: "timeline-integrated",
    colors: {
      primary: "#1e293b",
      secondary: "#0369a1",
      accent: "#f59e0b",
      text: "#0f172a",
      bg: "#f1f5f9",
      paperBg: "#ffffff"
    },
    fonts: {
      heading: "Space Grotesk",
      body: "Inter",
      mono: "JetBrains Mono"
    },
    sizePreset: "normal",
    lineSpacing: "normal",
    pageSize: "A4",
    padding: 32,
    letterSpacing: "normal",
    paragraphMargin: 1.0,
    hyphenation: true,
    bulletStyle: "diamond",
    customCss: "",
    digitalMode: true,
    grayscaleMode: false,
    themeId: "cosmic-slate",
    fontPairingId: "silicon-valley"
  },
  sectionLabels: {
    work: "Professional Experience",
    education: "Academic Background",
    certifications: "Accreditation & Credentials",
    skills: "Core Competencies",
    languages: "Languages",
    awards: "Acclaim & Recognition",
    publications: "Publications & Patents",
    volunteer: "Community Engagement",
    references: "Professional References"
  },
  sectionVisibility: {
    basics: true,
    work: true,
    education: true,
    certifications: false,
    awards: false,
    publications: false,
    volunteer: false,
    references: false,
    skills: true,
    languages: false,
    customSection1: false
  },
  sectionOrder: [
    "work",
    "education",
    "skills",
    "certifications",
    "awards",
    "publications",
    "volunteer",
    "references"
  ],
  sectionLayouts: {}
};

/**
 * Validates entries and identifies chronological gaps bigger than 3 months
 */
export function detectChronologicalGaps(work: WorkEntry[]): Array<{
  gapMonths: number;
  afterCompany: string;
  beforeCompany: string;
  fromDate: string;
  toDate: string;
}> {
  if (work.length < 2) return [];

  // Parse strings "YYYY-MM" to Date
  const entries = work
    .map(entry => {
      const start = new Date(entry.startDate + "-02");
      const end = entry.current
        ? new Date()
        : entry.endDate
        ? new Date(entry.endDate + "-02")
        : new Date();
      return {
        company: entry.company,
        start,
        end,
        startStr: entry.startDate,
        endStr: entry.current ? "Present" : entry.endDate
      };
    })
    .sort((a, b) => b.start.getTime() - a.start.getTime()); // Newer first

  const gaps = [];

  for (let i = 0; i < entries.length - 1; i++) {
    const nextJob = entries[i]; // Newer
    const prevJob = entries[i + 1]; // Older

    // Gap between prevJob.end and nextJob.start
    if (nextJob.start.getTime() > prevJob.end.getTime()) {
      const diffTime = Math.abs(nextJob.start.getTime() - prevJob.end.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const diffMonths = Math.floor(diffDays / 30);

      if (diffMonths >= 3) {
        gaps.push({
          gapMonths: diffMonths,
          afterCompany: prevJob.company,
          beforeCompany: nextJob.company,
          fromDate: prevJob.endStr,
          toDate: nextJob.startStr
        });
      }
    }
  }

  return gaps;
}

/**
 * Maps our custom Schema structure to standard JSONResume Schema format
 */
export function exportToJSONResume(data: ResumeData): Record<string, any> {
  const r = data.basics;
  return {
    basics: {
      name: r.name,
      label: r.title,
      email: r.email,
      phone: r.phone,
      url: r.website,
      location: {
        address: r.location
      },
      profiles: [
        { network: "LinkedIn", url: r.linkedin },
        { network: "GitHub", url: r.github },
        { network: "Twitter", url: r.twitter }
      ]
    },
    work: data.work.map(w => ({
      name: w.company,
      position: w.position,
      location: w.location,
      startDate: w.startDate,
      endDate: w.current ? "" : w.endDate,
      summary: w.description,
      highlights: w.highlights
    })),
    education: data.education.map(e => ({
      institution: e.institution,
      studyType: e.studyType,
      area: e.area,
      gpa: e.gpa,
      startDate: e.startDate,
      endDate: e.endDate,
      courses: e.highlights
    })),
    awards: data.awards.map(a => ({
      title: a.title,
      awarder: a.awarder,
      date: a.date,
      summary: a.summary
    })),
    publications: data.publications.map(p => ({
      name: p.name,
      publisher: p.publisher,
      releaseDate: p.releaseDate,
      url: p.url,
      summary: p.summary
    })),
    volunteer: data.volunteer.map(v => ({
      organization: v.organization,
      position: v.position,
      startDate: v.startDate,
      endDate: v.current ? "" : v.endDate,
      summary: v.summary,
      highlights: v.highlights
    })),
    skills: data.skills.map(s => ({
      name: s.name,
      level: s.level.toString(),
      keywords: [s.style]
    })),
    languages: data.languages.map(l => ({
      language: l.name,
      fluency: l.fluency
    }))
  };
}

/**
 * Imports from JSONResume standard schema
 */
export function importFromJSONResume(jsonResume: any): Partial<ResumeData> {
  try {
    const b = jsonResume.basics || {};
    const profiles = b.profiles || [];
    const linkedin = profiles.find((p: any) => p.network?.toLowerCase() === "linkedin")?.url || "";
    const github = profiles.find((p: any) => p.network?.toLowerCase() === "github")?.url || "";
    const twitter = profiles.find((p: any) => p.network?.toLowerCase() === "twitter")?.url || "";

    const basics = {
      name: b.name || "Imported Name",
      title: b.label || "Imported Title",
      email: b.email || "",
      phone: b.phone || "",
      website: b.url || "",
      location: b.location?.address || b.location?.city || "",
      linkedin: linkedin,
      github: github,
      twitter: twitter,
      photoUrl: b.image || "",
      showPhoto: !!b.image
    };

    const work = Array.isArray(jsonResume.work)
      ? jsonResume.work.map((w: any, idx: number) => ({
          id: `w-imp-${idx}`,
          company: w.name || w.company || "",
          position: w.position || "",
          location: w.location || "",
          startDate: w.startDate || "",
          endDate: w.endDate || "",
          current: !w.endDate,
          highlights: Array.isArray(w.highlights) ? w.highlights : [],
          description: w.summary || ""
        }))
      : [];

    const education = Array.isArray(jsonResume.education)
      ? jsonResume.education.map((e: any, idx: number) => ({
          id: `e-imp-${idx}`,
          institution: e.institution || "",
          area: e.area || "",
          studyType: e.studyType || "",
          location: e.location || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          gpa: e.gpa || "",
          highlights: Array.isArray(e.courses) ? e.courses : []
        }))
      : [];

    return {
      basics,
      work,
      education
    };
  } catch (error) {
    console.error("JSONResume parser issue", error);
    return {};
  }
}
