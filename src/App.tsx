import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import MainLayout from '@/components/layout/MainLayout';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import Referral from '@/pages/Referral';
import PatientOverview from '@/pages/PatientOverview';
import Reports from '@/pages/Reports';
import AddressBook from '@/pages/AddressBook';
import Admin from '@/pages/Admin';
import AppointmentsPage from '@/pages/Appointments';
import KitDistributionPage from '@/pages/KitDistribution';
import GuidePage from '@/pages/Guide';
import FeedbackPage from '@/pages/Feedback';
import DownloadPage from '@/pages/Download';
import TechnicalDocs from '@/pages/admin/TechnicalDocs';
import ImplementationGuide from '@/pages/admin/ImplementationGuide';
import AdminSettings from '@/pages/admin/AdminSettings';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/toast/ToastContext';
import { ToastContainer } from '@/components/ui/toast/Toast';
import ProtectedRoute from '@/components/ProtectedRoute';
import { RouteGuard } from '@/components/RouteGuard';
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
              <Route path="/download" element={<DownloadPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<RouteGuard><Dashboard /></RouteGuard>} />
                  <Route path="/referral" element={<RouteGuard><Referral /></RouteGuard>} />
                  <Route path="/patient-overview" element={<RouteGuard><PatientOverview /></RouteGuard>} />
                  <Route path="/reports" element={<RouteGuard><Reports /></RouteGuard>} />
                  <Route path="/address-book" element={<RouteGuard><AddressBook /></RouteGuard>} />
                  <Route path="/appointments" element={<RouteGuard><AppointmentsPage /></RouteGuard>} />
                  <Route path="/kit-distribution" element={<RouteGuard><KitDistributionPage /></RouteGuard>} />
                  <Route path="/admin" element={<RouteGuard><Admin /></RouteGuard>} />
                  <Route path="/admin/settings" element={<RouteGuard><AdminSettings /></RouteGuard>} />
                  <Route path="/admin/docs" element={<RouteGuard><TechnicalDocs /></RouteGuard>} />
                  <Route path="/admin/implementation" element={<RouteGuard><ImplementationGuide /></RouteGuard>} />
                  <Route path="/guide" element={<RouteGuard><GuidePage /></RouteGuard>} />
                  <Route path="/feedback" element={<RouteGuard><FeedbackPage /></RouteGuard>} />
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
