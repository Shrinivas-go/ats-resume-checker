/**
 * Clean text by removing extra whitespace
 */
function cleanText(text) {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extract contact info (email, phone, LinkedIn, GitHub) via regex
 */
function extractContactInfo(text) {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emailMatch = text.match(emailRegex);

    const phoneRegex = /(?:(?:\+|00)88|01)?\d{11}|(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9])\s*\)|([2-9]1[02-9]|[2-9][02-8]1|[2-9][02-8][02-9]))\s*(?:[.-]\s*)?)?([2-9]1[02-9]|[2-9][02-9]1|[2-9][02-9]{2})\s*(?:[.-]\s*)?([0-9]{4})(?:\s*(?:#|x\.?|ext\.?|extension)\s*(\d+))?/g;
    const phoneMatch = text.match(phoneRegex);

    const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9_-]+/gi;
    const githubRegex = /github\.com\/[a-zA-Z0-9_-]+/gi;

    const linkedin = text.match(linkedinRegex);
    const github = text.match(githubRegex);

    return {
        email: emailMatch ? emailMatch[0].toLowerCase() : null,
        phone: phoneMatch ? phoneMatch[0] : null,
        linkedin: linkedin ? `https://www.${linkedin[0]}` : null,
        github: github ? `https://www.${github[0]}` : null,
    };
}

/**
 * Slice text from a heading synonym to the next recognized heading
 */
function extractSection(text, lowerText, sectionKeywords, nextSectionKeywords) {
    let startIndex = -1;
    let bestKeyword = '';

    for (const keyword of sectionKeywords) {
        const idx = lowerText.indexOf(keyword.toLowerCase());
        if (idx !== -1) {
            if (startIndex === -1 || idx < startIndex) {
                startIndex = idx;
                bestKeyword = keyword;
            }
        }
    }

    if (startIndex === -1) return null;

    startIndex += bestKeyword.length;

    let endIndex = text.length;
    for (const keyword of nextSectionKeywords) {
        const idx = lowerText.indexOf(keyword.toLowerCase(), startIndex + 50);
        if (idx !== -1 && idx < endIndex) {
            endIndex = idx;
        }
    }

    const content = text.slice(startIndex, endIndex).trim();

    return content
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 2);
}

/**
 * Match text against a regex of skill patterns
 */
function extractSkills(text) {
    const skillPatterns = [
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C\\+\\+', 'C#', 'Ruby', 'PHP', 'Go', 'Rust', 'Swift', 'Kotlin', 'Solidity',
        'React', 'Angular', 'Vue', 'Next\\.js', 'Redux', 'HTML5', 'CSS3', 'Sass', 'Tailwind', 'Bootstrap', 'Material UI', 'Webpack', 'Vite',
        'Node\\.js', 'Express', 'NestJS', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'ASP\\.NET', 'FastAPI',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Supabase', 'Neo4j', 'Cassandra', 'DynamoDB',
        'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'CircleCI',
        'Git', 'Jira', 'Figma', 'Postman', 'Swagger',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'OpenAI', 'LLM', 'NLP', 'Computer Vision'
    ];

    const foundSkills = new Set();
    skillPatterns.forEach(pattern => {
        const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
        if (regex.test(text)) {
            foundSkills.add(pattern.replace(/\\/g, ''));
        }
    });

    return Array.from(foundSkills);
}

/**
 * Orchestrate the parsing of raw text into structured resume sections
 */
function parseResumeText(text) {
    const clean = cleanText(text).replace(/\n/g, '\n ');
    const lower = text.toLowerCase();

    const contact = extractContactInfo(text);

    const sections = {
        education: ['education', 'academic background', 'qualifications'],
        experience: ['experience', 'work history', 'professional experience', 'employment history'],
        projects: ['projects', 'personal projects', 'key projects'],
        skills: ['skills', 'technical skills', 'technologies', 'core competencies'],
        summary: ['summary', 'profile', 'objective', 'about me'],
        certifications: ['certifications', 'licences', 'courses']
    };

    const allKeywords = Object.values(sections).flat();

    const education = extractSection(text, lower, sections.education, allKeywords.filter(k => !sections.education.includes(k)));
    const experience = extractSection(text, lower, sections.experience, allKeywords.filter(k => !sections.experience.includes(k)));
    const projects = extractSection(text, lower, sections.projects, allKeywords.filter(k => !sections.projects.includes(k)));
    const extractedSkills = extractSection(text, lower, sections.skills, allKeywords.filter(k => !sections.skills.includes(k)));

    const skillsList = extractSkills(extractedSkills ? extractedSkills.join('\n') : text);

    // Heuristic name extraction: scan first few lines
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let name = 'Candidate';

    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i];
        const isEmail = /@/.test(line);
        const isPhone = /\d{10}/.test(line);
        const isLink = /http|www/.test(line);

        if (!isEmail && !isPhone && !isLink && line.length > 3 && line.length < 50) {
            name = line;
            break;
        }
    }

    return {
        personalInfo: {
            name,
            ...contact
        },
        summary: extractSection(text, lower, sections.summary, allKeywords.filter(k => !sections.summary.includes(k))),
        experience: experience || [],
        education: education || [],
        projects: projects || [],
        skills: skillsList,
        rawText: text
    };
}

module.exports = {
    parseResumeText,
    extractSkills
};
