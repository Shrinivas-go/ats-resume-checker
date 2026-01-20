import { useState } from 'react';
import axios from 'axios';

import './index.css'; // Ensure index.css is imported for global styles

export default function ATSPanel() {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for job description and ATS score features
  const [jobDescription, setJobDescription] = useState('');
  const [atsScore, setAtsScore] = useState(null);
  const [atsExplanation, setAtsExplanation] = useState('');
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [isCalculatingScore, setIsCalculatingScore] = useState(false);

  // States for theming, copied from RegistrationForm
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null); // Assuming some inputs might need focus style
  const [isButtonHovered, setIsButtonHovered] = useState(false); // Assuming buttons might need hover style

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setParsedData(null);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a PDF first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await axios.post('https://ats-backend-production-c4ad.up.railway.app/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setParsedData(res.data.data);
      } else {
        setError(res.data.message || 'Parsing failed');
      }
    } catch (err) {
      console.error(err);
      setError('Server error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate ATS Score (re-added from previous version)
  const handleCalculateATS = async () => {
    // Validation
    if (!parsedData) {
      setError('❌ Please parse your resume first');
      return;
    }

    if (!jobDescription.trim()) {
      setError('❌ Please enter a job description');
      return;
    }

    setIsCalculatingScore(true);
    setError('');
    setAtsScore(null);

    try {
      const response = await axios.post('https://ats-backend-production-c4ad.up.railway.app/ats-score-weighted', {
        resumeSkills: parsedData.skills,
        jobDescription: jobDescription
      });

      if (response.data.success) {
        setAtsScore(response.data.atsScore || response.data.score);
        setAtsExplanation(response.data.explanation || response.data.feedback || '');
        setMatchedSkills(response.data.matchedCoreSkills || []); // Using matchedCoreSkills from weighted score
        setMissingSkills(response.data.missingCoreSkills || []); // Using missingCoreSkills from weighted score
      } else {
        setError(`❌ Server error: ${response.data.message || 'Failed to calculate ATS score'}`);
      }
    } catch (err) {
      console.error('ATS Score error:', err);
      setError('❌ Unable to connect to server. Please ensure the backend is running.');
    } finally {
      setIsCalculatingScore(false);
    }
  };

  // Get ATS score color based on score value (re-added from previous version)
  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  // Get score status text (re-added from previous version)
  const getScoreStatus = (score) => {
    if (score >= 80) return 'Excellent Match!';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  // Toggle theme, copied from RegistrationForm
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get dynamic styles based on theme, copied from RegistrationForm
  const getStyles = () => {
    return {
      pageContainer: {
        backgroundColor: isDarkMode ? '#121212' : '#f0f2f5',
        minHeight: '100vh',
        width: '100%',
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
        alignItems: 'flex-start', // Changed to flex-start for scrolling content
        width: '100%',
        paddingBottom: '40px', // Add padding at the bottom for scrolling content
        overflowY: 'auto', // Added overflow-y for scrolling
      },
      formCard: { // Renamed from card to formCard for consistency
        backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
        padding: '45px',
        borderRadius: '16px',
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(0,0,0,0.12)',
        width: '100%',
        maxWidth: '900px', // Increased maxWidth for ATSPanel
        transition: 'all 0.3s ease',
        marginBottom: '20px', // Add margin bottom for spacing between cards
        border: isDarkMode ? '1px solid #333' : 'none',
        position: 'relative',
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
      // ATS Panel specific styles, adapted from RegistrationForm
      sectionTitle: {
        color: isDarkMode ? '#ffffff' : '#1a1a1a',
        fontSize: '24px',
        fontWeight: '700',
        marginBottom: '20px',
        borderBottom: `2px solid ${isDarkMode ? '#555' : '#007bff'}`,
        paddingBottom: '10px',
        marginTop: '30px',
      },
      dataItem: {
        backgroundColor: isDarkMode ? '#2a2a2a' : '#f0f0f0',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '10px',
        border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
      },
      dataLabel: {
        color: isDarkMode ? '#e0e0e0' : '#495057',
        fontSize: '14px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '5px',
      },
      dataValue: {
        color: isDarkMode ? '#ffffff' : '#1a1a1a',
        fontSize: '15px',
        fontWeight: '400',
      },
      skillBadge: {
        backgroundColor: isDarkMode ? '#404040' : '#007bff',
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        display: 'inline-block',
        marginRight: '10px',
        marginBottom: '10px',
      },
      textarea: {
        width: '100%',
        padding: '14px',
        fontSize: '14px',
        border: `2px solid ${isDarkMode ? '#404040' : '#ced4da'}`,
        borderRadius: '8px',
        fontFamily: 'inherit',
        resize: 'vertical', // Added closing quote and comma
        color: isDarkMode ? '#ffffff' : '#1a1a1a',
        backgroundColor: isDarkMode ? '#2a2a2a' : '#ffffff',
        lineHeight: '1.6',
        transition: 'border-color 0.3s ease',
        boxSizing: 'border-box'
      },
      scoreCard: {
        backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa',
        border: `4px solid ${isDarkMode ? '#333' : '#e0e0e0'}`,
        padding: '30px 40px',
        borderRadius: '16px',
        textAlign: 'center',
        minWidth: '220px',
      },
      scoreValue: {
        fontSize: '56px',
        fontWeight: '800',
        marginBottom: '12px',
        letterSpacing: '-2px',
      },
      scoreStatus: {
        fontSize: '18px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '1px',
      },
      explanationBox: {
        backgroundColor: isDarkMode ? '#1e1e1e' : '#e7f3ff',
        padding: '18px 20px',
        borderRadius: '8px',
        marginBottom: '25px',
        border: `1px solid ${isDarkMode ? '#333' : '#b8daff'}`,
      },
      explanationLabel: {
        color: isDarkMode ? '#e0e0e0' : '#004085',
        fontSize: '15px',
        fontWeight: '700',
        display: 'block',
        marginBottom: '10px',
      },
      explanationText: {
        color: isDarkMode ? '#ffffff' : '#1a1a1a',
        fontSize: '14px',
        lineHeight: '1.7',
        margin: 0,
        fontWeight: '400',
      },
      matchedSkillBadge: {
        backgroundColor: isDarkMode ? '#218838' : '#28a745',
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        display: 'inline-block',
        marginRight: '10px',
        marginBottom: '10px',
      },
      missingSkillBadge: {
        backgroundColor: isDarkMode ? '#cc3333' : '#dc3545',
        color: '#ffffff',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        display: 'inline-block',
        marginRight: '10px',
        marginBottom: '10px',
      },
      recommendationText: {
        marginTop: '18px',
        padding: '14px 18px',
        backgroundColor: isDarkMode ? '#3a3a3a' : '#fff3cd',
        color: isDarkMode ? '#f0f0f0' : '#856404',
        borderRadius: '8px',
        fontSize: '14px',
        border: `1px solid ${isDarkMode ? '#555' : '#ffeeba'}`,
        lineHeight: '1.6',
        fontWeight: '400',
      },
    };
  };

  const styles = getStyles();

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={styles.formCard}>
          {/* Theme Toggle */}
          <div
            style={styles.themeToggle}
            onClick={toggleTheme}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={styles.toggleIcon}>
              {isDarkMode ? '🌙' : '☀️'}
            </span>
            <span style={styles.toggleText}>
              {isDarkMode ? 'Dark' : 'Light'}
            </span>
          </div>

          <h2 style={styles.title}>ATS Resume Checker</h2>
          <p style={styles.subtitle}>Upload your resume and paste job description to check ATS compatibility</p>

          {/* File Upload Section */}
          <div style={styles.inputGroup}>
            <label htmlFor="resume-upload" style={styles.label}>Choose Resume (PDF only):</label>
            <input
              type="file"
              id="resume-upload"
              accept=".pdf"
              onChange={handleFileChange}
              style={styles.input} // Using common input style
            />
            {file && (
              <p style={{ ...styles.message, marginTop: '10px', backgroundColor: isDarkMode ? '#333' : '#e0e0e0', color: isDarkMode ? '#f0f0f0' : '#1a1a1a', border: `1px solid ${isDarkMode ? '#555' : '#ccc'}` }}>
                📄 Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              style={{
                ...styles.button,
                backgroundColor: isDarkMode ? '#0056b3' : '#007bff',
                opacity: (!file || loading) ? 0.6 : 1,
              }}
            >
              {loading ? 'Parsing...' : 'Parse Resume'}
            </button>
          </div>

          {error && <div style={{ ...styles.errorMessage, marginBottom: '20px' }}>{error}</div>}

          {parsedData && (
            <>
              <div style={{ ...styles.formCard, padding: '25px', marginTop: '25px', boxShadow: 'none', border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}` }}>
                <h3 style={styles.sectionTitle}>📋 Parsed Resume Data</h3>
                <div style={{ marginBottom: '15px' }}>
                  <div style={styles.dataItem}>
                    <strong style={styles.dataLabel}>Name:</strong>
                    <span style={styles.dataValue}>{parsedData.name}</span>
                  </div>
                  <div style={styles.dataItem}>
                    <strong style={styles.dataLabel}>Email:</strong>
                    <span style={styles.dataValue}>{parsedData.email}</span>
                  </div>
                  <div style={styles.dataItem}>
                    <strong style={styles.dataLabel}>Phone:</strong>
                    <span style={styles.dataValue}>{parsedData.phone}</span>
                  </div>
                  <div style={styles.dataItem}>
                    <strong style={styles.dataLabel}>Skills:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                      {parsedData.skills && parsedData.skills[0] !== 'Not found' ? (
                        parsedData.skills.map((skill, index) => (
                          <span key={index} style={styles.skillBadge}>{skill}</span>
                        ))
                      ) : (
                        <span style={styles.dataValue}>No skills found</span>
                      )}
                    </div>
                  </div>
                  <div style={styles.dataItem}>
                    <strong style={styles.dataLabel}>Education:</strong>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '5px 0 0 0' }}>
                      {parsedData.education && parsedData.education[0] !== 'Not found' ? (
                        parsedData.education.map((edu, index) => (
                          <li key={index} style={{ ...styles.dataValue, marginBottom: '5px' }}>{edu}</li>
                        ))
                      ) : (
                        <li style={styles.dataValue}>No education found</li>
                      )}
                    </ul>
                  </div>
                  <div style={styles.dataItem}>
                    <strong style={styles.dataLabel}>Experience:</strong>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '5px 0 0 0' }}>
                      {parsedData.experience && parsedData.experience[0] !== 'Not found' ? (
                        parsedData.experience.map((exp, index) => (
                          <li key={index} style={{ ...styles.dataValue, marginBottom: '5px' }}>{exp}</li>
                        ))
                      ) : (
                        <li style={styles.dataValue}>No experience found</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Job Description Section */}
              <div style={{ ...styles.formCard, padding: '25px', marginTop: '25px', boxShadow: 'none', border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}` }}>
                <h3 style={styles.sectionTitle}>📝 Job Description</h3>
                <p style={{ ...styles.subtitle, textAlign: 'left', marginBottom: '15px' }}>Paste the job description you want to match against:</p>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder={`Paste job description here...

Example:
We are looking for a Full Stack Developer with:
- React and Node.js experience
- Python and Django
- AWS and Docker
- Strong communication skills`}
                  style={styles.textarea}
                  rows={8}
                />
                <button
                  onClick={handleCalculateATS}
                  disabled={!parsedData || !jobDescription.trim() || isCalculatingScore}
                  style={{ ...styles.button, backgroundColor: isDarkMode ? '#218838' : '#28a745', opacity: (!parsedData || !jobDescription.trim() || isCalculatingScore) ? 0.6 : 1, marginTop: '15px' }}
                  onMouseEnter={(e) => { !parsedData || !jobDescription.trim() || isCalculatingScore ? null : e.currentTarget.style.backgroundColor = (isDarkMode ? '#1e6e2f' : '#218838'); }}
                  onMouseLeave={(e) => { !parsedData || !jobDescription.trim() || isCalculatingScore ? null : e.currentTarget.style.backgroundColor = (isDarkMode ? '#218838' : '#28a745'); }}
                >
                  {isCalculatingScore ? '⏳ Calculating ATS Score...' : '🎯 Get ATS Score'}
                </button>
                {error && <div style={{ ...styles.errorMessage, marginTop: '15px' }}>{error}</div>}
              </div>

              {/* ATS Score Section */}
              {atsScore !== null && !isCalculatingScore && (
                <div style={{ ...styles.formCard, padding: '25px', marginTop: '25px', boxShadow: 'none', border: `1px solid ${isDarkMode ? '#333' : '#e0e0e0'}` }}>
                  <h3 style={styles.sectionTitle}>🎯 ATS Score Analysis</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <div style={{ ...styles.scoreCard, borderColor: getScoreColor(atsScore), backgroundColor: isDarkMode ? '#1e1e1e' : '#f8f9fa' }}>
                      <div style={{ ...styles.scoreValue, color: getScoreColor(atsScore) }}>{atsScore}/100</div>
                      <div style={{ ...styles.scoreStatus, color: getScoreColor(atsScore) }}>{getScoreStatus(atsScore)}</div>
                    </div>
                  </div>
                  {atsExplanation && (
                    <div style={{ ...styles.explanationBox, backgroundColor: isDarkMode ? '#2a2a2a' : '#e7f3ff', border: `1px solid ${isDarkMode ? '#444' : '#b8daff'}` }}>
                      <strong style={{ ...styles.explanationLabel, color: isDarkMode ? '#fff' : '#004085' }}>💬 Feedback:</strong>
                      <p style={{ ...styles.explanationText, color: isDarkMode ? '#e0e0e0' : '#1a1a1a' }}>{atsExplanation}</p>
                    </div>
                  )}

                  {matchedSkills.length > 0 && (
                    <div style={{ ...styles.dataItem, padding: '20px', backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa' }}>
                      <h4 style={{ ...styles.sectionTitle, fontSize: '18px', borderBottom: `2px solid ${isDarkMode ? '#444' : '#28a745'}`, marginBottom: '15px' }}>✅ Matched Skills ({matchedSkills.length})</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {matchedSkills.map((skill, index) => (
                          <span key={index} style={styles.matchedSkillBadge}>{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {missingSkills.length > 0 && (
                    <div style={{ ...styles.dataItem, padding: '20px', backgroundColor: isDarkMode ? '#2a2a2a' : '#f8f9fa', marginTop: '20px' }}>
                      <h4 style={{ ...styles.sectionTitle, fontSize: '18px', borderBottom: `2px solid ${isDarkMode ? '#444' : '#dc3545'}`, marginBottom: '15px' }}>❌ Missing Skills ({missingSkills.length})</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {missingSkills.map((skill, index) => (
                          <span key={index} style={styles.missingSkillBadge}>{skill}</span>
                        ))}
                      </div>
                      <p style={{ ...styles.recommendationText, backgroundColor: isDarkMode ? '#3a3a3a' : '#fff3cd', color: isDarkMode ? '#e0e0e0' : '#856404', border: `1px solid ${isDarkMode ? '#555' : '#ffeeba'}`, marginTop: '20px' }}>
                        💡 <strong>Recommendation:</strong> Consider adding these skills to your resume to improve your ATS score and match the job requirements.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
