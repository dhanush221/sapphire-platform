// dragDrop.js

import { announceToScreenReader } from './state.js';

// Initialize drag and drop for Kanban task cards and columns
export function initializeDragAndDrop() {
  const taskCards = document.querySelectorAll('.task-card');
  const kanbanColumns = document.querySelectorAll('.kanban-column');

  taskCards.forEach(card => {
    card.draggable = true;

    card.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', this.dataset.taskId);
      this.classList.add('dragging');
    });

    card.addEventListener('dragend', function() {
      this.classList.remove('dragging');
    });
  });

  kanbanColumns.forEach(column => {
    column.addEventListener('dragover', function(e) {
      e.preventDefault();
    });

    column.addEventListener('drop', function(e) {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('text/plain');
      const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);

      if (taskCard) {
        this.appendChild(taskCard);
        announceToScreenReader('Task moved successfully');
      }
    });
  });
}

// No additional exports
