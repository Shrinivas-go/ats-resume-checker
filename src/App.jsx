import { Routes, Route } from 'react-router-dom';
import RegistrationForm from './RegistrationForm';
import ATSPanel from './ATSPanel';

function App() {
  return (
    <Routes>
      <Route path="/" element={<RegistrationForm />} />
      <Route path="/ats" element={<ATSPanel />} />
    </Routes>
  );
}

export default App;