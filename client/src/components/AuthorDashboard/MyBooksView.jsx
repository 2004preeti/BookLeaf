// client/src/components/AuthorDashboard/MyBooksView.jsx
import React from 'react';
import { Book, ExternalLink, MessageSquarePlus, CheckCircle2, Clock3, ShoppingBag } from 'lucide-react';

export function MyBooksView({ books, onOpenSubmitTicket }) {
  if (!books || books.length === 0) {
    return (
      <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
        <Book size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ marginBottom: '8px' }}>No books in your catalog</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Your published or upcoming manuscripts will appear here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>My Published Books & Titles</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Detailed breakdown of royalties, copies sold, and retail distribution platforms.
          </p>
        </div>

        <button
          onClick={() => onOpenSubmitTicket('GENERAL')}
          className="btn-primary"
          style={{ fontSize: '0.85rem' }}
        >
          <MessageSquarePlus size={16} />
          <span>Raise Support Query</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {books.map((book) => {
          const isLive = book.status === 'Published & Live';
          const isInProduction = !isLive;

          return (
            <div key={book.book_id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Header */}
              <div style={{
                padding: '18px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(255, 255, 255, 0.08)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'var(--emerald-400)'
                    }}>
                      {book.book_id}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {book.genre}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', lineHeight: 1.3, color: '#fff' }}>
                    {book.title}
                  </h3>
                </div>

                {/* Status Badge */}
                <span className={`badge ${isLive ? 'badge-resolved' : 'badge-inprogress'}`} style={{ whiteSpace: 'nowrap' }}>
                  {isLive ? <CheckCircle2 size={12} /> : <Clock3 size={12} />}
                  {isLive ? 'Live' : 'In Production'}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Specific stage if in production */}
                {isInProduction && (
                  <div style={{
                    background: 'rgba(168, 85, 247, 0.12)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    fontSize: '0.82rem',
                    color: '#d8b4fe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Clock3 size={16} />
                    <div>
                      <strong>Production Pipeline Stage:</strong> {book.status}
                    </div>
                  </div>
                )}

                {/* Metadata Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>ISBN:</span>
                    <div style={{ fontFamily: 'var(--font-mono)', color: book.isbn ? '#e2e8f0' : 'var(--text-muted)', marginTop: '2px' }}>
                      {book.isbn || 'Pending Assignment'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Published Date:</span>
                    <div style={{ color: '#e2e8f0', marginTop: '2px' }}>
                      {book.publication_date || 'In Production'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Retail MRP:</span>
                    <div style={{ color: '#e2e8f0', marginTop: '2px', fontWeight: 600 }}>
                      {book.mrp ? `₹${book.mrp}` : 'To be determined'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Print Partner:</span>
                    <div style={{ color: '#e2e8f0', marginTop: '2px' }}>
                      {book.print_partner || 'BookLeaf Delhi Ops'}
                    </div>
                  </div>
                </div>

                {/* Financial Stats Bar (if live) */}
                {isLive ? (
                  <div style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Copies Sold</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        {book.total_copies_sold.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Royalty Paid</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#60a5fa', marginTop: '2px' }}>
                        ₹{book.royalty_paid.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pending</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: book.royalty_pending > 0 ? '#fbbf24' : 'var(--emerald-400)', marginTop: '2px' }}>
                        ₹{book.royalty_pending.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    textAlign: 'center'
                  }}>
                    Royalties and sales tracking will activate automatically upon marketplace launch.
                  </div>
                )}

                {/* Availability platforms */}
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ShoppingBag size={12} />
                    <span>Distribution Channels:</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {book.available_on && book.available_on.length > 0 ? (
                      book.available_on.map((channel, i) => (
                        <span key={i} className="badge badge-category" style={{ fontSize: '0.72rem' }}>
                          {channel}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Channels configured post-production
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: Action */}
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(0, 0, 0, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => onOpenSubmitTicket(book.book_id)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                >
                  <MessageSquarePlus size={14} color="var(--emerald-400)" />
                  <span>Ask Support About This Book</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
