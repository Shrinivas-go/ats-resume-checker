import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AvatarProvider } from './context/AvatarContext';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Blog from './pages/Blog';
import Pricing from './pages/Pricing';
import Help from './pages/Help';
import About from './pages/About';
import Contact from './pages/Contact';
import Docs from './pages/Docs';

// Protected pages
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeAnalysis from './pages/ResumeAnalysis';
import ResumeBuilder from './pages/ResumeBuilder';
import JDGenerator from './pages/JDGenerator';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

/**
 * App - SaaS Routing Structure
 * 
 * Public Routes:
 * - / : Landing page
 * - /login : Login
 * - /register : Register
 * - /onboarding : New user onboarding
 * - /blog : Blog articles
 * - /pricing : Credit packages
 * - /help : Help & Support
 * - /about : About us
 * - /contact : Contact form
 * - /docs : Documentation
 * - /analyze : Resume analysis (public first scan, then protected)
 * - /builder : Resume builder (public preview, then protected)
 * 
 * Protected Routes:
 * - /dashboard : Main dashboard (post-login)
 * - /profile : User profile & settings
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AvatarProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/docs" element={<Docs />} />

            {/* Semi-protected (first scan free, then requires auth) */}
            <Route path="/analyze" element={<ResumeAnalysis />} />
            <Route path="/builder" element={<ResumeBuilder />} />
            <Route path="/jd-generator" element={<JDGenerator />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Legacy route redirect */}
            <Route path="/ats" element={<Navigate to="/analyze" replace />} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AvatarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;