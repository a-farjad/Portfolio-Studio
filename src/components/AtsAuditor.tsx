import React, { useState, useRef, useCallback } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import {
  Sparkles, AlertTriangle, Upload,
  Download, RefreshCw, ChevronDown
} from "lucide-react";

GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@6.0.227/build/pdf.worker.min.mjs`;

interface AtsAuditorProps {
  resumeText?: string;
}

/* ── Data types ──────────────────────────────────── */

interface SkillsCategory {
  name: string;
  skills: string[];
}

interface SkillsResult {
  categories: SkillsCategory[];
  totalCount: number;
  hardSkillPct: number;
  quantifiedCount: number;
  quantifiedExamples: string[];
}

interface RewriteItem {
  before: string;
  after: string;
  reason: string;
}

interface MappingItem {
  resumeSkill: string;
  standardTerm: string;
  status: string;
  priority: string;
}

interface HardSoftItem {
  skill: string;
  type: string;
  verdict: string;
  strength: string;
}

interface VerbItem {
  weak: string;
  strong: string;
  context: string;
}

interface GapItem {
  label: string;
  note: string;
  severity: string;
}

interface RewriteResult {
  summary: string;
  skillsSection: string;
  certificationsSection: string;
  changeLog: string[];
}

interface AuditResults {
  skills: SkillsResult;
  keywords: { rewrites: RewriteItem[] };
  anzsco: { mappings: MappingItem[] };
  hardSoft: { skills: HardSoftItem[] };
  verbs: { improvements: VerbItem[] };
  gaps: { gaps: GapItem[] };
  rewrite: RewriteResult;
}

/* ── Skill keyword lists ─────────────────────────── */

const SKILLS_DB: Record<string, string[]> = {
  "Programming Languages": [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "C", "Go", "Rust", "Swift",
    "Kotlin", "Ruby", "PHP", "Scala", "Perl", "R", "MATLAB", "Dart", "Lua", "Haskell", "Elixir",
    "Clojure", "Groovy", "Shell", "Bash", "PowerShell", "SQL", "PL/SQL", "GraphQL",
  ],
  "Frontend": [
    "React", "Angular", "Vue", "Svelte", "Next.js", "Nuxt", "HTML", "CSS", "Sass", "SCSS",
    "Less", "Tailwind", "Bootstrap", "Material UI", "Chakra UI", "Shadcn UI", "Storybook",
    "Redux", "Zustand", "Recoil", "MobX", "Webpack", "Vite", "Rollup", "esbuild",
    "jQuery", "D3.js", "Three.js", "Framer Motion", "GSAP",
  ],
  "Backend & API": [
    "Node.js", "Express", "NestJS", "Fastify", "Django", "Flask", "FastAPI", "Spring Boot",
    "ASP.NET", "Laravel", "Ruby on Rails", "Phoenix", "Actix", "Axum", "Rocket",
    "REST API", "RESTful", "WebSocket", "gRPC", "Apollo", "GraphQL API",
    "Swagger", "OpenAPI", "Postman", "Insomnia",
  ],
  "Databases": [
    "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Elasticsearch", "DynamoDB",
    "Cassandra", "MariaDB", "CouchDB", "Firebase", "Supabase", "Neo4j", "InfluxDB",
    "ClickHouse", "Snowflake", "BigQuery", "Redshift", "Prisma", "TypeORM", "Drizzle",
    "Sequelize", "Mongoose", "Knex",
  ],
  "DevOps & Cloud": [
    "Docker", "Kubernetes", "Terraform", "Ansible", "Pulumi", "AWS", "Azure", "GCP",
    "CI/CD", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "ArgoCD",
    "Nginx", "Apache", "Traefik", "Istio", "Prometheus", "Grafana", "Datadog",
    "New Relic", "Sentry", "ELK Stack", "Lambda", "S3", "ECS", "Fargate", "EC2",
    "CloudFormation", "CDK", "Serverless", "Vercel", "Netlify", "Cloudflare",
  ],
  "Version Control": [
    "Git", "GitHub", "GitLab", "Bitbucket", "SVN", "Mercurial",
  ],
  "Testing": [
    "Jest", "Cypress", "Playwright", "Vitest", "Mocha", "Chai", "Jasmine", "Karma",
    "Pytest", "Selenium", "Cucumber", "Testing Library", "MSW", "Supertest",
  ],
  "Mobile": [
    "React Native", "Flutter", "Dart", "Android", "iOS", "SwiftUI", "UIKit",
    "Xamarin", "Capacitor", "Expo", "Kotlin Multiplatform",
  ],
  "Data & ML": [
    "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "Keras", "Scikit-learn",
    "NLP", "Computer Vision", "LLM", "LangChain", "OpenAI", "Hugging Face",
    "Data Analysis", "Data Science", "Data Engineering", "ETL", "Spark", "Hadoop",
    "Tableau", "Power BI", "Excel", "Looker", "Metabase", "Airflow", "dbt",
    "Pandas", "NumPy", "SciPy", "Jupyter", "RAG", "Vector Database",
  ],
  "Methodologies": [
    "Agile", "Scrum", "Kanban", "Lean", "Waterfall", "SAFe", "TDD", "BDD", "CI/CD",
    "Microservices", "Event-Driven", "Domain-Driven Design", "CQRS", "SOLID",
  ],
  "Soft Skills": [
    "Leadership", "Communication", "Teamwork", "Problem Solving", "Critical Thinking",
    "Project Management", "Time Management", "Mentoring", "Public Speaking",
    "Technical Writing", "Cross-functional Collaboration", "Stakeholder Management",
    "Conflict Resolution", "Decision Making", "Adaptability",
  ],
  "Tools & Platforms": [
    "Jira", "Confluence", "Notion", "Linear", "Asana", "Trello", "Slack", "Teams",
    "Figma", "Adobe XD", "Sketch", "Photoshop", "Illustrator", "Zeplin",
    "OAuth", "JWT", "SAML", "LDAP", "Kafka", "RabbitMQ", "SQS", "SNS",
    "Elasticsearch", "Logstash", "Kibana", "Splunk", "SonarQube",
  ],
  "Security": [
    "Authentication", "Authorization", "Security", "Penetration Testing", "OWASP",
    "Encryption", "Certificates", "WAF", "SIEM", "Zero Trust", "IAM",
  ],
  "Australian Market": [
    "WHS Compliance", "Continuous Improvement", "Cold Chain", "Supply Chain",
    "WMS", "CHRIS21", "SAP", "MYOB", "Xero", "ATO Compliance", "STP",
    "Fair Work", "Award Interpretation", "EBAs", "Payroll", "HRIS",
  ],
};

const ALL_SKILLS = Object.values(SKILLS_DB).flat();
const SKILL_LOOKUP = new Map<string, string>();
for (const s of ALL_SKILLS) SKILL_LOOKUP.set(s.toLowerCase(), s);

const HARD_SKILLS = new Set(
  ["Programming Languages", "Frontend", "Backend & API", "Databases", "DevOps & Cloud",
   "Version Control", "Testing", "Mobile", "Data & ML", "Tools & Platforms", "Security"]
    .flatMap((c) => SKILLS_DB[c].map((s) => s.toLowerCase()))
);

const SOFT_SKILLS = new Set(
  SKILLS_DB["Soft Skills"].map((s) => s.toLowerCase())
);

/* ── Weak phrase / verb data ─────────────────────── */

const WEAK_PHRASES: Array<{ pattern: RegExp; after: string; reason: string }> = [
  { pattern: /responsible\s+for\b/gi, after: "Owned and drove", reason: "Passive → active ownership language" },
  { pattern: /duties\s+included\b/gi, after: "Delivered", reason: "ATS skips 'duties included' as filler" },
  { pattern: /helped\s+(to\s+)?/gi, after: "Enabled", reason: "Weak helper → impact-driven opener" },
  { pattern: /worked\s+on\b/gi, after: "Led development of", reason: "Vague → specific ownership" },
  { pattern: /was\s+(?:a\s+|an\s+|the\s+)?(?:part\s+of |member\s+of |involved\s+in\s+)/gi, after: "Contributed to", reason: "Remove passive voice for ATS weighting" },
  { pattern: /participated\s+in\b/gi, after: "Spearheaded", reason: "Participation → initiative signal" },
  { pattern: /utilized?\b/gi, after: "Applied", reason: "Overused corporate filler — simpler is stronger" },
  { pattern: /leveraged?\b/gi, after: "Used", reason: "Buzzword — replace with concrete verb" },
  { pattern: /synergized?\b/gi, after: "Integrated", reason: "Jargon — replace with plain language" },
  { pattern: /facilitated?\b/gi, after: "Orchestrated", reason: "Generic → demonstrate leadership" },
  { pattern: /assisted?\s+(?:with\s+)?/gi, after: "Supported", reason: "Passive support → active contribution" },
  { pattern: /managed?\b(?!\s+(?:a\s+team|\d+\s*\+))/gi, after: "Directed", reason: "Generic 'managed' lacks scale context" },
  { pattern: /handled?\b/gi, after: "Executed", reason: "Informal → professional action verb" },
  { pattern: /performed?\b/gi, after: "Completed", reason: "Generic → outcome-focused" },
  { pattern: /was\s+responsible\s+for\b/gi, after: "Accountable for", reason: "Remove redundant passive construction" },
  { pattern: /tasks\s+included\b/gi, after: "Delivered", reason: "Task-oriented → achievement-oriented" },
  { pattern: /acted\s+as\b/gi, after: "Served as", reason: "Simplify — stronger direct language" },
];

const WEAK_VERBS: Array<{ weak: string; strong: string; context: string }> = [
  { weak: "Was responsible for managing", strong: "Managed a team of X, delivering Y by Z", context: "Add direct report count + quantifiable outcome" },
  { weak: "Worked on", strong: "Architected and deployed", context: "Replace with specific technical contribution" },
  { weak: "Helped with", strong: "Accelerated timeline by", context: "Quantify the time-saving or efficiency gain" },
  { weak: "Did", strong: "Executed", context: "Swap with strong action verb + metric" },
  { weak: "Made", strong: "Produced", context: "Use creation-oriented language" },
  { weak: "Got", strong: "Secured", context: "Replace with achievement-oriented verb" },
  { weak: "Put", strong: "Implemented", context: "More professional and specific" },
  { weak: "Took care of", strong: "Managed end-to-end", context: "Demonstrate ownership breadth" },
  { weak: "Dealt with", strong: "Resolved", context: "Problem-solving framing" },
  { weak: "Was part of", strong: "Contributed to", context: "Active contribution language" },
  { weak: "Saw to", strong: "Oversaw", context: "Leadership-oriented phrasing" },
  { weak: "Thought about", strong: "Analysed and proposed", context: "Strategic thinking framing" },
  { weak: "Tried to", strong: "Achieved", context: "Remove tentative language" },
  { weak: "Sort of", strong: "Implemented", context: "Avoid colloquial filler" },
  { weak: "Basically", strong: "", context: "Remove filler — let achievements speak" },
];

/* ── ANZSCO / SEEK term mappings ─────────────────── */

const ANZSCO_MAP: Array<{ local: string; standard: string; category: string }> = [
  { local: "React", standard: "React.js Front-End Development", category: "Software" },
  { local: "Angular", standard: "Angular Front-End Development", category: "Software" },
  { local: "Vue", standard: "Vue.js Front-End Development", category: "Software" },
  { local: "TypeScript", standard: "TypeScript Programming", category: "Software" },
  { local: "JavaScript", standard: "JavaScript Programming", category: "Software" },
  { local: "Python", standard: "Python Programming", category: "Software" },
  { local: "Java", standard: "Java Programming", category: "Software" },
  { local: "C#", standard: "C# .NET Development", category: "Software" },
  { local: "Node.js", standard: "Node.js Back-End Development", category: "Software" },
  { local: "SQL", standard: "SQL Database Management", category: "Data" },
  { local: "PostgreSQL", standard: "PostgreSQL Database Administration", category: "Data" },
  { local: "MongoDB", standard: "MongoDB NoSQL Database", category: "Data" },
  { local: "AWS", standard: "Amazon Web Services Cloud Infrastructure", category: "Cloud" },
  { local: "Azure", standard: "Microsoft Azure Cloud Services", category: "Cloud" },
  { local: "GCP", standard: "Google Cloud Platform", category: "Cloud" },
  { local: "Docker", standard: "Docker Containerisation", category: "DevOps" },
  { local: "Kubernetes", standard: "Kubernetes Orchestration", category: "DevOps" },
  { local: "Terraform", standard: "Infrastructure as Code (Terraform)", category: "DevOps" },
  { local: "CI/CD", standard: "Continuous Integration / Continuous Deployment", category: "DevOps" },
  { local: "Git", standard: "Git Version Control", category: "Software" },
  { local: "Agile", standard: "Agile Project Management", category: "Management" },
  { local: "Scrum", standard: "Scrum Framework", category: "Management" },
  { local: "Project Management", standard: "Project Management Methodologies", category: "Management" },
  { local: "Machine Learning", standard: "Machine Learning Engineering", category: "Data" },
  { local: "Data Analysis", standard: "Data Analysis & Visualisation", category: "Data" },
  { local: "Leadership", standard: "Team Leadership & Mentoring", category: "Management" },
  { local: "Figma", standard: "UI/UX Design (Figma)", category: "Creative" },
  { local: "Tableau", standard: "Data Visualisation (Tableau)", category: "Data" },
  { local: "Power BI", standard: "Business Intelligence (Power BI)", category: "Data" },
  { local: "SAP", standard: "SAP Enterprise Resource Planning", category: "Enterprise" },
  { local: "WHS Compliance", standard: "Work Health & Safety Compliance", category: "AU Market" },
  { local: "Continuous Improvement", standard: "Continuous Improvement (Kaizen/Lean)", category: "AU Market" },
  { local: "Supply Chain", standard: "Supply Chain Management", category: "AU Market" },
  { local: "WMS", standard: "Warehouse Management Systems", category: "AU Market" },
  { local: "Cold Chain", standard: "Cold Chain Logistics", category: "AU Market" },
  { local: "Xero", standard: "Xero Accounting Software", category: "AU Market" },
  { local: "MYOB", standard: "MYOB Accounting Software", category: "AU Market" },
  { local: "Payroll", standard: "Payroll Administration (AU)", category: "AU Market" },
  { local: "CHRIS21", standard: "CHRIS21 HR/Payroll System", category: "AU Market" },
];

const AU_MARKET_TERMS = [
  "WHS Compliance", "Continuous Improvement", "Cold Chain", "Supply Chain",
  "WMS", "SAP", "MYOB", "Xero", "ATO Compliance", "STP", "Payroll",
  "HRIS", "Award Interpretation", "Fair Work", "EBAs",
];

/* ── Hard / soft classification ──────────────────── */

const HARD_SKILL_CLASSIFICATION: Record<string, string> = {
  // Frontend & languages — hard
  "JavaScript": "hard", "TypeScript": "hard", "Python": "hard", "Java": "hard",
  "C#": "hard", "C++": "hard", "React": "hard", "Angular": "hard", "Vue": "hard",
  "Node.js": "hard", "SQL": "hard", "Docker": "hard", "Kubernetes": "hard",
  "AWS": "hard", "Azure": "hard", "Terraform": "hard", "Git": "hard",
  "HTML": "hard", "CSS": "hard", "Django": "hard", "Flask": "hard",
  "MongoDB": "hard", "Redis": "hard", "DynamoDB": "hard", "Kafka": "hard",
  "GraphQL": "hard", "REST API": "hard", "WebSocket": "hard",
  "Tableau": "hard", "Power BI": "hard", "Excel": "hard",
  "TensorFlow": "hard", "PyTorch": "hard", "Figma": "hard",
  "Adobe XD": "hard", "Photoshop": "hard", "Jira": "hard",
  "Jenkins": "hard", "GitHub Actions": "hard", "Prometheus": "hard",
  "Grafana": "hard", "Selenium": "hard", "Cypress": "hard",
  // Soft
  "Leadership": "soft", "Communication": "soft", "Teamwork": "soft",
  "Problem Solving": "soft", "Critical Thinking": "soft",
  "Project Management": "soft", "Time Management": "soft",
  "Mentoring": "soft", "Public Speaking": "soft", "Technical Writing": "soft",
  "Adaptability": "soft", "Conflict Resolution": "soft",
  "Stakeholder Management": "soft", "Decision Making": "soft",
};

/* ── Client-side analysis functions ──────────────── */

function extractSkills(text: string): SkillsResult {
  const lower = text.toLowerCase();
  const found = new Set<string>();
  const byCategory: Record<string, string[]> = {};
  let quantifiedCount = 0;
  const quantifiedExamples: string[] = [];

  for (const [category, skills] of Object.entries(SKILLS_DB)) {
    for (const skill of skills) {
      const escaped = skill.replace(/[.+*?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}`, "i");
      if (regex.test(lower) && !found.has(skill.toLowerCase())) {
        found.add(skill.toLowerCase());
        if (!byCategory[category]) byCategory[category] = [];
        byCategory[category].push(skill);
      }
    }
  }

  // Count quantified achievements (patterns like "by X%", "$X", "X customers")
  const quantRe = /(by\s+\d+%|\$\d[\d,.]*|increased?\s+\w+\s+by|reduced?\s+\w+\s+by|saved?\s+\$|generated?\s+\$|managed?\s+\w+\s+of\s+\$|\d+\s*\+?\s*(customers|users|clients|revenue|transactions|reports|projects|team\s+members))/gi;
  const quantMatches = text.match(quantRe);
  if (quantMatches) {
    quantifiedCount = quantMatches.length;
    quantifiedExamples.push(quantMatches.slice(0, 3).join(", "));
  }

  const categories: SkillsCategory[] = Object.entries(byCategory)
    .filter(([, skills]) => skills.length > 0)
    .map(([name, skills]) => ({ name, skills }));

  const hardCount = [...found].filter((s) => HARD_SKILLS.has(s)).length;
  const totalCount = found.size;
  const hardSkillPct = totalCount > 0 ? Math.round((hardCount / totalCount) * 100) : 0;

  return { categories, totalCount, hardSkillPct, quantifiedCount, quantifiedExamples };
}

