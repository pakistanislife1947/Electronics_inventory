import React, { useState, useEffect } from 'react';
import { userStore } from '../utils/store';

export default function Account() {
  const [form, setForm] = useState({ name:'', shopName:'', role:'' });
  const [saved, setSaved] = useState(false);

  useEffect(() => { const u=userStore.get(); setForm({ name:u.name||'', shopName:u.shopName||'', role:u.role||'' }); }, []);

  function save() {
    userStore.update(form);
    setSaved(true);
    setTimeout(()=>setSaved(false), 3000);
  }

  function clearData() {
    if (window.confirm('This will delete ALL data including products, sales, and purchases. This cannot be undone. Continue?')) {
      const keys = Object.keys(localStorage).filter(k => k.startsWith('epos_'));
      keys.forEach(k => localStorage.removeItem(k));
      window.location.reload();
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Account</h1>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, maxWidth:900 }}>
        {/* Profile */}
        <div className="card">
          <h3 style={{ marginBottom:20 }}>Shop & Profile Settings</h3>
          {saved && <div className="alert alert-success" style={{ marginBottom:16 }}>Settings saved successfully.</div>}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="form-group">
              <label className="form-label">Shop Name</label>
              <input className="input" value={form.shopName} onChange={e=>setForm(f=>({...f,shopName:e.target.value}))} placeholder="Your electronics shop name" />
            </div>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Admin name" />
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="select" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>
                <option value="Administrator">Administrator</option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={save} style={{ alignSelf:'flex-start', marginTop:4 }}>Save Settings</button>
          </div>
        </div>

        {/* System info */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <h3 style={{ marginBottom:16 }}>About ElectroPOS</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {[
                ['Version', '1.0.0'],
                ['Storage', 'Local (Browser)'],
                ['Status', 'Offline Ready'],
                ['Framework', 'React 18'],
              ].map(([l,v])=>(
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:13, color:'var(--text-muted)' }}>{l}</span>
                  <span style={{ fontSize:13, color:'var(--text-primary)', fontWeight:500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ border:'1px solid rgba(239,68,68,0.3)' }}>
            <h3 style={{ marginBottom:8, color:'var(--accent-red)' }}>Danger Zone</h3>
            <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:16 }}>Clear all local data. This is permanent and cannot be undone.</p>
            <button className="btn btn-danger" onClick={clearData}>Clear All Data</button>
          </div>

          <div className="card">
            <h3 style={{ marginBottom:12 }}>Migration Guide</h3>
            <p style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.7 }}>
              This app currently uses browser localStorage for data. When you're ready to move to Supabase:
            </p>
            <ol style={{ fontSize:12, color:'var(--text-secondary)', marginTop:10, paddingLeft:16, lineHeight:2 }}>
              <li>Create a Supabase project</li>
              <li>Run the schema SQL (in /supabase/schema.sql)</li>
              <li>Replace functions in utils/store.js with Supabase calls</li>
              <li>Move to Vercel for hosting</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
