# Technical Assignment Write-Up: Engineering Approach & System Evolution
**Candidate:** Full-Stack Developer Position  
**Subject:** Author Support & Communication Portal — Architecture, Trade-offs & Production Roadmap  

---

### 1. Core Priorities: What We Emphasized

When designing this system for BookLeaf Publishing, we prioritized three core pillars:

1. **AI Grounding & Trust**:
   In author communication, inaccurate AI answers (such as hallucinating wrong royalty payout dates or shifting blame to the author) do real reputational harm. We prioritized strict Knowledge Base grounding over generic LLM creativity. Every AI draft directly cites BookLeaf policies (80/20 royalty split, quarterly cycle, 45-day window, ₹1,000 threshold, 24–48h stock sync).
2. **Author Privacy & Operational Data Integrity**:
   With 22,000+ titles and thousands of authors, data isolation is non-negotiable. We implemented strict server-side Role-Based Access Control (RBAC). Authors can never query other authors' books or tickets, and internal administrative notes are completely filtered out from author-facing queries at the database layer.
3. **Resilience & Graceful Degradation**:
   External AI APIs experience outages, rate limits (429s), and network timeouts. A support portal cannot halt operations during high-volume periods. We implemented a deterministic heuristic fallback engine that triages tickets, assigns urgency, and drafts standard responses even with zero external API connectivity.

---

### 2. Trade-offs Made During Development

- **SQLite vs. Distributed PostgreSQL**:  
  *Choice:* We used `better-sqlite3` with WAL mode enabled.  
  *Trade-off:* While PostgreSQL with Redis is standard for multi-instance distributed deployments, SQLite enabled a 100% turnkey, reproducible evaluation that spins up in seconds without requiring evaluators to configure cloud database instances or Docker containers. The database abstraction layer was designed with standard SQL statements that migrate cleanly to PostgreSQL.
- **WebSocket Protocol vs. Third-Party Managed Pub/Sub (Pusher / Ably)**:  
  *Choice:* Native `ws` server co-located with Express on the same port.  
  *Trade-off:* Avoids third-party API dependencies and external keys while providing sub-50ms real-time delivery between author and operations dashboards. For large horizontal clusters, this can easily be backed by Redis Pub/Sub.
- **Rule-Based Heuristic Pruning vs. Vector Database (Embeddings)**:  
  *Choice:* Structured keyword and category context extraction over full RAG vector stores.  
  *Trade-off:* For a well-defined operational manual like BookLeaf's, category-based context pruning reduced prompt token size by ~75% without the operational complexity or cold-start latency of vector embedding generation.

---

### 3. Production Evolution: Next Steps at Scale

Given the opportunity to deploy this system across BookLeaf's 22,000+ catalog and 1,200 monthly publishing pipeline, we would evolve it along the following axes:

1. **Enterprise Distribution Integrations**:
   - Automated distribution webhook triggers to Repro India, Amazon Seller Central, and Flipkart to re-index listings directly when a "Distribution & Availability" ticket is confirmed.
2. **Semantic Knowledge Base & Historical Ticket RAG**:
   - Ingest resolved ticket histories using pgvector embeddings so the AI learns from top-performing support agents' past resolutions.
3. **Author Self-Service Payout Linking**:
   - Bank verification APIs (Penny drop / IFSC validation) embedded directly into the ticket resolution flow when resolving overdue royalty issues.
4. **Multi-Channel Synchronisation**:
   - Bidirectional email integration (SendGrid / Inbound Parse Webhooks) and WhatsApp Business API integration, allowing authors to reply from their inbox or mobile while maintaining unified ticket history in the portal.
