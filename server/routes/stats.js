// server/routes/stats.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/stats/dashboard - High-level metrics for admin ops
router.get('/dashboard', authenticateToken, requireAdmin, (req, res) => {
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count
    FROM tickets
    GROUP BY status
  `).all();

  const priorityCounts = db.prepare(`
    SELECT priority, COUNT(*) as count
    FROM tickets
    GROUP BY priority
  `).all();

  const categoryCounts = db.prepare(`
    SELECT category, COUNT(*) as count
    FROM tickets
    GROUP BY category
    ORDER BY count DESC
  `).all();

  const totalTickets = db.prepare('SELECT COUNT(*) as count FROM tickets').get().count;
  const criticalOpen = db.prepare(`
    SELECT COUNT(*) as count FROM tickets 
    WHERE priority = 'Critical' AND status IN ('Open', 'In Progress')
  `).get().count;

  const overdueTickets = db.prepare(`
    SELECT COUNT(*) as count FROM tickets 
    WHERE status IN ('Open', 'In Progress') 
    AND (strftime('%s', 'now') - strftime('%s', created_at)) > 86400
  `).get().count;

  const totalAuthors = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'author'").get().count;
  const totalBooks = db.prepare('SELECT COUNT(*) as count FROM books').get().count;

  // Format into convenient structure
  const stats = {
    overview: {
      total_tickets: totalTickets,
      open_tickets: (statusCounts.find(s => s.status === 'Open')?.count) || 0,
      in_progress: (statusCounts.find(s => s.status === 'In Progress')?.count) || 0,
      resolved: (statusCounts.find(s => s.status === 'Resolved')?.count) || 0,
      closed: (statusCounts.find(s => s.status === 'Closed')?.count) || 0,
      critical_active: criticalOpen,
      overdue_count: overdueTickets,
      total_authors: totalAuthors,
      total_books: totalBooks
    },
    by_category: categoryCounts,
    by_priority: priorityCounts
  };

  res.json({ stats });
});

module.exports = router;
