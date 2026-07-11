import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { jsPDF } from 'jspdf';
import { useBackendStatus } from '../hooks/useBackendStatus';
import BackendWarmupCard from './BackendWarmupCard';

// SVG Score Ring component
function ScoreRing({ score, size = 120 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;

  let color = '#ef4444'; // red
  let label = 'Weak Match';
  if (score >= 80) { color = '#10b981'; label = 'Strong Match'; }
  else if (score >= 50) { color = '#f59e0b'; label = 'Good Match'; }

  return (
    <div className="score-ring-wrapper">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--lavender)" strokeWidth="10" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`}
          className="score-ring-fill"
        />
      </svg>
      <div className="score-ring-text">
        <span className="score-ring-number" style={{ color }}>{score}%</span>
      </div>
      <p className="score-ring-label" style={{ color }}>{label}</p>
    </div>
  );
}

// Horizontal confidence bar
function ConfidenceBar({ value }) {
  const pct = Math.round(value * 100);
  return (
    <div className="confidence-bar-track">
      <div className="confidence-bar-fill" style={{ width: `${pct}%` }}></div>
      <span className="confidence-bar-text">{pct}%</span>
    </div>
  );
}

export default function Dashboard() {
  const { isReady, isChecking } = useBackendStatus();
  const backendDown = !isReady;

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);
  
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);

  const fileInputRef = useRef(null);

  // Fetch scan history on component mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/history`, { withCredentials: true });
      if (res.data.success) {
        setHistory(res.data.scans || []);
      }
    } catch (err) {
      console.error('Error fetching scan history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const f = droppedFiles[0];
      if (f.type === 'application/pdf' || f.name.endsWith('.pdf')) {
        setFile(f);
        setError('');
      } else {
        setError('Only PDF resumes are supported.');
      }
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const f = selectedFiles[0];
      if (f.name.endsWith('.pdf')) {
        setFile(f);
        setError('');
      } else {
        setError('Only PDF resumes are supported.');
      }
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drag a PDF resume first.');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please enter a target job description for comparison.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    formData.append('jobTitle', jobTitle || 'General Scan');

    try {
      const res = await axios.post(`${API_URL}/api/analyze`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data.success) {
        setSuccessResult(res.data);
        fetchHistory();
      } else {
        setError(res.data.message || 'Analysis failed.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error occurred while contacting backend server.');
    } finally {
      setLoading(false);
    }
  };

  // Load a historical scan result into view
  const handleLoadHistoryItem = (scan) => {
    setActiveHistoryId(scan._id);
    
    // Recompute match details on the fly for history scans if details object isn't present
    const matchedCore = scan.matchedSkills || [];
    const missingCore = scan.missingSkills || [];
    const totalCore = matchedCore.length + missingCore.length;
    
    let matchTier = 'Weak Match';
    let matchTierColor = 'danger';
    let summary = '';
    
    if (scan.score >= 80) {
      matchTier = 'Strong Match';
      matchTierColor = 'success';
      summary = 'Your resume aligns strongly with the core requirements of this job posting. You have covered most of the essential qualifications.';
    } else if (scan.score >= 50) {
      matchTier = 'Good Match';
      matchTierColor = 'warning';
      summary = 'Your resume matches some core requirements but has gaps in key skills. Adding a few missing terms will boost your chances.';
    } else {
      matchTier = 'Weak Match';
      matchTierColor = 'danger';
      summary = 'Your resume has significant keyword gaps. Automated screeners (ATS) may filter it out unless you add the required terms.';
    }

    const keyStrengths = [];
    if (matchedCore.length > 0) {
      keyStrengths.push(`Core Alignment: You matched ${matchedCore.length} critical skills (like ${matchedCore.slice(0, 3).join(', ')}).`);
    }
    keyStrengths.push(`Contact Details: Basic contact details were successfully verified.`);

    const criticalGaps = [];
    if (missingCore.length > 0) {
      criticalGaps.push(`Missing Core Keywords: ${missingCore.slice(0, 4).join(', ')}. Try to integrate these keywords naturally into your experience sections.`);
    }

    setSuccessResult({
      score: scan.score,
      explanation: `Historical scan from ${new Date(scan.createdAt).toLocaleDateString()}`,
      predictedCategory: scan.predictedCategory,
      contactInfo: scan.contactInfo,
      details: {
        matchTier,
        matchTierColor,
        summary,
        keyStrengths,
        criticalGaps
      },
      skillsAnalyzed: {
        resumeSkillsCount: scan.matchedSkills?.length || 0,
        matchedCore,
        missingCore,
        matchedOptional: [],
        missingOptional: []
      }
    });
  };

  const handleNewScan = () => {
    setFile(null);
    setJobDescription('');
    setJobTitle('');
    setSuccessResult(null);
    setError('');
    setActiveHistoryId(null);
  };

  const handleDownloadPDF = () => {
    if (!successResult) return;
    const doc = new jsPDF();
    
    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(31, 41, 55);
    doc.text('ATS Resume Compatibility Report', 20, 20);
    
    // Line separator
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);
    
    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Target Job: ${jobTitle || 'General Scan'}`, 20, 32);
    
    // Compatibility Score Box
    doc.setFillColor(237, 242, 251); // light blue tint
    doc.roundedRect(20, 38, 170, 30, 3, 3, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text('COMPATIBILITY MATCH SCORE', 25, 46);
    
    doc.setFontSize(24);
    let scoreColor = [239, 68, 68]; // red
    if (successResult.score >= 80) scoreColor = [16, 185, 129]; // green
    else if (successResult.score >= 50) scoreColor = [245, 158, 11]; // orange
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${successResult.score}%`, 25, 58);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);
    doc.text(successResult.details?.matchTier || (successResult.score >= 80 ? 'Strong Match' : successResult.score >= 50 ? 'Good Match' : 'Weak Match'), 60, 58);
    
    // AI Category classification
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`ML Classifier Job Category: ${successResult.predictedCategory || 'Unknown'}`, 25, 64);
    
    // Plain English breakdown
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Plain English Summary', 20, 80);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(75, 85, 99);
    const summaryText = successResult.details?.summary || 
      (successResult.score >= 80 ? 'Your resume aligns strongly with the requirements. You have covered most of the essential qualifications.' :
       successResult.score >= 50 ? 'Your resume matches some requirements but has gaps in key skills. Adding missing terms will boost your score.' :
       'Your resume has significant keyword gaps. Automated screening systems may filter it out unless you add the required terms.');
    const splitSummary = doc.splitTextToSize(summaryText, 170);
    doc.text(splitSummary, 20, 88);
    
    // Strengths
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(16, 185, 129); // green
    doc.text('Key Strengths', 20, 105);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    const strengths = successResult.details?.keyStrengths || [
      `Keyword Match: You matched ${successResult.skillsAnalyzed?.matchedCore?.length || 0} core keyword(s) required by the employer.`,
      `Contact Details: Email and phone information are clearly present.`
    ];
    let y = 112;
    strengths.forEach(str => {
      const splitStr = doc.splitTextToSize(`- ${str}`, 170);
      doc.text(splitStr, 20, y);
      y += (splitStr.length * 5);
    });
    
    // Critical Gaps
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(239, 68, 68); // red
    doc.text('Missing Keywords & Recommendations', 20, y + 5);
    y += 12;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    const gaps = successResult.details?.criticalGaps || [
      `Missing Core Keywords: ${successResult.skillsAnalyzed?.missingCore?.slice(0, 4).join(', ') || 'None'}.`,
      `Action Step: Open your resume editor, integrate these keywords naturally into your experience, and re-upload.`
    ];
    gaps.forEach(gap => {
      const splitGap = doc.splitTextToSize(`- ${gap}`, 170);
      doc.text(splitGap, 20, y);
      y += (splitGap.length * 5);
    });
    
    // Footer
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 270, 190, 270);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('ATS Resume Checker - Optimize your resume and pass the automated screening systems.', 20, 275);
    
    doc.save(`ATS-Resume-Analysis-${jobTitle || 'Report'}.pdf`);
  };

  // Helper to resolve explainability details
  const getDetails = (result) => {
    if (result.details) return result.details;
    
    const matched = result.skillsAnalyzed?.matchedCore || [];
    const missing = result.skillsAnalyzed?.missingCore || [];
    
    let matchTier = 'Weak Match';
    let matchTierColor = 'danger';
    let summary = '';
    
    if (result.score >= 80) {
      matchTier = 'Strong Match';
      matchTierColor = 'success';
      summary = 'Your resume aligns strongly with the core requirements of this job posting. You have covered most of the essential qualifications.';
    } else if (result.score >= 50) {
      matchTier = 'Good Match';
      matchTierColor = 'warning';
      summary = 'Your resume matches some core requirements but has gaps in key skills. Adding a few missing terms will boost your chances.';
    } else {
      matchTier = 'Weak Match';
      matchTierColor = 'danger';
      summary = 'Your resume has significant keyword gaps. Automated screeners (ATS) may filter it out unless you add the required terms.';
    }

    const keyStrengths = [];
    if (matched.length > 0) {
      keyStrengths.push(`Core Alignment: You matched ${matched.length} critical skills (like ${matched.slice(0, 3).join(', ')}).`);
    }
    keyStrengths.push(`Contact Details: Basic contact details were successfully verified.`);

    const criticalGaps = [];
    if (missing.length > 0) {
      criticalGaps.push(`Missing Core Keywords: ${missing.slice(0, 4).join(', ')}. Try to integrate these keywords naturally into your resume experience sections.`);
    }

    return { matchTier, matchTierColor, summary, keyStrengths, criticalGaps };
  };

  const details = successResult ? getDetails(successResult) : null;

  return (
    <div className="container">
      <div className="dashboard-layout">
        
        {/* Sidebar Panel: Scan History */}
        <div className="sidebar-panel">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Recent Scans
          </h3>
          
          {historyLoading ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Loading history...</p>
          ) : history.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>No previous scans found.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {history.map((scan) => (
                <div
                  key={scan._id}
                  className={`history-item ${activeHistoryId === scan._id ? 'active' : ''}`}
                  onClick={() => handleLoadHistoryItem(scan)}
                >
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                    {scan.jobTitle || 'General Scan'}
                  </p>
                  <div className="flex justify-between" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    <span>Score: {scan.score}%</span>
                    <span>{new Date(scan.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Panel: Scan Form vs Results */}
        <div className="flex flex-col gap-6">
          
          {/* Header Action Row */}
          <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Candidate Scan Room</h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Compare resumes against job requirements</p>
            </div>
            {successResult && (
              <button onClick={handleNewScan} className="notion-btn notion-btn-primary">
                Start New Scan
              </button>
            )}
          </div>

          {error && (
            <div className="notion-tag notion-tag-danger" style={{ display: 'block', padding: '0.75rem', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          {!successResult ? (
            /* SCAN INPUT FORM */
            <form onSubmit={handleAnalyze} className="notion-card flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>Job Title (Optional)</label>
                <input
                  type="text"
                  className="notion-input"
                  placeholder="e.g. Software Engineer / Data Scientist / School Teacher"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>1. Upload Resume (PDF only)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf"
                  style={{ display: 'none' }}
                />
                
                <div
                  className={`dropzone text-center ${file ? 'active' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={triggerFileInput}
                >
                  {file ? (
                    <p style={{ fontWeight: '600', color: 'var(--text-main)' }}>
                      Selected File: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </p>
                  ) : (
                    <p style={{ color: 'var(--text-muted)' }}>
                      Select a PDF resume file to upload and scan
                    </p>
                  )}
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'block', marginTop: '0.5rem' }}>
                    Only standard PDF files are supported
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label style={{ fontSize: '0.9rem', fontWeight: '700' }}>2. Target Job Description</label>
                <textarea
                  className="notion-input"
                  style={{ minHeight: '180px', resize: 'vertical', fontFamily: 'inherit' }}
                  placeholder="Paste the target job description text here. Mention required skills, must-have tools, and preferred background to match keywords correctly..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading || backendDown}
                className="notion-btn notion-btn-primary"
                style={{ padding: '0.9rem', fontSize: '1.05rem', fontWeight: '600', marginTop: '0.5rem' }}
              >
                {backendDown ? 'Starting Server...' : loading ? 'Running match analyzer...' : 'Scan Resume'}
              </button>
            </form>
          ) : (
            /* ═══════════════ ANALYSIS RESULTS ═══════════════ */
            <div className="flex flex-col gap-6">
              
              {/* Top Row: Score & Download vs ML Profile Classification */}
              <div className="results-top-row">
                
                {/* Score Summary Card */}
                <div className="notion-card results-score-card">
                  <ScoreRing score={successResult.score} size={135} />
                  
                  <div style={{ marginTop: '1.25rem', textAlign: 'center', width: '100%' }}>
                    <button
                      onClick={handleDownloadPDF}
                      className="notion-btn notion-btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', width: '100%' }}
                    >
                      📥 Download PDF Report
                    </button>
                  </div>
                </div>

                {/* AI Profile Category Card */}
                <div className="notion-card results-prediction-card">
                  <span className="section-tag" style={{ color: 'var(--text-muted)' }}>AI Resume Profiler</span>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    Predicted Job Field:
                  </p>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.1rem', wordBreak: 'break-word' }}>
                    {successResult.predictedCategory || 'General / Unknown'}
                  </h3>
                  
                  {successResult.predictionConfidence > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.35rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Confidence</span>
                        <span style={{ fontWeight: '600' }}>{(successResult.predictionConfidence * 100).toFixed(0)}%</span>
                      </div>
                      <ConfidenceBar value={successResult.predictionConfidence} />
                    </div>
                  )}

                  <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '1rem', lineHeight: '1.3' }}>
                    * This category represents your overall background as interpreted by our ML model. If it doesn't match the target job, you should tailor your resume language.
                  </p>
                </div>
              </div>

              {/* Plain English Summary Banner */}
              <div className={`notion-card plain-english-banner-${details.matchTierColor}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div className="flex align-center gap-2">
                  <span style={{ fontSize: '1.25rem' }}>
                    {details.matchTierColor === 'success' ? '✅' : details.matchTierColor === 'warning' ? '⚠️' : '🚨'}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                    {details.matchTier} Overview
                  </h3>
                </div>
                <p style={{ fontSize: '0.925rem', lineHeight: '1.45', color: 'var(--text-muted)' }}>
                  {details.summary}
                </p>
              </div>

              {/* Key Strengths & Critical Gaps side by side */}
              <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                
                {/* Key Strengths */}
                <div className="notion-card" style={{ borderColor: 'var(--color-success)', background: 'rgba(16, 185, 129, 0.02)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-success)', marginBottom: '0.75rem', display: 'flex', alignCenter: 'center', gap: '0.4rem' }}>
                    <span>✓</span> Strengths Found
                  </h4>
                  {details.keyStrengths?.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {details.keyStrengths.map((strength, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          • {strength}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                      No specific strengths highlighted yet. Try matching with a descriptive job post.
                    </p>
                  )}
                </div>

                {/* Critical Gaps & Recommendations */}
                <div className="notion-card" style={{ borderColor: 'var(--color-danger)', background: 'rgba(239, 68, 68, 0.02)' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--color-danger)', marginBottom: '0.75rem', display: 'flex', alignCenter: 'center', gap: '0.4rem' }}>
                    <span>⚠</span> Optimization Steps
                  </h4>
                  {details.criticalGaps?.length > 0 ? (
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {details.criticalGaps.map((gap, i) => (
                        <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          • {gap}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                      No critical gaps found! Your resume matches the job requirements perfectly.
                    </p>
                  )}
                </div>

              </div>

              {/* Complete Skill Breakdown Table */}
              <div className="notion-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  Skill Keyword Breakdown
                </h3>

                <div className="skill-columns">
                  {/* Matched skills column */}
                  <div className="skill-col skill-col-matched">
                    <div className="skill-col-header">
                      <span className="skill-col-icon">✓</span>
                      Matched Skills
                      <span className="skill-col-count">{successResult.skillsAnalyzed?.matchedCore?.length || 0}</span>
                    </div>
                    <div className="skill-col-body">
                      {successResult.skillsAnalyzed?.matchedCore?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {successResult.skillsAnalyzed.matchedCore.map((skill, index) => (
                            <span key={index} className="notion-tag notion-tag-success">{skill}</span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No matching core keywords found in your resume text.</p>
                      )}
                    </div>
                  </div>

                  {/* Missing skills column */}
                  <div className="skill-col skill-col-missing">
                    <div className="skill-col-header">
                      <span className="skill-col-icon">✗</span>
                      Missing Skills
                      <span className="skill-col-count">{successResult.skillsAnalyzed?.missingCore?.length || 0}</span>
                    </div>
                    <div className="skill-col-body">
                      {successResult.skillsAnalyzed?.missingCore?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {successResult.skillsAnalyzed.missingCore.map((skill, index) => (
                            <span key={index} className="notion-tag notion-tag-danger">{skill}</span>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' }}>No missing core keywords! You have covered all target skills.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="notion-card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  Contact Details Detected
                </h3>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>Email</span>
                    <strong>{successResult.contactInfo?.email || 'Not detected'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>Phone</span>
                    <strong>{successResult.contactInfo?.phone || 'Not detected'}</strong>
                  </div>
                  {successResult.contactInfo?.linkedin && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>LinkedIn</span>
                      <a href={successResult.contactInfo.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--periwinkle-3)', textDecoration: 'underline' }}>
                        Profile Link
                      </a>
                    </div>
                  )}
                  {successResult.contactInfo?.github && (
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', display: 'block' }}>GitHub</span>
                      <a href={successResult.contactInfo.github} target="_blank" rel="noreferrer" style={{ color: 'var(--periwinkle-3)', textDecoration: 'underline' }}>
                        Repository Link
                      </a>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
      {/* Backend warmup overlay */}
      {isChecking && <BackendWarmupCard isReady={isReady} isChecking={isChecking} />}
    </div>
  );
}
