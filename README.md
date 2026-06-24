# ElectroPOS — Electronics Shop Management System

A complete inventory and point-of-sale system built for electronics shops.

## Stack
- React 18 + React Router
- Recharts for data visualization
- localStorage for data (Phase 1)
- Supabase-ready architecture (Phase 2)

## Modules
1. **Dashboard** — Sales stats, trends, low stock alerts
2. **Sales** — POS invoice, hold invoices, sale returns
3. **Categories** — Product categories CRUD
4. **Companies** — Brand/company management
5. **Products** — Full product management with margin calc
6. **Vendors** — Supplier management with balances
7. **Customers** — Customer registry with balances
8. **Income** — Income recording with types
9. **Expenses** — Expense tracking with types
10. **Purchase** — Purchase orders + returns
11. **Stock** — Real-time stock overview with alerts
12. **Reports** — 9 report types including P&L
13. **My Account** — Settings and data management

## Running Locally

```bash
npm install
npm start
```

## Deploy to Netlify

1. Push to GitHub
2. Connect repo to Netlify
3. Build command: `npm run build`
4. Publish directory: `build`
5. Done — `netlify.toml` handles SPA redirects

## Migrate to Supabase (Phase 2)

1. Create project at supabase.com
2. Run schema from `/supabase/schema.sql`
3. Add `.env`:
   ```
   REACT_APP_SUPABASE_URL=your_url
   REACT_APP_SUPABASE_ANON_KEY=your_key
   ```
4. Replace functions in `src/utils/store.js` with Supabase client calls
5. Each store function maps 1:1 to a Supabase table

## Data Architecture

All data lives in `src/utils/store.js`. The functions are intentionally simple — each one reads/writes a single localStorage key. When moving to Supabase, you replace each function body with a `supabase.from('table').select/insert/update()` call. The rest of the app doesn't change.

Tables you'll need in Supabase:
- `categories`, `companies`, `products`, `vendors`, `customers`
- `sales`, `sale_items`, `purchases`, `purchase_items`
- `income`, `income_types`, `expenses`, `expense_types`
- `users` (handled by Supabase Auth)
