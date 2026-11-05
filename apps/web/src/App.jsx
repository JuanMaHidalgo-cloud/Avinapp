import React from 'react';
import { Route, Routes, BrowserRouter as Router, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { DynamicThemeProvider } from './contexts/DynamicThemeProvider.jsx';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext.jsx';
import { Toaster } from '@/components/ui/sonner';
import ScrollToTop from './components/ScrollToTop.jsx';
import IdleTimer from './components/IdleTimer';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AccountActivationPage from './pages/AccountActivationPage.jsx';
import CustomerPoliciesPage from '@/pages/CustomerPoliciesPage.jsx';
import ReimbursementRequestsPage from './pages/ReimbursementRequestsPage.jsx';
import BrokerConfigurationPage from './pages/BrokerConfigurationPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import BrokerDashboard from './pages/BrokerDashboard.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import SuperAdminPage from './pages/SuperAdminPage.jsx';

// Admin / System Routes
import RoleManagement from './pages/admin/RoleManagement.jsx';
import UsersManagement from './pages/admin/UsersManagement.jsx';
import UserActivityLog from './pages/admin/UserActivityLog.jsx';
import AuditLog from './pages/admin/AuditLog.jsx';
import BrokerManagement from './pages/admin/BrokerManagement.jsx';
import SessionManagement from './pages/admin/SessionManagement.jsx';
import APIManagement from './pages/admin/APIManagement.jsx';
import WebhookManagement from './pages/admin/WebhookManagement.jsx';

// New Admin Routes
import EmailTemplateManager from './pages/admin/EmailTemplateManager.jsx';
import SMSTemplateManager from './pages/admin/SMSTemplateManager.jsx';
import WhatsAppTemplateManager from './pages/admin/WhatsAppTemplateManager.jsx';
import NotificationCenter from './pages/admin/NotificationCenter.jsx';
import EncryptionManagement from './pages/admin/EncryptionManagement.jsx';
import PasswordPolicy from './pages/admin/PasswordPolicy.jsx';
import SecurityAlerts from './pages/admin/SecurityAlerts.jsx';
import ReportBuilder from './pages/admin/ReportBuilder.jsx';
import ReportViewer from './pages/admin/ReportViewer.jsx';
import PolicyUploadForm from './pages/admin/PolicyUploadForm.jsx';
import ClientUploadForm from './pages/admin/ClientUploadForm.jsx';
import BulkImportManager from './pages/admin/BulkImportManager.jsx';

// Auth / 2FA Routes
import TwoFactorSetup from './pages/auth/TwoFactorSetup.jsx';
import TwoFactorLogin from './pages/auth/TwoFactorLogin.jsx';
import TwoFactorManagement from './pages/auth/TwoFactorManagement.jsx';

const NotFoundPage = () => {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 tracking-tight">404 - No Encontrado</h1>
        <p className="text-muted-foreground mb-6 text-lg">La página que buscas no existe.</p>
        <a href="/" className="text-primary hover:underline font-medium">Volver al inicio</a>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <DynamicThemeProvider>
            <IdleTimer />
            <ScrollToTop />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/activate-account" element={<AccountActivationPage />} />
              <Route path="/login-2fa" element={<TwoFactorLogin />} />
              
              {/* Client Routes - Maps directly to CustomerPoliciesPage for their policies */}
              <Route path="/policies" element={<ProtectedRoute><CustomerPoliciesPage /></ProtectedRoute>} />
              {/* Legacy dashboard route forwards to policies for cleaner role separation */}
              <Route path="/dashboard" element={<Navigate to="/policies" replace />} />
              
              <Route path="/reimbursements" element={<ProtectedRoute><ReimbursementRequestsPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
              <Route path="/sessions" element={<ProtectedRoute><SessionManagement /></ProtectedRoute>} />
              <Route path="/setup-2fa" element={<ProtectedRoute><TwoFactorSetup /></ProtectedRoute>} />
              <Route path="/manage-2fa" element={<ProtectedRoute><TwoFactorManagement /></ProtectedRoute>} />

              {/* Protected Broker Admin Routes */}
              <Route path="/broker-dashboard" element={<AdminRoute><BrokerDashboard /></AdminRoute>} />
              <Route path="/analytics" element={<AdminRoute><AnalyticsPage /></AdminRoute>} />
              <Route path="/admin" element={<AdminRoute><BrokerConfigurationPage /></AdminRoute>} />
              
              <Route path="/admin/roles" element={<AdminRoute><RoleManagement /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><UsersManagement /></AdminRoute>} />
              <Route path="/admin/activity" element={<AdminRoute><UserActivityLog /></AdminRoute>} />
              <Route path="/admin/audit" element={<AdminRoute><AuditLog /></AdminRoute>} />
              <Route path="/admin/api-keys" element={<AdminRoute><APIManagement /></AdminRoute>} />
              <Route path="/admin/webhooks" element={<AdminRoute><WebhookManagement /></AdminRoute>} />
              
              <Route path="/admin/email-templates" element={<AdminRoute><EmailTemplateManager /></AdminRoute>} />
              <Route path="/admin/sms-templates" element={<AdminRoute><SMSTemplateManager /></AdminRoute>} />
              <Route path="/admin/whatsapp-templates" element={<AdminRoute><WhatsAppTemplateManager /></AdminRoute>} />
              <Route path="/admin/notification-center" element={<AdminRoute><NotificationCenter /></AdminRoute>} />
              <Route path="/admin/encryption" element={<AdminRoute><EncryptionManagement /></AdminRoute>} />
              <Route path="/admin/password-policy" element={<AdminRoute><PasswordPolicy /></AdminRoute>} />
              <Route path="/admin/security-alerts" element={<AdminRoute><SecurityAlerts /></AdminRoute>} />
              <Route path="/admin/report-builder" element={<AdminRoute><ReportBuilder /></AdminRoute>} />
              <Route path="/admin/report-viewer" element={<AdminRoute><ReportViewer /></AdminRoute>} />
              <Route path="/admin/import-policies" element={<AdminRoute><PolicyUploadForm /></AdminRoute>} />
              <Route path="/admin/import-clients" element={<AdminRoute><ClientUploadForm /></AdminRoute>} />
              <Route path="/admin/import-history" element={<AdminRoute><BulkImportManager /></AdminRoute>} />

              {/* Super Admin Routes */}
              <Route path="/superadmin" element={<AdminRoute><SuperAdminPage /></AdminRoute>} />
              <Route path="/super-admin/brokers" element={<AdminRoute><BrokerManagement /></AdminRoute>} />
              
              {/* Catch-all 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <Toaster />
          </DynamicThemeProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;