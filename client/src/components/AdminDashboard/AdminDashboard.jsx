// client/src/components/AdminDashboard/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useWs } from '../../context/WsContext';
import { MetricsBar } from './MetricsBar';
import { TicketQueue } from './TicketQueue';
import { TicketWorkbench } from './TicketWorkbench';

export function AdminDashboard() {
  const { lastEvent } = useWs();
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('urgency');

  // Fetch Dashboard Statistics
  const fetchStats = () => {
    fetch('/api/stats/dashboard', {
      headers: { Authorization: `Bearer ${localStorage.getItem('bookleaf_token')}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.stats) setStats(data.stats);
      })
      .catch(err => console.error('Failed to load stats:', err));
  };

  // Fetch Tickets matching filters
  const fetchTickets = () => {
    const params = new URLSearchParams();
    if (statusFilter !== 'All') params.append('status', statusFilter);
    if (categoryFilter !== 'All') params.append('category', categoryFilter);
    if (priorityFilter !== 'All') params.append('priority', priorityFilter);
    if (searchTerm) params.append('search', searchTerm);
    params.append('sort', sortBy);

    fetch(`/api/tickets?${params.toString()}`, {
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
      .catch(err => console.error('Failed to load tickets:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
    fetchTickets();
  }, [statusFilter, categoryFilter, priorityFilter, searchTerm, sortBy]);

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'ticket_created' || lastEvent.type === 'ticket_updated' || lastEvent.type === 'new_message') {
      fetchStats();
      fetchTickets();
    }
  }, [lastEvent]);

  const handleTicketUpdated = (updatedTicket) => {
    fetchStats();
    setTickets(prev => prev.map(t => (t.id === updatedTicket.id ? { ...t, ...updatedTicket } : t)));
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* 1. Ops Metrics Pulse Bar */}
      <MetricsBar stats={stats} />

      {/* 2. Operations Split Workspace */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '440px 1fr',
        gap: '20px',
        height: 'calc(100vh - 220px)',
        minHeight: '650px'
      }}>
        {/* Left Column: Filterable Ticket Queue */}
        <TicketQueue
          tickets={tickets}
          selectedTicketId={selectedTicketId}
          onSelectTicket={setSelectedTicketId}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        {/* Right Column: Ticket Workbench & AI Draft Studio */}
        <TicketWorkbench
          ticketId={selectedTicketId}
          onTicketUpdated={handleTicketUpdated}
        />
      </div>
    </div>
  );
}
