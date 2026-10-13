// client/src/components/AuthorDashboard/MyTicketsView.jsx
import React, { useState, useEffect } from 'react';
import { useWs } from '../../context/WsContext';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  Shield,
  User,
  Check,
  Sparkles,
  Info,
  Calendar,
  Layers
} from 'lucide-react';

export function MyTicketsView({ onOpenSubmitTicket }) {
  const { user } = useAuth();
  const { lastEvent } = useWs();
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activeTicketData, setActiveTicketData] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
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
    if (e) e.preventDefault();
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
        setAttachmentName('');
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
      {/* View Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Support Tickets & Correspondence
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Live communication with BookLeaf Operations Desk. Real-time responses appear instantly.
          </p>
        </div>

        <button onClick={() => onOpenSubmitTicket('GENERAL')} className="btn-primary" style={{ fontSize: '0.85rem' }}>
          <MessageSquare size={16} />
          <span>Raise New Query</span>
        </button>
      </div>

      {tickets.length === 0 && !loading ? (
        <div className="glass-card" style={{ padding: '64px', textAlign: 'center', background: '#ffffff' }}>
          <MessageSquare size={48} color="var(--text-muted)" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ marginBottom: '8px', color: 'var(--text-main)', fontSize: '1.2rem', fontWeight: 800 }}>No Support Tickets Raised Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '22px', maxWidth: '480px', margin: '0 auto 22px auto' }}>
            Need help with your quarterly royalties, ISBN assignment, book printing quality, or retail stock synchronization?
          </p>
          <button onClick={() => onOpenSubmitTicket('GENERAL')} className="btn-primary">
            Submit Your First Query
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '370px 1fr', gap: '22px', minHeight: '660px' }}>
          {/* Left Column: Tickets List */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Your Queries ({tickets.length})
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
              {tickets.map(t => {
                const isSelected = t.id === selectedTicketId;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    style={{
                      padding: '16px 18px',
                      borderRadius: 'var(--radius-lg)',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      border: `1px solid ${isSelected ? 'var(--emerald-600)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'var(--emerald-50)' : '#ffffff',
                      boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--emerald-700)', fontWeight: 800 }}>
                        {t.ticket_number}
                      </span>
                      <span className={`badge ${getStatusBadge(t.status)}`} style={{ fontSize: '0.7rem' }}>
                        {t.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '6px', lineHeight: 1.35 }}>
                      {t.subject}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
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
                padding: '22px 26px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-canvas)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '16px'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-700)', fontWeight: 800, fontSize: '0.95rem' }}>
                      {activeTicketData.ticket.ticket_number}
                    </span>
                    <span className={`badge ${getStatusBadge(activeTicketData.ticket.status)}`}>
                      {activeTicketData.ticket.status}
                    </span>
                    <span className="badge badge-category">
                      {activeTicketData.ticket.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '6px', lineHeight: 1.35 }}>
                    {activeTicketData.ticket.subject}
                  </h3>

                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                    Book Reference: <strong style={{ color: 'var(--emerald-700)' }}>
                      {activeTicketData.book ? `${activeTicketData.book.title} (${activeTicketData.book.book_id})` : 'General / Account Level'}
                    </strong>
                    {activeTicketData.ticket.attachment_name && (
                      <span style={{ marginLeft: '14px', display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--blue-700)', fontWeight: 700 }}>
                        <Paperclip size={13} /> {activeTicketData.ticket.attachment_name}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                  <div>Raised On:</div>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 700 }}>
                    {new Date(activeTicketData.ticket.created_at).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Status Notice Progression Banner */}
              <div style={{
                padding: '12px 24px',
                background: activeTicketData.ticket.status === 'Resolved'
                  ? 'var(--emerald-50)'
                  : activeTicketData.ticket.status === 'In Progress'
                  ? 'var(--purple-50)'
                  : 'var(--blue-50)',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.82rem',
                color: activeTicketData.ticket.status === 'Resolved'
                  ? 'var(--emerald-800)'
                  : activeTicketData.ticket.status === 'In Progress'
                  ? 'var(--purple-700)'
                  : 'var(--blue-700)',
                fontWeight: 600
              }}>
                {activeTicketData.ticket.status === 'Resolved' ? (
                  <>
                    <CheckCircle2 size={16} color="var(--emerald-600)" />
                    <span>This inquiry has been marked as <strong>Resolved</strong> by BookLeaf Operations. You can reply below anytime if you need more help.</span>
                  </>
                ) : activeTicketData.ticket.status === 'In Progress' ? (
                  <>
                    <Clock size={16} color="var(--purple-600)" />
                    <span>Active Investigation — BookLeaf specialist is actively working with production/distribution desks.</span>
                  </>
                ) : (
                  <>
                    <Info size={16} color="var(--blue-600)" />
                    <span>Query Received — BookLeaf operations team is triaging your request.</span>
                  </>
                )}
              </div>

              {/* Message History Feed */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: '#ffffff' }}>
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
                        padding: '18px 22px',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                    >
                      {/* Sender Tag */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '10px' }}>
                        {isAdmin ? (
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: 'var(--blue-100)',
                            color: 'var(--blue-700)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Shield size={14} />
                          </div>
                        ) : (
                          <div style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '50%',
                            background: 'var(--emerald-100)',
                            color: 'var(--emerald-800)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.72rem'
                          }}>
                            {m.sender_name?.charAt(0) || 'A'}
                          </div>
                        )}

                        <div>
                          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: isAdmin ? 'var(--blue-700)' : 'var(--emerald-900)' }}>
                            {isAdmin ? `${m.sender_name} (BookLeaf Operations)` : m.sender_name}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(m.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div style={{ fontSize: '0.94rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                        {m.message}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Author Multi-Line Reply Composer */}
              <form onSubmit={handleSendReply} style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-subtle)',
                background: 'var(--bg-canvas)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <textarea
                  rows={3}
                  placeholder="Type your response, clarification, or follow-up question here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                      handleSendReply(e);
                    }
                  }}
                  style={{
                    width: '100%',
                    fontSize: '0.92rem',
                    lineHeight: 1.55,
                    resize: 'vertical',
                    background: '#ffffff'
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  {/* File Attachment Support (UI requirement) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: '#ffffff',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <Paperclip size={13} color="var(--emerald-700)" />
                      <span>{attachmentName || 'Attach File / Photo (optional)'}</span>
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setAttachmentName(e.target.files[0].name);
                          }
                        }}
                      />
                    </label>

                    {attachmentName && (
                      <button
                        type="button"
                        onClick={() => setAttachmentName('')}
                        style={{ fontSize: '0.72rem', color: 'var(--rose-700)', fontWeight: 600 }}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Press <strong>Ctrl + Enter</strong> to send
                    </span>
                    <button
                      type="submit"
                      disabled={isSending || !replyText.trim()}
                      className="btn-primary"
                      style={{ padding: '9px 22px', fontSize: '0.88rem', fontWeight: 700 }}
                    >
                      <Send size={15} />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: '#ffffff' }}>
              Select a ticket on the left to view the conversation.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
