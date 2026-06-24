import React, { useState, useEffect } from 'react';
import { incomeStore, expenseStore } from '../utils/store';
import { Modal, EmptyState, fmt, fmtDate } from '../components/UI';

function FinancePage({ title, store, color }) {
  const [tab, setTab] = useState('new');
  const [list, setList] = useState([]);
  const [types, setTypes] = useState([]);
  const [form, setForm] = useState({ typeId: '', amount: '', description: '', date: new Date().toISOString().slice(0,10) });
  const [newType, setNewType] = useState('');
  const [alert, setAlert] = useState('');

  const load = () => { setList(store.getAll()); setTypes(store.getTypes()); };
  useEffect(load, []);

  function addType() {
    if (!newType.trim()) return;
    store.addType(newType.trim()); load(); setNewType('');
  }

  function save() {
    if (!form.typeId || !form.amount) { setAlert('Fill in type and amount.'); return; }
    store.add({ ...form, amount: Number(form.amount), typeName: types.find(t=>t.id===form.typeId)?.name || '' });
    load(); setAlert('');
    setForm({ typeId: '', amount: '', description: '', date: new Date().toISOString().slice(0,10) });
    setTab('history');
  }

  const total = list.reduce((a,i) => a + (i.amount||0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <h1>{title}</h1>
        <div style={{ display:'flex', gap:8, background:'var(--bg-card)', padding:'4px', borderRadius:8, border:'1px solid var(--border)' }}>
          {['new','history','types'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`btn btn-sm ${tab===t ? 'btn-primary' : 'btn-ghost'}`}
              style={{ textTransform:'capitalize' }}>
              {t === 'new' ? `New ${title}` : t === 'history' ? 'History' : 'Manage Types'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'new' && (
        <div style={{ maxWidth:540 }}>
          <div className="card">
            <h3 style={{ marginBottom:20 }}>Record New {title}</h3>
            {alert && <div className="alert alert-error">{alert}</div>}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div className="form-group">
                <label className="form-label">{title} Type *</label>
                <select className="select" value={form.typeId} onChange={e => setForm(f=>({...f,typeId:e.target.value}))}>
                  <option value="">Select type</option>
                  {types.filter(t=>t.active).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (₨) *</label>
                <input type="number" className="input" value={form.amount} onChange={e => setForm(f=>({...f,amount:e.target.value}))} placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="input" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Description / Notes</label>
                <input className="input" value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} placeholder="Optional notes" />
              </div>
              <button className="btn btn-primary" onClick={save} style={{ alignSelf:'flex-start' }}>Save {title}</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <>
          <div style={{ marginBottom:16, display:'flex', gap:12 }}>
            <div className="card" style={{ padding:'14px 20px', display:'inline-flex', flexDirection:'column', gap:2 }}>
              <span style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Total {title}</span>
              <span style={{ fontSize:22, fontWeight:700, color, fontFamily:'JetBrains Mono' }}>₨ {fmt(total)}</span>
            </div>
            <div className="card" style={{ padding:'14px 20px', display:'inline-flex', flexDirection:'column', gap:2 }}>
              <span style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Records</span>
              <span style={{ fontSize:22, fontWeight:700, color:'var(--text-primary)', fontFamily:'JetBrains Mono' }}>{list.length}</span>
            </div>
          </div>
          <div className="card" style={{ padding:0 }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Date</th><th>Type</th><th>Description</th><th style={{textAlign:'right'}}>Amount</th><th></th></tr></thead>
                <tbody>
                  {list.length === 0
                    ? <tr><td colSpan={6}><EmptyState message={`No ${title.toLowerCase()} records yet`} /></td></tr>
                    : [...list].reverse().map((item,i) => (
                      <tr key={item.id}>
                        <td style={{ color:'var(--text-muted)' }}>{list.length - i}</td>
                        <td>{fmtDate(item.date)}</td>
                        <td><span className="badge badge-blue">{item.typeName}</span></td>
                        <td style={{ color:'var(--text-muted)' }}>{item.description || '—'}</td>
                        <td style={{ textAlign:'right', color, fontFamily:'JetBrains Mono', fontWeight:600 }}>₨ {fmt(item.amount)}</td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => { store.delete(item.id); load(); }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'types' && (
        <div style={{ maxWidth:500 }}>
          <div className="card">
            <h3 style={{ marginBottom:16 }}>Manage {title} Types</h3>
            <div style={{ display:'flex', gap:10, marginBottom:20 }}>
              <input className="input" value={newType} onChange={e => setNewType(e.target.value)} placeholder={`New ${title.toLowerCase()} type name`} onKeyDown={e => e.key==='Enter' && addType()} />
              <button className="btn btn-primary" onClick={addType}>Add</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {types.map(t => (
                <div key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'var(--bg-input)', borderRadius:8, border:'1px solid var(--border)' }}>
                  <span style={{ fontSize:13 }}>{t.name}</span>
                  <span className={`badge ${t.active ? 'badge-green' : 'badge-red'}`}>{t.active ? 'Active' : 'Inactive'}</span>
                </div>
              ))}
              {types.length === 0 && <p style={{ color:'var(--text-muted)', fontSize:13 }}>No types added yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Income() {
  return <FinancePage title="Income" store={incomeStore} color="var(--accent-green)" />;
}

export function Expenses() {
  return <FinancePage title="Expenses" store={expenseStore} color="var(--accent-red)" />;
}
