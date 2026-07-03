const { analyzeQuery } = require('./intents');
const { generateResponse } = require('./responses');

// =================== DOMAIN REFUSAL MESSAGE ===================
const DOMAIN_REFUSAL = {
    success: false,
    type: 'DOMAIN_REFUSAL',
    message: `I can only assist with resume analysis and ATS optimization.

**Try asking:**
• "Why is my score low?"
• "What skills am I missing?"
• "How can I improve my experience section?"
• "How well do I match this job?"`,
    suggestions: [
        'Why is my score low?',
        'What skills am I missing?',
        'How can I improve my experience section?'
    ]
};

// =================== CONTEXT BUILDERS ===================

function calculateMatchRate(matched, missing) {
    const total = matched + missing;
    if (total === 0) return 0;
    return Math.round((matched / total) * 100);
}

function buildContext(atsResult, intent, query = '') {
    if (!atsResult || typeof atsResult !== 'object' || Object.keys(atsResult).length === 0) {
        return {
            type: 'ERROR',
            error: 'No analysis data available. Please run an ATS scan first.'
        };
    }

    switch (intent) {
        case 'SCORE_EXPLANATION': {
            const context = {
                type: 'SCORE_EXPLANATION',
                overallScore: atsResult.score || 0,
                sectionScores: {
                    skills: atsResult.skillScore || 0,
                    experience: atsResult.quality?.sections?.experience * 10 || 0,
                    education: atsResult.quality?.sections?.education * 10 || 0,
                    format: atsResult.quality?.score || 0
                },
                lowestSection: null,
                highestSection: null
            };

            const scores = Object.entries(context.sectionScores);
            if (scores.length > 0) {
                scores.sort((a, b) => a[1] - b[1]);
                context.lowestSection = { name: scores[0][0], score: scores[0][1] };
                context.highestSection = { name: scores[scores.length - 1][0], score: scores[scores.length - 1][1] };
            }

            if (atsResult.feedback?.summary) {
                context.explanation = atsResult.feedback.summary;
            }
            return context;
        }

        case 'SKILLS_GAP':
            return {
                type: 'SKILLS_GAP',
                matchedCoreSkills: atsResult.skills?.coreMatches || [],
                missingCoreSkills: atsResult.skills?.missing || [],
                matchedOptionalSkills: atsResult.skills?.optionalMatches || [],
                missingOptionalSkills: [],
                totalCoreSkills: (atsResult.skills?.coreMatches?.length || 0) + (atsResult.skills?.missing?.length || 0),
                totalOptionalSkills: atsResult.skills?.optionalMatches?.length || 0,
                coreMatchRate: calculateMatchRate(
                    atsResult.skills?.coreMatches?.length || 0,
                    atsResult.skills?.missing?.length || 0
                )
            };

        case 'JD_MATCH':
            return {
                type: 'JD_MATCH',
                overallMatch: atsResult.score || 0,
                matchedSkills: atsResult.skills?.matched || [],
                missingSkills: atsResult.skills?.missing || [],
                matchCount: atsResult.skills?.matched?.length || 0,
                totalRequired: (atsResult.skills?.matched?.length || 0) + (atsResult.skills?.missing?.length || 0),
                feedback: atsResult.feedback?.summary || null
            };

        case 'EXPERIENCE_IMPROVE':
            return {
                type: 'EXPERIENCE_IMPROVE',
                experienceScore: atsResult.quality?.sections?.experience * 10 || 0,
                weakVerbs: (atsResult.quality?.improvements || [])
                    .filter(imp => imp.toLowerCase().includes('weak action verb'))
                    .map(imp => imp.match(/"([^"]+)"/g)?.map(m => m.replace(/"/g, '')) || [])
                    .flat(),
                recommendations: atsResult.feedback?.improvements || []
            };

        case 'KEYWORD_SUGGESTION': {
            const missing = atsResult.skills?.missing || [];
            return {
                type: 'KEYWORD_SUGGESTION',
                suggestedKeywords: missing.map(k => ({ keyword: k, priority: 'high' })),
                totalMissing: missing.length,
                alreadyPresent: atsResult.skills?.matched || []
            };
        }

        case 'FORMATTING_FEEDBACK':
            return {
                type: 'FORMATTING_FEEDBACK',
                formatScore: atsResult.quality?.score || 0,
                formatIssues: atsResult.feedback?.criticalIssues?.map(i => i.message) || [],
                recommendations: atsResult.feedback?.improvements || []
            };

        case 'RESUME_REWRITE':
            return {
                type: 'RESUME_REWRITE',
                weakVerbs: [],
                needsLLM: true,
                originalQuery: query
            };

        default:
            return {
                type: 'GENERAL',
                overallScore: atsResult.score || 0,
                matchedSkillsCount: atsResult.skills?.matched?.length || 0,
                missingSkillsCount: atsResult.skills?.missing?.length || 0,
                hasFeedback: !!atsResult.feedback,
                hasRecommendations: atsResult.feedback?.improvements?.length > 0
            };
    }
}

