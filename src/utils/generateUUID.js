/**
 * Generates a UUID that works in both browser and Node.js environments
 * Falls back to a simple random string generator for environments without crypto support
 */
export const generateUUID = () => {
  // Try browser crypto API first
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Try Node.js crypto module
  if (typeof require !== 'undefined') {
    try {
      const crypto = require('crypto');
      return crypto.randomUUID();
    } catch (e) {
      // Fall through to polyfill
    }
  }

  // Polyfill for environments without crypto support (e.g., older test runners)
  // Simple UUID v4 implementation
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
