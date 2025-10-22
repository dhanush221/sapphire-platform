// tasks.js
import { tasks, currentMonth as initialMonth, currentYear as initialYear, announceToScreenReader } from './state.js';
// Local state mirrors for mutable values
let currentMonth = initialMonth;
let currentYear = initialYear;
let currentTaskView = 'kanban';
// DOM Elements for task views and calendar
const viewButtons = document.querySelectorAll('.view-btn');
const taskViews = document.querySelectorAll('.task-view');

// State for current task view (default assumed defined elsewhere)
// let currentTaskView = 'kanban'; 

// Sample tasks array assumed imported or global for filtering by date
// import { tasks } from './state.js'; or declared in main app

// Initialize Task Views buttons and calendar
export function initializeTaskViews() {
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      const view = this.getAttribute('data-view');
      showTaskView(view);
      setActiveViewButton(this);
    });
  });
}

// Show specified task view, update currentTaskView state
export function showTaskView(viewId) {
  // Hide all task views
  taskViews.forEach(view => {
    view.classList.remove('active');
  });

  // Show target view
  const targetView = document.getElementById(`${viewId}-view`);
  if (targetView) {
    targetView.classList.add('active');
    currentTaskView = viewId;

    // If calendar view, update it
    if (viewId === 'calendar') {
      updateCalendarView();
    }
  }

  // Update view buttons active state
  const targetViewButton = document.querySelector(`[data-view="${viewId}"]`);
  if (targetViewButton) {
    setActiveViewButton(targetViewButton);
  }
}

function setActiveViewButton(activeButton) {
  viewButtons.forEach(button => {
    button.classList.remove('active');
  });
  activeButton.classList.add('active');
}

// Calendar Functions

export function initializeCalendar() {
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');

  if (prevBtn) {
    prevBtn.addEventListener('click', function() {
      changeMonth(-1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function() {
      changeMonth(1);
    });
  }

  updateCalendarView();
}

function changeMonth(direction) {
  currentMonth += direction;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  updateCalendarView();
}

export function updateCalendarView() {
  const calendarTitle = document.getElementById('calendarTitle');
  if (calendarTitle) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    calendarTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
  }

  // Update calendar grid with proper task info
  generateCalendarDays();
}

function generateCalendarDays() {
  const calendarGrid = document.querySelector('.calendar-grid');
  if (!calendarGrid) return;

  // Remove existing day elements (keep headers)
  const dayElements = calendarGrid.querySelectorAll('.calendar-day, .calendar-day.empty');
  dayElements.forEach(el => el.remove());

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Add empty cells for days before first day of month
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';

    const dayNumber = document.createElement('span');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);

    // Check for tasks on this day
    const dayDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasks.filter(task => task.dueDate === dayDate); // Make sure `tasks` is available in scope

    if (dayTasks.length > 0) {
      dayElement.classList.add('has-task');

      // Add task dots
      dayTasks.forEach(task => {
        const taskDot = document.createElement('div');
        taskDot.className = `task-dot ${task.priority}`;
        dayElement.appendChild(taskDot);
      });

      // Add mini tasks summary
      const dayTasksContainer = document.createElement('div');
      dayTasksContainer.className = 'day-tasks';

      dayTasks.forEach(task => {
        const miniTask = document.createElement('div');
        miniTask.className = 'mini-task';
        miniTask.textContent = task.title.length > 15 ?
          task.title.substring(0, 15) + '...' :
          task.title;
        dayTasksContainer.appendChild(miniTask);
      });

      dayElement.appendChild(dayTasksContainer);
    }

    // Add click handler for showing tasks info for the day
    dayElement.addEventListener('click', function () {
      showDayTasks(day, dayTasks);
    });

    calendarGrid.appendChild(dayElement);
  }
}

// Accessibility: Announce tasks for the selected day
function showDayTasks(day, dayTasks) {
  if (dayTasks.length > 0) {
    const taskTitles = dayTasks.map(task => task.title).join(', ');
    announceToScreenReader(`Tasks for ${day}: ${taskTitles}`);
  } else {
    announceToScreenReader(`No tasks for ${day}`);
  }
}

// Placeholder: announceToScreenReader should be imported or defined globally,
// or passed as an argument when integrating modules.
