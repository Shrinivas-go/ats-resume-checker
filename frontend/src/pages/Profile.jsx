import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Mail, MapPin, LogOut, Edit3, Save, X, Check,
    Loader2
} from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import styles from './Profile.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Profile - Enhanced user profile page with edit capability
 * 
 * Features:
 * - View and edit name, email (display only), location
 * - Predefined avatar picker with gradient options
 * - Google profile picture option (if OAuth user)
 * - Logout button
 */
export default function Profile() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        selectedAvatar: null,
    });

    // Available avatars
    const [avatars, setAvatars] = useState([]);

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                location: user.location || '',
                selectedAvatar: user.selectedAvatar || null,
            });
        }
    }, [user]);

    // Fetch available avatars
    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const response = await axios.get(`${API_URL}/profile/avatars`);
                if (response.data.success) {
                    setAvatars(response.data.avatars);
                }
            } catch (error) {
                console.error('Error fetching avatars:', error);
            }
        };
        fetchAvatars();
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarSelect = (avatarId) => {
        setFormData(prev => ({ ...prev, selectedAvatar: avatarId }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage({ type: '', text: '' });

        try {
            const response = await axios.put(
                `${API_URL}/profile`,
                formData,
                { withCredentials: true }
            );

            if (response.data.success) {
                setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
                setIsEditing(false);
                // Refresh page to update context
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            console.error('Save error:', error);
            setSaveMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original values
        if (user) {
            setFormData({
                name: user.name || '',
                location: user.location || '',
                selectedAvatar: user.selectedAvatar || null,
            });
        }
        setIsEditing(false);
        setSaveMessage({ type: '', text: '' });
    };

    // Get current avatar display
    const getCurrentAvatar = () => {
        const avatarId = formData.selectedAvatar || user?.selectedAvatar;

        // Check if using Google profile pic
        if (avatarId === 'google' && user?.avatar) {
            return { type: 'image', src: user.avatar };
        }

        // Find predefined avatar
        const avatar = avatars.find(a => a.id === avatarId);
        if (avatar) {
            return { type: 'gradient', gradient: avatar.gradient };
        }

        // Default: initials
        const name = formData.name || user?.name || '';
        const initials = name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return { type: 'initials', initials, color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    };

    const currentAvatar = getCurrentAvatar();

    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 }
    };

    return (
        <>
            <Navbar />
            <main className={styles.profile}>
                <motion.div className={styles.container} {...fadeIn}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Profile</h1>
                        {!isEditing ? (
                            <button
                                className={styles.editButton}
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit3 size={18} />
                                <span>Edit</span>
                            </button>
                        ) : (
                            <div className={styles.editActions}>
                                <button
                                    className={styles.cancelButton}
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    <X size={18} />
                                    <span>Cancel</span>
                                </button>
                                <button
                                    className={styles.saveButton}
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <Loader2 size={18} className={styles.spinner} />
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Save Message */}
                    <AnimatePresence>
                        {saveMessage.text && (
                            <motion.div
                                className={`${styles.message} ${styles[saveMessage.type]}`}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {saveMessage.type === 'success' ? <Check size={16} /> : null}
                                {saveMessage.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Avatar Section */}
                    <div className={styles.avatarSection}>
                        <div className={styles.currentAvatar}>
                            {currentAvatar.type === 'image' ? (
                                <img
                                    src={currentAvatar.src}
                                    alt={formData.name}
                                    className={styles.avatarImage}
                                />
                            ) : currentAvatar.type === 'gradient' ? (
                                <div
                                    className={styles.avatarGradient}
                                    style={{ background: currentAvatar.gradient }}
                                >
                                    {(formData.name || user?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                            ) : (
                                <div
                                    className={styles.avatarInitials}
                                    style={{ background: currentAvatar.color }}
                                >
                                    {currentAvatar.initials}
                                </div>
                            )}
                        </div>

                        {/* Avatar Picker (only in edit mode) */}
                        {isEditing && (
                            <motion.div
                                className={styles.avatarPicker}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <p className={styles.pickerLabel}>Choose an avatar:</p>
                                <div className={styles.avatarGrid}>
                                    {/* Google profile option (if OAuth user) */}
                                    {user?.avatar && (
                                        <button
                                            className={`${styles.avatarOption} ${formData.selectedAvatar === 'google' ? styles.selected : ''}`}
                                            onClick={() => handleAvatarSelect('google')}
                                            title="Use Google profile picture"
                                        >
                                            <img src={user.avatar} alt="Google" />
                                        </button>
                                    )}

                                    {/* Predefined avatars */}
                                    {avatars.map(avatar => (
                                        <button
                                            key={avatar.id}
                                            className={`${styles.avatarOption} ${formData.selectedAvatar === avatar.id ? styles.selected : ''}`}
                                            onClick={() => handleAvatarSelect(avatar.id)}
                                            title={avatar.name}
                                            style={{ background: avatar.gradient }}
                                        >
                                            <span>{(formData.name || 'U').charAt(0).toUpperCase()}</span>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className={styles.infoSection}>
                        {/* Name */}
                        <div className={styles.infoItem}>
                            <User size={20} className={styles.infoIcon} />
                            <div className={styles.infoContent}>
                                <span className={styles.infoLabel}>Name</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="Your name"
                                        maxLength={50}
                                    />
                                ) : (
                                    <span className={styles.infoValue}>{user?.name || 'Unknown'}</span>
                                )}
                            </div>
                        </div>

                        {/* Email (read-only) */}
                        <div className={styles.infoItem}>
                            <Mail size={20} className={styles.infoIcon} />
                            <div className={styles.infoContent}>
                                <span className={styles.infoLabel}>Email</span>
                                <span className={styles.infoValue}>{user?.email || 'Unknown'}</span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className={styles.infoItem}>
                            <MapPin size={20} className={styles.infoIcon} />
                            <div className={styles.infoContent}>
                                <span className={styles.infoLabel}>Location</span>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                        placeholder="City, Country"
                                        maxLength={100}
                                    />
                                ) : (
                                    <span className={styles.infoValue}>
                                        {user?.location || 'Not set'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Account Stats */}
                    <div className={styles.statsSection}>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{user?.credits || 0}</span>
                            <span className={styles.statLabel}>Credits</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statValue}>{user?.totalScans || 0}</span>
                            <span className={styles.statLabel}>Total Scans</span>
                        </div>
                    </div>

                    {/* Logout */}
                    <div className={styles.actions}>
                        <button className={styles.logoutButton} onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </motion.div>
            </main>
        </>
    );
}
