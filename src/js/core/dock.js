/**
 * Dock/Taskbar Manager for Flowway TV OS
 * Handles the dock/taskbar UI and interactions
 */
const FlowDock = {
  /**
   * Initialize the dock
   */
  init() {
    // Set up dock position based on settings
    this.updatePosition(FlowOS.settings.dockPosition);
  },
  
  /**
   * Update the dock position
   * @param {string} position - Position of the dock (bottom, left, right)
   */
  updatePosition(position) {
    const dockContainer = document.getElementById('dock-container');
    if (!dockContainer) return;
    
    // Remove all position classes
    dockContainer.classList.remove('position-left', 'position-right');
    
    // Add position class
    if (position === 'left') {
      dockContainer.classList.add('position-left');
    } else if (position === 'right') {
      dockContainer.classList.add('position-right');
    }
    
    // Update setting
    FlowOS.settings.dockPosition = position;
    FlowStorage.set('dockPosition', position);
  },
  
  /**
   * Add an app to the dock
   * @param {string} appId - App identifier
   * @param {string} appName - Display name of the app
   * @param {string} iconText - Text to display in the icon
   */
  addApp(appId, appName, iconText) {
    const dock = document.getElementById('dock');
    if (!dock) return;
    
    // Check if app already exists in dock
    const existingApp = dock.querySelector(`.dock-app[data-app="${appId}"]`);
    if (existingApp) return;
    
    // Create dock app element
    const dockApp = document.createElement('div');
    dockApp.className = 'dock-app';
    dockApp.setAttribute('data-app', appId);
    
    const dockIcon = document.createElement('div');
    dockIcon.className = 'dock-icon';
    dockIcon.textContent = iconText;
    
    const dockTooltip = document.createElement('div');
    dockTooltip.className = 'dock-tooltip';
    dockTooltip.textContent = appName;
    
    dockApp.appendChild(dockIcon);
    dockApp.appendChild(dockTooltip);
    
    // Add click event
    dockApp.addEventListener('click', () => {
      // If app is open and minimized, restore it
      if (FlowWindows.exists(appId) && FlowWindows.windows[appId].minimized) {
        FlowWindows.restore(appId);
      } else {
        // Otherwise open the app
        FlowOS.openApp(appId);
      }
    });
    
    // Find position to insert (before settings)
    const settingsApp = dock.querySelector('.dock-app[data-app="settings"]');
    const divider = dock.querySelector('.dock-divider');
    
    if (divider) {
      dock.insertBefore(dockApp, divider);
    } else {
      dock.appendChild(dockApp);
    }
    
    // Save dock apps to storage
    this.saveDockApps();
  },
  
  /**
   * Remove an app from the dock
   * @param {string} appId - App identifier
   */
  removeApp(appId) {
    const dock = document.getElementById('dock');
    if (!dock) return;
    
    // Don't remove system apps
    if (['notes', 'media', 'browser', 'weather', 'clock', 'settings'].includes(appId)) {
      return;
    }
    
    const dockApp = dock.querySelector(`.dock-app[data-app="${appId}"]`);
    if (dockApp) {
      dockApp.remove();
      
      // Save dock apps to storage
      this.saveDockApps();
    }
  },
  
  /**
   * Save dock apps configuration to storage
   */
  saveDockApps() {
    const dock = document.getElementById('dock');
    if (!dock) return;
    
    const dockApps = dock.querySelectorAll('.dock-app');
    const apps = [];
    
    dockApps.forEach(app => {
      const appId = app.getAttribute('data-app');
      const iconText = app.querySelector('.dock-icon').textContent;
      const appName = app.querySelector('.dock-tooltip').textContent;
      
      // Skip system apps
      if (!['notes', 'media', 'browser', 'weather', 'clock', 'settings'].includes(appId)) {
        apps.push({ appId, appName, iconText });
      }
    });
    
    FlowStorage.set('dockApps', apps);
  },
  
  /**
   * Restore saved dock apps
   */
  restoreDockApps() {
    const savedApps = FlowStorage.get('dockApps', []);
    
    savedApps.forEach(app => {
      this.addApp(app.appId, app.appName, app.iconText);
    });
  },
  
  /**
   * Update dock indicators for running apps
   * @param {Array} runningApps - Array of running app IDs
   */
  updateRunningIndicators(runningApps) {
    const dock = document.getElementById('dock');
    if (!dock) return;
    
    const dockApps = dock.querySelectorAll('.dock-app');
    
    dockApps.forEach(app => {
      const appId = app.getAttribute('data-app');
      
      if (runningApps.includes(appId)) {
        app.classList.add('active');
      } else {
        app.classList.remove('active');
      }
    });
  }
};

// Initialize dock when document is ready
$(document).ready(() => {
  FlowDock.init();
});