import React, { useState, useEffect, useRef } from 'react';
import { productStore, customerStore, saleStore } from '../utils/store';
import { Modal, fmt, fmtDateTime } from '../components/UI';

function newItem() { return { productId: '', name: '', code: '', stock: 0, salePrice: 0, qty: 1, discount: 0, total: 0 }; }

export default function Sales() {
  const [tab, setTab] = useState('new'); // new | history | return
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);

  // Invoice state
  const [items, setItems] = useState([newItem()]);
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [received, setReceived] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [search, setSearch] = useState('');
  const [productSearch, setProductSearch] = useState([]);
  const [activeRow, setActiveRow] = useState(0);
  const [alert, setAlert] = useState('');
  const [held, setHeld] = useState([]);
  const [showHold, setShowHold] = useState(false);
  const [showRecent, setShowRecent] = useState(false);
  const [returnSaleId, setReturnSaleId] = useState('');

  useEffect(() => {
    setProducts(productStore.getAll().filter(p => p.active));
    setCustomers(customerStore.getAll().filter(c => c.active));
    setSales(saleStore.getAll().filter(s => s.type !== 'return'));
    setCustomerId(customerStore.getAll()[0]?.id || '');
  }, [tab]);

  // Product search
  function handleProductSearch(val, rowIdx) {
    const updated = [...items];
    updated[rowIdx] = { ...updated[rowIdx], name: val };
    setItems(updated);
    setActiveRow(rowIdx);
    if (val.length < 1) { setProductSearch([]); return; }
    const q = val.toLowerCase();
    setProductSearch(products.filter(p =>
      p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    ).slice(0, 8));
  }

  function selectProduct(p, rowIdx) {
    const updated = [...items];
    updated[rowIdx] = {
      ...updated[rowIdx],
      productId: p.id, name: p.name, code: p.code,
      stock: p.stock, salePrice: p.salePrice, qty: 1,
      discount: 0, total: p.salePrice,
    };
    setItems(updated);
    setProductSearch([]);
  }

  function updateRow(rowIdx, field, value) {
    const updated = [...items];
    const row = { ...updated[rowIdx], [field]: value };
    if (field === 'qty' || field === 'salePrice' || field === 'discount') {
      const qty = field === 'qty' ? Number(value) : Number(row.qty);
      const price = field === 'salePrice' ? Number(value) : Number(row.salePrice);
      const disc = field === 'discount' ? Number(value) : Number(row.discount);
      row.total = (price - disc) * qty;
    }
    updated[rowIdx] = row;
    setItems(updated);
  }

  function removeRow(idx) {
    if (items.length === 1) { setItems([newItem()]); return; }
    setItems(items.filter((_, i) => i !== idx));
  }

  const subtotal = items.reduce((a, i) => a + (i.total || 0), 0);
  const taxAmt = Math.round(subtotal * tax / 100);
  const total = subtotal + taxAmt - Number(discount);
  const balance = total - Number(received);

  function resetForm() {
    setItems([newItem()]); setDiscount(0); setTax(0);
    setReceived(0); setRemarks(''); setPaymentType('cash');
  }

  function handleSave(pay = false) {
    const validItems = items.filter(i => i.productId);
    if (!validItems.length) { setAlert('Add at least one product.'); return; }
    for (const i of validItems) {
      if (i.qty > i.stock) { setAlert(`"${i.name}" only has ${i.stock} in stock.`); return; }
    }
    const customer = customers.find(c => c.id === customerId);
    saleStore.add({
      items: validItems.map(i => ({ productId: i.productId, name: i.name, qty: Number(i.qty), price: i.salePrice, discount: i.discount, total: i.total })),
      customerId, customerName: customer?.name || 'Walk-in',
      subtotal, discount: Number(discount), tax: taxAmt, total,
      received: pay ? Number(received) : 0,
      paymentType: pay ? paymentType : 'pending',
      remarks,
    });
    setAlert('');
    setSales(saleStore.getAll().filter(s => s.type !== 'return'));
    resetForm();
    setTab('history');
  }

  function holdInvoice() {
    const validItems = items.filter(i => i.productId);
    if (!validItems.length) return;
    setHeld(h => [...h, { items, customerId, discount, tax, received, remarks }]);
    resetForm();
  }

  function restoreHold(idx) {
    const h = held[idx];
    setItems(h.items); setCustomerId(h.customerId);
    setDiscount(h.discount); setTax(h.tax);
    setReceived(h.received); setRemarks(h.remarks);
    setHeld(hh => hh.filter((_, i) => i !== idx));
    setShowHold(false);
  }

  // Return
  const [returnItems, setReturnItems] = useState([]);
  function loadReturn() {
    const sale = sales.find(s => String(s.invoiceNo) === returnSaleId);
    if (!sale) { setAlert('Invoice not found.'); return; }
    setReturnItems((sale.items || []).map(i => ({ ...i, returnQty: i.qty })));
  }
  function handleReturn() {
    const sale = sales.find(s => String(s.invoiceNo) === returnSaleId);
    if (!sale || !returnItems.length) return;
    const total = returnItems.reduce((a, i) => a + i.price * i.returnQty, 0);
    saleStore.addReturn({ originalInvoice: sale.invoiceNo, items: returnItems.map(i => ({ productId: i.productId, name: i.name, qty: i.returnQty, price: i.price, total: i.price * i.returnQty })), total, customerId: sale.customerId, customerName: sale.customerName });
    setAlert('Return processed.');
    setReturnItems([]); setReturnSaleId('');
    setSales(saleStore.getAll().filter(s => s.type !== 'return'));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{ padding: '16px 24px 0', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: 20 }}>
        <h2 style={{ marginRight: 16 }}>Sales</h2>
        {['new','history','return'].map(t => (
          <button key={t} onClick={() => { setTab(t); setAlert(''); }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'var(--accent)' : 'var(--text-secondary)',
              borderBottom: tab === t ? '2px solid var(--accent)' : '2px solid transparent',
              paddingBottom: 12, textTransform: 'capitalize',
            }}>
            {t === 'new' ? 'New Invoice' : t === 'history' ? 'Invoice History' : 'Sale Return'}
          </button>
        ))}
        {tab === 'new' && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowHold(true)}>
              Hold Invoices {held.length > 0 && <span className="badge badge-amber" style={{ marginLeft: 4 }}>{held.length}</span>}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowRecent(true)}>Recent</button>
          </div>
        )}
      </div>

      {/* New Invoice */}
      {tab === 'new' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Top bar */}
          <div style={{ padding: '12px 24px', display: 'flex', gap: 12, alignItems: 'flex-end', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label className="form-label">Customer</label>
              <select className="select" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Payment</label>
              <select className="select" value={paymentType} onChange={e => setPaymentType(e.target.value)}>
                <option value="cash">Cash</option>
                <option value="credit">Credit</option>
                <option value="card">Card</option>
                <option value="transfer">Bank Transfer</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Remarks</label>
              <input className="input" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          {alert && <div className="alert alert-error" style={{ margin: '10px 24px 0' }}>{alert}</div>}

          {/* Items table */}
          <div style={{ flex: 1, overflow: 'auto', padding: '0 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
              <thead>
                <tr>
                  <th style={{ width: 32, padding: '10px 8px', color: 'var(--text-muted)', fontSize: 11 }}>#</th>
                  <th style={{ padding: '10px 8px', textAlign: 'left', color: 'var(--text-muted)', fontSize: 11 }}>PRODUCT</th>
                  <th style={{ width: 80, padding: '10px 8px', color: 'var(--text-muted)', fontSize: 11 }}>CODE</th>
                  <th style={{ width: 80, padding: '10px 8px', color: 'var(--text-muted)', fontSize: 11 }}>STOCK</th>
                  <th style={{ width: 120, padding: '10px 8px', color: 'var(--text-muted)', fontSize: 11 }}>PRICE</th>
                  <th style={{ width: 80, padding: '10px 8px', color: 'var(--text-muted)', fontSize: 11 }}>QTY</th>
                  <th style={{ width: 100, padding: '10px 8px', color: 'var(--text-muted)', fontSize: 11 }}>DISC/ITEM</th>
                  <th style={{ width: 110, padding: '10px 8px', textAlign: 'right', color: 'var(--text-muted)', fontSize: 11 }}>TOTAL</th>
                  <th style={{ width: 36 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px', color: 'var(--text-muted)', fontSize: 12 }}>{idx+1}</td>
                    <td style={{ padding: '6px 8px', position: 'relative' }}>
                      <input
                        className="input"
                        value={row.name}
                        onChange={e => handleProductSearch(e.target.value, idx)}
                        placeholder="Type product name or code..."
                        style={{ fontSize: 13 }}
                      />
                      {activeRow === idx && productSearch.length > 0 && (
                        <div style={{
                          position: 'absolute', top: '100%', left: 8, right: 0,
                          background: 'var(--bg-card)', border: '1px solid var(--border)',
                          borderRadius: 8, zIndex: 100, boxShadow: 'var(--shadow)',
                          maxHeight: 240, overflowY: 'auto',
                        }}>
                          {productSearch.map(p => (
                            <div key={p.id} onClick={() => selectProduct(p, idx)}
                              style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,110,247,0.1)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <span>{p.name} <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>({p.code})</span></span>
                              <span style={{ color: 'var(--accent-green)', fontFamily: 'JetBrains Mono', fontSize: 12 }}>₨ {fmt(p.salePrice)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{row.code}</span>
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <span className={row.stock <= 0 ? 'badge badge-red' : 'badge badge-green'}>{row.stock}</span>
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input type="number" className="input" value={row.salePrice}
                        onChange={e => updateRow(idx, 'salePrice', e.target.value)} style={{ fontSize: 13 }} />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input type="number" className="input" value={row.qty} min={1}
                        onChange={e => updateRow(idx, 'qty', e.target.value)} style={{ fontSize: 13 }} />
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <input type="number" className="input" value={row.discount} min={0}
                        onChange={e => updateRow(idx, 'discount', e.target.value)} style={{ fontSize: 13 }} />
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontFamily: 'JetBrains Mono', color: 'var(--accent-green)', fontWeight: 600 }}>
                      ₨ {fmt(row.total)}
                    </td>
                    <td style={{ padding: '6px 4px' }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeRow(idx)}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 10 }}
              onClick={() => setItems(i => [...i, newItem()])}>
              + Add Row
            </button>
          </div>

          {/* Footer totals */}
          <div style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-card)', padding: '14px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Invoice Discount (₨)</label>
                    <input type="number" className="input" value={discount} onChange={e => setDiscount(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Tax %</label>
                    <input type="number" className="input" value={tax} onChange={e => setTax(e.target.value)} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Amount Received</label>
                    <input type="number" className="input" value={received} onChange={e => setReceived(e.target.value)} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '0 12px', background: 'var(--bg-input)', borderRadius: 8, height: 60, border: '1px solid var(--border)' }}>
                {[
                  ['Subtotal', `₨ ${fmt(subtotal)}`],
                  ['Tax', `₨ ${fmt(taxAmt)}`],
                  ['Discount', `₨ ${fmt(discount)}`],
                  ['Total', `₨ ${fmt(total)}`],
                  ['Balance', `₨ ${fmt(balance)}`],
                ].map(([l, v], i) => (
                  <div key={i} style={{ textAlign: 'center', padding: '0 16px', borderRight: i < 4 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: l === 'Total' ? 'var(--accent-green)' : l === 'Balance' ? 'var(--accent-red)' : 'var(--text-primary)', fontFamily: 'JetBrains Mono', marginTop: 2 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost" onClick={holdInvoice}>Hold</button>
                <button className="btn btn-ghost" onClick={resetForm}>Reset</button>
                <button className="btn btn-primary" onClick={() => handleSave(false)}>Save</button>
                <button className="btn btn-success" onClick={() => handleSave(true)}>Pay & Save</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {tab === 'history' && (
        <div className="page">
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3>Invoice History ({sales.length})</h3>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Invoice #</th><th>Date</th><th>Customer</th><th>Items</th><th>Payment</th><th style={{ textAlign:'right' }}>Total</th></tr>
                </thead>
                <tbody>
                  {sales.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No invoices yet</td></tr>
                    : [...sales].reverse().map(s => (
                      <tr key={s.id}>
                        <td><span className="badge badge-blue">#{s.invoiceNo}</span></td>
                        <td>{fmtDateTime(s.date)}</td>
                        <td style={{ color: 'var(--text-primary)' }}>{s.customerName}</td>
                        <td>{(s.items || []).length} items</td>
                        <td><span className={`badge ${s.paymentType === 'cash' ? 'badge-green' : s.paymentType === 'credit' ? 'badge-red' : 'badge-blue'}`}>{s.paymentType}</span></td>
                        <td style={{ textAlign:'right', color:'var(--accent-green)', fontFamily:'JetBrains Mono', fontWeight:600 }}>₨ {fmt(s.total)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Return */}
      {tab === 'return' && (
        <div className="page">
          <div className="card" style={{ maxWidth: 700 }}>
            <h3 style={{ marginBottom: 16 }}>Process Sale Return</h3>
            {alert && <div className="alert alert-error">{alert}</div>}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input className="input" placeholder="Enter Invoice Number (e.g. 1001)" value={returnSaleId} onChange={e => setReturnSaleId(e.target.value)} />
              <button className="btn btn-primary" onClick={loadReturn}>Load Invoice</button>
            </div>
            {returnItems.length > 0 && (
              <>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 16 }}>
                  <thead><tr><th style={{ textAlign:'left', padding:'8px', color:'var(--text-muted)', fontSize:11 }}>PRODUCT</th><th style={{ padding:'8px', color:'var(--text-muted)', fontSize:11 }}>SOLD</th><th style={{ padding:'8px', color:'var(--text-muted)', fontSize:11 }}>RETURN QTY</th><th style={{ textAlign:'right', padding:'8px', color:'var(--text-muted)', fontSize:11 }}>REFUND</th></tr></thead>
                  <tbody>
                    {returnItems.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'8px', color:'var(--text-primary)' }}>{item.name}</td>
                        <td style={{ padding:'8px', textAlign:'center' }}>{item.qty}</td>
                        <td style={{ padding:'8px' }}><input type="number" className="input" style={{ width:80 }} value={item.returnQty} min={0} max={item.qty} onChange={e => { const u=[...returnItems]; u[idx]={...u[idx],returnQty:Number(e.target.value)}; setReturnItems(u); }} /></td>
                        <td style={{ padding:'8px', textAlign:'right', color:'var(--accent-green)', fontFamily:'JetBrains Mono' }}>₨ {fmt(item.price * item.returnQty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ textAlign:'right', marginBottom:16 }}>
                  <strong>Total Refund: ₨ {fmt(returnItems.reduce((a,i) => a + i.price*i.returnQty, 0))}</strong>
                </div>
                <button className="btn btn-danger" onClick={handleReturn}>Process Return</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hold modal */}
      <Modal open={showHold} onClose={() => setShowHold(false)} title="Held Invoices">
        {held.length === 0 ? <p style={{ color:'var(--text-muted)' }}>No held invoices.</p> : held.map((h, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
            <span style={{ fontSize:13 }}>Invoice #{i+1} — {h.items.filter(x=>x.productId).length} items</span>
            <button className="btn btn-primary btn-sm" onClick={() => restoreHold(i)}>Restore</button>
          </div>
        ))}
      </Modal>

      {/* Recent modal */}
      <Modal open={showRecent} onClose={() => setShowRecent(false)} title="Recent Invoices" size="modal-lg">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Invoice</th><th>Customer</th><th>Date</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
            <tbody>
              {[...sales].reverse().slice(0,20).map(s => (
                <tr key={s.id}><td><span className="badge badge-blue">#{s.invoiceNo}</span></td><td>{s.customerName}</td><td>{fmtDateTime(s.date)}</td><td style={{textAlign:'right', color:'var(--accent-green)', fontFamily:'JetBrains Mono'}}>₨ {fmt(s.total)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
