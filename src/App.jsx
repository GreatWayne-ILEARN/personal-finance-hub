import { useCallback, useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { supabase } from './lib/supabase'
import AuthPage    from './pages/AuthPage'
import Dashboard   from './pages/Dashboard'
import ExpenseList from './pages/ExpenseList'
import AddExpense  from './pages/AddExpense'
import Sidebar     from './components/Sidebar'
import './index.css'

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  expenses:  'All Expenses',
  add:       'Add Expense',
}

function AppShell() {
  const { user } = useAuth()
  const [page,        setPage]        = useState('dashboard')
  const [expenses,    setExpenses]    = useState([])
  const [categories,  setCategories]  = useState([])
  const [loadingData, setLoadingData] = useState(true)

  const fetchExpenses = useCallback(async () => {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
    setExpenses(data ?? [])
  }, [user.id])

  useEffect(() => {
    const init = async () => {
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      setCategories(cats ?? [])
      await fetchExpenses()
      setLoadingData(false)
    }
    init()

    // Real-time updates
    const channel = supabase
      .channel('expenses-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'expenses', filter: `user_id=eq.${user.id}` },
        fetchExpenses
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user.id, fetchExpenses])

  return (
    <div className="app">
      <Sidebar page={page} setPage={setPage} />
      <div className="main">
        <div className="topbar">
          <div className="page-title">{PAGE_TITLES[page]}</div>
          <button className="btn btn-primary btn-sm" onClick={() => setPage('add')}>
            ➕ Add Expense
          </button>
        </div>
        <div className="content">
          {loadingData ? (
            <div className="loading-full"><span className="spinner" /></div>
          ) : (
            <>
              {page === 'dashboard' && (
                <Dashboard expenses={expenses} categories={categories} onAdd={() => setPage('add')} />
              )}
              {page === 'expenses' && (
                <ExpenseList expenses={expenses} categories={categories} onSaved={fetchExpenses} />
              )}
              {page === 'add' && (
                <AddExpense categories={categories} onSaved={fetchExpenses} setPage={setPage} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function RootGate() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0a1e' }}>
      <span className="spinner" />
    </div>
  )
  return user ? <AppShell /> : <AuthPage />
}

export default function App() {
  return (
    <AuthProvider>
      <RootGate />
    </AuthProvider>
  )
}
