// test-e2e.js - End-to-End Verification Suite for BookLeaf Author Support Portal
const assert = require('assert');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting BookLeaf Portal End-to-End Test Suite');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:5000';

  // 1. Health check
  console.log('1. Testing Health Endpoint...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const health = await healthRes.json();
  assert.strictEqual(health.status, 'healthy');
  console.log('✔ Health OK:', health);

  // 2. Fetch Personas
  console.log('\n2. Testing Personas List...');
  const personasRes = await fetch(`${BASE_URL}/api/auth/personas`);
  const personasData = await personasRes.json();
  assert.strictEqual(personasData.personas.length, 11); // 10 authors + 1 admin
  console.log(`✔ Found ${personasData.personas.length} personas (10 authors + 1 admin).`);

  // 3. Login as Author (Priya Sharma - AUTH001)
  console.log('\n3. Testing Author Login (Priya Sharma)...');
  const authorLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya.sharma@email.com', password: 'password123' })
  });
  const authorAuth = await authorLoginRes.json();
  assert.ok(authorAuth.token);
  assert.strictEqual(authorAuth.user.author_id, 'AUTH001');
  console.log('✔ Author logged in. Token generated.');

  // 4. Fetch Author Books & Financial Aggregations
  console.log('\n4. Testing Author Books & Royalties API (RBAC)...');
  const booksRes = await fetch(`${BASE_URL}/api/books`, {
    headers: { Authorization: `Bearer ${authorAuth.token}` }
  });
  const booksData = await booksRes.json();
  assert.strictEqual(booksData.books.length, 2);
  assert.strictEqual(booksData.summary.total_books, 2);
  assert.ok(booksData.summary.total_royalty_earned > 0);
  console.log(`✔ Priya has ${booksData.books.length} titles. Total Earned: ₹${booksData.summary.total_royalty_earned}, Pending: ₹${booksData.summary.royalty_pending}`);

  // 5. Submit New Support Ticket with AI Auto-Classification & AI-Drafted Response
  console.log('\n5. Testing Ticket Creation with AI Auto-Triage & KB Drafting...');
  const createTicketRes = await fetch(`${BASE_URL}/api/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authorAuth.token}`
    },
    body: JSON.stringify({
      book_id: 'BK001',
      subject: 'Why is my book showing out of stock on Flipkart?',
      description: 'Readers are messaging me that Whispers of the Ganges has been showing currently unavailable on Flipkart for 2 days. Can you please check the stock synchronization?'
    })
  });
  const createdData = await createTicketRes.json();
  assert.strictEqual(createTicketRes.status, 201);
  const newTicket = createdData.ticket;
  console.log(`✔ Ticket Created: [${newTicket.ticket_number}]`);
  console.log(`  - AI Category: [${newTicket.ai_category}]`);
  console.log(`  - AI Priority: [${newTicket.ai_priority}]`);
  console.log(`  - AI Reasoning: [${newTicket.ai_reasoning}]`);
  console.log(`  - AI Draft Length: ${newTicket.ai_draft_response.length} characters`);
  assert.strictEqual(newTicket.category, 'Distribution & Availability');

  // 6. Login as Admin (Karan Verma)
  console.log('\n6. Testing Admin Login & Queue Metrics...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@bookleaf.com', password: 'admin123' })
  });
  const adminAuth = await adminLoginRes.json();
  assert.ok(adminAuth.token);
  assert.strictEqual(adminAuth.user.role, 'admin');

  const statsRes = await fetch(`${BASE_URL}/api/stats/dashboard`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` }
  });
  const statsData = await statsRes.json();
  console.log(`✔ Admin Queue Overview: Total Tickets: ${statsData.stats.overview.total_tickets}, Open: ${statsData.stats.overview.open_tickets}`);

  // 7. Admin overrides Category and Priority
  console.log('\n7. Testing Admin Override on Priority and Category...');
  const overrideRes = await fetch(`${BASE_URL}/api/tickets/${newTicket.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAuth.token}`
    },
    body: JSON.stringify({
      priority: 'Critical',
      category: 'Distribution & Availability',
      assigned_to: 'Karan Verma (Support Ops Lead)'
    })
  });
  const overrideData = await overrideRes.json();
  assert.strictEqual(overrideData.ticket.priority, 'Critical');
  assert.strictEqual(overrideData.ticket.assigned_to, 'Karan Verma (Support Ops Lead)');
  console.log('✔ Priority successfully overridden to Critical and assigned to Karan Verma.');

  // 8. Admin posts an Internal Note (Private)
  console.log('\n8. Testing Internal Admin Note (Hidden from Author)...');
  const internalNoteRes = await fetch(`${BASE_URL}/api/tickets/${newTicket.id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAuth.token}`
    },
    body: JSON.stringify({
      message: 'Triggered automated stock refresh API with Flipkart seller center. Reference #FK-9921.',
      is_internal_note: true
    })
  });
  const noteData = await internalNoteRes.json();
  assert.strictEqual(noteData.message.is_internal_note, 1);
  console.log('✔ Internal note created.');

  // 9. Admin posts Public Response to Author
  console.log('\n9. Testing Admin Public Reply to Author...');
  const publicReplyRes = await fetch(`${BASE_URL}/api/tickets/${newTicket.id}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAuth.token}`
    },
    body: JSON.stringify({
      message: newTicket.ai_draft_response,
      is_internal_note: false,
      update_status: 'In Progress'
    })
  });
  const replyData = await publicReplyRes.json();
  assert.strictEqual(replyData.message.is_internal_note, 0);
  assert.strictEqual(replyData.ticket_status, 'In Progress');
  console.log('✔ Public response posted to author and ticket status updated to In Progress.');

  // 10. Verify Author RBAC Privacy (Ensure author CANNOT see internal notes!)
  console.log('\n10. Testing RBAC Security: Verifying Author Message Privacy...');
  const authorViewRes = await fetch(`${BASE_URL}/api/tickets/${newTicket.id}`, {
    headers: { Authorization: `Bearer ${authorAuth.token}` }
  });
  const authorViewData = await authorViewRes.json();
  const authorMessages = authorViewData.messages;
  const hasInternalNote = authorMessages.some(m => m.is_internal_note === 1);
  assert.strictEqual(hasInternalNote, false, 'SECURITY FAILURE: Author was able to see internal notes!');
  console.log(`✔ RBAC Privacy Verified: Author sees ${authorMessages.length} messages, 0 internal notes.`);

  // 11. Test AI Draft Regeneration with Custom Guidance
  console.log('\n11. Testing AI Draft Regeneration with Custom Instruction...');
  const regenRes = await fetch(`${BASE_URL}/api/ai/regenerate-draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAuth.token}`
    },
    body: JSON.stringify({
      ticket_id: newTicket.id,
      custom_instruction: 'Offer free expedited courier tracking and confirm stock will re-index within 24 hours.'
    })
  });
  const regenData = await regenRes.json();
  assert.ok(regenData.draft);
  console.log('✔ AI Draft regenerated with custom instruction.');

  console.log('\n====================================================');
  console.log('🎉 ALL 11 END-TO-END TESTS PASSED WITH 100% SUCCESS!');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
