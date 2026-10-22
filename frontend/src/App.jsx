import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { Sidebar } from './components/Sidebar';
import { IncidentModal } from './components/IncidentModal';

export function App() {
  const { isAuthenticated, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedIncidentId, setSelectedIncidentId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-muted)' }}>
        Loading IncidentSphere...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const navigateToIncident = (id) => {
    setSelectedIncidentId(id);
    setCurrentView('incident-detail');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardPage
            onNavigateToIncident={navigateToIncident}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onNavigateToUsers={() => setCurrentView('users')}
          />
        );
      case 'incidents':
        return (
          <IncidentsPage
            onNavigateToIncident={navigateToIncident}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        );
      case 'incident-detail':
        return (
          <IncidentDetailPage
            incidentId={selectedIncidentId}
            onBack={() => setCurrentView('incidents')}
          />
        );
      case 'users':
        return <UserManagementPage />;
      default:
        return (
          <DashboardPage
            onNavigateToIncident={navigateToIncident}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {renderContent()}
      </main>

      <IncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          // If on incidents or dashboard, re-render
          if (currentView === 'incidents' || currentView === 'dashboard') {
            setCurrentView(currentView);
          }
        }}
      />
    </div>
  );
}
