/**
 * Storage Utility for Flowway TV OS
 * Handles localStorage operations with error handling
 */
const FlowStorage = {
  /**
   * Set a value in localStorage
   * @param {string} key - The key to store the value under
   * @param {any} value - The value to store (will be JSON stringified)
   * @returns {boolean} - Success status
   */
  set(key, value) {
    try {
      const stringValue = JSON.stringify(value);
      localStorage.setItem(key, stringValue);
      return true;
    } catch (error) {
      console.error('FlowStorage set error:', error);
      return false;
    }
  },

  /**
   * Get a value from localStorage
   * @param {string} key - The key to retrieve
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} - The retrieved value or defaultValue
   */
  get(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;
      return JSON.parse(value);
    } catch (error) {
      console.error('FlowStorage get error:', error);
      return defaultValue;
    }
  },

  /**
   * Remove a key from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} - Success status
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('FlowStorage remove error:', error);
      return false;
    }
  },

  /**
   * Check if a key exists in localStorage
   * @param {string} key - The key to check
   * @returns {boolean} - Whether the key exists
   */
  exists(key) {
    return localStorage.getItem(key) !== null;
  },

  /**
   * Clear all localStorage data
   * @returns {boolean} - Success status
   */
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('FlowStorage clear error:', error);
      return false;
    }
  }
};