function auditKeywords(text: string): { rewrites: RewriteItem[] } {
  const rewrites: RewriteItem[] = [];
  const seen = new Set<string>();

  for (const { pattern, after, reason } of WEAK_PHRASES) {
    const match = text.match(pattern);
    if (match && !seen.has(match[0].toLowerCase())) {
      seen.add(match[0].toLowerCase());
      const before = match[0].charAt(0).toUpperCase() + match[0].slice(1).toLowerCase();
      rewrites.push({ before, after, reason });
    }
  }

  // Add general ATS recommendations based on text analysis
  if (!/\d+%/.test(text) && !/\$\d/.test(text) && !/\d+\s*(customers|users|reports|projects)/i.test(text)) {
    rewrites.push({
      before: "Missing quantified metrics across experience entries",
      after: "Add metrics: 'by X%', 'leading $Y revenue', 'serving Z customers'",
      reason: "ATS scoring weights quantify achievements 3× higher than qualitative claims",
    });
  }
  if (!/\b(spearheaded|orchestrated|engineered|pioneered|championed)\b/i.test(text)) {
    rewrites.push({
      before: "No strong leadership verbs detected",
      after: "Lead with: Spearheaded, Orchestrated, Engineered, Pioneered, Championed",
      reason: "High-impact action verbs increase ATS semantic density score",
    });
  }

  return { rewrites };
}

