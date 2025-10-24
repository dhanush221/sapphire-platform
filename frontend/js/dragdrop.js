// dragDrop.js

import { announceToScreenReader } from './state.js';
import { api } from './api.js';

// Initialize drag and drop for Kanban task cards and columns
let reorderTimer = null;
let pendingUpdates = null;

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

    column.addEventListener('drop', async function(e) {
      e.preventDefault();
      const taskId = e.dataTransfer.getData('text/plain');
      const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);

      if (taskCard) {
        // compute new order for all cards in this column (without mutating DOM)
        const updates = [];
        const statusAttr = this.getAttribute('data-status');
        const status = statusAttr === 'in-progress' ? 'in_progress' : statusAttr;
        const children = Array.from(this.querySelectorAll('.task-card'));
        children.forEach((el, index) => {
          const id = Number(el.dataset.taskId);
          updates.push({ id, status, orderIndex: index });
        });
        // Ensure moved card is included as last in this column if not present yet
        if (!children.find(el => Number(el.dataset.taskId) === Number(taskId))) {
          updates.push({ id: Number(taskId), status, orderIndex: children.length });
        }
        // Debounce rapid drops into a single reorder call
        pendingUpdates = updates;
        if (reorderTimer) clearTimeout(reorderTimer);
        reorderTimer = setTimeout(async () => {
          const toSend = pendingUpdates;
          pendingUpdates = null;
          try {
            await api.reorderTasks(toSend);
            announceToScreenReader('Task moved successfully');
            document.dispatchEvent(new CustomEvent('tasks:changed'));
          } catch (err) {
            console.error('Failed to reorder tasks', err);
          }
        }, 150);
      }
    });
  });
}

// No additional exports
