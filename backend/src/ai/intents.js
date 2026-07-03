const DOMAIN_KEYWORDS = [
    'resume', 'cv', 'ats', 'score', 'skills', 'experience', 'job',
    'description', 'keywords', 'match', 'format', 'bullet', 'section',
    'work history', 'education', 'certification', 'qualification',
    'hiring', 'recruiter', 'applicant', 'tracking', 'optimize',
    'improve', 'rewrite', 'rephrase', 'missing', 'weak', 'strong'
];

const INTENT_PATTERNS = {
    SCORE_EXPLANATION: {
        keywords: ['score', 'why', 'low', 'high', 'explain', 'breakdown', 'rating', 'grade', 'result', 'percentage'],
        phrases: [
            /why\s+(is|was)\s+(my|the)\s+score/i,
            /explain\s+(my|the)\s+score/i,
            /score\s+(is|was)\s+(low|high|bad|good)/i,
            /how\s+did\s+i\s+(score|do|perform)/i,
            /what\s+does\s+(my|the)\s+score\s+mean/i,
            /breakdown\s+(of|for)\s+(my|the)\s+score/i
        ],
        baseConfidence: 0.9,
        priority: 1
    },
    SKILLS_GAP: {
        keywords: ['missing', 'skills', 'gap', 'lack', 'need', 'required', 'keywords', 'absent', 'not found'],
        phrases: [
            /what\s+(skills|keywords)\s+(am\s+i|are)\s+missing/i,
            /missing\s+(skills|keywords)/i,
            /skills?\s+gap/i,
            /what\s+(should|do)\s+i\s+(add|include)/i,
            /which\s+(skills|keywords)\s+(are|were)\s+not\s+found/i
        ],
        baseConfidence: 0.9,
        priority: 2
    },
    JD_MATCH: {
        keywords: ['match', 'job', 'description', 'fit', 'aligned', 'relevant', 'compatible', 'suitable'],
        phrases: [
            /how\s+(well\s+)?(do|does)\s+(i|it|my resume)\s+match/i,
            /match\s+(percentage|rate|score)/i,
            /fit\s+for\s+(this|the)\s+job/i,
            /aligned\s+with\s+(the\s+)?job/i,
            /compare\s+(to|with)\s+(the\s+)?job/i
        ],
        baseConfidence: 0.9,
        priority: 3
    },
    EXPERIENCE_IMPROVE: {
        keywords: ['experience', 'work', 'history', 'weak', 'improve', 'better', 'strengthen', 'enhance', 'bullets'],
        phrases: [
            /improve\s+(my\s+)?experience/i,
            /weak\s+(experience|work\s+history)/i,
            /how\s+(can|do)\s+i\s+(improve|enhance)\s+(my\s+)?experience/i,
            /experience\s+section\s+(is|looks)\s+(weak|bad)/i,
            /make\s+(my\s+)?experience\s+(better|stronger)/i
        ],
        baseConfidence: 0.85,
        priority: 4
    },
    KEYWORD_SUGGESTION: {
        keywords: ['suggest', 'recommend', 'add', 'include', 'keywords', 'terms', 'phrases', 'words'],
        phrases: [
            /suggest\s+(keywords|skills|terms)/i,
            /what\s+(keywords|skills)\s+(should|can)\s+i\s+add/i,
            /recommend\s+(any\s+)?(keywords|skills)/i,
            /keywords?\s+to\s+(add|include)/i
        ],
        baseConfidence: 0.85,
        priority: 5
    },
    FORMATTING_FEEDBACK: {
        keywords: ['format', 'layout', 'structure', 'design', 'template', 'sections', 'organize', 'length', 'pages'],
        phrases: [
            /format(ting)?\s+(issues?|problems?|feedback)/i,
            /(is|was)\s+(the|my)\s+format/i,
            /how\s+(is|should)\s+(the|my)\s+(format|layout|structure)/i,
            /structure\s+(of|for)\s+(my|the)\s+resume/i,
            /organize\s+(my|the)\s+resume/i
        ],
        baseConfidence: 0.85,
        priority: 6
    },
    RESUME_REWRITE: {
        keywords: ['rewrite', 'rephrase', 'reword', 'improve', 'bullet', 'sentence', 'stronger', 'action verbs'],
        phrases: [
            /rewrite\s+(this|my|the)\s+(bullet|sentence|point)/i,
            /rephrase\s+(this|my)/i,
            /make\s+(this|it)\s+(sound\s+)?(better|stronger|professional)/i,
            /improve\s+(this|my)\s+(bullet|sentence)/i,
            /use\s+(stronger|better|action)\s+verbs/i
        ],
        baseConfidence: 0.8,
        priority: 7
    },
    SECTION_ANALYSIS: {
        keywords: ['section', 'education', 'summary', 'objective', 'projects', 'certifications', 'analyze'],
        phrases: [
            /analyze\s+(my\s+)?(education|summary|projects)/i,
            /(education|summary|projects?)\s+section/i,
            /how\s+(is|was)\s+(my\s+)?(education|summary)/i,
            /feedback\s+(on|for)\s+(my\s+)?(education|summary)/i
        ],
        baseConfidence: 0.8,
        priority: 8
    }
};

const OFF_TOPIC_INDICATORS = [
    /weather/i, /news/i, /sports/i, /politics/i, /recipe/i, /cook/i,
    /movie/i, /music/i, /game/i, /play/i, /travel/i, /hotel/i,
    /restaurant/i, /shop/i, /buy/i, /price/i, /stock/i, /crypto/i,
    /health/i, /medical/i, /doctor/i, /legal/i, /lawyer/i,
    /math/i, /calculate/i, /translate/i, /language/i,
    /who\s+is/i, /what\s+year/i, /when\s+was/i, /history\s+of/i
];

