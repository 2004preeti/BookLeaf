// client/src/components/AuthorDashboard/AuthorOverview.jsx
import React from 'react';
import { DollarSign, BookCheck, TrendingUp, Clock, AlertCircle, Sparkles } from 'lucide-react';

export function AuthorOverview({ summary, author }) {
  const isThresholdMet = (summary?.royalty_pending || 0) >= 1000;

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Welcome Editorial Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
        border: '1px solid #a7f3d0',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--emerald-900)' }}>
              Welcome back, {author?.name}
            </span>
            <span className="badge badge-resolved" style={{ fontSize: '0.7rem' }}>
              Verified Author
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '650px' }}>
            Author ID: <code style={{ color: 'var(--emerald-700)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{author?.author_id}</code> • Member since {author?.joined_date} • {author?.city}
          </p>
        </div>

        {/* Payout Status Notice */}
        <div style={{
          background: isThresholdMet ? '#ffffff' : '#ffffff',
          border: `1px solid ${isThresholdMet ? '#6ee7b7' : '#fde047'}`,
          borderRadius: 'var(--radius-md)',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '400px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {isThresholdMet ? (
            <Sparkles size={20} color="#059669" />
          ) : (
            <AlertCircle size={20} color="#d97706" />
          )}
          <div style={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
            <div style={{ fontWeight: 700, color: isThresholdMet ? 'var(--emerald-800)' : 'var(--amber-700)' }}>
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
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total Royalties Earned
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--emerald-50)', color: 'var(--emerald-700)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            ₹{(summary?.total_royalty_earned || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            80% Author split of net profit per title
          </div>
        </div>

        {/* Royalty Paid */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Disbursed to Bank
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--blue-50)', color: 'var(--blue-700)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            ₹{(summary?.royalty_paid || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Successfully transferred to bank account
          </div>
        </div>

        {/* Royalty Pending */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Pending Royalties
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--amber-50)', color: 'var(--amber-700)' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--amber-700)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            ₹{(summary?.royalty_pending || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.75rem', color: isThresholdMet ? 'var(--emerald-700)' : 'var(--text-muted)', fontWeight: isThresholdMet ? 600 : 400 }}>
            {isThresholdMet ? 'Eligible for active batch transfer' : 'Rolls over until ₹1,000 accumulated'}
          </div>
        </div>

        {/* Catalog & Copies Sold */}
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Published Catalog
            </span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'var(--purple-50)', color: 'var(--purple-700)' }}>
              <BookCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
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
