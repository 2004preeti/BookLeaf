// server/routes/tickets.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const AIService = require('../services/aiService');
const { broadcastEvent } = require('../services/wsService');

// Helper to generate sequential ticket numbers
function generateTicketNumber() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM tickets').get();
  const nextNum = 1000 + countRow.count + 1;
  return `TICK-${nextNum}`;
}

// GET /api/tickets - List tickets with filtering, search, and sorting
router.get('/', authenticateToken, (req, res) => {
  const { status, category, priority, search, sort = 'urgency' } = req.query;

  let query = `
    SELECT 
      t.*,
      u.name as author_name,
      u.email as author_email,
      b.title as book_title,
      b.status as book_status,
      (SELECT COUNT(*) FROM ticket_messages tm WHERE tm.ticket_id = t.id AND (tm.is_internal_note = 0 OR ? = 'admin')) as message_count,
      (SELECT MAX(created_at) FROM ticket_messages tm WHERE tm.ticket_id = t.id) as last_activity_at
    FROM tickets t
    JOIN users u ON t.author_id = u.author_id
    LEFT JOIN books b ON t.book_id = b.book_id
    WHERE 1=1
  `;

  const params = [req.user.role];

  // RBAC: Authors only see their own tickets
  if (req.user.role === 'author') {
    query += ` AND t.author_id = ?`;
    params.push(req.user.author_id);
  }

  // Admin filter params
  if (status && status !== 'All') {
    query += ` AND t.status = ?`;
    params.push(status);
  }

  if (category && category !== 'All') {
    query += ` AND t.category = ?`;
    params.push(category);
  }

  if (priority && priority !== 'All') {
    query += ` AND t.priority = ?`;
    params.push(priority);
  }

  if (search && search.trim() !== '') {
    const s = `%${search.trim().toLowerCase()}%`;
    query += ` AND (LOWER(t.ticket_number) LIKE ? OR LOWER(t.subject) LIKE ? OR LOWER(t.description) LIKE ? OR LOWER(u.name) LIKE ? OR LOWER(IFNULL(b.title, '')) LIKE ?)`;
    params.push(s, s, s, s, s);
  }

  // Sorting
  if (sort === 'oldest') {
    query += ` ORDER BY t.created_at ASC`;
  } else if (sort === 'newest') {
    query += ` ORDER BY t.created_at DESC`;
  } else {
    // 'urgency' default: Critical > High > Medium > Low, then oldest unresolved first
    query += ` 
      ORDER BY 
        CASE t.status WHEN 'Open' THEN 1 WHEN 'In Progress' THEN 2 WHEN 'Resolved' THEN 3 WHEN 'Closed' THEN 4 END ASC,
        CASE t.priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 WHEN 'Low' THEN 4 END ASC,
        t.created_at ASC
    `;
  }

  const tickets = db.prepare(query).all(...params);

  // Add computed urgency flags
  const now = Date.now();
  const enriched = tickets.map(t => {
    const ageHours = (now - new Date(t.created_at).getTime()) / (1000 * 3600);
    return {
      ...t,
      age_hours: Math.round(ageHours),
      is_overdue_24h: ageHours > 24 && (t.status === 'Open' || t.status === 'In Progress'),
      category_overridden: t.category !== t.ai_category,
      priority_overridden: t.priority !== t.ai_priority
    };
  });

  res.json({ tickets: enriched });
});

