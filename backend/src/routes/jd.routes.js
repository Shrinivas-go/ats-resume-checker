const express = require('express');
const router = express.Router();

const JD_TEMPLATES = {
    intro: {
        startup: 'We are a fast-growing startup looking for',
        corporate: 'We are seeking a highly qualified',
        agency: 'Our agency is looking for a talented',
        remote: 'We are hiring a remote-first',
    },
    culture: {
        startup: 'Join our dynamic team where innovation and agility drive everything we do.',
        corporate: 'Be part of an established organization committed to excellence and work-life balance.',
        agency: 'Work with diverse clients on exciting projects in a collaborative environment.',
        remote: 'Enjoy remote work flexibility while being part of a connected global team.',
    },
    benefits: {
        standard: [
            'Competitive salary and performance bonuses',
            'Health, dental, and vision insurance',
            'Professional development budget',
            'Paid time off and holidays',
        ],
        premium: [
            'Equity/stock options',
            'Wellness programs and gym membership',
            'Home office stipend',
        ],
    },
};

const SKILL_SETS = {
    'software engineer': {
        required: ['CS degree or equivalent', '3+ years software development', 'Proficiency in at least one programming language'],
        preferred: ['Cloud platforms (AWS, GCP, Azure)', 'CI/CD pipeline experience', 'Strong problem-solving skills'],
    },
    'frontend developer': {
        required: ['JavaScript, HTML, CSS proficiency', 'React, Vue, or Angular experience', 'Responsive design understanding'],
        preferred: ['TypeScript experience', 'Testing frameworks', 'UI/UX sensibility'],
    },
    'backend developer': {
        required: ['Server-side languages (Node.js, Python, Java)', 'Database design and management', 'API development'],
        preferred: ['Microservices architecture', 'Containerization (Docker, K8s)', 'Security best practices'],
    },
    'data scientist': {
        required: ['Statistics and mathematics background', 'Python or R proficiency', 'ML framework experience'],
        preferred: ['Advanced degree in relevant field', 'Big data technologies', 'Strong communication'],
    },
    'product manager': {
        required: ['Product development leadership', 'Analytical and problem-solving skills', 'Excellent communication'],
        preferred: ['Technical background', 'Agile methodologies', 'User research experience'],
    },
    default: {
        required: ['Relevant field experience', 'Strong communication', 'Team collaboration ability'],
        preferred: ['Industry certifications', 'Leadership experience', 'Continuous learning mindset'],
    },
};

const LEVEL_EXPERIENCE = { entry: '0-2 years', mid: '3-5 years', senior: '5-8 years', lead: '8+ years' };

/** POST /jd/generate — Generate a job description from parameters. */
router.post('/generate', (req, res) => {
    const {
        title,
        company = 'Our Company',
        culture = 'startup',
        level = 'mid',
        includeSkills = true,
        customSkills = [],
        department = '',
        location = 'Remote',
    } = req.body;

    if (!title) return res.status(400).json({ success: false, message: 'Job title is required' });

    // Match skill set by title
    const titleLower = title.toLowerCase();
    let skills = SKILL_SETS.default;
    for (const [key, set] of Object.entries(SKILL_SETS)) {
        if (key !== 'default' && (titleLower.includes(key) || key.includes(titleLower))) {
            skills = set;
            break;
        }
    }

    const intro = JD_TEMPLATES.intro[culture] || JD_TEMPLATES.intro.startup;
    const cultureText = JD_TEMPLATES.culture[culture] || JD_TEMPLATES.culture.startup;
    const levelLabel = level.charAt(0).toUpperCase() + level.slice(1);

    let jd = `# ${title}\n\n`;
    jd += `**${company}** | ${location}${department ? ` | ${department}` : ''}\n\n`;
    jd += `## About the Role\n\n${intro} a ${levelLabel}-level ${title} to join our team.\n\n`;
    jd += `## About Us\n\n${cultureText}\n\n`;
    jd += `## Responsibilities\n\n`;
    jd += `- Lead and contribute to key projects\n`;
    jd += `- Collaborate with cross-functional teams\n`;
    jd += `- Participate in code reviews and technical planning\n`;
    jd += `- Mentor junior team members\n\n`;

    if (includeSkills) {
        jd += `## Required Qualifications\n\n- ${LEVEL_EXPERIENCE[level]} of relevant experience\n`;
        skills.required.forEach(s => { jd += `- ${s}\n`; });
        customSkills.filter(s => s.trim()).forEach(s => { jd += `- ${s.trim()}\n`; });
        jd += `\n## Preferred Qualifications\n\n`;
        skills.preferred.forEach(s => { jd += `- ${s}\n`; });
    }

    jd += `\n## Benefits\n\n`;
    JD_TEMPLATES.benefits.standard.forEach(b => { jd += `- ${b}\n`; });
    if (level === 'senior' || level === 'lead') {
        JD_TEMPLATES.benefits.premium.forEach(b => { jd += `- ${b}\n`; });
    }

    jd += `\n---\n\n*${company} is an equal opportunity employer.*`;

    res.json({
        success: true,
        jobDescription: jd,
        metadata: { title, company, culture, level, location, generatedAt: new Date().toISOString() },
    });
});

/** GET /jd/templates — Available template options. */
router.get('/templates', (req, res) => {
    res.json({
        success: true,
        cultures: Object.keys(JD_TEMPLATES.intro),
        levels: Object.keys(LEVEL_EXPERIENCE),
        suggestedTitles: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Data Scientist', 'Product Manager'],
    });
});

module.exports = router;
