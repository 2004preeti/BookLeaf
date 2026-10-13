// client/src/App.jsx
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WsProvider } from './context/WsContext';
import { Header } from './components/Header';
import { AuthorDashboard } from './components/AuthorDashboard/AuthorDashboard';
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard';
import { ApiDocsModal } from './components/ApiDocsModal';
import { Sparkles } from 'lucide-react';

function MainApp() {
  const { user, loading } = useAuth();
  const [showApiDocs, setShowApiDocs] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-darkest)' }}>
        <div style={{ color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={24} className="animate-spin" />
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading BookLeaf Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-darkest)' }}>
      {/* Top Navigation & Persona Switcher */}
      <Header
        onOpenApiDocs={() => setShowApiDocs(true)}
      />

      {/* Main Portal View based on active role */}
      <main style={{ flex: 1 }}>
        {user?.role === 'admin' ? (
          <AdminDashboard />
        ) : (
          <AuthorDashboard />
        )}
      </main>

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
