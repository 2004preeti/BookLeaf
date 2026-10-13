// client/src/components/Sidebar.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWs } from '../context/WsContext';
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  PlusCircle,
  Shield,
  User,
  Users,
  Code2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Radio,
  BookMarked,
  Layers,
  Inbox,
  BarChart3
} from 'lucide-react';

export function Sidebar({
  currentView,
  onNavigate,
  onOpenSubmitTicket,
  onOpenApiDocs,
  isCollapsed,
  onToggleCollapse
}) {
  const { user, personas, switchPersona } = useAuth();
  const { isConnected } = useWs();
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const isAdmin = user?.role === 'admin';

  return (
    <aside
      className={`app-sidebar ${isCollapsed ? 'collapsed' : ''}`}
      style={{
        width: isCollapsed ? '76px' : '260px',
        minWidth: isCollapsed ? '76px' : '260px',
        transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        background: '#ffffff',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      {/* 1. Sidebar Brand Header */}
      <div
        style={{
          padding: isCollapsed ? '20px 12px' : '22px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 10px rgba(4, 120, 87, 0.25)'
            }}
          >
            <BookMarked size={20} />
          </div>

          {!isCollapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: 'var(--text-main)',
                    letterSpacing: '-0.02em',
                    whiteSpace: 'nowrap'
                  }}
                >
                  BookLeaf
                </span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isAdmin ? 'var(--blue-50)' : 'var(--emerald-50)',
                    color: isAdmin ? 'var(--blue-600)' : 'var(--emerald-700)',
                    border: `1px solid ${isAdmin ? 'rgba(37, 99, 235, 0.2)' : 'rgba(4, 120, 87, 0.2)'}`
                  }}
                >
                  {isAdmin ? 'OPS' : 'PORTAL'}
                </span>
              </div>
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--text-muted)',
                  marginTop: '1px',
                  whiteSpace: 'nowrap'
                }}
              >
                Publishing Support
              </p>
            </div>
          )}
        </div>

        {/* Toggle Collapse Button */}
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'var(--bg-subtle)',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer'
          }}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* 2. Navigation Items */}
      <div
        style={{
          flex: 1,
          padding: isCollapsed ? '16px 8px' : '20px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          overflowY: 'auto'
        }}
      >
        {/* Navigation Category Label */}
        {!isCollapsed && (
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-dim)',
              padding: '0 10px',
              marginBottom: '4px'
            }}
          >
            {isAdmin ? 'Operations Desk' : 'Author Dashboard'}
          </span>
        )}

        {/* AUTHOR NAVIGATION */}
        {!isAdmin && (
          <>
            <button
              onClick={() => onNavigate('overview')}
              className={`sidebar-nav-item ${currentView === 'overview' ? 'active' : ''}`}
              title="Overview & Royalties"
            >
              <LayoutDashboard size={18} />
              {!isCollapsed && <span>Overview & Royalties</span>}
            </button>

            <button
              onClick={() => onNavigate('books')}
              className={`sidebar-nav-item ${currentView === 'books' ? 'active' : ''}`}
              title="My Published Books"
            >
              <BookOpen size={18} />
              {!isCollapsed && <span>My Books</span>}
            </button>

            <button
              onClick={() => onNavigate('tickets')}
              className={`sidebar-nav-item ${currentView === 'tickets' ? 'active' : ''}`}
              title="Support Tickets"
            >
              <MessageSquare size={18} />
              {!isCollapsed && <span>Support Tickets</span>}
            </button>

            {/* Quick Raise Ticket Action */}
            <div style={{ marginTop: '14px', marginBottom: '14px', padding: isCollapsed ? '0' : '0 4px' }}>
              <button
                onClick={onOpenSubmitTicket}
                className="btn-primary"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: isCollapsed ? '10px 0' : '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.85rem'
                }}
                title="Raise New Support Query"
              >
                <PlusCircle size={17} />
                {!isCollapsed && <span>Raise Ticket</span>}
              </button>
            </div>
          </>
        )}

        {/* ADMIN NAVIGATION */}
        {isAdmin && (
          <>
            <button
              onClick={() => onNavigate('queue')}
              className={`sidebar-nav-item ${currentView === 'queue' ? 'active' : ''}`}
              title="Ticket Triage Queue"
            >
              <Inbox size={18} />
              {!isCollapsed && <span>Triage Queue</span>}
            </button>

            <button
              onClick={() => onNavigate('workbench')}
              className={`sidebar-nav-item ${currentView === 'workbench' ? 'active' : ''}`}
              title="Ticket Workbench"
            >
              <Layers size={18} />
              {!isCollapsed && <span>Ticket Workbench</span>}
            </button>

            <button
              onClick={() => onNavigate('metrics')}
              className={`sidebar-nav-item ${currentView === 'metrics' ? 'active' : ''}`}
              title="Operations Metrics"
            >
              <BarChart3 size={18} />
              {!isCollapsed && <span>Ops Metrics</span>}
            </button>
          </>
        )}

        <div style={{ flex: 1 }} />

        {/* 3. Utility Nav: API Docs */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button
            onClick={onOpenApiDocs}
            className="sidebar-nav-item"
            style={{ color: 'var(--text-secondary)' }}
            title="REST API & Architecture Docs"
          >
            <Code2 size={16} />
            {!isCollapsed && <span>API Reference</span>}
          </button>
        </div>
      </div>

      {/* 4. Bottom User Profile & Persona Switcher */}
      <div
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: isCollapsed ? '14px 8px' : '14px 16px',
          background: 'var(--bg-canvas)',
          position: 'relative'
        }}
      >
        <button
          onClick={() => setShowPersonaMenu(!showPersonaMenu)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: '10px',
            padding: '8px 10px',
            borderRadius: '10px',
            background: '#ffffff',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)'
          }}
          title={`Switch user persona (Current: ${user?.name})`}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: isAdmin ? 'var(--blue-600)' : 'var(--emerald-700)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div style={{ textAlign: 'left', minWidth: 0 }}>
                <p
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user?.name || 'Guest User'}
                </p>
                <p
                  style={{
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isAdmin ? 'Operations Lead' : (user?.author_id || 'Author')}
                </p>
              </div>
            )}
          </div>
          {!isCollapsed && <Users size={14} color="var(--text-dim)" />}
        </button>

        {/* Persona Switcher Popover */}
        {showPersonaMenu && (
          <div
            style={{
              position: 'absolute',
              bottom: '100%',
              left: '12px',
              width: '260px',
              background: '#ffffff',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              padding: '12px',
              marginBottom: '8px',
              zIndex: 100,
              maxHeight: '360px',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                Select Test Persona
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>1-Click Switch</span>
            </div>

            {/* Admin option */}
            <button
              onClick={() => {
                switchPersona('admin');
                setShowPersonaMenu(false);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '8px',
                background: isAdmin ? 'var(--blue-50)' : 'transparent',
                border: isAdmin ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid transparent',
                textAlign: 'left',
                marginBottom: '6px'
              }}
            >
              <Shield size={16} color="var(--blue-600)" />
              <div>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Karan Verma</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--blue-600)' }}>BookLeaf Support Ops Lead (Admin)</p>
              </div>
            </button>

            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-dim)', margin: '8px 4px 4px 4px', textTransform: 'uppercase' }}>
              Seeded Authors
            </div>

            {personas.filter(p => p.role !== 'admin').map(p => (
              <button
                key={p.author_id}
                onClick={() => {
                  switchPersona(p.author_id);
                  setShowPersonaMenu(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  background: user?.author_id === p.author_id ? 'var(--emerald-50)' : 'transparent',
                  border: user?.author_id === p.author_id ? '1px solid rgba(4, 120, 87, 0.25)' : '1px solid transparent',
                  textAlign: 'left'
                }}
              >
                <User size={14} color={user?.author_id === p.author_id ? 'var(--emerald-700)' : 'var(--text-muted)'} />
                <div style={{ minWidth: 0, overflow: 'hidden' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {p.name}
                  </p>
                  <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {p.author_id} · {p.city}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
