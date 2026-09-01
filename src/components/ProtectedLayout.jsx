import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import { ChatbotWidget } from './ChatbotWidget';

export const ProtectedLayout = () => {
  const { profile } = useAuth();
  const isProfileIncomplete = profile && (!profile.weight_kg || !profile.height_cm || !profile.age);

  return (
    <div class="app-container">
      {isProfileIncomplete && (
        <div class="setup-banner" id="setupBanner">
          <div class="setup-banner-content">
            <svg class="setup-banner-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Set your profile (Weight, Height, Age, Gender) for accurate BMR and calorie calculations.</span>
          </div>
          <a class="btn btn-warning btn-sm" href="/app/profile-page">Configure Profile</a>
        </div>
      )}

      <Navbar />
      <main>
        <Outlet />
      </main>
      <ChatbotWidget />
    </div>
  );
};
