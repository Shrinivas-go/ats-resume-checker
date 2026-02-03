import React, { forwardRef } from 'react';
import { Mail, Phone, MapPin, Linkedin, Link as LinkIcon, ExternalLink } from 'lucide-react';
import styles from './ResumePreview.module.css';

const ResumePreview = forwardRef(({ sections }, ref) => {

    // Helper to find data by section type
    const getSectionData = (type) => {
        return sections.find(s => s.type === type)?.data || {};
    };

    const contact = getSectionData('contact');

    // Sort sections order (excluding contact which is always top)
    // You might want to allow reordering later
    const contentSections = sections.filter(s => s.type !== 'contact');

    return (
        <div className={styles.previewContainer}>
            <div className={styles.a4Page} ref={ref}>
                {/* Header / Contact */}
                <header className={styles.header}>
                    <div className={styles.headerTop}>
                        {contact.profileImage && (
                            <img src={contact.profileImage} alt="Profile" className={styles.profileImage} />
                        )}
                        <div className={styles.headerText}>
                            <h1 className={styles.name}>{contact.name || 'Your Name'}</h1>
                            {contact.title && <h2 className={styles.jobTitle}>{contact.title}</h2>}
                        </div>
                    </div>

                    <div className={styles.contactLine}>
                        {contact.email && (
                            <div className={styles.contactItem}>
                                <Mail size={12} />
                                <span>{contact.email}</span>
                            </div>
                        )}
                        {contact.phone && (
                            <div className={styles.contactItem}>
                                <Phone size={12} />
                                <span>{contact.phone}</span>
                            </div>
                        )}
                        {contact.location && (
                            <div className={styles.contactItem}>
                                <MapPin size={12} />
                                <span>{contact.location}</span>
                            </div>
                        )}
                        {contact.linkedin && (
                            <div className={styles.contactItem}>
                                <Linkedin size={12} />
                                <span>{contact.linkedin}</span>
                            </div>
                        )}
                    </div>
                </header>

                <div className={styles.mainContent}>
                    {contentSections.map((section) => {
                        const { type, data } = section;

                        if (type === 'experience') {
                            return (
                                <section key={section.id} className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Experience</h2>
                                    <div className={styles.sectionContent}>
                                        {data.items?.map((item, idx) => (
                                            <div key={idx} className={styles.experienceItem}>
                                                <div className={styles.itemHeader}>
                                                    <h3 className={styles.itemTitle}>{item.title}</h3>
                                                    <span className={styles.itemDuration}>{item.duration}</span>
                                                </div>
                                                <div className={styles.itemSubHeader}>
                                                    <span className={styles.itemCompany}>{item.company}</span>
                                                </div>
                                                {item.description && (
                                                    <p className={styles.itemDescription}>{item.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        if (type === 'education') {
                            return (
                                <section key={section.id} className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Education</h2>
                                    <div className={styles.sectionContent}>
                                        {data.items?.map((item, idx) => (
                                            <div key={idx} className={styles.educationItem}>
                                                <div className={styles.itemHeader}>
                                                    <h3 className={styles.itemTitle}>{item.institution}</h3>
                                                    <span className={styles.itemDuration}>{item.year}</span>
                                                </div>
                                                <div className={styles.itemSubHeader}>
                                                    <span className={styles.itemCompany}>{item.degree}</span>
                                                    {item.gpa && <span> • GPA: {item.gpa}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        if (type === 'skills') {
                            return (
                                <section key={section.id} className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Skills</h2>
                                    <div className={styles.sectionContent}>
                                        <p className={styles.skillsText}>{data.skills}</p>
                                    </div>
                                </section>
                            );
                        }

                        if (type === 'certifications') {
                            return (
                                <section key={section.id} className={styles.section}>
                                    <h2 className={styles.sectionTitle}>Certifications</h2>
                                    <div className={styles.sectionContent}>
                                        {data.items?.map((item, idx) => (
                                            <div key={idx} className={styles.certItem}>
                                                <span className={styles.certName}>{item.name}</span>
                                                {(item.issuer || item.date) && (
                                                    <span className={styles.certDetails}>
                                                        {item.issuer}{item.issuer && item.date ? ' - ' : ''}{item.date}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        }

                        return null;
                    })}
                </div>
            </div>
        </div>
    );
});

ResumePreview.displayName = 'ResumePreview';

export default ResumePreview;
