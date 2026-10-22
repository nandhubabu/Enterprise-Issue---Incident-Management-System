import React, { useState, useEffect } from 'react';
import { incidentApi } from '../api/incidentApi';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Plus, 
  Shield, 
  Layers, 
  Flame, 
  UserCheck, 
  Activity, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Fingerprint, 
  Mail, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';

export function DashboardPage({ onNavigateToIncident, onOpenCreateModal, onNavigateToUsers }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, incidentsPage] = await Promise.all([
        incidentApi.getStats(),
        incidentApi.getIncidents({ page: 0, size: 6, sort: 'createdAt,desc' }),
      ]);
      setStats(statsData);
      setRecentIncidents(incidentsPage?.content || []);
    } catch (err) {
      console.error('Failed to load operations data', err);
    } finally {
      setLoading(false);
    }
  };

  const hasCriticalOutage = stats?.criticalCount > 0;

  const getAvatarColor = (roles = []) => {
    if (roles?.includes('ADMIN')) return 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
    if (roles?.includes('DEVELOPER')) return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
    return 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
  };

  const avatarInitials = `${user?.firstName?.slice(0, 1) || ''}${user?.lastName?.slice(0, 1) || ''}`.toUpperCase() || user?.username?.slice(0, 2).toUpperCase() || 'OP';

  const statusColorMap = {
    OPEN: '#2563eb',
    IN_PROGRESS: '#d97706',
    RESOLVED: '#059669',
    ASSIGNED: '#7c3aed',
    CLOSED: '#64748b',
    REOPENED: '#e11d48',
  };

  return (
    <div className="page-wrapper">
      {/* Top Banner for Active Critical / S1 Incidents (Modern Floating Alert) */}
      {hasCriticalOutage && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1px solid #fecaca',
          borderRadius: 'var(--radius-lg)',
          padding: '1.1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
          boxShadow: '0 4px 14px -2px rgba(239, 68, 68, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: '#ef4444',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 3px 8px rgba(239, 68, 68, 0.35)',
              flexShrink: 0
            }}>
              <Flame size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ color: '#b91c1c', fontSize: '0.92rem', letterSpacing: '-0.01em' }}>
                  ACTIVE HIGH-SEVERITY OUTAGE
                </strong>
                <span className="badge" style={{ background: '#ef4444', color: '#fff', fontSize: '0.65rem' }}>
                  SEV-1
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#7f1d1d', marginTop: '0.15rem' }}>
                {stats.criticalCount} critical production outage(s) currently require technical investigation.
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm"
            style={{ background: '#ef4444', color: '#fff', fontWeight: 600, padding: '0.45rem 1rem', boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)' }}
            onClick={() => onNavigateToIncident(recentIncidents[0]?.id)}
          >
            Review Outage
          </button>
        </div>
      )}

      {/* Operations Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-heading)' }}>
            Operations Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Real-time incident response telemetry and dispatch queue for <strong>{user?.firstName} {user?.lastName}</strong>.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateModal} style={{ padding: '0.55rem 1.15rem', borderRadius: '10px' }}>
          <Plus size={16} />
          <span>Report Outage</span>
        </button>
      </div>

      {/* Metrics Row (Modern Elevated Stat Cards with Soft Color Squircles) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem'
      }}>
        {/* Card 1: Total */}
        <div className="enterprise-panel" style={{ padding: '1.2rem 1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em' }}>
                Total Incidents
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-sans)', marginTop: '0.3rem', color: 'var(--text-heading)', letterSpacing: '-0.03em' }}>
                {stats?.totalIncidents ?? 0}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Layers size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            All systems tracked
          </div>
        </div>

        {/* Card 2: Needs Triage */}
        <div className="enterprise-panel" style={{ padding: '1.2rem 1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#2563eb', fontWeight: 700, letterSpacing: '0.05em' }}>
                Needs Triage (Open)
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-sans)', marginTop: '0.3rem', color: '#2563eb', letterSpacing: '-0.03em' }}>
                {stats?.openCount ?? 0}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Awaiting developer dispatch
          </div>
        </div>

        {/* Card 3: Active Investigation */}
        <div className="enterprise-panel" style={{ padding: '1.2rem 1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#d97706', fontWeight: 700, letterSpacing: '0.05em' }}>
                Active Investigation
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-sans)', marginTop: '0.3rem', color: '#d97706', letterSpacing: '-0.03em' }}>
                {(stats?.assignedCount ?? 0) + (stats?.inProgressCount ?? 0)}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              <Activity size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Assigned or in progress
          </div>
        </div>

        {/* Card 4: Resolved */}
        <div className="enterprise-panel" style={{ padding: '1.2rem 1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#059669', fontWeight: 700, letterSpacing: '0.05em' }}>
                Resolved & Verified
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-sans)', marginTop: '0.3rem', color: '#059669', letterSpacing: '-0.03em' }}>
                {stats?.resolvedCount ?? 0}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Verified in production
          </div>
        </div>

        {/* Card 5: Assigned to Me */}
        <div className="enterprise-panel" style={{ padding: '1.2rem 1.35rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#7c3aed', fontWeight: 700, letterSpacing: '0.05em' }}>
                Assigned to Me
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-sans)', marginTop: '0.3rem', color: '#7c3aed', letterSpacing: '-0.03em' }}>
                {stats?.assignedToMeCount ?? 0}
              </div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
              <UserCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            On your workbench
          </div>
        </div>
      </div>

      {/* Main Grid: Triage Queue & Service Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Triage Queue Table */}
        <div className="enterprise-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.1rem 1.5rem', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Layers size={15} />
              </div>
              <strong style={{ fontSize: '0.94rem', color: 'var(--text-heading)' }}>Live Incident Triage Queue</strong>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
              RECENT DISPATCH
            </span>
          </div>

          <div className="table-container" style={{ border: 'none', boxShadow: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Key</th>
                  <th>Incident Summary</th>
                  <th style={{ width: '85px', whiteSpace: 'nowrap' }}>Severity</th>
                  <th style={{ width: '105px', whiteSpace: 'nowrap' }}>Priority</th>
                  <th style={{ width: '115px', whiteSpace: 'nowrap' }}>Status</th>
                  <th style={{ width: '120px' }}>Assignee</th>
                  <th style={{ textAlign: 'right', width: '90px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentIncidents.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                      No active incidents logged. All systems operational.
                    </td>
                  </tr>
                ) : (
                  recentIncidents.map((inc) => (
                    <tr key={inc.id}>
                      <td>
                        <span className="ticket-key">INC-{inc.id}</span>
                      </td>
                      <td>
                        <div
                          style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--text-heading)', fontSize: '0.9rem' }}
                          onClick={() => onNavigateToIncident(inc.id)}
                          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--jira-blue)')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-heading)')}
                        >
                          {inc.title}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                          Opened by @{inc.createdBy?.username} • {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}><SeverityBadge severity={inc.severity} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}><PriorityBadge priority={inc.priority} /></td>
                      <td style={{ whiteSpace: 'nowrap' }}><StatusBadge status={inc.status} /></td>
                      <td style={{ fontSize: '0.84rem' }}>
                        {inc.assignedTo ? (
                          <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>@{inc.assignedTo.username}</span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onNavigateToIncident(inc.id)}
                          style={{ borderRadius: '8px' }}
                        >
                          <span>Triage</span>
                          <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Operational Telemetry & Security Hub */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Modern Workflow Distribution Panel */}
          <div className="enterprise-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Activity size={15} />
                </div>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-heading)' }}>Workflow Distribution</strong>
              </div>
              <span className="badge" style={{ background: '#f1f5f9', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                {stats?.totalIncidents ?? 0} ACTIVE TICKETS
              </span>
            </div>

            {/* Segmented Multi-Color Progress Bar */}
            <div style={{
              height: '8px',
              background: '#f1f5f9',
              borderRadius: '9999px',
              overflow: 'hidden',
              display: 'flex',
              marginBottom: '1rem',
              gap: '1px'
            }}>
              {stats?.statusBreakdown && Object.entries(stats.statusBreakdown).map(([statusName, count]) => {
                if (count === 0) return null;
                const total = stats.totalIncidents || 1;
                const percentage = (count / total) * 100;
                return (
                  <div
                    key={statusName}
                    title={`${statusName}: ${count} (${Math.round(percentage)}%)`}
                    style={{
                      height: '100%',
                      width: `${percentage}%`,
                      background: statusColorMap[statusName] || '#94a3b8',
                      transition: 'width 0.3s ease'
                    }}
                  />
                );
              })}
            </div>

            {/* Active Status Metric Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {stats?.statusBreakdown && Object.entries(stats.statusBreakdown).map(([statusName, count]) => {
                const total = stats.totalIncidents || 1;
                const percentage = Math.round((count / total) * 100);
                const color = statusColorMap[statusName] || '#64748b';

                return (
                  <div
                    key={statusName}
                    style={{
                      padding: '0.55rem 0.75rem',
                      background: '#f8fafc',
                      borderRadius: '8px',
                      border: '1px solid var(--border-default)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
                      <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
                        {statusName}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.74rem', fontWeight: 700, color: count > 0 ? color : 'var(--text-dim)' }}>
                      {count} ({percentage}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Premium Enterprise Security & Access Posture Hub */}
          <div className="enterprise-panel">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: 32, height: 32, borderRadius: '9px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-heading)' }}>Security & Access Posture</strong>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.04em', fontWeight: 700 }}>
                    RBAC GOVERNANCE
                  </div>
                </div>
              </div>

              <span className="badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0', fontSize: '0.68rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669' }} />
                ENFORCED
              </span>
            </div>

            {/* Operator Identity Card */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              padding: '0.85rem 1rem',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid var(--border-default)',
              marginBottom: '1rem'
            }}>
              <div
                className="user-avatar-circle"
                style={{ width: 42, height: 42, fontSize: '0.95rem', background: getAvatarColor(user?.roles) }}
                title={`${user?.firstName} ${user?.lastName}`}
              >
                {avatarInitials}
              </div>

              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--text-heading)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.firstName} {user?.lastName}
                  </strong>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    @{user?.username}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  <Mail size={12} color="var(--text-dim)" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>

            {/* Clearance & Roles */}
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '0.4rem' }}>
                Assigned Security Clearance
              </span>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {user?.roles?.map((r) => (
                  <span
                    key={r}
                    className="badge"
                    style={{
                      background: r === 'ADMIN' ? '#fef2f2' : r === 'SUPPORT' ? '#eff6ff' : '#ecfdf5',
                      borderColor: r === 'ADMIN' ? '#fecaca' : r === 'SUPPORT' ? '#bfdbfe' : '#a7f3d0',
                      color: r === 'ADMIN' ? '#dc2626' : r === 'SUPPORT' ? '#2563eb' : '#059669',
                      padding: '0.22rem 0.65rem',
                      fontSize: '0.72rem',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    <Shield size={11} />
                    {r === 'ADMIN' ? 'ROOT ADMINISTRATOR' : r === 'SUPPORT' ? 'NOC DISPATCHER' : 'REMEDIATION ENGINEER'}
                  </span>
                ))}
              </div>
            </div>

            {/* Security Cryptographic Posture 2x2 Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.55rem',
              marginBottom: '1rem'
            }}>
              <div style={{ padding: '0.65rem 0.75rem', background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  <Lock size={12} color="#059669" />
                  <span>Auth Token</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                  JWT HMAC-256
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.75rem', background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  <KeyRound size={12} color="#2563eb" />
                  <span>Authorization</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '0.2rem' }}>
                  Spring Security 6
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.75rem', background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  <Fingerprint size={12} color="#7c3aed" />
                  <span>Tracing</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                  MDC Correlation
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.75rem', background: '#ffffff', border: '1px solid var(--border-default)', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-dim)', fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700 }}>
                  <ShieldCheck size={12} color="#059669" />
                  <span>Audit Policy</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-heading)', marginTop: '0.2rem' }}>
                  Immutable sys_audit
                </div>
              </div>
            </div>

            {/* Quick Governance Navigation Link */}
            {user?.roles?.includes('ADMIN') && onNavigateToUsers && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={onNavigateToUsers}
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  borderRadius: '10px',
                  padding: '0.55rem',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <UserCheck size={14} color="var(--jira-blue)" />
                <span>Open Identity Directory & RBAC</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
