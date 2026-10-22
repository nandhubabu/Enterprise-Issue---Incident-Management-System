import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, 
  Layers, 
  Users, 
  LogOut, 
  ShieldCheck, 
  FileCode2, 
  Server
} from 'lucide-react';

export function Sidebar({ currentView, setCurrentView }) {
  const { user, logout, isAdmin } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="logo-icon">
          <span>IS</span>
        </div>
        <div>
          <div className="logo-text">IncidentSphere</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
            COMMAND CONSOLE
          </div>
        </div>
      </div>

      <div className="sidebar-section-title">Incident Operations</div>
      <nav className="sidebar-menu">
        <button
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <Activity size={16} />
          <span>Operations Center</span>
        </button>

        <button
          className={`nav-item ${currentView === 'incidents' || currentView === 'incident-detail' ? 'active' : ''}`}
          onClick={() => setCurrentView('incidents')}
        >
          <Layers size={16} />
          <span>Incident Queue</span>
        </button>

        {isAdmin && (
          <>
            <div className="sidebar-section-title">Platform Governance</div>
            <button
              className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
              onClick={() => setCurrentView('users')}
            >
              <Users size={16} />
              <span>User Directory & RBAC</span>
            </button>
          </>
        )}

        <div className="sidebar-section-title">Telemetry & Contract</div>
        <a
          href="/swagger-ui.html"
          target="_blank"
          rel="noreferrer"
          className="nav-item"
        >
          <FileCode2 size={16} />
          <span>OpenAPI / Swagger</span>
        </a>

        <a
          href="/actuator/health"
          target="_blank"
          rel="noreferrer"
          className="nav-item"
        >
          <Server size={16} />
          <span>Actuator Health</span>
        </a>
      </nav>

      {/* User Session Footer */}
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
            style={{ color: 'var(--text-dim)', padding: '0.2rem' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--pagerduty-red)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
