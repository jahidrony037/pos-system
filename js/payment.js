/**
 * payment.js — Payment modal logic & sale completion
 */

import { clearCart, getCart, getCartTotal } from './cart.js';
import { ProductsDB, SalesDB } from './db.js';
import { loadProducts } from './products.js';
import { loadSales } from './sales.js';
import { showToast } from './toast.js';
import { fmt, fmtDate, nowISO } from './utils.js';

/*  DOM refs  */
const paymentModal      = document.getElementById('paymentModal');
const closePaymentModal = document.getElementById('closePaymentModal');
const cancelPaymentBtn  = document.getElementById('cancelPaymentBtn');
const completeSaleBtn   = document.getElementById('completeSaleBtn');
const goToPaymentBtn    = document.getElementById('goToPaymentBtn');

const modalTotalPayable = document.getElementById('modalTotalPayable');
const modalTotalItems   = document.getElementById('modalTotalItems');
const modalDateEl       = document.getElementById('modalDate');
const customerNameEl    = document.getElementById('customerName');
const amountPaidEl      = document.getElementById('amountPaid');
const modalDueAmount    = document.getElementById('modalDueAmount');
const modalChangeAmount = document.getElementById('modalChangeAmount');
const balanceIndicator  = document.getElementById('balanceIndicator');
const methodBtns        = document.querySelectorAll('.payment-method-btn');

let _selectedMethod = 'Cash';

/*  Open / Close  */

function openModal() {
  const cart  = getCart();
  const total = getCartTotal();

  if (!cart.length) return;

  // Populate info
  modalTotalPayable.textContent = `৳ ${fmt(total)}`;
  modalTotalItems.textContent   = `${cart.reduce((s, i) => s + i.quantity, 0)} item(s) in cart`;
  modalDateEl.textContent       = fmtDate(new Date());

  // Reset form
  customerNameEl.value = '';
  amountPaidEl.value   = '';
  updateBalance();
  selectMethod('Cash');

  paymentModal.classList.add('open');
  setTimeout(() => customerNameEl.focus(), 200);
}

function closeModal() {
  paymentModal.classList.remove('open');
}

/*  Balance calculation  */

function updateBalance() {
  const total = getCartTotal();
  const paid = parseFloat(amountPaidEl.value) || 0;
  const diff = paid - total;
  const due = diff < 0 ? Math.abs(diff) : 0;
  const change = diff > 0 ? diff : 0;

  modalDueAmount.textContent = `৳ ${fmt(due)}`;
  modalChangeAmount.textContent = `৳ ${fmt(change)}`;

  // Color the due field
  if (paid === 0) {
    modalDueAmount.className = 'info-box-value danger';
    balanceIndicator.innerHTML = '';
  } else if (due > 0) {
    modalDueAmount.className = 'info-box-value warning';
    balanceIndicator.innerHTML = `<span style="color:var(--clr-warning)">⚠️ Partial payment — ৳${fmt(due)} remaining</span>`;
  } else {
    modalDueAmount.className = 'info-box-value accent';
    balanceIndicator.innerHTML = `<span style="color:var(--clr-accent-primary)">✅ Fully paid${change > 0 ? ` — change: ৳${fmt(change)}` : ''}</span>`;
  }
}

/*  Payment method selection  */

function selectMethod(method) {
  _selectedMethod = method;
  methodBtns.forEach(btn => {
    const isSelected = btn.dataset.method === method;
    btn.classList.toggle('selected', isSelected);
    btn.setAttribute('aria-checked', String(isSelected));
  });
}

/*  Complete Sale  */

async function completeSale() {
  const cart         = getCart();
  const total        = getCartTotal();
  const customerName = customerNameEl.value.trim() || 'Walk-in Customer';
  const paid         = parseFloat(amountPaidEl.value) || 0;
  const due          = Math.max(0, total - paid);
  const change       = Math.max(0, paid - total);

  if (!cart.length) {
    showToast('Empty Cart', 'Please add products first.', 'error');
    return;
  }

  // Disable button while saving
  completeSaleBtn.disabled = true;
  completeSaleBtn.textContent = '⏳ Saving…';

  const saleData = {
    customerName,
    date:          nowISO(),
    items:         cart,
    totalAmount:   total,
    paidAmount:    paid,
    dueAmount:     due,
    changeAmount:  change,
    paymentMethod: _selectedMethod,
    totalItems:    cart.reduce((s, i) => s + i.quantity, 0),
  };

  try {
    await SalesDB.add(saleData);

    //  Deduct stock for each sold item 
    for (const item of cart) {
      const product = await ProductsDB.getById(item.id);
      if (product) {
        const newStock = Math.max(0, (product.stock ?? 0) - item.quantity);
        await ProductsDB.update({ ...product, stock: newStock });
      }
    }

    // Refresh product list & badge
    await loadProducts();
    // Update sales badge
    await loadSales();

    // Clear cart
    clearCart();
    closeModal();

    showToast(
      '✅ Sale Complete!',
      `${customerName} — ৳${fmt(total)} via ${_selectedMethod}`,
      'success',
      4000
    );
  } catch (err) {
    console.error(err);
    showToast('Error', 'Could not save sale. Try again.', 'error');
  } finally {
    completeSaleBtn.disabled = false;
    completeSaleBtn.textContent = '✓ Complete Sale';
  }
}

/*  Init  */

export function initPayment() {
  goToPaymentBtn?.addEventListener('click', openModal);
  closePaymentModal?.addEventListener('click', closeModal);
  cancelPaymentBtn?.addEventListener('click', closeModal);
  completeSaleBtn?.addEventListener('click', completeSale);
  amountPaidEl?.addEventListener('input', updateBalance);

  // Payment method buttons
  methodBtns.forEach(btn => {
    btn.addEventListener('click', () => selectMethod(btn.dataset.method));
    // Keyboard accessibility
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectMethod(btn.dataset.method);
      }
    });
  });

  // Close on overlay click
  paymentModal?.addEventListener('click', (e) => {
    if (e.target === paymentModal) closeModal();
  });

  // Keyboard: ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && paymentModal?.classList.contains('open')) closeModal();
  });
}