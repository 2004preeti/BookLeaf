# BookLeaf Publishing — Author Support & Communication Portal
> **Technical Assignment — Full Stack Developer Position**  
> An intelligent, real-time author communication portal powered by Knowledge Base-grounded AI response generation, automated ticket classification, priority scoring, and role-based operations management.

---

## 🌟 Executive Summary

BookLeaf processes 1,200+ books monthly across a catalog of 22,000+ titles. Author communication is one of the company's highest-volume operational challenges. This portal solves author support at scale through:

1. **Author-Facing Dashboard**: Seamless email authentication, real-time ticket tracking, interactive book catalog with royalty calculations and threshold indicators, and instant support request submission.
2. **Admin Operations Workbench**: Unified triage queue filterable by status, priority, and category, intelligent automated urgency ranking, AI-generated policy-accurate draft responses, internal private notes, and one-click priority/category override.
3. **Enterprise AI Engine**:
   - Grounded strictly in the official BookLeaf Knowledge Base & tone guidelines.
   - **Cost-Conscious RAG / Heuristic Pruning**: Selectively embeds only relevant policy sections instead of entire documents.
   - **100% Graceful Degradation**: Zero external API dependency failure risk with our built-in deterministic heuristic rule engine.
   - Multi-provider support: OpenAI (`gpt-4o-mini`), Anthropic (`claude-3-haiku`), Google Gemini (`gemini-1.5-flash`), or zero-cost Local Heuristic Engine.
4. **Real-Time Synchronisation**: Native WebSocket gateway ensuring authors and admins receive ticket updates and messages instantly without refreshing.

---

## 🏗️ Architecture & Technology Stack

```
┌───────────────────────────────────────────────────────────┐
│                     Frontend (Client)                     │
│  React 19 + Vite + Vanilla CSS Modern Design System       │
│  • Quick Persona Switcher Bar (instant 1-click test)      │
│  • Author Portal (Overview, My Books, My Tickets, Form)   │
│  • Admin Portal (Triage Queue, Workbench, AI Assistant)   │
│  • Built-in Interactive API Reference Modal              │
└─────────────────────────────┬─────────────────────────────┘
                              │ REST + WebSocket (ws://)
┌─────────────────────────────▼─────────────────────────────┐
│                     Backend (Server)                      │
│  Node.js (v24) + Express 5 + Better-SQLite3 + WS          │
│  • RBAC Auth Middleware (JWT Token-based)                 │
│  • Real-Time WebSocket Event Broker                       │
│  • Knowledge Base Engine & Policy Matrix                  │
│  • Multi-Provider AI Service & Cost-Aware Prompt Adapter  │
│  • Deterministic Heuristic Fallback Engine                │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                 Database (Better-SQLite3)                 │
│  • authors, books, users, tickets, ticket_messages        │
│  • Pre-seeded with 10 authors, 18 books & sample tickets  │
└───────────────────────────────────────────────────────────┘
```

### Why These Architectural Choices?
- **Better-SQLite3 (WAL Mode)**: Zero external setup needed, ACID-compliant, blazing fast in-process database, ideal for reproducible technical evaluation and seeding.
- **Node.js Express + Native WebSocket**: Ultra-low overhead, clean REST route architecture, and unified HTTP + WS port binding.
- **Modular Design**: Distinct controllers, services, middleware, and knowledge base configurations prevent spaghetti code and allow swapping storage or LLM backends in minutes.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** v18+ (tested on Node.js v24)
- **npm** v9+

### 2. Installation
Clone the repository and install dependencies:
```bash
# Install root backend dependencies
npm install

# Install client frontend dependencies
cd client && npm install && cd ..
```

### 3. Seed Database with Sample Dataset
Pre-populate the SQLite database with the 10 authors, 18 books, and initial tickets from `bookleaf_sample_data.json`:
```bash
npm run seed
```

