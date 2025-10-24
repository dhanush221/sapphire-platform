// tasks.js - integrated with backend API (cleaned)
import { tasks as staticTasks, currentMonth as initialMonth, currentYear as initialYear, announceToScreenReader } from './state.js';
import { api } from './api.js';
import { showToast } from './ui.js';

let currentMonth = initialMonth;
let currentYear = initialYear;
let currentTaskView = 'kanban';
let tasks = [];
let calDeadlines = [];

const viewButtons = document.querySelectorAll('.view-btn');
const taskViews = document.querySelectorAll('.task-view');

export function initializeTaskViews() {
  viewButtons.forEach((button) => {
    button.addEventListener('click', function () {
      const view = this.getAttribute('data-view');
      showTaskView(view);
      setActiveViewButton(this);
    });
  });

  const addBtn = document.getElementById('addTaskBtn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      // Use the themed modal so users can set due date/priority
      openTaskModal(null);
    });
  }

  loadTasks().then(renderTasks).catch(console.error);

  // Update when external changes occur (e.g., drag/drop reorders)
  document.addEventListener('tasks:changed', async () => {
    await loadTasks();
    renderTasks();
  });
  document.addEventListener('deadlines:changed', async () => {
    await loadCalendarDeadlines();
    updateCalendarView();
  });
}

export function showTaskView(viewId) {
  taskViews.forEach((view) => view.classList.remove('active'));
  const targetView = document.getElementById(`${viewId}-view`);
  if (targetView) {
    targetView.classList.add('active');
    currentTaskView = viewId;
    if (viewId === 'calendar') updateCalendarView();
  }
  const targetViewButton = document.querySelector(`[data-view="${viewId}"]`);
  if (targetViewButton) setActiveViewButton(targetViewButton);
}

function setActiveViewButton(activeButton) {
  viewButtons.forEach((button) => button.classList.remove('active'));
  activeButton.classList.add('active');
}

export function initializeCalendar() {
  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');
  if (prevBtn) prevBtn.addEventListener('click', () => changeMonth(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => changeMonth(1));
  // Load deadlines for calendar once at init
  loadCalendarDeadlines().finally(updateCalendarView);
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
  generateCalendarDays();
}

function generateCalendarDays() {
  const calendarGrid = document.querySelector('.calendar-grid');
  if (!calendarGrid) return;
  const dayElements = calendarGrid.querySelectorAll('.calendar-day, .calendar-day.empty');
  dayElements.forEach((el) => el.remove());
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement('div');
    emptyDay.className = 'calendar-day empty';
    calendarGrid.appendChild(emptyDay);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    const dayNumber = document.createElement('span');
    dayNumber.className = 'day-number';
    dayNumber.textContent = day;
    dayElement.appendChild(dayNumber);
    const dayDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasks.filter(
      (task) => task.dueDate && task.dueDate.startsWith && task.dueDate.startsWith(dayDate)
    );
    const dayDeadlines = calDeadlines.filter(
      (d) => d.dueAt && d.dueAt.startsWith && d.dueAt.startsWith(dayDate)
    );
    if (dayTasks.length > 0) {
      dayElement.classList.add('has-task');
      dayTasks.forEach((task) => {
        const taskDot = document.createElement('div');
        const priority = task.priority || 'medium';
        const status = task.status || 'pending';
        taskDot.className = `task-dot ${priority} status-${status}`;
        const dueLabel = task.dueDate ? new Date(task.dueDate).toLocaleString() : '';
        taskDot.title = `${task.title}${dueLabel ? ' — ' + dueLabel : ''}`;
        dayElement.appendChild(taskDot);
      });
      const dayTasksContainer = document.createElement('div');
      dayTasksContainer.className = 'day-tasks';
      dayTasks.forEach((task) => {
        const miniTask = document.createElement('div');
        miniTask.className = 'mini-task';
        miniTask.textContent =
          task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title;
        const dueLabel = task.dueDate ? new Date(task.dueDate).toLocaleString() : '';
        miniTask.title = `${task.title}${dueLabel ? ' — ' + dueLabel : ''}`;
        dayTasksContainer.appendChild(miniTask);
      });
      // Also render deadlines as chips
      dayDeadlines.forEach((d) => {
        const chip = document.createElement('div');
        chip.className = 'mini-deadline';
        const t = d.title || d.task_title || 'Deadline';
        chip.textContent = t.length > 15 ? t.substring(0, 15) + '…' : t;
        const dueLabel = d.dueAt ? new Date(d.dueAt).toLocaleString() : '';
        chip.title = `${t}${dueLabel ? ' — ' + dueLabel : ''}`;
        dayTasksContainer.appendChild(chip);
      });
      dayElement.appendChild(dayTasksContainer);
    }
    // Add deadline dots (square) even if there are no tasks
    if (dayDeadlines.length > 0) {
      dayElement.classList.add('has-deadline');
      dayDeadlines.forEach((d) => {
        const dot = document.createElement('div');
        dot.className = 'deadline-dot';
        const t = d.title || d.task_title || 'Deadline';
        const dueLabel = d.dueAt ? new Date(d.dueAt).toLocaleString() : '';
        dot.title = `${t}${dueLabel ? ' — ' + dueLabel : ''}`;
        dayElement.appendChild(dot);
      });
    }
    dayElement.addEventListener('click', function () {
      showDayTasks(day, dayTasks);
    });
    calendarGrid.appendChild(dayElement);
  }
}

