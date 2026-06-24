import React, { useState, useEffect } from 'react';
import { productStore, categoryStore, companyStore } from '../utils/store';
import { Modal, SearchInput, EmptyState, fmt } from '../components/UI';

const empty = { code: '', name: '', categoryId: '', companyId: '', purchasePrice: '', salePrice: '', stock: '', minStock: '' };

export default function Products() {
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const load = () => {
    setList(productStore.getAll());
    setCats(categoryStore.getAll().filter(c => c.active));
    setCompanies(companyStore.getAll().filter(c => c.active));
  };
  useEffect(load, []);

  const filtered = list.filter(p => {
    const q = query.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    const matchCat = !catFilter || p.categoryId === catFilter;
    return matchQ && matchCat;
  });

  function openNew() { setForm(empty); setEditing(null); setErrors({}); setOpen(true); }
  function openEdit(p) {
    setForm({ code: p.code, name: p.name, categoryId: p.categoryId, companyId: p.companyId || '', purchasePrice: p.purchasePrice, salePrice: p.salePrice, stock: p.stock, minStock: p.minStock || 0 });
    setEditing(p.id); setErrors({}); setOpen(true);
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.code.trim()) e.code = 'Required';
    if (!form.salePrice) e.salePrice = 'Required';
    if (!form.purchasePrice) e.purchasePrice = 'Required';
    if (form.salePrice && form.purchasePrice && Number(form.salePrice) < Number(form.purchasePrice)) {
      e.salePrice = 'Sale price below purchase price';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function save() {
    if (!validate()) return;
    const data = { ...form, purchasePrice: Number(form.purchasePrice), salePrice: Number(form.salePrice), stock: Number(form.stock), minStock: Number(form.minStock) };
    if (editing) productStore.update(editing, data);
    else productStore.add(data);
    load(); setOpen(false);
  }

  const catName = id => cats.find(c => c.id === id)?.name || '—';
  const margin = p => p.purchasePrice ? (((p.salePrice - p.purchasePrice) / p.purchasePrice) * 100).toFixed(1) : '—';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{filtered.length} of {list.length} products</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Name or code..." />
          <select className="select" style={{ width: 160 }} value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openNew}>+ New Product</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th><th>Name</th><th>Category</th>
                <th style={{ textAlign:'right' }}>Purchase</th>
                <th style={{ textAlign:'right' }}>Sale Price</th>
                <th style={{ textAlign:'right' }}>Margin</th>
                <th style={{ textAlign:'center' }}>Stock</th>
                <th>Status</th>
                <th style={{ textAlign:'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={9}><EmptyState message="No products found" /></td></tr>
                : filtered.map(p => (
                  <tr key={p.id}>
                    <td className="mono" style={{ fontSize: 12, color:'var(--text-muted)' }}>{p.code}</td>
                    <td style={{ color:'var(--text-primary)', fontWeight:500, maxWidth:200 }}>{p.name}</td>
                    <td>{catName(p.categoryId)}</td>
                    <td style={{ textAlign:'right', fontFamily:'JetBrains Mono', fontSize:13 }}>₨ {fmt(p.purchasePrice)}</td>
                    <td style={{ textAlign:'right', fontFamily:'JetBrains Mono', fontSize:13, color:'var(--accent-green)', fontWeight:600 }}>₨ {fmt(p.salePrice)}</td>
                    <td style={{ textAlign:'right' }}>
                      <span style={{ fontSize:12, color: Number(margin(p)) > 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{margin(p)}%</span>
                    </td>
                    <td style={{ textAlign:'center' }}>
                      <span className={`badge ${p.stock <= 0 ? 'badge-red' : p.stock <= (p.minStock || 0) ? 'badge-amber' : 'badge-green'}`}>{p.stock}</span>
                    </td>
                    <td><span className={`badge ${p.active ? 'badge-green' : 'badge-red'}`}>{p.active ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ textAlign:'right' }}>
                      <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className={`btn btn-sm ${p.active ? 'btn-ghost' : 'btn-success'}`}
                          onClick={() => { productStore.toggle(p.id); load(); }}>
                          {p.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Product' : 'New Product'} size="modal-lg">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div className="form-group" style={{ gridColumn:'1/-1' }}>
            <label className="form-label">Product Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Samsung Galaxy S24" />
            {errors.name && <span style={{ color:'var(--accent-red)', fontSize:11 }}>{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Product Code / Barcode *</label>
            <input className="input" value={form.code} onChange={e => setForm(f=>({...f,code:e.target.value}))} placeholder="e.g. SAM-S24" />
            {errors.code && <span style={{ color:'var(--accent-red)', fontSize:11 }}>{errors.code}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="select" value={form.categoryId} onChange={e => setForm(f=>({...f,categoryId:e.target.value}))}>
              <option value="">Select category</option>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Company / Brand</label>
            <select className="select" value={form.companyId} onChange={e => setForm(f=>({...f,companyId:e.target.value}))}>
              <option value="">Select company</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Price (₨) *</label>
            <input type="number" className="input" value={form.purchasePrice} onChange={e => setForm(f=>({...f,purchasePrice:e.target.value}))} placeholder="0" />
            {errors.purchasePrice && <span style={{ color:'var(--accent-red)', fontSize:11 }}>{errors.purchasePrice}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Sale Price (₨) *</label>
            <input type="number" className="input" value={form.salePrice} onChange={e => setForm(f=>({...f,salePrice:e.target.value}))} placeholder="0" />
            {errors.salePrice && <span style={{ color:'var(--accent-red)', fontSize:11 }}>{errors.salePrice}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Current Stock</label>
            <input type="number" className="input" value={form.stock} onChange={e => setForm(f=>({...f,stock:e.target.value}))} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Stock (Alert Level)</label>
            <input type="number" className="input" value={form.minStock} onChange={e => setForm(f=>({...f,minStock:e.target.value}))} placeholder="0" />
          </div>

          {/* Margin preview */}
          {form.purchasePrice && form.salePrice && (
            <div style={{ gridColumn:'1/-1', background:'var(--bg-input)', padding:12, borderRadius:8, border:'1px solid var(--border)' }}>
              <div style={{ display:'flex', gap:24 }}>
                <div><span style={{ color:'var(--text-muted)', fontSize:12 }}>Profit per unit: </span><span style={{ color:'var(--accent-green)', fontFamily:'JetBrains Mono', fontWeight:600 }}>₨ {fmt(Number(form.salePrice) - Number(form.purchasePrice))}</span></div>
                <div><span style={{ color:'var(--text-muted)', fontSize:12 }}>Margin: </span><span style={{ color:'var(--accent-green)', fontFamily:'JetBrains Mono', fontWeight:600 }}>{(((Number(form.salePrice) - Number(form.purchasePrice)) / Number(form.purchasePrice)) * 100).toFixed(1)}%</span></div>
              </div>
            </div>
          )}

          <div style={{ gridColumn:'1/-1', display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>{editing ? 'Update Product' : 'Add Product'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
