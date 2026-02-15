/**
 * navigation.js — Client-side page router
 * Manages active page views and nav highlight
 */

const navItems  = document.querySelectorAll('.nav-item[data-page]');
const pageViews = document.querySelectorAll('.page-view');

let _currentPage = 'new-sale';
const _listeners  = {};

/**
 * Navigate to a page
 * @param {string} pageId — e.g. 'new-sale', 'product-list', 'purchase-list'
 */
export function navigate(pageId) {
  if (_currentPage === pageId) return;

  // Deactivate current
  document.getElementById(`page-${_currentPage}`)?.classList.remove('active');
  document.getElementById(`nav-${_currentPage}`)?.classList.remove('active');
  document.getElementById(`nav-${_currentPage}`)?.removeAttribute('aria-current');

  _currentPage = pageId;

  // Activate target
  const targetPage = document.getElementById(`page-${pageId}`);
  const targetNav  = document.getElementById(`nav-${pageId}`);

  targetPage?.classList.add('active');
  targetNav?.classList.add('active');
  targetNav?.setAttribute('aria-current', 'page');

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Fire listeners
  _listeners[pageId]?.forEach(fn => fn());

  // Close mobile menu
  closeMobileMenu();
}

export function getCurrentPage() {
  return _currentPage;
}

/** Register callback when a page becomes active */
export function onPageActivate(pageId, callback) {
  if (!_listeners[pageId]) _listeners[pageId] = [];
  _listeners[pageId].push(callback);
}

/*  Mobile sidebar  */

const sidebar         = document.getElementById('sidebar');
const backdrop        = document.getElementById('sidebarBackdrop');
const mobileMenuBtn   = document.getElementById('mobileMenuBtn');

function openMobileMenu() {
  sidebar?.classList.add('mobile-open');
  backdrop?.classList.add('visible');
  mobileMenuBtn && (mobileMenuBtn.textContent = '✕');
}

function closeMobileMenu() {
  sidebar?.classList.remove('mobile-open');
  backdrop?.classList.remove('visible');
  mobileMenuBtn && (mobileMenuBtn.textContent = '☰');
}

function toggleMobileMenu() {
  sidebar?.classList.contains('mobile-open') ? closeMobileMenu() : openMobileMenu();
}

/*  Init  */

export function initNavigation() {
  // Wire nav buttons
  navItems.forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.page));
  });

  // Set default active
  navigate('new-sale');

  // Mobile menu
  mobileMenuBtn?.addEventListener('click', toggleMobileMenu);
  backdrop?.addEventListener('click', closeMobileMenu);

  // Keyboard: close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });
}
