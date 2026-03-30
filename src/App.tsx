import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import useAuthStore from './store/useAuthStore';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import ActivityLogPage from './pages/ActivityLogPage';
import ContactsPage from './pages/ContactsPage';
import TeamPage from './pages/TeamPage';
import NotFound from './pages/NotFound';
import { useEffect, useState } from 'react';

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useAuthStore.getState().loadFromStorage();
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="companies/:id" element={<CompanyDetailPage />} />
            <Route path="contacts" element={<ContactsPage />} />
            <Route path="activity-logs" element={<ActivityLogPage />} />
            <Route path="team" element={<TeamPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