function mapAnzsco(foundSkills: string[]): { mappings: MappingItem[] } {
  const lowerSkills = foundSkills.map((s) => s.toLowerCase());
  const mappings: MappingItem[] = [];
  const matched = new Set<string>();

  for (const entry of ANZSCO_MAP) {
    const key = entry.local.toLowerCase();
    if (lowerSkills.includes(key)) {
      mappings.push({
        resumeSkill: entry.local,
        standardTerm: entry.standard,
        status: "strong match",
        priority: "low",
      });
      matched.add(key);
    }
  }

  // Add missing AU market terms
  for (const term of AU_MARKET_TERMS) {
    if (!lowerSkills.includes(term.toLowerCase())) {
      mappings.push({
        resumeSkill: `(missing) ${term}`,
        standardTerm: term,
        status: "missing",
        priority: "high",
      });
    }
  }

  return { mappings };
}

function classifyHardSoft(foundSkills: string[]): { skills: HardSoftItem[] } {
  const skills: HardSoftItem[] = [];
  const used = new Set<string>();

  for (const skill of foundSkills) {
    const key = skill.toLowerCase();
    const exactKey = Object.keys(HARD_SKILL_CLASSIFICATION).find(
      (k) => k.toLowerCase() === key
    );
    if (exactKey && !used.has(key)) {
      used.add(key);
      const type = HARD_SKILL_CLASSIFICATION[exactKey];
      skills.push({
        skill: exactKey,
        type,
        verdict: type === "hard"
          ? "Technical competency well-articulated"
          : "Interpersonal strength noted — support with examples",
        strength: "strong",
      });
    }
  }

  // Add a few from the lookups not in the classification
  for (const skill of foundSkills) {
    if (used.has(skill.toLowerCase())) continue;
    const isHard = HARD_SKILLS.has(skill.toLowerCase());
    if (isHard) {
      used.add(skill.toLowerCase());
      skills.push({
        skill,
        type: "hard",
        verdict: "Listed as technical skill — add context of use",
        strength: "moderate",
      });
    }
  }

  // Add soft skills not already found
  const softFound = [...used].filter((s) => SOFT_SKILLS.has(s));
  if (softFound.length < 3) {
    const defaults = ["Communication", "Problem Solving", "Teamwork"];
    for (const d of defaults) {
      if (!used.has(d.toLowerCase())) {
        used.add(d.toLowerCase());
        skills.push({
          skill: d,
          type: "soft",
          verdict: `Important ${d.toLowerCase()} indicator — demonstrate with specific examples`,
          strength: "weak",
        });
      }
    }
  }

  return { skills };
}

