/**
 * Generates a UUID that works in both browser and Node.js environments
 * Falls back to a simple random string generator for environments without crypto support
 */
export const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  if (typeof require !== 'undefined') {
    try {
      const crypto = require('crypto');
      return crypto.randomUUID();
    } catch (e) {
      console.warn('Crypto module not available, falling back to manual UUID generation.');
    }
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
