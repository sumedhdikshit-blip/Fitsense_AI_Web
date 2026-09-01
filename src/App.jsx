import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedLayout } from './components/ProtectedLayout';
import { AdminRoute } from './components/AdminRoute';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { OverviewPage } from './pages/OverviewPage';
import { WorkoutPage } from './pages/WorkoutPage';
import { HistoryPage } from './pages/HistoryPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Pages */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* App Routes */}
            <Route path="/app" element={<ProtectedLayout />}>
              <Route index element={<Navigate to="/app/overview" replace />} />
              <Route path="overview" element={<OverviewPage />} />
              <Route path="workout" element={<WorkoutPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="profile-page" element={<ProfilePage />} />
              <Route path="calculator" element={<CalculatorPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route index element={<AdminPage />} />
            </Route>

            {/* Direct Fallback Redirects */}
            <Route path="/" element={<Navigate to="/app/overview" replace />} />
            <Route path="/overview" element={<Navigate to="/app/overview" replace />} />
            <Route path="/workout" element={<Navigate to="/app/workout" replace />} />
            <Route path="/history" element={<Navigate to="/app/history" replace />} />
            <Route path="/profile-page" element={<Navigate to="/app/profile-page" replace />} />
            <Route path="/calculator" element={<Navigate to="/app/calculator" replace />} />
            <Route path="*" element={<Navigate to="/app/overview" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
