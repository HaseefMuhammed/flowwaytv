/**
 * FlowBrowser App for Flowway TV OS
 * A simple web browser using iframes
 */
const FlowBrowser = {
  appId: 'browser',
  currentUrl: '',
  history: [],
  historyIndex: -1,
  bookmarks: [],
  
  /**
   * Initialize the app
   */
  init() {
    // Load bookmarks from storage
    this.loadBookmarks();
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
    const template = document.getElementById('browser-app-template');
    if (!template) return;
    
    // Clone template content
    const content = template.content.cloneNode(true);
    
    // Create window
    const window = FlowWindows.create(this.appId, 'FlowBrowser', content, {
      width: 900,
      height: 600
    });
    
    // Set up app events
    this.setupEvents(window);
    
    // Load default page or last visited
    const lastUrl = FlowStorage.get('browserLastUrl', 'https://duckduckgo.com/');
    this.navigateTo(lastUrl);
    
    // Populate bookmarks
    this.populateBookmarks();
  },
  
  /**
   * Set up app event listeners
   * @param {HTMLElement} windowElement - The app window element
   */
  setupEvents(windowElement) {
    if (!windowElement) return;
    
    // Address bar
    const addressInput = windowElement.querySelector('.browser-address input');
    if (addressInput) {
      // Navigate when Enter is pressed
      addressInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.navigateTo(addressInput.value);
        }
      });
    }
    
    // Back button
    const backBtn = windowElement.querySelector('.browser-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.goBack();
      });
    }
    
    // Forward button
    const forwardBtn = windowElement.querySelector('.browser-forward');
    if (forwardBtn) {
      forwardBtn.addEventListener('click', () => {
        this.goForward();
      });
    }
    
    // Reload button
    const reloadBtn = windowElement.querySelector('.browser-reload');
    if (reloadBtn) {
      reloadBtn.addEventListener('click', () => {
        this.reload();
      });
    }
    
    // Bookmark button
    const bookmarkBtn = windowElement.querySelector('.browser-bookmark');
    if (bookmarkBtn) {
      bookmarkBtn.addEventListener('click', () => {
        this.toggleBookmark();
      });
    }
  },
  
  /**
   * Load bookmarks from storage
   */
  loadBookmarks() {
    this.bookmarks = FlowStorage.get('browserBookmarks', []);
  },
  
  /**
   * Save bookmarks to storage
   */
  saveBookmarks() {
    FlowStorage.set('browserBookmarks', this.bookmarks);
  },
  
  /**
   * Populate bookmarks bar
   */
  populateBookmarks() {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    const bookmarkItems = window.querySelector('.browser-bookmark-items');
    if (!bookmarkItems) return;
    
    // Clear existing bookmarks
    bookmarkItems.innerHTML = '';
    
    // Add each bookmark
    this.bookmarks.forEach(bookmark => {
      const item = document.createElement('div');
      item.className = 'browser-bookmark-item';
      
      const favicon = document.createElement('div');
      favicon.className = 'browser-bookmark-favicon';
      favicon.textContent = bookmark.title.charAt(0).toUpperCase();
      
      const title = document.createElement('span');
      title.textContent = bookmark.title;
      
      item.appendChild(favicon);
      item.appendChild(title);
      
      // Add click event
      item.addEventListener('click', () => {
        this.navigateTo(bookmark.url);
      });
      
      // Add right-click context menu
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showBookmarkContextMenu(bookmark.url, e.clientX, e.clientY);
      });
      
      bookmarkItems.appendChild(item);
    });
  },
  
  /**
   * Show context menu for a bookmark
   * @param {string} url - URL of the bookmark
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  showBookmarkContextMenu(url, x, y) {
    // Remove any existing context menu
    const existingMenu = document.querySelector('.bookmark-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'bookmark-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.zIndex = '10000';
    menu.style.backgroundColor = 'var(--surface-color)';
    menu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    menu.style.borderRadius = '4px';
    menu.style.padding = '4px 0';
    
    // Add menu items
    const openItem = document.createElement('div');
    openItem.textContent = 'Open';
    openItem.style.padding = '8px 16px';
    openItem.style.cursor = 'pointer';
    openItem.style.transition = 'background-color 0.2s';
    
    openItem.addEventListener('mouseover', () => {
      openItem.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    });
    
    openItem.addEventListener('mouseout', () => {
      openItem.style.backgroundColor = 'transparent';
    });
    
    openItem.addEventListener('click', () => {
      this.navigateTo(url);
      menu.remove();
    });
    
    const deleteItem = document.createElement('div');
    deleteItem.textContent = 'Delete Bookmark';
    deleteItem.style.padding = '8px 16px';
    deleteItem.style.cursor = 'pointer';
    deleteItem.style.transition = 'background-color 0.2s';
    
    deleteItem.addEventListener('mouseover', () => {
      deleteItem.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    });
    
    deleteItem.addEventListener('mouseout', () => {
      deleteItem.style.backgroundColor = 'transparent';
    });
    
    deleteItem.addEventListener('click', () => {
      this.removeBookmark(url);
      menu.remove();
    });
    
    menu.appendChild(openItem);
    menu.appendChild(deleteItem);
    
    // Add to document
    document.body.appendChild(menu);
    
    // Remove on click outside
    document.addEventListener('click', function hideMenu() {
      menu.remove();
      document.removeEventListener('click', hideMenu);
    });
  },
  
  /**
   * Navigate to a URL
   * @param {string} url - The URL to navigate to
   */
  navigateTo(url) {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      // Check if it's a search query
      if (!url.includes('.') || url.includes(' ')) {
        url = `https://duckduckgo.com/?q=${encodeURIComponent(url)}`;
      } else {
        url = `https://${url}`;
      }
    }
    
    // Update address bar
    const addressInput = window.querySelector('.browser-address input');
    if (addressInput) {
      addressInput.value = url;
    }
    
    // Get iframe
    const iframe = window.querySelector('#browser-iframe');
    if (!iframe) return;
    
    // Navigate
    iframe.src = url;
    
    // Update current URL
    this.currentUrl = url;
    
    // Add to history
    if (this.historyIndex >= -1) {
      // Remove forward history
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    
    this.history.push(url);
    this.historyIndex = this.history.length - 1;
    
    // Save last URL
    FlowStorage.set('browserLastUrl', url);
    
    // Update bookmark icon
    this.updateBookmarkIcon();
  },
  
  /**
   * Go back in history
   */
  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const url = this.history[this.historyIndex];
      
      // Navigate without adding to history
      const window = FlowWindows.getWindow(this.appId);
      if (!window) return;
      
      const iframe = window.querySelector('#browser-iframe');
      if (!iframe) return;
      
      iframe.src = url;
      
      // Update address bar
      const addressInput = window.querySelector('.browser-address input');
      if (addressInput) {
        addressInput.value = url;
      }
      
      // Update current URL
      this.currentUrl = url;
      
      // Update bookmark icon
      this.updateBookmarkIcon();
    }
  },
  
  /**
   * Go forward in history
   */
  goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const url = this.history[this.historyIndex];
      
      // Navigate without adding to history
      const window = FlowWindows.getWindow(this.appId);
      if (!window) return;
      
      const iframe = window.querySelector('#browser-iframe');
      if (!iframe) return;
      
      iframe.src = url;
      
      // Update address bar
      const addressInput = window.querySelector('.browser-address input');
      if (addressInput) {
        addressInput.value = url;
      }
      
      // Update current URL
      this.currentUrl = url;
      
      // Update bookmark icon
      this.updateBookmarkIcon();
    }
  },
  
  /**
   * Reload current page
   */
  reload() {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    const iframe = window.querySelector('#browser-iframe');
    if (!iframe) return;
    
    iframe.src = iframe.src;
  },
  
  /**
   * Toggle bookmark for current page
   */
  toggleBookmark() {
    if (!this.currentUrl) return;
    
    // Check if already bookmarked
    const existingIndex = this.bookmarks.findIndex(b => b.url === this.currentUrl);
    
    if (existingIndex >= 0) {
      // Remove bookmark
      this.bookmarks.splice(existingIndex, 1);
      FlowUI.showNotification('Bookmark removed', 'info');
    } else {
      // Add bookmark
      // Extract title from URL
      let title = this.currentUrl.replace(/^https?:\/\//, '');
      title = title.split('/')[0];
      
      this.bookmarks.push({
        url: this.currentUrl,
        title: title,
        dateAdded: new Date().toISOString()
      });
      
      FlowUI.showNotification('Bookmark added', 'success');
    }
    
    // Save bookmarks
    this.saveBookmarks();
    
    // Update bookmarks bar
    this.populateBookmarks();
    
    // Update bookmark icon
    this.updateBookmarkIcon();
  },
  
  /**
   * Remove a bookmark
   * @param {string} url - URL of the bookmark to remove
   */
  removeBookmark(url) {
    // Remove from bookmarks
    this.bookmarks = this.bookmarks.filter(b => b.url !== url);
    
    // Save bookmarks
    this.saveBookmarks();
    
    // Update bookmarks bar
    this.populateBookmarks();
    
    // Update bookmark icon if current page
    if (this.currentUrl === url) {
      this.updateBookmarkIcon();
    }
    
    FlowUI.showNotification('Bookmark removed', 'info');
  },
  
  /**
   * Update bookmark icon based on current URL
   */
  updateBookmarkIcon() {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    const bookmarkBtn = window.querySelector('.browser-bookmark');
    if (!bookmarkBtn) return;
    
    // Check if current URL is bookmarked
    const isBookmarked = this.bookmarks.some(b => b.url === this.currentUrl);
    
    if (isBookmarked) {
      bookmarkBtn.classList.add('active');
      bookmarkBtn.style.color = 'var(--primary-color)';
    } else {
      bookmarkBtn.classList.remove('active');
      bookmarkBtn.style.color = '';
    }
  }
};