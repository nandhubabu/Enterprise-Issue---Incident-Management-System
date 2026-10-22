import React, { useState, useEffect } from 'react';
import { userApi } from '../api/userApi';
import { incidentApi } from '../api/incidentApi';
import { X, UserCheck, AlertCircle } from 'lucide-react';

export function AssignModal({ isOpen, onClose, incidentId, onAssigned }) {
  const [developers, setDevelopers] = useState([]);
  const [selectedDeveloperId, setSelectedDeveloperId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadDevelopers();
    }
  }, [isOpen]);

  const loadDevelopers = async () => {
    try {
      const list = await userApi.getDevelopers();
      setDevelopers(list);
      if (list.length > 0) {
        setSelectedDeveloperId(list[0].id);
      }
    } catch (err) {
      setError('Failed to load developer list: ' + err.message);
    }
  };

  if (!isOpen) return null;

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedDeveloperId) return;

    try {
      setLoading(true);
      setError('');
      await incidentApi.assignIncident(incidentId, Number(selectedDeveloperId));
      onAssigned();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={20} color="var(--jira-blue)" />
            <h3 style={{ color: 'var(--text-heading)', fontSize: '1.25rem' }}>Assign Incident INC-{incidentId}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', background: 'var(--pagerduty-red-subtle)', border: '1px solid var(--pagerduty-red-border)', color: 'var(--pagerduty-red)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
              Select Assigned Developer
            </label>
            <select
              value={selectedDeveloperId}
              onChange={(e) => setSelectedDeveloperId(e.target.value)}
              style={{ width: '100%' }}
              required
            >
              {developers.length === 0 ? (
                <option value="">No developers found</option>
              ) : (
                developers.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.firstName} {dev.lastName} (@{dev.username} — {dev.email})
                  </option>
                ))
              )}
            </select>
          </div>

          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Note: Assigning this incident will automatically transition its status from <strong>OPEN</strong> to <strong>ASSIGNED</strong> if currently open.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || developers.length === 0}>
              {loading ? 'Assigning...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
