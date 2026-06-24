// utils/store.js — localStorage data layer
// When migrating to Supabase, replace these functions with API calls

import { v4 as uuid } from 'uuid';

const KEYS = {
  categories: 'epos_categories',
  companies:  'epos_companies',
  products:   'epos_products',
  vendors:    'epos_vendors',
  customers:  'epos_customers',
  employees:  'epos_employees',
  sales:      'epos_sales',
  purchases:  'epos_purchases',
  income:     'epos_income',
  incomeTypes:'epos_income_types',
  expenses:   'epos_expenses',
  expTypes:   'epos_expense_types',
  stock:      'epos_stock',
  user:       'epos_user',
};

// --- Generic CRUD ---
function getAll(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}
function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Seeder ---
export function seedIfEmpty() {
  if (getAll(KEYS.categories).length) return;

  const cats = [
    { id: uuid(), name: 'Mobile Phones', description: 'Smartphones & basic phones', active: true },
    { id: uuid(), name: 'Laptops', description: 'Laptops & notebooks', active: true },
    { id: uuid(), name: 'Accessories', description: 'Cables, chargers, covers', active: true },
    { id: uuid(), name: 'TVs', description: 'LED & Smart TVs', active: true },
    { id: uuid(), name: 'Audio', description: 'Speakers, headphones, earbuds', active: true },
  ];
  save(KEYS.categories, cats);

  const companies = [
    { id: uuid(), name: 'Samsung', phone: '021-111-222', email: 'samsung@pk.com', address: 'Karachi', active: true },
    { id: uuid(), name: 'Apple', phone: '021-333-444', email: 'apple@pk.com', address: 'Lahore', active: true },
    { id: uuid(), name: 'Xiaomi', phone: '021-555-666', email: 'xiaomi@pk.com', address: 'Faisalabad', active: true },
  ];
  save(KEYS.companies, companies);

  const vendors = [
    { id: uuid(), name: 'Tech Distributors', phone: '0300-1234567', email: 'tech@dist.com', address: 'Lahore', balance: 50000, active: true },
    { id: uuid(), name: 'Mobile World', phone: '0301-7654321', email: 'mw@mobile.com', address: 'Karachi', balance: 30000, active: true },
  ];
  save(KEYS.vendors, vendors);

  const customers = [
    { id: uuid(), name: 'Walk-in Customer', phone: '', email: '', address: '', balance: 0, active: true },
    { id: uuid(), name: 'Ahmed Khan', phone: '0312-1234567', email: 'ahmed@email.com', address: 'Faisalabad', balance: 5000, active: true },
    { id: uuid(), name: 'Sara Malik', phone: '0321-7654321', email: 'sara@email.com', address: 'Lahore', balance: 0, active: true },
  ];
  save(KEYS.customers, customers);

  const products = [
    { id: uuid(), code: 'SAM-S24', name: 'Samsung Galaxy S24', categoryId: cats[0].id, companyId: companies[0].id, purchasePrice: 120000, salePrice: 135000, stock: 10, minStock: 2, active: true },
    { id: uuid(), code: 'APP-15', name: 'iPhone 15 128GB', categoryId: cats[0].id, companyId: companies[1].id, purchasePrice: 200000, salePrice: 220000, stock: 5, minStock: 1, active: true },
    { id: uuid(), code: 'XMI-13T', name: 'Xiaomi 13T Pro', categoryId: cats[0].id, companyId: companies[2].id, purchasePrice: 90000, salePrice: 99000, stock: 8, minStock: 2, active: true },
    { id: uuid(), code: 'SAM-65TV', name: 'Samsung 65" QLED TV', categoryId: cats[3].id, companyId: companies[0].id, purchasePrice: 180000, salePrice: 200000, stock: 3, minStock: 1, active: true },
    { id: uuid(), code: 'APP-AIRPODS', name: 'AirPods Pro 2nd Gen', categoryId: cats[4].id, companyId: companies[1].id, purchasePrice: 45000, salePrice: 52000, stock: 15, minStock: 3, active: true },
    { id: uuid(), code: 'USB-C-1M', name: 'USB-C Cable 1M', categoryId: cats[2].id, companyId: companies[2].id, purchasePrice: 500, salePrice: 800, stock: 100, minStock: 10, active: true },
  ];
  save(KEYS.products, products);

  const incomeTypes = [
    { id: uuid(), name: 'Sales Revenue', active: true },
    { id: uuid(), name: 'Service Charges', active: true },
    { id: uuid(), name: 'Repair Income', active: true },
  ];
  save(KEYS.incomeTypes, incomeTypes);

  const expTypes = [
    { id: uuid(), name: 'Rent', active: true },
    { id: uuid(), name: 'Utilities', active: true },
    { id: uuid(), name: 'Salaries', active: true },
    { id: uuid(), name: 'Transport', active: true },
  ];
  save(KEYS.expTypes, expTypes);

  localStorage.setItem(KEYS.user, JSON.stringify({ name: 'Admin', role: 'Administrator', shopName: 'ElectroPOS' }));
}

