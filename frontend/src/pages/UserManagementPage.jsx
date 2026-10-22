import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { 
  Users, 
  Shield, 
  Check, 
  X, 
  ShieldAlert, 
  Search, 
  Filter, 
  UserCheck, 
  Mail, 
  KeyRound, 
  ShieldCheck,
  UserX,
  Sparkles
} from 'lucide-react';

export function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'ADMIN' | 'SUPPORT' | 'DEVELOPER'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DISABLED'

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
      alert('Failed to update account status: ' + err.message);
    }
  };

  const handleToggleRole = async (user, roleName) => {
    const currentRoles = new Set(user.roles || []);
    if (currentRoles.has(roleName)) {
      if (currentRoles.size === 1) {
        alert('Security Constraint: User account must retain at least one operational role.');
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
      alert('Failed to update role privileges: ' + err.message);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      !searchTerm ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.roles?.includes(roleFilter);
    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && u.enabled) ||
      (statusFilter === 'DISABLED' && !u.enabled);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Metric counts
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.enabled).length;
  const adminCount = users.filter((u) => u.roles?.includes('ADMIN')).length;
  const devCount = users.filter((u) => u.roles?.includes('DEVELOPER')).length;

  const getAvatarColor = (roles = []) => {
    if (roles.includes('ADMIN')) return 'linear-gradient(135deg, #de350b 0%, #bf2600 100%)';
    if (roles.includes('DEVELOPER')) return 'linear-gradient(135deg, #00875a 0%, #006644 100%)';
    return 'linear-gradient(135deg, #0052cc 0%, #0747a6 100%)';
  };

  return (
    <div className="page-wrapper">
      {/* Modern Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-heading)' }}>
              Identity & Access Governance
            </h1>
            <span className="badge" style={{ background: 'var(--surface-active)', color: 'var(--jira-blue)', border: '1px solid #b3d4ff' }}>
              RBAC Controller
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '0.25rem' }}>
            Manage enterprise operator accounts, authentication seats, and role permission policies.
          </p>
        </div>
      </div>

      {/* Metrics Row (Modern Elevated Stat Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '0.9rem',
        marginBottom: '1.5rem',
      }}>
        <div className="enterprise-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em' }}>
            Total Operators
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.2rem', color: 'var(--text-heading)' }}>
            {totalUsers}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Registered enterprise accounts
          </div>
        </div>

        <div className="enterprise-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--status-resolved)', fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-resolved)' }} />
            Active Seats
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--status-resolved)', marginTop: '0.2rem' }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Permitted for system dispatch
          </div>
        </div>

        <div className="enterprise-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--pagerduty-red)', fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={12} />
            System Administrators
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--pagerduty-red)', marginTop: '0.2rem' }}>
            {adminCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Root governance authority
          </div>
        </div>

        <div className="enterprise-panel" style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--jira-blue)', fontWeight: 700, letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <UserCheck size={12} />
            Engineers & Responders
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--jira-blue)', marginTop: '0.2rem' }}>
            {devCount}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Tier-2 technical triage
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--pagerduty-red-subtle)', border: '1px solid var(--pagerduty-red-border)', color: 'var(--pagerduty-red)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
          <ShieldAlert size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* Modern Filter & Search Controls */}
      <div className="enterprise-panel" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.2rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search box */}
          <div style={{ position: 'relative', flex: '1 1 280px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search operators by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.3rem' }}
            />
          </div>

          {/* Quick Filter Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginRight: '0.25rem' }}>
              Role:
            </span>
            <button
              className={`filter-pill ${roleFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => setRoleFilter('ALL')}
            >
              All Roles
            </button>
            <button
              className={`filter-pill ${roleFilter === 'ADMIN' ? 'active' : ''}`}
              onClick={() => setRoleFilter('ADMIN')}
            >
              Admins
            </button>
            <button
              className={`filter-pill ${roleFilter === 'SUPPORT' ? 'active' : ''}`}
              onClick={() => setRoleFilter('SUPPORT')}
            >
              Support
            </button>
            <button
              className={`filter-pill ${roleFilter === 'DEVELOPER' ? 'active' : ''}`}
              onClick={() => setRoleFilter('DEVELOPER')}
            >
              Developers
            </button>
          </div>

          {/* Status selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Active Only</option>
              <option value="DISABLED">Disabled Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Modern High-Density User Directory Grid */}
      <div className="enterprise-panel" style={{ padding: 0, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Operator Identity</th>
                <th>Enterprise Email</th>
                <th>Assigned Roles</th>
                <th style={{ width: '130px' }}>Account Status</th>
                <th style={{ textAlign: 'right', width: '310px' }}>RBAC Permissions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                    Loading operator accounts from enterprise directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                    No operators match the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const avatarInitials = `${u.firstName?.slice(0, 1) || ''}${u.lastName?.slice(0, 1) || ''}`.toUpperCase() || u.username.slice(0, 2).toUpperCase();

                  return (
                    <tr key={u.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-dim)', fontSize: '0.78rem' }}>
                        #{u.id}
                      </td>

                      {/* Operator Identity with Avatar */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            className="user-avatar-circle"
                            style={{ background: getAvatarColor(u.roles) }}
                            title={`${u.firstName} ${u.lastName}`}
                          >
                            {avatarInitials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-heading)', fontSize: '0.9rem' }}>
                              {u.firstName} {u.lastName}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '0.1rem' }}>
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          <Mail size={13} color="var(--text-dim)" />
                          <span>{u.email}</span>
                        </div>
                      </td>

                      {/* Active Roles */}
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                          {u.roles?.map((r) => (
                            <span
                              key={r}
                              className="badge"
                              style={{
                                background: r === 'ADMIN' ? 'var(--pagerduty-red-subtle)' : r === 'SUPPORT' ? 'var(--jira-blue-subtle)' : 'var(--status-resolved-bg)',
                                color: r === 'ADMIN' ? 'var(--pagerduty-red)' : r === 'SUPPORT' ? 'var(--jira-blue)' : 'var(--status-resolved)',
                                borderColor: r === 'ADMIN' ? 'var(--pagerduty-red-border)' : r === 'SUPPORT' ? '#b3d4ff' : 'var(--status-resolved-border)',
                                borderRadius: '12px',
                                padding: '0.15rem 0.55rem',
                              }}
                            >
                              <Shield size={10} />
                              {r}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Interactive iOS / Jira Switch Toggle */}
                      <td>
                        <button
                          type="button"
                          className="switch-toggle"
                          onClick={() => handleToggleStatus(u)}
                          title={`Click to ${u.enabled ? 'disable' : 'enable'} operator access`}
                        >
                          <div className={`switch-track ${u.enabled ? 'active' : ''}`}>
                            <div className="switch-thumb" />
                          </div>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono)',
                            color: u.enabled ? 'var(--status-resolved)' : 'var(--text-dim)'
                          }}>
                            {u.enabled ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </button>
                      </td>

                      {/* Interactive Role Permissions Matrix */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {['ADMIN', 'SUPPORT', 'DEVELOPER'].map((roleName) => {
                            const hasRole = u.roles?.includes(roleName);
                            const roleClass = roleName.toLowerCase();

                            return (
                              <button
                                key={roleName}
                                type="button"
                                onClick={() => handleToggleRole(u, roleName)}
                                className={`role-toggle-pill ${hasRole ? `active-${roleClass}` : ''}`}
                                title={`Toggle ${roleName} permission`}
                              >
                                {hasRole ? (
                                  <Check size={11} strokeWidth={3} />
                                ) : (
                                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginRight: '1px' }}>+</span>
                                )}
                                <span>{roleName}</span>
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Directory Footer */}
        <div style={{
          padding: '0.75rem 1.25rem',
          background: '#fafbfc',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> operators
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--status-resolved)' }} />
            <span>Role changes apply instantly via Spring Security RBAC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
