import React, { useState, useEffect } from 'react';
import { categoryStore } from '../utils/store';
import { Modal, SearchInput, EmptyState, Confirm } from '../components/UI';

const empty = { name: '', description: '' };

export default function Categories() {
  const [list, setList] = useState([]);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = () => setList(categoryStore.getAll());
  useEffect(load, []);

  const filtered = list.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  function openNew() { setForm(empty); setEditing(null); setOpen(true); }
  function openEdit(c) { setForm({ name: c.name, description: c.description || '' }); setEditing(c.id); setOpen(true); }

  function save() {
    if (!form.name.trim()) return;
    if (editing) categoryStore.update(editing, form);
    else categoryStore.add(form);
    load(); setOpen(false);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Categories</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>{list.length} total categories</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Search categories..." />
          <button className="btn btn-primary" onClick={openNew}>+ New Category</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>#</th><th>Name</th><th>Description</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5}><EmptyState message="No categories found" /></td></tr>
                : filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--text-muted)', width: 40 }}>{i+1}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{c.name}</td>
                    <td>{c.description || '—'}</td>
                    <td>
                      <span className={`badge ${c.active ? 'badge-green' : 'badge-red'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(c)}>Edit</button>
                        <button className={`btn btn-sm ${c.active ? 'btn-ghost' : 'btn-success'}`}
                          onClick={() => { categoryStore.toggle(c.id); load(); }}>
                          {c.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Category Name *</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mobile Phones" />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <input className="input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save}>{editing ? 'Update' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      <Confirm open={!!confirm} message="Delete this category?" onConfirm={() => { categoryStore.delete(confirm); load(); setConfirm(null); }} onCancel={() => setConfirm(null)} />
    </div>
  );
}
