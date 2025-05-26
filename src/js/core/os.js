/**
 * Flowway TV OS Core
 * Initializes and manages the operating system
 */
const FlowOS = {
  isBooted: false,
  isLocked: true,
  activeApps: [],
  settings: {
    theme: 'light',
    wallpaper: 'default',
    dockPosition: 'bottom',
    startupSound: true,
    volume: 50,
    username: 'User'
  },
  
  /**
   * Initialize the OS
   */
  init() {
    // Load saved settings
    this.loadSettings();
    
    // Start boot sequence
    this.boot();
    
    // Set up global event listeners
    this.setupEventListeners();
  },
  
  /**
   * Load settings from localStorage
   */
  loadSettings() {
    // Theme
    const theme = FlowStorage.get('theme', 'light');
    this.settings.theme = theme;
    FlowUI.toggleTheme(theme === 'dark');
    
    // Wallpaper
    const wallpaper = FlowStorage.get('wallpaper', 'default');
    this.settings.wallpaper = wallpaper;
    
    // Dock position
    const dockPosition = FlowStorage.get('dockPosition', 'bottom');
    this.settings.dockPosition = dockPosition;
    
    // Startup sound
    const startupSound = FlowStorage.get('startupSound', true);
    this.settings.startupSound = startupSound;
    
    // Volume
    const volume = FlowStorage.get('volume', 50);
    this.settings.volume = volume;
    
    // Username
    const username = FlowStorage.get('username', 'User');
    this.settings.username = username;
  },
  
  /**
   * Perform the OS boot sequence
   */
  boot() {
    const bootScreen = document.getElementById('boot-screen');
    const lockScreen = document.getElementById('lock-screen');
    const desktop = document.getElementById('desktop');
    
    // Simulate boot process
    setTimeout(() => {
      // Play startup sound if enabled
      if (this.settings.startupSound) {
        // TODO: Play startup sound
      }
      
      // Fade out boot screen
      bootScreen.classList.add('fade-out');
      
      setTimeout(() => {
        // Hide boot screen
        bootScreen.classList.add('hidden');
        bootScreen.classList.remove('active');
        
        // Show lock screen
        lockScreen.classList.remove('hidden');
        
        // Update clock on lock screen
        FlowUI.updateClock();
        
        // Set OS as booted
        this.isBooted = true;
        
        // Apply saved settings
        FlowUI.changeWallpaper(this.settings.wallpaper);
        FlowUI.changeDockPosition(this.settings.dockPosition);
        
        // Initialize apps
        this.initApps();
        
        // Show notification
        setTimeout(() => {
          FlowUI.showNotification('Welcome to Flowway TV OS', 'info');
        }, 1000);
      }, 1000);
    }, 4000); // Boot animation takes 4 seconds
  },
  
  /**
   * Initialize all apps
   */
  initApps() {
    FlowNotes.init();
    FlowMedia.init();
    FlowBrowser.init();
    FlowWeather.init();
    FlowClock.init();
    FlowCalculator.init();
    FlowEnteveed.init();
    FlowDeveloper.init();
    FlowCalendar.init();
    FlowSettings.init();
  },
  
  /**
   * Set up global event listeners
   */
  setupEventListeners() {
    // Lock screen click to unlock
    const lockScreen = document.getElementById('lock-screen');
    if (lockScreen) {
      lockScreen.addEventListener('click', () => this.unlock());
    }
    
    // Power menu toggle
    const powerIcon = document.querySelector('.power-icon');
    const powerMenu = document.querySelector('.power-menu');
    if (powerIcon && powerMenu) {
      powerIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        powerMenu.classList.toggle('show');
      });
      
      // Close power menu when clicking elsewhere
      document.addEventListener('click', () => {
        powerMenu.classList.remove('show');
      });
      
      // Power menu actions
      const powerItems = document.querySelectorAll('.power-item');
      powerItems.forEach(item => {
        item.addEventListener('click', (e) => {
          const action = item.getAttribute('data-action');
          e.stopPropagation();
          powerMenu.classList.remove('show');
          
          switch (action) {
            case 'lock':
              this.lock();
              break;
            case 'restart':
              this.restart();
              break;
            case 'shutdown':
              this.shutdown();
              break;
          }
        });
      });
    }
  },
  
  /**
   * Unlock the OS
   */
  unlock() {
    if (!this.isBooted || !this.isLocked) return;
    
    const lockScreen = document.getElementById('lock-screen');
    const desktop = document.getElementById('desktop');
    
    lockScreen.classList.add('slide-up');
    
    setTimeout(() => {
      lockScreen.classList.add('hidden');
      desktop.classList.remove('hidden');
      this.isLocked = false;
      
      // Update UI
      FlowUI.updateClock();
    }, 500);
  },
  
  /**
   * Lock the OS
   */
  lock() {
    if (!this.isBooted || this.isLocked) return;
    
    const lockScreen = document.getElementById('lock-screen');
    const desktop = document.getElementById('desktop');
    
    lockScreen.classList.remove('hidden');
    lockScreen.classList.remove('slide-up');
    
    setTimeout(() => {
      desktop.classList.add('hidden');
      this.isLocked = true;
      
      // Update UI
      FlowUI.updateClock();
    }, 100);
  },
  
  /**
   * Restart the OS
   */
  restart() {
    FlowUI.showNotification('Restarting...', 'info');
    
    setTimeout(() => {
      location.reload();
    }, 2000);
  },
  
  /**
   * Shutdown the OS
   */
  shutdown() {
    const bootScreen = document.getElementById('boot-screen');
    const lockScreen = document.getElementById('lock-screen');
    const desktop = document.getElementById('desktop');
    
    FlowUI.showNotification('Shutting down...', 'info');
    
    setTimeout(() => {
      desktop.classList.add('hidden');
      lockScreen.classList.add('hidden');
      
      bootScreen.classList.remove('hidden');
      bootScreen.classList.add('active');
      bootScreen.classList.remove('fade-out');
      
      setTimeout(() => {
        document.body.innerHTML = '<div style="display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #000; color: #fff;"><h1>Flowway TV is turned off</h1></div>';
      }, 1000);
    }, 2000);
  },
  
  /**
   * Open an app
   * @param {string} appName - The name of the app to open
   */
  openApp(appName) {
    switch (appName) {
      case 'notes':
        FlowNotes.open();
        break;
      case 'media':
        FlowMedia.open();
        break;
      case 'browser':
        FlowBrowser.open();
        break;
      case 'weather':
        FlowWeather.open();
        break;
      case 'clock':
        FlowClock.open();
        break;
      case 'calculator':
        FlowCalculator.open();
        break;
        case 'enteveed':
        FlowEnteveed.open();
        break;
        case 'developer':
        FlowDeveloper.open();
        break;
        case 'calendar':
        FlowCalendar.open();
        break;
      case 'settings':
        FlowSettings.open();
        break;
    }
    
    // Add to active apps if not already there
    if (!this.activeApps.includes(appName)) {
      this.activeApps.push(appName);
    }
    
    // Update dock
    this.updateDock();
  },
  
  /**
   * Close an app
   * @param {string} appName - The name of the app to close
   */
  closeApp(appName) {
    // Remove from active apps
    this.activeApps = this.activeApps.filter(app => app !== appName);
    
    // Update dock
    this.updateDock();
  },
  
  /**
   * Update the dock to reflect active apps
   */
  updateDock() {
    const dockApps = document.querySelectorAll('.dock-app');
    
    dockApps.forEach(app => {
      const appName = app.getAttribute('data-app');
      
      if (this.activeApps.includes(appName)) {
        app.classList.add('active');
      } else {
        app.classList.remove('active');
      }
    });
  }
};

// Initialize OS when document is ready
$(document).ready(() => {
  FlowOS.init();
});