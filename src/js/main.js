/**
 * Main JavaScript for Flowway TV OS
 * Initializes the OS and sets up global event listeners
 */
$(document).ready(() => {
  console.log('Flowway TV OS is starting...');
  
  // Prevent context menu on right-click
  document.addEventListener('contextmenu', (e) => {
    // Allow context menu in specific cases (handled by apps)
    if (e.target.closest('.notes-item') || 
        e.target.closest('.media-item') || 
        e.target.closest('.browser-bookmark-item')) {
      return;
    }
    
    e.preventDefault();
  });
  
  // Set document title
  document.title = 'Flowway TV OS';
  
  // Initialize OS
  // (OS initialization is already done in os.js)
});