function auditVerbs(text: string): { improvements: VerbItem[] } {
  const improvements: VerbItem[] = [];
  const seen = new Set<string>();

  for (const { weak, strong, context } of WEAK_VERBS) {
    const regex = new RegExp(`\\b${weak.replace(/[.+*?^${}()|[\]\\]/g, "\\$&")}`, "gi");
    if (regex.test(text) && !seen.has(weak.toLowerCase())) {
      seen.add(weak.toLowerCase());
      improvements.push({ weak, strong, context });
    }
  }

  // Check for metrics presence
  const hasMetrics = /\d+%|\$\d|by\s+\d+|reduced?\s|increased?\s|improved?\s/i.test(text);
  if (!hasMetrics) {
    improvements.push({
      weak: "Missing quantified outcomes in all sections",
      strong: "Add: 'X% reduction', '\$Y revenue', 'Z hours saved'",
      context: "Metrics are the #1 factor for ATS ranking improvement",
    });
  }

  return { improvements };
}

function analyzeGaps(text: string, foundSkills: string[]): { gaps: GapItem[] } {
  const gaps: GapItem[] = [];
  const lowerSkills = foundSkills.map((s) => s.toLowerCase());
  const lower = text.toLowerCase();

  // Section gaps
  if (!/summary|profile|objective|about\s+me/i.test(text)) {
    gaps.push({
      label: "Missing Professional Summary",
      note: "Top 10-15% of the resume should summarise your value proposition. AU employers expect a 3-4 line career snapshot.",
      severity: "high",
    });
  }
  if (!/certif|license|accredit/i.test(text)) {
    gaps.push({
      label: "No Certifications Section",
      note: "AU employers prioritise formal certs (e.g. AWS, PRINCE2, CPA, WHS). Add a dedicated section even if you have one.",
      severity: "medium",
    });
  }

  // AU market gaps
  const hasAUTerm = AU_MARKET_TERMS.some((t) => lower.includes(t.toLowerCase()));
  if (!hasAUTerm) {
    gaps.push({
      label: "No Australian Market Keywords",
      note: "Terms like 'WHS Compliance', 'Continuous Improvement', 'Award Interpretation' signal local market readiness to AU recruiters.",
      severity: "high",
    });
  }

  // Metrics gaps
  if (!/\d+%/.test(text)) {
    gaps.push({
      label: "Few or No Percentage Metrics",
      note: "ATS systems rank candidates higher when improvements are quantified with concrete percentages.",
      severity: "high",
    });
  }
  if (!/\$\d[\d,.]*/.test(text)) {
    gaps.push({
      label: "No Revenue / Budget Figures",
      note: "Including budget ownership or revenue impact ($ scales) significantly boosts scoring for senior roles in AU.",
      severity: "medium",
    });
  }
  if (!/\b(team\s+of\s+\d+|\d+\s*\+?\s*(direct|indirect)?\s*reports|staff|headcount|fte)\b/i.test(text)) {
    gaps.push({
      label: "Missing Team Scale Information",
      note: "AU employers look for span of control information. Mention number of direct reports or cross-functional team size.",
      severity: "medium",
    });
  }

  // Skill depth
  if (foundSkills.length < 8) {
    gaps.push({
      label: "Limited Skill Coverage",
      note: "Only ${foundSkills.length} skills detected. Add 15-20 relevant skills including both technical tools and domain expertise.",
      severity: "medium",
    });
  }

  return { gaps };
}

