const STORAGE_KEY = 'pos_theme';
const html = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');
const labelEl = document.getElementById('themeIconLabel');

/** Applies a theme and updates the toggle UI */
function applyTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
  updateLabel(theme);
}

function updateLabel(theme) {
  if (labelEl) {
    labelEl.textContent = theme === 'dark' ? '🌙 Dark' : '☀️ Light';
  }
}

/** Returns the current active theme */
export function getTheme() {
  return html.getAttribute('data-theme') || 'dark';
}

/** Toggles between dark and light */
export function toggleTheme() {
  // Briefly add transition class for smooth switch
  document.body.classList.add('theme-transition');
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  setTimeout(() => document.body.classList.remove('theme-transition'), 500);
}

/** Initialize from saved preference */
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) || 'dark';
  applyTheme(saved);

  toggleBtn?.addEventListener('click', toggleTheme);
}
