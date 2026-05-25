import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Briefcase, Building2, MapPin, Users,
    Sparkles, Copy, Check, Download, RefreshCw, Loader2
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import styles from './JDGenerator.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * JD Generator Page
 * Generates job descriptions based on role, culture, and level
 */
export default function JDGenerator() {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        company: '',
        location: 'Remote',
        culture: 'startup',
        level: 'mid',
        customSkills: '',
    });

    const [templates, setTemplates] = useState({
        cultures: ['startup', 'corporate', 'agency', 'remote'],
        levels: ['entry', 'mid', 'senior', 'lead'],
        suggestedTitles: [],
    });

    const [generatedJD, setGeneratedJD] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    // Fetch templates on mount
    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const response = await axios.get(`${API_URL}/jd/templates`);
                if (response.data.success) {
                    setTemplates(response.data);
                }
            } catch (err) {
                console.error('Error fetching templates:', err);
            }
        };
        fetchTemplates();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async () => {
        if (!formData.title.trim()) {
            setError('Please enter a job title');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post(
                `${API_URL}/jd/generate`,
                {
                    ...formData,
                    customSkills: formData.customSkills.split(',').map(s => s.trim()).filter(Boolean),
                },
                { withCredentials: true }
            );

            if (response.data.success) {
                setGeneratedJD(response.data.jobDescription);
            } else {
                setError(response.data.message || 'Failed to generate JD');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error generating job description');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!generatedJD) return;

        try {
            await navigator.clipboard.writeText(generatedJD);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Copy failed:', err);
        }
    };

    const handleDownload = () => {
        if (!generatedJD) return;

        const blob = new Blob([generatedJD], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.title.replace(/\s+/g, '_')}_JD.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleTitleSuggestion = (title) => {
        setFormData(prev => ({ ...prev, title }));
    };

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 },
    };

    return (
        <>
            <Navbar />
            <main className={styles.page}>
                <div className={styles.container}>
                    {/* Header */}
                    <motion.div className={styles.header} {...fadeIn}>
                        <div className={styles.headerIcon}>
                            <FileText size={32} />
                        </div>
                        <h1>JD Generator</h1>
                        <p>Create professional job descriptions in seconds</p>
                    </motion.div>

                    <div className={styles.content}>
                        {/* Form Section */}
                        <motion.div
                            className={styles.formSection}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            {/* Job Title */}
                            <div className={styles.formGroup}>
                                <label>
                                    <Briefcase size={16} />
                                    Job Title *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Senior Software Engineer"
                                />
                                {templates.suggestedTitles.length > 0 && !formData.title && (
                                    <div className={styles.suggestions}>
                                        {templates.suggestedTitles.slice(0, 5).map(title => (
                                            <button
                                                key={title}
                                                type="button"
                                                onClick={() => handleTitleSuggestion(title)}
                                            >
                                                {title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Company Name */}
                            <div className={styles.formGroup}>
                                <label>
                                    <Building2 size={16} />
                                    Company Name
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    placeholder="Your Company Name"
                                />
                            </div>

                            {/* Location */}
                            <div className={styles.formGroup}>
                                <label>
                                    <MapPin size={16} />
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Remote / City, Country"
                                />
                            </div>

                            {/* Culture & Level Row */}
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>
                                        <Users size={16} />
                                        Culture
                                    </label>
                                    <select
                                        name="culture"
                                        value={formData.culture}
                                        onChange={handleInputChange}
                                    >
                                        {templates.cultures.map(c => (
                                            <option key={c} value={c}>
                                                {c.charAt(0).toUpperCase() + c.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className={styles.formGroup}>
                                    <label>Experience Level</label>
                                    <select
                                        name="level"
                                        value={formData.level}
                                        onChange={handleInputChange}
                                    >
                                        {templates.levels.map(l => (
                                            <option key={l} value={l}>
                                                {l.charAt(0).toUpperCase() + l.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Custom Skills */}
                            <div className={styles.formGroup}>
                                <label>Custom Skills (comma separated)</label>
                                <input
                                    type="text"
                                    name="customSkills"
                                    value={formData.customSkills}
                                    onChange={handleInputChange}
                                    placeholder="e.g. GraphQL, Docker, Kubernetes"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div className={styles.error}>{error}</div>
                            )}

                            {/* Generate Button */}
                            <button
                                className={styles.generateButton}
                                onClick={handleGenerate}
                                disabled={isLoading || !user}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={18} className={styles.spinner} />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        Generate JD
                                    </>
                                )}
                            </button>

                            {!user && (
                                <p className={styles.loginHint}>
                                    Please login to generate job descriptions
                                </p>
                            )}
                        </motion.div>

                        {/* Preview Section */}
                        <motion.div
                            className={styles.previewSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className={styles.previewHeader}>
                                <h2>Preview</h2>
                                {generatedJD && (
                                    <div className={styles.previewActions}>
                                        <button onClick={handleCopy} title="Copy to clipboard">
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                        <button onClick={handleDownload} title="Download as Markdown">
                                            <Download size={18} />
                                        </button>
                                        <button onClick={handleGenerate} title="Regenerate">
                                            <RefreshCw size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className={styles.previewContent}>
                                {generatedJD ? (
                                    <pre className={styles.jdOutput}>{generatedJD}</pre>
                                ) : (
                                    <div className={styles.emptyPreview}>
                                        <FileText size={48} />
                                        <p>Your generated JD will appear here</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>
        </>
    );
}
