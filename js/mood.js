// moodEnergy.js

// DOM Elements
const moodButtons = document.querySelectorAll('.mood-btn');
const energySlider = document.getElementById('energySlider');
const energyLabel = document.getElementById('energyLabel');

// Mutable states to be imported or shared
export let currentMood = 3;
export let currentEnergy = 3;

// Energy level definitions
export const energyLevels = [
  { label: "Very Low Energy", value: 1, color: "#ef4444" },
  { label: "Low Energy", value: 2, color: "#f97316" },
  { label: "Moderate Energy", value: 3, color: "#facc15" },
  { label: "Good Energy", value: 4, color: "#84cc16" },
  { label: "High Energy", value: 5, color: "#4ade80" }
];

// Initialize mood and energy tracking UI
export function initializeMoodTracking() {
  // Mood buttons
  moodButtons.forEach(button => {
    button.addEventListener('click', function() {
      const mood = parseInt(this.getAttribute('data-mood'));
      setMood(mood);
    });
  });

  // Energy slider
  if (energySlider) {
    energySlider.addEventListener('input', function() {
      currentEnergy = parseInt(this.value);
      updateEnergyLabel();
    });
  }

  // Initialize label on load
  updateEnergyLabel();
}

// Set mood state and update UI
export function setMood(mood) {
  currentMood = mood;

  // Update button selection styles
  moodButtons.forEach(button => {
    button.classList.remove('selected');
    if (parseInt(button.getAttribute('data-mood')) === mood) {
      button.classList.add('selected');
    }
  });

  // Show feedback if mood is low
  if (mood <= 2) {
    showMoodFeedback('low');
  }
}

// Update energy label text and color
export function updateEnergyLabel() {
  if (energyLabel) {
    const level = energyLevels.find(l => l.value === currentEnergy);
    energyLabel.textContent = level ? level.label : 'Moderate Energy';
    energyLabel.style.color = level ? level.color : '#facc15';
  }
}

// Low mood feedback handler
function showMoodFeedback(level) {
  if (level === 'low') {
    // Placeholder for support features: e.g. show resources or notifications
    console.log('Low mood detected - consider showing support resources');
  }
}
