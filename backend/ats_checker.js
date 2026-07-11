/**
 * ATS Resume Checker v2 — Production-Grade Parsing, Extraction & Scoring
 *
 * Improvements over v1:
 * - Fallback PDF parser chain (pdf-parse → pdfjs-dist)
 * - Enhanced text cleaning (OCR artifacts, soft hyphens, page numbers)
 * - 60+ section header variations
 * - Expanded synonym dictionary (~50 groups)
 * - Semantic skill matching (concept-level, not just keyword)
 * - Anti-keyword-stuffing detection
 * - Structured experience & project extraction
 * - Action verb scoring with measurable achievements
 * - JD section analysis (Required vs Preferred weighting)
 * - New scoring weights: 30/20/15/10/10/5/5/5
 * - Pre-compiled regex for performance
 * - Comprehensive error handling
 */

const pdfParse = require('pdf-parse');

// ─── Fallback PDF parser (pdfjs-dist) ────────────────────────────────────────
let pdfjsLib = null;
try {
  pdfjsLib = require('pdfjs-dist/legacy/build/pdf.mjs');
} catch {
  try {
    pdfjsLib = require('pdfjs-dist');
  } catch {
    // pdfjs-dist not available — fallback will be skipped
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: SYNONYM DICTIONARY (~50 groups)
// ═══════════════════════════════════════════════════════════════════════════════

const SYNONYMS = [
  // --- JavaScript Ecosystem ---
  ['React', 'React.js', 'ReactJS', 'React JS'],
  ['Node.js', 'Node', 'NodeJS', 'Node JS'],
  ['Express.js', 'Express', 'ExpressJS', 'Express JS'],
  ['Next.js', 'Next', 'NextJS', 'Next JS'],
  ['Vue.js', 'Vue', 'VueJS', 'Vue JS'],
  ['Angular', 'AngularJS', 'Angular JS'],
  ['JavaScript', 'JS', 'ECMAScript'],
  ['TypeScript', 'TS'],
  ['jQuery', 'JQuery'],
  ['Svelte', 'SvelteKit'],

  // --- CSS Frameworks ---
  ['Tailwind CSS', 'Tailwind', 'TailwindCSS'],
  ['Bootstrap', 'Bootstrap CSS'],
  ['SASS', 'SCSS'],
  ['HTML', 'HTML5'],
  ['CSS', 'CSS3'],

  // --- Backend / Frameworks ---
  ['Django', 'Django REST'],
  ['Flask', 'Flask API'],
  ['FastAPI', 'Fast API'],
  ['Spring Boot', 'Spring', 'SpringBoot'],
  ['Ruby on Rails', 'Rails', 'RoR'],
  ['NestJS', 'Nest.js', 'Nest JS'],
  ['Laravel', 'Laravel PHP'],

  // --- Databases ---
  ['MongoDB', 'Mongo', 'Mongo DB'],
  ['PostgreSQL', 'Postgres', 'PG'],
  ['MySQL', 'My SQL'],
  ['SQLite', 'SQL Lite'],
  ['DynamoDB', 'Dynamo DB'],
  ['Redis', 'Redis Cache'],

  // --- Cloud & DevOps ---
  ['AWS', 'Amazon Web Services'],
  ['GCP', 'Google Cloud Platform', 'Google Cloud'],
  ['Azure', 'Microsoft Azure'],
  ['Docker', 'Docker.io', 'Containerization'],
  ['Kubernetes', 'K8s'],
  ['CI/CD', 'CICD', 'Continuous Integration', 'Continuous Deployment'],
  ['Terraform', 'IaC', 'Infrastructure as Code'],
  ['Jenkins', 'Jenkins CI'],
  ['GitHub Actions', 'GH Actions'],

  // --- APIs & Architecture ---
  ['REST APIs', 'REST API', 'RESTful API', 'RESTful APIs', 'REST', 'RESTful'],
  ['GraphQL', 'Graph QL'],
  ['Microservices', 'Micro Services', 'Microservice Architecture'],
  ['WebSocket', 'WebSockets', 'Socket.io'],

  // --- Auth & Security ---
  ['JWT', 'JWT Authentication', 'JWT Auth', 'JSON Web Token'],
  ['OAuth', 'OAuth2', 'OAuth 2.0'],

  // --- AI / ML / Data ---
  ['Machine Learning', 'ML'],
  ['Deep Learning', 'DL'],
  ['Artificial Intelligence', 'AI'],
  ['Natural Language Processing', 'NLP'],
  ['TensorFlow', 'Tensor Flow', 'TF'],
  ['PyTorch', 'Py Torch'],
  ['Data Science', 'Data Analytics'],
  ['Pandas', 'Python Pandas'],
  ['NumPy', 'Numpy'],

  // --- Version Control & Tools ---
  ['Git', 'GitHub', 'Git/GitHub', 'GitLab'],
  ['JIRA', 'Jira'],
  ['Agile', 'Scrum', 'Agile/Scrum', 'Kanban'],

  // --- Testing ---
  ['Jest', 'Jest Testing'],
  ['Cypress', 'Cypress.io'],
  ['Selenium', 'Selenium WebDriver'],
  ['Playwright', 'MS Playwright'],

  // --- Mobile ---
  ['React Native', 'ReactNative'],
  ['Flutter', 'Dart/Flutter'],
];

// ─── Build fast lookup map from SYNONYMS ─────────────────────────────────────
const SYNONYM_MAP = new Map();
for (const group of SYNONYMS) {
  const canonical = group[0];
  for (const variant of group) {
    SYNONYM_MAP.set(variant.toLowerCase(), canonical);
  }
}

/** Canonicalize a skill name using the pre-built map. O(1) lookup. */
function canonicalize(skillName) {
  const result = SYNONYM_MAP.get(skillName.toLowerCase().trim());
  return result || skillName.trim();
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: SKILL DICTIONARY
// ═══════════════════════════════════════════════════════════════════════════════

const SKILL_LIST = [
  // --- Information Technology & Software ---
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby',
  'Go', 'Rust', 'Swift', 'Kotlin', 'React', 'Angular', 'Vue', 'Svelte', 'Next.js',
  'HTML', 'CSS', 'SASS', 'SCSS', 'Tailwind CSS', 'Bootstrap', 'Webpack', 'Vite', 'Redux',
  'Node.js', 'Express', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'Rails', 'NestJS',
  'MongoDB', 'MySQL', 'PostgreSQL', 'SQL', 'NoSQL', 'SQLite', 'Redis', 'DynamoDB', 'Firebase',
  'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform',
  'Git', 'GitHub', 'Jest', 'Mocha', 'Cypress', 'Selenium', 'Playwright', 'Postman',
  'React Native', 'Flutter', 'Android', 'iOS', 'Machine Learning', 'Deep Learning',
  'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Data Analysis', 'Data Science', 'AI', 'NLP',
  'GraphQL', 'REST API', 'Microservices', 'Agile', 'Scrum', 'JIRA', 'Linux', 'Bash', 'JWT',
  'WebSocket', 'OAuth', 'Figma', 'Vercel', 'Netlify', 'Heroku', 'Nginx', 'Apache',

  // --- Teacher / Education ---
  'Curriculum', 'Classroom Management', 'Lesson Planning', 'Pedagogy', 'Tutoring',
  'Special Education', 'Grading', 'Educational Technology', 'IEP', 'Differentiated Instruction',
  'Student Assessment', 'Classroom Instruction', 'E-Learning', 'Instructional Design',

  // --- Accountant / Finance / Banking ---
  'Tax Preparation', 'Audit', 'General Ledger', 'Reconciliation', 'QuickBooks', 'GAAP', 'CPA',
  'Financial Statements', 'Billing', 'Payroll', 'Balance Sheet', 'Accounts Payable',
  'Accounts Receivable', 'Financial Analysis', 'Financial Modeling', 'Cost Accounting',
  'Portfolio Management', 'Investment', 'Excel', 'Wealth Management', 'Risk Management',
  'Underwriting', 'Credit Analysis', 'Budgeting', 'Forecasting', 'Valuation',

  // --- Chef / Culinary ---
  'Culinary Arts', 'Food Preparation', 'Menu Design', 'Kitchen Management', 'Food Safety',
  'Recipe Development', 'Catering', 'Pastry', 'Baking', 'Sanitation', 'Inventory Control',

  // --- Business Development / Sales / Public Relations ---
  'Partnership Development', 'Sales Strategy', 'Negotiation', 'Lead Generation', 'CRM',
  'Account Management', 'B2B Sales', 'Cold Calling', 'Deal Closing', 'Branding', 'Communications',
  'Public Relations', 'Press Releases', 'Media Relations', 'Crisis Management', 'Event Planning',

  // --- HR / Recruitment ---
  'Talent Acquisition', 'Onboarding', 'Employee Relations', 'Performance Management',
  'HRIS', 'Benefits Administration', 'Conflict Resolution', 'Interviewing', 'Recruitment',

  // --- Healthcare / Medical ---
  'Patient Care', 'Clinical Experience', 'EHR', 'EMR', 'CPR', 'First Aid', 'Diagnosis',
  'Vital Signs', 'Patient Assessment', 'Nursing', 'Phlebotomy', 'Medical Terminology',

  // --- Legal / Advocate ---
  'Litigation', 'Legal Research', 'Contract Drafting', 'Compliance', 'Court Representation',
  'Legal Writing', 'Corporate Law', 'Intellectual Property', 'Policy Analysis',

  // --- Construction / Engineering ---
  'Project Management', 'CAD', 'AutoCAD', 'OSHA Safety', 'Blueprints', 'Estimation',
  'Contractor Management', 'Site Supervision', 'SOLIDWORKS', 'MATLAB', 'Electrical Wiring',
  'Quality Control', 'HVAC'
];

// ─── Pre-compile skill regex patterns ────────────────────────────────────────
const SKILL_REGEX_MAP = new Map();
for (const skill of SKILL_LIST) {
  const pattern = skill.toLowerCase();
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const hasWordBoundary = /[a-zA-Z0-9+#]/.test(pattern.charAt(0)) &&
                          /[a-zA-Z0-9+#]/.test(pattern.charAt(pattern.length - 1));
  const regex = hasWordBoundary
    ? new RegExp(`\\b${escaped}\\b`, 'i')
    : new RegExp(escaped, 'i');
  SKILL_REGEX_MAP.set(skill, regex);
}

// ─── Pre-compile synonym regex patterns ──────────────────────────────────────
const SYNONYM_REGEX_MAP = new Map();
for (const group of SYNONYMS) {
  const regexes = group.map(syn => {
    const pattern = syn.toLowerCase();
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const hasWordBoundary = /[a-zA-Z0-9+#]/.test(pattern.charAt(0)) &&
                            /[a-zA-Z0-9+#]/.test(pattern.charAt(pattern.length - 1));
    return hasWordBoundary
      ? new RegExp(`\\b${escaped}\\b`, 'i')
      : new RegExp(escaped, 'i');
  });
  SYNONYM_REGEX_MAP.set(group[0], { group, regexes });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: SEMANTIC LINKS (concept-level matching)
// ═══════════════════════════════════════════════════════════════════════════════

const SEMANTIC_LINKS = {
  'REST API': ['rest api', 'restful', 'rest apis', 'built api', 'api development', 'api endpoint', 'api integration'],
  'Authentication': ['jwt', 'oauth', 'auth', 'login', 'authentication', 'session management', 'token-based'],
  'Cloud Deployment': ['aws', 'gcp', 'azure', 'deployed', 'cloud', 'hosting', 'vercel', 'netlify', 'render', 'heroku'],
  'Database': ['mongodb', 'mysql', 'postgresql', 'sqlite', 'redis', 'database', 'data storage', 'crud'],
  'Testing': ['jest', 'mocha', 'cypress', 'selenium', 'unit test', 'testing', 'test coverage', 'playwright'],
  'Version Control': ['git', 'github', 'gitlab', 'version control', 'branching', 'pull request'],
  'Containerization': ['docker', 'kubernetes', 'container', 'k8s', 'docker-compose'],
  'CI/CD': ['github actions', 'jenkins', 'ci/cd', 'cicd', 'pipeline', 'automated deployment', 'continuous'],
  'Frontend': ['react', 'angular', 'vue', 'frontend', 'front-end', 'ui development', 'user interface'],
  'Backend': ['node', 'express', 'django', 'flask', 'backend', 'back-end', 'server-side', 'api server'],
  'State Management': ['redux', 'context api', 'zustand', 'state management', 'mobx'],
  'Responsive Design': ['responsive', 'mobile-first', 'media queries', 'responsive design', 'cross-browser'],
  'Agile Development': ['agile', 'scrum', 'kanban', 'sprint', 'standup', 'retrospective', 'backlog'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: ACTION VERBS
// ═══════════════════════════════════════════════════════════════════════════════

const ACTION_VERBS = [
  'built', 'designed', 'implemented', 'developed', 'optimized', 'created',
  'led', 'engineered', 'integrated', 'deployed', 'improved', 'configured',
  'architected', 'automated', 'maintained', 'migrated', 'refactored',
  'managed', 'launched', 'delivered', 'established', 'executed', 'resolved',
  'streamlined', 'spearheaded', 'collaborated', 'mentored', 'trained',
  'reduced', 'increased', 'scaled', 'modernized', 'consolidated',
  'analyzed', 'monitored', 'investigated', 'troubleshot', 'debugged',
  'documented', 'standardized', 'initiated', 'pioneered', 'transformed',
  'coordinated', 'facilitated', 'negotiated', 'drove', 'orchestrated',
  'contributed', 'constructed', 'programmed', 'coded', 'tested',
  'validated', 'secured', 'enhanced', 'customized', 'formulated',
  'evaluated', 'researched', 'presented', 'published', 'supervised',
  'oversaw', 'directed', 'administered', 'restructured', 'revamped'
];

const ACTION_VERB_SET = new Set(ACTION_VERBS);
const ACTION_VERB_REGEX = new RegExp(`\\b(${ACTION_VERBS.join('|')})\\b`, 'gi');
const MEASURABLE_REGEX = /\b(\d+[%x×+]|\d+\s*(?:percent|users|clients|customers|requests|transactions|projects|teams|members|reduction|improvement|increase|decrease))\b/gi;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: KEYWORD LISTS
// ═══════════════════════════════════════════════════════════════════════════════

const SOFT_SKILLS = [
  'communication', 'leadership', 'teamwork', 'collaboration', 'problem solving',
  'critical thinking', 'time management', 'adaptability', 'creativity', 'agile',
  'scrum', 'mentoring', 'organization', 'interpersonal', 'active listening',
  'decision making', 'conflict resolution', 'presentation', 'negotiation',
  'emotional intelligence', 'self-motivated', 'analytical', 'detail-oriented'
];

const CORE_KEYWORDS = [
  'must have', 'required', 'essential', 'mandatory', 'necessary', 'critical',
  'need to have', 'must know', 'expertise in', 'proficiency in', 'experience with',
  'strong knowledge', 'required skills', 'requirements', 'qualifications',
  'minimum requirements', 'key requirements', 'core requirements'
];

const OPTIONAL_KEYWORDS = [
  'good to have', 'nice to have', 'optional', 'plus', 'bonus', 'preferred',
  'desirable', 'advantage', 'beneficial', 'would be a plus', 'nice if you have',
  'additional skills', 'preferred qualifications', 'ideally', 'preferably'
];

const STOP_WORDS = new Set([
  'the', 'and', 'a', 'to', 'of', 'for', 'in', 'with', 'on', 'at', 'by', 'an', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'but', 'if', 'or', 'as', 'about',
  'into', 'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'about',
  'requisite', 'requirements', 'responsibilities', 'qualifications', 'experience', 'skills', 'role',
  'candidate', 'position', 'team', 'ability', 'must', 'preferred', 'required', 'ideal', 'successful',
  'work', 'working', 'job', 'description', 'perform', 'duties', 'including', 'other', 'related', 'fields',
  'strong', 'excellent', 'good', 'demonstrated', 'proven', 'years', 'minimum', 'degree', 'bachelor',
  'master', 'phd', 'diploma', 'certificate', 'certification', 'highly', 'plus', 'bonus', 'we', 'our',
  'you', 'your', 'they', 'their', 'them', 'he', 'she', 'it', 'us', 'me', 'him', 'her'
]);

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: PDF PARSING (FALLBACK CHAIN)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Measure the quality of extracted text to choose the best parser result.
 * Returns a score 0-100 where higher = better extraction.
 */
function measureExtractionQuality(text) {
  if (!text || !text.trim()) return 0;

  let score = 0;
  const trimmed = text.trim();

  // 1. Text length (max 25 points)
  const len = trimmed.length;
  if (len > 2000) score += 25;
  else if (len > 500) score += 20;
  else if (len > 100) score += 10;
  else score += 2;

  // 2. Printable character ratio (max 25 points)
  const printable = trimmed.replace(/[^\x20-\x7E\n\r\t]/g, '').length;
  const ratio = printable / len;
  score += Math.round(ratio * 25);

  // 3. Detected email (10 points)
  if (/[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}/i.test(trimmed)) {
    score += 10;
  }

  // 4. Detected phone (10 points)
  if (/(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/.test(trimmed)) {
    score += 10;
  }

  // 5. Word count (max 15 points) — real words, not fragments
  const words = trimmed.split(/\s+/).filter(w => w.length > 2);
  if (words.length > 100) score += 15;
  else if (words.length > 30) score += 10;
  else if (words.length > 10) score += 5;

  // 6. Section headers detected (max 15 points)
  let headerCount = 0;
  const lines = trimmed.split('\n');
  for (const line of lines) {
    if (getSectionKey(line.trim())) headerCount++;
  }
  score += Math.min(15, headerCount * 5);

  return Math.min(100, score);
}

/**
 * Extract text from PDF buffer using pdfjs-dist as fallback parser.
 */
async function extractTextWithPdfjs(buffer) {
  if (!pdfjsLib) return '';

  try {
    const uint8Array = new Uint8Array(buffer);
    const doc = await pdfjsLib.getDocument({ data: uint8Array, useSystemFonts: true }).promise;
    const textParts = [];

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(' ');
      textParts.push(pageText);
    }

    return textParts.join('\n');
  } catch {
    return '';
  }
}

/**
 * Extract plain text from PDF buffer using a fallback parser chain.
 * Tries pdf-parse first, then pdfjs-dist if available. Returns the
 * result with the highest extraction quality score.
 */
async function extractTextFromPdf(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('This PDF file appears to be empty. Please make sure you saved it correctly.');
  }

  const results = [];

  // Attempt 1: pdf-parse (primary parser)
  try {
    const data = await pdfParse(buffer);
    const rawText = data.text || '';
    const cleaned = sanitizePdfText(rawText);
    const quality = measureExtractionQuality(cleaned);
    results.push({ text: cleaned, quality, parser: 'pdf-parse' });
  } catch (err) {
    const lowerMsg = (err.message || '').toLowerCase();
    if (lowerMsg.includes('password') || lowerMsg.includes('encrypted')) {
      throw new Error('This PDF is password-protected. Please unlock it and try again.');
    }
    // Continue to fallback
  }

  // Attempt 2: pdfjs-dist (fallback parser)
  if (pdfjsLib) {
    try {
      const rawText = await extractTextWithPdfjs(buffer);
      if (rawText && rawText.trim()) {
        const cleaned = sanitizePdfText(rawText);
        const quality = measureExtractionQuality(cleaned);
        results.push({ text: cleaned, quality, parser: 'pdfjs-dist' });
      }
    } catch {
      // Fallback failed, continue
    }
  }

  // Select the best result by quality score
  if (results.length === 0) {
    throw new Error(
      "We couldn't extract text from this PDF. It might be an image-only scan or corrupted. " +
      "Try saving directly from Word or Google Docs as a standard PDF."
    );
  }

  results.sort((a, b) => b.quality - a.quality);
  const best = results[0];

  if (!best.text || !best.text.trim()) {
    throw new Error(
      "This PDF contains no readable text. If it's a scanned document, please convert it " +
      "to a text-based PDF (e.g., save directly from Word or Google Docs)."
    );
  }

  return best.text;
}

/**
 * Sanitize extracted PDF text to improve ATS parsing accuracy.
 * Enhanced in v2 with OCR artifact removal, page number stripping,
 * soft hyphen handling, and repeated header/footer detection.
 */
function sanitizePdfText(text) {
  if (!text) return '';

  let cleaned = text
    // 1. Remove zero-width spaces and non-printable characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // 2. Remove soft hyphens
    .replace(/\u00AD/g, '')
    // 3. Fix common PDF ligatures
    .replace(/\uFB00/g, 'ff')
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB02/g, 'fl')
    .replace(/\uFB03/g, 'ffi')
    .replace(/\uFB04/g, 'ffl')
    .replace(/\uFB05/g, 'st')
    .replace(/\uFB06/g, 'st')
    // 4. Normalize weird quotes and apostrophes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // 5. Normalize dashes and hyphens
    .replace(/[\u2010-\u2015]/g, '-')
    // 6. Normalize bullets
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
    // 7. Normalize non-breaking spaces
    .replace(/\u00A0/g, ' ')
    // 8. Remove page numbers (standalone "Page X of Y" or "X" between newlines)
    .replace(/\n\s*(?:page\s+)?\d+\s*(?:of\s+\d+)?\s*\n/gi, '\n')
    // 9. Fix hyphenated line breaks (devel-\noper → developer)
    .replace(/([a-zA-Z])-\s*\n\s*([a-z])/g, '$1$2')
    // 10. Remove isolated single characters (OCR artifacts)
    .replace(/(?:^|\n)\s*[a-zA-Z]\s*(?:\n|$)/g, '\n')
    // 11. Normalize tab characters to spaces
    .replace(/\t/g, ' ')
    // 12. Clean up excessive whitespace without removing newlines
    .replace(/[ ]+/g, ' ')
    // 13. Collapse 3+ consecutive newlines to 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 14. Remove repeated header/footer lines (lines appearing 3+ times)
  const lines = cleaned.split('\n');
  if (lines.length > 10) {
    const lineCounts = new Map();
    for (const line of lines) {
      const trimmedLine = line.trim().toLowerCase();
      if (trimmedLine.length > 3 && trimmedLine.length < 80) {
        lineCounts.set(trimmedLine, (lineCounts.get(trimmedLine) || 0) + 1);
      }
    }
    const repeatedLines = new Set();
    for (const [line, count] of lineCounts) {
      if (count >= 3) repeatedLines.add(line);
    }
    if (repeatedLines.size > 0) {
      cleaned = lines
        .filter(line => !repeatedLines.has(line.trim().toLowerCase()))
        .join('\n');
    }
  }

  return cleaned;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: SECTION DETECTION (60+ variations)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Map a line to a section key. Supports 60+ heading variations.
 * Strips non-alpha characters and matches against known patterns.
 */
function getSectionKey(line) {
  const clean = line.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (!clean || clean.length > 50) return null;

  // Summary / Profile / Objective
  if (['SUMMARY', 'PROFESSIONALSUMMARY', 'PROFILE', 'ABOUTME', 'ABOUT',
       'CAREEROBJECTIVE', 'OBJECTIVE', 'EXECUTIVESUMMARY', 'PERSONALSTATEMENT',
       'PROFESSIONALPROFILE', 'CAREERPROFILE', 'CAREERSUMMARY'].includes(clean)) {
    return 'summary';
  }

  // Work Experience
  if (['EXPERIENCE', 'WORKEXPERIENCE', 'PROFESSIONALEXPERIENCE', 'WORKHISTORY',
       'EMPLOYMENT', 'EMPLOYMENTHISTORY', 'CAREERHISTORY', 'RELEVANTEXPERIENCE',
       'INDUSTRYEXPERIENCE', 'PROFESSIONALBACKGROUND'].includes(clean)) {
    return 'experience';
  }

  // Projects
  if (['PROJECTS', 'KEYPROJECTS', 'ACADEMICPROJECTS', 'PERSONALPROJECTS',
       'SIDEPROJECTS', 'SELECTEDPROJECTS', 'RELEVANTPROJECTS',
       'PROJECTWORK', 'TECHNICALPROJECTS', 'MAJORPROJECTS'].includes(clean)) {
    return 'projects';
  }

  // Skills
  if (['SKILLS', 'TECHNICALSKILLS', 'CORECOMPETENCIES', 'EXPERTISE',
       'TECHNOLOGIES', 'KEYSKILLS', 'PROFESSIONALSKILLS', 'TECHSTACK',
       'AREASOFEXPERTISE', 'TECHNICALPROFICIENCIES', 'COMPETENCIES',
       'SKILLSET', 'TOOLSANDTECHNOLOGIES', 'PROFICIENCIES'].includes(clean)) {
    return 'skills';
  }

  // Education
  if (['EDUCATION', 'ACADEMICBACKGROUND', 'ACADEMICS', 'ACADEMICQUALIFICATION',
       'EDUCATIONALBACKGROUND', 'ACADEMICRECORD', 'SCHOOLING', 'EDUCATIONALQUALIFICATIONS',
       'DEGREES', 'ACADEMICCREDENTIALS'].includes(clean)) {
    return 'education';
  }

  // Certifications
  if (['CERTIFICATIONS', 'CERTIFICATES', 'COURSES', 'LICENSESANDCERTIFICATIONS',
       'PROFESSIONALCERTIFICATIONS', 'LICENSES', 'TRAINING',
       'PROFESSIONALDEVELOPMENT', 'ONLINECOURSES', 'COURSEWORK'].includes(clean)) {
    return 'certifications';
  }

  // Achievements / Awards
  if (['ACHIEVEMENTS', 'AWARDS', 'HONORS', 'ACCOMPLISHMENTS',
       'AWARDSANDACHIEVEMENTS', 'PUBLICATIONS', 'RECOGNITION',
       'HONORSANDAWARDS'].includes(clean)) {
    return 'achievements';
  }

  // Languages
  if (['LANGUAGES', 'LANGUAGESKNOWN', 'LANGUAGEPROFICIENCY',
       'LANGUAGESKILLS'].includes(clean)) {
    return 'languages';
  }

  // Interests
  if (['INTERESTS', 'HOBBIES', 'HOBBIESANDINTERESTS', 'EXTRACURRICULAR',
       'EXTRACURRICULARACTIVITIES', 'ACTIVITIES'].includes(clean)) {
    return 'interests';
  }

  return null;
}

/**
 * Segment resume text into logical sections.
 * v2: Adds projects, achievements, languages, interests sections.
 */
function splitSections(text) {
  const sections = {
    summary: '',
    experience: '',
    projects: '',
    skills: '',
    education: '',
    certifications: '',
    achievements: '',
    languages: '',
    interests: '',
    other: ''
  };

  if (!text) return sections;

  const lines = text.split('\n');
  let currentSection = 'other';

  lines.forEach(line => {
    const key = getSectionKey(line.trim());
    if (key && line.trim().length < 50) {
      currentSection = key;
    } else {
      sections[currentSection] += line + '\n';
    }
  });

  return sections;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: CONTACT DETECTION (enhanced)
// ═══════════════════════════════════════════════════════════════════════════════

/** Extract Candidate Name from first few lines. */
function extractName(text) {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  for (let i = 0; i < Math.min(7, lines.length); i++) {
    const line = lines[i];

    // Skip lines with URLs, emails, phones, skill lists, headers
    if (line.includes('@') || line.includes('github.com') || line.includes('linkedin.com') ||
        line.includes('+') || /\b(?:resume|cv|curriculum vitae|portfolio|website)\b/i.test(line) ||
        /[,|•]/.test(line) || /\d{5,}/.test(line)) {
      continue;
    }

    // Clean leading non-alphabetic characters
    const cleanLine = line.replace(/^[^a-zA-Z]+/, '').trim();
    if (!cleanLine) continue;

    const words = cleanLine.split(/\s+/);
    // Name is typically 2-4 words, each starting with uppercase (allow Jr., Sr., III, de, van)
    if (words.length >= 2 && words.length <= 5 &&
        words.every(w => /^[A-Z]/.test(w) || ['de', 'van', 'von', 'el', 'al', 'Jr.', 'Sr.', 'Jr', 'Sr', 'II', 'III', 'IV'].includes(w))) {
      return cleanLine;
    }
  }
  return null;
}

/** Extract basic contact info using robust regular expressions. */
function extractContactInfo(text) {
  if (!text) {
    return { name: null, email: null, phone: null, linkedin: null, github: null, portfolio: null, location: null };
  }

  // Email
  const emailRegex = /([a-zA-Z0-9._+-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,})/gi;
  const emailMatch = text.match(emailRegex);

  // Phone — supports international formats, avoids matching years
  const phoneRegex = /(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/g;
  const phoneMatches = text.match(phoneRegex) || [];
  let phone = null;
  for (const m of phoneMatches) {
    const digits = m.replace(/\D/g, '');
    // Valid phone: 10-15 digits, not a year (19xx or 20xx alone)
    if (digits.length >= 10 && digits.length <= 15) {
      // Exclude standalone years
      const trimmedMatch = m.trim();
      if (/^(19|20)\d{2}$/.test(trimmedMatch)) continue;
      phone = trimmedMatch;
      break;
    }
  }

  // LinkedIn
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi;
  const linkedinMatch = text.match(linkedinRegex);

  // GitHub
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/gi;
  const githubMatch = text.match(githubRegex);

  // Portfolio — exclude common non-portfolio domains
  let portfolio = null;
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9_-]+\.[a-z]{2,6})(?:\/[^\s]*)?/gi;
  const excludedDomains = new Set([
    'linkedin', 'github', 'gmail', 'email', 'render', 'vercel', 'netlify',
    'google', 'youtube', 'facebook', 'twitter', 'instagram', 'amazonaws',
    'cloudfront', 'herokuapp', 'onrender', 'firebaseapp', 'googleapis'
  ]);
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const domain = match[1].toLowerCase();
    if (!Array.from(excludedDomains).some(exc => domain.includes(exc))) {
      portfolio = match[0];
      break;
    }
  }

  // Location — lightweight detection
  let location = null;
  const locationRegex = /(?:^|\n)\s*([A-Z][a-zA-Z\s]+,\s*[A-Z]{2,}(?:\s*\d{5,6})?)\s*(?:\n|$)/m;
  const locationMatch = text.match(locationRegex);
  if (locationMatch) {
    const candidate = locationMatch[1].trim();
    if (candidate.length > 3 && candidate.length < 60 && !candidate.includes('@')) {
      location = candidate;
    }
  }

  // Normalize LinkedIn URL
  let linkedin = null;
  if (linkedinMatch) {
    const raw = linkedinMatch[0];
    linkedin = raw.startsWith('http') ? raw : `https://www.${raw}`;
  }

  // Normalize GitHub URL
  let github = null;
  if (githubMatch) {
    const raw = githubMatch[0];
    github = raw.startsWith('http') ? raw : `https://www.${raw}`;
  }

  return {
    name: extractName(text),
    email: emailMatch ? emailMatch[0].toLowerCase() : null,
    phone,
    linkedin,
    github,
    portfolio,
    location
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9: SKILL EXTRACTION (normalized + semantic matching)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if resumeText semantically satisfies a JD skill concept.
 * Uses the SEMANTIC_LINKS map for concept-level matching.
 */
function semanticMatch(resumeTextLower, jdSkill) {
  const jdLower = jdSkill.toLowerCase();

  // Direct check in semantic links
  for (const [concept, terms] of Object.entries(SEMANTIC_LINKS)) {
    if (terms.some(t => jdLower.includes(t)) || jdLower.includes(concept.toLowerCase())) {
      // The JD skill maps to this concept — check if resume has any related term
      if (terms.some(t => resumeTextLower.includes(t))) {
        return true;
      }
    }
  }

  // Partial keyword containment (e.g., "REST API Development" matches if "rest api" found)
  const jdWords = jdLower.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w));
  if (jdWords.length > 0) {
    const matchedWords = jdWords.filter(w => resumeTextLower.includes(w));
    if (matchedWords.length >= Math.ceil(jdWords.length * 0.6)) {
      return true;
    }
  }

  return false;
}

/**
 * Detect keyword stuffing — returns a penalty multiplier (0.0 to 1.0).
 * 1.0 = no stuffing, 0.7 = moderate stuffing detected.
 */
function detectStuffing(text) {
  if (!text) return 1.0;
  const lowerText = text.toLowerCase();
  const wordFreq = new Map();

  // Count skill keyword occurrences
  for (const { group, regexes } of SYNONYM_REGEX_MAP.values()) {
    for (const regex of regexes) {
      const matches = lowerText.match(new RegExp(regex.source, 'gi'));
      if (matches) {
        const canonical = group[0].toLowerCase();
        wordFreq.set(canonical, (wordFreq.get(canonical) || 0) + matches.length);
      }
      break; // Only check first variant to avoid double counting
    }
  }

  // If any skill appears 6+ times, it's likely stuffing
  let stuffedCount = 0;
  for (const count of wordFreq.values()) {
    if (count >= 6) stuffedCount++;
  }

  if (stuffedCount >= 3) return 0.7;
  if (stuffedCount >= 1) return 0.85;
  return 1.0;
}

/** Extract skills from text using synonym-aware + dynamic matching. */
function extractSkills(text) {
  if (!text) return [];
  const foundSkills = new Set();
  const lowerText = text.toLowerCase();

  // 1. Check all canonical synonym groups (pre-compiled regex)
  for (const [canonical, { regexes }] of SYNONYM_REGEX_MAP) {
    const matched = regexes.some(regex => regex.test(lowerText));
    if (matched) {
      foundSkills.add(canonical);
    }
  }

  // 2. Check individual skill dictionary (pre-compiled regex)
  for (const [skill, regex] of SKILL_REGEX_MAP) {
    const canonical = canonicalize(skill);
    if (foundSkills.has(canonical)) continue;
    if (regex.test(lowerText)) {
      foundSkills.add(canonical);
    }
  }

  // 3. Dynamic multi-word term extraction
  const phraseRegex = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,2})\b/g;
  let phraseMatch;
  while ((phraseMatch = phraseRegex.exec(text)) !== null) {
    const phrase = phraseMatch[0];
    const lowerPhrase = phrase.toLowerCase();
    const words = lowerPhrase.split(/\s+/);
    const hasStopWord = words.some(w => STOP_WORDS.has(w));

    if (!hasStopWord && phrase.length > 4) {
      const canonical = canonicalize(phrase);
      foundSkills.add(canonical);
    }
  }

  return Array.from(foundSkills);
}

/** Extract skills from a job description and split into Core vs Optional. */
function extractWeightedJDSkills(text) {
  if (!text) {
    return { coreSkills: [], optionalSkills: [] };
  }

  const lines = text.split(/\n|\./).map(line => line.trim()).filter(Boolean);
  const coreSet = new Set();
  const optionalSet = new Set();
  const allSet = new Set();

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    const isCore = CORE_KEYWORDS.some(kw => lowerLine.includes(kw));
    const isOptional = OPTIONAL_KEYWORDS.some(kw => lowerLine.includes(kw));

    // A. Match against synonym groups (pre-compiled regex)
    for (const [canonical, { regexes }] of SYNONYM_REGEX_MAP) {
      const matched = regexes.some(regex => regex.test(line));
      if (matched) {
        allSet.add(canonical);
        if (isCore) coreSet.add(canonical);
        else if (isOptional) optionalSet.add(canonical);
      }
    }

    // B. Match against static skill list (pre-compiled regex)
    for (const [skill, regex] of SKILL_REGEX_MAP) {
      const canonical = canonicalize(skill);
      if (allSet.has(canonical)) continue;
      if (regex.test(line)) {
        allSet.add(canonical);
        if (isCore) coreSet.add(canonical);
        else if (isOptional) optionalSet.add(canonical);
      }
    }

    // C. Dynamic capitalized terms
    const phraseRegex = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,2})\b/g;
    let phraseMatch;
    while ((phraseMatch = phraseRegex.exec(line)) !== null) {
      const phrase = phraseMatch[0];
      const lowerPhrase = phrase.toLowerCase();
      const words = lowerPhrase.split(/\s+/);
      const hasStopWord = words.some(w => STOP_WORDS.has(w));

      if (!hasStopWord && phrase.length > 4) {
        const canonical = canonicalize(phrase);
        allSet.add(canonical);
        if (isCore) coreSet.add(canonical);
        else if (isOptional) optionalSet.add(canonical);
      }
    }
  });

  let coreSkills = Array.from(coreSet);
  let optionalSkills = Array.from(optionalSet);

  if (coreSkills.length === 0 && optionalSkills.length === 0 && allSet.size > 0) {
    coreSkills = Array.from(allSet);
  }

  optionalSkills = optionalSkills.filter(s => !coreSet.has(s));

  return { coreSkills, optionalSkills };
}

/**
 * Compare resume skills against job description skills.
 * v2: Uses canonicalized comparison + semantic matching for missing skills.
 */
function compareWeightedSkills(resumeSkills, coreSkills, optionalSkills, resumeText = '') {
  const resumeSet = new Set(resumeSkills.map(s => canonicalize(s).toLowerCase()));
  const resumeTextLower = resumeText.toLowerCase();

  const matchedCoreSkills = [];
  const missingCoreSkills = [];

  for (const skill of coreSkills) {
    const canonical = canonicalize(skill).toLowerCase();
    if (resumeSet.has(canonical)) {
      matchedCoreSkills.push(skill);
    } else if (resumeText && semanticMatch(resumeTextLower, skill)) {
      matchedCoreSkills.push(skill);
    } else {
      missingCoreSkills.push(skill);
    }
  }

  const matchedOptionalSkills = [];
  const missingOptionalSkills = [];

  for (const skill of optionalSkills) {
    const canonical = canonicalize(skill).toLowerCase();
    if (resumeSet.has(canonical)) {
      matchedOptionalSkills.push(skill);
    } else if (resumeText && semanticMatch(resumeTextLower, skill)) {
      matchedOptionalSkills.push(skill);
    } else {
      missingOptionalSkills.push(skill);
    }
  }

  const coreMatchPercentage = coreSkills.length > 0 ? Math.round((matchedCoreSkills.length / coreSkills.length) * 100) : 0;
  const optionalMatchPercentage = optionalSkills.length > 0 ? Math.round((matchedOptionalSkills.length / optionalSkills.length) * 100) : 0;

  return {
    matchedCoreSkills,
    missingCoreSkills,
    matchedOptionalSkills,
    missingOptionalSkills,
    coreMatchPercentage,
    optionalMatchPercentage
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10: EXPERIENCE EXTRACTION (structured)
// ═══════════════════════════════════════════════════════════════════════════════

const MONTH_NAMES = 'jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?';
const DATE_PATTERN = new RegExp(
  `((?:${MONTH_NAMES})\\s*\\d{4}|\\d{1,2}\\/\\d{4}|\\d{4})` +
  `\\s*[-–—to]+\\s*` +
  `((?:${MONTH_NAMES})\\s*\\d{4}|\\d{1,2}\\/\\d{4}|\\d{4}|present|current|ongoing|now)`,
  'gi'
);

/**
 * Extract structured work experience entries from text.
 * Returns array of { company, role, startDate, endDate, duration, achievements, technologies }.
 */
function extractExperience(text) {
  if (!text || !text.trim()) return [];

  const entries = [];
  const lines = text.split('\n');
  let currentEntry = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Check if this line contains a date range
    const dateMatch = line.match(DATE_PATTERN);
    if (dateMatch || (line.includes('|') && /[A-Z]/.test(line) && line.length > 10 && line.length < 150)) {
      // Save previous entry
      if (currentEntry) entries.push(currentEntry);

      // Parse role/company from the line
      const parts = line.split(/[|–—]/).map(p => p.trim()).filter(Boolean);
      currentEntry = {
        role: parts[0] || '',
        company: parts.length > 1 ? parts[1] : '',
        startDate: dateMatch ? dateMatch[1] : '',
        endDate: dateMatch ? dateMatch[2] : '',
        achievements: [],
        technologies: []
      };
    } else if (currentEntry && (line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))) {
      const bullet = line.replace(/^[-•*]\s*/, '').trim();
      if (bullet) {
        currentEntry.achievements.push(bullet);
        // Extract technologies mentioned in bullets
        for (const [canonical, { regexes }] of SYNONYM_REGEX_MAP) {
          if (regexes.some(r => r.test(bullet))) {
            if (!currentEntry.technologies.includes(canonical)) {
              currentEntry.technologies.push(canonical);
            }
          }
        }
      }
    }
  }

  if (currentEntry) entries.push(currentEntry);

  return entries;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 11: PROJECT DETECTION (accurate counting)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze projects section. v2: Uses dedicated projects section,
 * detects project headers accurately, extracts tech stack.
 */
function analyzeProjects(projectsText, experienceText) {
  const result = {
    projectCount: 0,
    projectNames: [],
    technologies: [],
    deployment: false,
    machineLearning: false,
    authentication: false,
    database: false,
    cloud: false
  };

  // Combine projects and experience for analysis
  const combinedText = (projectsText || '') + '\n' + (experienceText || '');
  if (!combinedText.trim()) return result;

  // ─── Project extraction from dedicated projects section ──────────
  if (projectsText && projectsText.trim()) {
    const lines = projectsText.split('\n');
    let currentProject = null;

    for (const line of lines) {
      const clean = line.trim();
      if (!clean) continue;

      // Detect project header: line with title format (not a bullet point)
      const isBullet = /^[-•*]/.test(clean);
      const isTitle = (
        !isBullet &&
        clean.length > 3 && clean.length < 120 &&
        /[A-Z]/.test(clean) &&
        !/^\d+\.$/.test(clean) // Not just a number
      );

      if (isTitle && (clean.includes('—') || clean.includes('|') || clean.includes(':') ||
                      clean.includes('–') || /^[A-Z]/.test(clean))) {
        const titleCandidate = clean.split(/[—|:–]/)[0].trim().replace(/^[-•*\s]+/, '');
        if (titleCandidate.length > 3 && titleCandidate.length < 80) {
          if (currentProject) result.projectNames.push(currentProject);
          currentProject = titleCandidate;
        }
      }
    }
    if (currentProject) result.projectNames.push(currentProject);
  }

  // Fallback: estimate from experience section if no projects section
  if (result.projectNames.length === 0 && experienceText) {
    const expLines = experienceText.split('\n');
    for (const line of expLines) {
      const clean = line.trim();
      if ((clean.includes('—') || clean.includes('|') || clean.includes('•')) &&
          clean.length > 10 && clean.length < 120) {
        const titleCandidate = clean.split(/[—|:]/)[0].trim().replace(/^[-•*\s]+/, '');
        if (titleCandidate.length > 3 && titleCandidate.length < 50 && /[A-Z]/.test(titleCandidate)) {
          if (!result.projectNames.includes(titleCandidate)) {
            result.projectNames.push(titleCandidate);
          }
        }
      }
    }
  }

  result.projectCount = result.projectNames.length;
  if (result.projectCount === 0 && combinedText.trim().length > 100) {
    // Estimate from bullet points (conservative: divide by 5, not 4)
    const bullets = (combinedText.match(/^[\s]*[-•*]/gm) || []).length;
    result.projectCount = Math.max(1, Math.floor(bullets / 5));
  }

  // Feature detection
  const lower = combinedText.toLowerCase();
  if (/\b(?:vercel|netlify|render|heroku|railway|deployed|live on|production|hosted)\b/i.test(lower)) {
    result.deployment = true;
  }
  if (/\b(?:machine learning|deep learning|classifier|regression|scikit-learn|tensorflow|pytorch|model|predict|neural)\b/i.test(lower)) {
    result.machineLearning = true;
  }
  if (/\b(?:jwt|authentication|auth|login|oauth|google login|token|session|passport)\b/i.test(lower)) {
    result.authentication = true;
  }

  const dbs = [];
  if (lower.includes('mongodb') || lower.includes('mongo')) dbs.push('MongoDB');
  if (lower.includes('mysql')) dbs.push('MySQL');
  if (lower.includes('postgresql') || lower.includes('postgres')) dbs.push('PostgreSQL');
  if (lower.includes('sqlite')) dbs.push('SQLite');
  if (lower.includes('redis')) dbs.push('Redis');
  if (lower.includes('firebase')) dbs.push('Firebase');
  if (lower.includes('dynamodb')) dbs.push('DynamoDB');
  if (dbs.length > 0) {
    result.database = true;
    result.technologies.push(...dbs);
  }

  if (/\b(?:aws|amazon web services|gcp|google cloud|azure|docker|kubernetes|cloud|ec2|s3|lambda)\b/i.test(lower)) {
    result.cloud = true;
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 12: ACTION VERB SCORING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect strong action verbs and measurable achievements.
 * Returns a normalized 0-100 score.
 */
function detectActionVerbs(text) {
  if (!text || !text.trim()) return { score: 0, verbs: [], measurableCount: 0 };

  // Find unique action verbs
  const foundVerbs = new Set();
  const matches = text.match(ACTION_VERB_REGEX) || [];
  for (const m of matches) {
    foundVerbs.add(m.toLowerCase());
  }

  // Find measurable achievements
  const measurableMatches = text.match(MEASURABLE_REGEX) || [];
  const measurableCount = measurableMatches.length;

  // Score: up to 70 points for verbs (capped at 15 unique verbs), up to 30 for measurable
  const verbScore = Math.min(70, (foundVerbs.size / 15) * 70);
  const measurableScore = Math.min(30, measurableCount * 10);

  return {
    score: Math.min(100, Math.round(verbScore + measurableScore)),
    verbs: Array.from(foundVerbs),
    measurableCount
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 13: JOB DESCRIPTION ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Analyze job description to separate Required vs Preferred skills.
 * Returns weight multipliers for different JD sections.
 */
function analyzeJobDescription(text) {
  if (!text || !text.trim()) {
    return { hasStructure: false, requiredWeight: 1.0, preferredWeight: 1.0 };
  }

  const lower = text.toLowerCase();

  const hasRequired = CORE_KEYWORDS.some(kw => lower.includes(kw));
  const hasPreferred = OPTIONAL_KEYWORDS.some(kw => lower.includes(kw));

  if (hasRequired && hasPreferred) {
    return { hasStructure: true, requiredWeight: 1.5, preferredWeight: 0.75 };
  }

  if (hasRequired) {
    return { hasStructure: true, requiredWeight: 1.3, preferredWeight: 1.0 };
  }

  // No clear structure — treat everything equally
  return { hasStructure: false, requiredWeight: 1.0, preferredWeight: 1.0 };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 14: WEIGHTED ATS SCORING (30/20/15/10/10/5/5/5)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate overall weighted ATS score and explainability metadata.
 *
 * New weights:
 *   30% Skills Match
 *   20% Experience Match
 *   15% Projects
 *   10% Education
 *   10% Resume Structure
 *    5% Formatting
 *    5% Contact Information
 *    5% Action Verbs
 */
function calculateWeightedATSScore(comparison, resumeText = '', jobDescription = '', similarityScore = null) {
  const {
    matchedCoreSkills,
    missingCoreSkills,
    matchedOptionalSkills,
    missingOptionalSkills
  } = comparison;

  const totalCore = matchedCoreSkills.length + missingCoreSkills.length;
  const totalOptional = matchedOptionalSkills.length + missingOptionalSkills.length;

  if (totalCore === 0 && totalOptional === 0 && !resumeText.trim()) {
    return {
      atsScore: 0,
      explanation: 'No relevant skills found in the job description to evaluate.',
      details: {
        matchTier: 'No Match',
        matchTierColor: 'danger',
        summary: 'No job-specific keywords could be found in the job description to compare against your resume.',
        keyStrengths: [],
        criticalGaps: ['Check that the job description text lists professional qualifications, skills, or responsibilities.']
      }
    };
  }

  // ─── 1. Skills Match Score (30%) ──────────────────────────────────
  const coreScore = totalCore > 0 ? (matchedCoreSkills.length / totalCore) * 100 : 0;
  const optionalScore = totalOptional > 0 ? (matchedOptionalSkills.length / totalOptional) * 100 : 0;

  let coreWeight = 0.7;
  let optionalWeight = 0.3;
  if (totalCore === 0) { coreWeight = 0; optionalWeight = 1.0; }
  else if (totalOptional === 0) { coreWeight = 1.0; optionalWeight = 0; }

  // Apply JD analysis weighting
  const jdAnalysis = analyzeJobDescription(jobDescription);
  let techScore = (coreScore * coreWeight * jdAnalysis.requiredWeight) +
                  (optionalScore * optionalWeight * jdAnalysis.preferredWeight);
  // Normalize back to 0-100 range
  const maxPossible = (100 * coreWeight * jdAnalysis.requiredWeight) +
                      (100 * optionalWeight * jdAnalysis.preferredWeight);
  techScore = maxPossible > 0 ? (techScore / maxPossible) * 100 : 0;

  // Apply anti-stuffing penalty
  const stuffingMultiplier = detectStuffing(resumeText);
  techScore *= stuffingMultiplier;

  // Fallback: if no resumeText, return simple keyword-based score
  if (!resumeText || !resumeText.trim()) {
    const finalScore = Math.round(techScore);
    let matchTier = 'Weak Match';
    let matchTierColor = 'danger';
    if (finalScore >= 80) { matchTier = 'Strong Match'; matchTierColor = 'success'; }
    else if (finalScore >= 50) { matchTier = 'Good Match'; matchTierColor = 'warning'; }
    return {
      atsScore: finalScore,
      explanation: `${matchTier}! Matched ${matchedCoreSkills.length}/${totalCore} core keywords.`,
      confidence: 85,
      details: {
        matchTier,
        matchTierColor,
        summary: 'Keyword-based match analysis completed.',
        keyStrengths: matchedCoreSkills.length > 0 ? [`Matched core keyword(s): ${matchedCoreSkills.slice(0, 3).join(', ')}`] : [],
        criticalGaps: missingCoreSkills.length > 0 ? [`Missing core keyword(s): ${missingCoreSkills.slice(0, 3).join(', ')}`] : []
      }
    };
  }

  // Segment resume and parse sections
  const sections = splitSections(resumeText);
  const projAnalysis = analyzeProjects(sections.projects, sections.experience);
  const contactInfo = extractContactInfo(resumeText);
  const experienceEntries = extractExperience(sections.experience);
  const actionVerbResult = detectActionVerbs(resumeText);

  // ─── 2. Experience Match Score (20%) ──────────────────────────────
  let expScore = 0;
  if (experienceEntries.length > 0) {
    expScore += 30; // has experience section
    expScore += Math.min(30, experienceEntries.length * 15); // entries
    // Achievement bullets
    const totalAchievements = experienceEntries.reduce((sum, e) => sum + e.achievements.length, 0);
    expScore += Math.min(20, totalAchievements * 4);
    // Technologies mentioned in experience
    const techCount = experienceEntries.reduce((sum, e) => sum + e.technologies.length, 0);
    expScore += Math.min(20, techCount * 5);
  } else if (sections.experience && sections.experience.trim().length > 50) {
    expScore = 40; // Has text but couldn't parse structured entries
  }
  expScore = Math.min(100, expScore);

  // ─── 3. Projects Score (15%) ──────────────────────────────────────
  let projScore = 0;
  if (projAnalysis.projectCount > 0) {
    projScore += 15;
    projScore += Math.min(15, projAnalysis.projectCount * 7);
    if (projAnalysis.deployment) projScore += 3;
    if (projAnalysis.database) projScore += 2;
    if (projAnalysis.cloud) projScore += 2;
    if (projAnalysis.authentication || projAnalysis.machineLearning) projScore += 2;
    // Project names quality
    projScore += Math.min(10, projAnalysis.projectNames.length * 5);
  }
  projScore = Math.min(100, (projScore / 49) * 100);

  // ─── 4. Education Score (10%) ─────────────────────────────────────
  let eduScore = 0;
  if (sections.education && sections.education.trim()) {
    eduScore += 50;
    const lowerEdu = sections.education.toLowerCase();
    if (/\b(?:bca|mca|btech|mtech|bachelor|master|degree|university|college|gpa|cgpa|b\.?s\.?|m\.?s\.?|ph\.?d|associate|diploma)\b/i.test(lowerEdu)) {
      eduScore += 50;
    }
  }

  // ─── 5. Resume Structure Score (10%) ──────────────────────────────
  let structScore = 0;
  const sectionKeys = ['summary', 'experience', 'projects', 'skills', 'education', 'certifications', 'achievements'];
  for (const key of sectionKeys) {
    if (sections[key] && sections[key].trim()) {
      structScore += 14;
    }
  }
  structScore = Math.min(100, structScore);

  // ─── 6. Formatting Score (5%) ─────────────────────────────────────
  let formatScore = 0;
  const wordCount = resumeText.split(/\s+/).length;
  // Ideal length: 300-800 words
  if (wordCount >= 300 && wordCount <= 800) formatScore += 40;
  else if (wordCount >= 150 && wordCount <= 1200) formatScore += 25;
  else formatScore += 10;
  // Consistent bullet usage
  const bulletCount = (resumeText.match(/^[\s]*[-•*]/gm) || []).length;
  if (bulletCount >= 5) formatScore += 30;
  else if (bulletCount >= 2) formatScore += 15;
  // Line breaks (well-structured)
  const lineCount = resumeText.split('\n').filter(l => l.trim()).length;
  if (lineCount >= 20 && lineCount <= 80) formatScore += 30;
  else if (lineCount >= 10) formatScore += 15;
  formatScore = Math.min(100, formatScore);

  // ─── 7. Contact Information Score (5%) ────────────────────────────
  let contactScore = 0;
  if (contactInfo.name) contactScore += 20;
  if (contactInfo.email) contactScore += 25;
  if (contactInfo.phone) contactScore += 25;
  if (contactInfo.linkedin) contactScore += 15;
  if (contactInfo.github || contactInfo.portfolio) contactScore += 15;
  contactScore = Math.min(100, contactScore);

  // ─── 8. Action Verbs Score (5%) ───────────────────────────────────
  const actionScore = actionVerbResult.score;

  // ─── Weighted Sum (30/20/15/10/10/5/5/5) ──────────────────────────
  const rawScore = (techScore * 0.30) +
                   (expScore * 0.20) +
                   (projScore * 0.15) +
                   (eduScore * 0.10) +
                   (structScore * 0.10) +
                   (formatScore * 0.05) +
                   (contactScore * 0.05) +
                   (actionScore * 0.05);

  // Realistic calibration
  let finalScore = Math.round(rawScore);
  if (finalScore > 98) finalScore = 98;
  if (finalScore < 30 && resumeText.trim()) finalScore = 30;

  // Determine Tiers
  let matchTier = 'Weak Match';
  let matchTierColor = 'danger';

  if (finalScore >= 90) {
    matchTier = 'Excellent Match';
    matchTierColor = 'success';
  } else if (finalScore >= 80) {
    matchTier = 'Strong Match';
    matchTierColor = 'success';
  } else if (finalScore >= 70) {
    matchTier = 'Good Match';
    matchTierColor = 'warning';
  }

  // Context-aware summary
  let summary = '';
  if (resumeText.trim()) {
    const matchedTerms = matchedCoreSkills.slice(0, 5).join(', ');
    const missingTerms = missingCoreSkills.slice(0, 4).join(', ');
    summary = `This resume demonstrates ${matchTier.toLowerCase()} alignment with the target role. It successfully matches key technologies mentioned in the job description, including ${matchedTerms || 'some basic skills'}. `;
    if (projAnalysis.projectCount > 0) {
      summary += `The profile is strengthened by ${projAnalysis.projectCount} project(s) with practical implementation details. `;
    }
    if (missingCoreSkills.length > 0) {
      summary += `However, key qualifications requested by the employer, such as ${missingTerms}, are currently missing from the resume.`;
    }
  } else {
    summary = 'Please upload a resume and provide a job description to see your plain English overview.';
  }

  // Evidence-based key strengths
  const keyStrengths = [];
  if (projAnalysis.projectCount > 0) {
    keyStrengths.push(`Built and described ${projAnalysis.projectCount} project(s) (e.g. ${projAnalysis.projectNames.slice(0, 2).join(', ')}).`);
  }
  if (projAnalysis.deployment) {
    keyStrengths.push('Demonstrates experience deploying web applications to cloud services (like Vercel, Netlify, or Render).');
  }
  if (projAnalysis.database && projAnalysis.technologies.length > 0) {
    keyStrengths.push(`Shows practical database integration with ${Array.from(new Set(projAnalysis.technologies)).join(' and ')}.`);
  }
  if (projAnalysis.authentication) {
    keyStrengths.push('Demonstrates user authentication experience utilizing JWT or tokens.');
  }
  if (projAnalysis.machineLearning) {
    keyStrengths.push('Shows familiarity implementing machine learning models or real-time predictors.');
  }
  if (matchedCoreSkills.length > 0) {
    keyStrengths.push(`Successfully matches ${matchedCoreSkills.length} core technical keywords found in the job requirements.`);
  }
  if (actionVerbResult.verbs.length >= 5) {
    keyStrengths.push(`Uses ${actionVerbResult.verbs.length} strong action verbs across experience descriptions.`);
  }
  if (actionVerbResult.measurableCount > 0) {
    keyStrengths.push(`Includes ${actionVerbResult.measurableCount} measurable achievement(s) with quantified results.`);
  }

  // Specific optimization steps
  const criticalGaps = [];
  missingCoreSkills.forEach(skill => {
    if (skill.toLowerCase() === 'docker') {
      criticalGaps.push('Incorporate Docker containerization experience if you have worked with it.');
    } else if (skill.toLowerCase() === 'agile' || skill.toLowerCase() === 'scrum') {
      criticalGaps.push('Mention Agile/Scrum workflow exposure in your experience sections.');
    } else if (skill.toLowerCase() === 'aws' || skill.toLowerCase() === 'gcp') {
      criticalGaps.push(`Add cloud infrastructure experience with ${skill} to match requirements.`);
    } else if (skill.toLowerCase() === 'ci/cd') {
      criticalGaps.push('Detail any CI/CD automation pipeline experience (e.g. GitHub Actions, Jenkins).');
    } else {
      criticalGaps.push(`Integrate the missing keyword '${skill}' naturally into your skills or work history.`);
    }
  });

  if (projAnalysis.projectCount === 0) {
    criticalGaps.push('Add a dedicated Projects section to highlight hands-on application of your technical skills.');
  }
  if (!contactInfo.phone) {
    criticalGaps.push('Ensure your phone number is clearly formatted and present near the top of the page.');
  }
  if (actionVerbResult.verbs.length < 5) {
    criticalGaps.push('Use stronger action verbs (Built, Designed, Implemented, Deployed) to describe your accomplishments.');
  }
  if (actionVerbResult.measurableCount === 0) {
    criticalGaps.push('Add measurable achievements (e.g., "Reduced load time by 40%", "Served 10K+ users").');
  }

  // Parser/Completeness Confidence
  const numSections = Object.values(sections).filter(v => v && v.trim()).length;
  const numContacts = Object.values(contactInfo).filter(Boolean).length;

  const sectionConf = (numSections / 7) * 30;
  const contactConf = (numContacts / 5) * 20;
  const wordConf = wordCount > 200 && wordCount < 900 ? 20 : 10;
  const mlConf = 30;

  const confidenceScore = Math.min(98, Math.round(sectionConf + contactConf + wordConf + mlConf));

  return {
    atsScore: finalScore,
    explanation: `${matchTier}! Matched ${matchedCoreSkills.length}/${totalCore} core keywords.`,
    confidence: confidenceScore,
    details: {
      matchTier,
      matchTierColor,
      summary,
      keyStrengths: keyStrengths.slice(0, 5),
      criticalGaps: criticalGaps.slice(0, 5)
    }
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 15: JOB CATEGORY PREDICTION
// ═══════════════════════════════════════════════════════════════════════════════

/** Predict the job category and calculate confidence based on resume text. */
function predictCategoryAndConfidence(text) {
  if (!text || !text.trim()) {
    return {
      category: 'Unknown',
      confidence: 0.0
    };
  }

  const lower = text.toLowerCase();

  const categories = {
    'Software Engineering': /\b(?:javascript|react|node|express|typescript|html|css|git|mongodb|sql|web development|frontend|backend|fullstack|developer|software engineer|programming|java|c\+\+|c#|go|rust|php|ruby)\b/gi,
    'Data Science & AI': /\b(?:machine learning|deep learning|data science|python|pandas|numpy|tensorflow|pytorch|scikit-learn|ai|artificial intelligence|neural network|nlp|data analyst|data analysis|data visualization|tableau|powerbi)\b/gi,
    'DevOps & Cloud': /\b(?:devops|aws|amazon web services|gcp|google cloud|azure|docker|kubernetes|jenkins|ci\/cd|terraform|ansible|cloud engineer|systems administrator|linux)\b/gi,
    'Human Resources': /\b(?:hr|human resources|recruitment|talent acquisition|onboarding|employee relations|benefits|payroll|hris|interviewing|recruiter)\b/gi,
    'Finance & Accounting': /\b(?:finance|accounting|accountant|audit|tax|quickbooks|ledger|gaap|cpa|billing|payroll|balance sheet|accounts payable|accounts receivable|forecasting|budgeting)\b/gi,
    'Education & Teaching': /\b(?:teacher|teaching|education|curriculum|classroom management|lesson planning|pedagogy|tutoring|special education|instructional design|school|student|assessments)\b/gi,
    'Sales & Business Development': /\b(?:sales|business development|lead generation|crm|account management|b2b|negotiation|cold calling|sales strategy|marketing|public relations|pr|branding)\b/gi,
    'Healthcare & Medical': /\b(?:healthcare|medical|patient care|clinical|nurse|nursing|cpr|first aid|diagnosis|vital signs|patient assessment|ehr|emr|doctor|clinic)\b/gi,
    'Legal & Law': /\b(?:legal|law|advocate|litigation|court|contract drafting|compliance|legal research|legal writing|intellectual property|attorney|paralegal)\b/gi,
    'Engineering & Construction': /\b(?:engineering|mechanical|civil|electrical|construction|cad|autocad|solidworks|matlab|blueprints|estimation|project management|safety|osha|hvac)\b/gi,
    'Culinary & Food Services': /\b(?:culinary|chef|cook|baking|pastry|food safety|kitchen|restaurant|catering|menu design|food prep|sanitation)\b/gi
  };

  let bestCategory = 'General / Unknown';
  let maxCount = 0;

  for (const [cat, regex] of Object.entries(categories)) {
    const matches = lower.match(regex);
    const count = matches ? matches.length : 0;
    if (count > maxCount) {
      maxCount = count;
      bestCategory = cat;
    }
  }

  let confidence = 0.60;
  if (maxCount > 0) {
    confidence = 0.60 + Math.min(0.38, (maxCount / 15) * 0.38);
  }

  return {
    category: bestCategory,
    confidence: parseFloat(confidence.toFixed(2))
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS (same API surface as v1)
// ═══════════════════════════════════════════════════════════════════════════════

module.exports = {
  extractTextFromPdf,
  extractContactInfo,
  extractSkills,
  extractWeightedJDSkills,
  compareWeightedSkills,
  calculateWeightedATSScore,
  predictCategoryAndConfidence,
  // v2 additions (internal helpers exposed for testing)
  sanitizePdfText,
  getSectionKey,
  splitSections,
  measureExtractionQuality,
  extractExperience,
  analyzeProjects,
  detectActionVerbs,
  analyzeJobDescription,
  semanticMatch,
  detectStuffing,
  canonicalize,
  extractName
};
