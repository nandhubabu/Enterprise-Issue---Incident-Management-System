import React from 'react';

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  const p = priority.toUpperCase();

  const getStyle = () => {
    switch (p) {
      case 'CRITICAL':
        return 'badge-critical';
      case 'HIGH':
        return 'badge-high';
      case 'MEDIUM':
        return 'badge-medium';
      case 'LOW':
        return 'badge-low';
      default:
        return 'badge-low';
    }
  };

  return <span className={`badge ${getStyle()}`}>{p}</span>;
}
