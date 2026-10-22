import React, { useState, useEffect } from 'react';
import { incidentApi } from '../api/incidentApi';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { AssignModal } from '../components/AssignModal';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  UserCheck, 
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  Clock,
  Layers
} from 'lucide-react';

export function IncidentsPage({ onNavigateToIncident, onOpenCreateModal }) {
  const { user, isAdmin, isSupport } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Quick filter active state (Jira Service Management style)
  const [activeQuickFilter, setActiveQuickFilter] = useState('ALL');

  // Assign modal state
  const [assignIncidentId, setAssignIncidentId] = useState(null);

  useEffect(() => {
    loadIncidents();
  }, [page, status, priority, severity, activeQuickFilter]);

  const loadIncidents = async () => {
    try {
      setLoading(true);

      // Build parameters based on quick filters + custom dropdowns
      let queryStatus = status || undefined;
      let queryPriority = priority || undefined;
      let querySeverity = severity || undefined;
      let queryAssignedTo = undefined;

      if (activeQuickFilter === 'MY_TICKETS' && user?.id) {
        queryAssignedTo = user.id;
      } else if (activeQuickFilter === 'SEV_CRITICAL') {
        querySeverity = 'S1';
      } else if (activeQuickFilter === 'NEEDS_TRIAGE') {
        queryStatus = 'OPEN';
      } else if (activeQuickFilter === 'IN_PROGRESS') {
        queryStatus = 'IN_PROGRESS';
      } else if (activeQuickFilter === 'RESOLVED') {
        queryStatus = 'RESOLVED';
      }

      const res = await incidentApi.getIncidents({
        keyword: keyword.trim() || undefined,
        status: queryStatus,
        priority: queryPriority,
        severity: querySeverity,
        assignedTo: queryAssignedTo,
        page,
        size: 12,
        sort: 'createdAt,desc',
      });

      setIncidents(res?.content || []);
      setTotalPages(res?.page?.totalPages ?? res?.totalPages ?? 1);
      setTotalElements(res?.page?.totalElements ?? res?.totalElements ?? 0);
    } catch (err) {
      console.error('Failed to load incidents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    loadIncidents();
  };

  const handleSelectQuickFilter = (filterKey) => {
    setActiveQuickFilter(filterKey);
    setStatus('');
    setPriority('');
    setSeverity('');
    setPage(0);
  };

  const handleResetFilters = () => {
    setActiveQuickFilter('ALL');
    setKeyword('');
    setStatus('');
    setPriority('');
    setSeverity('');
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to permanently delete incident INC-${id}?`)) {
      return;
    }
    try {
      await incidentApi.deleteIncident(id);
      loadIncidents();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="page-wrapper">
      {/* ServiceNow / Jira Command Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.45rem', margin: 0 }}>Incident Workstation</h1>
            <span className="badge" style={{ background: 'var(--surface-subtle)', color: 'var(--text-muted)' }}>
              {totalElements} Total
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem', marginTop: '0.2rem' }}>
            Multi-tier technical issue tracking, dispatch queue, and SLA remediation.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateModal}>
          <Plus size={16} />
          <span>New Incident</span>
        </button>
      </div>

      {/* Jira Quick-Filter Pills */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        marginBottom: '1rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem',
      }}>
        <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginRight: '0.25rem' }}>
          Views:
        </span>
        <button
          className={`filter-pill ${activeQuickFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => handleSelectQuickFilter('ALL')}
        >
          All Incidents
        </button>
        <button
          className={`filter-pill ${activeQuickFilter === 'MY_TICKETS' ? 'active' : ''}`}
          onClick={() => handleSelectQuickFilter('MY_TICKETS')}
        >
          Assigned to Me
        </button>
        <button
          className={`filter-pill ${activeQuickFilter === 'SEV_CRITICAL' ? 'active' : ''}`}
          onClick={() => handleSelectQuickFilter('SEV_CRITICAL')}
        >
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ff7b72', marginRight: 4 }} />
          Critical Outages (S1)
        </button>
        <button
          className={`filter-pill ${activeQuickFilter === 'NEEDS_TRIAGE' ? 'active' : ''}`}
          onClick={() => handleSelectQuickFilter('NEEDS_TRIAGE')}
        >
          Needs Triage (Open)
        </button>
        <button
          className={`filter-pill ${activeQuickFilter === 'IN_PROGRESS' ? 'active' : ''}`}
          onClick={() => handleSelectQuickFilter('IN_PROGRESS')}
        >
          In Progress
        </button>
        <button
          className={`filter-pill ${activeQuickFilter === 'RESOLVED' ? 'active' : ''}`}
          onClick={() => handleSelectQuickFilter('RESOLVED')}
        >
          Resolved
        </button>
      </div>

      {/* Structured Filter and Search Bar */}
      <div className="enterprise-panel" style={{ marginBottom: '1.25rem', padding: '0.85rem 1rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 260px' }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-dim)' }} />
            <input
              type="text"
              placeholder="Search by title, description, or keyword..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.3rem' }}
            />
          </div>

          <div style={{ flex: '0 1 135px' }}>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setActiveQuickFilter('CUSTOM'); setPage(0); }}
              style={{ width: '100%' }}
            >
              <option value="">Status: All</option>
              <option value="OPEN">OPEN</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="REOPENED">REOPENED</option>
            </select>
          </div>

          <div style={{ flex: '0 1 135px' }}>
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setActiveQuickFilter('CUSTOM'); setPage(0); }}
              style={{ width: '100%' }}
            >
              <option value="">Priority: All</option>
              <option value="CRITICAL">P1 - CRITICAL</option>
              <option value="HIGH">P2 - HIGH</option>
              <option value="MEDIUM">P3 - MEDIUM</option>
              <option value="LOW">P4 - LOW</option>
            </select>
          </div>

          <div style={{ flex: '0 1 135px' }}>
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setActiveQuickFilter('CUSTOM'); setPage(0); }}
              style={{ width: '100%' }}
            >
              <option value="">Severity: All</option>
              <option value="S1">S1 — Blocker</option>
              <option value="S2">S2 — Major</option>
              <option value="S3">S3 — Moderate</option>
              <option value="S4">S4 — Minor</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Filter size={14} />
            <span>Apply</span>
          </button>

          {(keyword || status || priority || severity || activeQuickFilter !== 'ALL') && (
            <button type="button" className="btn btn-secondary" onClick={handleResetFilters} title="Reset all search filters">
              <RefreshCw size={14} />
              <span>Reset</span>
            </button>
          )}
        </form>
      </div>

      {/* High Density Enterprise Incidents Data Grid */}
      <div className="enterprise-panel" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '95px' }}>Key</th>
                <th>Incident Summary</th>
                <th style={{ width: '90px' }}>Severity</th>
                <th style={{ width: '110px' }}>Priority</th>
                <th style={{ width: '120px' }}>Status</th>
                <th style={{ width: '130px' }}>Assignee</th>
                <th style={{ width: '120px' }}>Created</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                    Fetching incident records from operational cluster...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                    No incident records matched the specified query filters.
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>
                      <span className="ticket-key">INC-{incident.id}</span>
                    </td>
                    <td>
                      <div
                        style={{ fontWeight: 600, cursor: 'pointer', color: 'var(--text-main)', fontSize: '0.88rem' }}
                        onClick={() => onNavigateToIncident(incident.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#58a6ff')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
                      >
                        {incident.title}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '0.2rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span>Reporter: @{incident.createdBy?.username || 'system'}</span>
                        {incident.updatedAt && (
                          <span>• Updated: {new Date(incident.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </td>
                    <td><SeverityBadge severity={incident.severity} /></td>
                    <td><PriorityBadge priority={incident.priority} /></td>
                    <td><StatusBadge status={incident.status} /></td>
                    <td>
                      {incident.assignedTo ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}>
                          <span style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: 'rgba(56, 139, 253, 0.2)',
                            color: '#58a6ff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 700
                          }}>
                            {incident.assignedTo.username.slice(0, 1).toUpperCase()}
                          </span>
                          <span>@{incident.assignedTo.username}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onNavigateToIncident(incident.id)}
                          title="Open Workstation"
                        >
                          <ArrowRight size={13} />
                        </button>

                        {(isAdmin || isSupport) && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setAssignIncidentId(incident.id)}
                            title="Assign to Engineer"
                          >
                            <UserCheck size={13} />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(incident.id)}
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ServiceNow High Density Pagination Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          background: 'var(--surface-sidebar)'
        }}>
          <div>
            Showing <strong>{incidents.length > 0 ? page * 12 + 1 : 0}</strong> - <strong>{Math.min((page + 1) * 12, totalElements)}</strong> of <strong>{totalElements}</strong> incidents
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ marginRight: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              Page {page + 1} / {totalPages || 1}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 0 || loading}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={14} />
              <span>Prev</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage(page + 1)}
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <AssignModal
        isOpen={!!assignIncidentId}
        incidentId={assignIncidentId}
        onClose={() => setAssignIncidentId(null)}
        onAssigned={loadIncidents}
      />
    </div>
  );
}
