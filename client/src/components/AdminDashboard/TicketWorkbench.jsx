// client/src/components/AdminDashboard/TicketWorkbench.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Send,
  Lock,
  User,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Paperclip,
  Clock,
  Shield,
  FileText
} from 'lucide-react';

export function TicketWorkbench({ ticketId, onTicketUpdated }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customGuidance, setCustomGuidance] = useState('');
  const [showRegenModal, setShowRegenModal] = useState(false);

  // Fetch ticket details
  const fetchTicketDetails = () => {
    if (!ticketId) return;
    setLoading(true);
    fetch(`/api/tickets/${ticketId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}` }
    })
      .then(res => res.json())
      .then(d => {
        setData(d);
        // Pre-fill reply box with AI draft if reply box is currently empty
        if (!replyMessage && d.ticket.ai_draft_response) {
          setReplyMessage(d.ticket.ai_draft_response);
        }
      })
      .catch(err => console.error('Failed to load ticket:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [ticketId]);

  if (!ticketId) {
    return (
      <div className="glass-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: '#ffffff' }}>
        Select a ticket from the queue on the left to start processing.
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="glass-card" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff' }}>
        <div style={{ color: 'var(--emerald-700)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
          <Sparkles className="animate-spin" size={20} />
          <span>Loading ticket details & AI context...</span>
        </div>
      </div>
    );
  }

  const { ticket, book, messages } = data;

  // Handle status update
  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const resData = await res.json();
      if (res.ok) {
        setData(prev => ({ ...prev, ticket: resData.ticket }));
        onTicketUpdated(resData.ticket);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Handle Category Override
  const handleOverrideCategory = async (newCategory) => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}`
        },
        body: JSON.stringify({ category: newCategory })
      });
      const resData = await res.json();
      if (res.ok) {
        setData(prev => ({ ...prev, ticket: resData.ticket }));
        onTicketUpdated(resData.ticket);
      }
    } catch (err) {
      console.error('Failed to override category:', err);
    }
  };

  // Handle Priority Override
  const handleOverridePriority = async (newPriority) => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}`
        },
        body: JSON.stringify({ priority: newPriority })
      });
      const resData = await res.json();
      if (res.ok) {
        setData(prev => ({ ...prev, ticket: resData.ticket }));
        onTicketUpdated(resData.ticket);
      }
    } catch (err) {
      console.error('Failed to override priority:', err);
    }
  };

  // Handle Assignment
  const handleAssignToMe = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}`
        },
        body: JSON.stringify({ assigned_to: user?.name })
      });
      const resData = await res.json();
      if (res.ok) {
        setData(prev => ({ ...prev, ticket: resData.ticket }));
        onTicketUpdated(resData.ticket);
      }
    } catch (err) {
      console.error('Failed to assign ticket:', err);
    }
  };

  // Handle Send Message (Public Reply or Internal Note)
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}`
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
          is_internal_note: isInternalNote,
          update_status: isInternalNote ? undefined : (ticket.status === 'Open' ? 'In Progress' : undefined)
        })
      });

      const resData = await res.json();
      if (res.ok) {
        setReplyMessage('');
        setIsInternalNote(false);
        fetchTicketDetails();
        if (resData.ticket_status) {
          setData(prev => ({ ...prev, ticket: { ...prev.ticket, status: resData.ticket_status } }));
          onTicketUpdated({ ...ticket, status: resData.ticket_status });
        }
      }
    } catch (err) {
      console.error('Failed to post message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // Handle AI Draft Regeneration
  const handleRegenerateDraft = async () => {
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/ai/regenerate-draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}`
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          custom_instruction: customGuidance.trim() || undefined
        })
      });

      const resData = await res.json();
      if (res.ok && resData.draft) {
        setData(prev => ({
          ...prev,
          ticket: {
            ...prev.ticket,
            ai_draft_response: resData.draft,
            ai_reasoning: resData.reasoning || prev.ticket.ai_reasoning
          }
        }));
        setReplyMessage(resData.draft);
        setShowRegenModal(false);
        setCustomGuidance('');
      }
    } catch (err) {
      console.error('Failed to regenerate draft:', err);
    } finally {
      setIsRegenerating(false);
    }
  };

  const categories = [
    'Royalty & Payments',
    'ISBN & Metadata Issues',
    'Printing & Quality',
    'Distribution & Availability',
    'Book Status & Production Updates',
    'General Inquiry'
  ];

  const priorities = ['Critical', 'High', 'Medium', 'Low'];

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#ffffff' }}>
      {/* 1. Header Toolbar */}
      <div style={{
        padding: '16px 22px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.05rem', fontWeight: 800, color: 'var(--emerald-700)' }}>
            {ticket.ticket_number}
          </span>

          {/* Status Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => (
              <button
                key={s}
                onClick={() => handleUpdateStatus(s)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: ticket.status === s ? 'var(--emerald-50)' : '#ffffff',
                  color: ticket.status === s ? 'var(--emerald-800)' : 'var(--text-muted)',
                  border: ticket.status === s ? '1px solid var(--emerald-600)' : '1px solid var(--border-subtle)',
                  boxShadow: ticket.status === s ? 'var(--shadow-sm)' : 'none'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Assignment Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Assigned: <strong style={{ color: 'var(--text-main)' }}>{ticket.assigned_to || 'Unassigned'}</strong>
          </span>
          <button
            onClick={handleAssignToMe}
            className="btn-secondary"
            style={{ padding: '5px 12px', fontSize: '0.75rem' }}
          >
            <Shield size={13} color="var(--blue-600)" />
            <span>Assign to Me</span>
          </button>
        </div>
      </div>

      {/* 2. Middle Body: Split into Workbench Columns */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 340px', overflow: 'hidden' }}>
        {/* Left Sub-Column: Query, Messages Thread & Response Studio */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)', overflowY: 'auto', padding: '20px 24px', background: '#ffffff' }}>
          {/* Ticket Subject & Original Query */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '8px' }}>
              {ticket.subject}
            </h2>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>Submitted by <strong style={{ color: 'var(--text-main)' }}>{ticket.author_name}</strong></span>
              <span>•</span>
              <span>{new Date(ticket.created_at).toLocaleString()}</span>
              {ticket.attachment_name && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--blue-700)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Paperclip size={13} /> {ticket.attachment_name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* AI Auto-Generated Draft Recommendation Card */}
          <div style={{
            background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%)',
            border: '1px solid #a7f3d0',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            marginBottom: '22px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  padding: '5px',
                  borderRadius: '6px',
                  background: 'var(--emerald-100)',
                  color: 'var(--emerald-800)',
                  display: 'flex'
                }}>
                  <Sparkles size={16} />
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--emerald-900)' }}>
                  AI-Drafted Response (BookLeaf Knowledge Base Grounded)
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setShowRegenModal(true)}
                  className="btn-secondary"
                  style={{ padding: '5px 10px', fontSize: '0.74rem' }}
                  title="Regenerate draft with custom guidance"
                >
                  <RotateCcw size={12} /> Regenerate
                </button>
                <button
                  onClick={() => setReplyMessage(ticket.ai_draft_response)}
                  className="btn-secondary"
                  style={{ padding: '5px 12px', fontSize: '0.74rem', borderColor: 'var(--emerald-600)', color: 'var(--emerald-800)', fontWeight: 700 }}
                  title="Insert this draft into reply editor"
                >
                  <Copy size={12} /> Insert Draft
                </button>
              </div>
            </div>

            {/* AI Policy Reasoning */}
            {ticket.ai_reasoning && (
              <div style={{
                fontSize: '0.78rem',
                color: 'var(--emerald-900)',
                marginBottom: '10px',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid #a7f3d0',
                borderRadius: '6px',
                lineHeight: 1.45
              }}>
                <strong style={{ color: 'var(--emerald-800)' }}>Policy Match:</strong> {ticket.ai_reasoning}
              </div>
            )}

            {/* Draft Preview Snippet */}
            <div style={{
              fontSize: '0.88rem',
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap',
              maxHeight: '170px',
              overflowY: 'auto',
              background: '#ffffff',
              padding: '14px',
              borderRadius: '8px',
              lineHeight: 1.6,
              border: '1px solid #a7f3d0'
            }}>
              {ticket.ai_draft_response}
            </div>
          </div>

          {/* Conversation & Internal Notes Thread */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px', fontWeight: 700 }}>
              Activity Stream & Notes ({messages.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {messages.map(m => {
                const isInternal = m.is_internal_note === 1;
                const isAdmin = m.sender_role === 'admin';

                return (
                  <div
                    key={m.id}
                    style={{
                      background: isInternal
                        ? 'var(--amber-50)'
                        : isAdmin
                        ? 'var(--bg-subtle)'
                        : 'var(--emerald-50)',
                      border: isInternal
                        ? '1px dashed rgba(217, 119, 6, 0.5)'
                        : isAdmin
                        ? '1px solid var(--border-subtle)'
                        : '1px solid #a7f3d0',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px 16px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isInternal ? (
                          <span style={{ color: 'var(--amber-700)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                            <Lock size={12} /> INTERNAL OPS NOTE (HIDDEN FROM AUTHOR)
                          </span>
                        ) : isAdmin ? (
                          <span style={{ color: 'var(--blue-700)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            <Shield size={12} /> {m.sender_name} (Admin Response)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--emerald-800)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                            <User size={12} /> {m.sender_name} (Author Query)
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reply / Internal Note Composer */}
          <form onSubmit={handleSendMessage} style={{
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            marginTop: 'auto'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              {/* Internal Note vs Public Reply Toggle */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsInternalNote(false)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: !isInternalNote ? 'var(--emerald-50)' : 'transparent',
                    color: !isInternalNote ? 'var(--emerald-800)' : 'var(--text-muted)',
                    border: !isInternalNote ? '1px solid var(--emerald-600)' : '1px solid transparent'
                  }}
                >
                  <Send size={12} style={{ display: 'inline', marginRight: '4px' }} /> Public Author Reply
                </button>

                <button
                  type="button"
                  onClick={() => setIsInternalNote(true)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: isInternalNote ? 'var(--amber-50)' : 'transparent',
                    color: isInternalNote ? 'var(--amber-700)' : 'var(--text-muted)',
                    border: isInternalNote ? '1px solid var(--amber-600)' : '1px solid transparent'
                  }}
                >
                  <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Internal Note (Private)
                </button>
              </div>

              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {isInternalNote ? '🔒 Only visible to BookLeaf operations' : '✉ Sends live notification to author'}
              </span>
            </div>

            <textarea
              rows={4}
              placeholder={isInternalNote ? "Add internal note (e.g. escalated to Repro India printing desk, tracking ref #)..." : "Write response to author (or edit AI-drafted reply above)..."}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              style={{ width: '100%', resize: 'vertical', fontSize: '0.9rem' }}
              required
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="submit"
                disabled={isSending || !replyMessage.trim()}
                className={isInternalNote ? "btn-secondary" : "btn-primary"}
                style={{ padding: '9px 18px', fontSize: '0.84rem' }}
              >
                {isSending ? (
                  <span>Sending...</span>
                ) : isInternalNote ? (
                  <>
                    <Lock size={14} color="var(--amber-600)" />
                    <span>Save Internal Note</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Response to Author</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Sub-Column: Dossier & AI Triage Overrides */}
        <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', background: 'var(--bg-canvas)' }}>
          {/* AI Triage Controls (Category & Priority) */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <Sparkles size={16} color="var(--emerald-700)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                AI Classification & Triage
              </span>
            </div>

            {/* Category Override */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
                {ticket.category !== ticket.ai_category && (
                  <span style={{ fontSize: '0.68rem', color: 'var(--amber-700)', fontWeight: 700 }}>Overridden</span>
                )}
              </div>
              <select
                value={ticket.category}
                onChange={(e) => handleOverrideCategory(e.target.value)}
                style={{ width: '100%', fontSize: '0.82rem', padding: '7px 10px' }}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                Original AI: <em>{ticket.ai_category}</em>
              </div>
            </div>

            {/* Priority Override */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Priority Score:</span>
                {ticket.priority !== ticket.ai_priority && (
                  <span style={{ fontSize: '0.68rem', color: 'var(--amber-700)', fontWeight: 700 }}>Overridden</span>
                )}
              </div>
              <select
                value={ticket.priority}
                onChange={(e) => handleOverridePriority(e.target.value)}
                style={{ width: '100%', fontSize: '0.82rem', padding: '7px 10px' }}
              >
                {priorities.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                Original AI: <em>{ticket.ai_priority}</em>
              </div>
            </div>
          </div>

          {/* Author Dossier */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <User size={16} color="var(--emerald-700)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Author Profile
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Name:</span>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{ticket.author_name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Email:</span>
                <div style={{ color: 'var(--blue-700)', fontWeight: 600 }}>{ticket.author_email}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Phone & City:</span>
                <div>{ticket.author_phone || 'N/A'} • {ticket.author_city || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Joined:</span>
                <div>{ticket.author_joined_date || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Book Dossier (if linked) */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              <BookOpen size={16} color="var(--emerald-700)" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Associated Title
              </span>
            </div>

            {book ? (
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Title:</span>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{book.title}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ISBN:</span>
                  <div style={{ fontFamily: 'var(--font-mono)' }}>{book.isbn || 'Pending'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
                  <div>
                    <span className={`badge ${book.status === 'Published & Live' ? 'badge-resolved' : 'badge-inprogress'}`} style={{ fontSize: '0.68rem' }}>
                      {book.status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Copies Sold:</span>
                    <div style={{ fontWeight: 700 }}>{book.total_copies_sold}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>MRP:</span>
                    <div style={{ fontWeight: 700 }}>{book.mrp ? `₹${book.mrp}` : 'N/A'}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Royalty Paid:</span>
                    <div style={{ color: 'var(--blue-700)', fontWeight: 700 }}>₹{book.royalty_paid}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Pending:</span>
                    <div style={{ color: 'var(--amber-700)', fontWeight: 700 }}>₹{book.royalty_pending}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                General account-level inquiry (not book-specific).
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regenerate Draft Guidance Modal */}
      {showRegenModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
              Regenerate AI Response Draft
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Provide optional instructions to adjust tone, cite specific exceptions, or modify resolution commitments:
            </p>

            <textarea
              rows={4}
              placeholder="e.g. Note that we already initiated an emergency reprint, offer a 10% coupon, reassure author about upcoming catalog sync..."
              value={customGuidance}
              onChange={(e) => setCustomGuidance(e.target.value)}
              style={{ width: '100%', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowRegenModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleRegenerateDraft}
                disabled={isRegenerating}
                className="btn-primary"
              >
                {isRegenerating ? 'Drafting...' : 'Regenerate Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
