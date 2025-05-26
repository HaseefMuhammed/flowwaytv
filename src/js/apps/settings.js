/**
 * FlowSettings App for Flowway TV OS
 * System settings and customization
 */
const FlowSettings = {
  appId: 'settings',
  
  /**
   * Initialize the app
   */
  init() {
    // Nothing to initialize
  },
  
  /**
   * Open the app
   */
  open() {
    // Check if window already exists
    if (FlowWindows.exists(this.appId)) {
      FlowWindows.bringToFront(this.appId);
      return;
    }
    
    // Get content template
    const template = document.getElementById('settings-app-template');
    if (!template) return;
    
    // Clone template content
    const content = template.content.cloneNode(true);
    
    // Create window
    const window = FlowWindows.create(this.appId, 'Settings', content, {
      width: 800,
      height: 600
    });
    
    // Set up app events
    this.setupEvents(window);
    
    // Load current settings
    this.loadSettings(window);
  },
  
  /**
   * Set up app event listeners
   * @param {HTMLElement} windowElement - The app window element
   */
  setupEvents(windowElement) {
    if (!windowElement) return;
    
    // Navigation items
    const navItems = windowElement.querySelectorAll('.settings-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const section = item.getAttribute('data-section');
        this.showSection(section, windowElement);
      });
    });
    
    // Theme toggle
    const themeToggle = windowElement.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('change', () => {
        FlowUI.toggleTheme(themeToggle.checked);
      });
    }
    
    // Wallpaper options
    const wallpaperOptions = windowElement.querySelectorAll('.wallpaper-option');
    wallpaperOptions.forEach(option => {
      option.addEventListener('click', () => {
        const wallpaper = option.getAttribute('data-wallpaper');
        FlowUI.changeWallpaper(wallpaper);
        
        // Update active class
        wallpaperOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
      });
    });
    
    // Custom wallpaper upload
    const wallpaperUpload = windowElement.querySelector('#wallpaper-upload');
    if (wallpaperUpload) {
      wallpaperUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          const reader = new FileReader();
          
          reader.onload = (event) => {
            const wallpaperUrl = event.target.result;
            FlowUI.changeWallpaper(wallpaperUrl);
            FlowStorage.set('customWallpaper', wallpaperUrl);
          };
          
          reader.readAsDataURL(file);
        }
      });
    }
    
    // Profile name
    const profileName = windowElement.querySelector('#profile-name');
    if (profileName) {
      profileName.addEventListener('change', () => {
        const name = profileName.value.trim();
        if (name) {
          FlowOS.settings.username = name;
          FlowStorage.set('username', name);
          FlowUI.showNotification('Profile name updated', 'success');
          // Update lock screen username immediately
          if (typeof FlowOS.updateLockScreenUsername === 'function') {
            FlowOS.updateLockScreenUsername();
          }
        }
      });
    }
    
    // Profile picture upload
    const profilePictureUpload = windowElement.querySelector('#profile-picture-upload');
    if (profilePictureUpload) {
      profilePictureUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          const reader = new FileReader();
          
          reader.onload = (event) => {
            const pictureUrl = event.target.result;
            FlowStorage.set('profilePicture', pictureUrl);
            
            // Update preview
            const preview = windowElement.querySelector('.profile-picture-preview');
            if (preview) {
              preview.innerHTML = '';
              const img = document.createElement('img');
              img.src = pictureUrl;
              preview.appendChild(img);
            }
            
            FlowUI.showNotification('Profile picture updated', 'success');
          };
          
          reader.readAsDataURL(file);
        }
      });
    }
    
    // Dock position
    const dockPositions = windowElement.querySelectorAll('input[name="dock-position"]');
    dockPositions.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          const position = radio.value;
          FlowUI.changeDockPosition(position);
        }
      });
    });
    
    // Volume slider
    const volumeSlider = windowElement.querySelector('#volume-slider');
    if (volumeSlider) {
      volumeSlider.addEventListener('change', () => {
        const volume = parseInt(volumeSlider.value);
        FlowOS.settings.volume = volume;
        FlowStorage.set('volume', volume);
      });
    }
    
    // Startup sound
    const startupSound = windowElement.querySelector('#startup-sound');
    if (startupSound) {
      startupSound.addEventListener('change', () => {
        FlowOS.settings.startupSound = startupSound.checked;
        FlowStorage.set('startupSound', startupSound.checked);
      });
    }
  },
  
  /**
   * Load current settings into the UI
   * @param {HTMLElement} windowElement - The app window element
   */
  loadSettings(windowElement) {
    if (!windowElement) return;
    
    // Theme
    const themeToggle = windowElement.querySelector('#theme-toggle');
    if (themeToggle) {
      themeToggle.checked = FlowOS.settings.theme === 'dark';
    }
    
    // Wallpaper
    const wallpaperOptions = windowElement.querySelectorAll('.wallpaper-option');
    wallpaperOptions.forEach(option => {
      const wallpaper = option.getAttribute('data-wallpaper');
      if (wallpaper === FlowOS.settings.wallpaper) {
        option.classList.add('active');
      }
    });
    
    // Profile name
    const profileName = windowElement.querySelector('#profile-name');
    if (profileName) {
      profileName.value = FlowOS.settings.username;
    }
    
    // Profile picture
    const profilePicture = FlowStorage.get('profilePicture', null);
    if (profilePicture) {
      const preview = windowElement.querySelector('.profile-picture-preview');
      if (preview) {
        preview.innerHTML = '';
        const img = document.createElement('img');
        img.src = profilePicture;
        preview.appendChild(img);
      }
    } else {
      // Show initial
      const preview = windowElement.querySelector('.profile-picture-preview');
      if (preview) {
        preview.textContent = FlowOS.settings.username.charAt(0).toUpperCase();
      }
    }
    
    // Dock position
    const dockPosition = FlowOS.settings.dockPosition;
    const dockPositionRadio = windowElement.querySelector(`input[name="dock-position"][value="${dockPosition}"]`);
    if (dockPositionRadio) {
      dockPositionRadio.checked = true;
    }
    
    // Volume
    const volumeSlider = windowElement.querySelector('#volume-slider');
    if (volumeSlider) {
      volumeSlider.value = FlowOS.settings.volume;
    }
    
    // Startup sound
    const startupSound = windowElement.querySelector('#startup-sound');
    if (startupSound) {
      startupSound.checked = FlowOS.settings.startupSound;
    }
  },
  
  /**
   * Show a settings section
   * @param {string} sectionId - ID of the section to show
   * @param {HTMLElement} windowElement - The app window element
   */
  showSection(sectionId, windowElement) {
    if (!windowElement) return;
    
    // Update nav items
    const navItems = windowElement.querySelectorAll('.settings-nav-item');
    navItems.forEach(item => {
      if (item.getAttribute('data-section') === sectionId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    // Update sections
    const sections = windowElement.querySelectorAll('.settings-section');
    sections.forEach(section => {
      if (section.id === `${sectionId}-section`) {
        section.classList.add('active');
      } else {
        section.classList.remove('active');
      }
    });
  }
};