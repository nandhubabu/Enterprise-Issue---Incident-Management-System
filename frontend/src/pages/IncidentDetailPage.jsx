import React, { useState, useEffect } from 'react';
import { incidentApi } from '../api/incidentApi';
import { commentApi } from '../api/commentApi';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { SeverityBadge } from '../components/SeverityBadge';
import { AssignModal } from '../components/AssignModal';
import { 
  ArrowLeft, 
  MessageSquare, 
  History, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  RotateCcw, 
  Trash2, 
  Send,
  AlertCircle
} from 'lucide-react';

export function IncidentDetailPage({ incidentId, onBack }) {
  const { user, isAdmin, isSupport } = useAuth();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Comment input
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Assign modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const loadIncident = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await incidentApi.getIncidentById(incidentId);
      setIncident(data);
    } catch (err) {
      setError(err.message || 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusTransition = async (targetStatus) => {
    try {
      setError('');
      await incidentApi.updateStatus(incidentId, targetStatus);
      loadIncident();
    } catch (err) {
      setError(err.message || 'Status transition rejected');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      await commentApi.addComment(incidentId, newComment);
      setNewComment('');
      loadIncident();
    } catch (err) {
      alert('Failed to post comment: ' + err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentApi.deleteComment(commentId);
      loadIncident();
    } catch (err) {
      alert('Failed to delete comment: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading incident #{incidentId}...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="page-wrapper">
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to Incidents</span>
        </button>
        <div style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', borderRadius: 'var(--radius-md)' }}>
          {error || 'Incident not found'}
        </div>
      </div>
    );
  }

  // Permitted next status actions based on state machine
  const renderWorkflowActions = () => {
    const s = incident.status;
    switch (s) {
      case 'OPEN':
        return (isAdmin || isSupport) ? (
          <button className="btn btn-primary" onClick={() => setIsAssignModalOpen(true)}>
            <UserCheck size={16} />
            <span>Assign to Developer</span>
          </button>
        ) : null;
      case 'ASSIGNED':
        return (
          <button className="btn btn-primary" onClick={() => handleStatusTransition('IN_PROGRESS')}>
            <Clock size={16} />
            <span>Begin Investigation (IN_PROGRESS)</span>
          </button>
        );
      case 'IN_PROGRESS':
        return (
          <button
            className="btn btn-primary"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
            onClick={() => handleStatusTransition('RESOLVED')}
          >
            <CheckCircle size={16} />
            <span>Mark Resolved (RESOLVED)</span>
          </button>
        );
      case 'RESOLVED':
        return (
          <button
            className="btn btn-secondary"
            onClick={() => handleStatusTransition('CLOSED')}
          >
            <CheckCircle size={16} />
            <span>Confirm & Close (CLOSED)</span>
          </button>
        );
      case 'CLOSED':
        return (
          <button
            className="btn btn-secondary"
            onClick={() => handleStatusTransition('REOPENED')}
          >
            <RotateCcw size={16} />
            <span>Reopen Incident</span>
          </button>
        );
      case 'REOPENED':
        return (
          <button className="btn btn-primary" onClick={() => handleStatusTransition('IN_PROGRESS')}>
            <Clock size={16} />
            <span>Resume Work (IN_PROGRESS)</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-wrapper">
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Incidents</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {(isAdmin || isSupport) && (
            <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(true)}>
              <UserCheck size={16} />
              <span>{incident.assignedTo ? 'Reassign' : 'Assign'}</span>
            </button>
          )}
          {renderWorkflowActions()}
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Incident Card */}
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              INCIDENT #{incident.id}
            </span>
            <h1 style={{ fontSize: '1.75rem', marginTop: '0.2rem' }}>{incident.title}</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <PriorityBadge priority={incident.priority} />
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>
        </div>

        {/* Metadata Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Reporter</span>
            <strong>{incident.createdBy?.firstName} {incident.createdBy?.lastName}</strong> (@{incident.createdBy?.username})
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Assigned Engineer</span>
            {incident.assignedTo ? (
              <strong>{incident.assignedTo.firstName} {incident.assignedTo.lastName} (@{incident.assignedTo.username})</strong>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>
            )}
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Created At</span>
            {new Date(incident.createdAt).toLocaleString()}
          </div>
          {incident.resolvedAt && (
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Resolved At</span>
              <span style={{ color: '#34d399' }}>{new Date(incident.resolvedAt).toLocaleString()}</span>
            </div>
          )}
          {incident.closedAt && (
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.75rem', textTransform: 'uppercase' }}>Closed At</span>
              {new Date(incident.closedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Technical Description */}
        <div>
          <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Technical Description</h4>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: 'var(--text-primary)' }}>
            {incident.description}
          </p>
        </div>
      </div>

      {/* Two Column Layout: Comments and Audit History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1.5rem' }}>
        {/* Comments Section */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} color="var(--accent-primary)" />
            Collaboration Discussion ({incident.comments?.length || 0})
          </h3>

          {/* New Comment Input */}
          <form onSubmit={handlePostComment} style={{ marginBottom: '1.5rem' }}>
            <textarea
              rows={3}
              required
              placeholder="Add an engineering update, root cause insight, or deployment status..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem', resize: 'vertical' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={commentLoading}>
                <Send size={14} />
                <span>{commentLoading ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {incident.comments?.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
                No collaboration comments yet.
              </p>
            ) : (
              incident.comments.map((comment) => {
                const canDelete = isAdmin || (user && user.username === comment.author?.username);
                return (
                  <div key={comment.id} style={{ padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <strong style={{ fontSize: '0.88rem' }}>{comment.author?.firstName} {comment.author?.lastName}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{comment.author?.username}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{ background: 'transparent', color: 'var(--text-muted)' }}
                            title="Delete Comment"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                      {comment.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Audit Trail Timeline */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={18} color="var(--accent-secondary)" />
            Audit History & Lifecycle Trail
          </h3>

          <div className="timeline">
            {incident.histories?.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No audit events recorded.</p>
            ) : (
              incident.histories.map((hist) => (
                <div key={hist.id} className="timeline-item">
                  <div className="timeline-bullet">
                    <Clock size={14} color="var(--accent-primary)" />
                  </div>
                  <div className="timeline-content">
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                      {new Date(hist.changedAt).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.84rem' }}>
                      <strong>@{hist.changedBy?.username}</strong> modified <strong>{hist.fieldName}</strong>
                    </div>
                    {hist.oldValue ? (
                      <div style={{ fontSize: '0.78rem', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                        <span style={{ color: '#f87171' }}>{hist.oldValue}</span> → <span style={{ color: '#34d399' }}>{hist.newValue}</span>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.78rem', marginTop: '0.2rem', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                        Initial value: {hist.newValue}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <AssignModal
        isOpen={isAssignModalOpen}
        incidentId={incident.id}
        onClose={() => setIsAssignModalOpen(false)}
        onAssigned={loadIncident}
      />
    </div>
  );
}
