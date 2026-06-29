import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const NAV = [
  { id: 'dashboard', icon: '📊', label: 'Dashboard' },
  { id: 'expenses',  icon: '📋', label: 'All Expenses' },
  { id: 'add',       icon: '➕', label: 'Add Expense' },
]

export default function Sidebar({ page, setPage }) {
  const { user } = useAuth()
  const initials = user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <div className="brand-icon">💸</div>
          <div>
            <div className="brand-name">Spendly</div>
            <div className="brand-sub">Expense Tracker</div>
          </div>
        </div>
      </div>

      <nav className="nav">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`nav-item ${page === n.id ? 'active' : ''}`}
            onClick={() => setPage(n.id)}
          >
            <span className="nav-icon">{n.icon}</span>
            {n.label}
          </button>
        ))}
      </nav>

      <div className="user-section">
        <div className="flex-center gap-2" style={{ marginBottom: 12 }}>
          <div className="user-avatar">{initials}</div>
          <div className="user-email">{user?.email}</div>
        </div>
        <button className="btn btn-ghost btn-full btn-sm" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </div>
    </div>
  )
}
