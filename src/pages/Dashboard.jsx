import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getDashboardStats } from '../utils/store';
import { StatCard, fmt, fmtDateTime } from '../components/UI';

const today = () => new Date().toISOString().slice(0, 10);

export default function Dashboard() {
  const [from, setFrom] = useState(today());
  const [to, setTo] = useState(today());
  const [stats, setStats] = useState(null);

  const load = () => setStats(getDashboardStats(from, to));

  useEffect(() => { load(); }, []);

  if (!stats) return null;

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
            {new Date().toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} style={{ width: 150 }} />
          <span style={{ color: 'var(--text-muted)' }}>to</span>
          <input type="date" className="input" value={to} onChange={e => setTo(e.target.value)} style={{ width: 150 }} />
          <button className="btn btn-primary" onClick={load}>Search</button>
        </div>
      </div>

      {/* Stat Grid */}
      <div className="stat-grid">
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
          label="Transactions" value={stats.visitedCustomers} color="#4f6ef7"
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>}
          label="Total Sales" value={fmt(stats.totalSales)} prefix="₨ " color="#22c55e"
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>}
          label="Total Purchase" value={fmt(stats.totalPurchase)} prefix="₨ " color="#f59e0b"
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>}
          label="Customer Balance" value={fmt(stats.totalCustomerBalance)} prefix="₨ " color="#a855f7"
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
          label="Vendor Balance" value={fmt(stats.totalVendorBalance)} prefix="₨ " color="#ef4444"
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>}
          label="Sale Returns" value={fmt(stats.totalReturns)} prefix="₨ " color="#64748b"
        />
      </div>

      {/* Charts + Tables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, marginTop: 24 }}>
        {/* Monthly trend */}
        <div className="card">
          <h3 style={{ marginBottom: 20 }}>Sales Trend — Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.monthlyTrend} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                formatter={v => [`₨ ${fmt(v)}`, 'Sales']}
                labelStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="sales" fill="var(--accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Top Selling Products</h3>
          {stats.topProducts.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No sales in selected period.</p>
          ) : stats.topProducts.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{
                width: 22, height: 22, borderRadius: '50%',
                background: i === 0 ? '#f59e0b22' : 'var(--bg-input)',
                color: i === 0 ? '#f59e0b' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>{i+1}</span>
              <span style={{ flex: 1, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{p.qty} units</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        {/* Recent Invoices */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3>Recent Invoices</h3>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No sales yet</td></tr>
                ) : stats.recentSales.map(s => (
                  <tr key={s.id}>
                    <td><span className="badge badge-blue">#{s.invoiceNo}</span></td>
                    <td>{fmtDateTime(s.date)}</td>
                    <td style={{ color: 'var(--text-primary)' }}>{s.customerName || 'Walk-in'}</td>
                    <td style={{ textAlign: 'right', color: 'var(--accent-green)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>₨ {fmt(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <h3>Low Stock Alert</h3>
            {stats.lowStockProducts.length > 0 && (
              <span className="badge badge-red">{stats.lowStockProducts.length}</span>
            )}
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Product</th><th>Code</th><th style={{ textAlign: 'right' }}>Stock</th><th style={{ textAlign: 'right' }}>Min</th></tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>All stock levels are fine ✓</td></tr>
                ) : stats.lowStockProducts.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                    <td className="mono" style={{ fontSize: 12 }}>{p.code}</td>
                    <td style={{ textAlign: 'right' }}><span className="badge badge-red">{p.stock}</span></td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{p.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
