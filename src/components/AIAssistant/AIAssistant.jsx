/**
 * AI Assistant Chat Component
 * Floating chat panel for ATS resume assistance
 */
import { useState, useRef, useEffect } from 'react';
import styles from './AIAssistant.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Quick action buttons
const QUICK_ACTIONS = [
    { label: '📊 Explain Score', query: 'Why is my score what it is?' },
    { label: '🔍 Missing Skills', query: 'What skills am I missing?' },
    { label: '💼 Job Match', query: 'How well do I match this job?' },
    { label: '✏️ Improve Tips', query: 'How can I improve my experience section?' }
];

export default function AIAssistant({ analysisResult, isVisible = true }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Add welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([{
                type: 'assistant',
                content: `Hi! I'm your ATS assistant. Ask me anything about your resume score, missing skills, or how to improve your match.`,
                timestamp: new Date()
            }]);
        }
    }, [isOpen]);

    const sendMessage = async (query) => {
        if (!query.trim()) return;

        // Add user message
        const userMessage = {
            type: 'user',
            content: query,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/assistant/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    analysisResult: analysisResult || null
                })
            });

            const data = await response.json();

            // Add assistant response
            const assistantMessage = {
                type: 'assistant',
                content: data.message || 'I encountered an issue processing your request.',
                intent: data.intent,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('Assistant error:', error);
            setMessages(prev => [...prev, {
                type: 'assistant',
                content: 'Sorry, I couldn\'t connect to the assistant. Please try again.',
                isError: true,
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(inputValue);
    };

    const handleQuickAction = (query) => {
        sendMessage(query);
    };

    if (!isVisible) return null;

    return (
        <div className={styles.container}>
            {/* Floating Button */}
            <button
                className={`${styles.floatingButton} ${isOpen ? styles.hidden : ''}`}
                onClick={() => setIsOpen(true)}
                aria-label="Open AI Assistant"
            >
                <span className={styles.buttonIcon}>🤖</span>
                <span className={styles.buttonText}>Ask AI</span>
            </button>

            {/* Chat Panel */}
            <div className={`${styles.chatPanel} ${isOpen ? styles.open : ''}`}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerTitle}>
                        <span className={styles.headerIcon}>🤖</span>
                        <span>ATS Assistant</span>
                    </div>
                    <button
                        className={styles.closeButton}
                        onClick={() => setIsOpen(false)}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Messages */}
                <div className={styles.messages}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`${styles.message} ${styles[msg.type]} ${msg.isError ? styles.error : ''}`}
                        >
                            <div className={styles.messageContent}>
                                {msg.content.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className={`${styles.message} ${styles.assistant}`}>
                            <div className={styles.typing}>
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions */}
                {messages.length <= 1 && (
                    <div className={styles.quickActions}>
                        {QUICK_ACTIONS.map((action, idx) => (
                            <button
                                key={idx}
                                className={styles.quickButton}
                                onClick={() => handleQuickAction(action.query)}
                                disabled={isLoading}
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form className={styles.inputForm} onSubmit={handleSubmit}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask about your resume..."
                        disabled={isLoading}
                        className={styles.input}
                    />
                    <button
                        type="submit"
                        className={styles.sendButton}
                        disabled={isLoading || !inputValue.trim()}
                    >
                        ➤
                    </button>
                </form>
            </div>
        </div>
    );
}
