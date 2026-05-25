import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, FileText, Menu, X, User, LogOut, ChevronDown, LayoutDashboard, HelpCircle, BookOpen, Settings } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../context/AvatarContext';
import styles from './Navbar.module.css';

/**
 * Navbar - Production SaaS Navigation
 * 
 * Structure:
 * - Logo + Brand
 * - Main Nav: Home | Analyze | Builder | Pricing | Blog | Help | About | Contact | Docs
 * - Right: Dark Mode Toggle + Profile Dropdown (when auth) or Login/Register
 * 
 * Profile Dropdown (Radix UI):
 * - Dashboard
 * - Profile & Settings
 * - Help & Support
 * - Blog
 * - Logout
 */
export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { isAuthenticated, user, logout } = useAuth();
    const { getAvatar } = useAvatar();
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Main navigation links - always visible
    const mainNavLinks = [
        { to: '/', label: 'Home' },
        { to: '/analyze', label: 'Analyze' },
        { to: '/builder', label: 'Builder' },
        { to: '/pricing', label: 'Pricing' },
        { to: '/blog', label: 'Blog' },
        { to: '/help', label: 'Help' },
        { to: '/about', label: 'About' },
        { to: '/contact', label: 'Contact' },
        { to: '/docs', label: 'Docs' },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        await logout();
        setMobileMenuOpen(false);
        navigate('/');
    };

    const avatar = isAuthenticated ? getAvatar() : null;

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                {/* Logo */}
                <Link to="/" className={styles.logo}>
                    <FileText size={24} className={styles.logoIcon} />
                    <span className={styles.logoText}>ATS Checker</span>
                </Link>

                {/* Desktop Navigation - Main Links */}
                <div className={styles.desktopNav}>
                    {mainNavLinks.map((link) => (
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
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={styles.themeToggle}
                        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className={styles.loginLink}>
                                Log in
                            </Link>
                            <Link to="/register" className={styles.ctaButton}>
                                Get Started
                            </Link>
                        </>
                    ) : (
                        /* Profile Dropdown with Radix UI */
                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <button className={styles.profileButton}>
                                    {avatar?.type === 'image' ? (
                                        <img src={avatar.src} alt="Profile" className={styles.avatarImage} />
                                    ) : (
                                        <div
                                            className={styles.avatar}
                                            style={{ background: avatar?.color || '#6366f1' }}
                                        >
                                            {avatar?.initials || '?'}
                                        </div>
                                    )}
                                    <span className={styles.userName}>{user?.name || 'User'}</span>
                                    <ChevronDown size={16} />
                                </button>
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Portal>
                                <DropdownMenu.Content className={styles.dropdownContent} sideOffset={8} align="end">
                                    {/* User info header */}
                                    <div className={styles.dropdownHeader}>
                                        <span className={styles.dropdownEmail}>{user?.email}</span>
                                        {user?.isAdmin && (
                                            <span className={styles.adminBadge}>Admin</span>
                                        )}
                                    </div>

                                    <DropdownMenu.Separator className={styles.dropdownSeparator} />

                                    <DropdownMenu.Item asChild>
                                        <Link to="/dashboard" className={styles.dropdownItem}>
                                            <LayoutDashboard size={16} />
                                            <span>Dashboard</span>
                                        </Link>
                                    </DropdownMenu.Item>

                                    <DropdownMenu.Item asChild>
                                        <Link to="/profile" className={styles.dropdownItem}>
                                            <Settings size={16} />
                                            <span>Profile & Settings</span>
                                        </Link>
                                    </DropdownMenu.Item>

                                    <DropdownMenu.Separator className={styles.dropdownSeparator} />

                                    <DropdownMenu.Item asChild>
                                        <Link to="/help" className={styles.dropdownItem}>
                                            <HelpCircle size={16} />
                                            <span>Help & Support</span>
                                        </Link>
                                    </DropdownMenu.Item>

                                    <DropdownMenu.Item asChild>
                                        <Link to="/blog" className={styles.dropdownItem}>
                                            <BookOpen size={16} />
                                            <span>Blog</span>
                                        </Link>
                                    </DropdownMenu.Item>

                                    <DropdownMenu.Separator className={styles.dropdownSeparator} />

                                    <DropdownMenu.Item
                                        className={styles.dropdownItem}
                                        onSelect={handleLogout}
                                    >
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    )}

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
                    {mainNavLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`${styles.mobileNavLink} ${isActive(link.to) ? styles.active : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {isAuthenticated && (
                        <>
                            <div className={styles.mobileDivider} />
                            <Link
                                to="/dashboard"
                                className={styles.mobileNavLink}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/profile"
                                className={styles.mobileNavLink}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Profile & Settings
                            </Link>
                            <button className={styles.mobileLogoutButton} onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
