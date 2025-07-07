import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import Referral from '@/pages/Referral';
import Reports from '@/pages/Reports';
import AddressBook from '@/pages/AddressBook';
import Admin from '@/pages/Admin';
import AppointmentsPage from '@/pages/Appointments';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast/ToastContext';
import { ToastContainer } from '@/components/ui/toast/Toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { LoadingProvider } from '@/contexts/LoadingContext';
import '@/index.css';

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <LoadingProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/referral" element={<Referral />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/address-book" element={<AddressBook />} />
                  <Route path="/appointments" element={<AppointmentsPage />} />
                  <Route path="/admin" element={<Admin />} />
                </Route>
              </Route>
            </Routes>
          </Router>
          <ToastContainer />
        </LoadingProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
