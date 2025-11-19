import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { AppUser } from './lib/supabase';
import ParticipantLoginPage from './pages/ParticipantLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import ParticipantExperience from './pages/ParticipantExperience';
import AdminPage from './pages/AdminPage';

function App() {
  const [participantSession, setParticipantSession] = useState<AppUser | null>(null);
  const [adminSession, setAdminSession] = useState<AppUser | null>(null);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            participantSession ? (
              <ParticipantExperience
                user={participantSession}
                onLogout={() => setParticipantSession(null)}
              />
            ) : (
              <ParticipantLoginPage onAuthenticated={setParticipantSession} />
            )
          }
        />
        <Route
          path="/admin"
          element={
            adminSession ? (
              <AdminPage onBack={() => setAdminSession(null)} />
            ) : (
              <AdminLoginPage onAuthenticated={setAdminSession} />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