// =================== DECISION ENGINE ===================

function getScoreRecommendation(section, score) {
    const recommendations = {
        skills: score < 50 ? 'Add more relevant skills from the job description' : 'Continue adding industry-specific keywords',
        experience: score < 50 ? 'Use stronger action verbs and quantify achievements' : 'Add more measurable outcomes to your bullet points',
        education: score < 50 ? 'Include relevant coursework or certifications' : 'Add any professional certifications or training',
        format: score < 50 ? 'Simplify your resume format for better ATS parsing' : 'Ensure consistent formatting throughout'
    };
    return recommendations[section] || 'Focus on improving this section with relevant content';
}

function decide(context, intent) {
    if (context.type === 'ERROR') {
        return { error: true, message: context.error };
    }

    switch (intent) {
        case 'SCORE_EXPLANATION': {
            const overallScore = context.overallScore;
            let category = 'MODERATE';
            if (overallScore >= 80) category = 'EXCELLENT';
            else if (overallScore >= 60) category = 'GOOD';
            else if (overallScore >= 40) category = 'MODERATE';
            else category = 'LOW';

            const lowestSection = context.lowestSection;
            const primaryIssue = lowestSection ? {
                section: lowestSection.name,
                score: lowestSection.score,
                impact: 'high',
                recommendation: getScoreRecommendation(lowestSection.name, lowestSection.score)
            } : null;

            const actionItems = [];
            if (overallScore < 60) actionItems.push('Focus on adding missing core skills');
            if (lowestSection && lowestSection.score < 50) actionItems.push(`Improve your ${lowestSection.name} section`);

            return {
                category,
                primaryIssue,
                sectionBreakdown: context.sectionScores,
                actionItems
            };
        }

        case 'SKILLS_GAP': {
            const missingCore = context.missingCoreSkills || [];
            const potentialGain = Math.min(missingCore.length * 5, 100 - (context.coreMatchRate || 0));
            return {
                primaryFocus: missingCore.slice(0, 3),
                secondaryFocus: [],
                potentialScoreGain: Math.round(potentialGain),
                urgency: missingCore.length > 3 ? 'HIGH' : (missingCore.length > 0 ? 'MEDIUM' : 'LOW')
            };
        }

        case 'JD_MATCH': {
            const totalRequired = context.totalRequired || 0;
            const matchCount = context.matchCount || 0;
            const matchPercentage = totalRequired > 0 ? Math.round((matchCount / totalRequired) * 100) : 0;

            let fitLevel = 'PARTIAL_FIT';
            if (matchPercentage >= 80) fitLevel = 'STRONG_FIT';
            else if (matchPercentage >= 60) fitLevel = 'GOOD_FIT';
            else if (matchPercentage >= 40) fitLevel = 'PARTIAL_FIT';
            else fitLevel = 'WEAK_FIT';

            return {
                fitLevel,
                matchPercentage,
                matchedCount: matchCount,
                totalRequired,
                topMatches: context.matchedSkills.slice(0, 5),
                topGaps: context.missingSkills.slice(0, 5)
            };
        }

        case 'EXPERIENCE_IMPROVE': {
            const issues = [];
            const weakVerbs = context.weakVerbs || [];
            if (weakVerbs.length > 0) {
                issues.push({
                    type: 'WEAK_VERBS',
                    severity: weakVerbs.length > 3 ? 'HIGH' : 'MEDIUM',
                    fix: 'Replace weak verbs with strong action verbs like "Led", "Developed", "Achieved", "Implemented"'
                });
            }
            if (context.experienceScore < 60) {
                issues.push({
                    type: 'LOW_EXPERIENCE_SCORE',
                    severity: 'HIGH',
                    fix: 'Quantify achievements with numbers and metrics'
                });
            }
            return {
                primaryIssues: issues.slice(0, 2),
                actionVerbs: ['Led', 'Developed', 'Implemented', 'Achieved', 'Increased', 'Reduced', 'Managed', 'Created']
            };
        }

        case 'KEYWORD_SUGGESTION': {
            const suggested = context.suggestedKeywords || [];
            return {
                mustAdd: suggested.slice(0, 5).map(s => s.keyword),
                niceToHave: suggested.slice(5, 8).map(s => s.keyword),
                alreadyIncluded: context.alreadyPresent.slice(0, 5),
                estimatedImpact: suggested.length > 3 ? 'SIGNIFICANT' : 'MODERATE'
            };
        }

        case 'FORMATTING_FEEDBACK': {
            const formatIssues = context.formatIssues || [];
            return {
                formatScore: context.formatScore,
                issues: formatIssues.map(issue => ({ description: issue })),
                recommendations: context.recommendations.slice(0, 3)
            };
        }

        case 'RESUME_REWRITE':
            return {
                requiresLLM: true,
                guidelines: [
                    'Start bullets with strong action verbs',
                    'Quantify achievements when possible',
                    'Focus on impact and results'
                ]
            };

        default:
            return {
                general: true,
                message: 'Please ask a specific question about your resume or ATS score.'
            };
    }
}

