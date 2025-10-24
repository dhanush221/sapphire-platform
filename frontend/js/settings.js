// settings.js

// Initialize Settings UI controls
export function initializeSettings() {
  // Theme selector
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) {
    themeSelect.addEventListener('change', function() {
      setTheme(this.value);
    });
  }

  // High contrast toggle
  const highContrastToggle = document.getElementById('highContrast');
  if (highContrastToggle) {
    highContrastToggle.addEventListener('change', function() {
      toggleHighContrast(this.checked);
    });
  }

  // Font size buttons
  const fontSizeButtons = document.querySelectorAll('.font-size-controls .btn');
  fontSizeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const size = this.textContent.toLowerCase();
      setFontSize(size);

      // Update button UI states
      fontSizeButtons.forEach(btn => btn.classList.remove('btn--primary'));
      fontSizeButtons.forEach(btn => btn.classList.add('btn--outline'));
      this.classList.remove('btn--outline');
      this.classList.add('btn--primary');
    });
  });

}


function setTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-color-scheme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-color-scheme', 'light');
  } else {
    document.documentElement.removeAttribute('data-color-scheme');
  }
}

function toggleHighContrast(enabled) {
  if (enabled) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
}

function setFontSize(size) {
  const sizeMap = {
    small: '12px',
    medium: '14px',
    large: '16px'
  };

  if (sizeMap[size]) {
    document.documentElement.style.setProperty('--font-size-base', sizeMap[size]);
  }
}
 
