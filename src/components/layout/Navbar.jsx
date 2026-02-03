import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import styles from './Navbar.module.css';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/analyze', label: 'Analyze Resume' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                {/* Logo */}
                <Link to="/" className={styles.logo}>
                    <FileText size={24} className={styles.logoIcon} />
                    <span className={styles.logoText}>ATS Checker</span>
                </Link>

                {/* Desktop Navigation */}
                <div className={styles.desktopNav}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`${styles.navLink} ${isActive(link.to) ? styles.active : ''}`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Right side actions */}
                <div className={styles.actions}>
                    <button
                        onClick={toggleTheme}
                        className={styles.themeToggle}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    <Link to="/login" className={styles.loginLink}>
                        Log in
                    </Link>

                    <Link to="/register" className={styles.ctaButton}>
                        Get Started
                    </Link>

                    {/* Mobile menu button */}
                    <button
                        className={styles.mobileMenuButton}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className={styles.mobileNav}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`${styles.mobileNavLink} ${isActive(link.to) ? styles.active : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
}
