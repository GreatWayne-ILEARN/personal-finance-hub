import { fmt, fmtDate, thisMonthPrefix } from '../lib/helpers'

export default function Dashboard({ expenses, categories, onAdd }) {
  const catMap = Object.fromEntries(categories.map(c => [c.id, c]))

  const total      = expenses.reduce((s, e) => s + parseFloat(e.amount), 0)
  const thisMonth  = expenses.filter(e => e.date?.startsWith(thisMonthPrefix()))
  const monthTotal = thisMonth.reduce((s, e) => s + parseFloat(e.amount), 0)
  const avg        = expenses.length ? total / expenses.length : 0

  const byCategory = categories
    .map(c => ({
      ...c,
      total: expenses
        .filter(e => e.category_id === c.id)
        .reduce((s, e) => s + parseFloat(e.amount), 0),
    }))
    .filter(c => c.total > 0)
    .sort((a, b) => b.total - a.total)

  const recent = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  return (
    <div>
      {/* Stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">{fmt(total)}</div>
          <div className="stat-sub">{expenses.length} transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-label">This Month</div>
          <div className="stat-value">{fmt(monthTotal)}</div>
          <div className="stat-sub">{thisMonth.length} transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-label">Avg per Transaction</div>
          <div className="stat-value">{fmt(avg)}</div>
          <div className="stat-sub">across all time</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-label">Top Category</div>
          <div className="stat-value" style={{ fontSize: 20 }}>
            {byCategory[0] ? `${byCategory[0].icon} ${byCategory[0].name.split(' ')[0]}` : '—'}
          </div>
          <div className="stat-sub">
            {byCategory[0] ? fmt(byCategory[0].total) : 'No data yet'}
          </div>
        </div>
      </div>

      {/* Two-column section */}
      <div className="grid-2" style={{ gap: 20 }}>
        {/* Category breakdown */}
        <div className="card">
          <div className="section-title">Spending by Category</div>
          {byCategory.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🥧</div>
              <div className="text-sm">No expenses yet</div>
            </div>
          ) : (
            <div className="breakdown-list">
              {byCategory.map(c => (
                <div key={c.id} className="breakdown-item">
                  <div className="breakdown-icon">{c.icon}</div>
                  <div className="breakdown-info">
                    <div className="breakdown-name">{c.name}</div>
                    <div className="breakdown-bar-wrap">
                      <div
                        className="breakdown-bar"
                        style={{ width: `${(c.total / byCategory[0].total) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="breakdown-amount">{fmt(c.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent expenses */}
        <div className="card">
          <div className="section-title">Recent Expenses</div>
          {recent.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
              <div className="text-sm">No expenses yet</div>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={onAdd}>
                Add one
              </button>
            </div>
          ) : (
            recent.map(exp => {
              const cat = catMap[exp.category_id]
              return (
                <div key={exp.id} className="expense-item">
                  <div className="expense-cat-icon">{cat?.icon ?? '📦'}</div>
                  <div className="expense-info">
                    <div className="expense-title">{exp.title}</div>
                    <div className="expense-meta">{fmtDate(exp.date)} · {cat?.name}</div>
                  </div>
                  <div className="expense-amount">{fmt(exp.amount)}</div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
