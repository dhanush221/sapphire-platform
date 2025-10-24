import {  initializeNavigation, showSection, setActiveNavButton } from './navigation.js';
import { initializeTaskViews, initializeCalendar, showTaskView } from './tasks.js';
import { initializeMoodTracking, updateEnergyLabel } from './mood.js';
import { initializeMeetingTabs, showMeetingDetails } from './meetings.js';
import './deadlines.js';
import { initializeSettings } from './settings.js';
import { initializeHelp, closeHelpModal, submitHelpRequest } from './help.js';
import { initializeForms } from './forms.js';
import { initializeBreakReminders } from './breakreminder.js';
import { initializeDragAndDrop } from './dragdrop.js';
import { addNewTask, viewResource } from './utilities.js';
import { announceToScreenReader } from './state.js';
import { checkAuth, logoutUser } from "./auth.js";
import { api } from './api.js';
import { initializeUserSettings } from './userSettings.js';

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
window.logoutUser = logoutUser;
console.log('DOM fully loaded and parsed 1');
// 2. DOM INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  announceToScreenReader('Application loaded');
  setActiveNavButton(document.querySelector(`[data-section="dashboard"]`));
  initializeNavigation();
  initializeTaskViews();
  initializeCalendar();
  initializeMoodTracking();
  initializeMeetingTabs();
  initializeSettings();
  initializeHelp();
  initializeForms();
  initializeBreakReminders();
  initializeDragAndDrop();
  initializeUserSettings();
  updateEnergyLabel();
  showSection('dashboard');
  showTaskView('kanban');
  updateDashboardTodayTasks();
  document.addEventListener('tasks:changed', updateDashboardTodayTasks);
});

// Dashboard mini list using API directly to avoid coupling
async function updateDashboardTodayTasks() {
  const el = document.getElementById('dashboardTodayTasks');
  if (!el) return;
  try {
    const items = await api.getTasks();
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    const todayStr = `${y}-${m}-${d}`;
    const todays = items.filter(t => t.dueDate && t.dueDate.startsWith && t.dueDate.startsWith(todayStr));
    el.innerHTML = '';
    if (todays.length === 0) {
      el.innerHTML = '<div class="task-mini-empty">No tasks due today</div>';
      return;
    }
    todays.slice(0,3).forEach(t => {
      const time = t.dueDate ? new Date(t.dueDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '';
      const row = document.createElement('div');
      row.className = 'task-mini-row';
      row.innerHTML = `<span class="task-mini-title">${t.title}</span><span class="task-mini-time">${time}</span>`;
      el.appendChild(row);
    });
  } catch {}
}
