// deadlines.js - fetch and render upcoming deadlines with countdowns
import { api } from './api.js';
import { showToast } from './ui.js';

const containerId = 'upcomingDeadlines';
let timer = null;

async function loadDeadlines() {
  try {
    const items = await api.getUpcomingDeadlines();
    renderDeadlines(items);
  } catch (err) {
    console.error('Failed to load deadlines', err);
    showToast('Failed to load deadlines', 'error');
  }
}

function renderDeadlines(items) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '';

  if (!items || items.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'deadline-empty';
    empty.textContent = 'No upcoming deadlines';
    el.appendChild(empty);
    return;
  }

  items.forEach(d => {
    const row = document.createElement('div');
    row.className = 'deadline-row';
    const due = new Date(d.dueAt);
    const title = d.title || d.task_title || 'Deadline';

    const titleEl = document.createElement('span');
    titleEl.className = 'deadline-title';
    titleEl.textContent = title;

    const dueEl = document.createElement('span');
    dueEl.className = 'deadline-due';
    dueEl.textContent = due.toLocaleString();

    const countdown = document.createElement('span');
    countdown.className = 'deadline-countdown';
    countdown.dataset.due = due.toISOString();

    row.appendChild(titleEl);
    row.appendChild(dueEl);
    row.appendChild(countdown);
    el.appendChild(row);
  });
  updateCountdowns();
}

function updateCountdowns() {
  const els = document.querySelectorAll('.deadline-countdown');
  const now = Date.now();
  els.forEach(e => {
    const due = new Date(e.dataset.due).getTime();
    const diff = Math.max(0, due - now);
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    const secs = Math.floor((diff % 60000) / 1000);
    e.textContent = `${hrs}h ${remMins}m ${secs}s`;
  });
}

function startAutoRefresh() {
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    updateCountdowns();
  }, 1000);
  // Refresh list every minute
  setInterval(loadDeadlines, 60_000);
}

// Build simple modal form for deadlines (task select, datetime-local, offsets, email)
function ensureDeadlineModal() {
  if (document.getElementById('deadlineModal')) return;
  const modal = document.createElement('div');
  modal.id = 'deadlineModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Add Deadline</h3>
      <label>Task</label>
      <select id="deadlineTaskSelect"></select>
      <label>Title (optional)</label>
      <input type="text" id="deadlineTitle" />
      <label>Due At</label>
      <input type="datetime-local" id="deadlineDueAt" />
      <label>Reminder Offsets (minutes, comma-separated)</label>
      <input type="text" id="deadlineOffsets" placeholder="1440,180,60" />
      <div class="offset-presets">
        <span>Presets:</span>
        <button type="button" data-offs="1440">1 day</button>
        <button type="button" data-offs="180">3 hours</button>
        <button type="button" data-offs="60">1 hour</button>
      </div>
      <label>Recipient Email</label>
      <input type="email" id="deadlineRecipient" placeholder="student@example.com" />
      <div class="modal-actions">
        <button id="deadlineCancel">Cancel</button>
        <button id="deadlineSave" class="btn btn--primary">Save</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

async function openDeadlineModal() {
  ensureDeadlineModal();
  const modal = document.getElementById('deadlineModal');
  const sel = document.getElementById('deadlineTaskSelect');
  sel.innerHTML = '<option value="">Loading...</option>';
  try {
    const tasks = await api.getTasks();
    sel.innerHTML = '<option value="">Select a task</option>' + tasks.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
  } catch {
    sel.innerHTML = '<option value="">Failed to load tasks</option>';
  }
  modal.style.display = 'block';
  // Wire presets
  modal.querySelectorAll('.offset-presets button').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.getAttribute('data-offs');
      const input = document.getElementById('deadlineOffsets');
      input.value = input.value ? `${input.value},${v}` : v;
    });
  });
  document.getElementById('deadlineCancel').onclick = () => modal.style.display = 'none';
  document.getElementById('deadlineSave').onclick = async () => {
    const taskId = Number(sel.value);
    const title = (document.getElementById('deadlineTitle').value || '').trim();
    const dueAtLocal = document.getElementById('deadlineDueAt').value;
    const recipientEmail = document.getElementById('deadlineRecipient').value || null;
    const offs = (document.getElementById('deadlineOffsets').value || '1440,180,60')
      .split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
    if (!taskId || !dueAtLocal) return alert('Task and Due At are required');
    const dueAt = new Date(dueAtLocal).toISOString();
    try {
      await api.createDeadline({ taskId, title: title || null, dueAt, reminders: offs, recipientEmail });
      modal.style.display = 'none';
      showToast('Deadline created', 'success');
      await loadDeadlines();
      // Notify calendar/tasks to refresh deadlines view
      document.dispatchEvent(new CustomEvent('deadlines:changed'));
    } catch (e) { console.error(e); showToast(e.message || 'Failed to save deadline', 'error'); }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  loadDeadlines();
  startAutoRefresh();
  const addBtn = document.querySelector('#deadlines .section-header .btn');
  if (addBtn) addBtn.addEventListener('click', openDeadlineModal);
});

// Allow other modules (calendar) to pull fresh deadlines when they change
document.addEventListener('deadlines:changed', () => {
  loadDeadlines();
});

export { loadDeadlines };
