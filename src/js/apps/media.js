/**
 * FlowMedia App for Flowway TV OS
 * A local media player for audio and video files
 */
const FlowMedia = {
  appId: 'media',
  mediaLibrary: [],
  currentMedia: null,
  
  /**
   * Initialize the app
   */
  init() {
    // Load media library from storage
    this.loadMediaLibrary();
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
    const template = document.getElementById('media-app-template');
    if (!template) return;
    
    // Clone template content
    const content = template.content.cloneNode(true);
    
    // Create window
    const window = FlowWindows.create(this.appId, 'FlowMedia', content, {
      width: 800,
      height: 600
    });
    
    // Set up app events
    this.setupEvents(window);
    
    // Populate media library
    this.populateMediaLibrary();
  },
  
  /**
   * Set up app event listeners
   * @param {HTMLElement} windowElement - The app window element
   */
  setupEvents(windowElement) {
    if (!windowElement) return;
    
    // Upload button
    const uploadBtn = windowElement.querySelector('.media-upload');
    const fileInput = windowElement.querySelector('#media-file');
    
    if (uploadBtn && fileInput) {
      uploadBtn.addEventListener('click', () => {
        fileInput.click();
      });
      
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }
    
    // Video player
    const videoPlayer = windowElement.querySelector('#media-video');
    if (videoPlayer) {
      videoPlayer.addEventListener('ended', () => {
        // Auto-play next media
        this.playNextMedia();
      });
    }
    
    // Audio player
    const audioPlayer = windowElement.querySelector('#media-audio');
    if (audioPlayer) {
      audioPlayer.addEventListener('ended', () => {
        // Auto-play next media
        this.playNextMedia();
      });
    }
  },
  
  /**
   * Load media library from storage
   */
  loadMediaLibrary() {
    this.mediaLibrary = FlowStorage.get('mediaLibrary', []);
  },
  
  /**
   * Save media library to storage
   */
  saveMediaLibrary() {
    FlowStorage.set('mediaLibrary', this.mediaLibrary);
  },
  
  /**
   * Populate the media library
   */
  populateMediaLibrary() {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    const mediaItems = window.querySelector('.media-items');
    if (!mediaItems) return;
    
    // Clear the list
    mediaItems.innerHTML = '';
    
    // Create media items
    this.mediaLibrary.forEach(media => {
      const mediaItem = document.createElement('div');
      mediaItem.className = 'media-item';
      mediaItem.setAttribute('data-id', media.id);
      
      if (this.currentMedia && media.id === this.currentMedia.id) {
        mediaItem.classList.add('active');
      }
      
      const thumbnail = document.createElement('div');
      thumbnail.className = 'media-item-thumbnail';
      
      // Display different icon based on media type
      if (media.type.startsWith('video')) {
        thumbnail.textContent = '▶';
      } else if (media.type.startsWith('audio')) {
        thumbnail.textContent = '♪';
      }
      
      const title = document.createElement('div');
      title.className = 'media-item-title';
      title.textContent = media.name;
      
      mediaItem.appendChild(thumbnail);
      mediaItem.appendChild(title);
      
      // Add click event
      mediaItem.addEventListener('click', () => {
        this.playMedia(media.id);
      });
      
      // Add right-click context menu
      mediaItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showMediaContextMenu(media.id, e.clientX, e.clientY);
      });
      
      mediaItems.appendChild(mediaItem);
    });
  },
  
  /**
   * Show context menu for a media item
   * @param {string} mediaId - ID of the media
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  showMediaContextMenu(mediaId, x, y) {
    // Remove any existing context menu
    const existingMenu = document.querySelector('.media-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'media-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.zIndex = '10000';
    menu.style.backgroundColor = 'var(--surface-color)';
    menu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    menu.style.borderRadius = '4px';
    menu.style.padding = '4px 0';
    
    // Add menu items
    const playItem = document.createElement('div');
    playItem.textContent = 'Play';
    playItem.style.padding = '8px 16px';
    playItem.style.cursor = 'pointer';
    playItem.style.transition = 'background-color 0.2s';
    
    playItem.addEventListener('mouseover', () => {
      playItem.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
    });
    
    playItem.addEventListener('mouseout', () => {
      playItem.style.backgroundColor = 'transparent';
    });
    
    playItem.addEventListener('click', () => {
      this.playMedia(mediaId);
      menu.remove();
    });
    
    const deleteItem = document.createElement('div');
    deleteItem.textContent = 'Delete';
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
      this.deleteMedia(mediaId);
      menu.remove();
    });
    
    menu.appendChild(playItem);
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
   * Handle file upload
   * @param {File} file - The uploaded file
   */
  handleFileUpload(file) {
    // Check if it's a media file
    if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
      FlowUI.showNotification('Only video and audio files are supported', 'warning');
      return;
    }
    
    // Create a blob URL for the file
    const url = URL.createObjectURL(file);
    
    // Create media object
    const mediaItem = {
      id: this.generateId(),
      name: file.name,
      type: file.type,
      url: url,
      size: file.size,
      addedAt: new Date().toISOString()
    };
    
    // Add to library
    this.mediaLibrary.push(mediaItem);
    
    // Save library
    this.saveMediaLibrary();
    
    // Refresh library UI
    this.populateMediaLibrary();
    
    // Play the new media
    this.playMedia(mediaItem.id);
    
    // Show notification
    FlowUI.showNotification(`Added "${file.name}" to library`, 'success');
  },
  
  /**
   * Play a media item
   * @param {string} mediaId - ID of the media to play
   */
  playMedia(mediaId) {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    // Find the media
    const media = this.mediaLibrary.find(m => m.id === mediaId);
    if (!media) return;
    
    // Set as current media
    this.currentMedia = media;
    
    // Get player elements
    const videoPlayer = window.querySelector('#media-video');
    const audioPlayer = window.querySelector('#media-audio');
    
    // Reset both players
    videoPlayer.pause();
    audioPlayer.pause();
    videoPlayer.style.display = 'none';
    audioPlayer.style.display = 'none';
    
    // Set the source based on media type
    if (media.type.startsWith('video')) {
      videoPlayer.src = media.url;
      videoPlayer.style.display = 'block';
      videoPlayer.play();
    } else if (media.type.startsWith('audio')) {
      audioPlayer.src = media.url;
      audioPlayer.style.display = 'block';
      audioPlayer.play();
    }
    
    // Update UI to show active media
    this.populateMediaLibrary();
  },
  
  /**
   * Play the next media in the library
   */
  playNextMedia() {
    if (!this.currentMedia || this.mediaLibrary.length === 0) return;
    
    // Find current index
    const currentIndex = this.mediaLibrary.findIndex(m => m.id === this.currentMedia.id);
    if (currentIndex === -1) return;
    
    // Get next index
    const nextIndex = (currentIndex + 1) % this.mediaLibrary.length;
    
    // Play next media
    this.playMedia(this.mediaLibrary[nextIndex].id);
  },
  
  /**
   * Delete a media item
   * @param {string} mediaId - ID of the media to delete
   */
  deleteMedia(mediaId) {
    // Find the media
    const media = this.mediaLibrary.find(m => m.id === mediaId);
    if (!media) return;
    
    // If it's the current media, stop playback
    if (this.currentMedia && this.currentMedia.id === mediaId) {
      const window = FlowWindows.getWindow(this.appId);
      if (window) {
        const videoPlayer = window.querySelector('#media-video');
        const audioPlayer = window.querySelector('#media-audio');
        
        videoPlayer.pause();
        audioPlayer.pause();
        videoPlayer.src = '';
        audioPlayer.src = '';
        
        this.currentMedia = null;
      }
    }
    
    // Remove from library
    this.mediaLibrary = this.mediaLibrary.filter(m => m.id !== mediaId);
    
    // Save library
    this.saveMediaLibrary();
    
    // Refresh library UI
    this.populateMediaLibrary();
    
    // Show notification
    FlowUI.showNotification(`Removed "${media.name}" from library`, 'info');
  },
  
  /**
   * Generate a unique ID
   * @returns {string} - Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
};