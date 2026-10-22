import React from 'react';
import { ChevronUp, ChevronsUp, Minus, ArrowDown } from 'lucide-react';

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  const p = priority.toUpperCase();

  const getDetails = () => {
    switch (p) {
      case 'CRITICAL':
        return { style: 'badge-critical', icon: <ChevronsUp size={12} color="currentColor" /> };
      case 'HIGH':
        return { style: 'badge-high', icon: <ChevronUp size={12} color="currentColor" /> };
      case 'MEDIUM':
        return { style: 'badge-medium', icon: <Minus size={12} color="currentColor" /> };
      case 'LOW':
        return { style: 'badge-low', icon: <ArrowDown size={12} color="currentColor" /> };
      default:
        return { style: 'badge-low', icon: <Minus size={12} color="currentColor" /> };
    }
  };

  const { style, icon } = getDetails();

  return (
    <span className={`badge ${style}`} style={{ whiteSpace: 'nowrap' }}>
      {icon}
      <span>{p}</span>
    </span>
  );
}
