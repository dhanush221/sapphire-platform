import {  initializeNavigation, showSection, setActiveNavButton } from './navigation.js';
import { initializeTaskViews, showTaskView } from './tasks.js';
import { initializeMoodTracking, updateEnergyLabel } from './mood.js';
import { initializeMeetingTabs, showMeetingDetails } from './meetings.js';
import { initializeSettings } from './settings.js';
import { initializeHelp, closeHelpModal, submitHelpRequest } from './help.js';
import { initializeForms } from './forms.js';
import { initializeBreakReminders } from './breakreminder.js';
import { initializeDragAndDrop } from './dragdrop.js';
import { addNewTask, viewResource } from './utilities.js';
import { announceToScreenReader } from './state.js';
import { checkAuth } from "./auth.js";

console.log('main loaded');

// js/main.js

checkAuth();

document.addEventListener("DOMContentLoaded", () => {
  updateGreeting();
  updateDate();
});

function updateGreeting() {
  const greetingEl = document.getElementById("greeting");
  const userData = JSON.parse(localStorage.getItem("sapphireUser"));
  const name = userData?.name || "User";

  const now = new Date();
  const hour = now.getHours();
  let greeting = "Hello";

  if (hour >= 5 && hour < 12) greeting = "Good Morning";
  else if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17 && hour < 21) greeting = "Good Evening";
  else greeting = "Good Night";

  greetingEl.textContent = `${greeting}, ${name}!`;
}

function updateDate() {
  const dateEl = document.getElementById("currentDate");
  const now = new Date();

  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  };

  dateEl.textContent = now.toLocaleDateString(undefined, options);
}



// 1. GLOBAL WINDOW ASSIGNMENTS RIGHT AFTER IMPORTS
window.showSection = showSection;
window.showTaskView = showTaskView;
window.showMeetingDetails = showMeetingDetails;
window.closeHelpModal = closeHelpModal;
window.submitHelpRequest = submitHelpRequest;
window.addNewTask = addNewTask;
window.viewResource = viewResource;
console.log('DOM fully loaded and parsed 1');
// 2. DOM INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  announceToScreenReader('Application loaded');
  setActiveNavButton(document.querySelector(`[data-section="dashboard"]`));
  initializeNavigation();
  initializeTaskViews();
  initializeMoodTracking();
  initializeMeetingTabs();
  initializeSettings();
  initializeHelp();
  initializeForms();
  initializeBreakReminders();
  initializeDragAndDrop();
  updateEnergyLabel();
  showSection('dashboard');
  showTaskView('kanban');
});