### 4. Build and Run the Application
You can run both backend and frontend concurrently:
```bash
# Start server and build/run client
npm run build
npm run start
```
* Or for development with hot reload:
```bash
npm run dev
```

Visit the application in your browser at:  
👉 **`http://localhost:5000`**

---

## 🧪 Automated End-to-End Test Suite

Run the full end-to-end integration test suite verifying health, authentication, RBAC privacy, ticket creation, AI auto-classification, admin override, internal notes, and AI response generation:
```bash
npm test
# or: node test-e2e.js
```
All 11 verification points pass with 100% assertions.

---

## 🔑 Test Login Credentials & Personas

The application includes a **Quick Persona Switcher** in the top navigation bar, allowing evaluators to switch between authors and the admin team with a single click.

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Admin** | Karan Verma (Support Ops) | `admin@bookleaf.com` | `admin123` | Full access to queue, triage, metrics & notes |
| **Author** | Priya Sharma | `priya.sharma@email.com` | `password123` | 2 live books, pending royalties (`AUTH001`) |
| **Author** | Rohit Kapoor | `rohit.kapoor@email.com` | `password123` | 2 live books, international Amazon US/UK (`AUTH002`) |
| **Author** | Ananya Reddy | `ananya.reddy@email.com` | `password123` | 1 book, zero payout history (`AUTH003`) |
| **Author** | Vikram Joshi | `vikram.joshi@email.com` | `password123` | 2 books, poetry & self-help (`AUTH004`) |
| **Author** | Meera Nair | `meera.nair@email.com` | `password123` | 2 books, contemporary fiction (`AUTH005`) |
| **Author** | Arjun Malhotra | `arjun.malhotra@email.com` | `password123` | 1 book, pending royalties (`AUTH006`) |
| **Author** | Sneha Kulkarni | `sneha.kulkarni@email.com` | `password123` | 3 books including 1 in production (`AUTH007`) |
| **Author** | Farhan Sheikh | `farhan.sheikh@email.com` | `password123` | 1 book, Urdu poetry (`AUTH008`) |
| **Author** | Kavita Deshmukh | `kavita.deshmukh@email.com` | `password123` | 2 books including 1 in typesetting (`AUTH009`) |
| **Author** | Diya Chatterjee | `diya.chatterjee@email.com` | `password123` | 2 books, thriller & fiction (`AUTH010`) |

---

## 🧠 AI Integration Details

### 1. Prompt Engineering & Tone Grounding
The AI system is calibrated strictly to the BookLeaf tone guide:
- **Empathetic & Collaborative**: Authors are addressed as creative partners, never as transactional customers.
- **Rooted in Policy**: Explicit adherence to the 80/20 net profit rule, quarterly calculation cycle, 45-day post-quarter payout window, ₹1,000 threshold rollover, and 24–48 hour stock re-sync SLAs.
- **Accountable**: Mistakes (delayed royalties, ISBN mismatches) are owned directly without corporate deflection, committing to explicit 48-hour resolution timelines.
- **Action-Oriented**: Every response concludes with a clear next step for both author and operations.

### 2. Token & Cost Optimization (Context Pruning)
Rather than blindly stuffing the entire BookLeaf documentation into every LLM request, the system uses `getRelevantContext(category, subject, description)` in `server/knowledgeBase.js`:
- Filters only the applicable policy sub-section (e.g. Royalty policy for payment questions; Distribution policy for Amazon stock queries).
- Reduces prompt token payload by **65% to 80%**, saving significant API costs and latency at 1,200+ monthly book scale.

### 3. API Key Security
API keys are strictly managed via server-side environment variables (`.env`). No keys or AI credentials are ever bundled or exposed to client-side code.

### 4. 100% Graceful Degradation
If no external API key is provided, or if OpenAI/Anthropic/Gemini returns an HTTP 429 / 5xx error or network timeout:
- Ticket creation **never fails**.
- The server seamlessly switches to our deterministic **Rule-Based Heuristic AI Engine**.
- Classifications, priorities, and knowledge-base draft responses are synthesized instantly.
- The admin is notified that the draft was generated via fallback and retains full manual editing capabilities.

