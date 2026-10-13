// server/knowledgeBase.js
// BookLeaf Publishing Knowledge Base & Policy Engine

const BOOKLEAF_KNOWLEDGE_BASE = {
  company: {
    name: "BookLeaf Publishing",
    summary: "Self-publishing company operating in India and the US, processing 1,200+ books monthly across a catalog of 22,000+ titles.",
    packages: [
      { name: "Standard Free", description: "No upfront cost, standard distribution & publishing." },
      { name: "Bestseller Breakthrough", description: "Premium, paid package with comprehensive marketing and distribution add-ons." }
    ],
    facilities: "In-house printing facility and warehouse located in Delhi. Print partners include Repro India and Epitome Books.",
    services: "Cover design, typesetting, ISBN assignment, printing, distribution, and royalty management."
  },

  royaltyPolicy: {
    split: "80/20 split: 80% of net profit per book goes to author, 20% to BookLeaf.",
    netProfitFormula: "Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart), and shipping charges.",
    schedule: "Royalties are calculated quarterly and paid within 45 days of the quarter ending.",
    minimumThreshold: "₹1,000 minimum threshold. If accumulated royalties are below ₹1,000, they roll over to the next quarter.",
    payoutMethod: "Direct bank transfer to the account linked in author dashboard.",
    transparency: "Authors can view detailed royalty breakdowns per platform directly in their dashboard."
  },

  isbnPolicy: {
    assignment: "Every book published through BookLeaf receives a unique ISBN assigned by BookLeaf registered under BookLeaf imprint.",
    customImprint: "If an author desires their own publisher imprint, they must procure the ISBN independently.",
    errorResolution: "ISBN errors (duplicate ISBN, wrong book linked, barcode mismatches) are treated as High/Critical priority and escalated immediately to the production team with a strict 48-hour resolution timeline."
  },

  printingAndQuality: {
    turnaround: "Standard print turnaround: 5–7 business days from order confirmation.",
    partners: "In-house printing handles most orders; overflow or specialized formats route to Repro India or Epitome Books.",
    qualityDefects: "For physical misprints, binding defects, or color inconsistencies, BookLeaf provides 100% free reprints once photos of the defective copy are verified. Reprint turnaround is 5–7 business days."
  },

  distributionAndAvailability: {
    channels: ["Amazon India", "Flipkart", "Amazon US", "Amazon UK", "BookLeaf Store"],
    launchTimeline: "New listings typically go live within 7–10 business days after publication is complete.",
    outOfStockIssues: "If a book displays 'Currently Unavailable', this usually indicates an automated platform stock sync delay. BookLeaf operations triggers an active re-sync within 24–48 hours."
  },

  productionStages: [
    "Manuscript Received",
    "Editing (if opted)",
    "Cover Design",
    "Typesetting",
    "Proofreading",
    "ISBN Assignment",
    "Printing",
    "Distribution Setup",
    "Published & Live"
  ],
  productionNotes: "Delays typically occur at Cover Design (awaiting author approval) and Proofreading (revision rounds). The team updates authors at each stage via email."
};

const CATEGORIES = [
  "Royalty & Payments",
  "ISBN & Metadata Issues",
  "Printing & Quality",
  "Distribution & Availability",
  "Book Status & Production Updates",
  "General Inquiry"
];

const PRIORITIES = ["Critical", "High", "Medium", "Low"];

// Smart retrieval helper to minimize tokens by extracting only pertinent KB sections
function getRelevantContext(queryText, categoryHint = "") {
  const q = (queryText + " " + categoryHint).toLowerCase();
  const sections = [];

  if (q.includes("royalt") || q.includes("pay") || q.includes("money") || q.includes("earn") || q.includes("threshold") || q.includes("payout") || q.includes("bank")) {
    sections.push({
      topic: "Royalty Policy",
      content: BOOKLEAF_KNOWLEDGE_BASE.royaltyPolicy
    });
  }

  if (q.includes("isbn") || q.includes("metadata") || q.includes("barcode") || q.includes("imprint")) {
    sections.push({
      topic: "ISBN & Metadata Policy",
      content: BOOKLEAF_KNOWLEDGE_BASE.isbnPolicy
    });
  }

  if (q.includes("print") || q.includes("quality") || q.includes("paper") || q.includes("defect") || q.includes("blurry") || q.includes("binding") || q.includes("damage")) {
    sections.push({
      topic: "Printing & Quality Policy",
      content: BOOKLEAF_KNOWLEDGE_BASE.printingAndQuality
    });
  }

  if (q.includes("amazon") || q.includes("flipkart") || q.includes("unavailable") || q.includes("stock") || q.includes("listing") || q.includes("distribution") || q.includes("buy")) {
    sections.push({
      topic: "Distribution & Availability Policy",
      content: BOOKLEAF_KNOWLEDGE_BASE.distributionAndAvailability
    });
  }

  if (q.includes("typeset") || q.includes("stage") || q.includes("status") || q.includes("proof") || q.includes("cover") || q.includes("manuscript") || q.includes("publish")) {
    sections.push({
      topic: "Production Stages",
      content: {
        stages: BOOKLEAF_KNOWLEDGE_BASE.productionStages,
        notes: BOOKLEAF_KNOWLEDGE_BASE.productionNotes
      }
    });
  }

  // Fallback: If no specific section matched, include general company + overview
  if (sections.length === 0) {
    sections.push({
      topic: "Company Overview & Support Baseline",
      content: BOOKLEAF_KNOWLEDGE_BASE.company
    });
  }

  return sections;
}

module.exports = {
  BOOKLEAF_KNOWLEDGE_BASE,
  CATEGORIES,
  PRIORITIES,
  getRelevantContext
};
