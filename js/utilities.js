// utilities.js

// Accessibility announcement for screen readers
export function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement completes
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Task Management function: add a new task (placeholder)
export function addNewTask() {
  const taskData = {
    id: Date.now(),
    title: 'New Task',
    description: 'Task description',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'pending',
    category: 'general'
  };

  console.log('New task added:', taskData);
  showSuccessNotification('Task added successfully!');
}

// Resource Management: view a resource (placeholder)
export function viewResource(resourceTitle) {
  console.log('Viewing resource:', resourceTitle);
  showSuccessNotification(`Opening ${resourceTitle}...`);
}

// Helper function to show success notifications (generic)
export function showSuccessNotification(message) {
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