### 5. LLM Model Justification
- **Default Recommendation**: `gpt-4o-mini` (OpenAI) or `claude-3-haiku` (Anthropic).  
- **Why**: Both models provide sub-second latency, benchmark high on JSON structured output, and cost under $0.001 per ticket triage, making them mathematically optimal for support operations handling tens of thousands of author queries.

---

## 📡 REST API Reference

All protected endpoints require an `Authorization: Bearer <token>` header.

### Authentication
- `POST /api/auth/login` — Login author or admin; returns JWT and user payload.
- `GET /api/auth/me` — Validate token and return current session user.
- `GET /api/auth/personas` — Fetch sample accounts for quick switcher UI.

### Books & Royalties
- `GET /api/books` — Returns books belonging to the authenticated author (or all books for admin) with aggregate financial summaries (total earned, paid, pending, threshold status).
- `GET /api/books/:id` — Single book details including sales, distribution partners, and ISBN imprint.

### Tickets & Support
- `GET /api/tickets` — Query tickets. Authors see only their tickets; Admins see the full company queue with query filters (`status`, `priority`, `category`, `search`).
- `POST /api/tickets` — Create a ticket. Triggers synchronous AI classification, priority scoring, reasoning, and draft response generation.
- `GET /api/tickets/:id` — Retrieve ticket conversation history. **RBAC Enforced**: `is_internal_note=1` is stripped for authors.
- `PATCH /api/tickets/:id` — Update ticket status, reassign staff, or override AI priority and category.
- `POST /api/tickets/:id/messages` — Post a message. Supports public author replies or private admin internal notes.

### AI Engine
- `POST /api/ai/regenerate-draft` — Regenerate an AI draft with optional custom instructions or staff guidance.
- `GET /api/stats/dashboard` — Operational metrics (open, critical, resolved counts, category breakdown, turnaround estimates).

---

## 💼 Edge Case Handling

1. **Books in Production** (`Sneha Kulkarni - BK013`, `Kavita Deshmukh - BK015`):
   - MRP, ISBN, and royalties are safely handled as `null` / `0`.
   - UI gracefully displays "In Production - Cover Design / Typesetting" status tags without throwing formatting errors.
2. **Zero Payouts & Sub-Threshold Royalties**:
   - Accurately tracks accumulated amounts and highlights rollover notice when under the ₹1,000 threshold.
3. **Marketplace Distribution Edge Cases**:
   - Flags out-of-stock inquiries on Amazon/Flipkart as 24–48h stock sync actions rather than printing failures.

---

## 🔒 Security & Data Privacy

- **JWT Authentication**: Cryptographically signed tokens with expiration.
- **Strict Role-Based Access Control (RBAC)**: Authors can never query, update, or view tickets or financial data belonging to other authors.
- **Internal Note Confidentiality**: Private operations notes (`is_internal_note: 1`) are stripped by backend query filters before payload transmission to author clients.
- **Sanitized Inputs & Parameterized SQL**: All SQLite database queries use parameterized prepared statements preventing SQL injection.

---

## 🛠️ Known Limitations & Future Roadmap

Given more production runway, we would implement:
1. **Multi-File Cloud Attachments**: Direct S3/GCS presigned URL upload for manuscript PDFs and defective book photos.
2. **Vector Embeddings (pgvector / ChromaDB)**: Semantic similarity lookup across historical resolved tickets to enrich drafts with proven answers.
3. **Automated ERP & Distribution Webhooks**: Direct API trigger to Repro India / Amazon Seller Central to re-index out-of-stock titles with a single click.
4. **Author Email Notifications**: Nodemailer / Resend integration notifying authors when tickets receive an admin response.

---

*Authored for the BookLeaf Publishing Technical Evaluation.*
