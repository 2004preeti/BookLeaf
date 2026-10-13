// client/src/components/AdminDashboard/TicketQueue.jsx
import React from 'react';
import { Search, Filter, AlertTriangle, ArrowUpDown, Clock, User, BookOpen, ChevronRight } from 'lucide-react';

export function TicketQueue({
  tickets,
  selectedTicketId,
  onSelectTicket,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  priorityFilter,
  setPriorityFilter,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy
}) {
  const categories = [
    'All',
    'Royalty & Payments',
    'ISBN & Metadata Issues',
    'Printing & Quality',
    'Distribution & Availability',
    'Book Status & Production Updates',
    'General Inquiry'
  ];

  const priorities = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Open', 'In Progress', 'Resolved', 'Closed'];

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Critical': return 'badge-critical';
      case 'High': return 'badge-high';
      case 'Medium': return 'badge-medium';
      case 'Low': return 'badge-low';
      default: return 'badge-low';
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
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Queue Header & Filters Toolbar */}
      <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255, 255, 255, 0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: '#fff' }}>Author Support Queue</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing {tickets.length} matching tickets
            </span>
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={12} /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '5px 10px', fontSize: '0.78rem' }}
            >
              <option value="urgency">Urgency (Critical First)</option>
              <option value="oldest">Oldest Unresolved</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search tickets by author, subject, book, or #ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '34px', fontSize: '0.85rem', padding: '8px 12px 8px 34px' }}
          />
        </div>

        {/* Filter Pills / Dropdowns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            {statuses.map(s => (
              <option key={s} value={s}>Status: {s}</option>
            ))}
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            {priorities.map(p => (
              <option key={p} value={p}>Priority: {p}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '0.78rem' }}
          >
            {categories.map(c => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {tickets.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No tickets match your active filter criteria.
          </div>
        ) : (
          tickets.map(t => {
            const isSelected = t.id === selectedTicketId;
            const isCritical = t.priority === 'Critical';

            return (
              <div
                key={t.id}
                onClick={() => onSelectTicket(t.id)}
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  border: isSelected
                    ? '1px solid var(--emerald-500)'
                    : isCritical && (t.status === 'Open' || t.status === 'In Progress')
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid var(--border-subtle)',
                  background: isSelected
                    ? 'rgba(16, 185, 129, 0.12)'
                    : isCritical && (t.status === 'Open' || t.status === 'In Progress')
                    ? 'rgba(239, 68, 68, 0.06)'
                    : 'rgba(255, 255, 255, 0.02)',
                  transition: 'all 0.15s'
                }}
              >
                {/* Row 1: Ticket Number, Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-400)' }}>
                      {t.ticket_number}
                    </span>
                    <span className={`badge ${getPriorityBadge(t.priority)}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      {t.priority}
                    </span>
                    {t.priority_overridden && (
                      <span title="Priority manually overridden by admin" style={{ fontSize: '0.65rem', color: '#fbbf24' }}>
                        ✎
                      </span>
                    )}
                  </div>

                  <span className={`badge ${getStatusBadge(t.status)}`} style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                    {t.status}
                  </span>
                </div>

                {/* Row 2: Subject */}
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff', marginBottom: '6px', lineHeight: 1.35 }}>
                  {t.subject}
                </div>

                {/* Row 3: Author & Book Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <User size={12} color="var(--text-muted)" />
                    {t.author_name}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                    <BookOpen size={12} />
                    {t.book_title || 'General Account'}
                  </span>
                </div>

                {/* Row 4: Footer - Category, Overdue notice, Age */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <span className="badge badge-category" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                    {t.category}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t.is_overdue_24h && (
                      <span style={{ color: '#f87171', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> &gt;{t.age_hours}h old
                      </span>
                    )}
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
