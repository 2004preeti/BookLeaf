// server/seed.js
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('./db');

async function seed() {
  console.log('--- Starting BookLeaf Database Seeding ---');

  // Clear existing data
  db.exec(`
    DELETE FROM ticket_messages;
    DELETE FROM ai_logs;
    DELETE FROM tickets;
    DELETE FROM books;
    DELETE FROM users;
  `);

  const sampleDataPath = path.resolve(__dirname, '../bookleaf_sample_data.json');
  if (!fs.existsSync(sampleDataPath)) {
    console.error(`Sample data file not found at ${sampleDataPath}`);
    process.exit(1);
  }

  const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

  // 1. Create Admin User
  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const insertUser = db.prepare(`
    INSERT INTO users (author_id, name, email, password_hash, role, phone, city, joined_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertUser.run(
    'ADMIN001',
    'Karan Verma (Support Ops Lead)',
    'admin@bookleaf.com',
    adminPasswordHash,
    'admin',
    '+91-99887-76655',
    'Delhi HQ',
    '2022-01-01'
  );
  console.log('✔ Admin user seeded: admin@bookleaf.com (password: admin123)');

  // 2. Insert Authors and Books
  const defaultAuthorPassword = bcrypt.hashSync('password123', 10);
  const insertBook = db.prepare(`
    INSERT INTO books (
      book_id, author_id, title, isbn, genre, publication_date, status,
      mrp, author_royalty_per_copy, total_copies_sold, total_royalty_earned,
      royalty_paid, royalty_pending, last_royalty_payout_date, print_partner, available_on
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let totalBooksCount = 0;
  for (const author of sampleData.authors) {
    insertUser.run(
      author.author_id,
      author.name,
      author.email,
      defaultAuthorPassword,
      'author',
      author.phone,
      author.city,
      author.joined_date
    );

    for (const book of author.books) {
      insertBook.run(
        book.book_id,
        author.author_id,
        book.title,
        book.isbn || null,
        book.genre,
        book.publication_date || null,
        book.status,
        book.mrp !== undefined ? book.mrp : null,
        book.author_royalty_per_copy !== undefined ? book.author_royalty_per_copy : null,
        book.total_copies_sold || 0,
        book.total_royalty_earned || 0,
        book.royalty_paid || 0,
        book.royalty_pending || 0,
        book.last_royalty_payout_date || null,
        book.print_partner || null,
        JSON.stringify(book.available_on || [])
      );
      totalBooksCount++;
    }
  }

  console.log(`✔ Seeded ${sampleData.authors.length} authors and ${totalBooksCount} books.`);

  // 3. Seed Realistic Sample Support Tickets matching Assignment Brief scenarios
  const insertTicket = db.prepare(`
    INSERT INTO tickets (
      ticket_number, author_id, book_id, category, ai_category, priority, ai_priority,
      status, subject, description, attachment_name, assigned_to, ai_draft_response, ai_reasoning,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMsg = db.prepare(`
    INSERT INTO ticket_messages (ticket_id, sender_id, sender_name, sender_role, message, is_internal_note, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  // Ticket 1: Royalty Inquiry (Priya Sharma - AUTH001)
  const t1 = insertTicket.run(
    'TICK-1001',
    'AUTH001',
    'BK001',
    'Royalty & Payments',
    'Royalty & Payments',
    'High',
    'High',
    'Open',
    'Haven’t received pending royalty payout for Q3',
    'I published my book Whispers of the Ganges last year. My dashboard shows ₹3,570 in pending royalties since October, but I have not received the bank transfer yet. Could you please clarify when this will be credited?',
    null,
    null,
    `Dear Priya,\n\nThank you for reaching out to BookLeaf support. I completely understand your concern regarding the pending royalty payout of ₹3,570 for 'Whispers of the Ganges'.\n\nAt BookLeaf, royalties are calculated on a quarterly cycle and disbursed within 45 days of each quarter ending. Looking into your account, your pending balance of ₹3,570 meets our minimum payout threshold of ₹1,000.\n\nOur accounts team is currently processing the batch transfers for this cycle. I have escalated your payout to our finance desk, and you can expect the transfer to reflect in your linked bank account within the next 48 hours. If you haven't received it by Friday, please reply directly to this ticket and I will personally follow up.\n\nWarm regards,\nBookLeaf Author Support Team`,
    'Author inquiry regarding ₹3,570 pending royalty. KB states minimum threshold is ₹1,000 (met) and payout is within 45 days of quarter end. Empathetic acknowledgment, specific numbers cited, and 48-hour resolution timeline provided.',
    new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  );

  insertMsg.run(
    t1.lastInsertRowid,
    'AUTH001',
    'Priya Sharma',
    'author',
    'I published my book Whispers of the Ganges last year. My dashboard shows ₹3,570 in pending royalties since October, but I have not received the bank transfer yet. Could you please clarify when this will be credited?',
    0,
    new Date(Date.now() - 36 * 3600 * 1000).toISOString()
  );

  // Ticket 2: ISBN Mismatch (Sneha Kulkarni - AUTH007)
  const t2 = insertTicket.run(
    'TICK-1002',
    'AUTH007',
    'BK011',
    'ISBN & Metadata Issues',
    'ISBN & Metadata Issues',
    'Critical',
    'Critical',
    'In Progress',
    'Amazon showing incorrect ISBN for The Algorithm of Love',
    'My readers informed me that the ISBN displayed on Amazon India does not match the ISBN printed on the physical paperback copies. This is causing confusion with order fulfillments.',
    'isbn_barcode_photo.jpg',
    'Karan Verma (Support Ops Lead)',
    `Dear Sneha,\n\nThank you for alerting us immediately. An ISBN discrepancy between physical copies and marketplace listings is a serious matter, and we treat it with the highest priority.\n\nWe have cross-checked our master catalog for 'The Algorithm of Love' (BK011) against Amazon India's listing. I have already escalated this directly to our production and catalog metadata team to submit an emergency data correction feed to Amazon.\n\nSuch marketplace metadata refreshes are handled on our accelerated track, and we will update you within 24 to 48 hours once Amazon confirms the sync. In the meantime, physical distribution is unaffected.\n\nWarm regards,\nBookLeaf Author Support Team`,
    'ISBN mismatch reported between marketplace and physical copy. Classified as Critical under ISBN & Metadata policy. High-urgency escalation with immediate 48-hour timeline.',
    new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  );

  insertMsg.run(
    t2.lastInsertRowid,
    'AUTH007',
    'Sneha Kulkarni',
    'author',
    'My readers informed me that the ISBN displayed on Amazon India does not match the ISBN printed on the physical paperback copies. This is causing confusion with order fulfillments.',
    0,
    new Date(Date.now() - 18 * 3600 * 1000).toISOString()
  );

  insertMsg.run(
    t2.lastInsertRowid,
    'ADMIN001',
    'Karan Verma (Support Ops Lead)',
    'admin',
    'Checked Amazon ASIN mapping against BookLeaf internal ISBN registry. Confirmed metadata mismatch on Amazon India catalog feed. Initiated support ticket with Amazon Seller Services.',
    1, // Internal Note!
    new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  );

  insertMsg.run(
    t2.lastInsertRowid,
    'ADMIN001',
    'Karan Verma (Support Ops Lead)',
    'admin',
    'Dear Sneha, thank you for bringing this to our notice. We have identified the feed discrepancy and submitted the corrected ISBN to Amazon India. The listing will reflect the accurate ISBN within 24-48 hours.',
    0,
    new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  );

  // Ticket 3: Production Delay (Kavita Deshmukh - AUTH009)
  const t3 = insertTicket.run(
    'TICK-1003',
    'AUTH009',
    'BK015',
    'Book Status & Production Updates',
    'Book Status & Production Updates',
    'Medium',
    'Medium',
    'Open',
    'Status update on Raising Roots typesetting',
    'It has been over 3 weeks since my manuscript was approved, and the dashboard still shows "In Production - Typesetting". When will the interior layout proof be ready for review?',
    null,
    null,
    `Dear Kavita,\n\nThank you for following up on 'Raising Roots'. We understand your excitement to see your book move towards publication.\n\nOur production workflow progresses through Manuscript Received → Typesetting → Proofreading → ISBN Assignment → Printing → Published & Live. For 'Raising Roots', our design team is currently finalizing the interior formatting to ensure the typography and chapter headers meet our publication quality standards.\n\nWe anticipate completing the typesetting draft within the next 3 business days. You will receive an email notification along with the PDF proof for your formal review and approval. Thank you for your patience as we craft your book.\n\nWarm regards,\nBookLeaf Production & Support Team`,
    'Production timeline query for book in Typesetting stage (BK015). KB explains production pipeline and that delays happen around typesetting and proof approvals. Outlines collaborative next steps with specific 3-day turnaround.',
    new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  );

  insertMsg.run(
    t3.lastInsertRowid,
    'AUTH009',
    'Kavita Deshmukh',
    'author',
    'It has been over 3 weeks since my manuscript was approved, and the dashboard still shows "In Production - Typesetting". When will the interior layout proof be ready for review?',
    0,
    new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  );

  // Ticket 4: Print Quality Issue (Vikram Joshi - AUTH004)
  const t4 = insertTicket.run(
    'TICK-1004',
    'AUTH004',
    'BK006',
    'Printing & Quality',
    'Printing & Quality',
    'High',
    'High',
    'Open',
    'Author copies arrived with misaligned binding',
    'I received my 10 author copies of Debugging Life today from the courier. Unfortunately, on 4 copies the spine text is misaligned and several illustrations on page 42-45 appear blurry.',
    'defective_spine_sample.jpg',
    null,
    `Dear Vikram,\n\nWe are truly sorry to hear that your author copies of 'Debugging Life' arrived with binding misalignment and print defects. Authors are our partners, and receiving copies that do not meet your expectations is deeply disappointing.\n\nUnder BookLeaf's Printing & Quality Policy, we provide 100% free reprints for verified manufacturing defects. We have noted the attachment you shared. Could you please reply with 1-2 close-up photos showing the blurry illustration pages as well?\n\nOnce our quality control team verifies the photos, we will immediately initiate a replacement print run through our in-house facility in Delhi. Reprints take 5–7 business days, and new copies will be dispatched to your address at zero cost to you.\n\nWarm regards,\nBookLeaf Quality Assurance Team`,
    'Print defect reported (misaligned spine, blurry images). KB policy mandates sincere apology, request for defect photos, and promise of 100% free reprint within 5-7 business days.',
    new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  );

  insertMsg.run(
    t4.lastInsertRowid,
    'AUTH004',
    'Vikram Joshi',
    'author',
    'I received my 10 author copies of Debugging Life today from the courier. Unfortunately, on 4 copies the spine text is misaligned and several illustrations on page 42-45 appear blurry.',
    0,
    new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  );

  console.log('✔ Seeded 4 sample tickets across different categories & priorities.');
  console.log('--- Database Seeding Complete ---');
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
