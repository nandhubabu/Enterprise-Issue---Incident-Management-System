import React, { useState, useEffect } from 'react';
import { incidentApi } from '../api/incidentApi';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { 
  AlertOctagon, 
  Clock, 
  CheckCircle2, 
  Flame, 
  UserCheck, 
  PlusCircle, 
  ArrowRight,
  TrendingUp,
  Activity
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
        incidentApi.getIncidents({ page: 0, size: 5, sort: 'createdAt,desc' }),
      ]);
      setStats(statsData);
      setRecentIncidents(incidentsPage?.content || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Activity color="var(--accent-secondary)" />
            Enterprise Operations Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Welcome back, <strong>{user?.firstName}</strong>. Real-time system telemetry and incident metrics.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateModal}>
          <PlusCircle size={18} />
          <span>Report Incident</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div>
            <span className="kpi-title">Total Incidents</span>
            <div className="kpi-value">{stats?.totalIncidents ?? 0}</div>
          </div>
          <div style={{ padding: '0.6rem', background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', borderRadius: 'var(--radius-md)' }}>
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <span className="kpi-title">Open Backlog</span>
            <div className="kpi-value" style={{ color: '#60a5fa' }}>{stats?.openCount ?? 0}</div>
          </div>
          <div style={{ padding: '0.6rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: 'var(--radius-md)' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <span className="kpi-title">In Progress</span>
            <div className="kpi-value" style={{ color: '#fbbf24' }}>{stats?.inProgressCount ?? 0}</div>
          </div>
          <div style={{ padding: '0.6rem', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', borderRadius: 'var(--radius-md)' }}>
            <Activity size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <span className="kpi-title">Resolved</span>
            <div className="kpi-value" style={{ color: '#34d399' }}>{stats?.resolvedCount ?? 0}</div>
          </div>
          <div style={{ padding: '0.6rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderRadius: 'var(--radius-md)' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <span className="kpi-title">Critical (S1)</span>
            <div className="kpi-value" style={{ color: '#f87171' }}>{stats?.criticalCount ?? 0}</div>
          </div>
          <div style={{ padding: '0.6rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: 'var(--radius-md)' }}>
            <AlertOctagon size={24} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <span className="kpi-title">Assigned to Me</span>
            <div className="kpi-value" style={{ color: 'var(--accent-secondary)' }}>{stats?.assignedToMeCount ?? 0}</div>
          </div>
          <div style={{ padding: '0.6rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-secondary)', borderRadius: 'var(--radius-md)' }}>
            <UserCheck size={24} />
          </div>
        </div>
      </div>

      {/* Breakdown Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={18} color="var(--accent-primary)" />
            Incidents by Status Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats?.statusBreakdown && Object.entries(stats.statusBreakdown).map(([status, count]) => (
              <div key={status} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <StatusBadge status={status} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={18} color="#f97316" />
            Incidents by Priority Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {stats?.priorityBreakdown && Object.entries(stats.priorityBreakdown).map(([priority, count]) => (
              <div key={priority} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <PriorityBadge priority={priority} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3>Recently Logged Incidents</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Latest 5 items</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No incidents logged yet. Click "Report Incident" to create one.
                  </td>
                </tr>
              ) : (
                recentIncidents.map((incident) => (
                  <tr key={incident.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#{incident.id}</td>
                    <td style={{ fontWeight: 600 }}>{incident.title}</td>
                    <td><PriorityBadge priority={incident.priority} /></td>
                    <td><SeverityBadge severity={incident.severity} /></td>
                    <td><StatusBadge status={incident.status} /></td>
                    <td style={{ color: incident.assignedTo ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {incident.assignedTo ? `@${incident.assignedTo.username}` : 'Unassigned'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(incident.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onNavigateToIncident(incident.id)}
                      >
                        <span>Details</span>
                        <ArrowRight size={14} />
                      </button>
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
