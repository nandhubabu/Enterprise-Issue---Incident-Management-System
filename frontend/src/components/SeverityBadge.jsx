import React from 'react';

export function SeverityBadge({ severity }) {
  if (!severity) return null;
  const s = severity.toUpperCase();

  const getStyle = () => {
    switch (s) {
      case 'S1':
        return 'badge-critical';
      case 'S2':
        return 'badge-high';
      case 'S3':
        return 'badge-medium';
      case 'S4':
        return 'badge-low';
      default:
        return 'badge-low';
    }
  };

  return (
    <span
      className={`badge ${getStyle()}`}
      title={`Severity Level: ${s}`}
      style={{ letterSpacing: '0.06em' }}
    >
      SEV-{s.replace('S', '')}
    </span>
  );
}
