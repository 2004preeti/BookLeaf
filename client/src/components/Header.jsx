// client/src/components/Header.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWs } from '../context/WsContext';
import { BookOpen, Shield, User, Radio, Code2, LogOut, ChevronDown, Sparkles } from 'lucide-react';

export function Header({ onOpenApiDocs, currentPortal, onTogglePortal }) {
  const { user, personas, switchPersona, logout } = useAuth();
  const { isConnected } = useWs();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  return (
    <header style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-dark)' }}>
      {/* Top Quick Demo Persona Switcher Bar */}
      <div className="demo-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Quick Persona Switcher:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* Quick Author: Priya Sharma */}
            <button
              className={`persona-pill ${user?.author_id === 'AUTH001' ? 'active' : ''}`}
              onClick={() => switchPersona('AUTH001')}
              title="Author: Priya Sharma (AUTH001)"
            >
              <User size={13} /> Priya Sharma (Author)
            </button>
            {/* Quick Author: Sneha Kulkarni */}
            <button
              className={`persona-pill ${user?.author_id === 'AUTH007' ? 'active' : ''}`}
              onClick={() => switchPersona('AUTH007')}
              title="Author: Sneha Kulkarni (AUTH007) - 3 books, in production title"
            >
              <User size={13} /> Sneha Kulkarni
            </button>
            {/* Quick Author: Rohit Kapoor */}
            <button
              className={`persona-pill ${user?.author_id === 'AUTH002' ? 'active' : ''}`}
              onClick={() => switchPersona('AUTH002')}
              title="Author: Rohit Kapoor (AUTH002) - High royalties"
            >
              <User size={13} /> Rohit Kapoor
            </button>
            {/* Quick Admin: Lead Support */}
            <button
              className={`persona-pill ${user?.role === 'admin' ? 'active' : ''}`}
              onClick={() => switchPersona('ADMIN001')}
              style={{ borderColor: user?.role === 'admin' ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)' }}
              title="Admin: Support Ops Lead"
            >
              <Shield size={13} color="#f59e0b" /> Admin (Ops Lead)
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* WebSocket Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: isConnected ? '#34d399' : '#f87171' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isConnected ? '#10b981' : '#ef4444',
              display: 'inline-block',
              boxShadow: isConnected ? '0 0 8px #10b981' : 'none'
            }} />
            <span>{isConnected ? 'Real-Time Sync Live' : 'Reconnecting...'}</span>
          </div>

          {/* All 10 Authors Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowPersonaMenu(!showPersonaMenu)}
              className="btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.78rem', borderRadius: '6px' }}
            >
              <span>All 10 Authors</span>
              <ChevronDown size={12} />
            </button>

            {showPersonaMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '6px',
                background: '#131e28',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                width: '260px',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 200,
                maxHeight: '340px',
                overflowY: 'auto',
                padding: '4px'
              }}>
                <div style={{ padding: '8px 10px', fontSize: '0.72rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-subtle)', fontWeight: 600 }}>
                  SELECT PERSONA FOR TESTING
                </div>
                {personas.map(p => (
                  <button
                    key={p.author_id}
                    onClick={() => {
                      switchPersona(p.author_id);
                      setShowPersonaMenu(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.82rem',
                      color: user?.author_id === p.author_id ? 'var(--emerald-400)' : 'var(--text-main)',
                      background: user?.author_id === p.author_id ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.email} • {p.city}</div>
                    </div>
                    {p.role === 'admin' ? <Shield size={12} color="#f59e0b" /> : <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.author_id}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div style={{ padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            <BookOpen size={22} color="#fff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                BookLeaf
              </span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.08)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                color: 'var(--emerald-400)',
                fontWeight: 600,
                letterSpacing: '0.04em'
              }}>
                PUBLISHING
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Author Support & Operations Hub
            </div>
          </div>
        </div>

        {/* Center / Portal Switcher Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => {
              if (user?.role === 'admin') {
                // If currently admin, switch persona to author
                switchPersona('AUTH001');
              }
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: user?.role === 'author' ? 'var(--emerald-900)' : 'transparent',
              color: user?.role === 'author' ? 'var(--emerald-400)' : 'var(--text-muted)',
              border: user?.role === 'author' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid transparent'
            }}
          >
            <User size={15} /> Author Portal
          </button>

          <button
            onClick={() => {
              if (user?.role !== 'admin') {
                switchPersona('ADMIN001');
              }
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: user?.role === 'admin' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: user?.role === 'admin' ? '#fbbf24' : 'var(--text-muted)',
              border: user?.role === 'admin' ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent'
            }}
          >
            <Shield size={15} /> Admin Queue
          </button>
        </div>

        {/* Right Action Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Architecture & API Docs Button */}
          <button
            onClick={onOpenApiDocs}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <Code2 size={16} color="var(--emerald-400)" />
            <span>Architecture & API Docs</span>
          </button>

          {/* Current User Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: user?.role === 'admin' ? '#d97706' : '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: '#fff'
            }}>
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', lineHeight: 1.2 }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: user?.role === 'admin' ? '#fbbf24' : 'var(--emerald-400)' }}>
                {user?.role === 'admin' ? 'Ops Specialist' : `Author (${user?.author_id})`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
