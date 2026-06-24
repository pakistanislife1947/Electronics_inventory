import React, { useState, useEffect } from 'react';
import { productStore, categoryStore } from '../utils/store';
import { SearchInput, fmt } from '../components/UI';

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [filter, setFilter] = useState('all'); // all | low | out

  useEffect(() => {
    setProducts(productStore.getAll().filter(p=>p.active));
    setCats(categoryStore.getAll().filter(c=>c.active));
  }, []);

  const filtered = products.filter(p => {
    const q = query.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    const matchCat = !catFilter || p.categoryId === catFilter;
    const matchFilter = filter==='all' || (filter==='low' && p.stock>0 && p.stock<=(p.minStock||0)) || (filter==='out' && p.stock===0);
    return matchQ && matchCat && matchFilter;
  });

  const catName = id => cats.find(c=>c.id===id)?.name || '—';
  const totalValue = products.reduce((a,p)=>a+p.stock*p.purchasePrice, 0);
  const totalSaleValue = products.reduce((a,p)=>a+p.stock*p.salePrice, 0);
  const outOfStock = products.filter(p=>p.stock===0).length;
  const lowStock = products.filter(p=>p.stock>0&&p.stock<=(p.minStock||0)).length;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Stock</h1>
          <p style={{ color:'var(--text-muted)', fontSize:12, marginTop:2 }}>Real-time inventory overview</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <SearchInput value={query} onChange={setQuery} placeholder="Search products..." />
          <select className="select" style={{ width:160 }} value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
            <option value="">All Categories</option>
            {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary cards */}
      <div className="stat-grid" style={{ marginBottom:24 }}>
        {[
          { label:'Total Products', value:products.length, color:'#4f6ef7' },
          { label:'Stock Value (Cost)', value:`₨ ${fmt(totalValue)}`, color:'#f59e0b' },
          { label:'Stock Value (Sale)', value:`₨ ${fmt(totalSaleValue)}`, color:'#22c55e' },
          { label:'Potential Profit', value:`₨ ${fmt(totalSaleValue-totalValue)}`, color:'#a855f7' },
          { label:'Out of Stock', value:outOfStock, color:'#ef4444' },
          { label:'Low Stock', value:lowStock, color:'#f59e0b' },
        ].map((s,i)=>(
          <div key={i} className="card" style={{ padding:'16px 20px' }}>
            <div style={{ fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6 }}>{s.label}</div>
            <div style={{ fontSize:20, fontWeight:700, color:s.color, fontFamily:'JetBrains Mono' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[['all','All Products'],['low','Low Stock'],['out','Out of Stock']].map(([v,l])=>(
          <button key={v} className={`btn btn-sm ${filter===v?'btn-primary':'btn-ghost'}`} onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>

      <div className="card" style={{ padding:0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th><th>Product Name</th><th>Category</th>
                <th style={{textAlign:'center'}}>Current Stock</th>
                <th style={{textAlign:'center'}}>Min Level</th>
                <th style={{textAlign:'right'}}>Purchase Price</th>
                <th style={{textAlign:'right'}}>Sale Price</th>
                <th style={{textAlign:'right'}}>Stock Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0
                ? <tr><td colSpan={9} style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>No products match the filter</td></tr>
                : filtered.map(p=>(
                  <tr key={p.id}>
                    <td className="mono" style={{fontSize:12,color:'var(--text-muted)'}}>{p.code}</td>
                    <td style={{color:'var(--text-primary)',fontWeight:500}}>{p.name}</td>
                    <td>{catName(p.categoryId)}</td>
                    <td style={{textAlign:'center'}}>
                      <span className={`badge ${p.stock===0?'badge-red':p.stock<=(p.minStock||0)?'badge-amber':'badge-green'}`} style={{fontSize:13,padding:'3px 12px'}}>
                        {p.stock}
                      </span>
                    </td>
                    <td style={{textAlign:'center',color:'var(--text-muted)'}}>{p.minStock||0}</td>
                    <td style={{textAlign:'right',fontFamily:'JetBrains Mono',fontSize:13}}>₨ {fmt(p.purchasePrice)}</td>
                    <td style={{textAlign:'right',fontFamily:'JetBrains Mono',fontSize:13,color:'var(--accent-green)'}}>₨ {fmt(p.salePrice)}</td>
                    <td style={{textAlign:'right',fontFamily:'JetBrains Mono',fontSize:13,color:'var(--accent-amber)',fontWeight:600}}>₨ {fmt(p.stock*p.purchasePrice)}</td>
                    <td>
                      {p.stock===0 ? <span className="badge badge-red">Out of Stock</span>
                       : p.stock<=(p.minStock||0) ? <span className="badge badge-amber">Low Stock</span>
                       : <span className="badge badge-green">In Stock</span>}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
