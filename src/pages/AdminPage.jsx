import React, { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Users, Activity, Clock, Shield, Trash2 } from 'lucide-react';

export const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.getUsersDiagnostics();
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching admin diagnostics:', err);
      if (err.response?.status === 403) {
        setError('Access Denied: Admin privileges required.');
      } else {
        setError('Failed to query system diagnostics.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, currentAdminState) => {
    try {
      await adminApi.updateUserRole(userId, !currentAdminState);
      loadDiagnostics();
    } catch (err) {
      console.error('Error updating user role:', err);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
      await adminApi.deleteUser(userId);
      loadDiagnostics();
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  const totalUsers = users.length;
  const totalSessions = users.reduce((acc, u) => acc + (u.total_sessions || 0), 0);

  let latestUser = null;
  let latestTime = 0;
  users.forEach((u) => {
    if (u.last_active_date) {
      const t = new Date(u.last_active_date).getTime();
      if (t > latestTime) {
        latestTime = t;
        latestUser = u;
      }
    }
  });

  const latestActivityStr = latestUser
    ? `${latestUser.name} (${latestUser.last_active_date.split('T')[0]})`
    : 'None';

  return (
    <div>
      {/* Stat Cards Grid */}
      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon bg-blue">
            <Users className="icon-lg" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Registered Users</span>
            <span className="metric-value">{totalUsers}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-green">
            <Activity className="icon-lg" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Total Active Sessions</span>
            <span className="metric-value">{totalSessions}</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon bg-purple">
            <Clock className="icon-lg" />
          </div>
          <div className="metric-content">
            <span className="metric-label">Last Activity Logged</span>
            <span className="metric-value" style={{ fontSize: '1.2rem' }}>{latestActivityStr}</span>
          </div>
        </div>
      </section>

      {/* Admin Diagnostics Table Panel */}
      <section className="panel">
        <div className="panel-header">
          <h2>User Activity Diagnostic Table</h2>
          <p>Global view of registered accounts, role permissions, and workout statistics</p>
        </div>

        {error ? (
          <div className="table-loading" style={{ color: 'var(--danger-color)', fontWeight: 600 }}>
            {error}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Display Name</th>
                  <th>Permissions</th>
                  <th>Session Count</th>
                  <th>Last Active Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="table-loading">Querying system diagnostics...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="table-loading">No registered users found.</td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const lastActive = u.last_active_date
                      ? u.last_active_date.replace('T', ' ')
                      : '--';

                    return (
                      <tr key={u.user_id}>
                        <td><strong>{u.user_id}</strong></td>
                        <td>{u.username}</td>
                        <td>{u.name}</td>
                        <td>
                          {u.is_admin ? (
                            <span className="badge badge-blue">ADMIN</span>
                          ) : (
                            <span className="badge badge-slate">USER</span>
                          )}
                        </td>
                        <td>{u.total_sessions || 0}</td>
                        <td>{lastActive}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                              onClick={() => handleToggleAdmin(u.user_id, u.is_admin)}
                            >
                              {u.is_admin ? 'Demote' : 'Promote Admin'}
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              style={{ padding: '4px 8px' }}
                              onClick={() => handleDeleteUser(u.user_id, u.username)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
