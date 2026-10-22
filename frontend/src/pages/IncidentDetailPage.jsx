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
  AlertCircle,
  Shield,
  Zap,
  Activity,
  Flame,
  FileText
} from 'lucide-react';

const WORKFLOW_STAGES = [
  { id: 'OPEN', label: '1. Open / Triage' },
  { id: 'ASSIGNED', label: '2. Assigned' },
  { id: 'IN_PROGRESS', label: '3. In Progress' },
  { id: 'RESOLVED', label: '4. Resolved' },
  { id: 'CLOSED', label: '5. Closed' },
];

export function IncidentDetailPage({ incidentId, onBack }) {
  const { user, isAdmin, isSupport } = useAuth();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'audit'
  
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
    if (!window.confirm('Delete this work note?')) return;
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
        <p style={{ color: 'var(--text-muted)' }}>Fetching incident record INC-{incidentId}...</p>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="page-wrapper">
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: '1.25rem' }}>
          <ArrowLeft size={15} />
          <span>Back to Triage Queue</span>
        </button>
        <div style={{ padding: '1.25rem', background: 'var(--pagerduty-red-subtle)', border: '1px solid var(--pagerduty-red-border)', color: 'var(--pagerduty-red)', borderRadius: 'var(--radius-sm)' }}>
          {error || 'Incident record could not be found'}
        </div>
      </div>
    );
  }

  // Current stage index for PagerDuty lifecycle rail
  const currentStageIndex = WORKFLOW_STAGES.findIndex(s => s.id === incident.status);

  return (
    <div className="page-wrapper">
      {/* ServiceNow & Jira Command Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>
            <ArrowLeft size={14} />
            <span>Triage Queue</span>
          </button>
          <span className="ticket-key" style={{ fontSize: '0.9rem', padding: '0.2rem 0.55rem' }}>
            INC-{incident.id}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            ServiceNow Ref: sys_id_{incident.id * 104729}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {(isAdmin || isSupport) && (
            <button className="btn btn-secondary btn-sm" onClick={() => setIsAssignModalOpen(true)}>
              <UserCheck size={14} />
              <span>{incident.assignedTo ? 'Reassign Engineer' : 'Assign Engineer'}</span>
            </button>
          )}

          {/* Quick status transition action buttons */}
          {incident.status === 'ASSIGNED' && (
            <button className="btn btn-primary btn-sm" onClick={() => handleStatusTransition('IN_PROGRESS')}>
              <Clock size={14} />
              <span>Begin Investigation</span>
            </button>
          )}
          {incident.status === 'IN_PROGRESS' && (
            <button
              className="btn btn-sm"
              style={{ background: 'var(--status-resolved)', color: '#fff' }}
              onClick={() => handleStatusTransition('RESOLVED')}
            >
              <CheckCircle size={14} />
              <span>Mark Resolved</span>
            </button>
          )}
          {incident.status === 'RESOLVED' && (
            <button className="btn btn-secondary btn-sm" onClick={() => handleStatusTransition('CLOSED')}>
              <CheckCircle size={14} />
              <span>Confirm & Close</span>
            </button>
          )}
          {incident.status === 'CLOSED' && (
            <button className="btn btn-secondary btn-sm" onClick={() => handleStatusTransition('REOPENED')}>
              <RotateCcw size={14} />
              <span>Reopen Outage</span>
            </button>
          )}
          {incident.status === 'REOPENED' && (
            <button className="btn btn-primary btn-sm" onClick={() => handleStatusTransition('IN_PROGRESS')}>
              <Clock size={14} />
              <span>Resume Work</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: 'var(--pagerduty-red-subtle)', border: '1px solid var(--pagerduty-red-border)', color: 'var(--pagerduty-red)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.84rem' }}>
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      {/* PagerDuty Incident Lifecycle Stepper Rail (Atlassian Clean Light Format) */}
      <div className="enterprise-panel" style={{ padding: '0.9rem 1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
          <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em' }}>
            Incident Lifecycle Status (PagerDuty Stepper)
          </span>
          {incident.severity === 'S1' && (
            <span style={{ fontSize: '0.74rem', color: 'var(--pagerduty-red)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Flame size={13} />
              MAJOR OUTAGE SEV-1
            </span>
          )}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${WORKFLOW_STAGES.length}, 1fr)`,
          gap: '0.5rem',
          position: 'relative'
        }}>
          {WORKFLOW_STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx;
            const isCurrent = currentStageIndex === idx;

            return (
              <div
                key={stage.id}
                style={{
                  background: isCurrent ? 'var(--surface-active)' : '#fafbfc',
                  border: isCurrent ? '1px solid #b3d4ff' : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.55rem 0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: isCompleted ? 'var(--status-resolved)' : isCurrent ? 'var(--jira-blue)' : '#ebecf0',
                  color: isCompleted || isCurrent ? '#fff' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--jira-blue)' : isCompleted ? 'var(--text-muted)' : 'var(--text-dim)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Layout: Workstation Main & Context Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(280px, 1fr)', gap: '1.25rem' }}>
        
        {/* Left Column: Incident Description & Tabbed Notes/Audit */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Main Record Header & Description */}
          <div className="enterprise-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.9rem' }}>
              <div>
                <h1 style={{ fontSize: '1.45rem', color: 'var(--text-heading)', margin: '0 0 0.35rem 0' }}>
                  {incident.title}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Reported by <strong>@{incident.createdBy?.username}</strong></span>
                  <span>•</span>
                  <span>Opened {new Date(incident.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                <SeverityBadge severity={incident.severity} />
                <PriorityBadge priority={incident.priority} />
                <StatusBadge status={incident.status} />
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                Technical Description & Diagnostics
              </div>
              <div style={{
                background: '#fafbfc',
                padding: '1rem 1.15rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                fontSize: '0.88rem',
                lineHeight: 1.6,
                color: 'var(--text-main)',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit'
              }}>
                {incident.description}
              </div>
            </div>
          </div>

          {/* Tabbed Console: ServiceNow Work Notes vs Audit Trail */}
          <div className="enterprise-panel" style={{ padding: 0 }}>
            {/* Tab Header */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-default)', background: '#fafbfc' }}>
              <button
                onClick={() => setActiveTab('notes')}
                style={{
                  padding: '0.8rem 1.25rem',
                  fontSize: '0.84rem',
                  fontWeight: activeTab === 'notes' ? 700 : 500,
                  color: activeTab === 'notes' ? 'var(--jira-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'notes' ? '2px solid var(--jira-blue)' : '2px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <MessageSquare size={14} />
                <span>Work Notes & Discussion ({incident.comments?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                style={{
                  padding: '0.8rem 1.25rem',
                  fontSize: '0.84rem',
                  fontWeight: activeTab === 'audit' ? 700 : 500,
                  color: activeTab === 'audit' ? 'var(--jira-blue)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'audit' ? '2px solid var(--jira-blue)' : '2px solid transparent',
                  background: 'none',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <History size={14} />
                <span>Audit History & Lifecycle ({incident.histories?.length || 0})</span>
              </button>
            </div>

            {/* Tab Body */}
            <div style={{ padding: '1.35rem' }}>
              {activeTab === 'notes' ? (
                <div>
                  {/* New Work Note Form */}
                  <form onSubmit={handlePostComment} style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                      Add Engineering Work Note
                    </div>
                    <textarea
                      rows={3}
                      required
                      placeholder="Add investigation findings, root cause analysis, patch links, or customer update..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      style={{ width: '100%', marginBottom: '0.5rem', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={commentLoading}>
                        <Send size={13} />
                        <span>{commentLoading ? 'Recording Note...' : 'Save Work Note'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Comment Thread */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {incident.comments?.length === 0 ? (
                      <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                        No work notes logged yet. Be the first engineer to record telemetry or updates.
                      </div>
                    ) : (
                      incident.comments.map((comment) => {
                        const canDelete = isAdmin || (user && user.username === comment.author?.username);
                        return (
                          <div
                            key={comment.id}
                            style={{
                              padding: '0.9rem 1.15rem',
                              background: '#fafbfc',
                              border: '1px solid var(--border-default)',
                              borderRadius: 'var(--radius-sm)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  background: '#deebff',
                                  color: 'var(--jira-blue)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.74rem',
                                  fontWeight: 700
                                }}>
                                  {comment.author?.username?.slice(0, 1).toUpperCase()}
                                </span>
                                <strong style={{ fontSize: '0.86rem', color: 'var(--text-heading)' }}>
                                  {comment.author?.firstName} {comment.author?.lastName}
                                </strong>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                                  @{comment.author?.username}
                                </span>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                                  {new Date(comment.createdAt).toLocaleString()}
                                </span>
                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '2px' }}
                                    title="Delete Note"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p style={{ fontSize: '0.86rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.5 }}>
                              {comment.content}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ) : (
                /* Audit Trail */
                <div className="timeline">
                  {incident.histories?.length === 0 ? (
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>No audit changes recorded for this ticket.</p>
                  ) : (
                    incident.histories.map((hist) => (
                      <div key={hist.id} className="timeline-item">
                        <div className="timeline-bullet">
                          <Activity size={12} color="var(--jira-blue)" />
                        </div>
                        <div className="timeline-content">
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginBottom: '0.15rem' }}>
                            {new Date(hist.changedAt).toLocaleString()}
                          </div>
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-heading)' }}>
                            <strong>@{hist.changedBy?.username}</strong> updated <strong>{hist.fieldName}</strong>
                          </div>
                          {hist.oldValue ? (
                            <div style={{ fontSize: '0.78rem', marginTop: '0.2rem', fontFamily: 'var(--font-mono)' }}>
                              <span style={{ color: 'var(--pagerduty-red)' }}>{hist.oldValue}</span> ➔ <span style={{ color: 'var(--status-resolved)' }}>{hist.newValue}</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.78rem', marginTop: '0.2rem', color: 'var(--status-resolved)', fontFamily: 'var(--font-mono)' }}>
                              Initial state: {hist.newValue}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: ServiceNow Incident Metadata & Ownership Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Ownership & Assignment */}
          <div className="enterprise-panel">
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: '0.85rem' }}>
              Assignment & Ownership
            </h4>
            
            <div style={{ marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                Assigned Engineer
              </span>
              {incident.assignedTo ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#deebff',
                      color: 'var(--jira-blue)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {incident.assignedTo.username.slice(0, 1).toUpperCase()}
                    </span>
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                        {incident.assignedTo.firstName} {incident.assignedTo.lastName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        @{incident.assignedTo.username} ({incident.assignedTo.email})
                      </div>
                    </div>
                  </div>
                  {(isAdmin || isSupport) && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsAssignModalOpen(true)}
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.45rem' }}
                    >
                      Reassign
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--jira-blue)' }}>Unassigned (In Dispatch Queue)</span>
                  {(isAdmin || isSupport) && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setIsAssignModalOpen(true)}
                      style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                    >
                      Assign Now
                    </button>
                  )}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>
                Caller / Reporter
              </span>
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                {incident.createdBy?.firstName} {incident.createdBy?.lastName}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                @{incident.createdBy?.username} ({incident.createdBy?.email})
              </div>
            </div>
          </div>

          {/* SLA & MTTR Telemetry Card */}
          <div className="enterprise-panel">
            <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', letterSpacing: '0.06em', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} color="var(--jira-blue)" />
              SLA & Response Telemetry
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Response Target</span>
                <span style={{ color: 'var(--status-resolved)', fontWeight: 600 }}>MET (12m)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Created At</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                  {new Date(incident.createdAt).toLocaleDateString()} {new Date(incident.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {incident.resolvedAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Resolved At</span>
                  <span style={{ color: 'var(--status-resolved)', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                    {new Date(incident.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {incident.closedAt && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Closed At</span>
                  <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.76rem' }}>
                    {new Date(incident.closedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
            </div>
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
