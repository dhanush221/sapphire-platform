// state.js - centralized application state and sample data

export let currentSection = 'dashboard';
export let currentTaskView = 'kanban';
export let currentMood = 3;
export let currentEnergy = 3;
export let currentMonth = 9; // October (0-indexed)
export let currentYear = 2025;

export const energyLevels = [
  { label: "Very Low Energy", value: 1, color: "#ef4444" },
  { label: "Low Energy", value: 2, color: "#f97316" },
  { label: "Moderate Energy", value: 3, color: "#facc15" },
  { label: "Good Energy", value: 4, color: "#84cc16" },
  { label: "High Energy", value: 5, color: "#4ade80" }
];

// Sample task data
export const tasks = [
  {
    id: 1,
    title: "Complete project proposal draft",
    description: "Write first draft of the internship project proposal",
    priority: "high",
    dueDate: "2025-10-05",
    status: "in-progress",
    category: "project-work"
  },
  {
    id: 2,
    title: "Weekly team meeting preparation",
    description: "Prepare talking points and questions for team meeting",
    priority: "medium",
    dueDate: "2025-10-02",
    status: "pending",
    category: "meetings"
  },
  {
    id: 3,
    title: "Review workplace safety protocols",
    description: "Read through company safety guidelines",
    priority: "low",
    dueDate: "2025-10-08",
    status: "completed",
    category: "training"
  }
];
export function announceToScreenReader(message) {
  let liveRegion = document.getElementById('aria-live-navigation');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'aria-live-navigation';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.style.position = 'absolute';
    liveRegion.style.left = '-9999px';
    document.body.appendChild(liveRegion);
  }
  liveRegion.textContent = message;
}