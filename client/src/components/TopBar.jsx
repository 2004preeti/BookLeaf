// client/src/components/TopBar.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Sparkles, ArrowRightLeft, BookOpen, Layers } from 'lucide-react';

export function TopBar({ currentView, onTogglePortal }) {
  const { user, switchPersona } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <header
      style={{
        height: '64px',
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* 1. Left: Breadcrumbs & Page Context */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-muted)'
            }}
          >
            {isAdmin ? 'Operations Desk' : 'Author Workspace'}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>/</span>
          <span
            style={{
              fontSize: '0.92rem',
              fontWeight: 700,
              color: 'var(--text-main)',
              textTransform: 'capitalize'
            }}
          >
            {currentView}
          </span>
        </div>
      </div>

      {/* 2. Middle: Quick Reviewer Switcher Pills */}
      <div
        className="quick-switcher-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--bg-subtle)',
          padding: '4px 8px',
          borderRadius: '9999px',
          border: '1px solid var(--border-subtle)'
        }}
      >
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: 'var(--text-dim)',
            padding: '0 6px'
          }}
        >
          Quick Test:
        </span>

        <button
          onClick={() => switchPersona('AUTH001')}
          className={`persona-pill ${user?.author_id === 'AUTH001' ? 'active' : ''}`}
          title="Priya Sharma: 2 live books, pending royalties"
        >
          <User size={12} /> Priya S.
        </button>

        <button
          onClick={() => switchPersona('AUTH007')}
          className={`persona-pill ${user?.author_id === 'AUTH007' ? 'active' : ''}`}
          title="Sneha Kulkarni: 3 books, including 1 in production"
        >
          <User size={12} /> Sneha K. (Edge Case)
        </button>

        <button
          onClick={() => switchPersona('AUTH002')}
          className={`persona-pill ${user?.author_id === 'AUTH002' ? 'active' : ''}`}
          title="Rohit Kapoor: 2 live books, US & UK distribution"
        >
          <User size={12} /> Rohit K.
        </button>

        <button
          onClick={() => switchPersona('admin')}
          className={`persona-pill ${isAdmin ? 'active-admin' : ''}`}
          title="Karan Verma: Admin Operations Lead"
        >
          <Shield size={12} /> Karan V. (Admin)
        </button>
      </div>

      {/* 3. Right: Switch Portal Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onTogglePortal}
          className="btn-secondary"
          style={{
            fontSize: '0.8rem',
            padding: '7px 14px',
            borderRadius: '8px',
            background: isAdmin ? 'var(--emerald-50)' : 'var(--blue-50)',
            borderColor: isAdmin ? 'rgba(4, 120, 87, 0.25)' : 'rgba(37, 99, 235, 0.25)',
            color: isAdmin ? 'var(--emerald-700)' : 'var(--blue-600)',
            fontWeight: 700
          }}
          title={isAdmin ? 'Switch view to Author Portal' : 'Switch view to Operations Admin Portal'}
        >
          <ArrowRightLeft size={13} />
          <span>{isAdmin ? 'View as Author' : 'View Operations Portal'}</span>
        </button>
      </div>
    </header>
  );
}
