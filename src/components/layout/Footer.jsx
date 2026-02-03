import { Link } from 'react-router-dom';
import { FileText, Twitter, Linkedin, Github } from 'lucide-react';
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
                            <a href="#" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
                            <a href="#" aria-label="GitHub"><Github size={20} /></a>
                        </div>
                    </div>

                    {/* Links */}
                    <div className={styles.links}>
                        <h4>Product</h4>
                        <ul>
                            <li><Link to="/analyze">Analyze Resume</Link></li>
                            <li><Link to="/pricing">Pricing</Link></li>
                            <li><Link to="/examples">Examples</Link></li>
                        </ul>
                    </div>

                    <div className={styles.links}>
                        <h4>Company</h4>
                        <ul>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/blog">Blog</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    <div className={styles.links}>
                        <h4>Legal</h4>
                        <ul>
                            <li><Link to="/privacy">Privacy Policy</Link></li>
                            <li><Link to="/terms">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>© 2026 ATS Checker. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