function showDayTasks(day, dayTasks) {
  if (dayTasks.length > 0) {
    const taskTitles = dayTasks.map((task) => task.title).join(', ');
    announceToScreenReader(`Tasks for ${day}: ${taskTitles}`);
  } else {
    announceToScreenReader(`No tasks for ${day}`);
  }
}

export async function loadTasks() {
  try {
    tasks = await api.getTasks();
  } catch (e) {
    console.warn('Falling back to static tasks:', e.message);
    tasks = staticTasks;
  }
}

async function loadCalendarDeadlines() {
  try {
    calDeadlines = await api.getUpcomingDeadlines();
  } catch (e) {
    calDeadlines = [];
  }
}

export function renderTasks() {
  const pending = document.getElementById('pendingTasks');
  const inprog = document.getElementById('inProgressTasks');
  const done = document.getElementById('completedTasks');
  if (pending) pending.innerHTML = '';
  if (inprog) inprog.innerHTML = '';
  if (done) done.innerHTML = '';
  const byStatus = { pending: [], in_progress: [], completed: [] };
  tasks.forEach((t) => {
    const s = t.status || 'pending';
    if (!byStatus[s]) byStatus[s] = [];
    byStatus[s].push(t);
  });
  Object.values(byStatus).forEach((arr) => arr.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)));

  const makeCard = (t) => {
    const el = document.createElement('div');
    el.className = 'task-card';
    el.dataset.taskId = t.id;
    const due = t.dueDate ? new Date(t.dueDate).toLocaleString() : '';
    el.innerHTML = `
      <div class="task-title">${t.title}</div>
      <div class="task-meta">${due}</div>
      <div class="task-actions">
        <button class="btn-edit" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="btn-delete" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
      <div class="task-subtasks" data-task-id="${t.id}">
        <div class="subtasks-list"></div>
        <div class="subtask-add">
          <input type="text" placeholder="Add a checklist item..." />
          <button class="btn-add-subtask">Add</button>
        </div>
      </div>`;
    el.querySelector('.btn-edit').addEventListener('click', () => openTaskModal(t));
    el.querySelector('.btn-delete').addEventListener('click', async () => {
      if (!confirm('Delete this task?')) return;
      try {
        await api.deleteTask(t.id);
        showToast('Task deleted', 'success');
        await loadTasks();
        renderTasks();
      } catch (e) {
        console.error(e);
        showToast('Failed to delete task', 'error');
      }
    });
    bindSubtasksUI(el, t.id);
    return el;
  };

  byStatus.pending.forEach((t) => pending && pending.appendChild(makeCard(t)));
  byStatus.in_progress.forEach((t) => inprog && inprog.appendChild(makeCard(t)));
  byStatus.completed.forEach((t) => done && done.appendChild(makeCard(t)));

  const list = document.getElementById('taskListView');
  if (list) {
    list.innerHTML = '';
    tasks.forEach((t) => {
      const row = document.createElement('div');
      row.className = 'task-row';

      const due = t.dueDate ? new Date(t.dueDate) : null;
      const dueStr = due ? due.toLocaleDateString() : '';
      const statusLabel = (t.status || 'pending').replace('_', ' ');

      row.innerHTML = `
        <div class="task-row__main">
          <div class="task-row__title">${t.title}</div>
          <div class="task-row__meta">${dueStr}</div>
        </div>
        <div class="task-row__badges">
          <span class="badge priority-${t.priority || 'medium'}">${(t.priority || 'medium')}</span>
          <span class="badge status-${t.status || 'pending'}">${statusLabel}</span>
        </div>`;

      list.appendChild(row);
    });
  }
  // Keep calendar in sync even when not visible
  updateCalendarView();
  import('./dragdrop.js').then(m => m.initializeDragAndDrop()).catch(()=>{});
}

