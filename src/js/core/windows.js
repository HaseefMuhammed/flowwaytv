/**
 * Window Management System for Flowway TV OS
 * Handles creation, positioning, and interaction with application windows
 */
const FlowWindows = {
  windows: {},
  zIndex: 100,
  
  /**
   * Create a new window
   * @param {string} appId - Unique identifier for the app
   * @param {string} title - Window title
   * @param {Node|string} content - Window content (DOM node or HTML string)
   * @param {Object} options - Window options
   * @returns {HTMLElement} - The created window element
   */
  create(appId, title, content, options = {}) {
    // Default options
    const defaultOptions = {
      width: 800,
      height: 600,
      x: 'center',
      y: 'center',
      resizable: true,
      minimizable: true,
      maximizable: true,
      closable: true
    };
    
    // Merge options
    const windowOptions = { ...defaultOptions, ...options };
    
    // Get window container
    const container = document.getElementById('window-container');
    if (!container) return null;
    
    // Check if window already exists
    if (this.windows[appId]) {
      // Bring to front
      this.bringToFront(appId);
      return this.windows[appId].element;
    }
    
    // Clone window template
    const template = document.getElementById('window-template');
    if (!template) return null;
    
    const windowElement = template.content.cloneNode(true).querySelector('.os-window');
    
    // Set app ID
    windowElement.setAttribute('data-app', appId);
    
    // Set window title
    const titleElement = windowElement.querySelector('.window-title');
    if (titleElement) titleElement.textContent = title;
    
    // Set window content
    const contentElement = windowElement.querySelector('.window-content');
    if (contentElement) {
      if (typeof content === 'string') {
        contentElement.innerHTML = content;
      } else {
        contentElement.appendChild(content);
      }
    }
    
    // Set window size
    windowElement.style.width = `${windowOptions.width}px`;
    windowElement.style.height = `${windowOptions.height}px`;
    
    // Set window position
    let posX = windowOptions.x;
    let posY = windowOptions.y;
    
    if (posX === 'center') {
      posX = (window.innerWidth - windowOptions.width) / 2;
    }
    
    if (posY === 'center') {
      posY = (window.innerHeight - windowOptions.height) / 2;
    }
    
    windowElement.style.left = `${posX}px`;
    windowElement.style.top = `${posY}px`;
    
    // Set z-index
    windowElement.style.zIndex = ++this.zIndex;
    
    // Add window to container
    container.appendChild(windowElement);
    
    // Store window reference
    this.windows[appId] = {
      element: windowElement,
      options: windowOptions,
      minimized: false,
      maximized: false
    };
    
    // Add opening animation
    windowElement.classList.add('opening');
    setTimeout(() => {
      windowElement.classList.remove('opening');
    }, 300);
    
    // Set up window interactions
    this.setupWindowControls(appId);
    this.makeWindowDraggable(appId);
    
    if (windowOptions.resizable) {
      this.makeWindowResizable(appId);
    }
    
    // Add resize handle to window if not present
    if (!windowElement.querySelector('.window-resize-handle')) {
      const resizeHandle = document.createElement('div');
      resizeHandle.className = 'window-resize-handle';
      resizeHandle.style.position = 'absolute';
      resizeHandle.style.right = '0';
      resizeHandle.style.bottom = '0';
      resizeHandle.style.width = '16px';
      resizeHandle.style.height = '16px';
      resizeHandle.style.cursor = 'nwse-resize';
      windowElement.appendChild(resizeHandle);
    }
    
    // Return the window element
    return windowElement;
  },
  
  /**
   * Set up window control buttons (close, minimize, maximize)
   * @param {string} appId - Window app ID
   */
  setupWindowControls(appId) {
    const windowData = this.windows[appId];
    if (!windowData) return;
    
    const windowElement = windowData.element;
    
    // Close button
    const closeBtn = windowElement.querySelector('.window-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close(appId);
      });
    }
    
    // Minimize button
    const minimizeBtn = windowElement.querySelector('.window-minimize');
    if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
        this.minimize(appId);
      });
    }
    
    // Maximize button
    const maximizeBtn = windowElement.querySelector('.window-maximize');
    if (maximizeBtn) {
      maximizeBtn.addEventListener('click', () => {
        this.toggleMaximize(appId);
      });
    }
    
    // Bring window to front on click
    windowElement.addEventListener('mousedown', () => {
      this.bringToFront(appId);
    });
  },
  
  /**
   * Make a window draggable
   * @param {string} appId - Window app ID
   */
  makeWindowDraggable(appId) {
    const windowData = this.windows[appId];
    if (!windowData) return;
    
    const windowElement = windowData.element;
    const titlebar = windowElement.querySelector('.window-titlebar');
    
    if (titlebar) {
      $(windowElement).draggable({
        handle: titlebar,
        containment: 'parent',
        start: () => {
          this.bringToFront(appId);
          
          // If maximized, restore before dragging
          if (windowData.maximized) {
            this.toggleMaximize(appId);
          }
        }
      });
    }
  },
  
  /**
   * Make a window resizable
   * @param {string} appId - Window app ID
   */
  makeWindowResizable(appId) {
    const windowData = this.windows[appId];
    if (!windowData) return;
    
    const windowElement = windowData.element;
    
    // Only allow resizing from the bottom-right (se) corner
    $(windowElement).resizable({
      handles: { se: windowElement.querySelector('.window-resize-handle') },
      minWidth: 320,
      minHeight: 240,
      start: () => {
        this.bringToFront(appId);
        
        // If maximized, restore before resizing
        if (windowData.maximized) {
          this.toggleMaximize(appId);
        }
      }
    });
  },
  
  /**
   * Close a window
   * @param {string} appId - Window app ID
   */
  close(appId) {
    const windowData = this.windows[appId];
    if (!windowData) return;
    
    const windowElement = windowData.element;
    
    // Add closing animation and disable pointer events
    windowElement.classList.add('closing');
    windowElement.style.pointerEvents = 'none';
    
    // Remove after animation ends for reliability
    const onAnimationEnd = (e) => {
      if (e.animationName === 'windowClose') {
        windowElement.removeEventListener('animationend', onAnimationEnd);
        windowElement.remove();
        delete this.windows[appId];
        
        // Notify OS that app is closed
        FlowOS.closeApp(appId);
      }
    };
    
    windowElement.addEventListener('animationend', onAnimationEnd);
  },
  
  /**
   * Minimize a window
   * @param {string} appId - Window app ID
   */
  minimize(appId) {
    const windowData = this.windows[appId];
    if (!windowData) return;
    
    const windowElement = windowData.element;
    
    // Add minimized class
    windowElement.classList.add('minimized');
    windowData.minimized = true;
  },
  
  /**
   * Restore a minimized window
   * @param {string} appId - Window app ID
   */
  restore(appId) {
    const windowData = this.windows[appId];
    if (!windowData) return;
    
    const windowElement = windowData.element;
    
    // Remove minimized class
    windowElement.classList.remove('minimized');
    windowData.minimized = false;
    
    // Bring to front
    this.bringToFront(appId);
  },
  
  /**
   * Toggle window maximize state
   * @param {string} appId - Window app ID
   */
  toggleMaximize(appId) {
    const windowData = this.windows[appId];
    if (!windowData) return;
    
    const windowElement = windowData.element;
    
    if (windowData.maximized) {
      // Restore
      windowElement.classList.remove('maximized');
      windowData.maximized = false;
      
      // Restore position and size
      if (windowData.beforeMaximize) {
        windowElement.style.width = windowData.beforeMaximize.width;
        windowElement.style.height = windowData.beforeMaximize.height;
        windowElement.style.left = windowData.beforeMaximize.left;
        windowElement.style.top = windowData.beforeMaximize.top;
      }
    } else {
      // Maximize
      // Save current position and size
      windowData.beforeMaximize = {
        width: windowElement.style.width,
        height: windowElement.style.height,
        left: windowElement.style.left,
        top: windowElement.style.top
      };
      
      windowElement.classList.add('maximized');
      windowData.maximized = true;
    }
  },
  
  /**
   * Bring a window to the front
   * @param {string} appId - Window app ID
   */
  bringToFront(appId) {
    const windowData = this.windows[appId];
    if (!windowData) return;
    
    const windowElement = windowData.element;
    
    // Set highest z-index
    windowElement.style.zIndex = ++this.zIndex;
    
    // If minimized, restore
    if (windowData.minimized) {
      this.restore(appId);
    }
  },
  
  /**
   * Check if a window exists
   * @param {string} appId - Window app ID
   * @returns {boolean} - Whether the window exists
   */
  exists(appId) {
    return !!this.windows[appId];
  },
  
  /**
   * Get a window element
   * @param {string} appId - Window app ID
   * @returns {HTMLElement|null} - The window element or null
   */
  getWindow(appId) {
    const windowData = this.windows[appId];
    return windowData ? windowData.element : null;
  },
  
  /**
   * Close all windows
   */
  closeAll() {
    for (const appId in this.windows) {
      this.close(appId);
    }
  }
};