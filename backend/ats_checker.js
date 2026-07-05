const pdfParse = require('pdf-parse');

// Canonical Synonym Groups for Skill Keywords
const SYNONYMS = [
  ['React', 'React.js', 'ReactJS', 'React JS'],
  ['Node.js', 'Node', 'NodeJS', 'Node JS'],
  ['Express.js', 'Express', 'ExpressJS', 'Express JS'],
  ['MongoDB', 'Mongo', 'MongoDB', 'Mongo DB'],
  ['REST APIs', 'REST API', 'RESTful API', 'RESTful APIs', 'REST-API'],
  ['JWT', 'JWT Authentication', 'JWT Auth', 'JSON Web Token'],
  ['Tailwind CSS', 'Tailwind', 'TailwindCSS'],
  ['HTML', 'HTML5'],
  ['CSS', 'CSS3'],
  ['Git', 'GitHub', 'Git/GitHub'],
  ['Docker', 'Docker.io'],
  ['Kubernetes', 'K8s'],
  ['CI/CD', 'CICD'],
  ['Machine Learning', 'ML'],
  ['Deep Learning', 'DL'],
  ['Agile', 'Scrum', 'Agile/Scrum']
];

// Curated skill list for multi-industry ATS matching
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
  
  // --- Construction / Engineering (Mechanical, Civil, etc.) ---
  'Project Management', 'CAD', 'AutoCAD', 'OSHA Safety', 'Blueprints', 'Estimation', 
  'Contractor Management', 'Site Supervision', 'SOLIDWORKS', 'MATLAB', 'Electrical Wiring', 
  'Quality Control', 'HVAC'
];

const SOFT_SKILLS = [
  'communication', 'leadership', 'teamwork', 'collaboration', 'problem solving',
  'critical thinking', 'time management', 'adaptability', 'creativity', 'agile',
  'scrum', 'mentoring', 'organization', 'interpersonal', 'active listening'
];

const CORE_KEYWORDS = [
  'must have', 'required', 'essential', 'mandatory', 'necessary', 'critical',
  'need to have', 'must know', 'expertise in', 'proficiency in', 'experience with',
  'strong knowledge', 'required skills', 'requirements', 'qualifications'
];

