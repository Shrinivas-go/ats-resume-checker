import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AvatarProvider } from './context/AvatarContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Pricing from './pages/Pricing';
import Help from './pages/Help';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ResumeAnalysis from './pages/ResumeAnalysis';
import ResumeBuilder from './pages/ResumeBuilder';
import JDGenerator from './pages/JDGenerator';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';

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
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/help" element={<Help />} />

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

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AvatarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;