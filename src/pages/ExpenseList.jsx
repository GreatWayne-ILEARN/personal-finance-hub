import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { fmt, fmtDate, last12Months } from '../lib/helpers'
import ExpenseModal from '../components/ExpenseModal'

export default function ExpenseList({ expenses, categories, onSaved }) {
  const [search,      setSearch]      = useState('')
  const [filterCat,   setFilterCat]   = useState('')
  const [filterMonth, setFilterMonth] = useState('')
  const [editing,     setEditing]     = useState(null)
  const [deleting,    setDeleting]    = useState(null)

  const catMap   = Object.fromEntries(categories.map(c => [c.id, c]))
  const months   = last12Months()

  const filtered = expenses
    .filter(e => {
      const q = search.toLowerCase()
      return (
        (e.title.toLowerCase().includes(q) || (e.notes ?? '').toLowerCase().includes(q)) &&
        (!filterCat   || e.category_id === filterCat) &&
        (!filterMonth || e.date?.startsWith(filterMonth))
      )
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const filteredTotal = filtered.reduce((s, e) => s + parseFloat(e.amount), 0)

  const clearFilters = () => { setSearch(''); setFilterCat(''); setFilterMonth('') }
  const hasFilters   = search || filterCat || filterMonth

  const deleteExpense = async (id) => {
    await supabase.from('expenses').delete().eq('id', id)
    setDeleting(null)
    onSaved()
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="filter-bar">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="form-input search-input"
            placeholder="Search expenses…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: 160 }}
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value)}
        >
          <option value="">All time</option>
          {months.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
        {hasFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>
        )}
      </div>

      {/* List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div style={{ fontWeight: 500 }}>No expenses found</div>
            <div className="text-sm mt-2">Try adjusting your filters</div>
          </div>
        ) : (
          filtered.map(exp => {
            const cat = catMap[exp.category_id]
            return (
              <div key={exp.id} className="expense-item">
                <div className="expense-cat-icon">{cat?.icon ?? '📦'}</div>
                <div className="expense-info">
                  <div className="expense-title">{exp.title}</div>
                  <div className="expense-meta">
                    {fmtDate(exp.date)} · {cat?.name ?? 'Uncategorized'}
                    {exp.notes ? ` · ${exp.notes}` : ''}
                  </div>
                </div>
                <div className="expense-amount">{fmt(exp.amount)}</div>
                <div className="expense-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(exp)} title="Edit">✏️</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setDeleting(exp.id)} title="Delete">🗑️</button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer summary */}
      {filtered.length > 0 && (
        <div className="flex-center gap-2 mt-2 text-sm text-muted">
          Showing {filtered.length} of {expenses.length} expenses ·&nbsp;
          Total: <strong className="text-purple">{fmt(filteredTotal)}</strong>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <ExpenseModal
          expense={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}

      {/* Delete confirm */}
      {deleting && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleting(null)}>
          <div className="modal" style={{ maxWidth: 360, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <div className="modal-title" style={{ marginBottom: 8 }}>Delete this expense?</div>
            <div className="text-sm text-muted mb-3">This action cannot be undone.</div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn btn-ghost" onClick={() => setDeleting(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteExpense(deleting)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
