// client/src/components/TopBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWs } from '../context/WsContext';
import {
  Shield,
  User,
  Sparkles,
  ArrowRightLeft,
  BookOpen,
  Layers,
  Radio,
  Search,
  ChevronDown,
  Bell,
  Code2,
  ExternalLink,
  Check,
  Building2,
  BookCheck,
  TrendingUp,
  Inbox
} from 'lucide-react';

export function TopBar({ currentView, onTogglePortal, onOpenApiDocs }) {
  const { user, personas, switchPersona } = useAuth();
  const { isConnected } = useWs();
  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowPersonaDropdown(false);
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getViewTitle = (view) => {
    switch (view) {
      case 'overview': return 'Financial Overview & Royalties';
      case 'books': return 'My Published Books & Catalog';
      case 'tickets': return 'Author Support & Communications';
      case 'queue': return 'Ticket Triage & Incoming Queue';
      case 'workbench': return 'Operations Response Studio';
      case 'metrics': return 'Operational Health & SLA Metrics';
      default: return 'Portal Workspace';
    }
  };

  return (
    <header
      style={{
        height: '70px',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)'
      }}
      ref={dropdownRef}
    >
      {/* 1. LEFT: Breadcrumb & Contextual Portal Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '8px',
            background: isAdmin ? 'var(--blue-50)' : 'var(--emerald-50)',
            border: `1px solid ${isAdmin ? 'rgba(37, 99, 235, 0.2)' : 'rgba(4, 120, 87, 0.2)'}`,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {isAdmin ? (
            <Shield size={14} color="var(--blue-700)" />
          ) : (
            <BookCheck size={14} color="var(--emerald-700)" />
          )}
          <span
            style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: isAdmin ? 'var(--blue-700)' : 'var(--emerald-800)'
            }}
          >
            {isAdmin ? 'BookLeaf Operations' : 'Author Workspace'}
          </span>
        </div>

        <span style={{ color: 'var(--border-medium)', fontSize: '1.2rem', fontWeight: 300 }}>/</span>

        <div>
          <h1
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2
            }}
          >
            {getViewTitle(currentView)}
          </h1>
        </div>
      </div>

      {/* 2. MIDDLE: Interactive Quick Reviewer Persona Switcher */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-canvas)',
          padding: '5px 8px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.02)'
        }}
      >
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-dim)',
            padding: '0 6px'
          }}
        >
          Test Persona:
        </span>

        {/* Priya Sharma (AUTH001) */}
        <button
          onClick={() => switchPersona('AUTH001')}
          className={`persona-pill ${user?.author_id === 'AUTH001' ? 'active' : ''}`}
          title="Priya Sharma (AUTH001): 2 books, pending payout"
        >
          <User size={12} />
          <span>Priya S.</span>
        </button>

        {/* Sneha Kulkarni (AUTH007 - In Production Title) */}
        <button
          onClick={() => switchPersona('AUTH007')}
          className={`persona-pill ${user?.author_id === 'AUTH007' ? 'active' : ''}`}
          title="Sneha Kulkarni (AUTH007): 3 books, including 1 in Cover Design"
        >
          <User size={12} />
          <span>Sneha K.</span>
          <span style={{ fontSize: '0.62rem', background: 'var(--purple-50)', color: 'var(--purple-700)', padding: '1px 4px', borderRadius: '4px', border: '1px solid rgba(147, 51, 234, 0.2)' }}>
            Pipeline
          </span>
        </button>

        {/* Rohit Kapoor (AUTH002 - Amazon US/UK) */}
        <button
          onClick={() => switchPersona('AUTH002')}
          className={`persona-pill ${user?.author_id === 'AUTH002' ? 'active' : ''}`}
          title="Rohit Kapoor (AUTH002): 2 books, global Amazon distribution"
        >
          <User size={12} />
          <span>Rohit K.</span>
        </button>

        {/* Admin Lead (Karan Verma) */}
        <button
          onClick={() => switchPersona('admin')}
          className={`persona-pill ${isAdmin ? 'active-admin' : ''}`}
          title="Karan Verma: Admin Operations Lead"
        >
          <Shield size={12} />
          <span>Karan V. (Admin)</span>
        </button>

        {/* Dropdown for All 10 Authors */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '9999px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}
            title="Browse all 10 seeded authors in sample dataset"
          >
            <span>All Authors</span>
            <ChevronDown size={12} />
          </button>

          {showPersonaDropdown && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '280px',
                background: '#ffffff',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 100,
                maxHeight: '340px',
                overflowY: 'auto'
              }}
            >
              <div style={{ padding: '6px 8px', fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-subtle)' }}>
                Seeded Authors Catalog (10 Total)
              </div>
              {personas.filter(p => p.role !== 'admin').map(p => (
                <button
                  key={p.author_id}
                  onClick={() => {
                    switchPersona(p.author_id);
                    setShowPersonaDropdown(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    textAlign: 'left',
                    background: user?.author_id === p.author_id ? 'var(--emerald-50)' : 'transparent',
                    border: user?.author_id === p.author_id ? '1px solid rgba(4, 120, 87, 0.2)' : '1px solid transparent'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.author_id} • {p.city}</div>
                  </div>
                  {user?.author_id === p.author_id && <Check size={14} color="var(--emerald-700)" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. RIGHT: Live Gateway Status, Portal Switcher & Active User Profile Capsule */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Real-time Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '9999px',
            background: isConnected ? 'rgba(4, 120, 87, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${isConnected ? 'rgba(4, 120, 87, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}
          title={isConnected ? 'Real-time WebSocket Gateway Connected' : 'WebSocket Reconnecting...'}
        >
          <Radio
            size={12}
            color={isConnected ? '#059669' : '#ef4444'}
            className={isConnected ? 'pulse-green' : ''}
          />
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: isConnected ? 'var(--emerald-700)' : '#dc2626'
            }}
          >
            {isConnected ? 'Real-Time Sync' : 'Offline'}
          </span>
        </div>

        {/* Portal Mode Toggle Button */}
        <button
          onClick={onTogglePortal}
          className="btn-secondary"
          style={{
            padding: '7px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 800,
            background: isAdmin ? 'var(--emerald-50)' : 'var(--blue-50)',
            borderColor: isAdmin ? 'rgba(4, 120, 87, 0.3)' : 'rgba(37, 99, 235, 0.3)',
            color: isAdmin ? 'var(--emerald-800)' : 'var(--blue-700)',
            boxShadow: 'var(--shadow-sm)'
          }}
          title={isAdmin ? 'Switch to Author Portal view' : 'Switch to Operations Admin view'}
        >
          <ArrowRightLeft size={14} />
          <span>{isAdmin ? 'View as Author' : 'View Operations Portal'}</span>
        </button>

        {/* Active User Avatar Capsule */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 10px 4px 6px',
            borderRadius: '9999px',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: isAdmin
                ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)'
                : 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
              color: '#ffffff',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name || 'User'}
            </div>
            <div style={{ fontSize: '0.68rem', color: isAdmin ? 'var(--blue-700)' : 'var(--emerald-700)', fontWeight: 700 }}>
              {isAdmin ? 'Operations Lead' : (user?.author_id || 'Author')}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
