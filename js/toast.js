/**
 * toast.js — Toast notification system
 */

const container = document.getElementById('toastContainer');

const ICONS = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
  warning: '⚠️',
};

let _toastId = 0;

export function showToast(title, message = '', type = 'info', duration = 3500) {
  const id   = ++_toastId;
  const el   = document.createElement('div');
  el.className = `toast ${type}`;
  el.id        = `toast-${id}`;
  el.setAttribute('role', 'alert');
  el.innerHTML = `
    <span class="toast-icon">${ICONS[type] ?? 'ℹ️'}</span>
    <div class="toast-content">
      <div class="toast-title">${escHtml(title)}</div>
      ${message ? `<div class="toast-message">${escHtml(message)}</div>` : ''}
    </div>
  `;

  container.appendChild(el);

  const remove = () => {
    el.classList.add('removing');
    el.addEventListener('animationend', () => el.remove(), { once: true });
    // Fallback
    setTimeout(() => el.remove(), 400);
  };

  el.addEventListener('click', remove);
  setTimeout(remove, duration);
  return id;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
