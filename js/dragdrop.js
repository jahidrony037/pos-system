/**
 * dragdrop.js — HTML5 Drag & Drop for POS panels
 * Allows swapping the left (selection) and right (summary) panels
 */

const STORAGE_KEY = 'pos_panel_order';

let _dragSrc = null;

/**
 * Initialize drag-and-drop on the POS grid panels
 */
export function initDragDrop() {
  const grid = document.getElementById('posGrid');
  if (!grid) return;

  // Restore saved order
  restoreOrder();

  // Attach drag listeners to all panels
  attachListeners();
}

function attachListeners() {
  const panels = document.querySelectorAll('.pos-panel[draggable="true"]');

  panels.forEach(panel => {
    panel.addEventListener('dragstart',  onDragStart);
    panel.addEventListener('dragend',    onDragEnd);
    panel.addEventListener('dragover',   onDragOver);
    panel.addEventListener('dragenter',  onDragEnter);
    panel.addEventListener('dragleave',  onDragLeave);
    panel.addEventListener('drop',       onDrop);
  });
}

function onDragStart(e) {
  _dragSrc = this;
  this.classList.add('dragging');

  // Firefox requires data to be set
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', this.id);
}

function onDragEnd() {
  this.classList.remove('dragging');
  // Clean up all hover states
  document.querySelectorAll('.pos-panel').forEach(p => p.classList.remove('drag-over'));
  _dragSrc = null;
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
}

function onDragEnter(e) {
  e.preventDefault();
  if (this !== _dragSrc) {
    this.classList.add('drag-over');
  }
}

function onDragLeave() {
  this.classList.remove('drag-over');
}

function onDrop(e) {
  e.preventDefault();
  e.stopPropagation();
  this.classList.remove('drag-over');

  if (_dragSrc && _dragSrc !== this) {
    swapPanels(_dragSrc, this);
    saveOrder();
  }
}

/**
 * Swap two panels in the DOM using a placeholder technique
 */
function swapPanels(a, b) {
  const grid       = document.getElementById('posGrid');
  const children   = [...grid.children];
  const idxA       = children.indexOf(a);
  const idxB       = children.indexOf(b);

  if (idxA === -1 || idxB === -1) return;

  // Insert placeholder
  const placeholder = document.createElement('div');
  grid.insertBefore(placeholder, a);

  // Swap
  grid.insertBefore(a, b);
  grid.insertBefore(b, placeholder);

  // Remove placeholder
  grid.removeChild(placeholder);

  // Re-attach listeners (newly ordered nodes keep their handlers, but re-apply for safety)
  attachListeners();
}

/*  Persistence  */

function saveOrder() {
  const grid  = document.getElementById('posGrid');
  if (!grid) return;
  const order = [...grid.children].map(el => el.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(order));
}

function restoreOrder() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  let order;
  try { order = JSON.parse(saved); } catch { return; }
  if (!Array.isArray(order)) return;

  const grid = document.getElementById('posGrid');
  if (!grid) return;

  order.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.parentElement === grid) {
      grid.appendChild(el);
    }
  });
}
