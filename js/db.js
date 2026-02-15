/**
 * db.js — IndexedDB abstraction layer
 * Stores: products, sales
 */

const DB_NAME    = 'OfflinePOS';
const DB_VERSION = 1;

let db = null;

/**
 * Opens / creates the IndexedDB instance.
 * @returns {Promise<IDBDatabase>}
 */
export function openDB() {
  if (db) return Promise.resolve(db);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = event.target.result;

      // products store
      if (!db.objectStoreNames.contains('products')) {
        const productStore = db.createObjectStore('products', {
          keyPath: 'id',
          autoIncrement: true,
        });
        productStore.createIndex('name', 'name', { unique: false });
      }

      // sales store 
      if (!db.objectStoreNames.contains('sales')) {
        const salesStore = db.createObjectStore('sales', {
          keyPath: 'id',
          autoIncrement: true,
        });
        salesStore.createIndex('date', 'date', { unique: false });
        salesStore.createIndex('customerName', 'customerName', { unique: false });
      }
    };

    req.onsuccess  = (e) => { db = e.target.result; resolve(db); };
    req.onerror    = (e) => reject(new Error(`DB open error: ${e.target.error}`));
    req.onblocked  = ()  => reject(new Error('DB blocked — please close other tabs.'));
  });
}

/*Generic helpers*/

function txStore(storeName, mode) {
  const tx    = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  return { tx, store };
}

function promisify(request) {
  return new Promise((res, rej) => {
    request.onsuccess = (e) => res(e.target.result);
    request.onerror   = (e) => rej(e.target.error);
  });
}

function getAll(storeName) {
  const { store } = txStore(storeName, 'readonly');
  return promisify(store.getAll());
}

function getById(storeName, id) {
  const { store } = txStore(storeName, 'readonly');
  return promisify(store.get(Number(id)));
}

function add(storeName, data) {
  const { store } = txStore(storeName, 'readwrite');
  return promisify(store.add(data));
}

function put(storeName, data) {
  const { store } = txStore(storeName, 'readwrite');
  return promisify(store.put(data));
}

function remove(storeName, id) {
  const { store } = txStore(storeName, 'readwrite');
  return promisify(store.delete(Number(id)));
}

/*PRODUCTS API */

export const ProductsDB = {
  getAll: ()=> getAll('products'),
  getById: (id)=> getById('products', id),
  add: (product)=> add('products', product),
  update:(product)=> put('products', product),
  delete:(id)=> remove('products', id),
};

/*SALES API */

export const SalesDB = {
  getAll:()=> getAll('sales'),
  getById:(id)=> getById('sales', id),
  add:(sale)=> add('sales', sale),
  delete:(id)=> remove('sales', id),
};
