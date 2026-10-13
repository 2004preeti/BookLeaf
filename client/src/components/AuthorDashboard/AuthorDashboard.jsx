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
      {/* 1. If Overview View */}
      {currentView === 'overview' && (
        <>
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
        </>
      )}

      {/* 2. If Books View */}
      {currentView === 'books' && (
        <MyBooksView books={books} onOpenSubmitTicket={handleOpenSubmitTicket} />
      )}

      {/* 3. If Tickets View */}
      {currentView === 'tickets' && (
        <MyTicketsView onOpenSubmitTicket={handleOpenSubmitTicket} />
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
