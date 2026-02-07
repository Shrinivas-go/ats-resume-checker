import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Loader2, CheckCircle, AlertTriangle, Check, Info, Download, Lock, ArrowRight, Eye, Clock, BookOpen, BarChart2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Textarea from '../components/ui/Textarea';
import Badge from '../components/ui/Badge';
import Alert from '../components/ui/Alert';
import ScoreRing from '../components/ui/ScoreRing';
import ScanningAnimation from '../components/ui/ScanningAnimation';
import AIAssistant from '../components/AIAssistant/AIAssistant';
import { useAuth } from '../context/AuthContext';
import styles from './ResumeAnalysis.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Helper: Calculate Readability (Simplified Flesch-Kincaid-ish)
const calculateReadability = (text) => {
    if (!text) return { score: 0, level: 'Unknown' };
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = words / Math.max(1, sentences);

    // Simplistic heuristic
    if (avgWordsPerSentence > 20) return { score: 60, level: 'Complex' };
    if (avgWordsPerSentence > 14) return { score: 80, level: 'Professional' };
    return { score: 95, level: 'Easy to Read' };
};

// Helper: Calculate Skim Time
const calculateSkimTime = (text) => {
    if (!text) return '0s';
    const words = text.split(/\s+/).length;
    // Recruiters read fast ~ 700 wpm skimming or 250 reading. 
    // "6-second test" is for layout, but full read is longer.
    // Let's est. skim time at 400 wpm
    const seconds = Math.ceil((words / 400) * 60);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.ceil(seconds / 60)}m`;
};

const STRONG_VERBS = [
    'accelerated', 'achieved', 'analyzed', 'built', 'collborated', 'created', 'delivered', 'developed',
    'driven', 'enhanced', 'expanded', 'generated', 'improved', 'increased', 'initiated', 'led',
    'managed', 'maximized', 'optimized', 'orchestrated', 'reduced', 'resolved', 'spearheaded',
    'streamlined', 'transformed', 'utilized', 'won'
];

const calculateActionVerbs = (text) => {
    if (!text) return { score: 0, count: 0, unique: 0 };
    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const used = STRONG_VERBS.filter(verb => words.includes(verb));
    const unique = [...new Set(used)];

    // Score based on unique verbs usage (aim for 5+)
    let score = Math.min(100, unique.length * 20);
    let level = 'Weak';
    if (score >= 80) level = 'Strong';
    else if (score >= 40) level = 'Good';

    return { score, count: used.length, unique: unique.length, level };
};

const calculateQuantifiableMetrics = (text) => {
    if (!text) return { count: 0, level: 'None' };
    // Look for %, $, K+, M+, and numbers associated with results
    const matches = text.match(/(\d+%|\$\d+|\d+k\+|\d+m\+)/gi) || [];
    const count = matches.length;

    let level = 'Needs Improvement';
    if (count >= 5) level = 'Excellent';
    else if (count >= 3) level = 'Good';

    return { count, level };
};

export default function ResumeAnalysis() {
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [parsedData, setParsedData] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [loading, setLoading] = useState({ parsing: false, analyzing: false });
    const [error, setError] = useState('');
    const [insights, setInsights] = useState(null);

    // Calculate extra insights when parsedData changes
    useEffect(() => {
        if (parsedData?.rawText) {
            setInsights({
                readability: calculateReadability(parsedData.rawText),
                skimTime: calculateSkimTime(parsedData.rawText),
                wordCount: parsedData.rawText.split(/\s+/).length,
                actionVerbs: calculateActionVerbs(parsedData.rawText),
                metrics: calculateQuantifiableMetrics(parsedData.rawText)
            });
        }
    }, [parsedData]);

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'application/pdf') {
                setError('Please upload a PDF file');
                return;
            }
            setFile(selectedFile);
            setParsedData(null);
            setAnalysisResult(null);
            setInsights(null);
            setError('');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            if (droppedFile.type !== 'application/pdf') {
                setError('Please upload a PDF file');
                return;
            }
            setFile(droppedFile);
            setParsedData(null);
            setAnalysisResult(null);
            setInsights(null);
            setError('');
        }
    };

    const handleParseResume = async () => {
        if (!file) return;

        setLoading(prev => ({ ...prev, parsing: true }));
        setError('');

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const res = await axios.post(
                `${API_URL}/parse-resume`,
                formData,
                {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true
                }
            );

            if (res.data.success) {
                setParsedData(res.data.data);
            } else {
                setError(res.data.message || 'Failed to parse resume');
            }
        } catch (err) {
            setError('Server error: ' + (err.message || 'Unable to parse resume'));
        } finally {
            setLoading(prev => ({ ...prev, parsing: false }));
        }
    };

    const handleAnalyze = async () => {
        if (!parsedData || !jobDescription.trim()) return;

        setLoading(prev => ({ ...prev, analyzing: true }));
        setError('');

        try {
            // Send full parsed data to the advanced analysis endpoint
            const res = await axios.post(
                `${API_URL}/ats-analyze`,
                {
                    parsedResume: parsedData,
                    jobDescription: jobDescription,
                },
                { withCredentials: true }
            );

            if (res.data.success || res.status === 200) {
                setAnalysisResult(res.data);
            } else {
                setError(res.data.message || 'Failed to analyze resume');
            }
        } catch (err) {
            console.error('Analysis failed:', err);
            const msg = err.response?.data?.message || err.message || 'Unable to connect to server';
            setError(`Analysis failed: ${msg}`);
        } finally {
            setLoading(prev => ({ ...prev, analyzing: false }));
        }
    };

    const downloadPDF = () => {
        if (!analysisResult) return;

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let yPos = 20;

        // Header
        doc.setFontSize(22);
        doc.setTextColor(109, 94, 243); // Brand Purple
        doc.text('ATS Analysis Report', margin, yPos);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, margin, yPos + 6);

        yPos += 20;

        // Score Section
        doc.setFillColor(245, 247, 255); // Light purple bg
        doc.rect(margin, yPos, pageWidth - (margin * 2), 40, 'F');

        doc.setFontSize(14);
        doc.setTextColor(50, 50, 50);
        doc.text('Overall Match Score', margin + 10, yPos + 15);

        doc.setFontSize(32);
        doc.setTextColor(109, 94, 243);
        doc.setFont(undefined, 'bold');
        doc.text(`${analysisResult.score}%`, margin + 10, yPos + 30);

        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text(`Skills: ${Math.round(analysisResult.skillScore)}%`, margin + 80, yPos + 15);
        doc.text(`Quality: ${Math.round(analysisResult.qualityScore)}%`, margin + 80, yPos + 30);

        yPos += 50;

        // Critical Issues
        if (analysisResult.quality?.issues?.length > 0) {
            doc.setFontSize(14);
            doc.setTextColor(220, 38, 38); // Red
            doc.setFont(undefined, 'bold');
            doc.text('Critical Issues', margin, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            doc.setFont(undefined, 'normal');

            analysisResult.quality.issues.forEach(issue => {
                if (yPos > 270) { doc.addPage(); yPos = 20; }
                const lines = doc.splitTextToSize(`• ${issue.message}`, pageWidth - (margin * 2));
                doc.text(lines, margin, yPos);
                yPos += (lines.length * 7) + 5;
            });
            yPos += 10;
        }

        // Missing Skills
        if (analysisResult.skills?.missing?.length > 0) {
            if (yPos > 260) { doc.addPage(); yPos = 20; }

            doc.setFontSize(14);
            doc.setTextColor(220, 38, 38);
            doc.setFont(undefined, 'bold');
            doc.text('Missing Skills', margin, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            doc.setFont(undefined, 'normal');

            const missingText = analysisResult.skills.missing.join(', ');
            const lines = doc.splitTextToSize(missingText, pageWidth - (margin * 2));
            doc.text(lines, margin, yPos);
            yPos += (lines.length * 7) + 10;

        }

        // Recommendations
        if (analysisResult.quality?.improvements?.length > 0) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }

            doc.setFontSize(14);
            doc.setTextColor(109, 94, 243);
            doc.setFont(undefined, 'bold');
            doc.text('Recommendations', margin, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            doc.setFont(undefined, 'normal');

            analysisResult.quality.improvements.forEach(imp => {
                if (yPos > 270) { doc.addPage(); yPos = 20; }
                const lines = doc.splitTextToSize(`• ${imp}`, pageWidth - (margin * 2));
                doc.text(lines, margin, yPos);
                yPos += (lines.length * 7);
            });
        }

        if (insights && insights.actionVerbs.unique < 5) {
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            yPos += 10;
            doc.setFontSize(14);
            doc.setTextColor(109, 94, 243);
            doc.setFont(undefined, 'bold');
            doc.text('Action Verbs Analysis', margin, yPos);
            yPos += 10;

            doc.setFontSize(10);
            doc.setTextColor(50, 50, 50);
            doc.setFont(undefined, 'normal');
            const verbText = `Your resume uses only ${insights.actionVerbs.unique} strong action verbs. Consider using words like: Analyzed, Developed, Led, Managed.`;
            const lines = doc.splitTextToSize(verbText, pageWidth - (margin * 2));
            doc.text(lines, margin, yPos);
        }

        doc.save('ats-analysis-report.pdf');
    };

    const removeFile = () => {
        setFile(null);
        setParsedData(null);
        setAnalysisResult(null);
        setInsights(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Analyze Your Resume</h1>
                        <p className={styles.subtitle}>
                            Upload your resume and paste a job description for a deep dive analysis.
                        </p>
                    </div>

                    {error && (
                        <Alert variant="error" onClose={() => setError('')} className={styles.alert}>
                            {error}
                        </Alert>
                    )}

                    <div className={styles.grid}>
                        {/* Left Column - Upload & Job Description */}
                        <div className={styles.inputColumn}>
                            {/* File Upload */}
                            <Card padding="lg">
                                <Card.Header>
                                    <Card.Title>Upload Resume</Card.Title>
                                    <Card.Description>PDF format only, max 5MB</Card.Description>
                                </Card.Header>
                                <Card.Content>
                                    {!user ? (
                                        <div className={styles.lockedState}>
                                            <div className={styles.lockIcon}>
                                                <Lock size={32} />
                                            </div>
                                            <h3>Unlock Advanced Analysis</h3>
                                            <p>To ensure security and save your results, please sign in to upload your resume.</p>
                                            <div className={styles.authButtons}>
                                                <Link to="/login">
                                                    <Button icon={ArrowRight} iconPosition="right">
                                                        Login to Analyze
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ) : !file ? (
                                        <div
                                            className={styles.dropzone}
                                            onDrop={handleDrop}
                                            onDragOver={(e) => e.preventDefault()}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileSelect}
                                                className={styles.fileInput}
                                            />
                                            <Upload size={32} className={styles.uploadIcon} />
                                            <p className={styles.dropzoneText}>
                                                Drop your resume here or <span>browse</span>
                                            </p>
                                        </div>
                                    ) : (
                                        <div className={styles.filePreview}>
                                            <FileText size={24} className={styles.fileIcon} />
                                            <div className={styles.fileInfo}>
                                                <p className={styles.fileName}>{file.name}</p>
                                                <p className={styles.fileSize}>
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                            <button
                                                className={styles.removeFile}
                                                onClick={removeFile}
                                                aria-label="Remove file"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    )}

                                    {file && !parsedData && user && (
                                        <Button
                                            onClick={handleParseResume}
                                            loading={loading.parsing}
                                            fullWidth
                                            className={styles.parseButton}
                                        >
                                            {loading.parsing ? 'Parsing...' : 'Parse Resume'}
                                        </Button>
                                    )}

                                    {parsedData && (
                                        <div className={styles.parsedSuccess}>
                                            <CheckCircle size={18} />
                                            <span>Resume parsed successfully</span>
                                        </div>
                                    )}

                                    <div className={styles.builderPrompt}>
                                        <p>Don't have a resume yet?</p>
                                        <Link to="/builder">
                                            <Button variant="secondary" fullWidth>
                                                Create Resume with AI
                                            </Button>
                                        </Link>
                                    </div>
                                </Card.Content>
                            </Card>

                            {/* Job Description */}
                            <Card padding="lg">
                                <Card.Header>
                                    <Card.Title>Job Description</Card.Title>
                                    <Card.Description>
                                        Paste the job posting you're applying for
                                    </Card.Description>
                                </Card.Header>
                                <Card.Content>
                                    <Textarea
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        placeholder="Paste the job description here..."
                                        rows={8}
                                        disabled={!user}
                                    />

                                    <Button
                                        onClick={handleAnalyze}
                                        loading={loading.analyzing}
                                        disabled={!parsedData || !jobDescription.trim() || !user}
                                        fullWidth
                                        className={styles.analyzeButton}
                                    >
                                        {loading.analyzing ? 'Analyzing...' : 'Analyze Match'}
                                    </Button>
                                </Card.Content>
                            </Card>
                        </div>

                        {/* Right Column - Results */}
                        <div className={styles.resultColumn}>
                            <AnimatePresence mode="wait">
                                {analysisResult ? (
                                    <motion.div
                                        key="results"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={styles.resultColumn} // Ensure layout flex
                                    >
                                        {/* Score Card */}
                                        <Card padding="lg" className={styles.scoreCard}>
                                            <div className={styles.scoreHeader}>
                                                <ScoreRing
                                                    score={analysisResult.score}
                                                    label={analysisResult.scoreLabel}
                                                />
                                            </div>
                                            <p className={styles.feedback}>
                                                {analysisResult.feedback?.summary}
                                            </p>

                                            {/* Detailed Breakdown */}
                                            <div className={styles.scoreBreakdown}>
                                                <div className={styles.breakdownItem}>
                                                    <span className={styles.breakdownLabel}>Relevance</span>
                                                    <span className={styles.breakdownValue}>{Math.round(analysisResult.skillScore)}%</span>
                                                </div>
                                                <div className={styles.breakdownItem}>
                                                    <span className={styles.breakdownLabel}>Quality</span>
                                                    <span className={styles.breakdownValue}>{Math.round(analysisResult.qualityScore)}%</span>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={downloadPDF}
                                                variant="secondary"
                                                icon={Download}
                                                className={styles.downloadButton}
                                            >
                                                Download Report
                                            </Button>
                                        </Card>

                                        {/* New: Deep Insights (Readability & Skimmability) */}
                                        {insights && (
                                            <Card padding="lg">
                                                <Card.Header>
                                                    <Card.Title>Recruiter Insights</Card.Title>
                                                    <Card.Description>How humans perceive your resume</Card.Description>
                                                </Card.Header>
                                                <Card.Content>
                                                    <div className={styles.insightGrid}>
                                                        <div className={styles.insightItem}>
                                                            <div className={styles.insightIconWrapper}>
                                                                <BookOpen size={20} className={styles.insightIcon} />
                                                            </div>
                                                            <div className={styles.insightContent}>
                                                                <span className={styles.insightLabel}>Readability</span>
                                                                <span className={styles.insightValue}>{insights.readability.level}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.insightItem}>
                                                            <div className={styles.insightIconWrapper}>
                                                                <Clock size={20} className={styles.insightIcon} />
                                                            </div>
                                                            <div className={styles.insightContent}>
                                                                <span className={styles.insightLabel}>Est. Skim Time</span>
                                                                <span className={styles.insightValue}>{insights.skimTime}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.insightItem}>
                                                            <div className={styles.insightIconWrapper}>
                                                                <BarChart2 size={20} className={styles.insightIcon} />
                                                            </div>
                                                            <div className={styles.insightContent}>
                                                                <span className={styles.insightLabel}>Word Count</span>
                                                                <span className={styles.insightValue}>{insights.wordCount}</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.insightItem}>
                                                            <div className={styles.insightIconWrapper}>
                                                                <CheckCircle size={20} className={styles.insightIcon} />
                                                            </div>
                                                            <div className={styles.insightContent}>
                                                                <span className={styles.insightLabel}>Action Verbs</span>
                                                                <span className={styles.insightValue}>{insights.actionVerbs.level} ({insights.actionVerbs.unique})</span>
                                                            </div>
                                                        </div>
                                                        <div className={styles.insightItem}>
                                                            <div className={styles.insightIconWrapper}>
                                                                <BarChart2 size={20} className={styles.insightIcon} />
                                                            </div>
                                                            <div className={styles.insightContent}>
                                                                <span className={styles.insightLabel}>Metrics</span>
                                                                <span className={styles.insightValue}>{insights.metrics.count} Found</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card.Content>
                                            </Card>
                                        )}

                                        {/* New: Section Analysis (Completeness) */}
                                        {analysisResult.quality?.sections && (
                                            <Card padding="lg">
                                                <Card.Header>
                                                    <Card.Title>Section Analysis</Card.Title>
                                                </Card.Header>
                                                <Card.Content>
                                                    <div className={styles.sectionGrid}>
                                                        {Object.entries(analysisResult.quality.sections).map(([section, score]) => (
                                                            <div key={section} className={styles.sectionItem}>
                                                                <div className={styles.sectionHeader}>
                                                                    <span className={styles.sectionName}>
                                                                        {section.charAt(0).toUpperCase() + section.slice(1)}
                                                                    </span>
                                                                    {score > 0 ? (
                                                                        <CheckCircle size={16} className={styles.sectionSuccess} />
                                                                    ) : (
                                                                        <AlertTriangle size={16} className={styles.sectionWarning} />
                                                                    )}
                                                                </div>
                                                                <div className={styles.progressBar}>
                                                                    <div
                                                                        className={styles.progressFill}
                                                                        style={{
                                                                            width: score > 0 ? '100%' : '5%',
                                                                            backgroundColor: score > 0 ? 'var(--success)' : 'var(--warning)'
                                                                        }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card.Content>
                                            </Card>
                                        )}

                                        {/* Critical Issues */}
                                        {analysisResult.quality?.issues?.length > 0 && (
                                            <Card padding="lg">
                                                <Card.Header>
                                                    <Card.Title>Critical Issues</Card.Title>
                                                </Card.Header>
                                                <Card.Content>
                                                    <div className={styles.issueList}>
                                                        {analysisResult.quality.issues.map((issue, i) => (
                                                            <div key={i} className={`${styles.issueItem} ${styles[issue.type]}`}>
                                                                <AlertTriangle size={18} className={styles.issueIcon} />
                                                                <div className={styles.issueContent}>
                                                                    <h4>{issue.type === 'critical' ? 'Action Required' : 'Suggestion'}</h4>
                                                                    <p>{issue.message}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card.Content>
                                            </Card>
                                        )}

                                        {/* Improvements & Recommendations */}
                                        {(analysisResult.quality?.improvements?.length > 0 || analysisResult.feedback?.skillRecommendations?.length > 0) && (
                                            <Card padding="lg">
                                                <Card.Header>
                                                    <Card.Title>Recommendations</Card.Title>
                                                </Card.Header>
                                                <Card.Content>
                                                    <div className={styles.recList}>
                                                        {/* Skill Recommendations */}
                                                        {analysisResult.feedback?.skillRecommendations?.map((rec, i) => (
                                                            <div key={`skill-${i}`} className={styles.recItem}>
                                                                <Info size={16} className={styles.recIcon} />
                                                                <span>{rec}</span>
                                                            </div>
                                                        ))}

                                                        {/* Quality Improvements */}
                                                        {analysisResult.quality?.improvements?.map((imp, i) => (
                                                            <div key={`qual-${i}`} className={styles.recItem}>
                                                                <Check size={16} className={styles.recIcon} />
                                                                <span>{imp}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card.Content>
                                            </Card>
                                        )}

                                        {/* Matched Skills */}
                                        {analysisResult.skills?.matched?.length > 0 && (
                                            <Card padding="lg">
                                                <Card.Header>
                                                    <Card.Title>Matched Skills</Card.Title>
                                                </Card.Header>
                                                <Card.Content>
                                                    <div className={styles.skillsGrid}>
                                                        {analysisResult.skills.matched.map((skill, i) => (
                                                            <Badge key={i} variant="success">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </Card.Content>
                                            </Card>
                                        )}

                                        {/* Missing Skills */}
                                        {analysisResult.skills?.missing?.length > 0 && (
                                            <Card padding="lg">
                                                <Card.Header>
                                                    <Card.Title>Missing Skills</Card.Title>
                                                </Card.Header>
                                                <Card.Content>
                                                    <div className={styles.skillsGrid}>
                                                        {analysisResult.skills.missing.map((skill, i) => (
                                                            <Badge key={i} variant="error">
                                                                {skill}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </Card.Content>
                                            </Card>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className={styles.emptyState}
                                    >
                                        {loading.analyzing ? (
                                            <ScanningAnimation
                                                fileName={file?.name || 'Resume'}
                                                stage="matching"
                                            />
                                        ) : (
                                            <>
                                                <div className={styles.emptyIcon}>
                                                    <FileText size={48} />
                                                </div>
                                                <h3>Start Your Analysis</h3>
                                                <p>Upload a resume and job description to get a detailed ATS score.</p>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            {/* AI Assistant Chat */}
            <AIAssistant
                analysisResult={analysisResult}
                isVisible={!!analysisResult}
            />
        </div>
    );
}