const OPTIONAL_KEYWORDS = [
  'good to have', 'nice to have', 'optional', 'plus', 'bonus', 'preferred',
  'desirable', 'advantage', 'beneficial', 'would be a plus', 'nice if you have',
  'additional skills', 'preferred qualifications'
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

/** Canonicalize a skill name by mapping it to its synonym group representative. */
function canonicalize(skillName) {
  const lower = skillName.toLowerCase();
  for (const group of SYNONYMS) {
    if (group.some(syn => syn.toLowerCase() === lower)) {
      return group[0];
    }
  }
  return skillName.trim();
}

/** Extract plain text from PDF buffer. */
async function extractTextFromPdf(buffer) {
  if (!buffer || buffer.length === 0) {
    throw new Error('Hmm, this PDF file seems to be completely empty. Please make sure you saved it correctly.');
  }
  try {
    const data = await pdfParse(buffer);
    const rawText = data.text || '';
    return sanitizePdfText(rawText);
  } catch (err) {
    let reason = "We couldn't read the text in this PDF.";
    if (err.message) {
      const lowerMsg = err.message.toLowerCase();
      if (lowerMsg.includes('password') || lowerMsg.includes('encrypted')) {
        reason = "It looks like this PDF is password-protected or encrypted. Please unlock it and try again.";
      } else if (lowerMsg.includes('invalid') || lowerMsg.includes('corrupt') || lowerMsg.includes('structure')) {
        reason = "The file might be corrupted or not a valid PDF.";
      } else {
        reason = "It might be saved in an unusual format. Try exporting it again directly from Word or Google Docs as a standard PDF.";
      }
    }
    throw new Error(`Oops! ${reason}`);
  }
}

/** Sanitize extracted PDF text to improve ATS parsing accuracy */
function sanitizePdfText(text) {
  if (!text) return '';
  
  return text
    // 1. Remove zero-width spaces and non-printable characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // 2. Fix common PDF ligatures
    .replace(/\uFB00/g, 'ff')
    .replace(/\uFB01/g, 'fi')
    .replace(/\uFB02/g, 'fl')
    .replace(/\uFB03/g, 'ffi')
    .replace(/\uFB04/g, 'ffl')
    .replace(/\uFB05/g, 'st')
    .replace(/\uFB06/g, 'st')
    // 3. Normalize weird quotes and apostrophes
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    // 4. Normalize dashes and hyphens
    .replace(/[\u2010-\u2015]/g, '-')
    // 5. Normalize bullets (different kinds of dots, squares, etc.)
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-')
    // 6. Normalize non-breaking spaces to standard space
    .replace(/\u00A0/g, ' ')
    // 7. Clean up excessive whitespace/tabs without removing newlines
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/** Get section key from a line, robust to spaces and punctuation. */
function getSectionKey(line) {
  const clean = line.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (clean === 'SUMMARY' || clean === 'PROFESSIONALSUMMARY' || clean === 'PROFILE' || clean === 'ABOUTME') {
    return 'summary';
  }
  if (clean === 'EXPERIENCE' || clean === 'WORKEXPERIENCE' || clean === 'PROJECTS' || clean === 'KEYPROJECTS' || clean === 'WORKHISTORY' || clean === 'EMPLOYMENT') {
    return 'experience';
  }
  if (clean === 'SKILLS' || clean === 'TECHNICALSKILLS' || clean === 'CORECOMPETENCIES' || clean === 'EXPERTISE' || clean === 'TECHNOLOGIES') {
    return 'skills';
  }
  if (clean === 'EDUCATION' || clean === 'ACADEMICBACKGROUND' || clean === 'ACADEMICS') {
    return 'education';
  }
  if (clean === 'CERTIFICATIONS' || clean === 'CERTIFICATES' || clean === 'COURSES' || clean === 'AWARDS' || clean === 'GOALS' || clean === 'CERTIFICATIONS&GOALS') {
    return 'certifications';
  }
  return null;
}

/** Segment resume text into logical sections. */
function splitSections(text) {
  const sections = {
    summary: '',
    experience: '',
    skills: '',
    education: '',
    certifications: '',
    other: ''
  };

  if (!text) return sections;

  const lines = text.split('\n');
  let currentSection = 'other';

  lines.forEach(line => {
    const key = getSectionKey(line.trim());
    if (key && line.trim().length < 40) {
      currentSection = key;
    } else {
      sections[currentSection] += line + '\n';
    }
  });

  return sections;
}

/** Extract Candidate Name from first few lines. */
function extractName(text) {
  if (!text) return null;
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i];
    if (line.includes('@') || line.includes('github.com') || line.includes('linkedin.com') || line.includes('+') || /\b(?:resume|cv|curriculum vitae)\b/i.test(line)) {
      continue;
    }
    // Clean leading non-alphabetic characters (e.g., bullets, spaces)
    const cleanLine = line.replace(/^[^a-zA-Z]+/, '').trim();
    if (!cleanLine) continue;
    
    const words = cleanLine.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && words.every(w => /^[A-Z]/.test(w) || w.toLowerCase() === 'de')) {
      return cleanLine;
    }
  }
  return null;
}

/** Extract basic contact info using regular expressions. */
function extractContactInfo(text) {
  if (!text) {
    return { name: null, email: null, phone: null, linkedin: null, github: null, portfolio: null };
  }

  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const emailMatch = text.match(emailRegex);

  // Phone regex matches +91 91136 72342, 9876543210, etc., avoiding years
  const phoneRegex = /(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}/g;
  const phoneMatches = text.match(phoneRegex) || [];
  let phone = null;
  for (const m of phoneMatches) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) {
      phone = m.trim();
      break;
    }
  }

  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi;
  const githubRegex = /github\.com\/[a-zA-Z0-9_-]+/gi;

  const linkedin = text.match(linkedinRegex);
  const github = text.match(githubRegex);

  // Extract custom portfolio website
  let portfolio = null;
  const urlRegex = /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9_-]+\.[a-z]{2,6})(?:\/[^\s]*)?/gi;
  let match;
  while ((match = urlRegex.exec(text)) !== null) {
    const full = match[0];
    const domain = match[1].toLowerCase();
    if (!domain.includes('linkedin') && !domain.includes('github') && !domain.includes('gmail') && !domain.includes('email') && !domain.includes('render') && !domain.includes('vercel') && !domain.includes('netlify')) {
      portfolio = full;
      break;
    }
  }

  return {
    name: extractName(text),
    email: emailMatch ? emailMatch[0].toLowerCase() : null,
    phone: phone,
    linkedin: linkedin ? `https://www.${linkedin[0]}` : null,
    github: github ? `https://www.${github[0]}` : null,
    portfolio: portfolio
  };
}

