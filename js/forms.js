// forms.js

// Initialize form event listeners for deadlines and task checkboxes
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
function handleDeadlineSubmission(form) {
  const formData = new FormData(form);
  const deadlineData = {
    title: form.querySelector('input[type="text"]').value,
    dueDate: form.querySelector('input[type="date"]').value,
    priority: form.querySelector('select').value,
    reminders: Array.from(form.querySelectorAll('input[type="checkbox"]:checked'))
                    .map(cb => cb.parentElement.textContent.trim())
  };

  console.log('New deadline created:', deadlineData);
  showSuccessNotification('Deadline added successfully!');

  // Reset form after submission
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
