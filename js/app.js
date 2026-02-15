

import { initCart } from './cart.js';
import { openDB } from './db.js';
import { initDragDrop } from './dragdrop.js';
import { initNavigation, onPageActivate } from './navigation.js';
import { initPayment } from './payment.js';
import { initPOS } from './pos.js';
import { initProducts, loadProducts } from './products.js';
import { initSales, loadSales } from './sales.js';
import { initTheme } from './theme.js';
import { showToast } from './toast.js';



async function init() {
  try {
    // 1. Theme (synchronous, from localStorage)
    initTheme();

    // 2. Open IndexedDB
    await openDB();

    // 3. UI modules (no async deps)
    initNavigation();
    initCart();
    initProducts();
    initPOS();
    initPayment();
    initSales();
    initDragDrop();

    // 4. Load initial data
    await loadProducts();
    await loadSales();

    // 5. Register page activation hooks
    onPageActivate('purchase-list', loadSales);
    onPageActivate('product-list',  loadProducts);

    // 6. Seed demo data if empty (first run)
    await seedDemoIfEmpty();

    console.log('%c✅ Offline POS initialized', 'color:#00c9a7; font-weight:bold;');

  } catch (err) {
    console.error('Initialization error:', err);
    showToast(
      'Startup Error',
      'Could not initialize the database. Please reload.',
      'error',
      8000
    );
  }
}

/*  Demo seed (first run) */

import { ProductsDB } from './db.js';

async function seedDemoIfEmpty() {
  const products = await ProductsDB.getAll();
  if (products.length > 0) return; // Already seeded

  const demoProducts = [
    { name: 'Wireless Mouse',       description: 'Ergonomic Bluetooth mouse',   price: 850,  stock: 24, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { name: 'USB-C Hub (7-in-1)',    description: '4K HDMI, USB 3.0, PD 100W',  price: 1450, stock: 12, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { name: 'Mechanical Keyboard',  description: 'TKL, Brown switches, RGB',    price: 3200, stock: 8,  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { name: '27" Monitor (FHD)',     description: 'IPS panel, 75Hz, 5ms',       price: 18500,stock: 4,  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { name: 'Laptop Stand',         description: 'Adjustable aluminium stand',  price: 650,  stock: 30, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { name: 'Webcam 1080p',         description: 'Autofocus, built-in mic',     price: 2200, stock: 15, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { name: 'Desk Lamp (LED)',       description: 'Touch dimmer, 3 color temps',price: 780,  stock: 20, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { name: 'Cable Management Kit', description: 'Velcro + clips bundle',       price: 320,  stock: 50, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];

  for (const p of demoProducts) {
    await ProductsDB.add(p);
  }

  await loadProducts();

  showToast(
    '👋 Welcome!',
    'Demo products have been loaded. Start your first sale!',
    'info',
    5000
  );
}

/* Run  */
document.addEventListener('DOMContentLoaded', init);