// --- Categories ---
export const categoryStore = {
  getAll: () => getAll(KEYS.categories),
  add: (data) => {
    const list = getAll(KEYS.categories);
    const item = { id: uuid(), ...data, active: true };
    save(KEYS.categories, [...list, item]);
    return item;
  },
  update: (id, data) => {
    const list = getAll(KEYS.categories).map(c => c.id === id ? { ...c, ...data } : c);
    save(KEYS.categories, list);
  },
  toggle: (id) => {
    const list = getAll(KEYS.categories).map(c => c.id === id ? { ...c, active: !c.active } : c);
    save(KEYS.categories, list);
  },
  delete: (id) => save(KEYS.categories, getAll(KEYS.categories).filter(c => c.id !== id)),
};

// --- Companies ---
export const companyStore = {
  getAll: () => getAll(KEYS.companies),
  add: (data) => {
    const list = getAll(KEYS.companies);
    const item = { id: uuid(), ...data, active: true };
    save(KEYS.companies, [...list, item]);
    return item;
  },
  update: (id, data) => {
    const list = getAll(KEYS.companies).map(c => c.id === id ? { ...c, ...data } : c);
    save(KEYS.companies, list);
  },
  toggle: (id) => {
    const list = getAll(KEYS.companies).map(c => c.id === id ? { ...c, active: !c.active } : c);
    save(KEYS.companies, list);
  },
};

// --- Products ---
export const productStore = {
  getAll: () => getAll(KEYS.products),
  add: (data) => {
    const list = getAll(KEYS.products);
    const item = { id: uuid(), ...data, active: true };
    save(KEYS.products, [...list, item]);
    return item;
  },
  update: (id, data) => {
    const list = getAll(KEYS.products).map(p => p.id === id ? { ...p, ...data } : p);
    save(KEYS.products, list);
  },
  toggle: (id) => {
    const list = getAll(KEYS.products).map(p => p.id === id ? { ...p, active: !p.active } : p);
    save(KEYS.products, list);
  },
  adjustStock: (id, delta) => {
    const list = getAll(KEYS.products).map(p =>
      p.id === id ? { ...p, stock: Math.max(0, (p.stock || 0) + delta) } : p
    );
    save(KEYS.products, list);
  },
};

// --- Vendors ---
export const vendorStore = {
  getAll: () => getAll(KEYS.vendors),
  add: (data) => {
    const list = getAll(KEYS.vendors);
    const item = { id: uuid(), ...data, balance: data.balance || 0, active: true };
    save(KEYS.vendors, [...list, item]);
    return item;
  },
  update: (id, data) => {
    const list = getAll(KEYS.vendors).map(v => v.id === id ? { ...v, ...data } : v);
    save(KEYS.vendors, list);
  },
  toggle: (id) => {
    const list = getAll(KEYS.vendors).map(v => v.id === id ? { ...v, active: !v.active } : v);
    save(KEYS.vendors, list);
  },
  adjustBalance: (id, delta) => {
    const list = getAll(KEYS.vendors).map(v =>
      v.id === id ? { ...v, balance: (v.balance || 0) + delta } : v
    );
    save(KEYS.vendors, list);
  },
};

// --- Customers ---
export const customerStore = {
  getAll: () => getAll(KEYS.customers),
  add: (data) => {
    const list = getAll(KEYS.customers);
    const item = { id: uuid(), ...data, balance: data.balance || 0, active: true };
    save(KEYS.customers, [...list, item]);
    return item;
  },
  update: (id, data) => {
    const list = getAll(KEYS.customers).map(c => c.id === id ? { ...c, ...data } : c);
    save(KEYS.customers, list);
  },
  toggle: (id) => {
    const list = getAll(KEYS.customers).map(c => c.id === id ? { ...c, active: !c.active } : c);
    save(KEYS.customers, list);
  },
  adjustBalance: (id, delta) => {
    const list = getAll(KEYS.customers).map(c =>
      c.id === id ? { ...c, balance: (c.balance || 0) + delta } : c
    );
    save(KEYS.customers, list);
  },
};

// --- Sales ---
export const saleStore = {
  getAll: () => getAll(KEYS.sales),
  add: (data) => {
    const list = getAll(KEYS.sales);
    const invoiceNo = 1000 + list.length + 1;
    const item = { id: uuid(), invoiceNo, date: new Date().toISOString(), ...data };
    save(KEYS.sales, [...list, item]);
    // Adjust stock
    (data.items || []).forEach(i => productStore.adjustStock(i.productId, -i.qty));
    // Adjust customer balance if credit
    if (data.paymentType === 'credit' && data.customerId) {
      customerStore.adjustBalance(data.customerId, data.total - (data.received || 0));
    }
    return item;
  },
  addReturn: (data) => {
    const list = getAll(KEYS.sales);
    const item = { id: uuid(), date: new Date().toISOString(), type: 'return', ...data };
    save(KEYS.sales, [...list, item]);
    (data.items || []).forEach(i => productStore.adjustStock(i.productId, i.qty));
    return item;
  },
};

