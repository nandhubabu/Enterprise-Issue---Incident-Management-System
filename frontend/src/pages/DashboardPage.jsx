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
  Sparkles
} from 'lucide-react';

export function DashboardPage({ onNavigateToIncident, onOpenCreateModal }) {
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
                  <th style={{ width: '95px' }}>Key</th>
                  <th>Incident Summary</th>
                  <th>Severity</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assignee</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
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
                      <td><SeverityBadge severity={inc.severity} /></td>
                      <td><PriorityBadge priority={inc.priority} /></td>
                      <td><StatusBadge status={inc.status} /></td>
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

        {/* Right Side: Operational Telemetry & Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Status Breakdown Panel */}
          <div className="enterprise-panel">
            <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: '1rem' }}>
              Workflow Distribution
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {stats?.statusBreakdown && Object.entries(stats.statusBreakdown).map(([statusName, count]) => {
                const total = stats.totalIncidents || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={statusName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>{statusName}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{count} ({percentage}%)</span>
                    </div>
                    <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        borderRadius: '4px',
                        background: statusName === 'OPEN' ? '#2563eb' :
                                    statusName === 'IN_PROGRESS' ? '#d97706' :
                                    statusName === 'RESOLVED' ? '#059669' :
                                    statusName === 'ASSIGNED' ? '#7c3aed' : '#94a3b8',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Responder Card */}
          <div className="enterprise-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.65rem' }}>
              <div style={{ width: 30, height: 30, borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                <Shield size={16} />
              </div>
              <strong style={{ fontSize: '0.92rem', color: 'var(--text-heading)' }}>Operator Identity</strong>
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Authenticated as <strong>@{user?.username}</strong> ({user?.email}) with active permissions:
            </div>
            <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
              {user?.roles?.map((r) => (
                <span
                  key={r}
                  className="badge"
                  style={{
                    background: r === 'ADMIN' ? '#fef2f2' : r === 'SUPPORT' ? '#eff6ff' : '#ecfdf5',
                    borderColor: r === 'ADMIN' ? '#fecaca' : r === 'SUPPORT' ? '#bfdbfe' : '#a7f3d0',
                    color: r === 'ADMIN' ? '#dc2626' : r === 'SUPPORT' ? '#2563eb' : '#059669',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
