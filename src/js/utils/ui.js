/**
 * UI Utilities for Flowway TV OS
 * Contains helper functions for UI elements and animations
 */
const FlowUI = {
  /**
   * Show a notification toast
   * @param {string} message - The message to display
   * @param {string} type - The type of notification (info, success, warning, error)
   * @param {number} duration - Duration in milliseconds
   */
  showNotification(message, type = 'info', duration = 3000) {
    const template = document.getElementById('notification-template');
    const notificationContainer = document.getElementById('notification-container');
    
    if (!template || !notificationContainer) return;
    
    const clone = template.content.cloneNode(true);
    const toast = clone.querySelector('.toast');
    const toastBody = clone.querySelector('.toast-body');
    
    // Set notification content
    toastBody.textContent = message;
    
    // Set notification type
    toast.classList.add(`bg-${type === 'error' ? 'danger' : type}`);
    if (type !== 'info') {
      toast.classList.add('text-white');
    }
    
    // Append to notification container
    notificationContainer.appendChild(toast);
    
    // Initialize and show the toast
    const bsToast = new bootstrap.Toast(toast, {
      delay: duration,
      autohide: true
    });
    
    bsToast.show();
    
    // Remove from DOM when hidden
    toast.addEventListener('hidden.bs.toast', () => {
      toast.remove();
    });
  },
  
  /**
   * Format a date object
   * @param {Date} date - The date to format
   * @param {string} format - The format type (time, date, datetime, shortDate)
   * @returns {string} - Formatted date string
   */
  formatDate(date, format = 'datetime') {
    if (!date) date = new Date();
    
    const options = {
      time: { hour: '2-digit', minute: '2-digit' },
      date: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      datetime: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
      shortDate: { year: 'numeric', month: 'short', day: 'numeric' }
    };
    
    return date.toLocaleString(undefined, options[format] || options.datetime);
  },
  
  /**
   * Update UI elements with the current time
   */
  updateClock() {
    const now = new Date();
    
    // Update system time
    const systemTime = document.getElementById('system-time');
    if (systemTime) {
      systemTime.textContent = this.formatDate(now, 'time');
    }
    
    // Update system date
    const systemDate = document.getElementById('system-date');
    if (systemDate) {
      systemDate.textContent = this.formatDate(now, 'shortDate');
    }
    
    // Update lock screen time
    const lockTime = document.querySelector('.lock-time');
    if (lockTime) {
      lockTime.textContent = this.formatDate(now, 'time');
    }
    
    // Update lock screen date
    const lockDate = document.querySelector('.lock-date');
    if (lockDate) {
      lockDate.textContent = this.formatDate(now, 'date');
    }
  },
  
  /**
   * Toggle between light and dark theme
   * @param {boolean} isDark - Whether to enable dark theme
   */
  toggleTheme(isDark) {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    
    // Save theme preference
    FlowStorage.set('theme', isDark ? 'dark' : 'light');
  },
  
  /**
   * Change the desktop wallpaper
   * @param {string} wallpaper - The wallpaper identifier or URL
   */
  changeWallpaper(wallpaper) {
    const desktopBg = document.getElementById('desktop-background');
    if (!desktopBg) return;
    
    // Predefined wallpapers
    const wallpapers = {
      default: 'https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1920',
      mountains: 'https://images.pexels.com/photos/2387873/pexels-photo-2387873.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1920',
      abstract: 'https://images.pexels.com/photos/3109807/pexels-photo-3109807.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1920',
      nature: 'https://images.pexels.com/photos/1287142/pexels-photo-1287142.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1080&w=1920'
    };
    
    // Set the wallpaper background
    if (wallpapers[wallpaper]) {
      desktopBg.style.backgroundImage = `url('${wallpapers[wallpaper]}')`;
    } else {
      // Assume it's a direct URL
      desktopBg.style.backgroundImage = `url('${wallpaper}')`;
    }
    
    // Save wallpaper preference
    FlowStorage.set('wallpaper', wallpaper);
  },
  
  /**
   * Change dock position
   * @param {string} position - The position (bottom, left, right)
   */
  changeDockPosition(position) {
    const dockContainer = document.getElementById('dock-container');
    if (!dockContainer) return;
    
    // Remove all position classes
    dockContainer.classList.remove('position-left', 'position-right');
    
    // Add the selected position class
    if (position === 'left') {
      dockContainer.classList.add('position-left');
    } else if (position === 'right') {
      dockContainer.classList.add('position-right');
    }
    // Bottom is default (no class needed)
    
    // Save position preference
    FlowStorage.set('dockPosition', position);
  }
};

// Start the clock updates
setInterval(() => FlowUI.updateClock(), 1000);