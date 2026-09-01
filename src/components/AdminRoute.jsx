import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminNavbar } from './AdminNavbar';

export const AdminRoute = () => {
  return (
    <div class="admin-layout">
      <AdminNavbar />
      <div class="container">
        <Outlet />
      </div>
    </div>
  );
};
