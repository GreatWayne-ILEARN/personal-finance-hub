# 💸 Spendly — Personal Expense Tracker

A full-stack expense tracker built with React + Vite + Supabase.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open http://localhost:5173 — the `.env` is pre-configured and ready to go.

---

## Project Structure

```
src/
├── lib/
│   ├── supabase.js       # Supabase client (reads from .env)
│   ├── AuthContext.jsx   # Auth state provider + hook
│   └── helpers.js        # Currency formatting, date utils
├── components/
│   ├── Sidebar.jsx       # Navigation sidebar
│   └── ExpenseModal.jsx  # Add / edit expense modal
├── pages/
│   ├── AuthPage.jsx      # Login / sign-up
│   ├── Dashboard.jsx     # Stats, category breakdown, recent expenses
│   ├── ExpenseList.jsx   # Filterable list with edit & delete
│   └── AddExpense.jsx    # Standalone add form
├── App.jsx               # Root + routing + real-time subscription
├── index.css             # Purple design system
└── main.jsx              # Entry point
```

## Features

- **Auth** — Sign up, log in, sign out via Supabase Auth
- **Dashboard** — Total spent, this month, avg per transaction, top category, category bars, recent 5
- **All Expenses** — Search by title/notes, filter by category and month, inline edit & delete
- **Add Expense** — Form with validation, resets after save
- **Real-time** — Changes in any tab reflect instantly via Supabase channel

## Supabase Schema

Tables created automatically during setup:
- `categories` — pre-seeded with 8 categories (Food, Transport, Entertainment, etc.)
- `expenses` — per-user, RLS-protected

## Deploy

```bash
npm run build   # outputs to dist/
```

Upload `dist/` to Vercel, Netlify, or any static host.
