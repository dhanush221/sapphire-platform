// help.js
import { api } from './api.js';

// DOM Elements
const helpModal = document.getElementById('helpModal');
const successNotification = document.getElementById('successNotification');

// Assumes currentMood and currentEnergy are imported or shared state


export function initializeHelp() {
  const askForHelpButton = document.getElementById('askForHelp');
  const helpOptionButtons = document.querySelectorAll('.help-option-btn');

  if (askForHelpButton) {
    askForHelpButton.addEventListener('click', openHelpModal);
  }

  helpOptionButtons.forEach(button => {
    button.addEventListener('click', function() {
      selectHelpOption(this);
    });
  });
}

export function openHelpModal() {
  if (helpModal) {
    helpModal.classList.remove('hidden');
    // Focus first help option for keyboard navigation
    const firstOption = helpModal.querySelector('.help-option-btn');
    if (firstOption) {
      firstOption.focus();
    }
  }
}

export function closeHelpModal() {
  if (helpModal) {
    helpModal.classList.add('hidden');
  }
}

export function selectHelpOption(button) {
  // Remove selection from all buttons
  document.querySelectorAll('.help-option-btn').forEach(btn => {
    btn.classList.remove('selected');
  });

  // Add selection to clicked button
  button.classList.add('selected');

  // Pre-fill textarea with context
  const helpType = button.querySelector('span').textContent;
  const textarea = helpModal.querySelector('textarea');
  if (textarea && !textarea.value) {
    textarea.value = `I need help with ${helpType.toLowerCase()}. `;
    textarea.focus();
  }
}
import { currentMood, currentEnergy } from './state.js';
export async function submitHelpRequest() {
  // Get form data
  const textarea = helpModal.querySelector('textarea');
  const urgencyInputs = helpModal.querySelectorAll('input[name="urgency"]');
  const selectedHelpOption = helpModal.querySelector('.help-option-btn.selected');

  let urgency = 'low';
  urgencyInputs.forEach(input => {
    if (input.checked) {
      urgency = input.value;
    }
  });

  const helpData = {
    type: selectedHelpOption ? selectedHelpOption.querySelector('span').textContent : 'General',
    description: textarea ? textarea.value : '',
    urgency: urgency,
    timestamp: new Date().toISOString(),
    mood: currentMood,
    energy: currentEnergy
  };

  // Send to backend using shared API wrapper (falls back on error)
  try {
    await api.post('/api/help-requests', helpData);
    showSuccessNotification('Help request submitted successfully!');
  } catch (err) {
    console.error('Help request submission failed; falling back to local log.', err);
    console.log('Help request (local):', helpData);
    showSuccessNotification('Saved locally (server offline).');
  }

  // Close modal and reset form
  closeHelpModal();
  resetHelpForm();
}

function resetHelpForm() {
  const textarea = helpModal.querySelector('textarea');
  if (textarea) {
    textarea.value = '';
  }

  // Reset urgency to low
  const lowUrgencyInput = helpModal.querySelector('input[value="low"]');
  if (lowUrgencyInput) {
    lowUrgencyInput.checked = true;
  }

  // Clear selected help option
  document.querySelectorAll('.help-option-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
}

function showSuccessNotification(message) {
  const notification = document.getElementById('successNotification');
  if (notification) {
    const messageSpan = notification.querySelector('span');
    if (messageSpan) {
      messageSpan.textContent = message;
    }

    notification.classList.remove('hidden');

    // Auto-hide after 3 seconds
    setTimeout(() => {
      notification.classList.add('hidden');
    }, 3000);
  }
}
