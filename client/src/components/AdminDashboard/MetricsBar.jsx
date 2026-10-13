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
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Queue Total
          </span>
          <Inbox size={16} color="var(--text-muted)" />
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
          {overview.total_tickets || 0}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Across {overview.total_authors || 10} authors
        </div>
      </div>

      {/* Open Tickets */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#93c5fd', fontWeight: 600, textTransform: 'uppercase' }}>
            Awaiting Action
          </span>
          <Clock size={16} color="#60a5fa" />
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#93c5fd' }}>
          {overview.open_tickets || 0}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Unresolved incoming
        </div>
      </div>

      {/* In Progress */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#d8b4fe', fontWeight: 600, textTransform: 'uppercase' }}>
            In Progress
          </span>
          <AlertCircle size={16} color="#c084fc" />
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#d8b4fe' }}>
          {overview.in_progress || 0}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Under investigation
        </div>
      </div>

      {/* Critical Active */}
      <div className="glass-card" style={{
        padding: '16px',
        border: overview.critical_active > 0 ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
        background: overview.critical_active > 0 ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600, textTransform: 'uppercase' }}>
            Critical SLA
          </span>
          <ShieldAlert size={16} color="#ef4444" />
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171' }}>
          {overview.critical_active || 0}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#fca5a5', marginTop: '2px' }}>
          Requires 24-48h resolution
        </div>
      </div>

      {/* Overdue (>24h) */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600, textTransform: 'uppercase' }}>
            Age &gt; 24h
          </span>
          <Clock size={16} color="#f59e0b" />
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24' }}>
          {overview.overdue_count || 0}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Escalation threshold
        </div>
      </div>

      {/* Resolved / Closed */}
      <div className="glass-card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--emerald-400)', fontWeight: 600, textTransform: 'uppercase' }}>
            Resolved
          </span>
          <CheckCircle2 size={16} color="var(--emerald-400)" />
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-400)' }}>
          {(overview.resolved || 0) + (overview.closed || 0)}
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
          Successfully closed
        </div>
      </div>
    </div>
  );
}
