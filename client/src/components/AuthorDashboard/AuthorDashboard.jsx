// client/src/components/AuthorDashboard/AuthorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthorOverview } from './AuthorOverview';
import { MyBooksView } from './MyBooksView';
import { MyTicketsView } from './MyTicketsView';
import { SubmitTicketModal } from './SubmitTicketModal';
import { BookOpen, MessageSquare, Plus } from 'lucide-react';

export function AuthorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('books'); // 'books' or 'tickets'
  const [books, setBooks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedBookForTicket, setSelectedBookForTicket] = useState('GENERAL');
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
    setSelectedBookForTicket(bookId);
    setIsSubmitModalOpen(true);
  };

  const handleTicketSubmitted = (newTicket) => {
    // Switch to tickets tab automatically so author sees their newly raised ticket
    setActiveTab('tickets');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Author Financial Summary & Payout Overview */}
      <AuthorOverview summary={summary} author={user} />

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('books')}
            style={{
              padding: '12px 20px',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: activeTab === 'books' ? 'var(--emerald-400)' : 'var(--text-muted)',
              borderBottom: activeTab === 'books' ? '2px solid var(--emerald-500)' : '2px solid transparent',
              background: activeTab === 'books' ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
              borderRadius: '8px 8px 0 0'
            }}
          >
            <BookOpen size={17} />
            <span>My Books ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              padding: '12px 20px',
              fontSize: '0.92rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: activeTab === 'tickets' ? 'var(--emerald-400)' : 'var(--text-muted)',
              borderBottom: activeTab === 'tickets' ? '2px solid var(--emerald-500)' : '2px solid transparent',
              background: activeTab === 'tickets' ? 'rgba(16, 185, 129, 0.06)' : 'transparent',
              borderRadius: '8px 8px 0 0'
            }}
          >
            <MessageSquare size={17} />
            <span>Support Tickets & Messages</span>
          </button>
        </div>

        <button
          onClick={() => handleOpenSubmitTicket('GENERAL')}
          className="btn-primary"
          style={{ fontSize: '0.85rem', marginBottom: '8px' }}
        >
          <Plus size={16} />
          <span>Raise Support Query</span>
        </button>
      </div>

      {/* Tab Views */}
      {activeTab === 'books' ? (
        <MyBooksView
          books={books}
          onOpenSubmitTicket={handleOpenSubmitTicket}
        />
      ) : (
        <MyTicketsView
          onOpenSubmitTicket={handleOpenSubmitTicket}
        />
      )}

      {/* Ticket Modal */}
      <SubmitTicketModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        books={books}
        preselectedBookId={selectedBookForTicket}
        onTicketSubmitted={handleTicketSubmitted}
      />
    </div>
  );
}
