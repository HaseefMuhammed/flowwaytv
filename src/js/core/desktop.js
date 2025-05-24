/**
 * Desktop Environment for Flowway TV OS
 * Manages the desktop interface and interactions
 */
const FlowDesktop = {
  /**
   * Initialize the desktop
   */
  init() {
    // Set up desktop icons
    this.setupIcons();
    
    // Set up dock app launchers
    this.setupDockApps();
  },
  
  /**
   * Set up desktop icons
   */
  setupIcons() {
    const desktopIcons = document.getElementById('desktop-icons');
    if (!desktopIcons) return;
    
    // TODO: Load user-created desktop icons from storage
  },
  
  /**
   * Set up dock app launchers
   */
  setupDockApps() {
    const dockApps = document.querySelectorAll('.dock-app');
    
    dockApps.forEach(app => {
      app.addEventListener('click', () => {
        const appName = app.getAttribute('data-app');
        if (appName) {
          FlowOS.openApp(appName);
        }
      });
    });
  },
  
  /**
   * Create a desktop shortcut for an app
   * @param {string} appName - Name of the app
   * @param {string} displayName - Display name for the shortcut
   * @param {string} iconText - Text to display in the icon
   */
  createShortcut(appName, displayName, iconText) {
    const desktopIcons = document.getElementById('desktop-icons');
    if (!desktopIcons) return;
    
    const shortcut = document.createElement('div');
    shortcut.className = 'desktop-shortcut';
    shortcut.setAttribute('data-app', appName);
    
    const icon = document.createElement('div');
    icon.className = 'desktop-icon';
    icon.textContent = iconText;
    
    const name = document.createElement('div');
    name.className = 'desktop-shortcut-name';
    name.textContent = displayName;
    
    shortcut.appendChild(icon);
    shortcut.appendChild(name);
    
    // Add click event to open app
    shortcut.addEventListener('click', () => {
      FlowOS.openApp(appName);
    });
    
    desktopIcons.appendChild(shortcut);
    
    // Save desktop shortcut to storage
    const shortcuts = FlowStorage.get('desktopShortcuts', []);
    shortcuts.push({ appName, displayName, iconText });
    FlowStorage.set('desktopShortcuts', shortcuts);
  },
  
  /**
   * Remove a desktop shortcut
   * @param {string} appName - Name of the app to remove
   */
  removeShortcut(appName) {
    const shortcut = document.querySelector(`.desktop-shortcut[data-app="${appName}"]`);
    if (shortcut) {
      shortcut.remove();
      
      // Update stored shortcuts
      const shortcuts = FlowStorage.get('desktopShortcuts', []);
      const updatedShortcuts = shortcuts.filter(s => s.appName !== appName);
      FlowStorage.set('desktopShortcuts', updatedShortcuts);
    }
  },
  
  /**
   * Restore desktop shortcuts from storage
   */
  restoreShortcuts() {
    const shortcuts = FlowStorage.get('desktopShortcuts', []);
    
    shortcuts.forEach(shortcut => {
      this.createShortcut(shortcut.appName, shortcut.displayName, shortcut.iconText);
    });
  }
};

// Initialize desktop when document is ready
$(document).ready(() => {
  FlowDesktop.init();
});