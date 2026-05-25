import { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './GoogleLoginButton.module.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Google Login Button Component
 * Handles Google OAuth sign-in and account creation
 */
export default function GoogleLoginButton({ onSuccess, onError, text = 'signin_with' }) {
    const { googleLogin } = useAuth();
    const navigate = useNavigate();
    const wrapperRef = useRef(null);
    const [buttonWidth, setButtonWidth] = useState(320);

    useEffect(() => {
        const updateWidth = () => {
            if (!wrapperRef.current) return;
            const width = wrapperRef.current.offsetWidth;
            // Google Sign-In requires a numeric width between 200–400px
            setButtonWidth(Math.min(Math.max(width, 200), 400));
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

    const handleSuccess = async (credentialResponse) => {
        if (!credentialResponse?.credential) {
            onError?.('Google did not return a sign-in credential. Check VITE_GOOGLE_CLIENT_ID and authorized origins.');
            return;
        }

        try {
            const result = await googleLogin(credentialResponse.credential);

            if (result.success) {
                if (onSuccess) {
                    onSuccess(result);
                } else {
                    navigate('/analyze');
                }
            } else {
                onError?.(result.message || 'Google sign-in failed.');
            }
        } catch (error) {
            console.error('Google sign-in error:', error);
            onError?.('Google sign-in failed. Please try again.');
        }
    };

    const handleError = () => {
        onError?.(
            'Google sign-in was cancelled or blocked. In Google Cloud Console, add this site under Authorized JavaScript origins.'
        );
    };

    if (!GOOGLE_CLIENT_ID) {
        return (
            <p className={styles.missingConfig} role="alert">
                Google sign-in is not configured. In Vercel, set <strong>VITE_GOOGLE_CLIENT_ID</strong> to your
                Google OAuth client ID (same as backend), then redeploy.
            </p>
        );
    }

    return (
        <div ref={wrapperRef} className={styles.googleButtonWrapper}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                text={text}
                shape="rectangular"
                size="large"
                width={buttonWidth}
                theme="outline"
            />
        </div>
    );
}