/** Match text against our list of predefined and dynamically extracted skills, utilizing canonical synonym groups. */
function extractSkills(text) {
  if (!text) return [];
  const foundSkills = new Set();
  const lowerText = text.toLowerCase();
  
  // 1. Check all canonical synonym groups
  SYNONYMS.forEach(group => {
    const matched = group.some(syn => {
      const pattern = syn.toLowerCase();
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Word boundary regex unless it has special chars like .js
      const regex = /[a-zA-Z0-9+#]/.test(pattern.charAt(0)) && /[a-zA-Z0-9+#]/.test(pattern.charAt(pattern.length - 1))
        ? new RegExp(`\\b${escaped}\\b`, 'i')
        : new RegExp(escaped, 'i');
      return regex.test(lowerText);
    });
    if (matched) {
      foundSkills.add(group[0]);
    }
  });

  // 2. Check individual skill dictionary skills not covered by synonyms
  SKILL_LIST.forEach(skill => {
    const canonical = canonicalize(skill);
    if (foundSkills.has(canonical)) return;

    const pattern = skill.toLowerCase();
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = /[a-zA-Z0-9+#]/.test(pattern.charAt(0)) && /[a-zA-Z0-9+#]/.test(pattern.charAt(pattern.length - 1))
      ? new RegExp(`\\b${escaped}\\b`, 'i')
      : new RegExp(escaped, 'i');

    if (regex.test(lowerText)) {
      foundSkills.add(canonical);
    }
  });

  // 3. Dynamic multi-word term extraction
  const phraseRegex = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,2})\b/g;
  let match;
  while ((match = phraseRegex.exec(text)) !== null) {
    const phrase = match[0];
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

    // A. Match against synonym groups
    SYNONYMS.forEach(group => {
      const matched = group.some(syn => {
        const pattern = syn.toLowerCase();
        const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = /[a-zA-Z0-9+#]/.test(pattern.charAt(0)) && /[a-zA-Z0-9+#]/.test(pattern.charAt(pattern.length - 1))
          ? new RegExp(`\\b${escaped}\\b`, 'i')
          : new RegExp(escaped, 'i');
        return regex.test(line);
      });
      if (matched) {
        allSet.add(group[0]);
        if (isCore) coreSet.add(group[0]);
        else if (isOptional) optionalSet.add(group[0]);
      }
    });

    // B. Match against static list
    SKILL_LIST.forEach(skill => {
      const canonical = canonicalize(skill);
      if (allSet.has(canonical)) return;

      const pattern = skill.toLowerCase();
      const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = /[a-zA-Z0-9+#]/.test(pattern.charAt(0)) && /[a-zA-Z0-9+#]/.test(pattern.charAt(pattern.length - 1))
        ? new RegExp(`\\b${escaped}\\b`, 'i')
        : new RegExp(escaped, 'i');

      if (regex.test(line)) {
        allSet.add(canonical);
        if (isCore) coreSet.add(canonical);
        else if (isOptional) optionalSet.add(canonical);
      }
    });

    // C. Dynamic capitalized terms
    const phraseRegex = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+){1,2})\b/g;
    let match;
    while ((match = phraseRegex.exec(line)) !== null) {
      const phrase = match[0];
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

/** Compare resume skills against job description skills. */
function compareWeightedSkills(resumeSkills, coreSkills, optionalSkills) {
  const resumeSet = new Set(resumeSkills.map(s => s.toLowerCase()));

  const matchedCoreSkills = coreSkills.filter(s => resumeSet.has(s.toLowerCase()));
  const missingCoreSkills = coreSkills.filter(s => !resumeSet.has(s.toLowerCase()));

  const matchedOptionalSkills = optionalSkills.filter(s => resumeSet.has(s.toLowerCase()));
  const missingOptionalSkills = optionalSkills.filter(s => !resumeSet.has(s.toLowerCase()));

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

/** Analyze projects and experience in depth. */
function analyzeProjects(experienceText) {
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

  if (!experienceText) return result;

  const lines = experienceText.split('\n');
  lines.forEach(line => {
    const clean = line.trim();
    if ((clean.includes('—') || clean.includes('|') || clean.includes('•') || clean.startsWith('-')) && clean.length > 10 && clean.length < 120) {
      const titleCandidate = clean.split(/—|\||:/)[0].trim().replace(/^[•\-\*\s]+/, '');
      if (titleCandidate.length > 3 && titleCandidate.length < 35 && /[A-Z]/.test(titleCandidate)) {
        if (!result.projectNames.includes(titleCandidate)) {
          result.projectNames.push(titleCandidate);
        }
      }
    }
  });

  result.projectCount = Math.max(result.projectNames.length, (experienceText.match(/[•\-\*]/g) || []).length / 4);
  result.projectCount = Math.round(result.projectCount);
  if (result.projectCount === 0 && experienceText.trim().length > 100) {
    result.projectCount = 1;
  }

  const lower = experienceText.toLowerCase();
  if (/\b(?:vercel|netlify|render|heroku|railway|deployed|live on)\b/i.test(lower)) {
    result.deployment = true;
  }
  if (/\b(?:machine learning|deep learning|classifier|regression|scikit-learn|tensorflow|pytorch|model|predict)\b/i.test(lower)) {
    result.machineLearning = true;
  }
  if (/\b(?:jwt|authentication|auth|login|oauth|google login|token)\b/i.test(lower)) {
    result.authentication = true;
  }
  const dbs = [];
  if (lower.includes('mongodb')) dbs.push('MongoDB');
  if (lower.includes('mysql')) dbs.push('MySQL');
  if (lower.includes('postgresql') || lower.includes('postgres')) dbs.push('PostgreSQL');
  if (lower.includes('sqlite')) dbs.push('SQLite');
  if (lower.includes('redis')) dbs.push('Redis');
  if (dbs.length > 0) {
    result.database = true;
    result.technologies.push(...dbs);
  }
  if (/\b(?:aws|amazon web services|gcp|google cloud|azure|docker|kubernetes|cloud)\b/i.test(lower)) {
    result.cloud = true;
  }

  return result;
}

/** Calculate overall weighted ATS score and explainability metadata. */
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

  // 1. Technical Skills Score (35%)
  const coreScore = totalCore > 0 ? (matchedCoreSkills.length / totalCore) * 100 : 0;
  const optionalScore = totalOptional > 0 ? (matchedOptionalSkills.length / totalOptional) * 100 : 0;

  let coreWeight = 0.7;
  let optionalWeight = 0.3;
  if (totalCore === 0) {
    coreWeight = 0;
    optionalWeight = 1.0;
  } else if (totalOptional === 0) {
    coreWeight = 1.0;
    optionalWeight = 0;
  }
  const techScore = (coreScore * coreWeight) + (optionalScore * optionalWeight);

  // Fallback to simple keyword match score if raw resumeText is not provided (e.g. in unit tests)
  if (!resumeText || !resumeText.trim()) {
    const finalScore = Math.round(techScore);
    let matchTier = 'Weak Match';
    let matchTierColor = 'danger';
    if (finalScore >= 80) {
      matchTier = 'Strong Match';
      matchTierColor = 'success';
    } else if (finalScore >= 50) {
      matchTier = 'Good Match';
      matchTierColor = 'warning';
    }
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
  const projAnalysis = analyzeProjects(sections.experience);
  const contactInfo = extractContactInfo(resumeText);

  // 2. Projects/Experience Score (25%)
  let projScore = 0;
  if (projAnalysis.projectCount > 0) {
    projScore += 10; // sections detected
    projScore += Math.min(10, projAnalysis.projectCount * 5); // project weight
    if (projAnalysis.deployment) projScore += 2;
    if (projAnalysis.database) projScore += 1;
    if (projAnalysis.cloud) projScore += 1;
    if (projAnalysis.authentication || projAnalysis.machineLearning) projScore += 1;
  }
  projScore = Math.min(100, (projScore / 25) * 100);

  // 3. Education Score (10%)
  let eduScore = 0;
  if (sections.education) {
    eduScore += 50;
    const lowerEdu = sections.education.toLowerCase();
    if (/\b(?:bca|mca|btech|mtech|bachelor|master|degree|university|college|gpa|cgpa)\b/i.test(lowerEdu)) {
      eduScore += 50;
    }
  }

  // 4. Keyword Match Score (15%)
  let keywordScore = 0;
  if (similarityScore !== null && similarityScore !== undefined) {
    keywordScore = similarityScore;
  } else {
    keywordScore = techScore;
  }

  // 5. Structure Score (10%)
  let structScore = 0;
  if (sections.summary) structScore += 15;
  if (sections.experience) structScore += 25;
  if (sections.skills) structScore += 20;
  if (sections.education) structScore += 20;
  if (contactInfo.email) structScore += 10;
  if (contactInfo.phone) structScore += 10;

  // 6. Soft Skills Score (5%)
  const jdSoftSkills = SOFT_SKILLS.filter(skill => {
    const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
    return regex.test(jobDescription.toLowerCase());
  });

  let softScore = 100;
  if (jdSoftSkills.length > 0) {
    const lowerResume = resumeText.toLowerCase();
    const matchedSoft = jdSoftSkills.filter(skill => {
      const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'i');
      return regex.test(lowerResume);
    });
    softScore = (matchedSoft.length / jdSoftSkills.length) * 100;
  }

  // Calculate Weighted Sum
  const rawScore = (techScore * 0.35) +
                   (projScore * 0.25) +
                   (eduScore * 0.10) +
                   (keywordScore * 0.15) +
                   (structScore * 0.10) +
                   (softScore * 0.05);
                   
  // Realistic final score calibration (55 to 98)
  let finalScore = Math.round(rawScore);
  // Ensure the score range remains realistic
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

  // Context-aware Resume Summary
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

  // Generate evidence-based key strengths
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

  // Generate specific optimization steps (never invent missing requirements)
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

  // Calculate Parser/Completeness Confidence
  // Based on: sections (30%), contacts (20%), word count completeness (20%), classification confidence (30%)
  const numSections = Object.values(sections).filter(Boolean).length;
  const numContacts = Object.values(contactInfo).filter(Boolean).length;
  const wordCount = resumeText.split(/\s+/).length;
  
  const sectionConf = (numSections / 5) * 30;
  const contactConf = (numContacts / 5) * 20;
  const wordConf = wordCount > 200 && wordCount < 900 ? 20 : 10;
  // Assume a default ML confidence if not present
  const mlConf = 30; // default 30% contribution

  const confidenceScore = Math.min(98, Math.round(sectionConf + contactConf + wordConf + mlConf));

  return {
    atsScore: finalScore,
    explanation: `${matchTier}! Matched ${matchedCoreSkills.length}/${totalCore} core keywords.`,
    confidence: confidenceScore,
    details: {
      matchTier,
      matchTierColor,
      summary,
      keyStrengths: keyStrengths.slice(0, 4),
      criticalGaps: criticalGaps.slice(0, 4)
    }
  };
}

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

  // Calculate confidence score (between 0.60 and 0.98) based on match count
  let confidence = 0.60;
  if (maxCount > 0) {
    confidence = 0.60 + Math.min(0.38, (maxCount / 15) * 0.38);
  }
  
  return {
    category: bestCategory,
    confidence: parseFloat(confidence.toFixed(2))
  };
}

module.exports = {
  extractTextFromPdf,
  extractContactInfo,
  extractSkills,
  extractWeightedJDSkills,
  compareWeightedSkills,
  calculateWeightedATSScore,
  predictCategoryAndConfidence
};
