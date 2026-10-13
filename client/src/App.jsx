// client/src/App.jsx
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WsProvider } from './context/WsContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { AuthorDashboard } from './components/AuthorDashboard/AuthorDashboard';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { ApiDocsModal } from './components/ApiDocsModal';
import { Sparkles } from 'lucide-react';

function MainApp() {
  const { user, loading, switchPersona } = useAuth();
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState('overview');
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedBookForTicket, setSelectedBookForTicket] = useState('GENERAL');

  const isAdmin = user?.role === 'admin';

  // Automatically reset default view when toggling between admin and author
  useEffect(() => {
    if (isAdmin) {
      setCurrentView('workbench');
    } else {
      setCurrentView('overview');
    }
  }, [isAdmin]);

  const handleTogglePortal = () => {
    if (isAdmin) {
      switchPersona('AUTH001'); // Switch to first author Priya Sharma
    } else {
      switchPersona('admin'); // Switch to Admin Karan Verma
    }
  };

  const handleOpenSubmitTicket = (bookId = 'GENERAL') => {
    setSelectedBookForTicket(bookId);
    setIsSubmitModalOpen(true);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)' }}>
        <div style={{ color: 'var(--emerald-700)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={24} className="animate-spin" />
          <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>Loading BookLeaf Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-canvas)' }}>
      {/* 1. Left Collapsible Modern Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onOpenSubmitTicket={() => handleOpenSubmitTicket('GENERAL')}
        onOpenApiDocs={() => setShowApiDocs(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* 2. Main Work Area (TopBar + Content) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        <TopBar
          currentView={currentView}
          onTogglePortal={handleTogglePortal}
        />

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {isAdmin ? (
            <AdminDashboard currentView={currentView} onNavigate={setCurrentView} />
          ) : (
            <AuthorDashboard
              currentView={currentView}
              onNavigate={setCurrentView}
              isSubmitModalOpen={isSubmitModalOpen}
              setIsSubmitModalOpen={setIsSubmitModalOpen}
              selectedBookForTicket={selectedBookForTicket}
              setSelectedBookForTicket={setSelectedBookForTicket}
            />
          )}
        </main>
      </div>

      {/* Interactive System Architecture & REST API Docs Modal */}
      <ApiDocsModal
        isOpen={showApiDocs}
        onClose={() => setShowApiDocs(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WsProvider>
        <MainApp />
      </WsProvider>
    </AuthProvider>
  );
}
