import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './GoogleLoginButton.module.css';

/**
 * Google Login Button Component
 * Handles Google OAuth sign-in and account creation
 */
export default function GoogleLoginButton({ onSuccess, onError, text = 'signin_with' }) {
    const { googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        try {
            const result = await googleLogin(credentialResponse.credential);

            if (result.success) {
                if (onSuccess) {
                    onSuccess(result);
                } else {
                    // Default behavior: redirect to dashboard
                    navigate('/analyze');
                }
            } else {
                if (onError) {
                    onError(result.message);
                }
            }
        } catch (error) {
            if (onError) {
                onError('Google sign-in failed. Please try again.');
            }
        }
    };

    const handleError = () => {
        if (onError) {
            onError('Google sign-in was cancelled or failed.');
        }
    };

    return (
        <div className={styles.googleButtonWrapper}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                text={text}
                shape="rectangular"
                size="large"
                width="100%"
                theme="outline"
            />
        </div>
    );
}