function generateRewrite(
  text: string,
  foundSkills: string[],
  gapFindings: GapItem[],
  keywordFindings: RewriteItem[]
): RewriteResult {
  const skillLines = Object.entries(SKILLS_DB)
    .filter(([cat]) => foundSkills.some((s) => SKILLS_DB[cat]?.includes(s)))
    .map(([cat, skills]) => {
      const matched = skills.filter((s) => foundSkills.includes(s));
      return matched.length > 0 ? `${cat}:\n  • ${matched.join("\n  • ")}` : null;
    })
    .filter(Boolean);

  const highGaps = gapFindings.filter((g) => g.severity === "high");
  const rewriteLines = keywordFindings.map((r) => `Apply '${r.after}' replacing passive phrasing`);

  if (highGaps.length > 0) {
    rewriteLines.push(...highGaps.map((g) => `Address gap: ${g.label} — ${g.note.split(".")[0]}`));
  }

  return {
    summary: `[Professional Summary — ATS Optimised]\n\nAccomplished ${foundSkills.slice(0, 3).join("/")} professional with demonstrated expertise in ${foundSkills.slice(0, 5).join(", ")}, delivering measurable outcomes across ${foundSkills.length} competency areas. Proven track record of driving ${gapFindings.some((g) => g.severity === "high") ? "targeted improvements" : "continuous enhancement"} through data-informed decision-making and cross-functional collaboration. Adept at translating business requirements into technical solutions that align with organisational strategy and compliance frameworks.`,
    skillsSection: skillLines.length > 0
      ? `SKILLS & TOOLS\n${"=".repeat(50)}\n\n${skillLines.join("\n\n")}`
      : "SKILLS & TOOLS\n\nAdd 15-20 relevant skills across technical, domain, and soft skill categories.\n",
    certificationsSection: text.match(/certif|license|accredit/i)
      ? "LICENCES & CERTIFICATIONS\n\n(List your certifications with issuing body and year — e.g., AWS Solutions Architect 2024, PRINCE2 Practitioner 2023)"
      : "LICENCES & CERTIFICATIONS — SUGGESTED ADDITION\n\nConsider adding AU-recognised certifications relevant to your field (e.g., AWS, PRINCE2, CPA, WHS, LEAN).",
    changeLog: rewriteLines.length > 0
      ? rewriteLines
      : ["No major rewrites identified — your resume uses strong, direct language throughout"],
  };
}

