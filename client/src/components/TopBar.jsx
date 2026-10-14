// client/src/components/TopBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWs } from '../context/WsContext';
import {
  Shield,
  User,
  ArrowRightLeft,
  ChevronDown,
  Check,
  Radio
} from 'lucide-react';

export function TopBar({ currentView, onTogglePortal }) {
  const { user, personas, switchPersona } = useAuth();
  const { isConnected } = useWs();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = user?.role === 'admin';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getViewTitle = (view) => {
    switch (view) {
      case 'overview': return 'Overview & Royalties';
      case 'books': return 'My Published Books';
      case 'tickets': return 'Support Tickets';
      case 'queue': return 'Ticket Queue';
      case 'workbench': return 'Response Studio';
      case 'metrics': return 'Operations Metrics';
      default: return 'Dashboard';
    }
  };

  return (
    <header
      style={{
        height: '60px',
        background: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* 1. LEFT: Clean Minimal Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontSize: '0.84rem',
            color: 'var(--text-muted)',
            fontWeight: 500
          }}
        >
          {isAdmin ? 'Operations' : 'Author Portal'}
        </span>
        <span style={{ color: 'var(--border-medium)', fontSize: '0.84rem' }}>/</span>
        <span
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: 'var(--text-main)'
          }}
        >
          {getViewTitle(currentView)}
        </span>
      </div>

      {/* 2. RIGHT: Compact Persona Switcher + Portal Toggle + Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} ref={dropdownRef}>
        {/* Real-time Status Indicator (Minimal) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.74rem',
            color: isConnected ? 'var(--indigo-700)' : 'var(--text-dim)',
            fontWeight: 600,
            padding: '4px 8px',
            borderRadius: '6px',
            background: isConnected ? 'var(--indigo-50)' : 'var(--bg-subtle)'
          }}
          title={isConnected ? 'Live WebSocket Connected' : 'Disconnected'}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: isConnected ? '#4f46e5' : '#94a3b8',
              display: 'inline-block'
            }}
          />
          <span>{isConnected ? 'Live Sync' : 'Offline'}</span>
        </div>

        {/* Persona Switcher Dropdown (Single Compact Button) */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: 'var(--text-main)',
              cursor: 'pointer'
            }}
            title="Switch demo user account"
          >
            {isAdmin ? <Shield size={14} color="var(--violet-600)" /> : <User size={14} color="var(--indigo-600)" />}
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name || 'Switch User'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              ({isAdmin ? 'Admin' : (user?.author_id || 'Author')})
            </span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                width: '280px',
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 100,
                maxHeight: '380px',
                overflowY: 'auto'
              }}
            >
              <div style={{ padding: '6px 8px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Admin Operations
              </div>
              <button
                onClick={() => {
                  switchPersona('admin');
                  setShowDropdown(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: isAdmin ? 'var(--violet-50)' : 'transparent',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={14} color="var(--violet-600)" />
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>Karan Verma</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--violet-700)' }}>Support Operations Lead</div>
                  </div>
                </div>
                {isAdmin && <Check size={14} color="var(--violet-700)" />}
              </button>

              <div style={{ padding: '10px 8px 4px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', borderTop: '1px solid var(--border-subtle)', marginTop: '6px' }}>
                Authors (Sample Dataset)
              </div>
              {personas.filter(p => p.role !== 'admin').map(p => {
                const isCurrent = user?.author_id === p.author_id;
                return (
                  <button
                    key={p.author_id}
                    onClick={() => {
                      switchPersona(p.author_id);
                      setShowDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 10px',
                      borderRadius: '6px',
                      background: isCurrent ? 'var(--indigo-50)' : 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={13} color={isCurrent ? 'var(--indigo-600)' : 'var(--text-muted)'} />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{p.author_id} • {p.city}</div>
                      </div>
                    </div>
                    {isCurrent && <Check size={13} color="var(--indigo-600)" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Portal View Toggle */}
        <button
          onClick={onTogglePortal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            fontWeight: 600,
            background: isAdmin ? 'var(--indigo-50)' : 'var(--violet-50)',
            border: `1px solid ${isAdmin ? 'rgba(79, 70, 229, 0.25)' : 'rgba(124, 58, 237, 0.25)'}`,
            color: isAdmin ? 'var(--indigo-800)' : 'var(--violet-700)',
            cursor: 'pointer'
          }}
          title={isAdmin ? 'Switch to Author View' : 'Switch to Operations Admin View'}
        >
          <ArrowRightLeft size={13} />
          <span>{isAdmin ? 'View as Author' : 'View as Admin'}</span>
        </button>

        {/* User Avatar Circle */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: isAdmin ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
          }}
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
      </div>
    </header>
  );
}
