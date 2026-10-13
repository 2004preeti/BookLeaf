// server/routes/books.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/books - Get books for logged in author or all books for admin
router.get('/', authenticateToken, (req, res) => {
  let books = [];
  const authorFilter = req.query.author_id;

  if (req.user.role === 'admin') {
    if (authorFilter) {
      books = db.prepare('SELECT * FROM books WHERE author_id = ? ORDER BY publication_date DESC, id DESC').all(authorFilter);
    } else {
      books = db.prepare('SELECT * FROM books ORDER BY author_id ASC, id ASC').all();
    }
  } else {
    // Author role: STRICT RBAC - authors only see their own books
    books = db.prepare('SELECT * FROM books WHERE author_id = ? ORDER BY publication_date DESC, id DESC').all(req.user.author_id);
  }

  // Parse available_on JSON strings
  const formattedBooks = books.map(b => ({
    ...b,
    available_on: b.available_on ? JSON.parse(b.available_on) : []
  }));

  // Calculate aggregated earnings summary for the author
  const summary = formattedBooks.reduce(
    (acc, b) => {
      acc.total_copies_sold += b.total_copies_sold || 0;
      acc.total_royalty_earned += b.total_royalty_earned || 0;
      acc.royalty_paid += b.royalty_paid || 0;
      acc.royalty_pending += b.royalty_pending || 0;
      if (b.status === 'Published & Live') acc.published_count += 1;
      else acc.in_production_count += 1;
      return acc;
    },
    {
      total_copies_sold: 0,
      total_royalty_earned: 0,
      royalty_paid: 0,
      royalty_pending: 0,
      published_count: 0,
      in_production_count: 0,
      total_books: formattedBooks.length
    }
  );

  res.json({
    books: formattedBooks,
    summary
  });
});

// GET /api/books/:book_id - Single book lookup
router.get('/:book_id', authenticateToken, (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE book_id = ?').get(req.params.book_id);

  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  // RBAC: author can only inspect their own book
  if (req.user.role === 'author' && book.author_id !== req.user.author_id) {
    return res.status(403).json({ error: 'Access denied. You do not own this title.' });
  }

  res.json({
    book: {
      ...book,
      available_on: book.available_on ? JSON.parse(book.available_on) : []
    }
  });
});

module.exports = router;
