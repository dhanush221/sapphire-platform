// js/auth.js

export function checkAuth() {
  const user = localStorage.getItem("sapphireUser");
  const currentPage = window.location.pathname.split("/").pop();

  if (!user && currentPage !== "login.html" && currentPage !== "register.html") {
    window.location.href = "login.html";
  }
}

export function logoutUser() {
  localStorage.removeItem("sapphireUser");
  window.location.href = "login.html";
}

// Login
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  // Handle login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();
      const roleSel = document.getElementById("loginRole");
      const role = roleSel ? roleSel.value : 'student';

      if (email && password) {
        // Preserve name from a previous registration record if present
        const prev = JSON.parse(localStorage.getItem("sapphireUser") || "{}");
        const name = prev && prev.email === email && prev.name ? prev.name : undefined;
        localStorage.setItem("sapphireUser", JSON.stringify({ email, role, ...(name ? { name } : {}) }));
        window.location.href = "index.html";
      } else {
        alert("Please fill in all fields.");
      }
    });
  }

  // Handle registration
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("registerName").value.trim();
      const email = document.getElementById("registerEmail").value.trim();
      const password = document.getElementById("registerPassword").value;
      const confirm = document.getElementById("registerConfirm").value;
      const roleSel = document.getElementById("registerRole");
      const role = roleSel ? roleSel.value : 'student';

      if (!name || !email || !password || !confirm) {
        alert("Please complete all fields.");
        return;
      }

      if (password !== confirm) {
        alert("Passwords do not match!");
        return;
      }

      localStorage.setItem("sapphireUser", JSON.stringify({ name, email, role }));
      alert("Registration successful! Please log in.");
      window.location.href = "login.html";
    });
  }
});
