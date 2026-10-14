// client/src/components/AuthorDashboard/AuthorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthorOverview } from './AuthorOverview';
import { MyBooksView } from './MyBooksView';
import { MyTicketsView } from './MyTicketsView';
import { SubmitTicketModal } from './SubmitTicketModal';
import { BookOpen, MessageSquare, LayoutDashboard, Plus } from 'lucide-react';

export function AuthorDashboard({
  currentView = 'overview',
  onNavigate,
  isSubmitModalOpen,
  setIsSubmitModalOpen,
  selectedBookForTicket,
  setSelectedBookForTicket
}) {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch author's books and aggregated financial summary
  const fetchAuthorBooks = () => {
    setLoading(true);
    fetch('/api/books', {
      headers: { Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.books) {
          setBooks(data.books);
          setSummary(data.summary);
        }
      })
      .catch(err => console.error('Failed to load books:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) {
      fetchAuthorBooks();
    }
  }, [user]);

  const handleOpenSubmitTicket = (bookId = 'GENERAL') => {
    if (setSelectedBookForTicket) setSelectedBookForTicket(bookId);
    if (setIsSubmitModalOpen) setIsSubmitModalOpen(true);
  };

  const handleTicketSubmitted = (newTicket) => {
    if (onNavigate) onNavigate('tickets');
  };

  return (
    <div style={{ padding: '28px 36px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Sleek Navigation Tab Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '14px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onNavigate('overview')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: currentView === 'overview' ? 'var(--indigo-50)' : 'transparent',
              color: currentView === 'overview' ? 'var(--indigo-800)' : 'var(--text-muted)',
              border: currentView === 'overview' ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LayoutDashboard size={15} />
            <span>Overview & Royalties</span>
          </button>

          <button
            onClick={() => onNavigate('books')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: currentView === 'books' ? 'var(--indigo-50)' : 'transparent',
              color: currentView === 'books' ? 'var(--indigo-800)' : 'var(--text-muted)',
              border: currentView === 'books' ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <BookOpen size={15} />
            <span>My Books ({books.length})</span>
          </button>

          <button
            onClick={() => onNavigate('tickets')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: currentView === 'tickets' ? 'var(--indigo-50)' : 'transparent',
              color: currentView === 'tickets' ? 'var(--indigo-800)' : 'var(--text-muted)',
              border: currentView === 'tickets' ? '1px solid rgba(79, 70, 229, 0.25)' : '1px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <MessageSquare size={15} />
            <span>Support Tickets</span>
          </button>
        </div>

        <button
          onClick={() => handleOpenSubmitTicket('GENERAL')}
          className="btn-primary"
          style={{ fontSize: '0.82rem', padding: '8px 14px' }}
        >
          <Plus size={15} />
          <span>Raise New Query</span>
        </button>
      </div>

      {/* 1. If Overview View */}
      {currentView === 'overview' && (
        <div className="fade-in-up">
          <AuthorOverview summary={summary} author={user} />
          <div style={{ marginTop: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Recent Titles & Distribution</h3>
              <button onClick={() => onNavigate('books')} className="btn-secondary" style={{ fontSize: '0.8rem' }}>
                View All Titles ({books.length})
              </button>
            </div>
            <MyBooksView books={books.slice(0, 2)} onOpenSubmitTicket={handleOpenSubmitTicket} />
          </div>
        </div>
      )}

      {/* 2. If Books View */}
      {currentView === 'books' && (
        <div className="fade-in-up">
          <MyBooksView books={books} onOpenSubmitTicket={handleOpenSubmitTicket} />
        </div>
      )}

      {/* 3. If Tickets View */}
      {currentView === 'tickets' && (
        <div className="fade-in-up">
          <MyTicketsView onOpenSubmitTicket={handleOpenSubmitTicket} />
        </div>
      )}

      {/* Ticket Modal */}
      <SubmitTicketModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        books={books}
        initialBookId={selectedBookForTicket}
        onTicketCreated={handleTicketSubmitted}
      />
    </div>
  );
}