// --- Purchases ---
export const purchaseStore = {
  getAll: () => getAll(KEYS.purchases),
  add: (data) => {
    const list = getAll(KEYS.purchases);
    const billNo = 2000 + list.length + 1;
    const item = { id: uuid(), billNo, date: new Date().toISOString(), type: 'purchase', ...data };
    save(KEYS.purchases, [...list, item]);
    (data.items || []).forEach(i => productStore.adjustStock(i.productId, i.qty));
    if (data.vendorId) vendorStore.adjustBalance(data.vendorId, -(data.total - (data.paid || 0)));
    return item;
  },
  addReturn: (data) => {
    const list = getAll(KEYS.purchases);
    const item = { id: uuid(), date: new Date().toISOString(), type: 'return', ...data };
    save(KEYS.purchases, [...list, item]);
    (data.items || []).forEach(i => productStore.adjustStock(i.productId, -i.qty));
    return item;
  },
};

// --- Income ---
export const incomeStore = {
  getAll: () => getAll(KEYS.income),
  getTypes: () => getAll(KEYS.incomeTypes),
  addType: (name) => {
    const list = getAll(KEYS.incomeTypes);
    const item = { id: uuid(), name, active: true };
    save(KEYS.incomeTypes, [...list, item]);
    return item;
  },
  add: (data) => {
    const list = getAll(KEYS.income);
    const item = { id: uuid(), date: new Date().toISOString(), ...data };
    save(KEYS.income, [...list, item]);
    return item;
  },
  delete: (id) => save(KEYS.income, getAll(KEYS.income).filter(i => i.id !== id)),
};

// --- Expenses ---
export const expenseStore = {
  getAll: () => getAll(KEYS.expenses),
  getTypes: () => getAll(KEYS.expTypes),
  addType: (name) => {
    const list = getAll(KEYS.expTypes);
    const item = { id: uuid(), name, active: true };
    save(KEYS.expTypes, [...list, item]);
    return item;
  },
  add: (data) => {
    const list = getAll(KEYS.expenses);
    const item = { id: uuid(), date: new Date().toISOString(), ...data };
    save(KEYS.expenses, [...list, item]);
    return item;
  },
  delete: (id) => save(KEYS.expenses, getAll(KEYS.expenses).filter(e => e.id !== id)),
};

// --- User ---
export const userStore = {
  get: () => JSON.parse(localStorage.getItem(KEYS.user) || '{"name":"Admin","role":"Administrator","shopName":"ElectroPOS"}'),
  update: (data) => localStorage.setItem(KEYS.user, JSON.stringify({ ...userStore.get(), ...data })),
};

// --- Dashboard stats ---
export function getDashboardStats(from, to) {
  const fromD = from ? new Date(from) : new Date(0);
  const toD = to ? new Date(to) : new Date();
  toD.setHours(23,59,59,999);

  const sales = saleStore.getAll().filter(s => {
    const d = new Date(s.date);
    return d >= fromD && d <= toD && s.type !== 'return';
  });
  const returns = saleStore.getAll().filter(s => {
    const d = new Date(s.date);
    return d >= fromD && d <= toD && s.type === 'return';
  });
  const purchases = purchaseStore.getAll().filter(p => {
    const d = new Date(p.date);
    return d >= fromD && d <= toD && p.type !== 'return';
  });

  const totalSales = sales.reduce((a, s) => a + (s.total || 0), 0);
  const totalPurchase = purchases.reduce((a, p) => a + (p.total || 0), 0);
  const totalReturns = returns.reduce((a, r) => a + (r.total || 0), 0);
  const customers = customerStore.getAll();
  const vendors = vendorStore.getAll();
  const totalCustomerBalance = customers.reduce((a, c) => a + (c.balance || 0), 0);
  const totalVendorBalance = vendors.reduce((a, v) => a + (v.balance || 0), 0);

  // Top products
  const productMap = {};
  sales.forEach(s => (s.items || []).forEach(i => {
    productMap[i.productId] = (productMap[i.productId] || 0) + i.qty;
  }));
  const products = productStore.getAll();
  const topProducts = Object.entries(productMap)
    .map(([id, qty]) => ({ name: products.find(p => p.id === id)?.name || id, qty }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Recent sales
  const recentSales = [...sales].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

  // Monthly trend (last 6 months)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const label = d.toLocaleString('default', { month: 'short' });
    const mSales = saleStore.getAll().filter(s => {
      const sd = new Date(s.date);
      return sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear() && s.type !== 'return';
    }).reduce((a, s) => a + (s.total || 0), 0);
    months.push({ month: label, sales: mSales });
  }

  return {
    totalSales, totalPurchase, totalReturns,
    totalCustomerBalance, totalVendorBalance,
    visitedCustomers: sales.length,
    topProducts, recentSales, monthlyTrend: months,
    lowStockProducts: products.filter(p => p.active && p.stock <= p.minStock),
  };
}
