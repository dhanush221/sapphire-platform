// userSettings.js

export function initializeUserSettings() {
  const openBtn = document.getElementById('openUserSettings');
  const modal = document.getElementById('userSettingsModal');
  if (!openBtn || !modal) return;

  const nameEl = document.getElementById('us_name');
  const emailEl = document.getElementById('us_email');
  const roleEl = document.getElementById('us_role');

  const fill = () => {
    const user = JSON.parse(localStorage.getItem('sapphireUser') || '{}');
    if (nameEl) nameEl.value = user.name || '';
    if (emailEl) emailEl.value = user.email || '';
    if (roleEl) roleEl.value = user.role || 'student';
  };

  openBtn.addEventListener('click', () => {
    fill();
    modal.classList.remove('hidden');
  });
  document.getElementById('us_cancel').addEventListener('click', () => {
    modal.classList.add('hidden');
  });
  document.getElementById('us_save').addEventListener('click', () => {
    const user = JSON.parse(localStorage.getItem('sapphireUser') || '{}');
    const next = {
      ...user,
      name: nameEl.value.trim() || user.name || 'User',
      email: emailEl.value.trim() || user.email || '',
      role: roleEl.value || user.role || 'student'
    };
    localStorage.setItem('sapphireUser', JSON.stringify(next));
    // Update dashboard greeting immediately
    const greetingEl = document.getElementById('greeting');
    if (greetingEl) {
      const now = new Date();
      const hour = now.getHours();
      let greeting = 'Hello';
      if (hour >= 5 && hour < 12) greeting = 'Good Morning';
      else if (hour >= 12 && hour < 17) greeting = 'Good Afternoon';
      else if (hour >= 17 && hour < 21) greeting = 'Good Evening';
      else greeting = 'Good Night';
      greetingEl.textContent = `${greeting}, ${next.name || 'User'}!`;
    }
    modal.classList.add('hidden');
  });
}