const AMBIGUOUS_PATTERNS = [
    /^help$/i,
    /^improve$/i,
    /^better$/i,
    /^fix$/i,
    /^(what|how)\s+now\??$/i
];

const CONFIDENCE_THRESHOLD = 0.6;
const DOMAIN_THRESHOLD = 0.3;

function validateDomain(query) {
    const normalized = query.toLowerCase().trim();

    for (const pattern of OFF_TOPIC_INDICATORS) {
        if (pattern.test(normalized)) {
            return { isValid: false, confidence: 0, reason: 'OFF_TOPIC' };
        }
    }

    let keywordCount = 0;
    for (const keyword of DOMAIN_KEYWORDS) {
        if (normalized.includes(keyword.toLowerCase())) {
            keywordCount++;
        }
    }

    const words = normalized.split(/\s+/).filter(w => w.length > 2);
    const domainConfidence = words.length > 0
        ? Math.min(keywordCount / Math.max(words.length * 0.3, 1), 1)
        : 0;

    return {
        isValid: domainConfidence >= DOMAIN_THRESHOLD || keywordCount >= 1,
        confidence: domainConfidence,
        reason: domainConfidence >= DOMAIN_THRESHOLD ? 'DOMAIN_MATCH' : 'LOW_RELEVANCE'
    };
}

function generateClarificationQuestion(partialIntent) {
    const questions = {
        SCORE_EXPLANATION: 'Are you asking about your ATS score? Would you like me to explain why your score is what it is?',
        SKILLS_GAP: 'Are you interested in knowing which skills are missing from your resume?',
        JD_MATCH: 'Would you like to know how well your resume matches the job description?',
        EXPERIENCE_IMPROVE: 'Are you looking to improve your work experience section?',
        KEYWORD_SUGGESTION: 'Would you like suggestions for keywords to add to your resume?',
        FORMATTING_FEEDBACK: 'Are you asking about your resume\'s format and structure?',
        RESUME_REWRITE: 'Would you like me to help rewrite or improve a specific part of your resume?',
        SECTION_ANALYSIS: 'Which section of your resume would you like me to analyze?'
    };
    return questions[partialIntent] || 'Could you please clarify what aspect of your resume you\'d like help with?';
}

function detectIntent(query) {
    const normalized = query.toLowerCase().trim();

    for (const pattern of AMBIGUOUS_PATTERNS) {
        if (pattern.test(normalized)) {
            return {
                intent: 'CLARIFICATION_NEEDED',
                confidence: 0,
                needsClarification: true,
                clarificationQuestion: 'Could you be more specific? For example:\n- "Why is my score low?"\n- "What skills am I missing?"\n- "How can I improve my experience section?"'
            };
        }
    }

    const scores = [];

    for (const [intentName, pattern] of Object.entries(INTENT_PATTERNS)) {
        let score = 0;
        const matches = [];

        for (const keyword of pattern.keywords) {
            if (normalized.includes(keyword.toLowerCase())) {
                score += 0.15;
                matches.push({ type: 'keyword', value: keyword });
            }
        }

        for (const regex of pattern.phrases) {
            if (regex.test(normalized)) {
                score += 0.35;
                matches.push({ type: 'phrase', pattern: regex.source });
            }
        }

        const finalConfidence = Math.min(score, pattern.baseConfidence);
        scores.push({
            intent: intentName,
            confidence: finalConfidence,
            priority: pattern.priority,
            matches
        });
    }

    scores.sort((a, b) => {
        if (b.confidence !== a.confidence) {
            return b.confidence - a.confidence;
        }
        return a.priority - b.priority;
    });

    const topIntent = scores[0];

    if (topIntent.confidence < CONFIDENCE_THRESHOLD) {
        const partialMatches = scores.filter(s => s.confidence > 0);
        if (partialMatches.length > 0) {
            return {
                intent: 'CLARIFICATION_NEEDED',
                confidence: topIntent.confidence,
                needsClarification: true,
                possibleIntents: partialMatches.slice(0, 2).map(s => s.intent),
                clarificationQuestion: generateClarificationQuestion(partialMatches[0].intent)
            };
        }

        return {
            intent: 'UNKNOWN',
            confidence: 0,
            needsClarification: true,
            clarificationQuestion: 'I\'m not sure what you\'re asking. Could you please rephrase your question about your resume or ATS score?'
        };
    }

    return {
        intent: topIntent.intent,
        confidence: topIntent.confidence,
        needsClarification: false,
        matches: topIntent.matches
    };
}

function analyzeQuery(query) {
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
        return { isValid: false, intent: 'INVALID_INPUT', confidence: 0, message: 'Please enter a valid question.' };
    }

    const domainResult = validateDomain(query);
    if (!domainResult.isValid) {
        return {
            isValid: false,
            intent: 'OUT_OF_SCOPE',
            confidence: 0,
            message: 'I can only assist with resume analysis and ATS optimization. Please ask about your resume score, missing skills, or how to improve your ATS match.'
        };
    }

    const intentResult = detectIntent(query);
    return {
        isValid: true,
        ...intentResult,
        domainConfidence: domainResult.confidence
    };
}

module.exports = {
    analyzeQuery,
    detectIntent,
    validateDomain
};
