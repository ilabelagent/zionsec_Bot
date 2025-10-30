/**
 * Database Module - Placeholder for future database integration
 * Currently uses in-memory storage via the storage service
 */

import { storage } from "../services/storage";

export const db = {
  // Re-export storage methods for compatibility
  ...storage,

  // Connection status
  isConnected: true,

  // Initialize database (placeholder)
  async initialize() {
    console.log("[DB] Using in-memory storage (no external database configured)");
    return true;
  },

  // Close database connection (placeholder)
  async close() {
    console.log("[DB] Closing storage");
    return true;
  }
};

// Auto-initialize
db.initialize().catch(console.error);
