// server/routes/ai.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const AIService = require('../services/aiService');
const { BOOKLEAF_KNOWLEDGE_BASE } = require('../knowledgeBase');

// POST /api/ai/regenerate-draft - Admin regenerates draft with optional custom guidance
router.post('/regenerate-draft', authenticateToken, requireAdmin, async (req, res) => {
  const { ticket_id, custom_instruction, category_override } = req.body;

  if (!ticket_id) {
    return res.status(400).json({ error: 'ticket_id is required.' });
  }

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticket_id);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found.' });
  }

  const author = db.prepare('SELECT * FROM users WHERE author_id = ?').get(ticket.author_id);
  let book = null;
  if (ticket.book_id && ticket.book_id !== 'GENERAL') {
    book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(ticket.book_id);
  }

  const category = category_override || ticket.category;

  try {
    const aiResult = await AIService.generateDraftResponse({
      subject: ticket.subject,
      description: ticket.description,
      category,
      author,
      book,
      customAdminInstruction: custom_instruction || ''
    });

    // Update ticket with new draft
    db.prepare(`
      UPDATE tickets 
      SET ai_draft_response = ?, ai_reasoning = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(aiResult.draft, `${aiResult.reasoning} ${custom_instruction ? `[Admin Instruction: ${custom_instruction}]` : ''}`, ticket.id);

    // Log AI usage
    db.prepare(`
      INSERT INTO ai_logs (ticket_id, action_type, model_used, prompt_tokens, completion_tokens, latency_ms)
      VALUES (?, 'regenerate_draft', ?, ?, ?, ?)
    `).run(ticket.id, aiResult.modelUsed, aiResult.promptTokens, aiResult.completionTokens, aiResult.latencyMs);

    res.json({
      draft: aiResult.draft,
      reasoning: aiResult.reasoning,
      model_used: aiResult.modelUsed,
      tokens: {
        prompt: aiResult.promptTokens,
        completion: aiResult.completionTokens
      },
      latency_ms: aiResult.latencyMs,
      knowledge_base_cited: aiResult.knowledgeBaseCited
    });
  } catch (err) {
    console.error('Error regenerating AI draft:', err);
    res.status(500).json({ error: 'Failed to generate AI response draft.' });
  }
});

// POST /api/ai/test-classify - Interactive playground for reviewers to test any custom author query
router.post('/test-classify', authenticateToken, async (req, res) => {
  const { subject, description, book_id } = req.body;

  if (!subject || !description) {
    return res.status(400).json({ error: 'Subject and description are required.' });
  }

  let book = null;
  if (book_id) {
    book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(book_id);
  }

  try {
    const classification = await AIService.classifyAndPrioritize(subject, description, book);
    const draft = await AIService.generateDraftResponse({
      subject,
      description,
      category: classification.category,
      book
    });

    res.json({
      category: classification.category,
      priority: classification.priority,
      reasoning: classification.reasoning,
      draft: draft.draft,
      model_used: classification.modelUsed,
      latency_ms: classification.latencyMs + draft.latencyMs
    });
  } catch (err) {
    res.status(500).json({ error: 'Classification test failed.' });
  }
});

// GET /api/ai/knowledge-base - Exposes full structured knowledge base for inspectability in frontend
router.get('/knowledge-base', authenticateToken, (req, res) => {
  res.json({ knowledge_base: BOOKLEAF_KNOWLEDGE_BASE });
});

module.exports = router;
