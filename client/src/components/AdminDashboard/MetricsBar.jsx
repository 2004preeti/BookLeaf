// client/src/components/AdminDashboard/MetricsBar.jsx
import React from 'react';
import { AlertCircle, Clock, CheckCircle2, Inbox, ShieldAlert, Users, BookOpen } from 'lucide-react';

export function MetricsBar({ stats }) {
  const overview = stats?.overview || {};

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
      gap: '14px',
      marginBottom: '24px'
    }}>
      {/* Total Tickets */}
      <div className="glass-card" style={{ padding: '16px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Queue Total
          </span>
          <Inbox size={16} color="var(--text-muted)" />
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {overview.total_tickets || 0}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
          Across {overview.total_authors || 10} authors
        </div>
      </div>

      {/* Open Tickets */}
      <div className="glass-card" style={{ padding: '16px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--blue-700)', fontWeight: 700, textTransform: 'uppercase' }}>
            Awaiting Action
          </span>
          <Clock size={16} color="var(--blue-600)" />
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--blue-700)' }}>
          {overview.open_tickets || 0}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
          Unresolved incoming
        </div>
      </div>

      {/* In Progress */}
      <div className="glass-card" style={{ padding: '16px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--purple-700)', fontWeight: 700, textTransform: 'uppercase' }}>
            In Progress
          </span>
          <AlertCircle size={16} color="var(--purple-600)" />
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--purple-700)' }}>
          {overview.in_progress || 0}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
          Under investigation
        </div>
      </div>

      {/* Critical Active */}
      <div className="glass-card" style={{
        padding: '16px',
        border: overview.critical_active > 0 ? '1px solid rgba(225, 29, 72, 0.4)' : '1px solid var(--border-subtle)',
        background: overview.critical_active > 0 ? 'var(--rose-50)' : '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--rose-700)', fontWeight: 700, textTransform: 'uppercase' }}>
            Critical SLA
          </span>
          <ShieldAlert size={16} color="var(--rose-600)" />
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--rose-700)' }}>
          {overview.critical_active || 0}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--rose-700)', marginTop: '2px', fontWeight: 600 }}>
          Requires 24-48h resolution
        </div>
      </div>

      {/* Overdue (>24h) */}
      <div className="glass-card" style={{ padding: '16px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--amber-700)', fontWeight: 700, textTransform: 'uppercase' }}>
            Age &gt; 24h
          </span>
          <Clock size={16} color="var(--amber-600)" />
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--amber-700)' }}>
          {overview.overdue_count || 0}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
          Escalation threshold
        </div>
      </div>

      {/* Resolved / Closed */}
      <div className="glass-card" style={{ padding: '16px', background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--emerald-700)', fontWeight: 700, textTransform: 'uppercase' }}>
            Resolved
          </span>
          <CheckCircle2 size={16} color="var(--emerald-600)" />
        </div>
        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--emerald-700)' }}>
          {(overview.resolved || 0) + (overview.closed || 0)}
        </div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>
          Successfully closed
        </div>
      </div>
    </div>
  );
}
