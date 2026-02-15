/**
 * sales.js — Purchase list & sales statistics
 */

import { SalesDB } from './db.js';
import { showToast } from './toast.js';
import { downloadJSON, escHtml, fmt, fmtDate, saleRef } from './utils.js';

/*  DOM refs  */
const purchaseContainer  = document.getElementById('purchaseListContainer');
const purchaseListEmpty  = document.getElementById('purchaseListEmpty');
const saleCountBadge = document.getElementById('saleCountBadge');

// Stats
const statRevenue = document.getElementById('statRevenue');
const statSales = document.getElementById('statSales');
const statItems = document.getElementById('statItems');
const statDue = document.getElementById('statDue');

let _sales = [];

/*  Load & Render  */

export async function loadSales() {
  try {
    _sales = await SalesDB.getAll();
    // Sort newest first
    _sales.sort((a, b) => new Date(b.date) - new Date(a.date));
    updateBadge();
    renderStats();
    renderPurchaseList();
  } catch (err) {
    console.error(err);
    showToast('Error', 'Failed to load sales.', 'error');
  }
}

function updateBadge() {
  if (saleCountBadge) saleCountBadge.textContent = _sales.length;
}

function renderStats() {
  const totalRevenue = _sales.reduce((s, sale) => s + (sale.totalAmount || 0), 0);
  const totalDue = _sales.reduce((s, sale) => s + (sale.dueAmount   || 0), 0);
  const totalItems = _sales.reduce((s, sale) => s + (sale.totalItems  || 0), 0);

  if (statRevenue) statRevenue.textContent = `৳${fmt(totalRevenue)}`;
  if (statSales)   statSales.textContent = _sales.length;
  if (statItems)   statItems.textContent = totalItems;
  if (statDue)     statDue.textContent = `৳${fmt(totalDue)}`;
}

function renderPurchaseList() {
  if (!_sales.length) {
    purchaseContainer.innerHTML  = '';
    purchaseListEmpty.style.display = 'flex';
    return;
  }

  purchaseListEmpty.style.display = 'none';

  purchaseContainer.innerHTML = _sales.map(sale => {
    const methodClass = (sale.paymentMethod || 'cash').toLowerCase();
    const dueColor    = sale.dueAmount > 0 ? 'var(--clr-warning)' : 'var(--clr-success)';

    const itemsHtml = (sale.items || []).map(item => `
      <tr>
        <td style="padding:var(--space-2) var(--space-3); font-size:var(--fs-sm);">
          ${escHtml(item.name)}
        </td>
        <td style="padding:var(--space-2) var(--space-3); font-size:var(--fs-sm);
                   font-family:var(--font-mono); color:var(--clr-text-secondary);">
          ৳${fmt(item.price)}
        </td>
        <td style="padding:var(--space-2) var(--space-3); font-size:var(--fs-sm);
                   font-family:var(--font-mono); color:var(--clr-text-secondary);">
          ×${item.quantity}
        </td>
        <td style="padding:var(--space-2) var(--space-3); font-size:var(--fs-sm);
                   font-family:var(--font-mono); font-weight:700;
                   color:var(--clr-accent-primary); text-align:right;">
          ৳${fmt(item.total)}
        </td>
      </tr>
    `).join('');

    return `
      <div class="purchase-record" id="sale-${sale.id}">
        <div class="purchase-record-header" onclick="toggleRecord(${sale.id})">
          <span class="record-number">${saleRef(sale.id)}</span>
          <span class="record-customer">${escHtml(sale.customerName)}</span>
          <span class="record-date">${fmtDate(sale.date)}</span>
          <span class="record-total">৳${fmt(sale.totalAmount)}</span>
          <span class="payment-badge ${methodClass}">${escHtml(sale.paymentMethod || 'Cash')}</span>
          <span class="record-expand-icon" aria-hidden="true">▼</span>
        </div>

        <div class="purchase-record-body">
          <!-- Detail grid -->
          <div class="record-detail-grid">
            <div class="record-detail-item">
              <span class="record-detail-label">Total Amount</span>
              <span class="record-detail-value" style="color:var(--clr-accent-primary)">
                ৳${fmt(sale.totalAmount)}
              </span>
            </div>
            <div class="record-detail-item">
              <span class="record-detail-label">Paid</span>
              <span class="record-detail-value">৳${fmt(sale.paidAmount)}</span>
            </div>
            <div class="record-detail-item">
              <span class="record-detail-label">Due / Change</span>
              <span class="record-detail-value" style="color:${dueColor}">
                ${sale.dueAmount > 0
                  ? `Due: ৳${fmt(sale.dueAmount)}`
                  : `Change: ৳${fmt(sale.changeAmount)}`}
              </span>
            </div>
            <div class="record-detail-item">
              <span class="record-detail-label">Payment Via</span>
              <span class="record-detail-value">
                <span class="payment-badge ${methodClass}">${escHtml(sale.paymentMethod || 'Cash')}</span>
              </span>
            </div>
            <div class="record-detail-item">
              <span class="record-detail-label">Date & Time</span>
              <span class="record-detail-value" style="font-size:var(--fs-sm)">${fmtDate(sale.date)}</span>
            </div>
            <div class="record-detail-item">
              <span class="record-detail-label">Items Count</span>
              <span class="record-detail-value">${sale.totalItems || 0}</span>
            </div>
          </div>

          <!-- Items table -->
          <table style="width:100%; border-collapse:collapse; border-radius:var(--radius-md);
                        overflow:hidden; border:1px solid var(--clr-border-subtle);">
            <thead>
              <tr style="background:var(--clr-bg-card);">
                <th style="text-align:left; padding:var(--space-2) var(--space-3);
                           font-size:var(--fs-xs); letter-spacing:0.08em;
                           text-transform:uppercase; color:var(--clr-text-muted);">
                  Product
                </th>
                <th style="text-align:left; padding:var(--space-2) var(--space-3);
                           font-size:var(--fs-xs); letter-spacing:0.08em;
                           text-transform:uppercase; color:var(--clr-text-muted);">
                  Price
                </th>
                <th style="text-align:left; padding:var(--space-2) var(--space-3);
                           font-size:var(--fs-xs); letter-spacing:0.08em;
                           text-transform:uppercase; color:var(--clr-text-muted);">
                  Qty
                </th>
                <th style="text-align:right; padding:var(--space-2) var(--space-3);
                           font-size:var(--fs-xs); letter-spacing:0.08em;
                           text-transform:uppercase; color:var(--clr-text-muted);">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join('');
}

/*  Toggle expand/collapse */

window.toggleRecord = function(id) {
  const record = document.getElementById(`sale-${id}`);
  record?.classList.toggle('expanded');
};

/* Export */

export function exportSalesData() {
  if (!_sales.length) {
    showToast('No Data', 'There are no sales to export.', 'info');
    return;
  }
  const timestamp = new Date().toISOString().slice(0,10);
  downloadJSON(_sales, `pos-sales-${timestamp}.json`);
  showToast('Exported', `${_sales.length} sales exported to JSON.`, 'success');
}

/*  Init */

export function initSales() {
  document.getElementById('exportSalesBtn')
    ?.addEventListener('click', exportSalesData);
  document.getElementById('exportBtn')
    ?.addEventListener('click', exportSalesData);
}
