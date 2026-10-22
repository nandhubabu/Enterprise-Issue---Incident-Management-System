import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { Users, Shield, Check, X, ShieldAlert } from 'lucide-react';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userApi.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await userApi.updateUser(user.id, {
        enabled: !user.enabled,
      });
      loadUsers();
    } catch (err) {
      alert('Failed to update user: ' + err.message);
    }
  };

  const handleToggleRole = async (user, roleName) => {
    const currentRoles = new Set(user.roles || []);
    if (currentRoles.has(roleName)) {
      if (currentRoles.size === 1) {
        alert('User must retain at least one role');
        return;
      }
      currentRoles.delete(roleName);
    } else {
      currentRoles.add(roleName);
    }

    try {
      await userApi.updateUser(user.id, {
        roles: Array.from(currentRoles),
      });
      loadUsers();
    } catch (err) {
      alert('Failed to update roles: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Users color="var(--accent-primary)" />
            User Management & RBAC
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Administer enterprise user accounts, enable/disable access, and adjust role-based privileges.
          </p>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(248, 81, 73, 0.1)', border: '1px solid rgba(248, 81, 73, 0.3)', color: '#ff7b72', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
          <ShieldAlert size={15} />
          <span>{error}</span>
        </div>
      )}

      <div className="enterprise-panel" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Role Controls</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading user accounts...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>#{u.id}</td>
                    <td>
                      <div>
                        <strong>{u.firstName} {u.lastName}</strong>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{u.username}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {u.roles?.map((r) => (
                          <span
                            key={r}
                            className="badge"
                            style={{
                              background: r === 'ADMIN' ? 'rgba(239, 68, 68, 0.15)' : r === 'SUPPORT' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                              color: r === 'ADMIN' ? '#f87171' : r === 'SUPPORT' ? '#60a5fa' : '#34d399',
                              border: '1px solid currentColor',
                            }}
                          >
                            <Shield size={10} />
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`badge ${u.enabled ? 'badge-resolved' : 'badge-closed'}`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle active status"
                      >
                        {u.enabled ? <Check size={12} /> : <X size={12} />}
                        {u.enabled ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {['ADMIN', 'SUPPORT', 'DEVELOPER'].map((roleName) => {
                          const hasRole = u.roles?.includes(roleName);
                          return (
                            <button
                              key={roleName}
                              onClick={() => handleToggleRole(u, roleName)}
                              className={`btn btn-sm ${hasRole ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                            >
                              {roleName}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