/* ── File reading helpers ────────────────────────── */

async function extractTextFromPDF(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: buffer }).promise;
  const texts: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(" ");
    if (pageText.trim()) texts.push(pageText);
  }
  return texts.join("\n").replace(/\s+/g, " ").trim();
}

async function readFileContent(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".txt")) return await file.text();
  if (name.endsWith(".pdf")) return await extractTextFromPDF(file);
  throw new Error("Unsupported file. Use .txt or .pdf.");
}

/* ── React component ─────────────────────────────── */

export default function AtsAuditor({ resumeText: propText }: AtsAuditorProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AuditResults | null>(null);
  const [openPanels, setOpenPanels] = useState<Record<string, boolean>>({
    skills: true, keywords: true, anzsco: false,
    hardsoft: false, verbs: false, gaps: false,
  });
  const [inputText, setInputText] = useState(propText || "");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const togglePanel = (id: string) =>
    setOpenPanels((p) => ({ ...p, [id]: !p[id] }));

  const textToAnalyze = inputText || propText || "";

  const runAudit = () => {
    const text = inputText || propText || "";
    if (text.length < 100) return;
    setIsRunning(true);
    setResults(null);

    setTimeout(() => {
      const skills = extractSkills(text);
      const foundNames = skills.categories.flatMap((c) => c.skills);
      const keywords = auditKeywords(text);
      const anzsco = mapAnzsco(foundNames);
      const hardSoft = classifyHardSoft(foundNames);
      const verbs = auditVerbs(text);
      const gaps = analyzeGaps(text, foundNames);
      const rewrite = generateRewrite(text, foundNames, gaps.gaps, keywords.rewrites);

      setResults({ skills, keywords, anzsco, hardSoft, verbs, gaps, rewrite });
      setIsRunning(false);
    }, 600);
  };

  const getPlainText = () => {
    if (!results) return "";
    const rw = results.rewrite;
    return [
      "PROFESSIONAL SUMMARY",
      "=".repeat(50),
      rw.summary, "",
      "SKILLS & TOOLS",
      "=".repeat(50),
      rw.skillsSection, "",
      "LICENCES & CERTIFICATIONS",
      "=".repeat(50),
      rw.certificationsSection, "",
      "WHAT CHANGED & WHY",
      "=".repeat(50),
      ...rw.changeLog.map((c, i) => `${i + 1}. ${c}`), "",
      "---",
      "Generated by Portfolio Studio ATS Auditor (client-side)",
    ].join("\n");
  };

  const downloadTXT = () => {
    const blob = new Blob([getPlainText()], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "resume-ats-audit.txt";
    a.click();
  };

  const statusBadge = (s: string) => {
    const cls = s === "strong match" ? "bg-emerald-500/15 text-emerald-600" :
      s === "partial match" ? "bg-amber-500/15 text-amber-600" : "bg-rose-500/15 text-rose-600";
    return <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${cls}`}>{s}</span>;
  };

  const prioBadge = (p: string) => {
    const cls = p === "high" ? "bg-rose-500/15 text-rose-600" :
      p === "medium" ? "bg-amber-500/15 text-amber-600" : "bg-slate-300/30 text-slate-500";
    return <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${cls}`}>{p}</span>;
  };

  const typeBadge = (t: string) => {
    const cls = t === "hard" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600";
    return <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${cls}`}>{t}</span>;
  };

  const PanelToggle = ({ id, label, count }: { id: string; label: string; count?: number }) => (
    <div
      role="button"
      tabIndex={0}
      onClick={() => togglePanel(id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") togglePanel(id); }}
      className="flex items-center justify-between px-3 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors"
    >
      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
        {label}{count !== undefined ? ` (${count})` : ""}
      </span>
      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openPanels[id] ? "rotate-180" : ""}`} />
    </div>
  );

  if (isRunning) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
          <div className="text-3xl mb-3">⚙️</div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Analysing your resume</div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full animate-pulse w-full" />
          </div>
          <div className="text-[11px] text-slate-500">Running client-side analysis...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Input area ── */}
      {!results && (
        <div className="space-y-3">
          <div
            ref={dropRef}
            onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) setIsDragging(false); }}
            onDrop={async (e) => {
              e.preventDefault(); e.stopPropagation(); setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (!file) return;
              setIsParsing(true); setParseError("");
              try {
                const text = await readFileContent(file);
                if (text.length < 50) { setParseError("Could not read enough text from the file."); return; }
                setInputText(text);
              } catch (err: any) { setParseError(err.message || "Failed to read file."); }
              finally { setIsParsing(false); }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
              isDragging ? "border-sky-500 bg-sky-50 dark:bg-sky-950/30" : "border-slate-300 dark:border-slate-700 hover:border-sky-400 bg-slate-50/30 dark:bg-slate-900/20"
            }`}
          >
            <input ref={fileInputRef} type="file" accept=".txt,.pdf" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setIsParsing(true); setParseError("");
              try {
                const text = await readFileContent(file);
                if (text.length < 50) { setParseError("Could not read enough text from the file."); return; }
                setInputText(text);
              } catch (err: any) { setParseError(err.message || "Failed to read file."); }
              finally { setIsParsing(false); e.target.value = ""; }
            }} />
            {isParsing ? (
              <div className="flex items-center justify-center gap-2 text-slate-500 text-[11px]">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Parsing resume file...
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <Upload className={`w-5 h-5 ${isDragging ? "text-sky-500" : "text-slate-400"}`} />
                <p className="text-[10px] text-slate-500 font-medium">
                  {isDragging ? "Drop resume file here" : "Click or drop a .txt / .pdf resume"}
                </p>
              </div>
            )}
          </div>

          {parseError && (
            <div className="flex items-center gap-2 p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          <div className="relative flex items-center gap-2">
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-[9px] text-slate-400 font-medium uppercase">or paste text</span>
            <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your full resume text here — including summary, experience, skills, and certifications..."
            rows={8}
            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[11px] text-slate-700 dark:text-slate-300 placeholder:text-slate-400 font-mono leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-sky-500/50"
          />

          <p className="text-[10px] text-slate-400 text-center">
            Analyses your resume across 7 lenses using client-side rules — no API key needed, 100% free.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={runAudit}
        disabled={isRunning || textToAnalyze.length < 100}
        className="w-full py-2.5 bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-500 hover:to-violet-500 disabled:from-slate-300 disabled:to-slate-300 dark:disabled:from-slate-800 dark:disabled:to-slate-800 text-white disabled:text-slate-400 rounded-xl text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
      >
        <Sparkles className="w-4 h-4" />
        {isRunning ? "Analysing..." : textToAnalyze.length < 100 ? "Add at least 100 characters" : results ? "Run Audit Again" : "Run Free ATS Audit"}
      </button>

      {results && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Skills</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{results.skills.totalCount}</div>
              <div className="text-[9px] text-slate-400">{results.skills.categories.length} categories</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Hard skill ratio</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{results.skills.hardSkillPct}%</div>
              <div className="text-[9px] text-slate-400">of total skills</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Quantified</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">{results.skills.quantifiedCount}</div>
              <div className="text-[9px] text-slate-400">achievements with metrics</div>
            </div>
            <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
              <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">High-priority gaps</div>
              <div className="text-xl font-bold text-slate-800 dark:text-slate-100">
                {results.gaps.gaps.filter((g) => g.severity === "high").length}
              </div>
              <div className="text-[9px] text-slate-400">needs attention</div>
            </div>
          </div>

          {/* ── Skills panel ── */}
          <div className="space-y-1">
            <PanelToggle id="skills" label="Extracted Skills" count={results.skills.totalCount} />
            {openPanels.skills && (
              <div className="p-3 bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 text-[11px]">
                {results.skills.categories.map((cat) => (
                  <div key={cat.name}>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">{cat.name}</div>
                    <div className="flex flex-wrap gap-1">
                      {cat.skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-full text-[10px] text-sky-700 dark:text-sky-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Keyword panel ── */}
          <div className="space-y-1">
            <PanelToggle id="keywords" label="Keyword Phrasing Fixes" count={results.keywords.rewrites.length} />
            {openPanels.keywords && (
              <div className="p-3 bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-[11px]">
                {results.keywords.rewrites.map((r, i) => (
                  <div key={i} className="flex gap-2 items-start p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 shrink-0 mt-0.5">→</span>
                    <div>
                      <div className="text-[10px] text-slate-400 line-through">{r.before}</div>
                      <div className="text-xs text-sky-600 dark:text-sky-400 font-medium">{r.after}</div>
                      <div className="text-[9px] text-slate-400 mt-0.5">{r.reason}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── ANZSCO panel ── */}
          <div className="space-y-1">
            <PanelToggle id="anzsco" label="ANZSCO / SEEK Mapping" count={results.anzsco.mappings.length} />
            {openPanels.anzsco && (
              <div className="p-3 bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl max-h-[280px] overflow-y-auto">
                <table className="w-full text-[10px] border-collapse">
                  <thead>
                    <tr className="text-[9px] text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-1.5 pr-2">Your skill</th>
                      <th className="text-left py-1.5 pr-2">SEEK standard</th>
                      <th className="text-left py-1.5 pr-2">Match</th>
                      <th className="text-left py-1.5">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.anzsco.mappings.map((m, i) => (
                      <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50">
                        <td className="py-1.5 pr-2 text-slate-700 dark:text-slate-300">{m.resumeSkill}</td>
                        <td className="py-1.5 pr-2 text-slate-500">{m.standardTerm}</td>
                        <td className="py-1.5 pr-2">{statusBadge(m.status)}</td>
                        <td className="py-1.5">{prioBadge(m.priority)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Hard/soft panel ── */}
          <div className="space-y-1">
            <PanelToggle id="hardsoft" label="Hard vs Soft Balance" count={results.hardSoft.skills.length} />
            {openPanels.hardsoft && (
              <div className="p-3 bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 text-[11px]">
                {results.hardSoft.skills.map((sk, i) => {
                  const pct = sk.strength === "strong" ? 90 : sk.strength === "moderate" ? 55 : 25;
                  return (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                      <span className="w-20 text-slate-700 dark:text-slate-300 text-[10px] truncate">{sk.skill}</span>
                      <span className="w-14 shrink-0">{typeBadge(sk.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: pct >= 80 ? "#3dd68c" : pct >= 50 ? "#f0a04a" : "#f06060" }} />
                          </div>
                          <span className="text-[9px] shrink-0" style={{ color: pct >= 80 ? "#3dd68c" : pct >= 50 ? "#f0a04a" : "#f06060" }}>{sk.strength}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 truncate">{sk.verdict}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Verb panel ── */}
          <div className="space-y-1">
            <PanelToggle id="verbs" label="Action Verb Audit" count={results.verbs.improvements.length} />
            {openPanels.verbs && (
              <div className="space-y-2">
                {results.verbs.improvements.map((v, i) => (
                  <div key={i} className="p-2.5 bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="text-[10px] text-slate-400 line-through mb-1">{v.weak}</div>
                    <div className="text-xs text-slate-800 dark:text-slate-100 font-medium">{v.strong}</div>
                    <div className="text-[9px] text-slate-400 mt-1">{v.context}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Gaps panel ── */}
          <div className="space-y-1">
            <PanelToggle id="gaps" label="Market Gaps" count={results.gaps.gaps.length} />
            {openPanels.gaps && (
              <div className="p-3 bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-[11px]">
                {results.gaps.gaps.map((g, i) => (
                  <div key={i} className="flex gap-2 items-start">
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-1 ${
                      g.severity === "high" ? "bg-red-500" : g.severity === "medium" ? "bg-amber-500" : "bg-green-500"
                    }`} />
                    <div>
                      <div className="font-semibold text-slate-700 dark:text-slate-300">{g.label}</div>
                      <div className="text-[10px] text-slate-400">{g.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Rewrite ── */}
          <div className="bg-white dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl p-[18px] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Rewritten Resume Sections
              </h3>
              <div className="flex gap-2">
                <button type="button" onClick={downloadTXT} className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-[9px] font-bold cursor-pointer hover:opacity-90 transition-opacity">
                  <Download className="w-3 h-3" /> .txt
                </button>
              </div>
            </div>

            <div>
              <div className="text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">Professional Summary</div>
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {results.rewrite.summary}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">Skills &amp; Tools</div>
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {results.rewrite.skillsSection}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">Licences &amp; Certifications</div>
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                {results.rewrite.certificationsSection}
              </div>
            </div>
            <div>
              <div className="text-[9px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider mb-1">What changed &amp; why</div>
              <div className="space-y-1">
                {results.rewrite.changeLog.map((c, i) => (
                  <div key={i} className="flex gap-2 items-start p-2 bg-slate-50 dark:bg-slate-900/40 rounded-lg text-[10px] text-slate-600 dark:text-slate-400">
                    <span className="text-sky-600 dark:text-sky-400 font-bold shrink-0">{i + 1}.</span>
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={runAudit}
            className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Run Audit Again
          </button>
        </>
      )}
    </div>
  );
}