async function bindSubtasksUI(cardEl, taskId) {
  const listEl = cardEl.querySelector('.subtasks-list');
  const addBtn = cardEl.querySelector('.btn-add-subtask');
  const input = cardEl.querySelector('input[type="text"]');
  const meta = cardEl.querySelector('.task-meta');

  async function load() {
    try {
      const items = await api.get(`/tasks/${taskId}/subtasks`);
      listEl.innerHTML = '';
      const doneCount = items.filter(i => i.done).length;
      const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0;
      if (meta) meta.textContent = (meta.textContent ? meta.textContent + ' • ' : '') + `Progress: ${pct}%`;
      items.forEach((st) => {
        const row = document.createElement('div');
        row.className = 'subtask-row';
        row.innerHTML = `
          <label>
            <input type="checkbox" ${st.done ? 'checked' : ''} />
            <span>${st.title}</span>
          </label>
          <button class="btn-st-delete"><i class="fas fa-trash"></i></button>`;
        row.querySelector('input').addEventListener('change', async (e) => {
          await api.put(`/subtasks/${st.id}`, { done: e.target.checked });
        });
        row.querySelector('.btn-st-delete').addEventListener('click', async () => {
          await api.del(`/subtasks/${st.id}`);
          await load();
        });
        listEl.appendChild(row);
      });
    } catch (e) {
      console.error('load subtasks', e);
    }
  }

  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      const title = input.value.trim();
      if (!title) return;
      await api.post(`/tasks/${taskId}/subtasks`, { title });
      input.value = '';
      await load();
    });
  }

  await load();
}

// Task modal (add/edit)
function ensureTaskModal() {
  if (document.getElementById('taskModal')) return;
  const modal = document.createElement('div');
  modal.id = 'taskModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3 id="taskModalTitle">Add Task</h3>
      <label>Title</label>
      <input type="text" id="taskTitle" />
      <label>Due Date</label>
      <input type="date" id="taskDueDate" />
      <label>Priority</label>
      <select id="taskPriority">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
      </select>
      <div class="modal-actions">
        <button class="btn-cancel">Cancel</button>
        <button class="btn btn--primary" id="taskSave">Save</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function openTaskModal(task = null) {
  ensureTaskModal();
  const modal = document.getElementById('taskModal');
  // Scope inputs to the modal to avoid clashes with similarly named IDs elsewhere
  const titleEl = modal.querySelector('#taskTitle');
  const dueEl = modal.querySelector('#taskDueDate');
  const priEl = modal.querySelector('#taskPriority');
  const header = document.getElementById('taskModalTitle');
  header.textContent = task ? 'Edit Task' : 'Add Task';
  titleEl.value = task?.title || '';
  dueEl.value = task?.dueDate ? task.dueDate.substring(0,10) : '';
  priEl.value = task?.priority || 'medium';
  modal.style.display = 'block';
  modal.querySelector('.btn-cancel').onclick = () => (modal.style.display = 'none');
  const saveBtn = document.getElementById('taskSave');
  saveBtn.onclick = async () => {
    const title = (titleEl.value || '').trim();
    if (!title) { showToast('Title is required', 'error'); return; }
    const dueDate = dueEl.value ? new Date(dueEl.value).toISOString().substring(0,10) : null;
    const priority = priEl.value;
    try {
      if (task) await api.updateTask(task.id, { title, dueDate, priority });
      else await api.createTask({ title, dueDate, priority });
      modal.style.display = 'none';
      showToast(task ? 'Task updated' : 'Task created', 'success');
      await loadTasks();
      renderTasks();
      // Refresh calendar deadlines list as well; tasks already updated above
      document.dispatchEvent(new CustomEvent('deadlines:changed'));
    } catch (e) { showToast(e.message || 'Failed to save task', 'error'); }
  };
}

export { openTaskModal };
