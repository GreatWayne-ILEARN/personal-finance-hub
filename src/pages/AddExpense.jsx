import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { today } from '../lib/helpers'

export default function AddExpense({ categories, onSaved, setPage }) {
  const { user } = useAuth()

  const blankForm = () => ({
    title: '', amount: '', category_id: categories[0]?.id ?? '', date: today(), notes: '',
  })

  const [form,    setForm]    = useState(blankForm)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim())                          return setError('Title is required.')
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) return setError('Enter a valid positive amount.')
    setError(''); setLoading(true)
    try {
      const { error } = await supabase
        .from('expenses')
        .insert({ ...form, amount: parseFloat(form.amount), user_id: user.id })
      if (error) throw error
      onSaved()
      setSuccess(true)
      setForm(blankForm())
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="card">
        <div className="modal-title mb-3">New Expense</div>
        {error   && <div className="error-msg">{error}</div>}
        {success && <div className="success-msg">✅ Expense added successfully!</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="e.g. Grocery run"
              value={form.title} onChange={e => set('title', e.target.value)} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Amount (USD)</label>
              <input className="form-input" type="number" step="0.01" min="0.01" placeholder="0.00"
                value={form.amount} onChange={e => set('amount', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date"
                value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category_id} onChange={e => set('category_id', e.target.value)}>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-textarea" placeholder="Any extra details…"
              value={form.notes} onChange={e => set('notes', e.target.value)} />
          </div>
          <div className="flex gap-2" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setPage('expenses')}>
              View all
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Saving…' : '➕ Add expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
