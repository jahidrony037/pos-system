/**
 * products.js — Product list CRUD & UI
 */

import { ProductsDB } from './db.js';
import { showToast } from './toast.js';
import { debounce, escHtml, fmt } from './utils.js';

/*  DOM refs  */
const productModal = document.getElementById('productModal');
const addProductForm = document.getElementById('addProductForm');
const closeProductModal= document.getElementById('closeProductModal');
const cancelProductBtn= document.getElementById('cancelProductBtn');
const productModalTitle = document.getElementById('productModalTitle');
const editProductIdEl = document.getElementById('editProductId');

const pNameEl = document.getElementById('pName');
const pDescEl = document.getElementById('pDesc');
const pPriceEl = document.getElementById('pPrice');
const pStockEl = document.getElementById('pStock');

const productListBody = document.getElementById('productListBody');
const productListEmpty = document.getElementById('productListEmpty');
const productListTable = document.getElementById('productListTable');
const searchInput = document.getElementById('productSearchInput');
const productCountBadge = document.getElementById('productCountBadge');
const openAddProductBtn = document.getElementById('openAddProductBtn');

/** In-memory product cache for quick access */
let _products = [];

/*  Modal helpers  */

function openModal(mode = 'add', product = null) {
  productModal.classList.add('open');
  productModalTitle.textContent = mode === 'edit' ? '✏️ Edit Product' : '📦 Add Product';

  if (mode === 'edit' && product) {
    editProductIdEl.value = product.id;
    pNameEl.value = product.name  ?? '';
    pDescEl.value = product.description ?? '';
    pPriceEl.value = product.price ?? '';
    pStockEl.value = product.stock ?? '';
  } else {
    addProductForm.reset();
    editProductIdEl.value = '';
  }
  pNameEl.focus();
}

function closeModal() {
  productModal.classList.remove('open');
  addProductForm.reset();
  editProductIdEl.value = '';
}

/*  CRUD  */

async function saveProduct(e) {
  e.preventDefault();

  const name  = pNameEl.value.trim();
  const price = parseFloat(pPriceEl.value);
  const stock = parseInt(pStockEl.value, 10);

  if (!name) {
    showToast('Validation Error', 'Product name is required.', 'error');
    pNameEl.focus();
    return;
  }
  if (isNaN(price) || price < 0) {
    showToast('Validation Error', 'Enter a valid price.', 'error');
    pPriceEl.focus();
    return;
  }
  if (isNaN(stock) || stock < 0) {
    showToast('Validation Error', 'Enter a valid stock quantity.', 'error');
    pStockEl.focus();
    return;
  }

  const id = editProductIdEl.value ? Number(editProductIdEl.value) : undefined;

  const productData = {
    name,
    description: pDescEl.value.trim(),
    price,
    stock,
    updatedAt: new Date().toISOString(),
  };

  try {
    if (id) {
      await ProductsDB.update({ ...productData, id });
      showToast('Updated', `${name} has been updated.`, 'success');
    } else {
      productData.createdAt = new Date().toISOString();
      await ProductsDB.add(productData);
      showToast('Product Added', `${name} added to inventory.`, 'success');
    }

    closeModal();
    await loadProducts();
    updateProductSelect();
  } catch (err) {
    console.error(err);
    showToast('Error', 'Could not save product. Try again.', 'error');
  }
}

async function deleteProduct(id) {
  const product = _products.find(p => p.id === id);
  if (!product) return;
  const confirmed = window.confirm(`Delete "${product.name}"? This cannot be undone.`);
  if (!confirmed) return;

  try {
    await ProductsDB.delete(id);
    showToast('Deleted', `${product.name} removed from inventory.`, 'info');
    await loadProducts();
    updateProductSelect();
  } catch (err) {
    console.error(err);
    showToast('Error', 'Could not delete product.', 'error');
  }
}

/*  Load & Render  */

export async function loadProducts() {
  try {
    _products = await ProductsDB.getAll();
    renderProductList(_products);
    updateProductSelect();
    updateBadge();
  } catch (err) {
    console.error(err);
    showToast('Error', 'Failed to load products.', 'error');
  }
}

function renderProductList(products) {
  if (!products.length) {
    productListTable.style.display = 'none';
    productListEmpty.style.display = 'flex';
    productListBody.innerHTML  = '';
    return;
  }

  productListTable.style.display = 'table';
  productListEmpty.style.display = 'none';

  productListBody.innerHTML = products.map((p, i) => {
    const stockClass = p.stock <= 0 ? 'out-of-stock' : p.stock < 5 ? 'low-stock' : 'in-stock';
    const stockLabel = p.stock <= 0 ? 'Out of Stock' : p.stock < 5 ? 'Low Stock' : 'In Stock';

    return `
      <tr>
        <td class="table-serial">${String(i + 1).padStart(2, '0')}</td>
        <td class="table-product-name">${escHtml(p.name)}</td>
        <td class="table-desc truncate" style="max-width:220px;" title="${escHtml(p.description || '')}">
          ${escHtml(p.description || '—')}
        </td>
        <td class="table-price">৳ ${fmt(p.price)}</td>
        <td>
          <span class="stock-badge ${stockClass}">${p.stock} — ${stockLabel}</span>
        </td>
        <td>
          <div class="actions-cell">
            <button class="btn btn-secondary btn-sm edit-product-btn"
                    data-id="${p.id}"
                    title="Edit ${escHtml(p.name)}">
              ✏️ Edit
            </button>
            <button class="btn btn-danger btn-sm delete-product-btn"
                    data-id="${p.id}"
                    title="Delete ${escHtml(p.name)}">
              🗑 Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind action buttons
  productListBody.querySelectorAll('.edit-product-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = _products.find(p => p.id === Number(btn.dataset.id));
      if (product) openModal('edit', product);
    });
  });

  productListBody.querySelectorAll('.delete-product-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteProduct(Number(btn.dataset.id)));
  });
}

function updateBadge() {
  if (productCountBadge) productCountBadge.textContent = _products.length;
}

/*  Product select dropdown (New Sale page)  */

export function updateProductSelect() {
  const sel = document.getElementById('productSelect');
  if (!sel) return;

  // Preserve current selection if possible
  const prev = sel.value;

  sel.innerHTML = `<option value="">— Choose a product —</option>`;
  _products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = `${p.name} — ৳${fmt(p.price)}`;
    sel.appendChild(opt);
  });

  if (prev) sel.value = prev;
}

/** Return a product by id from cache */
export function getProductById(id) {
  return _products.find(p => p.id === Number(id)) ?? null;
}

/** Return all cached products */
export function getAllProducts() {
  return [..._products];
}

/*  Search  */

function handleSearch(e) {
  const q = e.target.value.trim().toLowerCase();
  if (!q) {
    renderProductList(_products);
    return;
  }
  const filtered = _products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q)
  );
  renderProductList(filtered);
}

/*  Init  */

export function initProducts() {
  openAddProductBtn?.addEventListener('click', () => openModal('add'));
  closeProductModal?.addEventListener('click', closeModal);
  cancelProductBtn?.addEventListener('click', closeModal);
  addProductForm?.addEventListener('submit', saveProduct);
  searchInput?.addEventListener('input', debounce(handleSearch, 250));

  // Close modal on overlay click
  productModal?.addEventListener('click', (e) => {
    if (e.target === productModal) closeModal();
  });

  // Keyboard: ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal?.classList.contains('open')) closeModal();
  });
}
