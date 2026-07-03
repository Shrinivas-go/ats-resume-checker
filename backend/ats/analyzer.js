const { extractWeightedJDSkills } = require('./jd');
const { compareWeightedSkills } = require('./compare');
const { calculateWeightedATSScore } = require('./score');
const { generateATSFeedback } = require('./feedback');

const WEAK_VERBS = [
    'worked', 'helped', 'assisted', 'responsible for', 'handled', 'made', 'did', 'got', 'used', 'tried'
];

/**
 * Analyze resume layout, presence of sections and basic quality aspects
 */
function analyzeResumeQuality(parsedResume) {
    const { personalInfo, experience, education, summary, projects, rawText } = parsedResume;

    const quality = {
        score: 0,
        sections: {
            contact: 0,
            summary: 0,
            experience: 0,
            education: 0,
            projects: 0
        },
        issues: [],
        improvements: []
    };

    if (personalInfo.email) quality.sections.contact += 5;
    else quality.issues.push({ type: 'critical', message: 'Missing email address' });

    if (personalInfo.phone) quality.sections.contact += 5;
    else quality.issues.push({ type: 'warning', message: 'Missing phone number' });

    if (personalInfo.linkedin) quality.sections.contact += 5;
    else quality.improvements.push('Adding a LinkedIn profile link is recommended');

    if (summary && summary.length > 0) quality.sections.summary = 5;
    else quality.improvements.push('Consider adding a professional summary');

    if (experience && experience.length > 0) quality.sections.experience = 10;
    else quality.issues.push({ type: 'critical', message: 'Missing Experience section' });

    if (education && education.length > 0) quality.sections.education = 5;
    else quality.issues.push({ type: 'warning', message: 'Missing Education section' });

    if (projects && projects.length > 0) quality.sections.projects = 5;

    let weakVerbCount = 0;
    const lowerText = rawText ? rawText.toLowerCase() : '';

    WEAK_VERBS.forEach(verb => {
        const regex = new RegExp(`\\b${verb}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) weakVerbCount += matches.length;
    });

    if (weakVerbCount > 3) {
        quality.improvements.push(`Found ${weakVerbCount} weak action verbs (e.g., "${WEAK_VERBS[0]}"). Replace with strong alternatives like "Engineered", "Optimized", "Spearheaded".`);
    }

    const totalSectionScore = Object.values(quality.sections).reduce((a, b) => a + b, 0);
    quality.score = Math.min(100, Math.round((totalSectionScore / 40) * 100));

    return quality;
}

/**
 * Perform comprehensive resume analysis combining matching and quality
 */
function analyzeResume(parsedResume, jobDescription) {
    const { coreSkills, optionalSkills } = extractWeightedJDSkills(jobDescription);
    const skillComparison = compareWeightedSkills(parsedResume.skills || [], coreSkills, optionalSkills);
    const skillResult = calculateWeightedATSScore(skillComparison);

    const qualityAnalysis = analyzeResumeQuality(parsedResume);

    const SKILL_WEIGHT = 0.7;
    const QUALITY_WEIGHT = 0.3;

    let weightedScore = (skillResult.atsScore * SKILL_WEIGHT) + (qualityAnalysis.score * QUALITY_WEIGHT);
    let finalScore = 0;
    let scoreLabel = "";
    let summaryOverride = null;

    if (skillResult.atsScore < 10) {
        finalScore = Math.min(Math.round(weightedScore), 15);
        scoreLabel = "Not Relevant";
        summaryOverride = "Your resume has poor alignment with this job description. Even with good formatting, the lack of core keywords prevents a passing score.";
    } else {
        finalScore = Math.round(weightedScore);
        if (finalScore >= 80) scoreLabel = "Excellent Match";
        else if (finalScore >= 60) scoreLabel = "Good Match";
        else if (finalScore >= 40) scoreLabel = "Fair Match";
        else scoreLabel = "Needs Work";
    }

    const skillFeedback = generateATSFeedback({ atsScore: skillResult.atsScore, ...skillComparison });

    return {
        success: true,
        score: finalScore,
        scoreLabel: scoreLabel,
        skillScore: skillResult.atsScore,
        qualityScore: qualityAnalysis.score,
        skills: {
            matched: skillComparison.matchedCoreSkills.concat(skillComparison.matchedOptionalSkills),
            missing: skillComparison.missingCoreSkills,
            coreMatches: skillComparison.matchedCoreSkills,
            optionalMatches: skillComparison.matchedOptionalSkills
        },
        quality: qualityAnalysis,
        feedback: {
            summary: summaryOverride || skillFeedback.summary,
            skillRecommendations: skillFeedback.recommendations,
            improvements: qualityAnalysis.improvements,
            criticalIssues: qualityAnalysis.issues
        }
    };
}

module.exports = {
    analyzeResume,
    analyzeResumeQuality
};
