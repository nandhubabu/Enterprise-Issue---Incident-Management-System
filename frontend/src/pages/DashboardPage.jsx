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
  UserCheck
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
      {/* Top Banner for Active Critical / S1 Incidents (PagerDuty Inspired) */}
      {hasCriticalOutage && (
        <div style={{
          background: 'rgba(229, 72, 77, 0.12)',
          border: '1px solid rgba(229, 72, 77, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Flame size={20} color="#ff7b72" />
            <div>
              <strong style={{ color: '#ff7b72', fontSize: '0.88rem' }}>
                ACTIVE HIGH-SEVERITY ALERT
              </strong>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {stats.criticalCount} Critical (SEV-1) outage(s) currently require technical investigation.
              </div>
            </div>
          </div>
          <button
            className="btn btn-sm"
            style={{ background: 'var(--pagerduty-red)', color: '#fff' }}
            onClick={() => onNavigateToIncident(recentIncidents[0]?.id)}
          >
            Review Priority Incident
          </button>
        </div>
      )}

      {/* Operations Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Operations Command Center
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.2rem' }}>
            Real-time incident response telemetry and triage queue for <strong>{user?.firstName} {user?.lastName}</strong>.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateModal}>
          <Plus size={16} />
          <span>Report Outage</span>
        </button>
      </div>

      {/* Metrics Row (High Density ServiceNow / PagerDuty style) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '0.9rem',
        marginBottom: '1.75rem'
      }}>
        <div className="enterprise-panel" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em' }}>
            Total Incidents
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '0.25rem' }}>
            {stats?.totalIncidents ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Tracked across all systems
          </div>
        </div>

        <div className="enterprise-panel" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#58a6ff', fontWeight: 700, letterSpacing: '0.06em' }}>
            Needs Triage (Open)
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#58a6ff', marginTop: '0.25rem' }}>
            {stats?.openCount ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Awaiting developer assignment
          </div>
        </div>

        <div className="enterprise-panel" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#e3b341', fontWeight: 700, letterSpacing: '0.06em' }}>
            Active Investigation
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#e3b341', marginTop: '0.25rem' }}>
            {(stats?.assignedCount ?? 0) + (stats?.inProgressCount ?? 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Assigned or In Progress
          </div>
        </div>

        <div className="enterprise-panel" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#3fb950', fontWeight: 700, letterSpacing: '0.06em' }}>
            Resolved & Verified
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#3fb950', marginTop: '0.25rem' }}>
            {stats?.resolvedCount ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Fix confirmed in staging/prod
          </div>
        </div>

        <div className="enterprise-panel" style={{ padding: '1rem 1.15rem' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--jira-blue)', fontWeight: 700, letterSpacing: '0.06em' }}>
            Assigned to Me
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#79c0ff', marginTop: '0.25rem' }}>
            {stats?.assignedToMeCount ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Tickets on your workbench
          </div>
        </div>
      </div>

      {/* Main Grid: Triage Queue & Service Telemetry */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        {/* Triage Queue Table */}
        <div className="enterprise-panel" style={{ padding: 0 }}>
          <div style={{ padding: '0.9rem 1.25rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} color="var(--text-muted)" />
              <strong style={{ fontSize: '0.88rem' }}>Live Incident Triage Queue</strong>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              RECENT TICKETS
            </span>
          </div>

          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>Key</th>
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
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
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
                          style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)' }}
                          onClick={() => onNavigateToIncident(inc.id)}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#58a6ff')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                        >
                          {inc.title}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                          Opened by @{inc.createdBy?.username} • {new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td><SeverityBadge severity={inc.severity} /></td>
                      <td><PriorityBadge priority={inc.priority} /></td>
                      <td><StatusBadge status={inc.status} /></td>
                      <td style={{ fontSize: '0.82rem' }}>
                        {inc.assignedTo ? (
                          <span>@{inc.assignedTo.username}</span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onNavigateToIncident(inc.id)}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Status Breakdown Panel */}
          <div className="enterprise-panel">
            <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: '0.9rem' }}>
              Workflow Distribution
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {stats?.statusBreakdown && Object.entries(stats.statusBreakdown).map(([statusName, count]) => {
                const total = stats.totalIncidents || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={statusName}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>{statusName}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{count} ({percentage}%)</span>
                    </div>
                    <div style={{ height: '5px', background: 'var(--surface-sidebar)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${percentage}%`,
                        background: statusName === 'OPEN' ? '#388bff' :
                                    statusName === 'IN_PROGRESS' ? '#d29922' :
                                    statusName === 'RESOLVED' ? '#2da44e' :
                                    statusName === 'ASSIGNED' ? '#a371f7' : '#6e7681',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Responder Card */}
          <div className="enterprise-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Shield size={16} color="var(--jira-blue)" />
              <strong style={{ fontSize: '0.84rem' }}>Operator Identity</strong>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Logged in as <strong>@{user?.username}</strong> ({user?.email}) with granted permissions:
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              {user?.roles?.map((r) => (
                <span
                  key={r}
                  className="badge"
                  style={{ background: 'var(--surface-sidebar)', borderColor: 'var(--border-default)', color: 'var(--text-main)' }}
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
