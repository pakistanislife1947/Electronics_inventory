import React, { useState, useEffect } from 'react';
import { productStore, vendorStore, purchaseStore } from '../utils/store';
import { EmptyState, fmt, fmtDateTime } from '../components/UI';

function newItem() { return { productId: '', name: '', code: '', qty: 1, purchasePrice: 0, total: 0 }; }

export default function Purchase() {
  const [tab, setTab] = useState('new');
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([newItem()]);
  const [vendorId, setVendorId] = useState('');
  const [paid, setPaid] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [alert, setAlert] = useState('');
  const [productSearch, setProductSearch] = useState([]);
  const [activeRow, setActiveRow] = useState(0);
  // Return
  const [returnBillId, setReturnBillId] = useState('');
  const [returnItems, setReturnItems] = useState([]);

  const load = () => {
    setProducts(productStore.getAll().filter(p=>p.active));
    setVendors(vendorStore.getAll().filter(v=>v.active));
    setPurchases(purchaseStore.getAll());
    setVendorId(vendorStore.getAll()[0]?.id || '');
  };
  useEffect(load, []);

  function handleProductSearch(val, idx) {
    const updated=[...items]; updated[idx]={...updated[idx],name:val}; setItems(updated);
    setActiveRow(idx);
    const q=val.toLowerCase();
    setProductSearch(val.length < 1 ? [] : products.filter(p=>p.name.toLowerCase().includes(q)||p.code.toLowerCase().includes(q)).slice(0,8));
  }

  function selectProduct(p, idx) {
    const updated=[...items];
    updated[idx]={...updated[idx],productId:p.id,name:p.name,code:p.code,purchasePrice:p.purchasePrice,qty:1,total:p.purchasePrice};
    setItems(updated); setProductSearch([]);
  }

  function updateRow(idx, field, value) {
    const updated=[...items];
    const row={...updated[idx],[field]:value};
    const qty=field==='qty'?Number(value):Number(row.qty);
    const price=field==='purchasePrice'?Number(value):Number(row.purchasePrice);
    row.total=qty*price;
    updated[idx]=row; setItems(updated);
  }

  const total=items.reduce((a,i)=>a+(i.total||0),0);
  const balance=total-Number(paid);

  function save() {
    const valid=items.filter(i=>i.productId);
    if(!valid.length){setAlert('Add at least one product.');return;}
    const vendor=vendors.find(v=>v.id===vendorId);
    purchaseStore.add({items:valid.map(i=>({productId:i.productId,name:i.name,qty:Number(i.qty),price:i.purchasePrice,total:i.total})),vendorId,vendorName:vendor?.name||'',total,paid:Number(paid),remarks});
    load(); setItems([newItem()]); setPaid(0); setRemarks(''); setAlert(''); setTab('history');
  }

  function loadReturn() {
    const p=purchases.find(p=>String(p.billNo)===returnBillId&&p.type!=='return');
    if(!p){setAlert('Bill not found.');return;}
    setReturnItems((p.items||[]).map(i=>({...i,returnQty:i.qty})));
  }

  function handleReturn() {
    const p=purchases.find(p=>String(p.billNo)===returnBillId);
    if(!p||!returnItems.length)return;
    const total=returnItems.reduce((a,i)=>a+i.price*i.returnQty,0);
    purchaseStore.addReturn({originalBill:p.billNo,items:returnItems.map(i=>({productId:i.productId,name:i.name,qty:i.returnQty,price:i.price,total:i.price*i.returnQty})),total,vendorId:p.vendorId,vendorName:p.vendorName});
    load(); setReturnItems([]); setReturnBillId(''); setAlert('');
  }

  const onlyPurchases=purchases.filter(p=>p.type!=='return');
  const onlyReturns=purchases.filter(p=>p.type==='return');

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'16px 24px 0', borderBottom:'1px solid var(--border)', background:'var(--bg-card)', display:'flex', alignItems:'center', gap:20 }}>
        <h2 style={{ marginRight:16 }}>Purchase</h2>
        {['new','history','return'].map(t=>(
          <button key={t} onClick={()=>{setTab(t);setAlert('');}}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:tab===t?600:400, color:tab===t?'var(--accent)':'var(--text-secondary)', borderBottom:tab===t?'2px solid var(--accent)':'2px solid transparent', paddingBottom:12, textTransform:'capitalize' }}>
            {t==='new'?'New Purchase':t==='history'?'Purchase History':'Purchase Return'}
          </button>
        ))}
      </div>

      {tab==='new'&&(
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ padding:'12px 24px', display:'flex', gap:12, borderBottom:'1px solid var(--border)' }}>
            <div className="form-group" style={{ flex:2 }}>
              <label className="form-label">Vendor</label>
              <select className="select" value={vendorId} onChange={e=>setVendorId(e.target.value)}>
                {vendors.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex:1 }}>
              <label className="form-label">Remarks</label>
              <input className="input" value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          {alert&&<div className="alert alert-error" style={{margin:'10px 24px 0'}}>{alert}</div>}
          <div style={{ flex:1, overflow:'auto', padding:'0 24px' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', marginTop:8 }}>
              <thead><tr>
                <th style={{ padding:'10px 8px', textAlign:'left', color:'var(--text-muted)', fontSize:11 }}>#</th>
                <th style={{ padding:'10px 8px', textAlign:'left', color:'var(--text-muted)', fontSize:11 }}>PRODUCT</th>
                <th style={{ width:120, padding:'10px 8px', color:'var(--text-muted)', fontSize:11 }}>PURCHASE PRICE</th>
                <th style={{ width:80, padding:'10px 8px', color:'var(--text-muted)', fontSize:11 }}>QTY</th>
                <th style={{ width:120, padding:'10px 8px', textAlign:'right', color:'var(--text-muted)', fontSize:11 }}>TOTAL</th>
                <th style={{ width:36 }}></th>
              </tr></thead>
              <tbody>
                {items.map((row,idx)=>(
                  <tr key={idx} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'8px', color:'var(--text-muted)', fontSize:12 }}>{idx+1}</td>
                    <td style={{ padding:'6px 8px', position:'relative' }}>
                      <input className="input" value={row.name} onChange={e=>handleProductSearch(e.target.value,idx)} placeholder="Type product name..." style={{ fontSize:13 }} />
                      {activeRow===idx&&productSearch.length>0&&(
                        <div style={{ position:'absolute',top:'100%',left:8,right:0,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:8,zIndex:100,boxShadow:'var(--shadow)',maxHeight:200,overflowY:'auto' }}>
                          {productSearch.map(p=>(
                            <div key={p.id} onClick={()=>selectProduct(p,idx)} style={{ padding:'9px 14px',cursor:'pointer',fontSize:13,display:'flex',justifyContent:'space-between' }}
                              onMouseEnter={e=>e.currentTarget.style.background='rgba(79,110,247,0.1)'}
                              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                              <span>{p.name}</span>
                              <span style={{ color:'var(--accent-amber)',fontFamily:'JetBrains Mono',fontSize:12 }}>₨ {fmt(p.purchasePrice)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding:'6px 8px' }}>
                      <input type="number" className="input" value={row.purchasePrice} onChange={e=>updateRow(idx,'purchasePrice',e.target.value)} />
                    </td>
                    <td style={{ padding:'6px 8px' }}>
                      <input type="number" className="input" value={row.qty} min={1} onChange={e=>updateRow(idx,'qty',e.target.value)} />
                    </td>
                    <td style={{ padding:'6px 8px', textAlign:'right', fontFamily:'JetBrains Mono', color:'var(--accent-amber)', fontWeight:600 }}>₨ {fmt(row.total)}</td>
                    <td style={{ padding:'6px 4px' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>{ if(items.length===1){setItems([newItem()]);return;} setItems(items.filter((_,i)=>i!==idx)); }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-ghost btn-sm" style={{ marginTop:10 }} onClick={()=>setItems(i=>[...i,newItem()])}>+ Add Row</button>
          </div>
          <div style={{ borderTop:'1px solid var(--border)', background:'var(--bg-card)', padding:'14px 24px', display:'flex', alignItems:'flex-end', gap:16 }}>
            <div className="form-group" style={{ width:200 }}>
              <label className="form-label">Amount Paid (₨)</label>
              <input type="number" className="input" value={paid} onChange={e=>setPaid(e.target.value)} />
            </div>
            <div style={{ display:'flex', gap:24, padding:'0 20px', background:'var(--bg-input)', borderRadius:8, height:56, alignItems:'center', border:'1px solid var(--border)', flex:1 }}>
              {[['Total',`₨ ${fmt(total)}`,'var(--accent-amber)'],['Paid',`₨ ${fmt(paid)}`,'var(--accent-green)'],['Balance',`₨ ${fmt(balance)}`,'var(--accent-red)']].map(([l,v,c])=>(
                <div key={l} style={{ textAlign:'center', flex:1 }}>
                  <div style={{ fontSize:10,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em' }}>{l}</div>
                  <div style={{ fontSize:15,fontWeight:700,color:c,fontFamily:'JetBrains Mono' }}>{v}</div>
                </div>
              ))}
            </div>
            <button className="btn btn-amber" onClick={save}>Save Purchase</button>
          </div>
        </div>
      )}

      {tab==='history'&&(
        <div className="page">
          <div className="card" style={{ padding:0 }}>
            <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)' }}><h3>Purchase History ({onlyPurchases.length})</h3></div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Bill #</th><th>Date</th><th>Vendor</th><th>Items</th><th style={{textAlign:'right'}}>Total</th><th style={{textAlign:'right'}}>Paid</th><th style={{textAlign:'right'}}>Balance</th></tr></thead>
                <tbody>
                  {onlyPurchases.length===0?<tr><td colSpan={7}><EmptyState message="No purchases yet" /></td></tr>
                    :[...onlyPurchases].reverse().map(p=>(
                    <tr key={p.id}>
                      <td><span className="badge badge-amber">#{p.billNo}</span></td>
                      <td>{fmtDateTime(p.date)}</td>
                      <td style={{color:'var(--text-primary)'}}>{p.vendorName}</td>
                      <td>{(p.items||[]).length} items</td>
                      <td style={{textAlign:'right',fontFamily:'JetBrains Mono',color:'var(--accent-amber)',fontWeight:600}}>₨ {fmt(p.total)}</td>
                      <td style={{textAlign:'right',fontFamily:'JetBrains Mono',color:'var(--accent-green)'}}>₨ {fmt(p.paid)}</td>
                      <td style={{textAlign:'right',fontFamily:'JetBrains Mono',color:'var(--accent-red)'}}>₨ {fmt(p.total-(p.paid||0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab==='return'&&(
        <div className="page">
          <div className="card" style={{maxWidth:700}}>
            <h3 style={{marginBottom:16}}>Purchase Return</h3>
            {alert&&<div className="alert alert-error">{alert}</div>}
            <div style={{display:'flex',gap:10,marginBottom:20}}>
              <input className="input" placeholder="Enter Bill Number" value={returnBillId} onChange={e=>setReturnBillId(e.target.value)} />
              <button className="btn btn-primary" onClick={loadReturn}>Load Bill</button>
            </div>
            {returnItems.length>0&&(
              <>
                <table style={{width:'100%',borderCollapse:'collapse',marginBottom:16}}>
                  <thead><tr><th style={{textAlign:'left',padding:'8px',color:'var(--text-muted)',fontSize:11}}>PRODUCT</th><th style={{padding:'8px',color:'var(--text-muted)',fontSize:11}}>BOUGHT</th><th style={{padding:'8px',color:'var(--text-muted)',fontSize:11}}>RETURN</th><th style={{textAlign:'right',padding:'8px',color:'var(--text-muted)',fontSize:11}}>REFUND</th></tr></thead>
                  <tbody>
                    {returnItems.map((item,idx)=>(
                      <tr key={idx} style={{borderBottom:'1px solid var(--border)'}}>
                        <td style={{padding:'8px',color:'var(--text-primary)'}}>{item.name}</td>
                        <td style={{padding:'8px',textAlign:'center'}}>{item.qty}</td>
                        <td style={{padding:'8px'}}><input type="number" className="input" style={{width:80}} value={item.returnQty} min={0} max={item.qty} onChange={e=>{const u=[...returnItems];u[idx]={...u[idx],returnQty:Number(e.target.value)};setReturnItems(u);}}/></td>
                        <td style={{padding:'8px',textAlign:'right',color:'var(--accent-amber)',fontFamily:'JetBrains Mono'}}>₨ {fmt(item.price*item.returnQty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button className="btn btn-danger" onClick={handleReturn}>Process Return</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
