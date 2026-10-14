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
  FileText,
  Check,
  Zap,
  MessageSquare,
  CornerDownRight,
  Bookmark
} from 'lucide-react';

export function TicketWorkbench({ ticketId, onTicketUpdated }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [nextStatus, setNextStatus] = useState('In Progress');
  const [isSending, setIsSending] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [customGuidance, setCustomGuidance] = useState('');
  const [showRegenModal, setShowRegenModal] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Quick Canned Response Templates based on BookLeaf operational policies
  const cannedTemplates = [
    {
      label: 'Royalty Cycle & 80/20 SLA',
      category: 'Royalty & Payments',
      text: `Dear ${data?.ticket?.author_name || 'Author'},\n\nThank you for reaching out to BookLeaf Publishing. We completely understand how important royalty clarity is to you.\n\nAs per BookLeaf's royalty policy, payouts follow an 80/20 net profit split (80% net profit to the author, calculated as MRP minus printing cost, marketplace commission, and shipping). Royalties are calculated quarterly and disbursed within 45 days of the quarter ending via bank transfer, subject to the ₹1,000 threshold.\n\nWe are actively reviewing your sales statement and will share a detailed platform-wise breakdown with you within 48 hours.\n\nWarm regards,\nBookLeaf Operations Team`
    },
    {
      label: 'Stock Sync Lag (Amazon/Flipkart)',
      category: 'Distribution & Availability',
      text: `Dear ${data?.ticket?.author_name || 'Author'},\n\nThank you for bringing this to our attention. We understand how frustrating it is when your book shows as "Currently Unavailable" on retail platforms.\n\nThis is typically caused by automated marketplace catalog sync lags between our distributor feeds and Amazon/Flipkart's local fulfillment nodes. Our distribution desk has triggered an expedited re-sync directly with the marketplace catalog team. Your listing will reflect active stock within 24 to 48 hours.\n\nWe will monitor the listing and update you as soon as it goes live.\n\nBest regards,\nBookLeaf Operations Team`
    },
    {
      label: 'Print Quality & Free Reprint',
      category: 'Printing & Quality',
      text: `Dear ${data?.ticket?.author_name || 'Author'},\n\nWe sincerely apologize for the quality issue you experienced with your author copies. Authors are our creative partners, and delivering book printing of the highest standard is our primary responsibility.\n\nPlease share clear photos of the defective copies (showing the cover, binding, or misprinted pages). Once verified by our print quality team, BookLeaf will immediately arrange a complimentary reprint and dispatch it to your registered address within 5–7 business days at no charge.\n\nThank you for your patience while we make this right.\n\nWarm regards,\nBookLeaf Production Desk`
    },
    {
      label: 'Production Pipeline Update',
      category: 'Book Status & Production Updates',
      text: `Dear ${data?.ticket?.author_name || 'Author'},\n\nThank you for following up on your book's publication progress. Every manuscript goes through our structured production workflow: Manuscript Received → Typesetting → Proofreading → ISBN Assignment → Printing → Distribution Setup.\n\nOur team is currently finalizing your layout and typesetting proofs. We expect to share the digital proofs for your review within 3–4 business days. As soon as you approve them, we will proceed immediately to ISBN registration.\n\nWarm regards,\nBookLeaf Editorial & Production Team`
    }
  ];

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
        if (!replyMessage && d.ticket.ai_draft_response) {
          setReplyMessage(d.ticket.ai_draft_response);
        }
        if (d.ticket.status === 'Open') {
          setNextStatus('In Progress');
        } else {
          setNextStatus(d.ticket.status);
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
    if (e) e.preventDefault();
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
          update_status: isInternalNote ? undefined : nextStatus
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

  // Direct One-Click Send AI Draft
  const handleDirectSendDraft = () => {
    if (!ticket.ai_draft_response) return;
    setReplyMessage(ticket.ai_draft_response);
    setIsInternalNote(false);
    setTimeout(() => {
      handleSendMessage();
    }, 50);
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

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(ticket.ai_draft_response);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
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
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: 'var(--emerald-700)' }}>
            {ticket.ticket_number}
          </span>

          {/* Status Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {['Open', 'In Progress', 'Resolved', 'Closed'].map(s => {
              const isSelected = ticket.status === s;
              return (
                <button
                  key={s}
                  onClick={() => handleUpdateStatus(s)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: isSelected ? 'var(--emerald-50)' : '#ffffff',
                    color: isSelected ? 'var(--emerald-800)' : 'var(--text-muted)',
                    border: isSelected ? '1px solid var(--emerald-600)' : '1px solid var(--border-subtle)',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Assignment Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Assigned: <strong style={{ color: 'var(--text-main)', fontWeight: 700 }}>{ticket.assigned_to || 'Unassigned'}</strong>
          </span>
          <button
            onClick={handleAssignToMe}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.78rem' }}
          >
            <Shield size={13} color="var(--blue-600)" />
            <span>Assign to Me</span>
          </button>
        </div>
      </div>

      {/* 2. Middle Body: Split into Workbench Columns */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 350px', overflow: 'hidden' }}>
        {/* Left Sub-Column: Query, Messages Thread & Response Studio */}
        <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-subtle)', overflowY: 'auto', padding: '24px 28px', background: '#ffffff' }}>
          
          {/* Ticket Subject & Original Query Header */}
          <div style={{ marginBottom: '22px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className="badge badge-category" style={{ fontSize: '0.75rem' }}>
                {ticket.category}
              </span>
              <span className={`badge ${ticket.priority === 'Critical' ? 'badge-critical' : ticket.priority === 'High' ? 'badge-high' : 'badge-low'}`} style={{ fontSize: '0.72rem' }}>
                {ticket.priority} Priority
              </span>
            </div>

            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', fontWeight: 800, marginBottom: '8px', lineHeight: 1.35 }}>
              {ticket.subject}
            </h2>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span>Submitted by <strong style={{ color: 'var(--text-main)' }}>{ticket.author_name}</strong></span>
              <span>•</span>
              <span>{new Date(ticket.created_at).toLocaleString()}</span>
              {ticket.attachment_name && (
                <>
                  <span>•</span>
                  <span style={{ color: 'var(--blue-700)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                    <Paperclip size={13} /> {ticket.attachment_name}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* ✨ ENHANCED AI COPILOT RESPONSE CARD ✨ */}
          <div style={{
            background: 'linear-gradient(135deg, #f5f3ff 0%, #eef2ff 100%)',
            border: '1px solid #c7d2fe',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 22px',
            marginBottom: '26px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {/* AI Top Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <div style={{
                  padding: '6px',
                  borderRadius: '8px',
                  background: 'var(--indigo-100)',
                  color: 'var(--indigo-800)',
                  display: 'flex'
                }}>
                  <Sparkles size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--indigo-900)' }}>
                    BookLeaf AI Copilot Response Draft
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--indigo-700)', fontWeight: 600 }}>
                    Grounded in official Knowledge Base & Tone Policies
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handleCopyDraft}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.76rem', background: '#ffffff' }}
                  title="Copy draft to clipboard"
                >
                  {copiedDraft ? <Check size={13} color="var(--indigo-700)" /> : <Copy size={13} />}
                  <span>{copiedDraft ? 'Copied' : 'Copy'}</span>
                </button>

                <button
                  onClick={() => setShowRegenModal(true)}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.76rem', background: '#ffffff' }}
                  title="Regenerate draft with custom guidance"
                >
                  <RotateCcw size={13} />
                  <span>Regenerate</span>
                </button>

                <button
                  onClick={() => setReplyMessage(ticket.ai_draft_response)}
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.76rem', borderColor: 'var(--indigo-600)', color: 'var(--indigo-800)', fontWeight: 700, background: '#ffffff' }}
                  title="Insert this draft into reply editor"
                >
                  <CornerDownRight size={13} />
                  <span>Apply to Editor</span>
                </button>

                <button
                  onClick={handleDirectSendDraft}
                  disabled={isSending}
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.76rem', fontWeight: 700 }}
                  title="Directly send AI draft to author"
                >
                  <Zap size={13} />
                  <span>Quick Send</span>
                </button>
              </div>
            </div>

            {/* AI Policy Reasoning Badge */}
            {ticket.ai_reasoning && (
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--indigo-900)',
                marginBottom: '12px',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.85)',
                border: '1px solid #c7d2fe',
                borderRadius: '8px',
                lineHeight: 1.45
              }}>
                <strong style={{ color: 'var(--indigo-800)' }}>Policy Match & Reasoning:</strong> {ticket.ai_reasoning}
              </div>
            )}

            {/* Draft Preview Box with Clear Formatting */}
            <div style={{
              fontSize: '0.9rem',
              color: 'var(--text-main)',
              whiteSpace: 'pre-wrap',
              maxHeight: '220px',
              overflowY: 'auto',
              background: '#ffffff',
              padding: '16px 18px',
              borderRadius: '10px',
              lineHeight: 1.65,
              border: '1px solid #a7f3d0',
              boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.02)'
            }}>
              {ticket.ai_draft_response}
            </div>
          </div>

          {/* Conversation Stream & Activity Notes */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
                Conversation History & Notes ({messages.length})
              </h4>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Author can see public replies only
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                        ? '1px dashed rgba(217, 119, 6, 0.6)'
                        : isAdmin
                        ? '1px solid var(--border-subtle)'
                        : '1px solid #a7f3d0',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px 20px',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isInternal ? (
                          <span style={{ color: 'var(--amber-700)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 800 }}>
                            <Lock size={13} /> INTERNAL OPERATIONS NOTE (HIDDEN FROM AUTHOR)
                          </span>
                        ) : isAdmin ? (
                          <span style={{ color: 'var(--blue-700)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 700 }}>
                            <Shield size={13} /> {m.sender_name} (Support Operations)
                          </span>
                        ) : (
                          <span style={{ color: 'var(--emerald-800)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', fontWeight: 700 }}>
                            <User size={13} /> {m.sender_name} (Author)
                          </span>
                        )}
                      </div>

                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(m.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.92rem', color: 'var(--text-main)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Canned Response Pills Bar */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Bookmark size={13} color="var(--text-muted)" />
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Insert Policy Canned Response:
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {cannedTemplates.map((template, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReplyMessage(template.text)}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  title="Click to populate composer with this standard response"
                >
                  + {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Reply & Internal Note Composer Studio */}
          <form onSubmit={handleSendMessage} style={{
            background: 'var(--bg-canvas)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            marginTop: 'auto',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              {/* Internal Note vs Public Reply Toggle Pills */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsInternalNote(false)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: !isInternalNote ? '#ffffff' : 'transparent',
                    color: !isInternalNote ? 'var(--emerald-800)' : 'var(--text-muted)',
                    border: !isInternalNote ? '1px solid var(--emerald-600)' : '1px solid transparent',
                    boxShadow: !isInternalNote ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <Send size={13} style={{ display: 'inline', marginRight: '5px' }} /> Public Author Reply
                </button>

                <button
                  type="button"
                  onClick={() => setIsInternalNote(true)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: isInternalNote ? 'var(--amber-50)' : 'transparent',
                    color: isInternalNote ? 'var(--amber-700)' : 'var(--text-muted)',
                    border: isInternalNote ? '1px solid var(--amber-600)' : '1px solid transparent',
                    boxShadow: isInternalNote ? 'var(--shadow-sm)' : 'none'
                  }}
                >
                  <Lock size={13} style={{ display: 'inline', marginRight: '5px' }} /> Private Internal Note
                </button>
              </div>

              <span style={{ fontSize: '0.74rem', color: isInternalNote ? 'var(--amber-700)' : 'var(--emerald-700)', fontWeight: 700 }}>
                {isInternalNote ? '🔒 Private (Visible to Ops Staff Only)' : '✉ Real-Time Author Notification'}
              </span>
            </div>

            <textarea
              rows={5}
              placeholder={isInternalNote ? "Add private internal note (e.g. escalated to Repro India printing desk, tracking ref #FK-882)..." : "Draft your response to the author (or edit AI-drafted reply above)..."}
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              style={{ width: '100%', resize: 'vertical', fontSize: '0.92rem', lineHeight: 1.6 }}
              required
            />

            {/* Composer Footer Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginTop: '12px', flexWrap: 'wrap' }}>
              {!isInternalNote ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    Update Status On Send:
                  </span>
                  <select
                    value={nextStatus}
                    onChange={(e) => setNextStatus(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                    <option value="Open">Keep as Open</option>
                  </select>
                </div>
              ) : <div />}

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={isSending || !replyMessage.trim()}
                  className={isInternalNote ? "btn-secondary" : "btn-primary"}
                  style={{ padding: '10px 22px', fontSize: '0.88rem', fontWeight: 700 }}
                >
                  {isSending ? (
                    <span>Sending...</span>
                  ) : isInternalNote ? (
                    <>
                      <Lock size={14} color="var(--amber-600)" />
                      <span>Save Private Note</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Response to Author</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right Sub-Column: Dossier & AI Triage Overrides */}
        <div style={{ padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', background: 'var(--bg-canvas)' }}>
          {/* AI Triage Controls (Category & Priority) */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
              <Sparkles size={16} color="var(--emerald-700)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                AI Classification & Triage
              </span>
            </div>

            {/* Category Override */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>Category:</span>
                {ticket.category !== ticket.ai_category && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--amber-700)', fontWeight: 800 }}>Overridden</span>
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
                AI Model Output: <em>{ticket.ai_category}</em>
              </div>
            </div>

            {/* Priority Override */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700 }}>Priority Score:</span>
                {ticket.priority !== ticket.ai_priority && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--amber-700)', fontWeight: 800 }}>Overridden</span>
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
                AI Model Output: <em>{ticket.ai_priority}</em>
              </div>
            </div>
          </div>

          {/* Author Dossier */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
              <User size={16} color="var(--emerald-700)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Author Profile Dossier
              </span>
            </div>

            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Name:</span>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.92rem' }}>{ticket.author_name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Email:</span>
                <div style={{ color: 'var(--blue-700)', fontWeight: 600 }}>{ticket.author_email}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Phone & City:</span>
                <div style={{ fontWeight: 500 }}>{ticket.author_phone || 'N/A'} • {ticket.author_city || 'N/A'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Joined BookLeaf:</span>
                <div style={{ fontWeight: 500 }}>{ticket.author_joined_date || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Book Dossier (if linked) */}
          <div style={{ background: '#ffffff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '14px' }}>
              <BookOpen size={16} color="var(--emerald-700)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Associated Title
              </span>
            </div>

            {book ? (
              <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Title:</span>
                  <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.92rem' }}>{book.title}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>ISBN Imprint:</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{book.isbn || 'Pending'}</div>
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
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                General account-level inquiry. Not tied to a specific title.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Regenerate Draft Guidance Modal */}
      {showRegenModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-main)' }}>
              Regenerate AI Response Draft
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
              Provide instructions to adjust the AI's tone, cite specific exceptions, or adjust operational commitments:
            </p>

            <textarea
              rows={4}
              placeholder="e.g. Acknowledge that the author's copy was misprinted, confirm immediate free reprint dispatch within 5 days, offer complimentary express delivery tracking..."
              value={customGuidance}
              onChange={(e) => setCustomGuidance(e.target.value)}
              style={{ width: '100%', marginBottom: '18px', fontSize: '0.88rem' }}
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
                {isRegenerating ? 'Drafting...' : 'Regenerate Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
