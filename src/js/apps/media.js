/**
 * FlowMedia App for Flowway TV OS
 * A media player for predefined audio and video files
 */
const FlowMedia = {
  appId: 'media',
  mediaLibrary: [
    {
      id: 'sample-video-1',
      name: 'Sample Video 1',
      type: 'video/mp4',
      url: 'public/videos/test.mp4',
      addedAt: new Date().toISOString()
    }
  ],
  currentMedia: null,
  
  /**
   * Initialize the app
   */
  init() {
    // No need to load from storage since we're using predefined media
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
    
    // Auto-play first media
    if (this.mediaLibrary.length > 0) {
      this.playMedia(this.mediaLibrary[0].id);
    }
  },
  
  /**
   * Set up app event listeners
   * @param {HTMLElement} windowElement - The app window element
   */
  setupEvents(windowElement) {
    if (!windowElement) return;
    
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
      thumbnail.textContent = '▶';
      
      const title = document.createElement('div');
      title.className = 'media-item-title';
      title.textContent = media.name;
      
      mediaItem.appendChild(thumbnail);
      mediaItem.appendChild(title);
      
      // Add click event
      mediaItem.addEventListener('click', () => {
        this.playMedia(media.id);
      });
      
      mediaItems.appendChild(mediaItem);
    });
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
  }
};