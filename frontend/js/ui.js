// ui.js - toasts and helpers
export function showToast(message, type = 'info', timeout = 3000) {
  const container = ensureToastContainer();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.remove(), timeout);
}

function ensureToastContainer() {
  let c = document.getElementById('toastContainer');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toastContainer';
    document.body.appendChild(c);
  }
  return c;
}

