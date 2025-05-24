/**
 * Notification System for Flowway TV OS
 * Manages system and app notifications
 */
const FlowNotifications = {
  /**
   * Initialize the notification system
   */
  init() {
    // Set up notification container
    this.setupContainer();
  },
  
  /**
   * Set up the notification container
   */
  setupContainer() {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    // Clear any existing notifications
    container.innerHTML = '';
  },
  
  /**
   * Show a notification
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   * @param {string} type - Notification type (info, success, warning, error)
   * @param {number} duration - Duration in milliseconds
   */
  show(title, message, type = 'info', duration = 5000) {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add title if provided
    if (title) {
      const titleElement = document.createElement('div');
      titleElement.className = 'notification-title';
      titleElement.textContent = title;
      notification.appendChild(titleElement);
    }
    
    // Add message
    const messageElement = document.createElement('div');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    notification.appendChild(messageElement);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      this.dismiss(notification);
    });
    notification.appendChild(closeButton);
    
    // Add to container
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Auto dismiss after duration
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(notification);
      }, duration);
    }
    
    // Return the notification element
    return notification;
  },
  
  /**
   * Dismiss a notification
   * @param {HTMLElement} notification - The notification element
   */
  dismiss(notification) {
    // Animate out
    notification.classList.remove('show');
    
    // Remove after animation
    setTimeout(() => {
      notification.remove();
    }, 300);
  },
  
  /**
   * Show an info notification
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {number} duration - Duration in milliseconds
   */
  info(message, title = '', duration = 5000) {
    return this.show(title, message, 'info', duration);
  },
  
  /**
   * Show a success notification
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {number} duration - Duration in milliseconds
   */
  success(message, title = '', duration = 5000) {
    return this.show(title, message, 'success', duration);
  },
  
  /**
   * Show a warning notification
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {number} duration - Duration in milliseconds
   */
  warning(message, title = '', duration = 5000) {
    return this.show(title, message, 'warning', duration);
  },
  
  /**
   * Show an error notification
   * @param {string} message - Notification message
   * @param {string} title - Notification title
   * @param {number} duration - Duration in milliseconds
   */
  error(message, title = '', duration = 5000) {
    return this.show(title, message, 'error', duration);
  },
  
  /**
   * Clear all notifications
   */
  clearAll() {
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notifications = container.querySelectorAll('.notification');
    notifications.forEach(notification => {
      this.dismiss(notification);
    });
  }
};

// Initialize notifications when document is ready
$(document).ready(() => {
  FlowNotifications.init();
});