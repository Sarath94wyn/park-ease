import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import ChatWidget from './components/chatbot/ChatWidget';
import { Toaster } from 'react-hot-toast';

// Page Views
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ParkingDetailPage from './pages/ParkingDetailPage';
import BookingPage from './pages/BookingPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

function AppContent() {
  const location = useLocation();
  // Hide footer on map explorer view to provide a full-bleed map experience
  const isMapExplorer = location.pathname.startsWith('/explore');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased scrollbar-thin">
      {/* Notification Provider */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            fontFamily: 'Inter, sans-serif',
            fontSize: '13px',
            fontWeight: '600',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          },
        }}
      />

      {/* Sticky Navigation Bar */}
      <Navbar />

      {/* Main Routing Layout */}
      <div className="flex-1 flex flex-col">
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/parking/:id" element={<ParkingDetailPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Private Protected Views */}
          <Route element={<ProtectedRoute />}>
            <Route path="/booking/:lotId" element={<BookingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Route>

          {/* Administrative Protected Views */}
          <Route element={<ProtectedRoute requireAdmin={true} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>

          {/* Fallback 404 handler */}
          <Route path="/not-found" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </div>

      {/* Sticky Footer (hidden on map view) */}
      {!isMapExplorer && <Footer />}

      {/* Floating AI Chat Assistant Widget */}
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
