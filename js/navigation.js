// navigation.js

import { announceToScreenReader } from './state.js';
import { closeHelpModal } from './help.js';
// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.content-section');
const helpModal = document.getElementById('helpModal');

// Current section state
let currentSection = 'dashboard';

// Initialize Application Navigation and Keyboard Shortcuts

function initializeNavigation() {
  navButtons.forEach(button => {
    button.addEventListener('click', function() {
      const section = this.getAttribute('data-section');
      showSection(section);
      setActiveNavButton(this);
    });
  });
  
  // Set initial active states
  showSection(currentSection);
  const initialNavButton = document.querySelector(`[data-section="${currentSection}"]`);
  if (initialNavButton) setActiveNavButton(initialNavButton);

  // Keyboard Navigation
  document.addEventListener('keydown', function(e) {
    // Close modal with Escape key
    if (e.key === 'Escape' && helpModal && !helpModal.classList.contains('hidden')) {
      closeHelpModal();
    }

    // Quick navigation with Alt + number keys
    if (e.altKey) {
      switch(e.key) {
        case '1':
          e.preventDefault();
          showSection('dashboard');
          break;
        case '2':
          e.preventDefault();
          showSection('tasks');
          break;
        case '3':
          e.preventDefault();
          showSection('deadlines');
          break;
        case '4':
          e.preventDefault();
          showSection('meetings');
          break;
        case '5':
          e.preventDefault();
          showSection('resources');
          break;
        case '6':
          e.preventDefault();
          showSection('settings');
          break;
      }
    }
  });
}

// Show Section and hide others
function showSection(sectionId) {
  // Hide all sections
  sections.forEach(section => {
    section.classList.remove('active');
    section.setAttribute('hidden', true);
  });
  
  // Show target section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
    targetSection.removeAttribute('hidden');
    currentSection = sectionId;
    
    // Announce section change for accessibility
    const sectionNames = {
      dashboard: 'Dashboard',
      tasks: 'Organization Tool',
      deadlines: 'Deadline Management',
      meetings: 'Meeting Transcription and Notes',
      resources: 'Resource Library',
      settings: 'Settings and Customization'
    };
    
    announceToScreenReader(`Navigated to ${sectionNames[sectionId] || sectionId}`);
  }
  
  // Update navigation buttons
  const targetNavButton = document.querySelector(`[data-section="${sectionId}"]`);
  if (targetNavButton) {
    setActiveNavButton(targetNavButton);
  }
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Set navigation active button states
function setActiveNavButton(activeButton) {
  navButtons.forEach(button => {
    button.classList.remove('active');
  });
  activeButton.classList.add('active');
}

export { initializeNavigation, showSection, setActiveNavButton };
