const FlowCalendar = {
  appId: 'calendar',

  init() {},

  open() {
    if (FlowWindows.exists(this.appId)) {
      FlowWindows.bringToFront(this.appId);
      return;
    }

    const template = document.getElementById('calendar-app-template');
    const content = template.content.cloneNode(true);
    const window = FlowWindows.create(this.appId, 'Calendar', content, {
      width: 350,
      height: 400
    });

    this.setupEvents(window);
  },

  setupEvents(window) {
    const monthYearEl = window.querySelector('#calendar-month-year');
    const grid = window.querySelector('#calendar-grid');
    const prevBtn = window.querySelector('#prev-month');
    const nextBtn = window.querySelector('#next-month');

    let currentDate = new Date();

    const renderCalendar = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      const firstDay = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();

      const today = new Date();
      const isThisMonth = today.getFullYear() === year && today.getMonth() === month;

      monthYearEl.textContent = currentDate.toLocaleDateString('default', {
        month: 'long',
        year: 'numeric'
      });

      grid.innerHTML = '';

      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      dayNames.forEach(day => {
        const div = document.createElement('div');
        div.textContent = day;
        div.style.fontWeight = 'bold';
        grid.appendChild(div);
      });

      for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        grid.appendChild(empty);
      }

      for (let i = 1; i <= lastDate; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.textContent = i;

        if (isThisMonth && i === today.getDate()) {
          dayDiv.classList.add('today');
        }

        grid.appendChild(dayDiv);
      }
    };

    prevBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });

    nextBtn.addEventListener('click', () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });

    renderCalendar();
  }
};