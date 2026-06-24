import React, { useState, useEffect } from 'react';
import { companyStore, vendorStore, customerStore } from '../utils/store';
import { Modal, SearchInput, EmptyState, fmt } from '../components/UI';

function EntityPage({ title, store, fields, extraCols = [] }) {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const emptyForm = () => Object.fromEntries(fields.map(f => [f.key, '']));
  const load = () => setList(store.getAll());
  useEffect(load, []);

  const filtered = list.filter(item =>
    (item.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (item.phone || '').includes(query)
  );

  function openNew() { setForm(emptyForm()); setEditing(null); setOpen(true); }
  function openEdit(item) {
    setForm(Object.fromEntries(fields.map(f => [f.key, item[f.key] ?? ''])));
    setEditing(item.id); setOpen(true);
  }
  function save() {
    if (!form.name?.trim()) return;
    if (editing) store.update(editing, form);
    else store.add(form);
    load(); setOpen(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{list.length} total records</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <SearchInput value={query} onChange={setQuery} placeholder={`Search ${title.toLowerCase()}...`} />
          <button className="btn btn-primary" onClick={openNew}>+ New {title.slice(0,-1)}</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                {fields.filter(f => f.table !== false).map(f => <th key={f.key}>{f.label}</th>)}
                {extraCols.map(c => <th key={c.key} style={{ textAlign: c.right ? 'right' : 'left' }}>{c.label}</th>)}
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={10}><EmptyState message={`No ${title.toLowerCase()} found`} /></td></tr>
                : filtered.map((item, i) => (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-muted)', width: 40 }}>{i+1}</td>
                    {fields.filter(f => f.table !== false).map(f => (
                      <td key={f.key} style={{ color: f.primary ? 'var(--text-primary)' : undefined, fontWeight: f.primary ? 500 : undefined }}>
                        {item[f.key] || '—'}
                      </td>
                    ))}
                    {extraCols.map(c => (
                      <td key={c.key} style={{ textAlign: c.right ? 'right' : 'left' }}>
                        {c.render ? c.render(item) : item[c.key]}
                      </td>
                    ))}
                    <td><span className={`badge ${item.active ? 'badge-green' : 'badge-red'}`}>{item.active ? 'Active' : 'Inactive'}</span></td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>Edit</button>
                        <button className={`btn btn-sm ${item.active ? 'btn-ghost' : 'btn-success'}`}
                          onClick={() => { store.toggle(item.id); load(); }}>
                          {item.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? `Edit ${title.slice(0,-1)}` : `New ${title.slice(0,-1)}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map(f => (
            <div className="form-group" key={f.key}>
              <label className="form-label">{f.label}{f.required ? ' *' : ''}</label>
              <input className="input" type={f.type || 'text'} value={form[f.key] || ''} onChange={e => setForm(fm => ({ ...fm, [f.key]: e.target.value }))} placeholder={f.placeholder || ''} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const COMPANY_FIELDS = [
  { key: 'name', label: 'Company Name', required: true, primary: true, placeholder: 'e.g. Samsung Pakistan' },
  { key: 'phone', label: 'Phone', placeholder: '021-...' },
  { key: 'email', label: 'Email', type: 'email', placeholder: 'info@company.com' },
  { key: 'address', label: 'Address', placeholder: 'City, Country' },
];

const VENDOR_FIELDS = [
  { key: 'name', label: 'Vendor Name', required: true, primary: true, placeholder: 'e.g. Tech Distributors' },
  { key: 'phone', label: 'Phone', placeholder: '0300-...' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'address', label: 'Address' },
  { key: 'balance', label: 'Opening Balance', type: 'number', table: false, placeholder: '0' },
];

const CUSTOMER_FIELDS = [
  { key: 'name', label: 'Customer Name', required: true, primary: true, placeholder: 'Full name' },
  { key: 'phone', label: 'Phone', placeholder: '03xx-...' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'address', label: 'Address' },
  { key: 'balance', label: 'Opening Balance', type: 'number', table: false, placeholder: '0' },
];

export function Companies() {
  return <EntityPage title="Companies" store={companyStore} fields={COMPANY_FIELDS} />;
}

export function Vendors() {
  return <EntityPage
    title="Vendors"
    store={vendorStore}
    fields={VENDOR_FIELDS}
    extraCols={[{
      key: 'balance', label: 'Balance', right: true,
      render: v => <span style={{ color: v.balance < 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 13 }}>₨ {fmt(Math.abs(v.balance))}</span>
    }]}
  />;
}

export function Customers() {
  return <EntityPage
    title="Customers"
    store={customerStore}
    fields={CUSTOMER_FIELDS}
    extraCols={[{
      key: 'balance', label: 'Balance', right: true,
      render: c => <span style={{ color: c.balance > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontFamily: 'JetBrains Mono', fontWeight: 600, fontSize: 13 }}>₨ {fmt(c.balance)}</span>
    }]}
  />;
}
