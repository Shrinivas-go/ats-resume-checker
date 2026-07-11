import React, { useState, useEffect, useRef } from 'react';
import '../styles/BackendWarmupCard.css';

/**
 * Status messages that rotate while the backend is waking up.
 * Each creates the impression of an intentional initialization sequence.
 */
const STATUS_MESSAGES = [
  'Starting Analysis Engine...',
  'Connecting Secure Services...',
  'Preparing Resume Parser...',
  'Loading ATS Models...',
  'Optimizing Matching Engine...',
  'Almost Ready...',
];

/** Interval between rotating status messages (ms) */
const MESSAGE_ROTATE_INTERVAL = 3000;

/** Delay after backend becomes ready before auto-dismissing (ms) */
const READY_DISMISS_DELAY = 1500;

/**
 * BackendWarmupCard
 *
 * A professional cold-start overlay that displays while the backend
 * server is asleep (Render free tier). Polls /health and provides a
 * polished boot sequence experience instead of showing error states.
 *
 * @param {Object}  props
 * @param {boolean} props.isReady     — whether the backend is responsive
 * @param {boolean} props.isChecking  — whether health polling is active
 * @param {() => void} [props.onReady] — callback fired after ready + dismiss delay
 */
export default function BackendWarmupCard({ isReady, isChecking, onReady }) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [faqOpen, setFaqOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const dismissTimerRef = useRef(null);
  const messageTimerRef = useRef(null);

  // ── Rotate status messages ────────────────────────────────────────
  useEffect(() => {
    if (isReady) return;

    messageTimerRef.current = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, MESSAGE_ROTATE_INTERVAL);

    return () => clearInterval(messageTimerRef.current);
  }, [isReady]);

  // ── Handle ready → exit animation → dismiss ──────────────────────
  useEffect(() => {
    if (!isReady) return;

    dismissTimerRef.current = setTimeout(() => {
      setExiting(true);

      // Wait for fade-out animation to complete, then dismiss
      setTimeout(() => {
        setDismissed(true);
        onReady?.();
      }, 500);
    }, READY_DISMISS_DELAY);

    return () => clearTimeout(dismissTimerRef.current);
  }, [isReady, onReady]);

  // ── Don't render if fully dismissed or not checking ───────────────
  if (dismissed) return null;
  if (!isChecking && !isReady) return null;

  return (
    <div className={`warmup-overlay ${exiting ? 'warmup-overlay--exiting' : ''}`}>
      <div className="warmup-card">

        {/* Icon */}
        <div className="warmup-icon">
          {isReady ? '✅' : '⚡'}
        </div>

        {/* Title */}
        <h2 className="warmup-title">ATS Analysis Engine</h2>

        {/* Status badge */}
        <div className={`warmup-badge ${isReady ? 'warmup-badge--ready' : 'warmup-badge--starting'}`}>
          <span className="warmup-badge-dot" />
          {isReady ? 'Analysis Engine Ready' : 'Starting'}
        </div>

        {/* Progress bar */}
        <div className="warmup-progress-track">
          <div className={`warmup-progress-fill ${isReady ? 'warmup-progress-fill--ready' : ''}`} />
        </div>

        {/* Rotating status message */}
        <div className="warmup-message-area">
          {isReady ? (
            <span className="warmup-message warmup-message--active warmup-message--ready">
              All systems operational
            </span>
          ) : (
            STATUS_MESSAGES.map((msg, i) => (
              <span
                key={msg}
                className={`warmup-message ${i === messageIndex ? 'warmup-message--active' : ''}`}
              >
                {msg}
              </span>
            ))
          )}
        </div>

        {/* Footer note — only while loading */}
        {!isReady && (
          <>
            <p className="warmup-footer-note">
              Your first visit may take up to one minute while the analysis server starts.
            </p>

            {/* Expandable FAQ */}
            <button
              className="warmup-faq-toggle"
              onClick={() => setFaqOpen((prev) => !prev)}
              type="button"
            >
              Why does this happen?
              <span className={`warmup-faq-chevron ${faqOpen ? 'warmup-faq-chevron--open' : ''}`}>
                ▼
              </span>
            </button>

            <div className={`warmup-faq-body ${faqOpen ? 'warmup-faq-body--open' : ''}`}>
              <p className="warmup-faq-text">
                This demo uses Render hosting. After periods of inactivity the backend 
                automatically sleeps. Opening the application wakes it automatically.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
