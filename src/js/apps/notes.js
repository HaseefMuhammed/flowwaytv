/**
 * FlowNotes App for Flowway TV OS
 * A simple notes app with localStorage persistence
 */
const FlowNotes = {
  appId: 'notes',
  notes: [],
  activeNoteId: null,
  
  /**
   * Initialize the app
   */
  init() {
    // Load notes from storage
    this.loadNotes();
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
    const template = document.getElementById('notes-app-template');
    if (!template) return;
    
    // Clone template content
    const content = template.content.cloneNode(true);
    
    // Create window
    const window = FlowWindows.create(this.appId, 'FlowNotes', content, {
      width: 800,
      height: 600
    });
    
    // Set up app events
    this.setupEvents(window);
    
    // Populate notes list
    this.populateNotesList();
    
    // Create a new note if none exist
    if (this.notes.length === 0) {
      this.createNewNote();
    } else {
      // Select the first note
      this.selectNote(this.notes[0].id);
    }
  },
  
  /**
   * Set up app event listeners
   * @param {HTMLElement} windowElement - The app window element
   */
  setupEvents(windowElement) {
    if (!windowElement) return;
    
    // New note button
    const newNoteBtn = windowElement.querySelector('.new-note');
    if (newNoteBtn) {
      newNoteBtn.addEventListener('click', () => {
        this.createNewNote();
      });
    }
    
    // Note title input
    const titleInput = windowElement.querySelector('.notes-title input');
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        this.updateCurrentNote('title', titleInput.value);
      });
    }
    
    // Note content textarea
    const contentTextarea = windowElement.querySelector('.notes-content textarea');
    if (contentTextarea) {
      contentTextarea.addEventListener('input', () => {
        this.updateCurrentNote('content', contentTextarea.value);
      });
    }
    
    // Search input
    const searchInput = windowElement.querySelector('.notes-search input');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this.searchNotes(searchInput.value);
      });
    }
  },
  
  /**
   * Load notes from storage
   */
  loadNotes() {
    this.notes = FlowStorage.get('notes', []);
    
    // If no notes, create a sample note
    if (this.notes.length === 0) {
      const sampleNote = {
        id: this.generateId(),
        title: 'Welcome to FlowNotes',
        content: 'This is your first note. Start typing to edit it!',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.notes.push(sampleNote);
      this.saveNotes();
    }
  },
  
  /**
   * Save notes to storage
   */
  saveNotes() {
    FlowStorage.set('notes', this.notes);
  },
  
  /**
   * Populate the notes list
   * @param {Array} notesToShow - Optional filtered list of notes to display
   */
  populateNotesList(notesToShow = null) {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    const notesList = window.querySelector('.notes-list');
    if (!notesList) return;
    
    // Clear the list
    notesList.innerHTML = '';
    
    // Use provided notes or all notes
    const notes = notesToShow || this.notes;
    
    // Sort notes by updated date (newest first)
    const sortedNotes = [...notes].sort((a, b) => {
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
    
    // Create note items
    sortedNotes.forEach(note => {
      const noteItem = document.createElement('div');
      noteItem.className = 'notes-item';
      noteItem.setAttribute('data-id', note.id);
      
      if (note.id === this.activeNoteId) {
        noteItem.classList.add('active');
      }
      
      const title = document.createElement('div');
      title.className = 'notes-item-title';
      title.textContent = note.title || 'Untitled';
      
      const preview = document.createElement('div');
      preview.className = 'notes-item-preview';
      preview.textContent = note.content.substring(0, 50) + (note.content.length > 50 ? '...' : '');
      
      noteItem.appendChild(title);
      noteItem.appendChild(preview);
      
      // Add click event
      noteItem.addEventListener('click', () => {
        this.selectNote(note.id);
      });
      
      // Add right-click context menu
      noteItem.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showNoteContextMenu(note.id, e.clientX, e.clientY);
      });
      
      notesList.appendChild(noteItem);
    });
  },
  
  /**
   * Show context menu for a note
   * @param {string} noteId - ID of the note
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  showNoteContextMenu(noteId, x, y) {
    // Remove any existing context menu
    const existingMenu = document.querySelector('.note-context-menu');
    if (existingMenu) {
      existingMenu.remove();
    }
    
    // Create context menu
    const menu = document.createElement('div');
    menu.className = 'note-context-menu';
    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.zIndex = '10000';
    menu.style.backgroundColor = 'var(--surface-color)';
    menu.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
    menu.style.borderRadius = '4px';
    menu.style.padding = '4px 0';
    
    // Add menu items
    const deleteItem = document.createElement('div');
    deleteItem.textContent = 'Delete Note';
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
      this.deleteNote(noteId);
      menu.remove();
    });
    
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
   * Select a note
   * @param {string} noteId - ID of the note to select
   */
  selectNote(noteId) {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    // Find the note
    const note = this.notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Set as active note
    this.activeNoteId = noteId;
    
    // Update UI to show the selected note
    const titleInput = window.querySelector('.notes-title input');
    const contentTextarea = window.querySelector('.notes-content textarea');
    
    if (titleInput) {
      titleInput.value = note.title || '';
    }
    
    if (contentTextarea) {
      contentTextarea.value = note.content || '';
    }
    
    // Update note items in the list
    const noteItems = window.querySelectorAll('.notes-item');
    noteItems.forEach(item => {
      if (item.getAttribute('data-id') === noteId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },
  
  /**
   * Create a new note
   */
  createNewNote() {
    // Create new note object
    const newNote = {
      id: this.generateId(),
      title: 'Untitled',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to notes array
    this.notes.unshift(newNote);
    
    // Save notes
    this.saveNotes();
    
    // Refresh notes list
    this.populateNotesList();
    
    // Select the new note
    this.selectNote(newNote.id);
  },
  
  /**
   * Update the current note
   * @param {string} field - Field to update (title or content)
   * @param {string} value - New value
   */
  updateCurrentNote(field, value) {
    if (!this.activeNoteId) return;
    
    // Find the note
    const noteIndex = this.notes.findIndex(n => n.id === this.activeNoteId);
    if (noteIndex === -1) return;
    
    // Update the field
    this.notes[noteIndex][field] = value;
    this.notes[noteIndex].updatedAt = new Date().toISOString();
    
    // Save notes
    this.saveNotes();
    
    // Update the notes list
    this.populateNotesList();
  },
  
  /**
   * Delete a note
   * @param {string} noteId - ID of the note to delete
   */
  deleteNote(noteId) {
    // Remove note from array
    this.notes = this.notes.filter(note => note.id !== noteId);
    
    // Save notes
    this.saveNotes();
    
    // Refresh notes list
    this.populateNotesList();
    
    // If the active note was deleted, select another note
    if (this.activeNoteId === noteId) {
      if (this.notes.length > 0) {
        this.selectNote(this.notes[0].id);
      } else {
        // If no notes left, create a new one
        this.createNewNote();
      }
    }
  },
  
  /**
   * Search notes
   * @param {string} query - Search query
   */
  searchNotes(query) {
    if (!query) {
      // If query is empty, show all notes
      this.populateNotesList();
      return;
    }
    
    // Filter notes that match the query
    const filteredNotes = this.notes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(query.toLowerCase());
      const contentMatch = note.content.toLowerCase().includes(query.toLowerCase());
      return titleMatch || contentMatch;
    });
    
    // Update notes list with filtered results
    this.populateNotesList(filteredNotes);
  },
  
  /**
   * Generate a unique ID
   * @returns {string} - Unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }
};