import React from 'react';
import { AlertCircle, ChevronUp, ChevronsUp, Minus, ArrowDown } from 'lucide-react';

export function PriorityBadge({ priority }) {
  if (!priority) return null;
  const p = priority.toUpperCase();

  const getDetails = () => {
    switch (p) {
      case 'CRITICAL':
        return { style: 'badge-critical', icon: <ChevronsUp size={12} color="#ff7b72" /> };
      case 'HIGH':
        return { style: 'badge-high', icon: <ChevronUp size={12} color="#ffa657" /> };
      case 'MEDIUM':
        return { style: 'badge-medium', icon: <Minus size={12} color="#e3b341" /> };
      case 'LOW':
        return { style: 'badge-low', icon: <ArrowDown size={12} color="#79c0ff" /> };
      default:
        return { style: 'badge-low', icon: <Minus size={12} /> };
    }
  };

  const { style, icon } = getDetails();

  return (
    <span className={`badge ${style}`}>
      {icon}
      <span>{p}</span>
    </span>
  );
}
