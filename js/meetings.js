// meetings.js

// Initialize meeting tab buttons and content toggling
export function initializeMeetingTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const tab = this.getAttribute('data-tab');

      // Update tab buttons active state
      tabButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');

      // Show corresponding tab content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tab) {
          content.classList.add('active');
        }
      });
    });
  });
}

// Show meeting details section and scroll to it smoothly
export function showMeetingDetails() {
  const meetingDetails = document.getElementById('meetingDetails');
  if (meetingDetails) {
    meetingDetails.style.display = 'block';
    meetingDetails.scrollIntoView({ behavior: 'smooth' });
  }
}
