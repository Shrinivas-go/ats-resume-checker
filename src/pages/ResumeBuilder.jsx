import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    Plus, Trash2, GripVertical, Download, FileText,
    User, Briefcase, GraduationCap, Code, Award, Mail, Phone, MapPin
} from 'lucide-react';
import jsPDF from 'jspdf';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import DescriptionGenerator from '../components/ResumeBuilder/DescriptionGenerator';
import ResumePreview from '../components/ResumeBuilder/ResumePreview';
import styles from './ResumeBuilder.module.css';
import html2canvas from 'html2canvas';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';

const SECTION_TYPES = {
    contact: { icon: User, label: 'Contact Info', color: '#6366f1' },
    experience: { icon: Briefcase, label: 'Experience', color: '#10b981' },
    education: { icon: GraduationCap, label: 'Education', color: '#f59e0b' },
    skills: { icon: Code, label: 'Skills', color: '#ec4899' },
    certifications: { icon: Award, label: 'Certifications', color: '#8b5cf6' },
};

const DEFAULT_SECTIONS = [
    {
        id: 'contact-1',
        type: 'contact',
        data: { name: '', email: '', phone: '', location: '', linkedin: '' }
    },
    {
        id: 'experience-1',
        type: 'experience',
        data: { items: [{ title: '', company: '', duration: '', description: '' }] }
    },
    {
        id: 'education-1',
        type: 'education',
        data: { items: [{ degree: '', institution: '', year: '', gpa: '' }] }
    },
    {
        id: 'skills-1',
        type: 'skills',
        data: { skills: '' }
    },
];

