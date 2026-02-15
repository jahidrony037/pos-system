/**
 * cart.js — Shopping cart state & rendering
 */

import { showToast } from './toast.js';
import { fmt } from './utils.js';

/** @type {Array<{id, name, price, quantity, total}>} */
let _cart = [];

/*  DOM refs  */
const cartTableBody  = document.getElementById('cartTableBody');
const cartTable      = document.getElementById('cartTable');
const cartEmptyState = document.getElementById('cartEmptyState');
const cartTotalEl    = document.getElementById('cartTotal');
const cartCountChip  = document.getElementById('cartCountChip');
const paymentBtn     = document.getElementById('goToPaymentBtn');

/*  Cart CRUD */

/**
 * Add a product to the cart (or increment qty if already there)
 */
export function addToCart(product, quantity) {
  const qty = parseInt(quantity, 10) || 1;
  if (qty < 1) return;

  const idx = _cart.findIndex(item => item.id === product.id);

  if (idx > -1) {
    _cart[idx].quantity += qty;
    _cart[idx].total     = _cart[idx].price * _cart[idx].quantity;
  } else {
    _cart.push({
      id:       product.id,
      name:     product.name,
      price:    Number(product.price),
      quantity: qty,
      total:    Number(product.price) * qty,
    });
  }

  renderCart();
  showToast('Added to cart', `${product.name} × ${qty}`, 'success', 2500);
}

/** Remove a single item from the cart by productId */
export function removeFromCart(productId) {
  const name = _cart.find(i => i.id === productId)?.name ?? 'Item';
  _cart = _cart.filter(i => i.id !== productId);
  renderCart();
  showToast('Removed', `${name} removed from cart`, 'info', 2000);
}

/** Clear the entire cart */
export function clearCart() {
  _cart = [];
  renderCart();
}

/** Return a snapshot (deep copy) of the current cart */
export function getCart() {
  return _cart.map(i => ({ ...i }));
}

/** Return grand total */
export function getCartTotal() {
  return _cart.reduce((sum, i) => sum + i.total, 0);
}

/** Return total item count */
export function getCartCount() {
  return _cart.reduce((sum, i) => sum + i.quantity, 0);
}

/*  Render  */

function renderCart() {
  const isEmpty = _cart.length === 0;
  cartTable.style.display      = isEmpty ? 'none' : 'table';
  cartEmptyState.style.display = isEmpty ? 'flex' : 'none';
  paymentBtn.disabled           = isEmpty;

  if (isEmpty) {
    cartTableBody.innerHTML = '';
    updateTotals();
    return;
  }

  cartTableBody.innerHTML = _cart.map((item, i) => `
    <tr class="cart-row-enter" data-cart-idx="${i}">
      <td class="col-name truncate" title="${escHtml(item.name)}">${escHtml(item.name)}</td>
      <td class="col-price">${fmt(item.price)}</td>
      <td class="col-qty">${item.quantity}</td>
      <td class="col-total">${fmt(item.total)}</td>
      <td class="col-action">
        <button class="btn btn-danger btn-icon-sm remove-cart-btn"
                data-product-id="${item.id}"
                title="Remove ${escHtml(item.name)}"
                aria-label="Remove ${escHtml(item.name)} from cart">✕</button>
      </td>
    </tr>
  `).join('');

  // Bind remove buttons
  cartTableBody.querySelectorAll('.remove-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(Number(btn.dataset.productId)));
  });

  updateTotals();
}

function updateTotals() {
  const total = getCartTotal();
  const count = getCartCount();
  const items = _cart.length;

  cartTotalEl.innerHTML = `৳ ${fmt(total)}`;
  cartCountChip.textContent = `${items} item${items !== 1 ? 's' : ''}`;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/*  Init  */
export function initCart() {
  renderCart();

  // Clear cart button
  document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    if (_cart.length === 0) return;
    clearCart();
    showToast('Cart cleared', 'All items removed', 'info');
  });
}
