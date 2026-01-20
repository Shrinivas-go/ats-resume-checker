import { useState } from 'react'; // Import useState
import './index.css';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function RegistrationForm() {
  // State to store form input values
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // State to store success or error messages
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // State to track loading state during API call
  const [isLoading, setIsLoading] = useState(false);

  // State for theme toggle
  const [isDarkMode, setIsDarkMode] = useState(false);

  // State for input focus
  const [focusedInput, setFocusedInput] = useState(null);
  
  // State for button hover
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  // Initialize navigate hook
  const navigate = useNavigate();

  // Handle input changes - updates state as user types
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage('');
    setMessageType('');
    setIsLoading(true);

    try {
      const response = await fetch('https://ats-backend-production-c4ad.up.railway.app/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Registration successful!');
        setMessageType('success');
        
        setFormData({
          name: '',
          email: '',
          password: ''
        });

        // Simulate redirect after 1.5 seconds
        setTimeout(() => { // Removed message update, directly navigate
          navigate('/ats');
        }, 1500); // Redirect after 1.5 seconds

      } else {
        setMessage(data.message || 'Registration failed');
        setMessageType('error');
      }

    } catch (error) {
      setMessage('Unable to connect to server. Make sure backend is running.');
      setMessageType('error');
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get dynamic styles based on theme
  const getStyles = () => {
    return {
      pageContainer: {
        backgroundColor: isDarkMode ? '#121212' : '#f0f2f5',
        minHeight: '100vh',
        width: '100%', /* Ensure the container takes full width */
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        position: 'relative',
        transition: 'background-color 0.3s ease',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      },
      themeToggle: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        borderRadius: '30px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        border: `2px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
        userSelect: 'none'
      },
      toggleIcon: {
        fontSize: '20px'
      },
      toggleText: {
        fontSize: '14px',
        fontWeight: '600',
        color: isDarkMode ? '#ffffff' : '#333333'
      },
      container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
      },
      formCard: {
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        padding: '45px',
        borderRadius: '16px',
        boxShadow: isDarkMode 
          ? '0 8px 32px rgba(0,0,0,0.4)' 
          : '0 8px 32px rgba(0,0,0,0.12)',
        width: '100%',
        maxWidth: '480px',
        transition: 'all 0.3s ease',
        border: isDarkMode ? '1px solid #333' : 'none',
        position: 'relative', // Add this to correctly position the toggle button
      },
      title: {
        textAlign: 'center',
        color: isDarkMode ? '#ffffff' : '#1a1a1a',
        marginBottom: '10px',
        fontSize: '32px',
        fontWeight: '700',
        letterSpacing: '-0.5px'
      },
      subtitle: {
        textAlign: 'center',
        color: isDarkMode ? '#b0b0b0' : '#666666',
        marginBottom: '35px',
        fontSize: '15px',
        fontWeight: '400',
        lineHeight: '1.5'
      },
      inputGroup: {
        marginBottom: '24px'
      },
      label: {
        display: 'block',
        marginBottom: '10px',
        color: isDarkMode ? '#e0e0e0' : '#1a1a1a',
        fontSize: '14px',
        fontWeight: '600',
        letterSpacing: '0.3px'
      },
      input: {
        width: '100%',
        padding: '14px 16px',
        fontSize: '15px',
        border: `2px solid ${isDarkMode ? '#404040' : '#28a745'}`,
        borderRadius: '8px',
        boxSizing: 'border-box',
        transition: 'all 0.3s ease',
        color: isDarkMode ? '#ffffff' : '#1a1a1a',
        backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
        outline: 'none'
      },
      inputFocus: {
        borderColor: '#28a745',
        boxShadow: isDarkMode 
          ? '0 0 0 3px rgba(40, 167, 69, 0.2)' 
          : '0 0 0 3px rgba(40, 167, 69, 0.1)'
      },
      button: {
        padding: '16px',
        fontSize: '16px',
        fontWeight: '700',
        color: '#ffffff',
        backgroundColor: '#28a745',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        marginTop: '10px', 
        transition: 'all 0.3s ease',
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        width: '100%'
      },
      buttonHover: {
        backgroundColor: '#218838',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(40, 167, 69, 0.3)'
      },
      buttonDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
        transform: 'none'
      },
      message: {
        marginTop: '24px',
        padding: '16px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        textAlign: 'center',
        fontWeight: '500',
        transition: 'all 0.3s ease'
      },
      successMessage: {
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '2px solid #c3e6cb'
      },
      errorMessage: {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '2px solid #f5c6cb'
      },
      redirectText: {
        margin: '12px 0 0 0',
        fontSize: '13px',
        fontStyle: 'italic',
        opacity: 0.9
      },
      linkContainer: {
        marginTop: '28px',
        textAlign: 'center',
        paddingTop: '20px',
        borderTop: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`
      },
      linkText: {
        color: isDarkMode ? '#b0b0b0' : '#666666',
        fontSize: '14px',
        margin: 0
      },
      link: {
        color: '#28a745',
        cursor: 'pointer',
        fontWeight: '700',
        textDecoration: 'none',
        transition: 'all 0.2s ease'
      }
    };
  };

  const styles = getStyles();

   return (
    <div style={styles.pageContainer}>

      <div style={styles.container}>
        <div style={styles.formCard}>
          {/* Theme Toggle - Moved inside formCard for correct positioning */}
          <div 
            style={styles.themeToggle} 
            onClick={toggleTheme}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={styles.toggleIcon}>
              {isDarkMode ? '🌙' : '☀️'}
            </span>
            <span style={styles.toggleText}>
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </div>
          <h1 style={styles.title}>User Registration</h1>
          <p style={styles.subtitle}>Create your account to access the ATS Resume Checker</p>
  
          {/* Registration Form */}
          <div>
            {/* Name Input */}
            <div style={styles.inputGroup}>
              <label htmlFor="name" style={styles.label}>Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onFocus={() => setFocusedInput('name')}
                onBlur={() => setFocusedInput(null)}
                required
                style={{
                  ...styles.input,
                  ...(focusedInput === 'name' ? styles.inputFocus : {})
                }}
                placeholder="Enter your name"
              />
            </div>
  
            {/* Email Input */}
            <div style={styles.inputGroup}>
              <label htmlFor="email" style={styles.label}>Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                required
                style={{
                  ...styles.input,
                  ...(focusedInput === 'email' ? styles.inputFocus : {})
                }}
                placeholder="Enter your email"
              />
            </div>
  
            {/* Password Input */}
            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>Password:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                required
                style={{
                  ...styles.input,
                  ...(focusedInput === 'password' ? styles.inputFocus : {})
                }}
                placeholder="Enter your password (min 6 characters)"
                minLength="6"
              />
            </div>
  
            {/* Submit Button */}
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              style={{
                ...styles.button,
                ...(isButtonHovered && !isLoading ? styles.buttonHover : {}),
                ...(isLoading ? styles.buttonDisabled : {})
              }}
            >
              {isLoading ? '⏳ Registering...' : '✓ Register'}
            </button>
          </div>
  
          {/* Display Success or Error Message */}
          {message && (
            <div style={{
              ...styles.message,
              ...(messageType === 'success' ? styles.successMessage : styles.errorMessage)
            }}>
              {messageType === 'success' ? '✓ ' : '✗ '}
              {message}
              {messageType === 'success' && message.includes('successful') && (
                <p style={styles.redirectText}>Redirecting to ATS panel...</p>
              )}
            </div>
          )}

          {/* Link to ATS Panel */}
          <div style={styles.linkContainer}>
            <p style={styles.linkText}>
              Already registered?{' '}
              <span 
                onClick={() => navigate('/ats')} // Direct navigation to ATS panel
                style={styles.link}
                onMouseEnter={(e) => {
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.textDecoration = 'none';
                }}
              >
                Go to ATS Panel →
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationForm;