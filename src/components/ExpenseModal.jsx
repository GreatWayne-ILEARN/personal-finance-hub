import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { today } from '../lib/helpers'

export default function ExpenseModal({ expense, categories, onClose, onSaved }) {
  const { user } = useAuth()
  const editing = !!expense

  const [form, setForm] = useState({
    title:       expense?.title       ?? '',
    amount:      expense?.amount      ?? '',
    category_id: expense?.category_id ?? (categories[0]?.id ?? ''),
    date:        expense?.date        ?? today(),
    notes:       expense?.notes       ?? '',
  })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.title.trim())                          return setError('Title is required.')
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) return setError('Enter a valid positive amount.')
    if (!form.category_id)                           return setError('Select a category.')
    setError(''); setLoading(true)
    try {
      const payload = { ...form, amount: parseFloat(form.amount), user_id: user.id }
      const { error } = editing
        ? await supabase.from('expenses').update(payload).eq('id', expense.id)
        : await supabase.from('expenses').insert(payload)
      if (error) throw error
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{editing ? 'Edit Expense' : 'Add Expense'}</div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" placeholder="e.g. Lunch at cafeteria"
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
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? 'Saving…' : editing ? 'Save changes' : 'Add expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
