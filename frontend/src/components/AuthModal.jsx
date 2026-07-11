import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { useBackendStatus } from '../hooks/useBackendStatus';
import BackendWarmupCard from './BackendWarmupCard';

export default function AuthModal({ isOpen, mode, onClose, onSwitchMode }) {
  const { login, register, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Only poll when the modal is actually open
  const { isReady, isChecking } = useBackendStatus({ enabled: isOpen });

  if (!isOpen) return null;

  const backendDown = !isReady;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (backendDown) return;
    setFormError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setFormError(res.message || 'Login failed.');
        }
      } else {
        if (!name.trim()) {
          setFormError('Name is required');
          setLoading(false);
          return;
        }
        const res = await register(name, email, password);
        if (res.success) {
          onClose();
        } else {
          setFormError(res.message || 'Registration failed.');
        }
      }
    } catch (err) {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setFormError('');
    setLoading(true);
    try {
      const res = await googleLogin(credentialResponse.credential);
      if (res.success) {
        onClose();
      } else {
        setFormError(res.message || 'Google Login failed.');
      }
    } catch (err) {
      setFormError('Google Login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Derive the submit button label
  const getButtonLabel = () => {
    if (backendDown) return 'Starting Server...';
    if (loading) return 'Processing...';
    return mode === 'login' ? 'Log In' : 'Sign Up';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ border: '1px solid var(--text-main)' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
            {mode === 'login' ? 'Log In to ATS Checker' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="notion-btn" style={{ border: 'none', background: 'none', padding: '0.2rem', fontSize: '1.2rem', cursor: 'pointer' }}>
            ×
          </button>
        </div>

        {formError && (
          <div className="notion-tag notion-tag-danger" style={{ display: 'block', width: '100%', marginBottom: '1rem', padding: '0.5rem', textAlign: 'center' }}>
            ⚠️ {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Full Name</label>
              <input
                type="text"
                className="notion-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Email Address</label>
            <input
              type="email"
              className="notion-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Password</label>
            <input
              type="password"
              className="notion-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading || backendDown} className="notion-btn notion-btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}>
            {getButtonLabel()}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        {/* Google OAuth Login Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setFormError('Google Login failed. Please try email login.')}
              useOneTap={false}
            />
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
              Google Login is not configured. Use email and password instead.
            </p>
          )}
        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          {mode === 'login' ? (
            <p>
              New here?{' '}
              <span onClick={() => onSwitchMode('register')} style={{ color: 'var(--periwinkle-3)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
                Create an account
              </span>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <span onClick={() => onSwitchMode('login')} style={{ color: 'var(--periwinkle-3)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>
                Log in
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Backend warmup overlay — renders on top of modal when server is sleeping */}
      {isChecking && <BackendWarmupCard isReady={isReady} isChecking={isChecking} />}
    </div>
  );
}
