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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>My Published Books & Titles</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '22px' }}>
        {books.map((book) => {
          const isLive = book.status === 'Published & Live';
          const isInProduction = !isLive;

          return (
            <div
              key={book.book_id}
              className="glass-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderTop: isLive ? '3px solid #4f46e5' : '3px solid #7c3aed'
              }}
            >
              {/* Header */}
              <div style={{
                padding: '18px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-canvas)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '0.72rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'var(--indigo-50)',
                      border: '1px solid rgba(79, 70, 229, 0.2)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: 'var(--indigo-700)',
                      fontWeight: 700
                    }}>
                      {book.book_id}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {book.genre}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', lineHeight: 1.35, color: 'var(--text-main)', fontWeight: 800 }}>
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
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', background: '#ffffff' }}>
                {/* Specific stage if in production */}
                {isInProduction && (
                  <div style={{
                    background: 'var(--purple-50)',
                    border: '1px solid rgba(147, 51, 234, 0.25)',
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 14px',
                    fontSize: '0.82rem',
                    color: 'var(--purple-700)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontWeight: 600
                  }}>
                    <Clock3 size={16} />
                    <div>
                      <strong>Production Stage:</strong> {book.status}
                    </div>
                  </div>
                )}

                {/* Metadata Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ISBN:</span>
                    <div style={{ fontFamily: 'var(--font-mono)', color: book.isbn ? 'var(--text-main)' : 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
                      {book.isbn || 'Pending Assignment'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Published Date:</span>
                    <div style={{ color: 'var(--text-main)', marginTop: '2px', fontWeight: 500 }}>
                      {book.publication_date || 'In Production'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Retail MRP:</span>
                    <div style={{ color: 'var(--text-main)', marginTop: '2px', fontWeight: 700 }}>
                      {book.mrp ? `₹${book.mrp}` : 'To be determined'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Print Partner:</span>
                    <div style={{ color: 'var(--text-main)', marginTop: '2px', fontWeight: 500 }}>
                      {book.print_partner || 'BookLeaf Delhi Ops'}
                    </div>
                  </div>
                </div>

                {/* Financial Stats Bar (if live) */}
                {isLive ? (
                  <div style={{
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Copies Sold</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                        {book.total_copies_sold.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Royalty Paid</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--violet-700)', marginTop: '2px' }}>
                        ₹{book.royalty_paid.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: book.royalty_pending > 0 ? 'var(--amber-700)' : 'var(--indigo-700)', marginTop: '2px' }}>
                        ₹{book.royalty_pending.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    background: 'var(--bg-subtle)',
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                    <ShoppingBag size={13} />
                    <span>Distribution Channels:</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {book.available_on && book.available_on.length > 0 ? (
                      book.available_on.map((channel, i) => (
                        <span key={i} className="badge badge-category" style={{ fontSize: '0.74rem' }}>
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
                background: 'var(--bg-canvas)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => onOpenSubmitTicket(book.book_id)}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px' }}
                >
                  <MessageSquarePlus size={14} color="var(--indigo-600)" />
                  <span>Raise Support Ticket</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
