import { Link } from 'react-router-dom';
import { FileText, Twitter, Linkedin, Github, Mail } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Brand */}
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <FileText size={24} className={styles.logoIcon} />
                            <span className={styles.logoText}>ATS Checker</span>
                        </div>
                        <p className={styles.tagline}>
                            Helping job seekers land their dream jobs with AI-powered resume optimization.
                        </p>
                        <div className={styles.social}>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                                <Twitter size={20} />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <Linkedin size={20} />
                            </a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <Github size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div className={styles.links}>
                        <h4>Product</h4>
                        <ul>
                            <li><Link to="/analyze">Analyze Resume</Link></li>
                            <li><Link to="/builder">Resume Builder</Link></li>
                            <li><Link to="/pricing">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div className={styles.links}>
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className={styles.links}>
                        <h4>Resources</h4>
                        <ul>
                            <li><Link to="/docs">Documentation</Link></li>
                            <li><Link to="/help">Help & Support</Link></li>
                            <li><a href="mailto:support@atschecker.com"><Mail size={14} /> support@atschecker.com</a></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© 2026 ATS Checker. All rights reserved.</p>
                    <div className={styles.legalLinks}>
                        <Link to="/docs">Privacy Policy</Link>
                        <span>•</span>
                        <Link to="/docs">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
