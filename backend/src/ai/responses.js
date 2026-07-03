const TEMPLATES = {
    DOMAIN_REFUSAL: {
        message: `I can only assist with resume analysis and ATS optimization.

**Try asking:**
• "Why is my score low?"
• "What skills am I missing?"
• "How can I improve my experience section?"
• "How well do I match this job?"`,
        type: 'refusal'
    },
    SCORE_EXPLANATION: {
        EXCELLENT: `## Great News! 🎉

Your ATS score is **{{overallScore}}%** - this is an excellent match!

{{#sectionBreakdown}}
**Section Scores:**
{{#skills}}- Skills: {{skills}}%{{/skills}}
{{#experience}}- Experience: {{experience}}%{{/experience}}
{{#education}}- Education: {{education}}%{{/education}}
{{#format}}- Format: {{format}}%{{/format}}
{{/sectionBreakdown}}

**Strongest Area:** {{highestSection.name}} ({{highestSection.score}}%)

**Recommendation:** Your resume is well-optimized. Consider applying soon!`,

        GOOD: `## Good Match ✓

Your ATS score is **{{overallScore}}%** - you're a solid candidate.

{{#sectionBreakdown}}
**Section Scores:**
{{#skills}}- Skills: {{skills}}%{{/skills}}
{{#experience}}- Experience: {{experience}}%{{/experience}}
{{#education}}- Education: {{education}}%{{/education}}
{{#format}}- Format: {{format}}%{{/format}}
{{/sectionBreakdown}}

**Area to Improve:** {{lowestSection.name}} ({{lowestSection.score}}%)

**Recommendation:** {{primaryIssue.recommendation}}`,

        MODERATE: `## Room for Improvement

Your ATS score is **{{overallScore}}%** - there's potential to improve.

{{#sectionBreakdown}}
**Section Scores:**
{{#skills}}- Skills: {{skills}}%{{/skills}}
{{#experience}}- Experience: {{experience}}%{{/experience}}
{{#education}}- Education: {{education}}%{{/education}}
{{#format}}- Format: {{format}}%{{/format}}
{{/sectionBreakdown}}

**Main Issue:** {{lowestSection.name}} section needs work ({{lowestSection.score}}%)

**Action Items:**
{{#actionItems}}
• {{.}}
{{/actionItems}}`,

        LOW: `## Significant Improvements Needed

Your ATS score is **{{overallScore}}%** - this needs attention before applying.

{{#sectionBreakdown}}
**Section Scores:**
{{#skills}}- Skills: {{skills}}%{{/skills}}
{{#experience}}- Experience: {{experience}}%{{/experience}}
{{#education}}- Education: {{education}}%{{/education}}
{{#format}}- Format: {{format}}%{{/format}}
{{/sectionBreakdown}}

**Primary Focus:** {{lowestSection.name}} ({{lowestSection.score}}%)

**Urgent Action Items:**
{{#actionItems}}
• {{.}}
{{/actionItems}}

**Tip:** Focus on adding missing core skills from the job description.`
    },
    SKILLS_GAP: {
        HIGH_URGENCY: `## Skills Gap Analysis ⚠️

You're missing **{{missingCoreCount}}** core skills from the job description.

**Must Add (High Priority):**
{{#primaryFocus}}
• **{{.}}** - This is a core requirement
{{/primaryFocus}}

{{#hasSecondary}}
**Nice to Have:**
{{#secondaryFocus}}
• {{.}}
{{/secondaryFocus}}
{{/hasSecondary}}

**Potential Impact:** Adding these skills could improve your score by ~**{{potentialScoreGain}}%**`,

        MEDIUM_URGENCY: `## Skills Gap Analysis

You're missing **{{missingCoreCount}}** core skills.

**Top Skills to Add:**
{{#primaryFocus}}
• **{{.}}**
{{/primaryFocus}}

{{#hasSecondary}}
**Optional (Stand Out):**
{{#secondaryFocus}}
• {{.}}
{{/secondaryFocus}}
{{/hasSecondary}}

**Estimated Impact:** +**{{potentialScoreGain}}%** score improvement`,

        LOW_URGENCY: `## Skills Analysis ✓

Great news! You have most core skills covered.

{{#hasSecondary}}
**Consider Adding (Nice to Have):**
{{#secondaryFocus}}
• {{.}}
{{/secondaryFocus}}
{{/hasSecondary}}

**Already Covered:** {{matchedCount}} of {{totalSkills}} required skills`
    },
    JD_MATCH: {
        STRONG_FIT: `## Strong Match! 🎯

**Match Rate:** {{matchPercentage}}% ({{matchedCount}}/{{totalRequired}} skills)

**Your Matching Skills:**
{{#topMatches}}
• ✓ {{.}}
{{/topMatches}}

**Verdict:** You're a strong candidate for this role. Consider applying!`,

        GOOD_FIT: `## Good Match ✓

**Match Rate:** {{matchPercentage}}% ({{matchedCount}}/{{totalRequired}} skills)

**Matching Skills:**
{{#topMatches}}
• ✓ {{.}}
{{/topMatches}}

**Skills to Add:**
{{#topGaps}}
• {{.}}
{{/topGaps}}

**Verdict:** Good fit - adding missing skills would make you a top candidate.`,

        PARTIAL_FIT: `## Partial Match

**Match Rate:** {{matchPercentage}}% ({{matchedCount}}/{{totalRequired}} skills)

**Currently Matching:**
{{#topMatches}}
• ✓ {{.}}
{{/topMatches}}

**Key Gaps:**
{{#topGaps}}
• ✗ {{.}}
{{/topGaps}}

**Recommendation:** Focus on acquiring the missing core skills before applying.`,

        WEAK_FIT: `## Limited Match ⚠️

**Match Rate:** {{matchPercentage}}% ({{matchedCount}}/{{totalRequired}} skills)

**Critical Gaps:**
{{#topGaps}}
• ✗ {{.}}
{{/topGaps}}

**Recommendation:** This role may require significant skill development. Consider roles that better match your current skillset, or focus on upskilling.`
    },
    EXPERIENCE_IMPROVE: `## Experience Section Feedback

{{#hasWeakVerbs}}
**Weak Action Verbs Found:**
{{#weakVerbs}}
• "{{.}}" → Replace with stronger verbs
{{/weakVerbs}}

**Recommended Action Verbs:**
{{#actionVerbs}}
• {{.}}
{{/actionVerbs}}
{{/hasWeakVerbs}}

**Key Improvements:**
{{#primaryIssues}}
• {{fix}}
{{/primaryIssues}}

**Tips:**
• Start each bullet with a strong action verb
• Quantify achievements (numbers, percentages, metrics)
• Focus on impact and results, not just duties`,
    KEYWORD_SUGGESTION: `## Keyword Suggestions 🔑

**Must Add (High Priority):**
{{#mustAdd}}
• **{{.}}**
{{/mustAdd}}

{{#hasNiceToHave}}
**Nice to Have:**
{{#niceToHave}}
• {{.}}
{{/niceToHave}}
{{/hasNiceToHave}}

**Already Included:** {{alreadyCount}} keywords

**Impact:** {{estimatedImpact}} improvement expected`,
    FORMATTING_FEEDBACK: `## Formatting Feedback

{{#hasScore}}**Format Score:** {{formatScore}}%{{/hasScore}}

{{#hasIssues}}
**Issues Found:**
{{#issues}}
• {{description}}
{{/issues}}
{{/hasIssues}}

**Recommendations:**
{{#recommendations}}
• {{.}}
{{/recommendations}}

**General Tips:**
{{#generalTips}}
• {{.}}
{{/generalTips}}`,
    RESUME_REWRITE: `## Rewrite Assistance

I can help improve your resume text. Please provide the specific bullet point or section you'd like me to rewrite.

{{#hasWeakVerbs}}
**Weak verbs I noticed:** {{weakVerbs}}
{{/hasWeakVerbs}}

**Guidelines I'll follow:**
{{#guidelines}}
• {{.}}
{{/guidelines}}`,
    CLARIFICATION: `I'm not quite sure what you're asking. {{clarificationQuestion}}`,
    ERROR: `I encountered an issue: {{message}}

Please try again or ask a different question about your resume.`
};

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
}

