// client/src/components/AuthorDashboard/AuthorOverview.jsx
import React from 'react';
import { DollarSign, BookCheck, TrendingUp, Clock, AlertCircle, Sparkles } from 'lucide-react';

export function AuthorOverview({ summary, author }) {
  const isThresholdMet = (summary?.royalty_pending || 0) >= 1000;

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Modern Clean Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '14px',
        paddingBottom: '18px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Welcome back, {author?.name}
            </h2>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              background: 'var(--indigo-50)',
              color: 'var(--indigo-700)',
              border: '1px solid rgba(79, 70, 229, 0.2)'
            }}>
              Verified Author
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Author ID: <strong style={{ color: 'var(--text-main)' }}>{author?.author_id}</strong> • Member since {author?.joined_date} • {author?.city}
          </p>
        </div>

        {/* Payout Status Callout */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 16px',
          borderRadius: '10px',
          background: isThresholdMet ? 'var(--indigo-50)' : 'var(--amber-50)',
          border: `1px solid ${isThresholdMet ? 'rgba(79, 70, 229, 0.25)' : 'rgba(217, 119, 6, 0.25)'}`
        }}>
          {isThresholdMet ? (
            <Sparkles size={18} color="var(--indigo-600)" />
          ) : (
            <AlertCircle size={18} color="var(--amber-700)" />
          )}
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isThresholdMet ? 'var(--indigo-800)' : 'var(--amber-800)' }}>
              {isThresholdMet ? 'Quarterly Payout Eligible' : 'Rolling Over Next Cycle'}
            </div>
            <div style={{ fontSize: '0.72rem', color: isThresholdMet ? 'var(--indigo-600)' : 'var(--amber-700)' }}>
              {isThresholdMet ? 'Threshold (₹1,000) met • Bank transfer within 45 days' : 'Pending royalties are below ₹1,000 threshold'}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Crisp Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px' }}>
        {/* Total Earned */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Total Royalties Earned
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'var(--indigo-50)', color: 'var(--indigo-600)' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            ₹{(summary?.total_royalty_earned || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            80% Author split of net profit per title
          </div>
        </div>

        {/* Royalty Paid */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Disbursed to Bank
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'var(--violet-50)', color: 'var(--violet-600)' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            ₹{(summary?.royalty_paid || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Successfully transferred to bank account
          </div>
        </div>

        {/* Royalty Pending */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Pending Royalties
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'var(--amber-50)', color: 'var(--amber-700)' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-700)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            ₹{(summary?.royalty_pending || 0).toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.74rem', color: isThresholdMet ? 'var(--indigo-700)' : 'var(--text-muted)', fontWeight: isThresholdMet ? 700 : 500 }}>
            {isThresholdMet ? '✓ Scheduled for active batch disbursement' : 'Rolls over until ₹1,000 threshold'}
          </div>
        </div>

        {/* Catalog & Copies Sold */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Published Catalog
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', background: 'var(--indigo-50)', color: 'var(--indigo-600)' }}>
              <BookCheck size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', marginBottom: '4px' }}>
            {(summary?.total_copies_sold || 0).toLocaleString('en-IN')} <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500 }}>copies</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Across {summary?.published_count || 0} published {summary?.in_production_count > 0 ? `(${summary.in_production_count} in pipeline)` : ''}
          </div>
        </div>
      </div>
    </div>
  );
}