// =================== ORCHESTRATOR ===================

function requiresATSData(intent) {
    return [
        'SCORE_EXPLANATION',
        'SKILLS_GAP',
        'JD_MATCH',
        'EXPERIENCE_IMPROVE',
        'KEYWORD_SUGGESTION',
        'FORMATTING_FEEDBACK'
    ].includes(intent);
}

async function processQuery(query, atsResult = null) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return { success: false, type: 'ERROR', message: 'Please enter a valid question.' };
    }

    const intentResult = analyzeQuery(query);
    if (!intentResult.isValid) {
        return DOMAIN_REFUSAL;
    }

    if (intentResult.needsClarification) {
        return {
            success: true,
            type: 'CLARIFICATION',
            intent: intentResult.intent,
            confidence: intentResult.confidence,
            message: intentResult.clarificationQuestion,
            possibleIntents: intentResult.possibleIntents || []
        };
    }

    if (!atsResult && requiresATSData(intentResult.intent)) {
        return {
            success: false,
            type: 'MISSING_DATA',
            message: 'I need your ATS analysis results to answer this. Please scan a resume and job description first.',
            intent: intentResult.intent
        };
    }

    const context = buildContext(atsResult || {}, intentResult.intent, query);
    const decision = decide(context, intentResult.intent);
    const response = generateResponse(intentResult.intent, context, decision);

    return {
        success: true,
        type: 'RESPONSE',
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        message: response,
        context: {
            type: context.type,
            overallScore: context.overallScore || null
        }
    };
}

function getSuggestedActions(atsResult) {
    if (!atsResult) {
        return [{ label: 'Explain my score', query: 'Why is my score what it is?' }];
    }

    const actions = [
        { label: 'Explain my score', query: 'Why is my score what it is?' }
    ];

    if (atsResult.skills?.missing?.length > 0) {
        actions.push({ label: 'Show missing skills', query: 'What skills am I missing?' });
    }

    actions.push({ label: 'Suggest keywords', query: 'What keywords should I add?' });

    if (atsResult.score < 70) {
        actions.push({ label: 'Improve experience', query: 'How can I improve my experience section?' });
    }

    return actions.slice(0, 4);
}

module.exports = {
    processQuery,
    getSuggestedActions
};