// GET /api/tickets/:id - Detailed view of single ticket with thread messages
router.get('/:id', authenticateToken, (req, res) => {
  const ticket = db.prepare(`
    SELECT t.*, u.name as author_name, u.email as author_email, u.phone as author_phone, u.city as author_city, u.joined_date as author_joined_date
    FROM tickets t
    JOIN users u ON t.author_id = u.author_id
    WHERE t.id = ? OR t.ticket_number = ?
  `).get(req.params.id, req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  // Author can only see their own ticket
  if (req.user.role === 'author' && ticket.author_id !== req.user.author_id) {
    return res.status(403).json({ error: 'Access denied. You do not own this ticket.' });
  }

  // Associated book if exists
  let book = null;
  if (ticket.book_id && ticket.book_id !== 'GENERAL') {
    book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(ticket.book_id);
    if (book && book.available_on) {
      book.available_on = JSON.parse(book.available_on);
    }
  }

  // Fetch messages thread
  let messagesQuery = `SELECT * FROM ticket_messages WHERE ticket_id = ?`;
  const msgParams = [ticket.id];

  // RBAC: Authors MUST NOT see internal admin notes!
  if (req.user.role === 'author') {
    messagesQuery += ` AND is_internal_note = 0`;
  }
  messagesQuery += ` ORDER BY created_at ASC`;

  const messages = db.prepare(messagesQuery).all(...msgParams);

  res.json({
    ticket: {
      ...ticket,
      category_overridden: ticket.category !== ticket.ai_category,
      priority_overridden: ticket.priority !== ticket.ai_priority
    },
    book,
    messages
  });
});

// POST /api/tickets - Create a new support ticket (Author)
router.post('/', authenticateToken, async (req, res) => {
  const { book_id, subject, description, attachment_name } = req.body;

  if (!subject || !description) {
    return res.status(400).json({ error: 'Subject and detailed description are required.' });
  }

  const authorId = req.user.author_id;
  const author = db.prepare('SELECT * FROM users WHERE author_id = ?').get(authorId);

  let book = null;
  if (book_id && book_id !== 'GENERAL') {
    book = db.prepare('SELECT * FROM books WHERE book_id = ? AND author_id = ?').get(book_id, authorId);
  }

  try {
    // 1. AI Auto-Classification & Priority Scoring
    const aiClassification = await AIService.classifyAndPrioritize(subject, description, book, author);

    // 2. AI Pre-Drafted Response based on Knowledge Base
    const aiDraft = await AIService.generateDraftResponse({
      subject,
      description,
      category: aiClassification.category,
      author,
      book
    });

    const ticketNumber = generateTicketNumber();

    // 3. Save ticket to database
    const insertTicket = db.prepare(`
      INSERT INTO tickets (
        ticket_number, author_id, book_id, category, ai_category, priority, ai_priority,
        status, subject, description, attachment_name, assigned_to, ai_draft_response, ai_reasoning,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Open', ?, ?, ?, NULL, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const result = insertTicket.run(
      ticketNumber,
      authorId,
      book ? book.book_id : 'GENERAL',
      aiClassification.category,
      aiClassification.category,
      aiClassification.priority,
      aiClassification.priority,
      subject,
      description,
      attachment_name || null,
      aiDraft.draft,
      `${aiClassification.reasoning} | ${aiDraft.reasoning}`
    );

    const ticketId = result.lastInsertRowid;

    // 4. Save initial query into messages thread
    db.prepare(`
      INSERT INTO ticket_messages (ticket_id, sender_id, sender_name, sender_role, message, is_internal_note, created_at)
      VALUES (?, ?, ?, 'author', ?, 0, CURRENT_TIMESTAMP)
    `).run(ticketId, authorId, author.name, description);

    // 5. Log AI operation
    db.prepare(`
      INSERT INTO ai_logs (ticket_id, action_type, model_used, prompt_tokens, completion_tokens, latency_ms)
      VALUES (?, 'triage_and_draft', ?, ?, ?, ?)
    `).run(ticketId, aiClassification.modelUsed, aiClassification.promptTokens + aiDraft.promptTokens, aiClassification.completionTokens + aiDraft.completionTokens, aiClassification.latencyMs + aiDraft.latencyMs);

    const createdTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);

    // 6. Broadcast live event to all connected author & admin clients
    broadcastEvent('ticket_created', {
      ticket: createdTicket,
      author_name: author.name,
      book_title: book ? book.title : 'General / Account Level'
    });

    res.status(201).json({
      message: 'Ticket created successfully.',
      ticket: createdTicket
    });
  } catch (err) {
    console.error('Error creating ticket:', err);
    res.status(500).json({ error: 'Failed to create support ticket. Please try again.' });
  }
});

// POST /api/tickets/:id/messages - Post reply or internal note
router.post('/:id/messages', authenticateToken, (req, res) => {
  const { message, is_internal_note = false, update_status } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message content cannot be empty.' });
  }

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  // Author RBAC
  if (req.user.role === 'author' && ticket.author_id !== req.user.author_id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  // Authors cannot post internal notes
  const isInternal = req.user.role === 'admin' ? (Boolean(is_internal_note) ? 1 : 0) : 0;

  // Insert message
  const insert = db.prepare(`
    INSERT INTO ticket_messages (ticket_id, sender_id, sender_name, sender_role, message, is_internal_note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  const msgResult = insert.run(
    ticket.id,
    req.user.author_id || req.user.id.toString(),
    req.user.name,
    req.user.role,
    message.trim(),
    isInternal
  );

  // If author replied and ticket was closed/resolved, reopen to 'In Progress'
  let newStatus = ticket.status;
  if (req.user.role === 'author' && (ticket.status === 'Resolved' || ticket.status === 'Closed')) {
    newStatus = 'In Progress';
  } else if (req.user.role === 'admin' && update_status) {
    newStatus = update_status;
  } else if (req.user.role === 'admin' && !isInternal && ticket.status === 'Open') {
    newStatus = 'In Progress';
  }

  db.prepare('UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newStatus, ticket.id);

  const createdMessage = db.prepare('SELECT * FROM ticket_messages WHERE id = ?').get(msgResult.lastInsertRowid);

  // Broadcast event in real-time
  broadcastEvent('new_message', {
    ticket_id: ticket.id,
    ticket_number: ticket.ticket_number,
    message: createdMessage,
    ticket_status: newStatus
  });

  res.status(201).json({
    message: createdMessage,
    ticket_status: newStatus
  });
});

// PATCH /api/tickets/:id - Admin updates status, overrides category/priority, assigns ticket
router.patch('/:id', authenticateToken, requireAdmin, (req, res) => {
  const { status, category, priority, assigned_to } = req.body;
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(req.params.id);

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  const updates = [];
  const params = [];

  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    params.push(category);
  }
  if (priority !== undefined) {
    updates.push('priority = ?');
    params.push(priority);
  }
  if (assigned_to !== undefined) {
    updates.push('assigned_to = ?');
    params.push(assigned_to);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields provided to update.' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(ticket.id);

  const sql = `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...params);

  const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticket.id);

  broadcastEvent('ticket_updated', {
    ticket: updatedTicket
  });

  res.json({
    message: 'Ticket updated successfully.',
    ticket: updatedTicket
  });
});

module.exports = router;
