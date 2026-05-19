import { useState } from 'react'
import { login as apiLogin } from '../api/otr'
import { useCandidateAuth } from '../context/CandidateAuthContext'

export default function LoginModal({ onClose }) {
  const { login } = useCandidateAuth()
  const [form, setForm] = useState({ registrationId: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiLogin(form)
      login(res.data.data)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{ background: '#fff', width: 360, maxWidth: '95vw' }}>
        <div className="box-title" style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ flex: 1 }}>Candidate Login</span>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="box-body">
          {error && <div className="notice warn" style={{ marginBottom: 12 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-field" style={{ marginBottom: 12 }}>
              <label>Registration ID <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input
                type="text"
                name="registrationId"
                value={form.registrationId}
                onChange={handleChange}
                placeholder="RP-PATAN-2025-0000001"
                required
              />
            </div>
            <div className="form-field" style={{ marginBottom: 16 }}>
              <label>Password <span style={{ color: 'var(--ojas-red)' }}>*</span></label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Logging in…' : 'Login'}
              </button>
              <a href="/otr/find" style={{ fontSize: 12 }}>Forgot Registration ID?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
