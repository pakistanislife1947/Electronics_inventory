import React, { useState, useEffect } from 'react';
import { saleStore, purchaseStore, customerStore, productStore, categoryStore } from '../utils/store';
import { SearchInput, fmt, fmtDate, fmtDateTime } from '../components/UI';

const today = () => new Date().toISOString().slice(0,10);
const firstOfMonth = () => { const d=new Date(); d.setDate(1); return d.toISOString().slice(0,10); };

const REPORTS = [
  { id:'customer_registry', label:'Customer Registry' },
  { id:'purchase_history', label:'Purchase History' },
  { id:'purchase_return', label:'Purchase Return History' },
  { id:'product_purchase', label:'Product Purchase History' },
  { id:'sales_history', label:'Sales History' },
  { id:'category_sale', label:'Category Sale History' },
  { id:'product_sale', label:'Product Sale History' },
  { id:'sale_return', label:'Sale Return History' },
  { id:'profit_loss', label:'Profit & Loss' },
];

export default function Reports() {
  const [active, setActive] = useState('sales_history');
  const [from, setFrom] = useState(firstOfMonth());
  const [to, setTo] = useState(today());
  const [data, setData] = useState([]);
  const [query, setQuery] = useState('');

  const allSales = saleStore.getAll();
  const allPurchases = purchaseStore.getAll();
  const customers = customerStore.getAll();
  const products = productStore.getAll();
  const cats = categoryStore.getAll();

  function inRange(iso) {
    const d = new Date(iso);
    const f = new Date(from); f.setHours(0,0,0,0);
    const t = new Date(to); t.setHours(23,59,59,999);
    return d>=f && d<=t;
  }

  useEffect(() => {
    const fromD = new Date(from); fromD.setHours(0,0,0,0);
    const toD = new Date(to); toD.setHours(23,59,59,999);

    switch(active) {
      case 'customer_registry':
        setData(customers.filter(c=>c.active).map(c=>({...c, totalPurchase:
          allSales.filter(s=>s.customerId===c.id&&s.type!=='return').reduce((a,s)=>a+(s.total||0),0)
        }))); break;
      case 'purchase_history':
        setData(allPurchases.filter(p=>p.type!=='return'&&inRange(p.date))); break;
      case 'purchase_return':
        setData(allPurchases.filter(p=>p.type==='return'&&inRange(p.date))); break;
      case 'product_purchase': {
        const map={};
        allPurchases.filter(p=>p.type!=='return'&&inRange(p.date)).forEach(p=>{
          (p.items||[]).forEach(i=>{
            if(!map[i.productId]) map[i.productId]={name:i.name,qty:0,total:0};
            map[i.productId].qty+=i.qty; map[i.productId].total+=i.total||0;
          });
        });
        setData(Object.values(map).sort((a,b)=>b.total-a.total)); break;
      }
      case 'sales_history':
        setData(allSales.filter(s=>s.type!=='return'&&inRange(s.date))); break;
      case 'sale_return':
        setData(allSales.filter(s=>s.type==='return'&&inRange(s.date))); break;
      case 'category_sale': {
        const map={};
        allSales.filter(s=>s.type!=='return'&&inRange(s.date)).forEach(s=>{
          (s.items||[]).forEach(i=>{
            const p=products.find(x=>x.id===i.productId);
            const catId=p?.categoryId||'unknown';
            const catName=cats.find(c=>c.id===catId)?.name||'Uncategorized';
            if(!map[catId]) map[catId]={catName,qty:0,total:0};
            map[catId].qty+=i.qty; map[catId].total+=i.total||0;
          });
        });
        setData(Object.values(map).sort((a,b)=>b.total-a.total)); break;
      }
      case 'product_sale': {
        const map={};
        allSales.filter(s=>s.type!=='return'&&inRange(s.date)).forEach(s=>{
          (s.items||[]).forEach(i=>{
            if(!map[i.productId]) map[i.productId]={name:i.name,qty:0,total:0,cost:0};
            const p=products.find(x=>x.id===i.productId);
            map[i.productId].qty+=i.qty;
            map[i.productId].total+=i.total||0;
            map[i.productId].cost+=(p?.purchasePrice||0)*i.qty;
          });
        });
        setData(Object.values(map).sort((a,b)=>b.total-a.total)); break;
      }
      case 'profit_loss': {
        const sales=allSales.filter(s=>s.type!=='return'&&inRange(s.date));
        const returns=allSales.filter(s=>s.type==='return'&&inRange(s.date));
        const purchases=allPurchases.filter(p=>p.type!=='return'&&inRange(p.date));
        const totalSales=sales.reduce((a,s)=>a+(s.total||0),0);
        const totalReturns=returns.reduce((a,r)=>a+(r.total||0),0);
        const totalPurchase=purchases.reduce((a,p)=>a+(p.total||0),0);
        let costOfGoods=0;
        sales.forEach(s=>(s.items||[]).forEach(i=>{
          const p=products.find(x=>x.id===i.productId);
          costOfGoods+=(p?.purchasePrice||0)*i.qty;
        }));
        setData([{ totalSales, totalReturns, netSales:totalSales-totalReturns, totalPurchase, costOfGoods, grossProfit:totalSales-costOfGoods, netProfit:totalSales-costOfGoods-totalReturns }]);
        break;
      }
      default: setData([]);
    }
  }, [active, from, to]);

  const q = query.toLowerCase();

  return (
    <div style={{ display:'flex', height:'100%' }}>
      {/* Left panel */}
      <div style={{ width:220, minWidth:220, borderRight:'1px solid var(--border)', background:'var(--bg-card)', padding:'20px 0' }}>
        <div style={{ padding:'0 16px 12px', fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Report Types</div>
        {REPORTS.map(r=>(
          <button key={r.id} onClick={()=>setActive(r.id)}
            style={{ display:'block', width:'100%', textAlign:'left', padding:'10px 16px', border:'none', cursor:'pointer', fontSize:13, color:active===r.id?'var(--accent)':'var(--text-secondary)', background:active===r.id?'rgba(79,110,247,0.1)':'transparent', borderLeft:active===r.id?'2px solid var(--accent)':'2px solid transparent', fontWeight:active===r.id?600:400 }}>
            {r.label}
          </button>
        ))}
      </div>

      {/* Report area */}
      <div style={{ flex:1, overflow:'auto' }}>
        <div className="page">
          <div className="page-header">
            <h1>{REPORTS.find(r=>r.id===active)?.label}</h1>
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              {active !== 'customer_registry' && (
                <>
                  <input type="date" className="input" value={from} onChange={e=>setFrom(e.target.value)} style={{ width:150 }} />
                  <span style={{ color:'var(--text-muted)' }}>to</span>
                  <input type="date" className="input" value={to} onChange={e=>setTo(e.target.value)} style={{ width:150 }} />
                </>
              )}
              <SearchInput value={query} onChange={setQuery} />
            </div>
          </div>

          {/* Customer Registry */}
          {active==='customer_registry'&&(
            <div className="card" style={{ padding:0 }}>
              <div className="table-wrap"><table>
                <thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Address</th><th style={{textAlign:'right'}}>Balance</th><th style={{textAlign:'right'}}>Total Purchases</th></tr></thead>
                <tbody>
                  {data.filter(c=>!q||c.name.toLowerCase().includes(q)||c.phone?.includes(q)).map((c,i)=>(
                    <tr key={c.id}><td style={{color:'var(--text-muted)'}}>{i+1}</td><td style={{color:'var(--text-primary)',fontWeight:500}}>{c.name}</td><td>{c.phone||'—'}</td><td>{c.address||'—'}</td>
                      <td style={{textAlign:'right',color:c.balance>0?'var(--accent-red)':'var(--accent-green)',fontFamily:'JetBrains Mono'}}>₨ {fmt(c.balance)}</td>
                      <td style={{textAlign:'right',color:'var(--accent-green)',fontFamily:'JetBrains Mono',fontWeight:600}}>₨ {fmt(c.totalPurchase)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr style={{borderTop:'2px solid var(--border)'}}><td colSpan={4} style={{padding:'10px 14px',fontWeight:600}}>Total</td>
                  <td style={{textAlign:'right',fontFamily:'JetBrains Mono',fontWeight:700,padding:'10px 14px'}}>₨ {fmt(data.reduce((a,c)=>a+c.balance,0))}</td>
                  <td style={{textAlign:'right',fontFamily:'JetBrains Mono',fontWeight:700,color:'var(--accent-green)',padding:'10px 14px'}}>₨ {fmt(data.reduce((a,c)=>a+c.totalPurchase,0))}</td>
                </tr></tfoot>
              </table></div>
            </div>
          )}

          {/* Sales History */}
          {active==='sales_history'&&(
            <div className="card" style={{ padding:0 }}>
              <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', gap:24 }}>
                <span style={{fontSize:12,color:'var(--text-muted)'}}>Records: <strong style={{color:'var(--text-primary)'}}>{data.length}</strong></span>
                <span style={{fontSize:12,color:'var(--text-muted)'}}>Total: <strong style={{color:'var(--accent-green)',fontFamily:'JetBrains Mono'}}>₨ {fmt(data.reduce((a,s)=>a+(s.total||0),0))}</strong></span>
              </div>
              <div className="table-wrap"><table>
                <thead><tr><th>Invoice</th><th>Date</th><th>Customer</th><th>Items</th><th>Payment</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
                <tbody>
                  {data.filter(s=>!q||s.customerName?.toLowerCase().includes(q)||String(s.invoiceNo).includes(q)).map(s=>(
                    <tr key={s.id}><td><span className="badge badge-blue">#{s.invoiceNo}</span></td><td>{fmtDateTime(s.date)}</td><td style={{color:'var(--text-primary)'}}>{s.customerName}</td><td>{(s.items||[]).length}</td><td><span className="badge badge-green">{s.paymentType}</span></td><td style={{textAlign:'right',color:'var(--accent-green)',fontFamily:'JetBrains Mono',fontWeight:600}}>₨ {fmt(s.total)}</td></tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}

          {/* Purchase History */}
          {(active==='purchase_history'||active==='purchase_return')&&(
            <div className="card" style={{ padding:0 }}>
              <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', gap:24 }}>
                <span style={{fontSize:12,color:'var(--text-muted)'}}>Records: <strong style={{color:'var(--text-primary)'}}>{data.length}</strong></span>
                <span style={{fontSize:12,color:'var(--text-muted)'}}>Total: <strong style={{color:'var(--accent-amber)',fontFamily:'JetBrains Mono'}}>₨ {fmt(data.reduce((a,p)=>a+(p.total||0),0))}</strong></span>
              </div>
              <div className="table-wrap"><table>
                <thead><tr><th>Bill #</th><th>Date</th><th>Vendor</th><th style={{textAlign:'right'}}>Total</th></tr></thead>
                <tbody>
                  {data.filter(p=>!q||p.vendorName?.toLowerCase().includes(q)).map(p=>(
                    <tr key={p.id}><td><span className="badge badge-amber">#{p.billNo||p.id?.slice(0,6)}</span></td><td>{fmtDateTime(p.date)}</td><td style={{color:'var(--text-primary)'}}>{p.vendorName}</td><td style={{textAlign:'right',color:'var(--accent-amber)',fontFamily:'JetBrains Mono',fontWeight:600}}>₨ {fmt(p.total)}</td></tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}

          {/* Product Purchase */}
          {active==='product_purchase'&&(
            <div className="card" style={{padding:0}}>
              <div className="table-wrap"><table>
                <thead><tr><th>#</th><th>Product</th><th style={{textAlign:'right'}}>Qty Bought</th><th style={{textAlign:'right'}}>Total Cost</th></tr></thead>
                <tbody>
                  {data.filter(p=>!q||p.name.toLowerCase().includes(q)).map((p,i)=>(
                    <tr key={i}><td style={{color:'var(--text-muted)'}}>{i+1}</td><td style={{color:'var(--text-primary)',fontWeight:500}}>{p.name}</td><td style={{textAlign:'right',fontFamily:'JetBrains Mono'}}>{p.qty}</td><td style={{textAlign:'right',color:'var(--accent-amber)',fontFamily:'JetBrains Mono',fontWeight:600}}>₨ {fmt(p.total)}</td></tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}

          {/* Category Sale */}
          {active==='category_sale'&&(
            <div className="card" style={{padding:0}}>
              <div className="table-wrap"><table>
                <thead><tr><th>#</th><th>Category</th><th style={{textAlign:'right'}}>Units Sold</th><th style={{textAlign:'right'}}>Revenue</th></tr></thead>
                <tbody>
                  {data.filter(c=>!q||c.catName.toLowerCase().includes(q)).map((c,i)=>(
                    <tr key={i}><td style={{color:'var(--text-muted)'}}>{i+1}</td><td style={{color:'var(--text-primary)',fontWeight:500}}>{c.catName}</td><td style={{textAlign:'right',fontFamily:'JetBrains Mono'}}>{c.qty}</td><td style={{textAlign:'right',color:'var(--accent-green)',fontFamily:'JetBrains Mono',fontWeight:600}}>₨ {fmt(c.total)}</td></tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}

          {/* Product Sale */}
          {active==='product_sale'&&(
            <div className="card" style={{padding:0}}>
              <div className="table-wrap"><table>
                <thead><tr><th>#</th><th>Product</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Revenue</th><th style={{textAlign:'right'}}>Cost</th><th style={{textAlign:'right'}}>Profit</th></tr></thead>
                <tbody>
                  {data.filter(p=>!q||p.name.toLowerCase().includes(q)).map((p,i)=>(
                    <tr key={i}><td style={{color:'var(--text-muted)'}}>{i+1}</td><td style={{color:'var(--text-primary)',fontWeight:500}}>{p.name}</td><td style={{textAlign:'right',fontFamily:'JetBrains Mono'}}>{p.qty}</td><td style={{textAlign:'right',color:'var(--accent-green)',fontFamily:'JetBrains Mono',fontWeight:600}}>₨ {fmt(p.total)}</td><td style={{textAlign:'right',fontFamily:'JetBrains Mono',color:'var(--accent-amber)'}}>₨ {fmt(p.cost)}</td><td style={{textAlign:'right',fontFamily:'JetBrains Mono',color:(p.total-p.cost)>=0?'var(--accent-green)':'var(--accent-red)',fontWeight:600}}>₨ {fmt(p.total-p.cost)}</td></tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}

          {/* Sale Return */}
          {active==='sale_return'&&(
            <div className="card" style={{padding:0}}>
              <div className="table-wrap"><table>
                <thead><tr><th>Date</th><th>Original Invoice</th><th>Customer</th><th style={{textAlign:'right'}}>Return Amount</th></tr></thead>
                <tbody>
                  {data.filter(s=>!q||s.customerName?.toLowerCase().includes(q)).map(s=>(
                    <tr key={s.id}><td>{fmtDateTime(s.date)}</td><td><span className="badge badge-red">#{s.originalInvoice}</span></td><td style={{color:'var(--text-primary)'}}>{s.customerName}</td><td style={{textAlign:'right',color:'var(--accent-red)',fontFamily:'JetBrains Mono',fontWeight:600}}>₨ {fmt(s.total)}</td></tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}

          {/* Profit & Loss */}
          {active==='profit_loss'&&data.length>0&&(
            <div style={{ maxWidth:500 }}>
              <div className="card">
                <h3 style={{ marginBottom:20 }}>Profit & Loss Statement</h3>
                {[
                  ['Gross Sales Revenue', data[0].totalSales, 'var(--accent-green)'],
                  ['(-) Sale Returns', data[0].totalReturns, 'var(--accent-red)'],
                  ['Net Sales', data[0].netSales, 'var(--accent-green)', true],
                  ['(-) Cost of Goods Sold', data[0].costOfGoods, 'var(--accent-red)'],
                  ['Gross Profit', data[0].grossProfit, data[0].grossProfit>=0?'var(--accent-green)':'var(--accent-red)', true],
                  ['Net Profit', data[0].netProfit, data[0].netProfit>=0?'var(--accent-green)':'var(--accent-red)', true, true],
                ].map(([label,val,color,bold,big])=>(
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:big?'14px 0 0':'10px 0', borderTop:big?'2px solid var(--border)':'1px solid var(--border)', marginTop:big?10:0 }}>
                    <span style={{ fontSize:bold?14:13, fontWeight:bold?600:400, color:'var(--text-primary)' }}>{label}</span>
                    <span style={{ fontFamily:'JetBrains Mono', fontWeight:bold?700:500, fontSize:bold?16:13, color }}>{val<0?'-':''}₨ {fmt(Math.abs(val))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
