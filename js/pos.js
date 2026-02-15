/**
 * pos.js — Product selection form (New Sale page)
 * Handles product select, price auto-populate, qty stepper, add to cart
 */

import { addToCart } from './cart.js';
import { getProductById } from './products.js';
import { showToast } from './toast.js';
import { fmt } from './utils.js';

/*  DOM refs  */
const productForm = document.getElementById('productForm');
const productSelect  = document.getElementById('productSelect');
const priceDisplayEl = document.getElementById('priceDisplay');
const priceValueEl = document.getElementById('priceValue');
const productPriceEl = document.getElementById('productPrice');
const quantityInput  = document.getElementById('quantityInput');
const qtyMinus = document.getElementById('qtyMinus');
const qtyPlus = document.getElementById('qtyPlus');
const productInfoEl = document.getElementById('productInfo');
const stockChipEl = document.getElementById('stockChip');
const productDescEl = document.getElementById('productDescChip');

/* ── Product selection handler  */

function onProductChange() {
  const id = productSelect.value;

  if (!id) {
    clearProductDisplay();
    return;
  }

  const product = getProductById(id);
  if (!product) {
    clearProductDisplay();
    return;
  }

  // Populate price
  productPriceEl.value = product.price;
  priceValueEl.textContent = `৳ ${fmt(product.price)}`;
  priceDisplayEl.classList.add('has-value');

  // Show stock info
  productInfoEl.style.display = 'block';

  const stockClass = product.stock <= 0 ? 'out-of-stock'
    : product.stock < 5 ? 'low-stock'
    : 'in-stock';

  stockChipEl.className  = `chip ${stockClass}`;
  stockChipEl.textContent  = `${product.stock} in stock`;
  productDescEl.textContent  = product.description || '';

  // Reset quantity
  quantityInput.value = 1;
  quantityInput.max   = product.stock > 0 ? product.stock : 9999;
}

function clearProductDisplay() {
  productPriceEl.value         = '';
  priceValueEl.textContent     = '—';
  priceDisplayEl.classList.remove('has-value');
  productInfoEl.style.display  = 'none';
}

/*  Qty stepper  */

function stepQty(delta) {
  const current = parseInt(quantityInput.value, 10) || 1;
  const max     = parseInt(quantityInput.max, 10) || 9999;
  const next    = Math.max(1, Math.min(max, current + delta));
  quantityInput.value = next;
}

/*  Add to cart  */

function handleAddToCart(e) {
  e.preventDefault();

  const id  = productSelect.value;
  const qty = parseInt(quantityInput.value, 10);

  if (!id) {
    showToast('Select a product', 'Please choose a product first.', 'error');
    productSelect.focus();
    return;
  }

  if (!qty || qty < 1) {
    showToast('Invalid Quantity', 'Quantity must be at least 1.', 'error');
    quantityInput.focus();
    return;
  }

  const product = getProductById(id);
  if (!product) {
    showToast('Product Not Found', 'This product could not be loaded.', 'error');
    return;
  }

  // Stock check
  if (product.stock <= 0) {
    showToast('Out of Stock', `${product.name} is out of stock.`, 'error');
    return;
  }

  if (qty > product.stock) {
    showToast('Insufficient Stock', `Only ${product.stock} units available.`, 'warning');
    quantityInput.value = product.stock;
    return;
  }

  addToCart(product, qty);

  // Reset form for next item
  productSelect.value  = '';
  quantityInput.value  = 1;
  clearProductDisplay();
  productSelect.focus();
}

/*  Init  */

export function initPOS() {
  productSelect?.addEventListener('change', onProductChange);
  productForm?.addEventListener('submit', handleAddToCart);
  qtyMinus?.addEventListener('click', () => stepQty(-1));
  qtyPlus?.addEventListener('click',  () => stepQty(+1));

  // Clamp input on manual entry
  quantityInput?.addEventListener('input', () => {
    const v   = parseInt(quantityInput.value, 10);
    const max = parseInt(quantityInput.max, 10) || 9999;
    if (v < 1) quantityInput.value = 1;
    if (v > max) quantityInput.value = max;
  });
}
