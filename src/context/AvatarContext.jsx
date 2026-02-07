import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const AvatarContext = createContext(undefined);

/**
 * Simplified AvatarContext
 * 
 * Simple avatar logic:
 * - Use Google avatar if available
 * - Otherwise show initials with consistent color
 */
export function AvatarProvider({ children }) {
    const { user } = useAuth();

    /**
     * Get user initials (first letter of name)
     */
    const getInitials = () => {
        if (!user?.name) return '?';
        return user.name.charAt(0).toUpperCase();
    };

    /**
     * Generate consistent color from name
     */
    const getColor = () => {
        if (!user?.name) return '#6366f1';

        const colors = [
            '#6366f1', // indigo
            '#8b5cf6', // violet
            '#ec4899', // pink
            '#f43f5e', // rose
            '#f59e0b', // amber
            '#10b981', // emerald
            '#14b8a6', // teal
            '#0ea5e9', // sky
        ];

        // Simple hash from name
        let hash = 0;
        for (let i = 0; i < user.name.length; i++) {
            hash = user.name.charCodeAt(i) + ((hash << 5) - hash);
        }

        return colors[Math.abs(hash) % colors.length];
    };

    /**
     * Get avatar display data
     */
    const getAvatar = () => {
        // If Google user with avatar, use it
        if (user?.avatar && user.avatar.startsWith('http')) {
            return {
                type: 'image',
                src: user.avatar,
            };
        }

        // Otherwise use initials
        return {
            type: 'initials',
            initials: getInitials(),
            color: getColor(),
        };
    };

    const value = {
        getAvatar,
    };

    return (
        <AvatarContext.Provider value={value}>
            {children}
        </AvatarContext.Provider>
    );
}

export function useAvatar() {
    const context = useContext(AvatarContext);
    if (context === undefined) {
        throw new Error('useAvatar must be used within an AvatarProvider');
    }
    return context;
}
