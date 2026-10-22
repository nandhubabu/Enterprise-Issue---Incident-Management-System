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
  PlusCircle, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  UserCheck, 
  Eye,
  RefreshCw
} from 'lucide-react';

export function IncidentsPage({ onNavigateToIncident, onOpenCreateModal }) {
  const { isAdmin, isSupport } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [severity, setSeverity] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Assign modal state
  const [assignIncidentId, setAssignIncidentId] = useState(null);

  useEffect(() => {
    loadIncidents();
  }, [page, status, priority, severity]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const res = await incidentApi.getIncidents({
        keyword: keyword.trim() || undefined,
        status: status || undefined,
        priority: priority || undefined,
        severity: severity || undefined,
        page,
        size: 10,
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

  const handleResetFilters = () => {
    setKeyword('');
    setStatus('');
    setPriority('');
    setSeverity('');
    setPage(0);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to permanently delete incident #${id}?`)) {
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem' }}>Incidents Central</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse, filter, assign, and track technical incidents across your organization.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenCreateModal}>
          <PlusCircle size={18} />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by title or description..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: '100%', paddingLeft: '2.4rem' }}
            />
          </div>

          <div style={{ flex: '0 1 140px' }}>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(0); }}
              style={{ width: '100%' }}
            >
              <option value="">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
              <option value="REOPENED">REOPENED</option>
            </select>
          </div>

          <div style={{ flex: '0 1 140px' }}>
            <select
              value={priority}
              onChange={(e) => { setPriority(e.target.value); setPage(0); }}
              style={{ width: '100%' }}
            >
              <option value="">All Priorities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>

          <div style={{ flex: '0 1 140px' }}>
            <select
              value={severity}
              onChange={(e) => { setSeverity(e.target.value); setPage(0); }}
              style={{ width: '100%' }}
            >
              <option value="">All Severities</option>
              <option value="S1">S1 — Critical</option>
              <option value="S2">S2 — High</option>
              <option value="S3">S3 — Medium</option>
              <option value="S4">S4 — Low</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary">
            <Filter size={16} />
            <span>Search</span>
          </button>

          {(keyword || status || priority || severity) && (
            <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
              <RefreshCw size={15} />
              <span>Reset</span>
            </button>
          )}
        </form>
      </div>

      {/* Incidents Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: '80px' }}>ID</th>
                <th>Title</th>
                <th>Priority</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Created Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    Loading incidents...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No matching incidents found.
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>#{incident.id}</td>
                    <td style={{ fontWeight: 600 }}>
                      <span
                        style={{ cursor: 'pointer', color: 'var(--text-primary)' }}
                        onClick={() => onNavigateToIncident(incident.id)}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-secondary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                      >
                        {incident.title}
                      </span>
                    </td>
                    <td><PriorityBadge priority={incident.priority} /></td>
                    <td><SeverityBadge severity={incident.severity} /></td>
                    <td><StatusBadge status={incident.status} /></td>
                    <td>
                      {incident.assignedTo ? (
                        <span style={{ fontSize: '0.85rem' }}>@{incident.assignedTo.username}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Unassigned</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(incident.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onNavigateToIncident(incident.id)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>

                        {(isAdmin || isSupport) && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setAssignIncidentId(incident.id)}
                            title="Assign to Developer"
                          >
                            <UserCheck size={14} />
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(incident.id)}
                            title="Delete Incident"
                          >
                            <Trash2 size={14} />
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

        {/* Pagination Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>
            Showing page <strong>{page + 1}</strong> of <strong>{totalPages || 1}</strong> ({totalElements} total incidents)
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 0 || loading}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => setPage(page + 1)}
            >
              <span>Next</span>
              <ChevronRight size={16} />
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
