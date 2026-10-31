import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminNavbar } from './AdminNavbar';
import { useAuth } from '../context/AuthContext';

export const AdminRoute = () => {
  const { loading, isAdmin } = useAuth();
  if (loading) return <div className="admin-layout">Loading FitSense...</div>;
  if (!isAdmin) {
    window.location.href = '/app/overview';
    return null;
  }
  return (
    <div className="admin-layout">
      <AdminNavbar />
      <div className="container">
        <Outlet />
      </div>
    </div>
  );
};
