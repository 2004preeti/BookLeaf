// client/src/components/AuthorDashboard/SubmitTicketModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export function SubmitTicketModal({ isOpen, onClose, books, preselectedBookId, onTicketSubmitted }) {
  const [selectedBook, setSelectedBook] = useState(preselectedBookId || 'GENERAL');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // AI live prediction teaser
  const [predictedCategory, setPredictedCategory] = useState('');
  const [predictedPriority, setPredictedPriority] = useState('');

  useEffect(() => {
    if (preselectedBookId) {
      setSelectedBook(preselectedBookId);
    }
  }, [preselectedBookId]);

  // Dynamic live prediction indicator as user types
  useEffect(() => {
    const text = (subject + ' ' + description).toLowerCase();
    if (text.includes('royalt') || text.includes('payout') || text.includes('pay') || text.includes('threshold')) {
      setPredictedCategory('Royalty & Payments');
      setPredictedPriority(text.includes('never') || text.includes('months') ? 'High' : 'Medium');
    } else if (text.includes('isbn') || text.includes('barcode') || text.includes('wrong book')) {
      setPredictedCategory('ISBN & Metadata Issues');
      setPredictedPriority('Critical');
    } else if (text.includes('print') || text.includes('quality') || text.includes('blurry') || text.includes('binding')) {
      setPredictedCategory('Printing & Quality');
      setPredictedPriority('High');
    } else if (text.includes('amazon') || text.includes('unavailable') || text.includes('stock')) {
      setPredictedCategory('Distribution & Availability');
      setPredictedPriority('High');
    } else if (text.includes('typeset') || text.includes('proof') || text.includes('when will') || text.includes('status')) {
      setPredictedCategory('Book Status & Production Updates');
      setPredictedPriority('Medium');
    } else if (text.length > 10) {
      setPredictedCategory('General Inquiry');
      setPredictedPriority('Low');
    } else {
      setPredictedCategory('');
      setPredictedPriority('');
    }
  }, [subject, description]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError('Please provide both a subject line and description of your query.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}`
        },
        body: JSON.stringify({
          book_id: selectedBook,
          subject: subject.trim(),
          description: description.trim(),
          attachment_name: attachment ? attachment.name : null
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit ticket');
      }

      onTicketSubmitted(data.ticket);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content fade-in" style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--emerald-glow)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--emerald-400)'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Submit a Support Query</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Our operations team & AI assistant will review and respond promptly.
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '6px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem'
            }}>
              {error}
            </div>
          )}

          {/* Book Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
              Which book is this query about?
            </label>
            <select
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="GENERAL">General / Account Level (Not book-specific)</option>
              {books.map((b) => (
                <option key={b.book_id} value={b.book_id}>
                  {b.title} ({b.book_id} — {b.status})
                </option>
              ))}
            </select>
          </div>

          {/* Subject */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
              Subject Line
            </label>
            <input
              type="text"
              placeholder="e.g. Haven't received my pending Q3 royalties yet"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
              Detailed Description
            </label>
            <textarea
              rows={5}
              placeholder="Please provide full details, dates, or numbers so we can investigate accurately..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', resize: 'vertical' }}
              required
            />
          </div>

          {/* AI Live Assistant Preview Teaser */}
          {predictedCategory && (
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--emerald-400)" />
                <span style={{ color: 'var(--text-secondary)' }}>
                  AI Auto-Triage: Categorized as <strong style={{ color: '#fff' }}>{predictedCategory}</strong>
                </span>
              </div>
              <span className={`badge ${predictedPriority === 'Critical' ? 'badge-critical' : predictedPriority === 'High' ? 'badge-high' : 'badge-medium'}`}>
                {predictedPriority} Priority
              </span>
            </div>
          )}

          {/* File Attachment Support (UI with file picker & preview) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#e2e8f0' }}>
              Attach Supporting Files or Photos (Optional)
            </label>
            <div
              onClick={() => document.getElementById('ticket-file-input').click()}
              style={{
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.02)',
                transition: 'border-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--emerald-500)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
            >
              <input
                id="ticket-file-input"
                type="file"
                style={{ display: 'none' }}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setAttachment(e.target.files[0]);
                  }
                }}
              />
              {attachment ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--emerald-400)' }}>
                  <FileText size={18} />
                  <span style={{ fontWeight: 600 }}>{attachment.name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ({Math.round(attachment.size / 1024)} KB)
                  </span>
                </div>
              ) : (
                <div>
                  <Upload size={22} color="var(--text-muted)" style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Click to attach screenshots, misprint photos, or bank statements
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    PNG, JPG, PDF up to 10MB
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '10px'
          }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              {isSubmitting ? (
                <span>Submitting & AI Classifying...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Submit Ticket</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