function renderTemplate(template, data) {
    if (!template || !data) return template || '';

    let result = template;

    const sectionRegex = /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g;
    result = result.replace(sectionRegex, (match, key, content) => {
        const value = data[key];

        if (Array.isArray(value)) {
            if (value.length === 0) return '';
            return value.map(item => {
                if (typeof item === 'object') {
                    return renderTemplate(content, { ...data, ...item });
                }
                return content.replace(/\{\{\.\}\}/g, item);
            }).join('');
        } else if (typeof value === 'object' && value !== null) {
            return renderTemplate(content, { ...data, ...value });
        } else if (value) {
            return renderTemplate(content, data);
        }
        return '';
    });

    const variableRegex = /\{\{(\w+(?:\.\w+)*)\}\}/g;
    result = result.replace(variableRegex, (match, path) => {
        const value = getNestedValue(data, path);
        if (value === undefined || value === null) return '';
        if (Array.isArray(value)) return value.join(', ');
        return String(value);
    });

    return result.trim();
}

function generateResponse(intent, context, decision) {
    if (decision?.error) {
        return renderTemplate(TEMPLATES.ERROR, { message: decision.message });
    }

    let template;
    let data;

    switch (intent) {
        case 'SCORE_EXPLANATION':
            template = TEMPLATES.SCORE_EXPLANATION[decision.category || 'MODERATE'];
            data = {
                overallScore: context.overallScore,
                sectionBreakdown: context.sectionScores,
                skills: context.sectionScores?.skills,
                experience: context.sectionScores?.experience,
                education: context.sectionScores?.education,
                format: context.sectionScores?.format,
                lowestSection: context.lowestSection,
                highestSection: context.highestSection,
                primaryIssue: decision.primaryIssue,
                actionItems: decision.actionItems || []
            };
            break;

        case 'SKILLS_GAP':
            template = TEMPLATES.SKILLS_GAP[`${decision.urgency || 'MEDIUM'}_URGENCY`] || TEMPLATES.SKILLS_GAP.MEDIUM_URGENCY;
            data = {
                missingCoreCount: context.missingCoreSkills?.length || 0,
                primaryFocus: decision.primaryFocus || [],
                secondaryFocus: decision.secondaryFocus || [],
                hasSecondary: (decision.secondaryFocus?.length || 0) > 0,
                potentialScoreGain: decision.potentialScoreGain || 0,
                matchedCount: context.matchedCoreSkills?.length || 0,
                totalSkills: context.totalCoreSkills || 0
            };
            break;

        case 'JD_MATCH':
            template = TEMPLATES.JD_MATCH[decision.fitLevel || 'PARTIAL_FIT'];
            data = {
                matchPercentage: decision.matchPercentage,
                matchedCount: decision.matchedCount,
                totalRequired: decision.totalRequired,
                topMatches: decision.topMatches || [],
                topGaps: decision.topGaps || []
            };
            break;

        case 'EXPERIENCE_IMPROVE':
            template = TEMPLATES.EXPERIENCE_IMPROVE;
            data = {
                hasWeakVerbs: (context.weakVerbs?.length || 0) > 0,
                weakVerbs: context.weakVerbs || [],
                actionVerbs: decision.actionVerbs || [],
                primaryIssues: decision.primaryIssues || []
            };
            break;

        case 'KEYWORD_SUGGESTION':
            template = TEMPLATES.KEYWORD_SUGGESTION;
            data = {
                mustAdd: decision.mustAdd || [],
                niceToHave: decision.niceToHave || [],
                hasNiceToHave: (decision.niceToHave?.length || 0) > 0,
                alreadyCount: context.alreadyPresent?.length || 0,
                estimatedImpact: decision.estimatedImpact || 'MODERATE'
            };
            break;

        case 'FORMATTING_FEEDBACK':
            template = TEMPLATES.FORMATTING_FEEDBACK;
            data = {
                hasScore: context.formatScore !== null && context.formatScore !== undefined,
                formatScore: context.formatScore,
                hasIssues: (decision.issues?.length || 0) > 0,
                issues: decision.issues || [],
                recommendations: decision.recommendations || [],
                generalTips: decision.generalTips || []
            };
            break;

        case 'RESUME_REWRITE':
            template = TEMPLATES.RESUME_REWRITE;
            data = {
                hasWeakVerbs: (context.weakVerbs?.length || 0) > 0,
                weakVerbs: context.weakVerbs?.join(', ') || '',
                guidelines: decision.guidelines || []
            };
            break;

        case 'OUT_OF_SCOPE':
            return TEMPLATES.DOMAIN_REFUSAL.message;

        case 'CLARIFICATION_NEEDED':
            return renderTemplate(TEMPLATES.CLARIFICATION, {
                clarificationQuestion: decision.clarificationQuestion
            });

        default:
            return 'I can help you with your resume and ATS optimization. What would you like to know?';
    }

    return renderTemplate(template, data);
}

module.exports = {
    generateResponse
};
