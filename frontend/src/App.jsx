import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageContainer from './components/PageContainer';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import CitizenDashboard from './pages/CitizenDashboard';
import ReportEmergencyPage from './pages/ReportEmergencyPage';
import MyReportsPage from './pages/MyReportsPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import CitizenSafetyMapPage from './pages/CitizenSafetyMapPage';
import AiSafetyAssistantPage from './pages/AiSafetyAssistantPage';
import CommunityFeedPage from './pages/CommunityFeedPage';
import SafetyTipsPage from './pages/SafetyTipsPage';
import NotificationsPage from './pages/NotificationsPage';
import PlaceholderPage from './pages/PlaceholderPage';

import CitizenVolunteerCenterPage from './pages/CitizenVolunteerCenterPage';
import AdminVolunteerManagementPage from './pages/AdminVolunteerManagementPage';

import AdminDashboard from './pages/AdminDashboard';
import AdminReportsPage from './pages/AdminReportsPage';
import AdminReportDetailsPage from './pages/AdminReportDetailsPage';
import AdminRespondersPage from './pages/AdminRespondersPage';
import AdminDuplicatesPage from './pages/AdminDuplicatesPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AdminBroadcastCenterPage from './pages/AdminBroadcastCenterPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AdminSheltersPage from './pages/AdminSheltersPage';

import ResponderDashboard from './pages/ResponderDashboard';
import ResponderEmergenciesPage from './pages/ResponderEmergenciesPage';
import ResponderEmergencyDetailsPage from './pages/ResponderEmergencyDetailsPage';

import { MapPin, Ambulance, Bell, Bot, Users } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <PageContainer>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Citizen Routes */}
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <Navigate to="/citizen/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/report-emergency"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <ReportEmergencyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/my-reports"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <MyReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/reports/:id"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <ReportDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/safety-map"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <CitizenSafetyMapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/map"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <Navigate to="/citizen/safety-map" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/services"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <CitizenSafetyMapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/alerts"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'ADMIN']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/ai-assistant"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'RESPONDER', 'ADMIN']}>
                    <AiSafetyAssistantPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/community"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'RESPONDER', 'ADMIN']}>
                    <CommunityFeedPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/safety-tips"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'RESPONDER', 'ADMIN']}>
                    <SafetyTipsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/volunteer"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'RESPONDER', 'ADMIN']}>
                    <CitizenVolunteerCenterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/assistant"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'RESPONDER', 'ADMIN']}>
                    <AiSafetyAssistantPage />
                  </ProtectedRoute>
                }
              />


              {/* Protected Admin Routes (Phase 4A & 4B) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Navigate to="/admin/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminReportDetailsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/responders"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminRespondersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/duplicates"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDuplicatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/resources"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminResourcesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/broadcasts"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminBroadcastCenterPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminAnalyticsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/shelters"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminSheltersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/volunteers"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'RESPONDER']}>
                    <AdminVolunteerManagementPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Responder Routes (Phase 4C) */}
              <Route
                path="/responder"
                element={
                  <ProtectedRoute allowedRoles={['RESPONDER', 'ADMIN']}>
                    <Navigate to="/responder/dashboard" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/responder/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['RESPONDER', 'ADMIN']}>
                    <ResponderDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/responder/emergencies"
                element={
                  <ProtectedRoute allowedRoles={['RESPONDER', 'ADMIN']}>
                    <ResponderEmergenciesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/responder/emergencies/:id"
                element={
                  <ProtectedRoute allowedRoles={['RESPONDER', 'ADMIN']}>
                    <ResponderEmergencyDetailsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN', 'RESPONDER', 'ADMIN']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageContainer>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
