/**
 * ATS Checker v2 — Comprehensive Test Suite (50+ test cases)
 *
 * Covers all 14 improvement areas:
 * - Text cleaning & sanitization
 * - Section detection (60+ variations)
 * - Contact detection (international phones, edge cases)
 * - Skill extraction (synonyms, abbreviations, anti-stuffing)
 * - Semantic matching (concept-level)
 * - Experience parsing (date formats, structured entries)
 * - Project detection (accurate counting, tech stack)
 * - Action verb scoring
 * - JD analysis (Required vs Preferred)
 * - Scoring (new 30/20/15/10/10/5/5/5 weights)
 * - Error handling
 * - Integration (full pipeline)
 */

const {
    extractSkills,
    extractWeightedJDSkills,
    compareWeightedSkills,
    calculateWeightedATSScore,
    predictCategoryAndConfidence,
    extractContactInfo,
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
} = require('../ats_checker');

// ═══════════════════════════════════════════════════════════════════════════════
// 1. TEXT CLEANING / SANITIZATION
// ═══════════════════════════════════════════════════════════════════════════════

describe('sanitizePdfText', () => {
    test('should fix PDF ligatures (fi, fl, ff, ffi)', () => {
        const text = 'pro\uFB01le of\uFB02ine e\uFB00ort coe\uFB03cient';
        const result = sanitizePdfText(text);
        expect(result).toContain('profile');
        expect(result).toContain('offline');
        expect(result).toContain('effort');
        expect(result).toContain('coefficient');
    });

    test('should remove soft hyphens', () => {
        const text = 'devel\u00ADoper expe\u00ADrience';
        const result = sanitizePdfText(text);
        expect(result).toContain('developer');
        expect(result).toContain('experience');
    });

    test('should remove zero-width spaces', () => {
        const text = 'Java\u200BScript React\u200B.js';
        const result = sanitizePdfText(text);
        expect(result).toContain('JavaScript');
    });

    test('should normalize fancy quotes and dashes', () => {
        const text = '\u201CHello\u201D \u2018World\u2019 2020\u20132023';
        const result = sanitizePdfText(text);
        expect(result).toContain('"Hello"');
        expect(result).toContain("'World'");
        expect(result).toContain('2020-2023');
    });

    test('should remove page numbers between newlines', () => {
        const text = 'Some text\n 2 \nMore text\n Page 1 of 3 \nEnd';
        const result = sanitizePdfText(text);
        expect(result).not.toMatch(/Page 1 of 3/i);
    });

    test('should fix hyphenated line breaks', () => {
        const text = 'devel-\noper experi-\nence';
        const result = sanitizePdfText(text);
        expect(result).toContain('developer');
        expect(result).toContain('experience');
    });

    test('should collapse excessive newlines', () => {
        const text = 'Line1\n\n\n\n\nLine2';
        const result = sanitizePdfText(text);
        expect(result).toBe('Line1\n\nLine2');
    });

    test('should normalize bullets to dashes', () => {
        const text = '\u2022 Item 1\n\u2219 Item 2';
        const result = sanitizePdfText(text);
        expect(result).toContain('- Item 1');
        expect(result).toContain('- Item 2');
    });

    test('should handle empty and null input', () => {
        expect(sanitizePdfText('')).toBe('');
        expect(sanitizePdfText(null)).toBe('');
        expect(sanitizePdfText(undefined)).toBe('');
    });

    test('should normalize non-breaking spaces', () => {
        const text = 'React\u00A0Native\u00A0Developer';
        const result = sanitizePdfText(text);
        expect(result).toBe('React Native Developer');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. SECTION DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

describe('getSectionKey', () => {
    test('should detect summary variations', () => {
        expect(getSectionKey('Summary')).toBe('summary');
        expect(getSectionKey('Professional Summary')).toBe('summary');
        expect(getSectionKey('PROFILE')).toBe('summary');
        expect(getSectionKey('Career Objective')).toBe('summary');
        expect(getSectionKey('About Me')).toBe('summary');
        expect(getSectionKey('Executive Summary')).toBe('summary');
        expect(getSectionKey('Personal Statement')).toBe('summary');
    });

    test('should detect experience variations', () => {
        expect(getSectionKey('Experience')).toBe('experience');
        expect(getSectionKey('Work Experience')).toBe('experience');
        expect(getSectionKey('Professional Experience')).toBe('experience');
        expect(getSectionKey('Employment History')).toBe('experience');
        expect(getSectionKey('WORK HISTORY')).toBe('experience');
        expect(getSectionKey('Relevant Experience')).toBe('experience');
    });

    test('should detect project variations', () => {
        expect(getSectionKey('Projects')).toBe('projects');
        expect(getSectionKey('Academic Projects')).toBe('projects');
        expect(getSectionKey('Personal Projects')).toBe('projects');
        expect(getSectionKey('Key Projects')).toBe('projects');
        expect(getSectionKey('Technical Projects')).toBe('projects');
        expect(getSectionKey('Side Projects')).toBe('projects');
    });

    test('should detect skill variations', () => {
        expect(getSectionKey('Skills')).toBe('skills');
        expect(getSectionKey('Technical Skills')).toBe('skills');
        expect(getSectionKey('Core Competencies')).toBe('skills');
        expect(getSectionKey('Key Skills')).toBe('skills');
        expect(getSectionKey('Professional Skills')).toBe('skills');
        expect(getSectionKey('Technologies')).toBe('skills');
        expect(getSectionKey('Areas of Expertise')).toBe('skills');
    });

    test('should detect education variations', () => {
        expect(getSectionKey('Education')).toBe('education');
        expect(getSectionKey('Academic Background')).toBe('education');
        expect(getSectionKey('Academic Qualification')).toBe('education');
        expect(getSectionKey('EDUCATIONAL BACKGROUND')).toBe('education');
    });

    test('should detect certifications variations', () => {
        expect(getSectionKey('Certifications')).toBe('certifications');
        expect(getSectionKey('Professional Certifications')).toBe('certifications');
        expect(getSectionKey('Courses')).toBe('certifications');
        expect(getSectionKey('Training')).toBe('certifications');
        expect(getSectionKey('Coursework')).toBe('certifications');
    });

    test('should detect achievements variations', () => {
        expect(getSectionKey('Achievements')).toBe('achievements');
        expect(getSectionKey('Awards')).toBe('achievements');
        expect(getSectionKey('Honors')).toBe('achievements');
        expect(getSectionKey('Publications')).toBe('achievements');
    });

    test('should detect languages variations', () => {
        expect(getSectionKey('Languages')).toBe('languages');
        expect(getSectionKey('Languages Known')).toBe('languages');
        expect(getSectionKey('Language Proficiency')).toBe('languages');
    });

    test('should return null for non-section lines', () => {
        expect(getSectionKey('Built a REST API with Node.js')).toBeNull();
        expect(getSectionKey('')).toBeNull();
        expect(getSectionKey('This is a very long line that is not a section header and should not match any section pattern in the system')).toBeNull();
    });

    test('should handle mixed case and special characters', () => {
        expect(getSectionKey('--- SKILLS ---')).toBe('skills');
        expect(getSectionKey('== Education ==')).toBe('education');
        expect(getSectionKey('**Experience**')).toBe('experience');
    });
});

describe('splitSections', () => {
    test('should split text into correct sections', () => {
        const text = 'John Doe\n\nSummary\nExperienced developer\n\nSkills\nReact, Node.js\n\nExperience\nSoftware Engineer at Company\n\nProjects\nATS Analyzer\n\nEducation\nB.Tech CS';
        const sections = splitSections(text);
        expect(sections.summary).toContain('Experienced developer');
        expect(sections.skills).toContain('React');
        expect(sections.experience).toContain('Software Engineer');
        expect(sections.projects).toContain('ATS Analyzer');
        expect(sections.education).toContain('B.Tech');
    });

    test('should handle empty text', () => {
        const sections = splitSections('');
        expect(sections.summary).toBe('');
        expect(sections.experience).toBe('');
    });

    test('should put unrecognized content in other', () => {
        const text = 'Random header line\nSome content here';
        const sections = splitSections(text);
        expect(sections.other).toContain('Some content here');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. CONTACT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

describe('extractContactInfo', () => {
    test('should extract email address', () => {
        const text = 'Contact me at john.doe@example.com';
        const info = extractContactInfo(text);
        expect(info.email).toBe('john.doe@example.com');
    });

    test('should extract phone with country code +91', () => {
        const text = 'Phone: +91 98765 43210\nemail: test@test.com';
        const info = extractContactInfo(text);
        expect(info.phone).toContain('91');
        expect(info.phone).toContain('98765');
    });

    test('should extract phone with country code +1', () => {
        const text = 'Phone: +1-555-123-4567\nemail: test@test.com';
        const info = extractContactInfo(text);
        expect(info.phone).toBeTruthy();
    });

    test('should extract phone with country code +44', () => {
        const text = 'Phone: +44 7911 123456\nemail: test@test.com';
        const info = extractContactInfo(text);
        expect(info.phone).toBeTruthy();
    });

    test('should not match years as phone numbers', () => {
        const text = 'Graduated in 2023 from MIT';
        const info = extractContactInfo(text);
        expect(info.phone).toBeNull();
    });

    test('should extract LinkedIn URL', () => {
        const text = 'LinkedIn: https://www.linkedin.com/in/johndoe';
        const info = extractContactInfo(text);
        expect(info.linkedin).toContain('linkedin.com/in/johndoe');
    });

    test('should extract GitHub URL', () => {
        const text = 'GitHub: github.com/johndoe';
        const info = extractContactInfo(text);
        expect(info.github).toContain('github.com/johndoe');
    });

    test('should handle missing contact info gracefully', () => {
        const text = 'Just some random text without contact info';
        const info = extractContactInfo(text);
        expect(info.email).toBeNull();
        expect(info.phone).toBeNull();
    });

    test('should handle null input', () => {
        const info = extractContactInfo(null);
        expect(info.email).toBeNull();
        expect(info.phone).toBeNull();
        expect(info.name).toBeNull();
    });
});

describe('extractName', () => {
    test('should extract name from first lines', () => {
        const text = 'John Michael Doe\njohn@example.com\n+1-555-123-4567';
        expect(extractName(text)).toBe('John Michael Doe');
    });

    test('should skip email and URL lines', () => {
        const text = 'john@example.com\ngithub.com/john\nJohn Doe';
        expect(extractName(text)).toBe('John Doe');
    });

    test('should return null if no name found', () => {
        expect(extractName('just some skills: react, node')).toBeNull();
        expect(extractName(null)).toBeNull();
        expect(extractName('')).toBeNull();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. SKILL EXTRACTION (synonyms, abbreviations)
// ═══════════════════════════════════════════════════════════════════════════════

describe('canonicalize', () => {
    test('should map synonyms to canonical form', () => {
        expect(canonicalize('ReactJS')).toBe('React');
        expect(canonicalize('NodeJS')).toBe('Node.js');
        expect(canonicalize('ExpressJS')).toBe('Express.js');
        expect(canonicalize('Mongo')).toBe('MongoDB');
        expect(canonicalize('K8s')).toBe('Kubernetes');
        expect(canonicalize('TS')).toBe('TypeScript');
        expect(canonicalize('JS')).toBe('JavaScript');
    });

    test('should return original for unknown skills', () => {
        expect(canonicalize('SomeUnknownSkill')).toBe('SomeUnknownSkill');
    });

    test('should be case-insensitive', () => {
        expect(canonicalize('reactjs')).toBe('React');
        expect(canonicalize('NODEJS')).toBe('Node.js');
    });
});

describe('extractSkills', () => {
    test('should extract known skills from resume text', () => {
        const text = 'Experienced developer in JavaScript, React, Node.js, and Python.';
        const skills = extractSkills(text);
        expect(skills).toContain('JavaScript');
        expect(skills).toContain('React');
        expect(skills).toContain('Node.js');
        expect(skills).toContain('Python');
        expect(skills).not.toContain('Docker');
    });

    test('should match skills case-insensitively', () => {
        const text = 'skilful in javascript, REACT, and DOCKER';
        const skills = extractSkills(text);
        expect(skills).toContain('JavaScript');
        expect(skills).toContain('React');
        expect(skills).toContain('Docker');
    });

    test('should resolve synonyms to canonical names', () => {
        const text = 'I know NodeJS, ReactJS, ExpressJS, Mongo, and TailwindCSS';
        const skills = extractSkills(text);
        expect(skills).toContain('Node.js');
        expect(skills).toContain('React');
        expect(skills).toContain('Express.js');
        expect(skills).toContain('MongoDB');
        expect(skills).toContain('Tailwind CSS');
    });

    test('should match abbreviations', () => {
        const text = 'Experienced in ML, AI, NLP, and CI/CD pipelines with K8s';
        const skills = extractSkills(text);
        expect(skills).toContain('Machine Learning');
        expect(skills).toContain('Artificial Intelligence');
        expect(skills).toContain('Natural Language Processing');
        expect(skills).toContain('CI/CD');
        expect(skills).toContain('Kubernetes');
    });

    test('should extract multi-industry skills', () => {
        const text = 'Experience with Classroom Management, Lesson Planning, and Curriculum Design';
        const skills = extractSkills(text);
        expect(skills).toContain('Classroom Management');
        expect(skills).toContain('Lesson Planning');
    });

    test('should handle empty input', () => {
        expect(extractSkills('')).toEqual([]);
        expect(extractSkills(null)).toEqual([]);
    });

    test('should not produce duplicate skills', () => {
        const text = 'React React.js ReactJS react — all the same thing';
        const skills = extractSkills(text);
        const reactCount = skills.filter(s => s === 'React').length;
        expect(reactCount).toBe(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. SEMANTIC MATCHING
// ═══════════════════════════════════════════════════════════════════════════════

describe('semanticMatch', () => {
    test('"Built REST APIs" should match "REST API Development"', () => {
        expect(semanticMatch('built rest apis for the application', 'REST API Development')).toBe(true);
    });

    test('"Implemented JWT authentication" should match "Authentication"', () => {
        expect(semanticMatch('implemented jwt authentication for user login', 'Authentication')).toBe(true);
    });

    test('"Deployed on AWS" should match "Cloud Deployment"', () => {
        expect(semanticMatch('deployed the application on aws ec2', 'Cloud Deployment')).toBe(true);
    });

    test('"Used MongoDB for data storage" should match "Database"', () => {
        expect(semanticMatch('used mongodb for data storage and crud operations', 'Database')).toBe(true);
    });

    test('should not match unrelated concepts', () => {
        expect(semanticMatch('cooked pasta and managed kitchen staff', 'REST API Development')).toBe(false);
    });

    test('partial keyword matching with 60% threshold', () => {
        expect(semanticMatch('managed agile sprint planning and backlog', 'Agile Development')).toBe(true);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ANTI-STUFFING
// ═══════════════════════════════════════════════════════════════════════════════

describe('detectStuffing', () => {
    test('should return 1.0 for normal text', () => {
        const text = 'Experienced developer with React and Node.js skills';
        expect(detectStuffing(text)).toBe(1.0);
    });

    test('should return < 1.0 for stuffed text', () => {
        const text = 'React React React React React React React React React React React React';
        const result = detectStuffing(text);
        expect(result).toBeLessThan(1.0);
    });

    test('should handle empty input', () => {
        expect(detectStuffing('')).toBe(1.0);
        expect(detectStuffing(null)).toBe(1.0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. JD SKILL EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

describe('extractWeightedJDSkills', () => {
    test('should separate core and optional skills based on keywords', () => {
        const jdText = 'We are hiring! Required skills: JavaScript, React. Nice to have: Docker, AWS.';
        const { coreSkills, optionalSkills } = extractWeightedJDSkills(jdText);
        expect(coreSkills).toContain('JavaScript');
        expect(coreSkills).toContain('React');
        expect(optionalSkills).toContain('Docker');
        expect(optionalSkills).toContain('AWS');
    });

    test('should default all to core if no keywords are present', () => {
        const jdText = 'Skills needed: JavaScript, Python.';
        const { coreSkills, optionalSkills } = extractWeightedJDSkills(jdText);
        expect(coreSkills).toContain('JavaScript');
        expect(coreSkills).toContain('Python');
        expect(optionalSkills).toHaveLength(0);
    });

    test('should handle empty JD', () => {
        const { coreSkills, optionalSkills } = extractWeightedJDSkills('');
        expect(coreSkills).toHaveLength(0);
        expect(optionalSkills).toHaveLength(0);
    });

    test('should extract skills from complex multi-line JD', () => {
        const jdText = `
            Senior Full Stack Developer

            Requirements:
            - Must have experience with React and Node.js
            - Required: MongoDB, Express.js
            - Strong knowledge of REST APIs

            Nice to have:
            - Docker and Kubernetes experience
            - AWS certification is a plus
        `;
        const { coreSkills, optionalSkills } = extractWeightedJDSkills(jdText);
        expect(coreSkills.length).toBeGreaterThanOrEqual(3);
        expect(optionalSkills.length).toBeGreaterThanOrEqual(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 8. SKILL COMPARISON (with semantic matching)
// ═══════════════════════════════════════════════════════════════════════════════

describe('compareWeightedSkills', () => {
    test('should calculate correct match counts and percentages', () => {
        const resumeSkills = ['JavaScript', 'React', 'Docker'];
        const coreSkills = ['JavaScript', 'React', 'Node.js'];
        const optionalSkills = ['Docker', 'AWS'];

        const result = compareWeightedSkills(resumeSkills, coreSkills, optionalSkills);

        expect(result.matchedCoreSkills).toContain('JavaScript');
        expect(result.matchedCoreSkills).toContain('React');
        expect(result.missingCoreSkills).toContain('Node.js');
        expect(result.matchedOptionalSkills).toContain('Docker');
        expect(result.missingOptionalSkills).toContain('AWS');
        expect(result.coreMatchPercentage).toBe(67);
        expect(result.optionalMatchPercentage).toBe(50);
    });

    test('should match via synonyms (NodeJS == Node.js)', () => {
        const resumeSkills = ['Node.js'];
        const coreSkills = ['NodeJS'];
        const result = compareWeightedSkills(resumeSkills, coreSkills, []);
        expect(result.matchedCoreSkills).toContain('NodeJS');
        expect(result.missingCoreSkills).toHaveLength(0);
    });

    test('should use semantic matching when resumeText is provided', () => {
        const resumeSkills = ['React'];
        const coreSkills = ['Authentication'];
        const resumeText = 'Built a login system with JWT authentication and session management';
        const result = compareWeightedSkills(resumeSkills, coreSkills, [], resumeText);
        expect(result.matchedCoreSkills).toContain('Authentication');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 9. EXPERIENCE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

describe('extractExperience', () => {
    test('should extract structured entries with date ranges', () => {
        const text = `
Software Engineer | TechCorp | Jan 2022 - Present
- Built REST APIs using Node.js and Express
- Deployed applications on AWS EC2

Junior Developer | StartupXYZ | Jun 2020 - Dec 2021
- Developed React frontend components
- Integrated MongoDB for data storage
        `;
        const entries = extractExperience(text);
        expect(entries.length).toBeGreaterThanOrEqual(2);
    });

    test('should recognize various date formats', () => {
        const text = `
Role A | Company A | February 2023 - Present
- Did things

Role B | Company B | 2020 - 2022
- Did other things
        `;
        const entries = extractExperience(text);
        expect(entries.length).toBeGreaterThanOrEqual(2);
    });

    test('should handle empty input', () => {
        expect(extractExperience('')).toEqual([]);
        expect(extractExperience(null)).toEqual([]);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 10. PROJECT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

describe('analyzeProjects', () => {
    test('should detect projects from projects section', () => {
        const projectsText = `
ATS Resume Analyzer — React, Node.js, Express
- Built a full-stack ATS resume checking application
- Deployed on Vercel and Render

FraudShield AI — Python, TensorFlow
- Implemented ML-based fraud detection
- Achieved 95% accuracy on test dataset
        `;
        const result = analyzeProjects(projectsText, '');
        expect(result.projectCount).toBeGreaterThanOrEqual(2);
        expect(result.deployment).toBe(true);
        expect(result.machineLearning).toBe(true);
    });

    test('should detect database and cloud usage', () => {
        const text = 'Used MongoDB for storage. Deployed on AWS EC2 with Docker containers. JWT authentication implemented.';
        const result = analyzeProjects(text, '');
        expect(result.database).toBe(true);
        expect(result.cloud).toBe(true);
        expect(result.authentication).toBe(true);
    });

    test('should handle empty input', () => {
        const result = analyzeProjects('', '');
        expect(result.projectCount).toBe(0);
        expect(result.deployment).toBe(false);
    });

    test('should not count skill lists as projects', () => {
        const text = 'React, Node.js, Express, MongoDB, Docker, AWS, Python, Java';
        const result = analyzeProjects('', text);
        // Should give at most 1 estimated project from bullet estimation
        expect(result.projectCount).toBeLessThanOrEqual(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 11. ACTION VERB SCORING
// ═══════════════════════════════════════════════════════════════════════════════

describe('detectActionVerbs', () => {
    test('should detect action verbs in text', () => {
        const text = 'Built a REST API. Designed the database schema. Implemented JWT authentication. Deployed on AWS. Led a team of 5 developers.';
        const result = detectActionVerbs(text);
        expect(result.verbs).toContain('built');
        expect(result.verbs).toContain('designed');
        expect(result.verbs).toContain('implemented');
        expect(result.verbs).toContain('deployed');
        expect(result.verbs).toContain('led');
        expect(result.score).toBeGreaterThan(0);
    });

    test('should detect measurable achievements', () => {
        const text = 'Reduced load time by 40%. Served 10000 users. Improved response time by 3x.';
        const result = detectActionVerbs(text);
        expect(result.measurableCount).toBeGreaterThan(0);
    });

    test('should return 0 for empty text', () => {
        const result = detectActionVerbs('');
        expect(result.score).toBe(0);
        expect(result.verbs).toEqual([]);
    });

    test('should handle text without action verbs', () => {
        const text = 'Skills: React, Node.js, MongoDB';
        const result = detectActionVerbs(text);
        expect(result.verbs.length).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 12. JD ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

describe('analyzeJobDescription', () => {
    test('should detect structured JD with required and preferred', () => {
        const text = 'Required: React, Node.js. Preferred: Docker, AWS.';
        const result = analyzeJobDescription(text);
        expect(result.hasStructure).toBe(true);
        expect(result.requiredWeight).toBeGreaterThan(1.0);
        expect(result.preferredWeight).toBeLessThan(1.0);
    });

    test('should detect JD with only required keywords', () => {
        const text = 'Must have experience with React and Node.js';
        const result = analyzeJobDescription(text);
        expect(result.hasStructure).toBe(true);
        expect(result.requiredWeight).toBeGreaterThanOrEqual(1.0);
    });

    test('should return equal weights for unstructured JD', () => {
        const text = 'Looking for a developer who knows React and Node.js';
        const result = analyzeJobDescription(text);
        expect(result.hasStructure).toBe(false);
        expect(result.requiredWeight).toBe(1.0);
        expect(result.preferredWeight).toBe(1.0);
    });

    test('should handle empty input', () => {
        const result = analyzeJobDescription('');
        expect(result.hasStructure).toBe(false);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 13. QUALITY MEASUREMENT
// ═══════════════════════════════════════════════════════════════════════════════

describe('measureExtractionQuality', () => {
    test('should give high score for well-extracted text', () => {
        const text = `
John Doe
john@example.com
+1-555-123-4567

Summary
Experienced full-stack developer with 5 years of experience.

Skills
JavaScript, React, Node.js, MongoDB, Docker, AWS

Experience
Software Engineer at TechCorp (Jan 2020 - Present)
- Built REST APIs
- Deployed on AWS

Education
B.Tech Computer Science, MIT (2016-2020)
        `;
        const score = measureExtractionQuality(text);
        expect(score).toBeGreaterThan(60);
    });

    test('should give low score for garbage text', () => {
        const score = measureExtractionQuality('x y z');
        expect(score).toBeLessThan(30);
    });

    test('should give 0 for empty text', () => {
        expect(measureExtractionQuality('')).toBe(0);
        expect(measureExtractionQuality(null)).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 14. WEIGHTED ATS SCORING
// ═══════════════════════════════════════════════════════════════════════════════

describe('calculateWeightedATSScore', () => {
    test('should compute score using keyword-only fallback (no resumeText)', () => {
        const comparison = {
            matchedCoreSkills: ['JavaScript', 'React'],
            missingCoreSkills: ['Node.js'],
            matchedOptionalSkills: ['Docker'],
            missingOptionalSkills: ['AWS']
        };

        const { atsScore, explanation } = calculateWeightedATSScore(comparison);
        expect(atsScore).toBeGreaterThanOrEqual(55);
        expect(atsScore).toBeLessThanOrEqual(70);
        expect(explanation).toBeTruthy();
    });

    test('should produce higher scores for better matches', () => {
        const goodComparison = {
            matchedCoreSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
            missingCoreSkills: [],
            matchedOptionalSkills: ['Docker'],
            missingOptionalSkills: []
        };
        const weakComparison = {
            matchedCoreSkills: ['JavaScript'],
            missingCoreSkills: ['React', 'Node.js', 'MongoDB'],
            matchedOptionalSkills: [],
            missingOptionalSkills: ['Docker']
        };

        const { atsScore: goodScore } = calculateWeightedATSScore(goodComparison);
        const { atsScore: weakScore } = calculateWeightedATSScore(weakComparison);
        expect(goodScore).toBeGreaterThan(weakScore);
    });

    test('should return 0 for no skills and empty resume', () => {
        const comparison = {
            matchedCoreSkills: [],
            missingCoreSkills: [],
            matchedOptionalSkills: [],
            missingOptionalSkills: []
        };
        const { atsScore } = calculateWeightedATSScore(comparison);
        expect(atsScore).toBe(0);
    });

    test('should produce detailed results with resume text', () => {
        const comparison = {
            matchedCoreSkills: ['JavaScript', 'React', 'Node.js'],
            missingCoreSkills: ['Docker'],
            matchedOptionalSkills: ['AWS'],
            missingOptionalSkills: []
        };

        const resumeText = `
John Doe
john@example.com
+1-555-123-4567

Summary
Full-stack developer with 3 years of experience building web applications.

Skills
JavaScript, React, Node.js, MongoDB, Express.js, Git, AWS

Experience
Software Engineer | TechCorp | Jan 2021 - Present
- Built REST APIs using Node.js and Express
- Implemented JWT authentication for user management
- Deployed applications on AWS EC2 and S3
- Reduced API response time by 40%

Projects
ATS Resume Analyzer — React, Node.js, Express
- Built a full-stack resume analysis tool
- Deployed on Vercel and Render

Education
B.Tech Computer Science, State University (2017-2021)
GPA: 3.8
        `;

        const jd = 'Required: JavaScript, React, Node.js, Docker. Nice to have: AWS.';

        const result = calculateWeightedATSScore(comparison, resumeText, jd);
        expect(result.atsScore).toBeGreaterThanOrEqual(50);
        expect(result.atsScore).toBeLessThanOrEqual(98);
        expect(result.details.matchTier).toBeTruthy();
        expect(result.details.summary).toBeTruthy();
        expect(result.details.keyStrengths.length).toBeGreaterThan(0);
        expect(result.confidence).toBeGreaterThan(0);
    });

    test('should not exceed 98 score even with perfect match and resume text', () => {
        const comparison = {
            matchedCoreSkills: ['JavaScript', 'React', 'Node.js', 'Docker', 'AWS', 'MongoDB', 'Express.js'],
            missingCoreSkills: [],
            matchedOptionalSkills: ['Python', 'Redis'],
            missingOptionalSkills: []
        };
        const resumeText = `
John Doe\njohn@example.com\n+1-555-123-4567\n\nSummary\nSenior developer.\n\nSkills\nJavaScript, React, Node.js\n\nExperience\nSoftware Engineer | Corp | Jan 2020 - Present\n- Built REST APIs\n- Deployed on AWS\n\nProjects\nApp — React, Node\n- Engineered a system\n\nEducation\nB.Tech CS, University (2016-2020)\nGPA: 3.9
        `;
        const { atsScore } = calculateWeightedATSScore(comparison, resumeText, 'Required: JavaScript, React, Node.js');
        expect(atsScore).toBeLessThanOrEqual(98);
    });

    test('should have a minimum score of 30 when resume text exists', () => {
        const comparison = {
            matchedCoreSkills: [],
            missingCoreSkills: ['JavaScript', 'React', 'Node.js', 'Docker', 'AWS'],
            matchedOptionalSkills: [],
            missingOptionalSkills: ['Python', 'Redis']
        };
        const { atsScore } = calculateWeightedATSScore(comparison, 'Some resume text here with enough content to trigger the minimum score floor');
        expect(atsScore).toBeGreaterThanOrEqual(30);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 15. JOB CATEGORY PREDICTION
// ═══════════════════════════════════════════════════════════════════════════════

describe('predictCategoryAndConfidence', () => {
    test('should predict Software Engineering for tech resume', () => {
        const text = 'JavaScript React Node.js Express MongoDB REST API Git developer programming web development';
        const result = predictCategoryAndConfidence(text);
        expect(result.category).toBe('Software Engineering');
        expect(result.confidence).toBeGreaterThan(0.6);
    });

    test('should predict Education for teacher resume', () => {
        const text = 'teacher education curriculum classroom management lesson planning pedagogy tutoring student assessment';
        const result = predictCategoryAndConfidence(text);
        expect(result.category).toBe('Education & Teaching');
    });

    test('should predict Finance for accounting resume', () => {
        const text = 'accounting audit tax quickbooks ledger gaap cpa billing payroll balance sheet accounts payable';
        const result = predictCategoryAndConfidence(text);
        expect(result.category).toBe('Finance & Accounting');
    });

    test('should predict Healthcare for medical resume', () => {
        const text = 'patient care clinical nurse nursing cpr first aid diagnosis vital signs ehr emr';
        const result = predictCategoryAndConfidence(text);
        expect(result.category).toBe('Healthcare & Medical');
    });

    test('should return Unknown for empty text', () => {
        const result = predictCategoryAndConfidence('');
        expect(result.category).toBe('Unknown');
        expect(result.confidence).toBe(0.0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 16. INTEGRATION TEST — FULL PIPELINE
// ═══════════════════════════════════════════════════════════════════════════════

describe('Full Pipeline Integration', () => {
    test('should process a complete software engineer resume end-to-end', () => {
        const resumeText = `
Alex Johnson
alex.johnson@example.com
+1-555-123-4567
github.com/alexjohnson
linkedin.com/in/alexjohnson

Professional Summary
Full-stack Software Engineer with 4 years of experience building scalable web applications using JavaScript, React, Node.js, and cloud services.

Technical Skills
JavaScript, TypeScript, React, Next.js, Node.js, Express.js, MongoDB, PostgreSQL, Docker, AWS, Git, REST APIs, GraphQL, JWT, Tailwind CSS, CI/CD, Agile

Professional Experience
Senior Software Engineer | TechStartup Inc. | Jan 2022 - Present
- Built and deployed a microservices architecture serving 50000 users
- Implemented OAuth2 authentication with JWT token management
- Optimized database queries reducing response time by 60%
- Led a team of 4 developers using Agile/Scrum methodology

Junior Developer | WebAgency Co. | Jun 2020 - Dec 2021
- Developed responsive React frontend components
- Created REST APIs using Node.js and Express
- Integrated MongoDB for data persistence

Projects
ATS Resume Analyzer — React, Node.js, Express, MongoDB
- Engineered a full-stack ATS resume analysis tool with ML-based job prediction
- Deployed on Vercel (frontend) and Render (backend)

FraudShield AI — Python, TensorFlow, Flask
- Designed and implemented a fraud detection system using deep learning
- Achieved 96% accuracy on production dataset

Education
Bachelor of Technology, Computer Science
State University (2016-2020)
GPA: 3.8/4.0

Certifications
AWS Certified Cloud Practitioner
Google Cloud Associate Cloud Engineer
        `;

        const jobDescription = `
Senior Full Stack Developer

Requirements:
- Must have 3+ years experience with JavaScript and React
- Required: Node.js, Express.js, MongoDB experience
- Strong knowledge of REST APIs and authentication
- Experience with Docker and CI/CD pipelines
- Proficiency in Git version control

Nice to have:
- AWS or cloud deployment experience
- TypeScript knowledge is a plus
- Agile/Scrum methodology experience preferred
        `;

        // 1. Extract skills
        const resumeSkills = extractSkills(resumeText);
        expect(resumeSkills.length).toBeGreaterThan(10);
        expect(resumeSkills).toContain('JavaScript');
        expect(resumeSkills).toContain('React');
        expect(resumeSkills).toContain('Node.js');

        // 2. Extract JD skills
        const { coreSkills, optionalSkills } = extractWeightedJDSkills(jobDescription);
        expect(coreSkills.length).toBeGreaterThan(3);

        // 3. Compare
        const comparison = compareWeightedSkills(resumeSkills, coreSkills, optionalSkills, resumeText);
        expect(comparison.matchedCoreSkills.length).toBeGreaterThan(3);

        // 4. Score
        const result = calculateWeightedATSScore(comparison, resumeText, jobDescription);
        expect(result.atsScore).toBeGreaterThanOrEqual(70);
        expect(result.atsScore).toBeLessThanOrEqual(98);
        expect(result.details.matchTier).toBeTruthy();
        expect(result.details.keyStrengths.length).toBeGreaterThan(0);

        // 5. Contact info
        const contact = extractContactInfo(resumeText);
        expect(contact.email).toBe('alex.johnson@example.com');
        expect(contact.phone).toBeTruthy();
        expect(contact.github).toContain('github.com');
        expect(contact.linkedin).toContain('linkedin.com');

        // 6. Category prediction
        const prediction = predictCategoryAndConfidence(resumeText);
        expect(prediction.category).toBe('Software Engineering');
        expect(prediction.confidence).toBeGreaterThan(0.7);
    });

    test('should handle a teacher resume correctly', () => {
        const resumeText = `
Sarah Williams
sarah.w@school.edu
+44 7911 123456

Career Objective
Dedicated educator with 8 years of classroom experience seeking to inspire students.

Skills
Curriculum Development, Classroom Management, Lesson Planning, Differentiated Instruction, Student Assessment, E-Learning, Educational Technology

Experience
Lead Teacher | Springfield Elementary | Sep 2018 - Present
- Designed and implemented innovative curriculum for 30 students
- Led professional development workshops for 15 teachers
- Improved student test scores by 25% through differentiated instruction

Education
Master of Education, University of London (2016-2018)
Bachelor of Arts in English, Oxford University (2012-2016)
        `;

        const skills = extractSkills(resumeText);
        expect(skills).toContain('Classroom Management');

        const prediction = predictCategoryAndConfidence(resumeText);
        expect(prediction.category).toBe('Education & Teaching');

        const contact = extractContactInfo(resumeText);
        expect(contact.email).toBe('sarah.w@school.edu');
        expect(contact.phone).toBeTruthy();
    });
});
