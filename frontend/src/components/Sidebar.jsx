import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  AlertCircle, 
  Users, 
  LogOut, 
  Flame, 
  ExternalLink 
} from 'lucide-react';

export function Sidebar({ currentView, setCurrentView }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Flame size={20} />
        </div>
        <span className="logo-text">IncidentSphere</span>
      </div>

      <nav className="sidebar-menu">
        <button
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          className={`nav-item ${currentView === 'incidents' || currentView === 'incident-detail' ? 'active' : ''}`}
          onClick={() => setCurrentView('incidents')}
        >
          <AlertCircle size={18} />
          <span>Incidents</span>
        </button>

        {isAdmin && (
          <button
            className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
            onClick={() => setCurrentView('users')}
          >
            <Users size={18} />
            <span>User Management</span>
          </button>
        )}

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <a
            href="/swagger-ui.html"
            target="_blank"
            rel="noreferrer"
            className="nav-item"
            style={{ fontSize: '0.85rem' }}
          >
            <ExternalLink size={16} />
            <span>Swagger OpenAPI Docs</span>
          </a>
        </div>
      </nav>

      {user && (
        <div className="user-profile-badge">
          <div className="user-info">
            <span className="user-name">{user.firstName} {user.lastName}</span>
            <span className="user-role">
              {user.roles && user.roles.join(', ')}
            </span>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            style={{ background: 'transparent', color: 'var(--text-muted)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
}
