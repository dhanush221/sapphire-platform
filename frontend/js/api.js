// Simple API wrapper for the Sapphire Platform frontend
// Works when:
// - Frontend is served by the backend on :5000 (same-origin), or
// - Frontend is served elsewhere (e.g., :5500) and backend on :5000
const BASE = (() => {
  if (typeof window === 'undefined' || !window.location) return 'http://localhost:5000';
  const { protocol, hostname, port } = window.location;
  if (port === '5000') return `${protocol}//${hostname}:${port}`;
  return `${protocol}//${hostname}:5000`;
})();

async function http(path, options = {}) {
  const user = JSON.parse(localStorage.getItem('sapphireUser') || '{}');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (user?.role) headers['x-user-role'] = user.role;
  if (user?.email) headers['x-user-email'] = user.email;
  const res = await fetch(`${BASE}${path}`, {
    headers,
    credentials: 'include',
    ...options
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

export const api = {
  // Tasks
  getTasks: () => http('/tasks'),
  createTask: (body) => http('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  updateTask: (id, body) => http(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTask: (id) => http(`/tasks/${id}`, { method: 'DELETE' }),
  reorderTasks: (updates) => http('/tasks/reorder', { method: 'PATCH', body: JSON.stringify({ updates }) }),

  // Deadlines
  getUpcomingDeadlines: () => http('/deadlines/upcoming'),
  createDeadline: (body) => http('/deadlines', { method: 'POST', body: JSON.stringify(body) }),

  // Subtasks (generic helpers for flexibility)
  get: (path) => http(path),
  post: (path, body) => http(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => http(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => http(path, { method: 'DELETE' })
};

export default api;
