// forms.js

// Initialize form event listeners for deadlines and task checkboxes
import { api } from './api.js';

export function initializeForms() {
  // Deadline form submission
  const deadlineForm = document.querySelector('.deadline-form');
  if (deadlineForm) {
    deadlineForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleDeadlineSubmission(this);
    });
  }

  // Task checkbox change handlers
  const taskCheckboxes = document.querySelectorAll('.task-checkbox input, .action-item input');
  taskCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      handleTaskCompletion(this);
    });
  });
}

// was present here .....
// Process deadline form submission data
async function handleDeadlineSubmission(form) {
  const title = (form.querySelector('input[type="text"]').value || '').trim();
  const dueDate = form.querySelector('input[type="date"]').value; // yyyy-mm-dd
  const priority = form.querySelector('select').value || 'medium';
  const reminderLabels = Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
    .map(cb => cb.parentElement.textContent.trim().toLowerCase());

  // Convert labels to minutes (supports presets and free-form like '2 hours before')
  const parseOffset = (s) => {
    const preset = {
      '1 day before': 1440,
      '3 hours before': 180,
      '1 hour before': 60
    };
    if (preset[s] != null) return preset[s];
    const m = s.match(/(\d+)\s*(day|hour|minute)s?\s*before/);
    if (!m) return null;
    const n = parseInt(m[1], 10);
    const unit = m[2];
    if (unit.startsWith('day')) return n * 1440;
    if (unit.startsWith('hour')) return n * 60;
    return n; // minutes
  };
  const reminders = reminderLabels.map(parseOffset).filter(n => typeof n === 'number' && !isNaN(n));

  // Build a local datetime: default to 17:00 local if only date
  if (!title || !dueDate) {
    showSuccessNotification('Please enter title and due date');
    return;
  }
  const dueAtLocal = new Date(`${dueDate}T17:00:00`);
  const dueAt = dueAtLocal.toISOString();

  try {
    // Create or reuse a task for this deadline
    const task = await api.createTask({ title, priority: priority.toLowerCase(), dueDate });
    await api.createDeadline({ taskId: task.id, title, dueAt, reminders });
    showSuccessNotification('Deadline added successfully!');
    document.dispatchEvent(new CustomEvent('deadlines:changed'));
  } catch (e) {
    console.error('Failed to save deadline via form', e);
    showSuccessNotification('Failed to add deadline');
  }

  form.reset();
}

// Handle visual styling for task completion toggles
function handleTaskCompletion(checkbox) {
  const taskItem = checkbox.closest('.task-list-item, .action-item');
  if (taskItem) {
    if (checkbox.checked) {
      taskItem.style.opacity = '0.6';
      taskItem.style.textDecoration = 'line-through';
    } else {
      taskItem.style.opacity = '1';
      taskItem.style.textDecoration = 'none';
    }
  }
}

// Helper function to show success notification (reuse or import as needed)
function showSuccessNotification(message) {
  const notification = document.getElementById('successNotification');
  if (notification) {
    const messageSpan = notification.querySelector('span');
    if (messageSpan) {
      messageSpan.textContent = message;
    }
    notification.classList.remove('hidden');

    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }
}
