// breakReminder.js

import { currentEnergy } from './state.js';
import { showSuccessNotification, announceToScreenReader } from './utilities.js';

let breakReminderInterval;

// Start periodic break reminders if energy is low
export function startBreakReminders() {
  // Reminder every 30 minutes
  breakReminderInterval = setInterval(() => {
    if (currentEnergy <= 2) {
      showBreakReminder();
    }
  }, 30 * 60 * 1000);
}

// Show a break reminder notification and announce it
export function showBreakReminder() {
  showSuccessNotification('Consider taking a break to recharge!');
  announceToScreenReader('Break reminder: Consider taking a break to recharge');
}

// Stop periodic break reminders
export function stopBreakReminders() {
  if (breakReminderInterval) {
    clearInterval(breakReminderInterval);
  }
}

// Initialize break reminders on page load and listen to toggle changes
export function initializeBreakReminders() {
  const breakReminders = document.getElementById('breakReminders');
  if (breakReminders && breakReminders.checked) {
    startBreakReminders();
  }

  if (breakReminders) {
    breakReminders.addEventListener('change', function() {
      if (this.checked) {
        startBreakReminders();
      } else {
        stopBreakReminders();
      }
    });
  }
}
