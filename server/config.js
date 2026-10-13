// server/config.js
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'bookleaf_secure_jwt_secret_dev_2026',
  DB_PATH: process.env.DB_PATH || './data/bookleaf.db',
  
  // AI Model configurations
  AI_PROVIDER: process.env.AI_PROVIDER || (process.env.OPENAI_API_KEY ? 'openai' : process.env.ANTHROPIC_API_KEY ? 'anthropic' : process.env.GEMINI_API_KEY ? 'gemini' : 'heuristic_engine'),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
};
