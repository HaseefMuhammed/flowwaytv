/**
 * FlowClock App for Flowway TV OS
 * A digital clock with alarms and timezones
 */
const FlowClock = {
  appId: 'clock',
  timezones: [],
  alarms: [],
  clockInterval: null,
  alarmSound: new Audio('public/audio/alarm.mp3'),
  
  /**
   * Initialize the app
   */
  init() {
    // Load timezones and alarms from storage
    this.loadTimezones();
    this.loadAlarms();
    
    // Configure alarm sound
    this.alarmSound.loop = true;
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
    const template = document.getElementById('clock-app-template');
    if (!template) return;
    
    // Clone template content
    const content = template.content.cloneNode(true);
    
    // Create window
    const window = FlowWindows.create(this.appId, 'FlowClock', content, {
      width: 600,
      height: 500
    });
    
    // Set up app events
    this.setupEvents(window);
    
    // Start clock updates
    this.startClock();
    
    // Populate timezone list
    this.populateTimezones();
    
    // Populate alarm list
    this.populateAlarms();
  },
  
  /**
   * Set up app event listeners
   * @param {HTMLElement} windowElement - The app window element
   */
  setupEvents(windowElement) {
    if (!windowElement) return;
    
    // Add timezone button
    const addTimezoneBtn = windowElement.querySelector('.add-timezone');
    if (addTimezoneBtn) {
      addTimezoneBtn.addEventListener('click', () => {
        this.showAddTimezoneDialog();
      });
    }
    
    // Add alarm button
    const addAlarmBtn = windowElement.querySelector('.add-alarm');
    if (addAlarmBtn) {
      addAlarmBtn.addEventListener('click', () => {
        this.showAddAlarmDialog();
      });
    }
  },
  
  /**
   * Load timezones from storage
   */
  loadTimezones() {
    this.timezones = FlowStorage.get('clockTimezones', [
      { id: 'local', name: 'Local Time', timezone: 'local' }
    ]);
  },
  
  /**
   * Save timezones to storage
   */
  saveTimezones() {
    FlowStorage.set('clockTimezones', this.timezones);
  },
  
  /**
   * Load alarms from storage
   */
  loadAlarms() {
    this.alarms = FlowStorage.get('clockAlarms', []);
    
    // Process alarms for expired ones
    const now = new Date();
    this.alarms = this.alarms.filter(alarm => {
      const alarmTime = new Date(alarm.time);
      return alarmTime > now || alarm.repeat;
    });
    
    this.saveAlarms();
  },
  
  /**
   * Save alarms to storage
   */
  saveAlarms() {
    FlowStorage.set('clockAlarms', this.alarms);
  },
  
  /**
   * Start the clock
   */
  startClock() {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    // Update immediately
    this.updateClock();
    
    // Update every second
    this.clockInterval = setInterval(() => {
      this.updateClock();
      this.checkAlarms();
    }, 1000);
  },
  
  /**
   * Stop the clock
   */
  stopClock() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
      this.clockInterval = null;
    }
  },
  
  /**
   * Update the clock display
   */
  updateClock() {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) {
      this.stopClock();
      return;
    }
    
    const now = new Date();
    
    // Update main clock
    const clockTime = window.querySelector('.clock-time');
    const clockDate = window.querySelector('.clock-date');
    
    if (clockTime) {
      const timeStr = now.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      clockTime.textContent = timeStr;
    }
    
    if (clockDate) {
      const dateStr = now.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      clockDate.textContent = dateStr;
    }
    
    // Update timezone clocks
    this.updateTimezones();
  },
  
  /**
   * Update timezone displays
   */
  updateTimezones() {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    const timezoneItems = window.querySelectorAll('.timezone-item');
    const now = new Date();
    
    timezoneItems.forEach(item => {
      const timezoneId = item.getAttribute('data-id');
      const timezone = this.timezones.find(tz => tz.id === timezoneId);
      
      if (!timezone) return;
      
      const timeElement = item.querySelector('.timezone-time');
      if (!timeElement) return;
      
      let timeStr;
      
      if (timezone.timezone === 'local') {
        timeStr = now.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit'
        });
      } else {
        try {
          timeStr = now.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone.timezone
          });
        } catch (e) {
          timeStr = 'Invalid timezone';
        }
      }
      
      timeElement.textContent = timeStr;
    });
  },
  
  /**
   * Check for active alarms
   */
  checkAlarms() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    this.alarms.forEach(alarm => {
      const alarmDate = new Date(alarm.time);
      const alarmTime = alarmDate.getHours() * 60 + alarmDate.getMinutes();
      
      if (currentTime === alarmTime && now.getSeconds() === 0) {
        // Check if alarm should trigger today
        if (alarm.repeat) {
          // Get day of week (0-6, 0 is Sunday)
          const dayOfWeek = now.getDay();
          const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
          const today = dayNames[dayOfWeek];
          
          // Check if alarm is set for today
          if (alarm.days.includes(today)) {
            this.triggerAlarm(alarm);
          }
        } else {
          // One-time alarm
          const alarmDay = alarmDate.setHours(0, 0, 0, 0);
          const today = now.setHours(0, 0, 0, 0);
          
          if (alarmDay === today) {
            this.triggerAlarm(alarm);
            
            // Remove one-time alarm after triggering
            this.alarms = this.alarms.filter(a => a.id !== alarm.id);
            this.saveAlarms();
            this.populateAlarms();
          }
        }
      }
    });
  },
  
  /**
   * Trigger an alarm
   * @param {Object} alarm - The alarm to trigger
   */
  triggerAlarm(alarm) {
    // Show notification
    const notification = FlowUI.showNotification(`Alarm: ${alarm.label || 'Alarm'}`, 'info', 0);
    // Play alarm sound
    this.alarmSound.currentTime = 0;
    this.alarmSound.play().catch(() => {
      // Fallback: try to reload and play again
      this.alarmSound.load();
      this.alarmSound.play().catch(() => {});
    });
    // Add stop button to notification
    if (notification) {
      const stopBtn = document.createElement('button');
      stopBtn.className = 'btn btn-sm btn-primary ms-2';
      stopBtn.textContent = 'Stop Alarm';
      stopBtn.addEventListener('click', () => {
        this.stopAlarmSound();
        notification.remove();
        // Also close the alarm modal if open
        const alarmModal = document.getElementById('alarmRingModal');
        if (alarmModal) {
          const bsModal = bootstrap.Modal.getInstance(alarmModal);
          if (bsModal) bsModal.hide();
        }
      });
      notification.querySelector('.toast-body').appendChild(stopBtn);
    }

    // Show alarm popup modal
    let alarmModal = document.getElementById('alarmRingModal');
    if (alarmModal) alarmModal.remove(); // Remove any existing
    alarmModal = document.createElement('div');
    alarmModal.className = 'modal fade';
    alarmModal.id = 'alarmRingModal';
    alarmModal.setAttribute('tabindex', '-1');
    alarmModal.setAttribute('aria-labelledby', 'alarmRingModalLabel');
    alarmModal.setAttribute('aria-hidden', 'true');
    alarmModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="alarmRingModalLabel">Alarm</h5>
          </div>
          <div class="modal-body text-center">
            <div style="font-size:2rem;font-weight:bold;">${alarm.label || 'Alarm'}</div>
            <div style="font-size:1.5rem;">${new Date(alarm.time).toLocaleTimeString(undefined, {hour: '2-digit', minute: '2-digit'})}</div>
            <div class="mt-3">
              <button type="button" class="btn btn-danger btn-lg" id="stop-alarm-popup-btn">Stop Alarm</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(alarmModal);
    const bsModal = new bootstrap.Modal(alarmModal, {backdrop: 'static', keyboard: false});
    bsModal.show();
    // Stop alarm on button click
    alarmModal.querySelector('#stop-alarm-popup-btn').addEventListener('click', () => {
      this.stopAlarmSound();
      bsModal.hide();
      if (notification) notification.remove();
    });
    // Clean up modal DOM after hidden
    alarmModal.addEventListener('hidden.bs.modal', () => {
      alarmModal.remove();
    });
  },
  
  /**
   * Stop the alarm sound
   */
  stopAlarmSound() {
    this.alarmSound.pause();
    this.alarmSound.currentTime = 0;
  },
  
  /**
   * Populate timezone list
   */
  populateTimezones() {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    const timezoneList = window.querySelector('.timezone-list');
    if (!timezoneList) return;
    
    // Clear the list
    timezoneList.innerHTML = '';
    
    // Add each timezone
    this.timezones.forEach(timezone => {
      const item = document.createElement('div');
      item.className = 'timezone-item';
      item.setAttribute('data-id', timezone.id);
      
      const nameElement = document.createElement('div');
      nameElement.className = 'timezone-name';
      nameElement.textContent = timezone.name;
      
      const timeElement = document.createElement('div');
      timeElement.className = 'timezone-time';
      timeElement.textContent = '--:--';
      
      item.appendChild(nameElement);
      item.appendChild(timeElement);
      
      // Add delete button (except for local time)
      if (timezone.id !== 'local') {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.innerHTML = '&times;';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteTimezone(timezone.id);
        });
        
        item.appendChild(deleteBtn);
      }
      
      timezoneList.appendChild(item);
    });
  },
  
  /**
   * Populate alarm list
   */
  populateAlarms() {
    const window = FlowWindows.getWindow(this.appId);
    if (!window) return;
    
    const alarmList = window.querySelector('.alarm-list');
    if (!alarmList) return;
    
    // Clear the list
    alarmList.innerHTML = '';
    
    // Sort alarms by time
    const sortedAlarms = [...this.alarms].sort((a, b) => {
      return new Date(a.time) - new Date(b.time);
    });
    
    // Add each alarm
    sortedAlarms.forEach(alarm => {
      const item = document.createElement('div');
      item.className = 'alarm-item';
      item.setAttribute('data-id', alarm.id);
      
      const alarmTime = new Date(alarm.time);
      const timeStr = alarmTime.toLocaleTimeString(undefined, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      const timeElement = document.createElement('div');
      timeElement.className = 'alarm-time';
      timeElement.textContent = timeStr;
      
      const labelElement = document.createElement('div');
      labelElement.className = 'alarm-label';
      labelElement.textContent = alarm.label || 'Alarm';
      
      const statusElement = document.createElement('div');
      statusElement.className = 'alarm-status';
      
      // Add day indicators for repeating alarms
      if (alarm.repeat) {
        const dayElement = document.createElement('div');
        dayElement.className = 'alarm-day';
        const days = alarm.days.map(day => day.charAt(0).toUpperCase()).join(' ');
        dayElement.textContent = days;
        statusElement.appendChild(dayElement);
      }
      
      // Add toggle switch
      const toggleLabel = document.createElement('label');
      toggleLabel.className = 'form-check form-switch';
      
      const toggleInput = document.createElement('input');
      toggleInput.className = 'form-check-input';
      toggleInput.type = 'checkbox';
      toggleInput.checked = alarm.enabled;
      toggleInput.addEventListener('change', () => {
        this.toggleAlarm(alarm.id, toggleInput.checked);
      });
      
      toggleLabel.appendChild(toggleInput);
      statusElement.appendChild(toggleLabel);
      
      const actionsElement = document.createElement('div');
      actionsElement.className = 'alarm-actions';
      
      // Add delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm btn-outline-danger';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.addEventListener('click', () => {
        this.deleteAlarm(alarm.id);
      });
      
      actionsElement.appendChild(deleteBtn);
      
      item.appendChild(timeElement);
      item.appendChild(labelElement);
      item.appendChild(statusElement);
      item.appendChild(actionsElement);
      
      alarmList.appendChild(item);
    });
  },
  
  /**
   * Show dialog to add a new timezone
   */
  showAddTimezoneDialog() {
    // Create modal using Bootstrap
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'addTimezoneModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'addTimezoneModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addTimezoneModalLabel">Add Timezone</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="timezone-name" class="form-label">Name</label>
              <input type="text" class="form-control" id="timezone-name" placeholder="e.g., New York">
            </div>
            <div class="mb-3">
              <label for="timezone-id" class="form-label">Timezone</label>
              <select class="form-select" id="timezone-id">
                <option value="">Select timezone...</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="America/Chicago">America/Chicago</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Asia/Shanghai">Asia/Shanghai</option>
                <option value="Asia/Dubai">Asia/Dubai</option>
                <option value="Australia/Sydney">Australia/Sydney</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="add-timezone-btn">Add</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize Bootstrap modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Add button event
    const addButton = modal.querySelector('#add-timezone-btn');
    addButton.addEventListener('click', () => {
      const name = modal.querySelector('#timezone-name').value.trim();
      const timezone = modal.querySelector('#timezone-id').value;
      
      if (name && timezone) {
        this.addTimezone(name, timezone);
        bsModal.hide();
      }
    });
    
    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  },
  
  /**
   * Show dialog to add a new alarm
   */
  showAddAlarmDialog() {
    // Create modal using Bootstrap
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'addAlarmModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-labelledby', 'addAlarmModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    
    // Create days of week checkboxes
    const daysOfWeek = [
      { id: 'sun', label: 'Sunday' },
      { id: 'mon', label: 'Monday' },
      { id: 'tue', label: 'Tuesday' },
      { id: 'wed', label: 'Wednesday' },
      { id: 'thu', label: 'Thursday' },
      { id: 'fri', label: 'Friday' },
      { id: 'sat', label: 'Saturday' }
    ];
    
    const daysCheckboxes = daysOfWeek.map(day => `
      <div class="form-check form-check-inline">
        <input class="form-check-input" type="checkbox" id="day-${day.id}" value="${day.id}">
        <label class="form-check-label" for="day-${day.id}">${day.label.charAt(0)}</label>
      </div>
    `).join('');
    
    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="addAlarmModalLabel">Add Alarm</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="alarm-time" class="form-label">Time</label>
              <input type="time" class="form-control" id="alarm-time" required>
            </div>
            <div class="mb-3">
              <label for="alarm-label" class="form-label">Label</label>
              <input type="text" class="form-control" id="alarm-label" placeholder="e.g., Wake up">
            </div>
            <div class="mb-3">
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="alarm-repeat">
                <label class="form-check-label" for="alarm-repeat">Repeat</label>
              </div>
            </div>
            <div class="mb-3" id="days-container" style="display: none;">
              <label class="form-label">Days</label>
              <div class="days-selector">
                ${daysCheckboxes}
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" id="add-alarm-btn">Add</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialize Bootstrap modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Show/hide days selector based on repeat toggle
    const repeatToggle = modal.querySelector('#alarm-repeat');
    const daysContainer = modal.querySelector('#days-container');
    
    repeatToggle.addEventListener('change', () => {
      daysContainer.style.display = repeatToggle.checked ? 'block' : 'none';
    });
    
    // Add button event
    const addButton = modal.querySelector('#add-alarm-btn');
    addButton.addEventListener('click', () => {
      const timeInput = modal.querySelector('#alarm-time');
      const labelInput = modal.querySelector('#alarm-label');
      const repeatToggle = modal.querySelector('#alarm-repeat');
      
      const time = timeInput.value;
      const label = labelInput.value.trim();
      const repeat = repeatToggle.checked;
      
      if (!time) return;
      
      let days = [];
      if (repeat) {
        // Get selected days
        daysOfWeek.forEach(day => {
          const checkbox = modal.querySelector(`#day-${day.id}`);
          if (checkbox && checkbox.checked) {
            days.push(day.id);
          }
        });
        
        if (days.length === 0) {
          // If no days selected, select all days
          days = daysOfWeek.map(day => day.id);
        }
      }
      
      this.addAlarm(time, label, repeat, days);
      bsModal.hide();
    });
    
    // Clean up when modal is hidden
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  },
  
  /**
   * Add a new timezone
   * @param {string} name - Display name for the timezone
   * @param {string} timezone - IANA timezone identifier
   */
  addTimezone(name, timezone) {
    // Create timezone object
    const timezoneObj = {
      id: Date.now().toString(36),
      name: name,
      timezone: timezone
    };
    
    // Add to timezones
    this.timezones.push(timezoneObj);
    
    // Save timezones
    this.saveTimezones();
    
    // Update UI
    this.populateTimezones();
    this.updateTimezones();
    
    // Show notification
    FlowUI.showNotification(`Added timezone: ${name}`, 'success');
  },
  
  /**
   * Delete a timezone
   * @param {string} id - ID of the timezone to delete
   */
  deleteTimezone(id) {
    // Remove from timezones
    this.timezones = this.timezones.filter(tz => tz.id !== id);
    
    // Save timezones
    this.saveTimezones();
    
    // Update UI
    this.populateTimezones();
    
    // Show notification
    FlowUI.showNotification('Timezone removed', 'info');
  },
  
  /**
   * Add a new alarm
   * @param {string} timeStr - Alarm time (HH:MM format)
   * @param {string} label - Alarm label
   * @param {boolean} repeat - Whether the alarm repeats
   * @param {Array} days - Days to repeat (array of 'sun', 'mon', etc.)
   */
  addAlarm(timeStr, label, repeat, days) {
    // Create a date object for the alarm time
    const now = new Date();
    const [hours, minutes] = timeStr.split(':').map(Number);
    
    const alarmTime = new Date();
    alarmTime.setHours(hours, minutes, 0, 0);
    
    // If the time is in the past, set it for tomorrow
    if (alarmTime < now && !repeat) {
      alarmTime.setDate(alarmTime.getDate() + 1);
    }
    
    // Create alarm object
    const alarm = {
      id: Date.now().toString(36),
      time: alarmTime.toISOString(),
      label: label,
      repeat: repeat,
      days: repeat ? days : [],
      enabled: true
    };
    
    // Add to alarms
    this.alarms.push(alarm);
    
    // Save alarms
    this.saveAlarms();
    
    // Update UI
    this.populateAlarms();
    
    // Show notification
    FlowUI.showNotification(`Alarm set for ${timeStr}`, 'success');
  },
  
  /**
   * Delete an alarm
   * @param {string} id - ID of the alarm to delete
   */
  deleteAlarm(id) {
    // Remove from alarms
    this.alarms = this.alarms.filter(a => a.id !== id);
    
    // Save alarms
    this.saveAlarms();
    
    // Update UI
    this.populateAlarms();
    
    // Show notification
    FlowUI.showNotification('Alarm removed', 'info');
  },
  
  /**
   * Toggle alarm enabled state
   * @param {string} id - Alarm ID
   * @param {boolean} enabled - New enabled state
   */
  toggleAlarm(id, enabled) {
    // Find alarm
    const alarmIndex = this.alarms.findIndex(a => a.id === id);
    if (alarmIndex === -1) return;
    
    // Update enabled state
    this.alarms[alarmIndex].enabled = enabled;
    
    // Save alarms
    this.saveAlarms();
    
    // Show notification
    const alarm = this.alarms[alarmIndex];
    const alarmTime = new Date(alarm.time);
    const timeStr = alarmTime.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    FlowUI.showNotification(
      `Alarm ${timeStr} ${enabled ? 'enabled' : 'disabled'}`,
      'info'
    );
  }
};