export default function ResumeBuilder() {
    const [sections, setSections] = useState(DEFAULT_SECTIONS);
    const [activeSection, setActiveSection] = useState(null);
    const [showDescriptionPanel, setShowDescriptionPanel] = useState(false);
    const [activeDescriptionField, setActiveDescriptionField] = useState(null);
    const resumeRef = useRef(null);

    const updateSection = useCallback((sectionId, newData) => {
        setSections(prev => prev.map(section =>
            section.id === sectionId
                ? { ...section, data: { ...section.data, ...newData } }
                : section
        ));
    }, []);

    const addSection = (type) => {
        const newSection = {
            id: `${type}-${Date.now()}`,
            type,
            data: type === 'experience'
                ? { items: [{ title: '', company: '', duration: '', description: '' }] }
                : type === 'education'
                    ? { items: [{ degree: '', institution: '', year: '', gpa: '' }] }
                    : type === 'skills'
                        ? { skills: '' }
                        : type === 'certifications'
                            ? { items: [{ name: '', issuer: '', date: '' }] }
                            : {}
        };
        setSections(prev => [...prev, newSection]);
    };

    const removeSection = (sectionId) => {
        setSections(prev => prev.filter(s => s.id !== sectionId));
    };

    const addItem = (sectionId) => {
        setSections(prev => prev.map(section => {
            if (section.id === sectionId && section.data.items) {
                const emptyItem = section.type === 'experience'
                    ? { title: '', company: '', duration: '', description: '' }
                    : section.type === 'education'
                        ? { degree: '', institution: '', year: '', gpa: '' }
                        : { name: '', issuer: '', date: '' };
                return {
                    ...section,
                    data: { ...section.data, items: [...section.data.items, emptyItem] }
                };
            }
            return section;
        }));
    };

    const updateItem = (sectionId, itemIndex, field, value) => {
        setSections(prev => prev.map(section => {
            if (section.id === sectionId && section.data.items) {
                const newItems = [...section.data.items];
                newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
                return { ...section, data: { ...section.data, items: newItems } };
            }
            return section;
        }));
    };

    const removeItem = (sectionId, itemIndex) => {
        setSections(prev => prev.map(section => {
            if (section.id === sectionId && section.data.items && section.data.items.length > 1) {
                const newItems = section.data.items.filter((_, i) => i !== itemIndex);
                return { ...section, data: { ...section.data, items: newItems } };
            }
            return section;
        }));
    };

    const handleApplyDescription = (description) => {
        if (activeDescriptionField) {
            const { sectionId, itemIndex } = activeDescriptionField;
            updateItem(sectionId, itemIndex, 'description', description);
            setShowDescriptionPanel(false);
            setActiveDescriptionField(null);
        }
    };

    const openDescriptionGenerator = (sectionId, itemIndex) => {
        setActiveDescriptionField({ sectionId, itemIndex });
        setShowDescriptionPanel(true);
    };

    const exportToPDF = async () => {
        if (!resumeRef.current) return;

        try {
            const canvas = await html2canvas(resumeRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate height to maintain aspect ratio
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;

            // If content is longer than one page, we might need multi-page logic
            // For MVP, we scale to fit or just print the first page heavily compressed if too long
            // But usually resume should fit on 1-2 pages.
            // Improved single-page fit logic:

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            pdf.save('resume.pdf');
        } catch (error) {
            console.error('PDF Export error:', error);
            alert('Failed to export PDF');
        }
    };

    const exportToWord = async () => {
        if (!resumeRef.current) return;

        try {
            // Basic styles for Word
            const css = `
                <style>
                    body { font-family: 'Times New Roman', serif; line-height: 1.4; }
                    h1 { font-size: 24pt; text-transform: uppercase; font-weight: bold; text-align: center; }
                    h2 { font-size: 14pt; border-bottom: 1px solid #000; text-transform: uppercase; margin-top: 20px; font-weight: bold; }
                    h3 { font-size: 12pt; font-weight: bold; }
                    p { font-size: 11pt; margin: 0; }
                    .header { text-align: center; }
                    .contact-line { text-align: center; font-size: 10pt; }
                </style>
            `;

            // We're converting the rendered HTML to Word.
            // Note: Classes won't be preserved perfectly from CSS modules, so the inline style tag above helps.
            const html = `<!DOCTYPE html>
                <html>
                <head>${css}</head>
                <body>
                    ${resumeRef.current.innerHTML}
                </body>
                </html>`;

            const blob = await asBlob(html, { orientation: 'portrait' });
            saveAs(blob, 'resume.docx');
        } catch (error) {
            console.error('Word Export error:', error);
            alert('Failed to export Word document');
        }
    };

    const renderContactSection = (section) => (
        <div className={styles.contactContainer}>
            <div className={styles.imageUpload}>
                <label className={styles.imageLabel}>
                    {section.data.profileImage ? (
                        <img src={section.data.profileImage} alt="Profile" className={styles.previewImage} />
                    ) : (
                        <div className={styles.uploadPlaceholder}>
                            <User size={24} />
                            <span>Add Photo</span>
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    updateSection(section.id, { profileImage: reader.result });
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                        className={styles.hiddenInput}
                    />
                </label>
            </div>
            <div className={styles.contactGrid}>
                <Input
                    label="Full Name"
                    value={section.data.name || ''}
                    onChange={(e) => updateSection(section.id, { name: e.target.value })}
                    icon={User}
                    placeholder="John Doe"
                />
                <Input
                    label="Job Title"
                    value={section.data.title || ''}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    icon={Briefcase}
                    placeholder="Software Engineer"
                />
                <Input
                    label="Email"
                    value={section.data.email || ''}
                    onChange={(e) => updateSection(section.id, { email: e.target.value })}
                    icon={Mail}
                    placeholder="john@example.com"
                />
                <Input
                    label="Phone"
                    value={section.data.phone || ''}
                    onChange={(e) => updateSection(section.id, { phone: e.target.value })}
                    icon={Phone}
                    placeholder="+1 234 567 890"
                />
                <Input
                    label="Location"
                    value={section.data.location || ''}
                    onChange={(e) => updateSection(section.id, { location: e.target.value })}
                    icon={MapPin}
                    placeholder="City, Country"
                />
                <Input
                    label="LinkedIn"
                    value={section.data.linkedin || ''}
                    onChange={(e) => updateSection(section.id, { linkedin: e.target.value })}
                    icon={FileText}
                    placeholder="linkedin.com/in/johndoe"
                />
            </div>
        </div>
    );

    const renderExperienceSection = (section) => (
        <div className={styles.itemsList}>
            {section.data.items?.map((item, index) => (
                <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                        <span className={styles.itemNumber}>#{index + 1}</span>
                        {section.data.items.length > 1 && (
                            <button
                                className={styles.removeItemBtn}
                                onClick={() => removeItem(section.id, index)}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                    <div className={styles.itemGrid}>
                        <Input
                            label="Job Title"
                            value={item.title}
                            onChange={(e) => updateItem(section.id, index, 'title', e.target.value)}
                            placeholder="Software Engineer"
                        />
                        <Input
                            label="Company"
                            value={item.company}
                            onChange={(e) => updateItem(section.id, index, 'company', e.target.value)}
                            placeholder="Google"
                        />
                        <Input
                            label="Duration"
                            value={item.duration}
                            onChange={(e) => updateItem(section.id, index, 'duration', e.target.value)}
                            placeholder="Jan 2020 - Present"
                        />
                    </div>
                    <div className={styles.descriptionField}>
                        <label className={styles.fieldLabel}>Description</label>
                        <textarea
                            className={styles.textarea}
                            value={item.description}
                            onChange={(e) => updateItem(section.id, index, 'description', e.target.value)}
                            placeholder="Describe your responsibilities and achievements..."
                            rows={4}
                        />
                        <button
                            className={styles.generateBtn}
                            onClick={() => openDescriptionGenerator(section.id, index)}
                        >
                            ✨ Generate Description
                        </button>
                    </div>
                </div>
            ))}
            <button className={styles.addItemBtn} onClick={() => addItem(section.id)}>
                <Plus size={16} /> Add Experience
            </button>
        </div>
    );

    const renderEducationSection = (section) => (
        <div className={styles.itemsList}>
            {section.data.items?.map((item, index) => (
                <div key={index} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                        <span className={styles.itemNumber}>#{index + 1}</span>
                        {section.data.items.length > 1 && (
                            <button
                                className={styles.removeItemBtn}
                                onClick={() => removeItem(section.id, index)}
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                    <div className={styles.itemGrid}>
                        <Input
                            label="Degree"
                            value={item.degree}
                            onChange={(e) => updateItem(section.id, index, 'degree', e.target.value)}
                            placeholder="B.S. Computer Science"
                        />
                        <Input
                            label="Institution"
                            value={item.institution}
                            onChange={(e) => updateItem(section.id, index, 'institution', e.target.value)}
                            placeholder="MIT"
                        />
                        <Input
                            label="Year"
                            value={item.year}
                            onChange={(e) => updateItem(section.id, index, 'year', e.target.value)}
                            placeholder="2020"
                        />
                        <Input
                            label="GPA (Optional)"
                            value={item.gpa}
                            onChange={(e) => updateItem(section.id, index, 'gpa', e.target.value)}
                            placeholder="3.8"
                        />
                    </div>
                </div>
            ))}
            <button className={styles.addItemBtn} onClick={() => addItem(section.id)}>
                <Plus size={16} /> Add Education
            </button>
        </div>
    );

    const renderSkillsSection = (section) => (
        <div className={styles.skillsField}>
            <label className={styles.fieldLabel}>Skills (comma separated)</label>
            <textarea
                className={styles.textarea}
                value={section.data.skills || ''}
                onChange={(e) => updateSection(section.id, { skills: e.target.value })}
                placeholder="JavaScript, React, Node.js, Python, AWS, Docker..."
                rows={3}
            />
        </div>
    );

    const renderSection = (section) => {
        switch (section.type) {
            case 'contact':
                return renderContactSection(section);
            case 'experience':
                return renderExperienceSection(section);
            case 'education':
                return renderEducationSection(section);
            case 'skills':
                return renderSkillsSection(section);
            default:
                return null;
        }
    };

    return (
        <div className={styles.page}>
            <Navbar />

            <main className={styles.main}>
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <h1 className={styles.title}>
                            <FileText size={28} />
                            Resume Builder
                        </h1>
                        <p className={styles.subtitle}>
                            Create a professional resume in minutes
                        </p>
                    </div>
                    <div className={styles.headerActions}>
                        <Button
                            variant="outline"
                            icon={FileText}
                            onClick={exportToWord}
                        >
                            Export Word
                        </Button>
                        <Button
                            variant="primary"
                            icon={Download}
                            onClick={exportToPDF}
                        >
                            Export PDF
                        </Button>
                    </div>
                </div>

                <div className={styles.builderLayout}>
                    <div className={styles.editorPanel}>
                        {/* Add Section Toolbar */}
                        <Card padding="md" className={styles.toolbar}>
                            <span className={styles.toolbarLabel}>Add Section:</span>
                            <div className={styles.toolbarButtons}>
                                {Object.entries(SECTION_TYPES).map(([type, config]) => (
                                    <button
                                        key={type}
                                        className={styles.toolbarBtn}
                                        onClick={() => addSection(type)}
                                        style={{ '--btn-color': config.color }}
                                    >
                                        <config.icon size={16} />
                                        {config.label}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Sections */}
                        <div className={styles.sectionsContainer}>
                            {sections.map((section, index) => {
                                const config = SECTION_TYPES[section.type];
                                return (
                                    <motion.div
                                        key={section.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={styles.sectionCard}
                                        style={{ '--section-color': config?.color }}
                                    >
                                        <div className={styles.sectionHeader}>
                                            <div className={styles.sectionTitle}>
                                                <GripVertical size={16} className={styles.dragHandle} />
                                                {config?.icon && <config.icon size={18} />}
                                                <span>{config?.label || section.type}</span>
                                            </div>
                                            {section.type !== 'contact' && (
                                                <button
                                                    className={styles.removeSectionBtn}
                                                    onClick={() => removeSection(section.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <div className={styles.sectionContent}>
                                            {renderSection(section)}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Preview Panel (Canvas) */}
                    <div className={styles.previewPanel}>
                        <div className={styles.scaleContainer}>
                            <ResumePreview sections={sections} ref={resumeRef} />
                        </div>
                    </div>
                </div>

                {/* Description Generator Panel */}
                {showDescriptionPanel && (
                    <DescriptionGenerator
                        onApply={handleApplyDescription}
                        onClose={() => {
                            setShowDescriptionPanel(false);
                            setActiveDescriptionField(null);
                        }}
                    />
                )}
            </main>

            <Footer />
        </div>
    );
}
