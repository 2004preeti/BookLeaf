// client/src/components/AuthorDashboard/MyTicketsView.jsx
import React, { useState, useEffect } from 'react';
import { useWs } from '../../context/WsContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Clock, Send, CheckCircle2, AlertTriangle, Paperclip, Shield, User } from 'lucide-react';

export function MyTicketsView({ onOpenSubmitTicket }) {
  const { user } = useAuth();
  const { lastEvent } = useWs();
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activeTicketData, setActiveTicketData] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch author tickets
  const fetchTickets = () => {
    fetch('/api/tickets', {
      headers: { Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.tickets) {
          setTickets(data.tickets);
          if (!selectedTicketId && data.tickets.length > 0) {
            setSelectedTicketId(data.tickets[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  // Real-time updates: whenever WebSocket emits new_message, ticket_updated, or ticket_created
  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'new_message') {
      const msg = lastEvent.payload.message;
      // If currently looking at this ticket, append message
      if (activeTicketData && activeTicketData.ticket.id === lastEvent.payload.ticket_id) {
        // Prevent duplicate append
        setActiveTicketData(prev => {
          if (!prev) return prev;
          const exists = prev.messages.some(m => m.id === msg.id);
          if (exists) return prev;
          return {
            ...prev,
            ticket: { ...prev.ticket, status: lastEvent.payload.ticket_status },
            messages: [...prev.messages, msg]
          };
        });
      }
      fetchTickets();
    } else if (lastEvent.type === 'ticket_updated' || lastEvent.type === 'ticket_created') {
      fetchTickets();
      if (selectedTicketId && lastEvent.payload?.ticket?.id === selectedTicketId) {
        loadTicketDetail(selectedTicketId);
      }
    }
  }, [lastEvent]);

  // Load selected ticket detail
  const loadTicketDetail = (id) => {
    if (!id) return;
    fetch(`/api/tickets/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setActiveTicketData(data);
      })
      .catch(err => console.error('Failed to load ticket:', err));
  };

  useEffect(() => {
    if (selectedTicketId) {
      loadTicketDetail(selectedTicketId);
    }
  }, [selectedTicketId]);

  // Author sends follow-up reply
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}`
        },
        body: JSON.stringify({
          message: replyText.trim(),
          is_internal_note: false
        })
      });

      const data = await res.json();
      if (res.ok) {
        setReplyText('');
        // Append locally if not already done by WS
        setActiveTicketData(prev => {
          if (!prev) return prev;
          const exists = prev.messages.some(m => m.id === data.message.id);
          if (exists) return prev;
          return {
            ...prev,
            ticket: { ...prev.ticket, status: data.ticket_status },
            messages: [...prev.messages, data.message]
          };
        });
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open': return 'badge-open';
      case 'In Progress': return 'badge-inprogress';
      case 'Resolved': return 'badge-resolved';
      case 'Closed': return 'badge-closed';
      default: return 'badge-open';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Support Queries & Communication</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Real-time correspondence with BookLeaf Operations Desk. Live updates automatically push without page refresh.
          </p>
        </div>

        <button onClick={() => onOpenSubmitTicket('GENERAL')} className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <MessageSquare size={16} />
          <span>New Query</span>
        </button>
      </div>

      {tickets.length === 0 && !loading ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <MessageSquare size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ marginBottom: '8px' }}>No Support Tickets Raised Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Have a question about your royalties, ISBN, distribution, or printing?
          </p>
          <button onClick={() => onOpenSubmitTicket('GENERAL')} className="btn-primary">
            Submit Your First Query
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', minHeight: '580px' }}>
          {/* Left Column: Tickets List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Your Tickets ({tickets.length})
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {tickets.map(t => {
                const isSelected = t.id === selectedTicketId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      border: `1px solid ${isSelected ? 'var(--emerald-500)' : 'transparent'}`,
                      background: isSelected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                        {t.ticket_number}
                      </span>
                      <span className={`badge ${getStatusBadge(t.status)}`} style={{ fontSize: '0.7rem' }}>
                        {t.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '4px', lineHeight: 1.3 }}>
                      {t.subject}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{t.category}</span>
                      <span>{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ticket Conversation Thread */}
          {activeTicketData ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Thread Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-400)', fontWeight: 700, fontSize: '0.9rem' }}>
                      {activeTicketData.ticket.ticket_number}
                    </span>
                    <span className={`badge ${getStatusBadge(activeTicketData.ticket.status)}`}>
                      {activeTicketData.ticket.status}
                    </span>
                    <span className="badge badge-category">
                      {activeTicketData.ticket.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '6px' }}>
                    {activeTicketData.ticket.subject}
                  </h3>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Book Reference: <strong style={{ color: 'var(--emerald-400)' }}>
                      {activeTicketData.book ? `${activeTicketData.book.title} (${activeTicketData.book.book_id})` : 'General / Account Level'}
                    </strong>
                    {activeTicketData.ticket.attachment_name && (
                      <span style={{ marginLeft: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#93c5fd' }}>
                        <Paperclip size={13} /> {activeTicketData.ticket.attachment_name}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  <div>Raised on:</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {new Date(activeTicketData.ticket.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Message History Feed */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {activeTicketData.messages.map(m => {
                  const isAdmin = m.sender_role === 'admin';

                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isAdmin ? 'flex-start' : 'flex-end',
                        maxWidth: '85%',
                        background: isAdmin ? '#162836' : 'rgba(16, 185, 129, 0.15)',
                        border: `1px solid ${isAdmin ? 'rgba(56, 189, 248, 0.25)' : 'rgba(16, 185, 129, 0.35)'}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px 18px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {/* Sender Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        {isAdmin ? (
                          <Shield size={14} color="#38bdf8" />
                        ) : (
                          <User size={14} color="var(--emerald-400)" />
                        )}
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isAdmin ? '#7dd3fc' : 'var(--emerald-400)' }}>
                          {isAdmin ? `${m.sender_name} (BookLeaf Operations)` : m.sender_name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Body */}
                      <div style={{ fontSize: '0.9rem', color: '#f1f5f9', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Author Reply Input Bar */}
              <form onSubmit={handleSendReply} style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                gap: '12px'
              }}>
                <input
                  type="text"
                  placeholder="Type a response or follow-up question..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="btn-primary"
                  style={{ padding: '10px 18px' }}
                >
                  <Send size={15} />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Select a ticket to view conversation thread.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
