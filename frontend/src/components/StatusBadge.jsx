import React from 'react';

export function StatusBadge({ status }) {
  if (!status) return null;
  const normalized = status.toUpperCase();

  const getStyle = () => {
    switch (normalized) {
      case 'OPEN':
        return 'badge-open';
      case 'ASSIGNED':
        return 'badge-assigned';
      case 'IN_PROGRESS':
        return 'badge-in_progress';
      case 'RESOLVED':
        return 'badge-resolved';
      case 'CLOSED':
        return 'badge-closed';
      case 'REOPENED':
        return 'badge-reopened';
      default:
        return 'badge-open';
    }
  };

  return (
    <span className={`badge ${getStyle()}`}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {normalized.replace('_', ' ')}
    </span>
  );
}
