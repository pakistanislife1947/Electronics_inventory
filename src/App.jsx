import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { seedIfEmpty } from './utils/store';
import './index.css';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Categories from './pages/Categories';
import { Companies, Vendors, Customers } from './pages/Entities';
import Products from './pages/Products';
import { Income, Expenses } from './pages/Finance';
import Purchase from './pages/Purchase';
import Stock from './pages/Stock';
import Reports from './pages/Reports';
import Account from './pages/Account';

export default function App() {
  useEffect(() => { seedIfEmpty(); }, []);

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/companies" element={<Companies />} />
          <Route path="/products" element={<Products />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/purchase" element={<Purchase />} />
          <Route path="/stock" element={<Stock />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
