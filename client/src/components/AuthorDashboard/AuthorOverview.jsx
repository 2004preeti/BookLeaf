// client/src/components/AuthorDashboard/AuthorOverview.jsx
import React from 'react';
import { DollarSign, BookCheck, TrendingUp, Clock, AlertCircle, Sparkles } from 'lucide-react';

export function AuthorOverview({ summary, author }) {
  const isThresholdMet = (summary?.royalty_pending || 0) >= 1000;

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 78, 59, 0.3) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              Welcome back, {author?.name}
            </span>
            <span className="badge badge-resolved" style={{ fontSize: '0.7rem' }}>
              Verified Author
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '650px' }}>
            Author ID: <code style={{ color: 'var(--emerald-400)', fontFamily: 'var(--font-mono)' }}>{author?.author_id}</code> • Member since {author?.joined_date} • {author?.city}
          </p>
        </div>

        {/* Payout Status Notice */}
        <div style={{
          background: isThresholdMet ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.12)',
          border: `1px solid ${isThresholdMet ? 'rgba(16, 185, 129, 0.4)' : 'rgba(234, 179, 8, 0.3)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '380px'
        }}>
          {isThresholdMet ? (
            <Sparkles size={20} color="#34d399" />
          ) : (
            <AlertCircle size={20} color="#fde047" />
          )}
          <div style={{ fontSize: '0.8rem', lineHeight: 1.35 }}>
            <div style={{ fontWeight: 600, color: isThresholdMet ? '#34d399' : '#fde047' }}>
              {isThresholdMet ? 'Quarterly Payout Eligible' : 'Rolling Over Next Cycle'}
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>
              {isThresholdMet
                ? 'Pending balance meets the ₹1,000 threshold and is scheduled for bank disbursement within 45 days.'
                : 'Pending balance is below ₹1,000 minimum threshold. Accumulated earnings will roll over to next quarter.'}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Financial & Catalog Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
        {/* Total Earned */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Total Royalties Earned
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-400)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            ₹{(summary?.total_royalty_earned || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            80% Author split of net profit per title
          </div>
        </div>

        {/* Royalty Paid */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Disbursed to Bank
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            ₹{(summary?.royalty_paid || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Successfully transferred to bank account
          </div>
        </div>

        {/* Royalty Pending */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Pending Royalties
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            ₹{(summary?.royalty_pending || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: isThresholdMet ? 'var(--emerald-400)' : 'var(--text-muted)' }}>
            {isThresholdMet ? 'Eligible for active batch transfer' : 'Rolls over until ₹1,000 accumulated'}
          </div>
        </div>

        {/* Catalog & Copies Sold */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Published Catalog
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
              <BookCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {(summary?.total_copies_sold || 0).toLocaleString('en-IN')} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>copies</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Across {summary?.published_count || 0} published {summary?.in_production_count > 0 ? `(${summary.in_production_count} in production)` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
