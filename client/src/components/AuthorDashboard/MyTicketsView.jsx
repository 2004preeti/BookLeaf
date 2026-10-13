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
    }
  }, [lastEvent]);

  // Fetch full conversation history for selected ticket
  const fetchTicketDetails = (ticketId) => {
    if (!ticketId) return;
    fetch(`/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setActiveTicketData(data);
      })
      .catch(err => console.error('Failed to load ticket details:', err));
  };

  useEffect(() => {
    if (selectedTicketId) {
      fetchTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId]);

  // Handle author reply
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

      if (res.ok) {
        setReplyText('');
        fetchTicketDetails(selectedTicketId);
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>Support Queries & Communication</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Real-time correspondence with BookLeaf Operations Desk. Live updates push automatically without page refresh.
          </p>
        </div>

        <button onClick={() => onOpenSubmitTicket('GENERAL')} className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <MessageSquare size={16} />
          <span>New Query</span>
        </button>
      </div>

      {tickets.length === 0 && !loading ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', background: '#ffffff' }}>
          <MessageSquare size={48} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>No Support Tickets Raised Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            Have a question about your royalties, ISBN, distribution, or printing?
          </p>
          <button onClick={() => onOpenSubmitTicket('GENERAL')} className="btn-primary">
            Submit Your First Query
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', minHeight: '620px' }}>
          {/* Left Column: Tickets List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Your Tickets ({tickets.length})
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
              {tickets.map(t => {
                const isSelected = t.id === selectedTicketId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      border: `1px solid ${isSelected ? 'var(--emerald-600)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'var(--emerald-50)' : '#ffffff',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--emerald-700)', fontWeight: 700 }}>
                        {t.ticket_number}
                      </span>
                      <span className={`badge ${getStatusBadge(t.status)}`} style={{ fontSize: '0.7rem' }}>
                        {t.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-main)', marginBottom: '4px', lineHeight: 1.35 }}>
                      {t.subject}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontWeight: 600 }}>{t.category}</span>
                      <span>{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Ticket Conversation Thread */}
          {activeTicketData ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
              {/* Thread Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-canvas)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-700)', fontWeight: 800, fontSize: '0.9rem' }}>
                      {activeTicketData.ticket.ticket_number}
                    </span>
                    <span className={`badge ${getStatusBadge(activeTicketData.ticket.status)}`}>
                      {activeTicketData.ticket.status}
                    </span>
                    <span className="badge badge-category">
                      {activeTicketData.ticket.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '6px' }}>
                    {activeTicketData.ticket.subject}
                  </h3>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Book Reference: <strong style={{ color: 'var(--emerald-700)' }}>
                      {activeTicketData.book ? `${activeTicketData.book.title} (${activeTicketData.book.book_id})` : 'General / Account Level'}
                    </strong>
                    {activeTicketData.ticket.attachment_name && (
                      <span style={{ marginLeft: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--blue-700)', fontWeight: 600 }}>
                        <Paperclip size={13} /> {activeTicketData.ticket.attachment_name}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  <div>Raised on:</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 600 }}>
                    {new Date(activeTicketData.ticket.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Message History Feed */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px', background: '#ffffff' }}>
                {activeTicketData.messages.map(m => {
                  const isAdmin = m.sender_role === 'admin';

                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isAdmin ? 'flex-start' : 'flex-end',
                        maxWidth: '85%',
                        background: isAdmin ? 'var(--bg-subtle)' : 'var(--emerald-50)',
                        border: `1px solid ${isAdmin ? 'var(--border-subtle)' : '#a7f3d0'}`,
                        borderRadius: 'var(--radius-lg)',
                        padding: '16px 18px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {/* Sender Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        {isAdmin ? (
                          <Shield size={14} color="var(--blue-600)" />
                        ) : (
                          <User size={14} color="var(--emerald-700)" />
                        )}
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isAdmin ? 'var(--blue-700)' : 'var(--emerald-800)' }}>
                          {isAdmin ? `${m.sender_name} (BookLeaf Operations)` : m.sender_name}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                          {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Body */}
                      <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
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
                background: 'var(--bg-canvas)',
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
                  style={{ padding: '10px 20px' }}
                >
                  <Send size={15} />
                  <span>Send Reply</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: '#ffffff' }}>
              Select a ticket to view conversation thread.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
